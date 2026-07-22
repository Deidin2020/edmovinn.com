function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;

    return Number(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
}

const GUEST_CART_STORAGE_KEY = 'guest_cart';
const GUEST_CART_TOKEN_KEY = 'guest_cart_token';

function isClient() {
    return typeof window !== 'undefined'
        && typeof window.sessionStorage !== 'undefined'
        && typeof window.localStorage !== 'undefined';
}

function createEmptyCart() {
    return {
        id         : null,
        currency   : '',
        items_count: 0,
        items      : [],
        summary    : {
            subtotal     : 0,
            deposit_total: 0,
            grand_total  : 0,
        },
    };
}

function normalizeCartItem(item = {}) {
    const pricing = item.pricing || {};
    const roomId = item.room_id || item.room?.id || item.id;
    const unitPrice = pricing.unit_price ?? item.price?.price ?? item.unit_price ?? 0;
    const deposit = pricing.deposit ?? item.price?.deposit ?? item.deposit ?? 0;
    const currency = pricing.currency ?? item.price?.currency ?? item.currency ?? '';
    const paymentPer = pricing.payment_per ?? item.price?.payment_per ?? '';
    const contractType = pricing.contract_type ?? item.price?.contract_type ?? '';
    const quantity = item.quantity || 1;

    return {
        id                : item.id,
        room_id           : roomId,
        name              : item.name || item.room_name || item.room?.name || '',
        slug              : item.slug || item.room?.slug || '',
        image             : item.image || item.room?.image || '/img/search/default-room.jpg',
        accommodation     : item.accommodation || item.accommodation_name || item.room?.accommodation?.name || '',
        available_from    : item.available_from || item.stay_start_date || '',
        availability_status: item.availability_status || 'available',
        quantity,
        price: {
            price        : unitPrice,
            deposit,
            currency,
            payment_per  : paymentPer,
            contract_type: contractType,
        },
        line_total: item.line_total ?? (toNumber(unitPrice) + toNumber(deposit)) * quantity,
    };
}

function normalizeCart(cart = {}) {
    const items = Array.isArray(cart.items) ? cart.items.map(normalizeCartItem) : [];
    const summary = cart.summary || {};

    return {
        id         : cart.id || null,
        currency   : cart.currency || items[0]?.price?.currency || '',
        items_count: cart.items_count ?? items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        items,
        summary: {
            subtotal     : summary.subtotal ?? items.reduce((sum, item) => sum + toNumber(item.price.price) * item.quantity, 0),
            deposit_total: summary.deposit_total ?? items.reduce((sum, item) => sum + toNumber(item.price.deposit) * item.quantity, 0),
            grand_total  : summary.grand_total ?? items.reduce((sum, item) => sum + item.line_total, 0),
        },
    };
}

function readLegacyGuestCart() {
    if (!isClient()) return createEmptyCart();

    try {
        const rawValue = window.sessionStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (!rawValue) return createEmptyCart();

        return normalizeCart(JSON.parse(rawValue));
    } catch (error) {
        return createEmptyCart();
    }
}

function clearLegacyGuestCartStorage() {
    if (isClient()) {
        window.sessionStorage.removeItem(GUEST_CART_STORAGE_KEY);
    }

    return createEmptyCart();
}

function readGuestCartToken() {
    if (!isClient()) return '';

    return window.localStorage.getItem(GUEST_CART_TOKEN_KEY) || '';
}

function writeGuestCartToken(token = '') {
    if (!isClient()) return '';

    if (token) {
        window.localStorage.setItem(GUEST_CART_TOKEN_KEY, token);
    }

    return token;
}

function clearGuestCartToken() {
    if (isClient()) {
        window.localStorage.removeItem(GUEST_CART_TOKEN_KEY);
    }
}

function splitFullName(fullName = '') {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

    if (!parts.length) {
        return {
            first_name: '',
            last_name : '',
        };
    }

    return {
        first_name: parts[0] || '',
        last_name : parts.slice(1).join(' '),
    };
}

