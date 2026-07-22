const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const iconv = require('iconv-lite');
const { parseStringPromise } = require('xml2js');

const app = express();
const pendingPayments = new Map();

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// --- Abuse protection for /start -------------------------------------------
// /start forwards raw card data to the bank, so an open endpoint would let anyone
// use the merchant account as a stolen-card checker. Every request must carry a
// valid tenant session, and attempts are capped per user and per IP.
//
// NOTE: this window lives in process memory, so it is only accurate while the app
// runs as a single instance. See docs/kuveyt-turk-remaining-work.md.

const RATE_LIMIT_MAX_ATTEMPTS = Number(process.env.KUVEYT_RATE_LIMIT_MAX || 5);
const RATE_LIMIT_WINDOW_MS = Number(process.env.KUVEYT_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);

// Rejected sign-ins are counted separately and far more loosely than real payment
// attempts. Sharing one budget would let anonymous traffic from a NAT or carrier IP
// lock out genuine customers sitting behind the same address.
const AUTH_FAILURE_MAX_ATTEMPTS = Number(process.env.KUVEYT_AUTH_FAIL_LIMIT_MAX || 30);

const rateLimitBuckets = new Map();

function isRateLimited(key, maxAttempts = RATE_LIMIT_MAX_ATTEMPTS) {
    if (!key) return false;

    const now = Date.now();
    const recent = (rateLimitBuckets.get(key) || []).filter(at => now - at < RATE_LIMIT_WINDOW_MS);

    recent.push(now);
    rateLimitBuckets.set(key, recent);

    return recent.length > maxAttempts;
}

// Drop expired buckets so the map cannot grow without bound.
function pruneRateLimitBuckets() {
    const now = Date.now();

    for (const [key, attempts] of rateLimitBuckets) {
        const recent = attempts.filter(at => now - at < RATE_LIMIT_WINDOW_MS);

        if (recent.length) {
            rateLimitBuckets.set(key, recent);
        } else {
            rateLimitBuckets.delete(key);
        }
    }
}

setInterval(pruneRateLimitBuckets, RATE_LIMIT_WINDOW_MS).unref();

function readCookie(req, name) {
    const header = req.headers.cookie;

    if (!header) return '';

    for (const part of header.split(';')) {
        const index = part.indexOf('=');

        if (index === -1) continue;

        if (part.slice(0, index).trim() === name) {
            return decodeURIComponent(part.slice(index + 1).trim());
        }
    }

    return '';
}

function getBearerToken(req) {
    const header = req.headers.authorization || '';

    if (header) {
        return header.startsWith('Bearer ') ? header : `Bearer ${header}`;
    }

    // Fallback: @nuxtjs/auth-next mirrors the token into this cookie.
    const cookieToken = readCookie(req, 'auth._token.local');

    if (!cookieToken || cookieToken === 'false') return '';

    return cookieToken.startsWith('Bearer ') ? cookieToken : `Bearer ${cookieToken}`;
}

// Resolves the caller against the booking API. Returns null when not authenticated.
async function resolveTenant(req) {
    const token = getBearerToken(req);
    const apiUrl = process.env.API_URL;

    if (!token || !apiUrl) return null;

    try {
        const { data } = await axios.get(`${apiUrl}/api/tenant/me`, {
            headers: {
                Accept       : 'application/json',
                Authorization: token,
            },
            timeout: 10000,
        });

        const tenant = data?.result?.tenant || data?.result || null;

        return tenant?.id ? tenant : null;
    } catch (error) {
        return null;
    }
}

function sha1Base64Iso(value) {
    return crypto
        .createHash('sha1')
        .update(iconv.encode(String(value || ''), 'ISO-8859-9'))
        .digest('base64');
}

function buildRequestHash({ merchantId, orderId, amount, okUrl, failUrl, username, password }) {
    const hashedPassword = sha1Base64Iso(password);
    const hashInput = `${merchantId}${orderId}${amount}${okUrl}${failUrl}${username}${hashedPassword}`;

    return sha1Base64Iso(hashInput);
}

