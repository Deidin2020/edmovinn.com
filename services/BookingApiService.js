function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;

    return Number(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
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

function normalizeDashboardMoney(value = {}) {
    if (typeof value === 'string') {
        return {
            amount   : toNumber(value),
            formatted: value,
            currency : '',
        };
    }

    return {
        amount   : value.amount ?? 0,
        formatted: value.formatted ?? '',
        currency : value.currency ?? '',
    };
}

function normalizeDashboardBooking(item = {}) {
    return {
        reference    : item.reference || '',
        date         : item.date || '',
        status       : item.status || '',
        statusLabel  : item.status_label || item.status || '',
        paymentStatus: item.payment_status_label || item.payment_status || '',
        total        : normalizeDashboardMoney(item.total).formatted,
        room         : item.room?.name || item.room_name || item.room || '',
        location     : item.location?.formatted || item.location || '',
        duration     : item.duration?.label || item.duration || '',
    };
}

function normalizeDashboardPayment(item = {}) {
    return {
        id        : item.id || '',
        title     : item.title || '',
        date      : item.date || '',
        amount    : normalizeDashboardMoney(item.amount).formatted,
        status    : item.status_label || item.status || '',
        badgeClass: item.status || '',
    };
}

function normalizeDashboardProfile(profile = {}) {
    return [
        { key: 'full_name', label: 'Full Name', value: profile.full_name || '' },
        { key: 'email', label: 'Email', value: profile.email || '' },
        { key: 'phone', label: 'Phone', value: profile.phone || '' },
        { key: 'university', label: 'University', value: profile.university || '' },
        { key: 'nationality', label: 'Nationality', value: profile.nationality || '' },
        { key: 'status', label: 'Profile Status', value: profile.status_label || '' },
    ];
}

function normalizeDashboardResponse(result = {}) {
    return {
        stats: {
            total_bookings : result.stats?.total_bookings ?? 0,
            active_bookings: result.stats?.active_bookings ?? 0,
            total_spent    : normalizeDashboardMoney(result.stats?.total_spent),
        },
        recent_bookings: Array.isArray(result.recent_bookings) ? result.recent_bookings.map(normalizeDashboardBooking) : [],
        bookings       : Array.isArray(result.bookings) ? result.bookings.map(normalizeDashboardBooking) : [],
        payments       : Array.isArray(result.payments) ? result.payments.map(normalizeDashboardPayment) : [],
        profile        : normalizeDashboardProfile(result.profile || {}),
        rawProfile     : result.profile || {},
    };
}

export default function createBookingApi(axios) {
    return {
        normalizeCart,
        normalizeDashboardResponse,

        async getCart() {
            const { data } = await axios.get('/api/tenant/cart');
            return normalizeCart(data?.result?.cart || {});
        },

        async addCartItem(payload) {
            const { data } = await axios.post('/api/tenant/cart/items', payload);
            return normalizeCart(data?.result?.cart || {});
        },

        async updateCartItem(itemId, payload) {
            const { data } = await axios.patch(`/api/tenant/cart/items/${itemId}`, payload);
            return normalizeCart(data?.result?.cart || {});
        },

        async removeCartItem(itemId) {
            const { data } = await axios.delete(`/api/tenant/cart/items/${itemId}`);
            return normalizeCart(data?.result?.cart || {});
        },

        async clearCart() {
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