function normalizeTenantProfile(profile = {}) {
    const fallbackNames = splitFullName(profile.full_name || profile.name || '');
    const firstName = profile.first_name || fallbackNames.first_name || '';
    const lastName = profile.last_name || fallbackNames.last_name || '';
    const fullName = profile.full_name || [firstName, lastName].filter(Boolean).join(' ').trim();
    const mobile = profile.mobile || profile.phone || '';
    const university = profile.university || profile.university_name || '';

    return {
        ...profile,
        full_name      : fullName,
        first_name     : firstName,
        last_name      : lastName,
        email          : profile.email || '',
        mobile,
        phone          : mobile,
        date_of_birth  : profile.date_of_birth || '',
        university,
        university_name: university,
        nationality    : profile.nationality || '',
        address        : profile.address || '',
    };
}

function buildTenantProfilePayload(payload = {}) {
    const normalizedProfile = normalizeTenantProfile(payload);

    return Object.fromEntries(
        Object.entries({
            full_name      : normalizedProfile.full_name || undefined,
            first_name     : normalizedProfile.first_name || undefined,
            last_name      : normalizedProfile.last_name || undefined,
            email          : normalizedProfile.email || undefined,
            mobile         : normalizedProfile.mobile || undefined,
            phone          : normalizedProfile.mobile || undefined,
            date_of_birth  : normalizedProfile.date_of_birth || undefined,
            university     : normalizedProfile.university || undefined,
            university_name: normalizedProfile.university_name || undefined,
            nationality    : normalizedProfile.nationality || undefined,
            address        : normalizedProfile.address || undefined,
            // NOTE: billing fields (bill_addr_*, phone_country_code, phone_number) are
            // collected for the bank gateway but not persisted yet — `PUT /api/tenant/profile`
            // does not accept them. See docs/kuveyt-turk-remaining-work.md.
        }).filter(([, value]) => value !== undefined)
    );
}

function normalizePaymentMethod(method = {}) {
    const code = method.code || method.key || '';
    const labelMap = {
        pay_at_property: 'Pay at Property',
        credit_card    : 'Pay Online via Bank Gateway',
        bank_transfer  : 'Bank Transfer',
    };
    const descriptionMap = {
        pay_at_property: 'Pay when you arrive at the accommodation.',
        credit_card    : 'Complete your payment securely through the bank 3D Secure page.',
        bank_transfer  : 'Transfer to the provided bank account and upload proof.',
    };

    return {
        code,
        label      : method.label || method.name || labelMap[code] || code,
        description: method.description || descriptionMap[code] || '',
        ...method,
    };
}

function extractGuestCartToken(response = {}) {
    return response?.data?.result?.cart_token
        || response?.data?.result?.token
        || response?.data?.result?.cart?.token
        || response?.headers?.['x-cart-token']
        || response?.headers?.['X-Cart-Token']
        || '';
}

function normalizeDashboardMoney(value = {}) {
    if (typeof value === 'string') {
        return {
            amount         : toNumber(value),
            formatted      : value,
            formatted_short: value,
            currency       : '',
        };
    }

    return {
        amount         : value.amount ?? 0,
        formatted      : value.formatted ?? '',
        formatted_short: value.formatted_short ?? value.formatted ?? '',
        currency       : value.currency ?? '',
    };
}

function normalizeStateKey(value = '') {
    const key = String(value || '').trim().toLowerCase();

    const map = {
        confirmed      : 'confirmed',
        completed      : 'completed',
        paid           : 'paid',
        pending        : 'pending',
        pending_payment: 'pendingPayment',
        uploaded       : 'uploaded',
        not_uploaded   : 'notUploaded',
        under_review   : 'underReview',
        in_progress    : 'inProgress',
        notuploaded    : 'notUploaded',
    };

    return map[key] || value || '';
}

function normalizePaymentMethodKey(value = '') {
    const key = String(value || '').trim().toLowerCase();

    if (key === 'credit_card' || key === 'credit card') return 'creditCard';
    if (key === 'bank_transfer' || key === 'bank transfer') return 'bankTransfer';

    return value || '';
}

function toneToBadgeClass(tone = '') {
    const key = String(tone || '').toLowerCase();

    if (key === 'success') return 'is-success';
    if (key === 'warning') return 'is-warning';
    if (key === 'danger') return 'is-danger';

    return 'is-neutral';
}