function buildProvisionHash({ merchantId, orderId, amount, username, password }) {
    const hashedPassword = sha1Base64Iso(password);
    const hashInput = `${merchantId}${orderId}${amount}${username}${hashedPassword}`;

    return sha1Base64Iso(hashInput);
}

function escapeXml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function amountToMinorUnits(amount) {
    const normalized = Number(amount);

    if (!Number.isFinite(normalized) || normalized <= 0) {
        throw new Error('Invalid payment amount.');
    }

    return String(Math.round(normalized * 100));
}

function normalizeInstallmentCount(value) {
    const count = Number(value || 0);

    if (!Number.isFinite(count) || count < 0) {
        return '0';
    }

    return String(Math.trunc(count));
}

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];

    if (forwarded) {
        return String(forwarded).split(',')[0].trim();
    }

    return req.socket?.remoteAddress || req.ip || '';
}

function getOriginFromRequest(req) {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const protocol = forwardedProto || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;

    return host ? `${protocol}://${host}` : '';
}

function getCallbackUrl(req, envValue, fallbackPath) {
    if (envValue) return envValue;

    const origin = getOriginFromRequest(req);

    return origin ? `${origin}${fallbackPath}` : fallbackPath;
}

function normalizePhoneCountryCode(value = '') {
    const sanitized = String(value || '').trim();

    if (!sanitized) return '';

    return sanitized.startsWith('+') ? sanitized.slice(1) : sanitized;
}

function normalizePhoneSubscriber(value = '') {
    return String(value || '').replace(/\D+/g, '');
}

function maskCardNumber(value = '') {
    const digits = String(value || '').replace(/\D+/g, '');

    if (!digits) return '';

    return digits.length <= 4
        ? `****${digits}`
        : `${'*'.repeat(Math.max(digits.length - 4, 0))}${digits.slice(-4)}`;
}

function validateStartPayload(body = {}) {
    const requiredFields = [
        ['orderId', body.orderId],
        ['amount', body.amount],
        ['card.number', body.card?.number],
        ['card.expireMonth', body.card?.expireMonth],
        ['card.expireYear', body.card?.expireYear],
        ['card.cvv', body.card?.cvv],
        ['card.holderName', body.card?.holderName],
        ['customer.email', body.customer?.email],
        ['customer.phoneCountryCode', body.customer?.phoneCountryCode],
        ['customer.phoneNumber', body.customer?.phoneNumber],
        ['customer.billAddrLine1', body.customer?.billAddrLine1],
        ['customer.billAddrCity', body.customer?.billAddrCity],
        ['customer.billAddrState', body.customer?.billAddrState],
        ['customer.billAddrPostCode', body.customer?.billAddrPostCode],
        ['customer.billAddrCountry', body.customer?.billAddrCountry],
    ].filter(([, value]) => value === undefined || value === null || value === '');

    if (requiredFields.length) {
        const names = requiredFields.map(([name]) => name).join(', ');
        throw new Error(`Missing required fields: ${names}`);
    }
}

