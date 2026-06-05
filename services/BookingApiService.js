function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;

    return Number(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
}

const GUEST_CART_STORAGE_KEY = 'guest_cart';

function isClient() {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
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

function readGuestCart() {
    if (!isClient()) return createEmptyCart();

    try {
        const rawValue = window.sessionStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (!rawValue) return createEmptyCart();

        return normalizeCart(JSON.parse(rawValue));
    } catch (error) {
        return createEmptyCart();
    }
}

function writeGuestCart(cart = createEmptyCart()) {
    const normalizedCart = normalizeCart(cart);

    if (isClient()) {
        window.sessionStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(normalizedCart));
    }

    return normalizedCart;
}

function clearGuestCartStorage() {
    if (isClient()) {
        window.sessionStorage.removeItem(GUEST_CART_STORAGE_KEY);
    }

    return createEmptyCart();
}

function buildGuestCart(items = []) {
    return normalizeCart({
        items,
    });
}

function resolveGuestItemId(itemId) {
    if (itemId === null || itemId === undefined) return '';
    return itemId.toString().replace(/^guest-/, '');
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
    return [
        { key: 'full_name', label: 'Full Name', value: profile.full_name || '' },
        { key: 'email', label: 'Email', value: profile.email || '' },
        { key: 'phone', label: 'Phone', value: profile.mobile || profile.phone || '' },
        { key: 'university', label: 'University', value: profile.university || '' },
        { key: 'nationality', label: 'Nationality', value: profile.nationality || '' },
        { key: 'date_of_birth', label: 'Date of Birth', value: profile.date_of_birth || '' },
        { key: 'address', label: 'Address', value: profile.address || '' },
        { key: 'status', label: 'Profile Status', value: profile.completion?.label || profile.status_label || '' },
    ];
}

function normalizeDashboardResponse(result = {}) {
    const totalPaid = normalizeDashboardMoney(result.stats?.total_paid || result.stats?.total_spent);

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
        profile        : normalizeDashboardProfile(result.profile || {}),
        rawProfile     : result.profile || {},
    };
}

export default function createBookingApi(axios, auth) {
    const isLoggedIn = () => Boolean(auth?.loggedIn);
    const hasGuestCartItems = () => readGuestCart().items.length > 0;

    const buildGuestCartItem = payload => {
        const room = payload.room || payload.roomData || {};
        const roomId = payload.room_id ?? room.id;
        const quantity = payload.quantity || 1;

        return normalizeCartItem({
            id             : `guest-${roomId}`,
            room_id        : roomId,
            name           : payload.name || room.name || '',
            slug           : payload.slug || room.slug || '',
            image          : payload.image || room.image || '/img/search/default-room.jpg',
            accommodation  : payload.accommodation || room.accommodation?.name || '',
            available_from : payload.stay_start_date || payload.available_from || room.available_from || '',
            quantity,
            price          : payload.price || room.price || {
                price        : 0,
                deposit      : 0,
                currency     : '',
                payment_per  : '',
                contract_type: '',
            },
        });
    };

    const addGuestCartItem = payload => {
        const cart = readGuestCart();
        const roomId = String(payload.room_id);
        const existingItem = cart.items.find(item => String(item.room_id) === roomId);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + (payload.quantity || 1);
            if (payload.stay_start_date) existingItem.available_from = payload.stay_start_date;
        } else {
            cart.items.push(buildGuestCartItem(payload));
        }

        return writeGuestCart(buildGuestCart(cart.items));
    };

    const updateGuestCartItem = (itemId, payload) => {
        const cart = readGuestCart();
        const guestItemId = resolveGuestItemId(itemId);
        const itemIndex = cart.items.findIndex(item => String(item.room_id) === guestItemId || String(item.id) === String(itemId));

        if (itemIndex === -1) return writeGuestCart(cart);

        const nextQuantity = Number(payload.quantity || 1);

        if (nextQuantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex] = normalizeCartItem({
                ...cart.items[itemIndex],
                quantity: nextQuantity,
            });
        }

        return writeGuestCart(buildGuestCart(cart.items));
    };

    const removeGuestCartItem = itemId => {
        const cart = readGuestCart();
        const guestItemId = resolveGuestItemId(itemId);
        const items = cart.items.filter(item => String(item.room_id) !== guestItemId && String(item.id) !== String(itemId));

        return writeGuestCart(buildGuestCart(items));
    };

    return {
        normalizeCart,
        normalizeDashboardResponse,
        getGuestCart() {
            return readGuestCart();
        },

        clearGuestCart() {
            return clearGuestCartStorage();
        },

        async syncGuestCartToServer() {
            if (!isLoggedIn()) {
                return readGuestCart();
            }

            const guestCart = readGuestCart();

            if (!guestCart.items.length) {
                return this.getCart();
            }

            for (const item of guestCart.items) {
                await axios.post('/api/tenant/cart/items', {
                    room_id        : item.room_id,
                    quantity       : item.quantity || 1,
                    stay_start_date: item.available_from || undefined,
                });
            }

            clearGuestCartStorage();

            return this.getCart();
        },

        async getCart() {
            if (!isLoggedIn()) {
                return readGuestCart();
            }

            const { data } = await axios.get('/api/tenant/cart');
            const cart = normalizeCart(data?.result?.cart || {});

            if (!cart.items.length && hasGuestCartItems()) {
                return this.syncGuestCartToServer();
            }

            return cart;
        },

        async addCartItem(payload) {
            if (!isLoggedIn()) {
                return addGuestCartItem(payload);
            }

            const { data } = await axios.post('/api/tenant/cart/items', payload);
            return normalizeCart(data?.result?.cart || {});
        },

        async updateCartItem(itemId, payload) {
            if (!isLoggedIn()) {
                return updateGuestCartItem(itemId, payload);
            }

            const { data } = await axios.patch(`/api/tenant/cart/items/${itemId}`, payload);
            return normalizeCart(data?.result?.cart || {});
        },

        async removeCartItem(itemId) {
            if (!isLoggedIn()) {
                return removeGuestCartItem(itemId);
            }

            const { data } = await axios.delete(`/api/tenant/cart/items/${itemId}`);
            return normalizeCart(data?.result?.cart || {});
        },

        async clearCart() {
            if (!isLoggedIn()) {
                return clearGuestCartStorage();
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
            if (isLoggedIn() && hasGuestCartItems()) {
                await this.syncGuestCartToServer();
            }

            const { data } = await axios.get('/api/tenant/checkout/context');

            return {
                tenant         : data?.result?.tenant || {},
                cart           : normalizeCart(data?.result?.cart || {}),
                payment_methods: data?.result?.payment_methods || [],
            };
        },

        async updateProfile(payload) {
            const { data } = await axios.put('/api/tenant/profile', payload);
            return data?.result?.tenant || {};
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
            return {
                profile   : normalizeDashboardProfile(data?.result?.profile || {}),
                rawProfile: data?.result?.profile || {},
            };
        },

        async createPaymentSession(bookingId, payload = { provider: 'stripe' }) {
            const { data } = await axios.post(`/api/tenant/bookings/${bookingId}/payment-sessions`, payload);
            return data?.result?.payment_session || {};
        },

        async confirmPayment(bookingId, payload) {
            const { data } = await axios.post(`/api/tenant/bookings/${bookingId}/payments/confirm`, payload);
            return data?.result?.booking || {};
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