function paymentStateToIconClass(statusKey = '') {
    return normalizeStateKey(statusKey) === 'paid' ? 'green' : 'amber';
}

function normalizeSummaryCode(value = '') {
    const key = String(value || '').trim().toLowerCase();

    const map = {
        booking_confirmed   : 'bookingConfirmed',
        booking_under_review: 'bookingUnderReview',
        paid_successfully   : 'paidSuccessfully',
        payment_under_review: 'paymentUnderReview',
        docs_partial        : 'docsPartial',
        docs_missing        : 'docsMissing',
    };

    return map[key] || value || '';
}

function normalizeDashboardDocument(item = {}) {
    const code = item.code || item.name_key || item.name || '';
    const statusKey = normalizeStateKey(item.status || item.state || '');

    const nameMap = {
        passport_copy    : 'passportCopy',
        passportcopy     : 'passportCopy',
        acceptance_letter: 'acceptanceLetter',
        university_acceptance_letter: 'acceptanceLetter',
        financial_statement: 'financialStatement',
    };

    return {
        nameKey    : nameMap[String(code).toLowerCase()] || code,
        stateKey   : statusKey,
        statusClass: toneToBadgeClass(item.tone || item.badge_tone || (statusKey === 'uploaded' ? 'success' : statusKey === 'pending' || statusKey === 'underReview' ? 'warning' : statusKey === 'notUploaded' ? 'danger' : 'neutral')),
    };
}

function buildDefaultFinalItems(statusKey = '', finalDone = false) {
    if (finalDone || statusKey === 'confirmed') {
        return [
            { labelKey: 'applicationReview', stateKey: 'completed', statusClass: 'is-success' },
            { labelKey: 'roomAssignment', stateKey: 'completed', statusClass: 'is-success' },
            { labelKey: 'bookingConfirmation', stateKey: 'confirmed', statusClass: 'is-success' },
        ];
    }

    return [
        { labelKey: 'applicationReview', stateKey: 'underReview', statusClass: 'is-warning' },
        { labelKey: 'roomAssignment', stateKey: 'pending', statusClass: 'is-neutral' },
        { labelKey: 'bookingConfirmation', stateKey: 'pending', statusClass: 'is-neutral' },
    ];
}