function buildStartRequestXml({
    amount,
    clientIp,
    credentials,
    customer,
    failUrl,
    installmentCount,
    okUrl,
    orderId,
    card,
    currencyCode,
}) {
    const hashData = buildRequestHash({
        merchantId: credentials.merchantId,
        orderId,
        amount,
        okUrl,
        failUrl,
        username: credentials.username,
        password: credentials.password,
    });

    return `<?xml version="1.0" encoding="utf-8"?>
<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <APIVersion>TDV2.0.0</APIVersion>
  <OkUrl>${escapeXml(okUrl)}</OkUrl>
  <FailUrl>${escapeXml(failUrl)}</FailUrl>
  <HashData>${escapeXml(hashData)}</HashData>
  <MerchantId>${escapeXml(credentials.merchantId)}</MerchantId>
  <CustomerId>${escapeXml(credentials.customerId)}</CustomerId>
  <DeviceData>
    <DeviceChannel>02</DeviceChannel>
    <ClientIP>${escapeXml(clientIp)}</ClientIP>
  </DeviceData>
  <CardHolderData>
    <BillAddrCity>${escapeXml(customer.billAddrCity)}</BillAddrCity>
    <BillAddrCountry>${escapeXml(customer.billAddrCountry)}</BillAddrCountry>
    <BillAddrLine1>${escapeXml(customer.billAddrLine1)}</BillAddrLine1>
    <BillAddrPostCode>${escapeXml(customer.billAddrPostCode)}</BillAddrPostCode>
    <BillAddrState>${escapeXml(customer.billAddrState)}</BillAddrState>
    <Email>${escapeXml(customer.email)}</Email>
    <MobilePhone>
      <Cc>${escapeXml(normalizePhoneCountryCode(customer.phoneCountryCode))}</Cc>
      <Subscriber>${escapeXml(normalizePhoneSubscriber(customer.phoneNumber))}</Subscriber>
    </MobilePhone>
  </CardHolderData>
  <UserName>${escapeXml(credentials.username)}</UserName>
  <CardNumber>${escapeXml(String(card.number || '').replace(/\D+/g, ''))}</CardNumber>
  <CardExpireDateYear>${escapeXml(card.expireYear)}</CardExpireDateYear>
  <CardExpireDateMonth>${escapeXml(card.expireMonth)}</CardExpireDateMonth>
  <CardCVV2>${escapeXml(card.cvv)}</CardCVV2>
  <CardHolderName>${escapeXml(card.holderName)}</CardHolderName>
  <CardType>${escapeXml(card.type || 'CreditCard')}</CardType>
  <TransactionType>Sale</TransactionType>
  <InstallmentCount>${escapeXml(installmentCount)}</InstallmentCount>
  <Amount>${escapeXml(amount)}</Amount>
  <DisplayAmount>${escapeXml(amount)}</DisplayAmount>
  <CurrencyCode>${escapeXml(currencyCode)}</CurrencyCode>
  <MerchantOrderId>${escapeXml(orderId)}</MerchantOrderId>
  <TransactionSecurity>3</TransactionSecurity>
</KuveytTurkVPosMessage>`;
}

function buildProvisionRequestXml({
    amount,
    credentials,
    installmentCount,
    md,
    orderId,
}) {
    const hashData = buildProvisionHash({
        merchantId: credentials.merchantId,
        orderId,
        amount,
        username: credentials.username,
        password: credentials.password,
    });

    return `<?xml version="1.0" encoding="utf-8"?>
<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <APIVersion>TDV2.0.0</APIVersion>
  <HashData>${escapeXml(hashData)}</HashData>
  <MerchantId>${escapeXml(credentials.merchantId)}</MerchantId>
  <CustomerId>${escapeXml(credentials.customerId)}</CustomerId>
  <UserName>${escapeXml(credentials.username)}</UserName>
  <TransactionType>Sale</TransactionType>
  <InstallmentCount>${escapeXml(installmentCount)}</InstallmentCount>
  <Amount>${escapeXml(amount)}</Amount>
  <MerchantOrderId>${escapeXml(orderId)}</MerchantOrderId>
  <TransactionSecurity>3</TransactionSecurity>
  <KuveytTurkVPosAdditionalData>
    <AdditionalData>
      <Key>MD</Key>
      <Data>${escapeXml(md)}</Data>
    </AdditionalData>
  </KuveytTurkVPosAdditionalData>
</KuveytTurkVPosMessage>`;
}

async function parseXml(xmlString = '') {
    return parseStringPromise(xmlString, {
        explicitArray: false,
        trim: true,
    });
}

