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

// Production hardening note:
// add rate limiting and a CSRF strategy around /start before enabling live traffic.

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

function buildFrontendRedirect(baseUrl, params) {
    const fallbackUrl = baseUrl || '/checkout/payment-return';
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
            clientIp: getClientIp(req),
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
            frontendReturnUrl: req.body.frontendReturnUrl || '/checkout/payment-return',
            installmentCount,
            orderId,
            paymentProvider  : 'kuveyt_turk',
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
            pendingPayment?.frontendReturnUrl || '/checkout/payment-return',
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

        // TODO: Replace this in-memory state with real DB logic:
        // - load pending order by orderId
        // - mark order as paid only when provision succeeds
        // - store provider transaction id and response snapshot safely
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