function normalizeDashboardBooking(item = {}) {
    const items = Array.isArray(item.items)
        ? item.items
        : Array.isArray(item.cart_items)
            ? item.cart_items
            : [];
    const amount = normalizeDashboardMoney(item.amount || item.total || {});
    const pricing = item.pricing_breakdown || {};
    const rent = pricing.rent || {};
    const deposit = pricing.deposit || {};
    const statusKey = normalizeStateKey(item.status || '');
    const paymentKey = normalizeStateKey(item.payment_status || '');
    const paymentDisplayKey = normalizeStateKey(item.payment_display_status || item.payment_status || '');
    const docsDone = item.timeline?.summary_flags?.docs_done ?? false;
    const paymentDone = item.timeline?.summary_flags?.payment_done ?? (paymentKey === 'paid');
    const finalDone = item.timeline?.summary_flags?.final_done ?? (statusKey === 'confirmed');
    const documents = Array.isArray(item.documents) ? item.documents.map(normalizeDashboardDocument) : [];
    const finalItems = Array.isArray(item.final_items)
        ? item.final_items.map(entry => ({
            labelKey   : entry.label_key || entry.code || '',
            stateKey   : normalizeStateKey(entry.status || entry.state || ''),
            statusClass: toneToBadgeClass(entry.tone || entry.badge_tone || 'neutral'),
        }))
        : buildDefaultFinalItems(statusKey, finalDone);
    const statusBar = item.status_bar || {};

    return {
        reference        : item.reference || '',
        date             : item.created_at || item.date || '',
        statusKey,
        paymentKey,
        paymentDisplayKey,
        itemsCount       : item.items_count ?? items.length ?? 0,
        university       : item.university?.name || item.university_name || item.university || '',
        paymentMethodKey : normalizePaymentMethodKey(item.payment_method?.code || item.payment_method_label || item.payment_method || ''),
        room             : item.room?.name || item.room_name || item.room || '',
        roomDetails      : item.room?.details_label || item.room_details || item.room?.name || item.room_name || '',
        location         : item.location?.formatted || item.location || '',
        amount           : amount.formatted_short || amount.formatted,
        total            : amount.formatted,
        rentAmount       : rent.formatted || rent.amount || '',
        depositAmount    : deposit.formatted || deposit.amount || '',
        priceLine        : pricing.price_line || '',
        progress         : item.progress?.formatted || `${item.progress?.percentage || (statusKey === 'confirmed' ? 75 : 25)}%`,
        progressColor    : statusKey === 'confirmed' ? '#3b6d11' : '#854f0b',
        barClass         : statusKey === 'confirmed' ? 'green' : 'amber',
        docsDone,
        paymentDone,
        finalDone,
        duration         : item.duration?.formatted || item.duration?.label || item.duration || '',
        documents,
        paymentLines     : [
            ...(rent.formatted || rent.amount ? [{ labelKey: 'roomRent', value: rent.formatted || rent.amount }] : []),
            ...(deposit.formatted || deposit.amount ? [{ labelKey: 'securityDeposit', value: deposit.formatted || deposit.amount }] : []),
        ],
        finalItems,
        statusSummaryKey : normalizeSummaryCode(statusBar.booking?.code) || (statusKey === 'confirmed' ? 'bookingConfirmed' : 'bookingUnderReview'),
        statusItemClass  : toneToBadgeClass(statusBar.booking?.tone || (statusKey === 'confirmed' ? 'success' : 'warning')),
        paymentSummaryKey: normalizeSummaryCode(statusBar.payment?.code) || (paymentDone ? 'paidSuccessfully' : 'paymentUnderReview'),
        paymentItemClass : toneToBadgeClass(statusBar.payment?.tone || (paymentDone ? 'success' : 'warning')),
        docsSummaryKey   : normalizeSummaryCode(statusBar.documents?.code) || (documents.some(doc => doc.stateKey === 'uploaded') ? 'docsPartial' : 'docsMissing'),
        docsItemClass    : toneToBadgeClass(statusBar.documents?.tone || (documents.some(doc => doc.stateKey === 'uploaded') ? 'warning' : 'neutral')),
    };
}

function normalizeDashboardPayment(item = {}) {
    const statusKey = normalizeStateKey(item.status || '');

    return {
        id            : item.id || '',
        reference     : item.reference || item.booking_reference || '',
        referenceKey  : item.type === 'security_deposit' ? 'securityDeposit' : '',
        referenceLabel: item.title || item.booking_reference || '',
        methodCode    : item.method?.display_code || item.payment_method || '',
        methodLabelKey: normalizePaymentMethodKey(item.method?.code || item.payment_method_label || item.payment_method || ''),
        date          : item.date || '',
        total         : normalizeDashboardMoney(item.amount).formatted,
        statusKey,
        iconClass     : paymentStateToIconClass(statusKey),
    };
}

function normalizeDashboardProfile(profile = {}) {
    const normalizedProfile = normalizeTenantProfile(profile);

    return [
        { key: 'full_name', label: 'Full Name', value: normalizedProfile.full_name || '' },
        { key: 'email', label: 'Email', value: normalizedProfile.email || '' },
        { key: 'phone', label: 'Phone', value: normalizedProfile.mobile || normalizedProfile.phone || '' },
        { key: 'university', label: 'University', value: normalizedProfile.university || normalizedProfile.university_name || '' },
        { key: 'nationality', label: 'Nationality', value: normalizedProfile.nationality || '' },
        { key: 'date_of_birth', label: 'Date of Birth', value: normalizedProfile.date_of_birth || '' },
        { key: 'address', label: 'Address', value: normalizedProfile.address || '' },
        { key: 'status', label: 'Profile Status', value: normalizedProfile.completion?.label || normalizedProfile.status_label || '' },
    ];
}