function extractField(source = {}, keys = []) {
    for (const key of keys) {
        const value = source?.[key];

        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return '';
}

const DEFAULT_RETURN_PATH = '/checkout/payment-return';

// The return URL arrives from the browser, so it must never be trusted as-is:
// an attacker could point it at their own host and harvest the callback query
// string. Relative paths are kept, absolute ones are only honoured when the host
// matches KUVEYT_OK_URL (i.e. our own site).
function sanitizeFrontendReturnUrl(value) {
    const candidate = String(value || '').trim();

    if (!candidate) return DEFAULT_RETURN_PATH;

    if (!/^https?:\/\//i.test(candidate)) {
        // `//host/path` and `/\host/path` are protocol-relative: the browser reads them
        // as absolute URLs to another origin, so they are not safe "relative" paths.
        const isProtocolRelative = /^\/[/\\]/.test(candidate);

        return candidate.startsWith('/') && !isProtocolRelative
            ? candidate
            : DEFAULT_RETURN_PATH;
    }

    try {
        const allowedHost = new URL(process.env.KUVEYT_OK_URL).host;

        return new URL(candidate).host === allowedHost ? candidate : DEFAULT_RETURN_PATH;
    } catch (error) {
        return DEFAULT_RETURN_PATH;
    }
}

function buildFrontendRedirect(baseUrl, params) {
    const fallbackUrl = baseUrl || DEFAULT_RETURN_PATH;
    const url = new URL(fallbackUrl, 'http://local.placeholder');
    const isRelative = !/^https?:\/\//i.test(fallbackUrl);

    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });

    if (isRelative) {
        return `${url.pathname}${url.search}`;
    }

    return url.toString();
}

function getCredentials() {
    return {
        customerId: process.env.KUVEYT_CUSTOMER_ID || '',
        merchantId: process.env.KUVEYT_MERCHANT_ID || '',
        username  : process.env.KUVEYT_USERNAME || '',
        password  : process.env.KUVEYT_PASSWORD || '',
    };
}

function assertCredentialsConfigured(credentials) {
    const missing = Object.entries(credentials)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length) {
        throw new Error(`Missing Kuveyt credentials: ${missing.join(', ')}`);
    }
}

// Reports the bank's verdict straight to the booking API, signed with a shared
// secret. Without this the backend can only learn the outcome from query params on
// the return URL, which the customer can edit to confirm a booking they never paid
// for. Stays inert until KUVEYT_INTERNAL_SECRET and KUVEYT_SETTLE_URL are set —
// see docs/kuveyt-turk-remaining-work.md for the endpoint contract.
async function settlePaymentWithBackend(payload) {
    const secret = process.env.KUVEYT_INTERNAL_SECRET;
    const settleUrl = process.env.KUVEYT_SETTLE_URL
        || (process.env.API_URL ? `${process.env.API_URL}/api/internal/payments/kuveyt-turk/settle` : '');

    if (!secret || !settleUrl) {
        return { settled: false, reason: 'not_configured' };
    }

    const body = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    try {
        await axios.post(settleUrl, body, {
            headers: {
                'Content-Type'       : 'application/json',
                'X-Internal-Signature': signature,
            },
            timeout: 15000,
        });

        return { settled: true };
    } catch (error) {
        // The customer has already been charged at this point, so the redirect must
        // still happen; the backend reconciles from its own record.
        console.error('[kuveyt] settle call failed', {
            orderId: payload.provider_order_id,
            status : error.response?.status,
            message: error.message,
        });

        return { settled: false, reason: 'request_failed' };
    }
}

async function parseGatewayError(responseData) {
    if (typeof responseData !== 'string' || !responseData.trim().startsWith('<')) {
        return '';
    }

    try {
        const parsed = await parseXml(responseData);
        const result = parsed?.KuveytTurkVPosMessage || parsed || {};
        const responseMessage = extractField(result, ['ResponseMessage', 'ResponseDescription', 'Message']);
        const responseCode = extractField(result, ['ResponseCode', 'Code']);

        return [responseCode, responseMessage].filter(Boolean).join(' - ');
    } catch (error) {
        return '';
    }
}

app.post('/start', async (req, res) => {
    const clientIp = getClientIp(req);
    const tooManyAttempts = {
        success: false,
        message: 'Too many payment attempts. Please wait a few minutes and try again.',
    };

    const tenant = await resolveTenant(req);

    if (!tenant) {
        // Counted on its own budget: a rejected caller never reaches the bank, so it
        // must not use up the payment attempts of customers sharing this address.
        if (isRateLimited(`auth-fail:${clientIp}`, AUTH_FAILURE_MAX_ATTEMPTS)) {
            return res.status(429).json(tooManyAttempts);
        }

        return res.status(401).json({
            success: false,
            message: 'You must be signed in to start a card payment.',
        });
    }

    // Only genuine payment attempts are charged against these budgets. Both counters
    // are evaluated eagerly: with `||` the second one would be skipped once the first
    // trips, letting many accounts behind one IP each get a fresh allowance.
    const tenantLimited = isRateLimited(`tenant:${tenant.id}`);
    const ipLimited = isRateLimited(`ip:${clientIp}`);

    if (tenantLimited || ipLimited) {
        return res.status(429).json(tooManyAttempts);
    }

    try {
        validateStartPayload(req.body);

        const credentials = getCredentials();
        assertCredentialsConfigured(credentials);

        const orderId = String(req.body.orderId);
        const amount = amountToMinorUnits(req.body.amount);
        const installmentCount = normalizeInstallmentCount(req.body.installmentCount);
        const okUrl = getCallbackUrl(req, process.env.KUVEYT_OK_URL, '/api/kuveyt/ok');
        const failUrl = getCallbackUrl(req, process.env.KUVEYT_FAIL_URL, '/api/kuveyt/fail');
        const xmlPayload = buildStartRequestXml({
            amount,
            clientIp,
            credentials,
            customer: req.body.customer,
            failUrl,
            installmentCount,
            okUrl,
            orderId,
            card: req.body.card,
            currencyCode: req.body.currencyCode || '0949',
        });

        pendingPayments.set(orderId, {
            amount,
            bookingId        : String(req.body.bookingId || ''),
            currencyCode     : String(req.body.currencyCode || '0949'),
            frontendReturnUrl: sanitizeFrontendReturnUrl(req.body.frontendReturnUrl),
            installmentCount,
            orderId,
            paymentProvider  : 'kuveyt_turk',
            tenantId         : tenant.id,
            createdAt        : new Date().toISOString(),
        });

        // TODO: Persist pending payment by orderId in your real order/payment database.
        // Do not store card number or CVV; only keep order metadata needed for the callback flow.

        const gatewayResponse = await axios.post(
            process.env.KUVEYT_PAY_URL,
            xmlPayload,
            {
                headers: {
                    Accept        : 'text/html,application/xml,text/xml',
                    'Content-Type': 'application/xml; charset=utf-8',
                },
                responseType: 'text',
                timeout     : 30000,
            }
        );

        const responseText = typeof gatewayResponse.data === 'string'
            ? gatewayResponse.data
            : String(gatewayResponse.data || '');
        const contentType = gatewayResponse.headers['content-type'] || 'text/html; charset=utf-8';

        if (/<(html|body|form|script)\b/i.test(responseText)) {
            res.setHeader('Content-Type', contentType);
            return res.status(200).send(responseText);
        }

        const gatewayError = await parseGatewayError(responseText);
        pendingPayments.delete(orderId);

        return res.status(502).json({
            success: false,
            message: gatewayError || 'Kuveyt Turk did not return a browser redirect document.',
        });
    } catch (error) {
        const maskedCard = maskCardNumber(req.body?.card?.number);

        return res.status(422).json({
            success: false,
            message: error.message || 'Unable to start Kuveyt payment.',
            debug  : maskedCard ? { masked_card: maskedCard } : undefined,
        });
    }
});