function normalizeDashboardResponse(result = {}) {
    const totalPaid = normalizeDashboardMoney(result.stats?.total_paid || result.stats?.total_spent);
    const normalizedProfile = normalizeTenantProfile(result.profile || {});

    return {
        stats: {
            total_bookings : result.stats?.total_bookings ?? 0,
            active_bookings: result.stats?.active_bookings ?? 0,
            total_paid     : totalPaid,
            total_spent    : totalPaid,
        },
        recent_bookings: Array.isArray(result.recent_bookings) ? result.recent_bookings.map(normalizeDashboardBooking) : [],
        bookings       : Array.isArray(result.bookings) ? result.bookings.map(normalizeDashboardBooking) : [],
        payments       : Array.isArray(result.payments) ? result.payments.map(normalizeDashboardPayment) : [],
        profile        : normalizeDashboardProfile(normalizedProfile),
        rawProfile     : normalizedProfile,
    };
}

export default function createBookingApi(axios, auth) {
    const isLoggedIn = () => Boolean(auth?.loggedIn);
    const hasGuestCartToken = () => Boolean(readGuestCartToken());
    const hasLegacyGuestCartItems = () => readLegacyGuestCart().items.length > 0;
    const guestCartHeaders = () => {
        const guestCartToken = readGuestCartToken();

        return guestCartToken
            ? { 'X-Cart-Token': guestCartToken }
            : {};
    };
    const persistGuestCartToken = response => {
        const guestCartToken = extractGuestCartToken(response);

        if (guestCartToken) {
            writeGuestCartToken(guestCartToken);
        }
    };
    const requestGuestCart = async ({ method = 'get', url, data, params, headers = {} } = {}) => {
        const response = await axios.request({
            method,
            url,
            data,
            params,
            headers: {
                Accept: 'application/json',
                ...guestCartHeaders(),
                ...headers,
            },
        });

        persistGuestCartToken(response);

        return response;
    };
    const buildCartItemPayload = payload => {
        const nextQuantity = Number(payload?.quantity ?? 1);

        return Object.fromEntries(
            Object.entries({
                room_id        : payload?.room_id,
                quantity       : Number.isFinite(nextQuantity) && nextQuantity > 0 ? nextQuantity : 1,
                stay_start_date: payload?.stay_start_date || payload?.available_from || undefined,
            }).filter(([, value]) => value !== undefined)
        );
    };
    const buildCartItemUpdatePayload = payload => {
        const nextQuantity = payload?.quantity !== undefined ? Number(payload.quantity) : undefined;

        return Object.fromEntries(
            Object.entries({
                quantity       : Number.isFinite(nextQuantity) ? nextQuantity : undefined,
                stay_start_date: payload?.stay_start_date || payload?.available_from || undefined,
            }).filter(([, value]) => value !== undefined)
        );
    };
    const toFormUrlEncoded = payload => {
        const formPayload = new URLSearchParams();

        Object.entries(payload || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                formPayload.append(key, value);
            }
        });

        return formPayload;
    };
    const toFormBody = payload => toFormUrlEncoded(payload).toString();
    const formRequestHeaders = {
        Accept          : 'application/json',
        'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
    };
    const normalizeGuestCartResponse = response => normalizeCart(response?.data?.result?.cart || response?.data?.result || {});
    const normalizeTenantCartResponse = responseData => normalizeCart(responseData?.result?.cart || responseData?.result || {});
    const migrateLegacyGuestCart = async () => {
        const legacyGuestCart = readLegacyGuestCart();

        if (!legacyGuestCart.items.length) {
            return createEmptyCart();
        }

        let guestCart = createEmptyCart();

        for (const item of legacyGuestCart.items) {
            const response = await requestGuestCart({
                method: 'post',
                url   : '/api/cart/items',
                data  : toFormBody(buildCartItemPayload({
                    room_id        : item.room_id,
                    quantity       : item.quantity || 1,
                    stay_start_date: item.available_from || undefined,
                })),
                headers: formRequestHeaders,
            });

            guestCart = normalizeGuestCartResponse(response);
        }

        clearLegacyGuestCartStorage();

        return guestCart;
    };
    const getGuestCartFromDatabase = async () => {
        const response = await requestGuestCart({
            method: 'get',
            url   : '/api/cart',
        });

        const guestCart = normalizeGuestCartResponse(response);

        if (!guestCart.items.length && hasLegacyGuestCartItems()) {
            return migrateLegacyGuestCart();
        }

        return guestCart;
    };

    return {
        normalizeCart,
        normalizeDashboardResponse,
        async getGuestCart() {
            return getGuestCartFromDatabase();
        },

        clearGuestCart() {
            clearGuestCartToken();
            return clearLegacyGuestCartStorage();
        },

        async syncGuestCartToServer() {
            if (!isLoggedIn()) {
                return getGuestCartFromDatabase();
            }

            let guestCart = createEmptyCart();

            if (hasGuestCartToken()) {
                try {
                    await axios.post('/api/tenant/cart/merge', {}, {
                        headers: guestCartHeaders(),
                    });

                    clearGuestCartToken();
                    clearLegacyGuestCartStorage();

                    return this.getCart();
                } catch (error) {
                    guestCart = await getGuestCartFromDatabase();
                }
            } else if (hasLegacyGuestCartItems()) {
                guestCart = readLegacyGuestCart();
            } else {
                return this.getCart();
            }

            for (const item of guestCart.items) {
                await axios.post('/api/tenant/cart/items', toFormUrlEncoded(buildCartItemPayload({
                    room_id        : item.room_id,
                    quantity       : item.quantity || 1,
                    stay_start_date: item.available_from || undefined,
                })), {
                    headers: {
                        Accept: 'application/json',
                    },
                });
            }

            clearGuestCartToken();
            clearLegacyGuestCartStorage();

            return this.getCart();
        },

        async getCart() {
            if (!isLoggedIn()) {
                return getGuestCartFromDatabase();
            }

            const { data } = await axios.get('/api/tenant/cart');
            const cart = normalizeTenantCartResponse(data);

            if (!cart.items.length && (hasGuestCartToken() || hasLegacyGuestCartItems())) {
                return this.syncGuestCartToServer();
            }

            return cart;
        },

        async addCartItem(payload) {
            if (!isLoggedIn()) {
                const response = await requestGuestCart({
                    method: 'post',
                    url   : '/api/cart/items',
                    data  : toFormBody(buildCartItemPayload(payload)),
                    headers: formRequestHeaders,
                });

                clearLegacyGuestCartStorage();

                return normalizeGuestCartResponse(response);
            }

            const { data } = await axios.post('/api/tenant/cart/items', toFormBody(buildCartItemPayload(payload)), {
                headers: formRequestHeaders,
            });
            return normalizeTenantCartResponse(data);
        },

        async updateCartItem(itemId, payload) {
            if (!isLoggedIn()) {
                const response = await requestGuestCart({
                    method: 'patch',
                    url   : `/api/cart/items/${itemId}`,
                    data  : toFormBody(buildCartItemUpdatePayload(payload)),
                    headers: formRequestHeaders,
                });

                return normalizeGuestCartResponse(response);
            }

            const { data } = await axios.patch(`/api/tenant/cart/items/${itemId}`, toFormBody(buildCartItemUpdatePayload(payload)), {
                headers: formRequestHeaders,
            });
            return normalizeTenantCartResponse(data);
        },

        async removeCartItem(itemId) {
            if (!isLoggedIn()) {
                const response = await requestGuestCart({
                    method: 'delete',
                    url   : `/api/cart/items/${itemId}`,
                });

                return normalizeGuestCartResponse(response);
            }

            const { data } = await axios.delete(`/api/tenant/cart/items/${itemId}`, {
                headers: formRequestHeaders,
            });
            return normalizeTenantCartResponse(data);
        },

        async clearCart() {
            if (!isLoggedIn()) {
                if (hasGuestCartToken()) {
                    try {
                        const response = await requestGuestCart({
                            method: 'delete',
                            url   : '/api/cart',
                        });

                        clearGuestCartToken();
                        clearLegacyGuestCartStorage();

                        return normalizeGuestCartResponse(response);
                    } catch (error) {
                        const cart = await getGuestCartFromDatabase();

                        for (const item of cart.items) {
                            if (item?.id) {
                                await requestGuestCart({
                                    method: 'delete',
                                    url   : `/api/cart/items/${item.id}`,
                                });
                            }
                        }

                        clearGuestCartToken();
                        clearLegacyGuestCartStorage();
                    }
                }

                return createEmptyCart();
            }

            const cart = await this.getCart();

            for (const item of cart.items) {
                if (item?.id) {
                    await axios.delete(`/api/tenant/cart/items/${item.id}`);
                }
            }

            return normalizeCart({
                id         : cart.id,
                currency   : cart.currency,
                items_count: 0,
                items      : [],
                summary    : {
                    subtotal     : 0,
                    deposit_total: 0,
                    grand_total  : 0,
                },
            });
        },

        async validateCart() {
            const { data } = await axios.post('/api/tenant/cart/validate');
            return data?.result || {};
        },

        async getCheckoutContext() {
            if (isLoggedIn() && (hasGuestCartToken() || hasLegacyGuestCartItems())) {
                await this.syncGuestCartToServer();
            }

            const { data } = await axios.get('/api/tenant/checkout/context');
            let normalizedCart = normalizeCart(data?.result?.cart || {});

            if (!normalizedCart.items.length) {
                normalizedCart = await this.getCart();
            }

            return {
                tenant         : normalizeTenantProfile(data?.result?.tenant || data?.result?.profile || {}),
                cart           : normalizedCart,
                payment_methods: Array.isArray(data?.result?.payment_methods)
                    ? data.result.payment_methods.map(normalizePaymentMethod)
                    : [],
            };
        },

        async updateProfile(payload) {
            const { data } = await axios.put('/api/tenant/profile', buildTenantProfilePayload(payload));
            return normalizeTenantProfile(data?.result?.tenant || data?.result?.profile || data?.result || {});
        },

        async createBooking(payload) {
            const { data } = await axios.post('/api/tenant/bookings', payload);
            return data?.result || {};
        },

        async getBookings() {
            const { data } = await axios.get('/api/tenant/bookings');
            return data?.result?.items || data?.result?.bookings || data?.result || [];
        },

        async getDashboard() {
            const { data } = await axios.get('/api/tenant/dashboard');
            return normalizeDashboardResponse(data?.result || {});
        },

        async getDashboardBookings(params = {}) {
            const { data } = await axios.get('/api/tenant/dashboard/bookings', { params });
            const result = data?.result || {};

            return {
                items     : Array.isArray(result.items) ? result.items.map(normalizeDashboardBooking) : [],
                pagination: result.pagination || null,
            };
        },

        async getDashboardPayments(params = {}) {
            const { data } = await axios.get('/api/tenant/dashboard/payments', { params });
            const result = data?.result || {};

            return {
                items     : Array.isArray(result.items) ? result.items.map(normalizeDashboardPayment) : [],
                pagination: result.pagination || null,
            };
        },

        async getDashboardProfile() {
            const { data } = await axios.get('/api/tenant/dashboard/profile');
            const normalizedProfile = normalizeTenantProfile(data?.result?.profile || data?.result || {});

            return {
                profile   : normalizeDashboardProfile(normalizedProfile),
                rawProfile: normalizedProfile,
            };
        },

        async createPaymentSession(bookingId, payload = { provider: 'stripe' }) {
            console.log('[PaymentSession] Request start', { bookingId, payload });
            const { data } = await axios.post(`/api/tenant/bookings/${bookingId}/payment-sessions`, payload);
            console.log('[PaymentSession] Response received', data);
            const paymentSession = data?.result?.payment_session || {};

            const normalizedSession = {
                ...paymentSession,
                backend_message: data?.message || data?.result?.message || paymentSession.message || '',
            };

            console.log('[PaymentSession] Request complete', normalizedSession);

            return normalizedSession;
        },

        async confirmPayment(bookingId, payload) {
            console.log('[ConfirmPayment] Request start', { bookingId, payload });
            const { data } = await axios.post(`/api/tenant/bookings/${bookingId}/payments/confirm`, payload);
            console.log('[ConfirmPayment] Response received', data);
            const normalizedResult = data?.result || {};
            console.log('[ConfirmPayment] Request complete', normalizedResult);
            return normalizedResult;
        },

        async uploadBankTransferProof(bookingId, payload) {
            const formData = new FormData();

            if (payload?.receipt_file) formData.append('receipt_file', payload.receipt_file);
            if (payload?.reference_number) formData.append('reference_number', payload.reference_number);
            if (payload?.notes) formData.append('notes', payload.notes);

            const { data } = await axios.post(`/api/tenant/bookings/${bookingId}/bank-transfer-proof`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return data?.result?.booking || {};
        },
    };
}