app.post('/ok', async (req, res) => {
    const payload = req.body || {};
    const md = extractField(payload, ['MD', 'md']);
    const orderId = String(extractField(payload, ['MerchantOrderId', 'merchantOrderId', 'OrderId', 'oid']));
    const pendingPayment = pendingPayments.get(orderId);
    const credentials = getCredentials();

    if (!pendingPayment || !orderId || !md) {
        const redirectUrl = buildFrontendRedirect(
            pendingPayment?.frontendReturnUrl || DEFAULT_RETURN_PATH,
            {
                booking_id: pendingPayment?.bookingId || '',
                message   : 'Payment callback is missing required data.',
                order_id  : orderId,
                status    : 'failed',
            }
        );

        return res.redirect(302, redirectUrl);
    }

    try {
        assertCredentialsConfigured(credentials);

        const provisionXml = buildProvisionRequestXml({
            amount          : pendingPayment.amount,
            credentials,
            installmentCount: pendingPayment.installmentCount,
            md,
            orderId,
        });

        const provisionResponse = await axios.post(
            process.env.KUVEYT_PROVISION_URL,
            provisionXml,
            {
                headers: {
                    Accept        : 'application/xml,text/xml',
                    'Content-Type': 'application/xml; charset=utf-8',
                },
                responseType: 'text',
                timeout     : 30000,
            }
        );

        const parsed = await parseXml(provisionResponse.data);
        const result = parsed?.KuveytTurkVPosMessage || parsed || {};
        const successValue = String(extractField(result, ['Success', 'IsSuccess'])).toLowerCase();
        const responseCode = extractField(result, ['ResponseCode', 'Code']);
        const responseMessage = extractField(result, ['ResponseMessage', 'ResponseDescription', 'Message']);
        const transactionId = extractField(result, ['TransactionId', 'AuthCode', 'HostReference']);
        const isSuccess = (successValue === 'true' || successValue === '1') && responseCode === '00';

        // Tell the backend the outcome before redirecting, so the booking state comes
        // from the bank's verdict rather than from the return URL the customer lands on.
        await settlePaymentWithBackend({
            booking_id             : pendingPayment.bookingId,
            tenant_id              : pendingPayment.tenantId,
            provider               : 'kuveyt_turk',
            provider_order_id      : orderId,
            provider_transaction_id: transactionId,
            status                 : isSuccess ? 'paid' : 'failed',
            amount_minor           : pendingPayment.amount,
            currency_code          : pendingPayment.currencyCode,
            response_code          : responseCode,
            response_message       : responseMessage,
        });

        pendingPayments.delete(orderId);

        const redirectUrl = buildFrontendRedirect(
            pendingPayment.frontendReturnUrl,
            {
                booking_id     : pendingPayment.bookingId,
                gateway_message: responseMessage,
                message        : responseMessage,
                order_id       : orderId,
                provider_order_id: orderId,
                provider_transaction_id: transactionId,
                status         : isSuccess ? 'success' : 'failed',
                transaction_id : transactionId,
            }
        );

        return res.redirect(302, redirectUrl);
    } catch (error) {
        const redirectUrl = buildFrontendRedirect(
            pendingPayment.frontendReturnUrl,
            {
                booking_id: pendingPayment.bookingId,
                message   : error.message || 'Payment provision failed.',
                order_id  : orderId,
                status    : 'failed',
            }
        );

        return res.redirect(302, redirectUrl);
    }
});

app.post('/fail', (req, res) => {
    const payload = req.body || {};
    const orderId = String(extractField(payload, ['MerchantOrderId', 'merchantOrderId', 'OrderId', 'oid']));
    const pendingPayment = pendingPayments.get(orderId);

    if (pendingPayment) {
        // TODO: Replace this with your real order database update to mark the payment as failed.
        pendingPayments.delete(orderId);
    }

    const redirectUrl = buildFrontendRedirect(
        pendingPayment?.frontendReturnUrl || '/checkout/payment-return',
        {
            booking_id: pendingPayment?.bookingId || '',
            message   : extractField(payload, ['ResponseMessage', 'mdErrorMsg', 'Message']) || 'Payment failed during 3D Secure verification.',
            order_id  : orderId,
            status    : 'failed',
        }
    );

    return res.redirect(302, redirectUrl);
});

module.exports = app;
