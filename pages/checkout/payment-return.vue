<template>
    <main class="payment-return-page">
        <div class="payment-return-shell">
            <div class="payment-return-card">
                <p class="eyebrow">Payment Return</p>
                <h1>Checking your payment result</h1>
                <p class="intro">
                    We are confirming the payment result with our backend before finalizing your checkout.
                </p>

                <div v-if="loading" class="status-card status-pending">
                    <div class="spinner" />
                    <h2>Please wait</h2>
                    <p>We are verifying the payment with Kuveyt Turk.</p>
                </div>

                <div v-else-if="status === 'paid'" class="status-card status-success">
                    <h2>Payment completed successfully</h2>
                    <p>{{ message }}</p>

                    <div class="status-grid">
                        <div class="status-row">
                            <span>Booking ID</span>
                            <strong>{{ paymentDetails.booking_id || bookingId }}</strong>
                        </div>
                        <div class="status-row" v-if="paymentDetails.booking_reference">
                            <span>Booking Reference</span>
                            <strong>{{ paymentDetails.booking_reference }}</strong>
                        </div>
                        <div class="status-row" v-if="paymentDetails.payment_id">
                            <span>Payment ID</span>
                            <strong>{{ paymentDetails.payment_id }}</strong>
                        </div>
                        <div class="status-row" v-if="paymentDetails.provider_order_id">
                            <span>Order ID</span>
                            <strong>{{ paymentDetails.provider_order_id }}</strong>
                        </div>
                        <div class="status-row" v-if="paymentDetails.provider_transaction_id">
                            <span>Transaction ID</span>
                            <strong>{{ paymentDetails.provider_transaction_id }}</strong>
                        </div>
                    </div>

                    <div class="actions">
                        <button type="button" class="btn-primary" @click="goToDashboard">Go to Dashboard</button>
                    </div>
                </div>

                <div v-else-if="status === 'pending'" class="status-card status-pending">
                    <h2>Payment is still pending</h2>
                    <p>{{ message }}</p>

                    <div class="actions">
                        <button type="button" class="btn-secondary" @click="confirmPaymentStatus" :disabled="retrying">
                            {{ retrying ? 'Refreshing...' : 'Refresh Status' }}
                        </button>
                        <button type="button" class="btn-primary" @click="goToCheckout">Back to Checkout</button>
                    </div>
                </div>

                <div v-else class="status-card status-error">
                    <h2>Payment could not be confirmed</h2>
                    <p>{{ message }}</p>

                    <div class="status-grid" v-if="paymentDetails.provider_order_id || paymentDetails.provider_transaction_id">
                        <div class="status-row" v-if="paymentDetails.provider_order_id">
                            <span>Order ID</span>
                            <strong>{{ paymentDetails.provider_order_id }}</strong>
                        </div>
                        <div class="status-row" v-if="paymentDetails.provider_transaction_id">
                            <span>Transaction ID</span>
                            <strong>{{ paymentDetails.provider_transaction_id }}</strong>
                        </div>
                    </div>

                    <div class="actions">
                        <button type="button" class="btn-secondary" @click="confirmPaymentStatus" :disabled="retrying">
                            {{ retrying ? 'Refreshing...' : 'Refresh Status' }}
                        </button>
                        <button type="button" class="btn-primary" @click="goToCheckout">Back to Checkout</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
function readQueryValue(value) {
    if (Array.isArray(value)) {
        return value.find(item => item !== null && item !== undefined && item !== '') || '';
    }

    return value || '';
}

export default {
    middleware: ['redirect-auth', 'verified', 'profile_completed'],
    layout: 'blank',
    data() {
        return {
            loading      : true,
            retrying     : false,
            status       : 'pending',
            message      : 'Checking payment status...',
            paymentDetails: {},
        };
    },
    computed: {
        bookingId() {
            return readQueryValue(this.$route.query.booking_id);
        },
        paymentId() {
            return readQueryValue(this.$route.query.payment_id);
        },
        providerOrderId() {
            return readQueryValue(this.$route.query.order_id)
                || readQueryValue(this.$route.query.provider_order_id);
        },
        providerTransactionId() {
            return readQueryValue(this.$route.query.transaction_id)
                || readQueryValue(this.$route.query.provider_transaction_id);
        },
    },
    async mounted() {
        console.log('[PaymentReturn] mounted', { query: this.$route.query });
        await this.confirmPaymentStatus();
    },
    methods: {
        async clearCartAndBroadcast() {
            console.log('[PaymentReturn] clearCartAndBroadcast start');
            const clearedCart = await this.$bookingApi.clearCart();
            console.log('[PaymentReturn] clearCartAndBroadcast response', clearedCart);

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('cart-updated', {
                    detail: {
                        count: 0,
                        cart : clearedCart,
                    }
                }));
            }
        },
        normalizeConfirmResult(result = {}) {
            const booking = result.booking || {};
            const payment = result.payment || {};
            const paymentStatus = payment.status || booking.payment_status || result.status || 'pending';

            this.paymentDetails = {
                booking_id              : booking.id || this.bookingId || '',
                booking_reference       : booking.reference || '',
                payment_id              : payment.id || this.paymentId || '',
                provider_order_id       : payment.provider_order_id || this.providerOrderId || '',
                provider_transaction_id : payment.provider_transaction_id || this.providerTransactionId || '',
            };

            this.status = paymentStatus;
            this.message = result.message
                || payment.failure_message
                || 'Payment status fetched successfully.';
            console.log('[PaymentReturn] normalizeConfirmResult', {
                status        : this.status,
                message       : this.message,
                paymentDetails: this.paymentDetails,
                rawResult     : result,
            });
        },
        async confirmPaymentStatus() {
            console.log('[PaymentReturn] confirmPaymentStatus start', {
                bookingId             : this.bookingId,
                paymentId             : this.paymentId,
                providerOrderId       : this.providerOrderId,
                providerTransactionId : this.providerTransactionId,
                query                 : this.$route.query,
            });
            if (!this.bookingId) {
                this.status = 'failed';
                this.message = 'Missing booking_id in the payment return URL.';
                this.loading = false;
                console.log('[PaymentReturn] confirmPaymentStatus aborted', {
                    status : this.status,
                    message: this.message,
                });
                return;
            }

            const payload = {
                provider               : 'kuveyt_turk',
                payment_id             : this.paymentId || undefined,
                provider_order_id      : this.providerOrderId || undefined,
                provider_transaction_id: this.providerTransactionId || undefined,
                gateway_status         : this.$route.query.status || undefined,
                gateway_message        : this.$route.query.message || undefined,
                gateway_payload        : this.$route.query || undefined,
            };
            console.log('[PaymentReturn] confirmPayment before', payload);

            this.retrying = !this.loading;

            try {
                const result = await this.$bookingApi.confirmPayment(this.bookingId, payload);
                console.log('[PaymentReturn] confirmPayment response', result);
                this.normalizeConfirmResult(result);

                if (this.status === 'paid') {
                    await this.clearCartAndBroadcast();

                    if (typeof this.$successAlert === 'function') {
                        this.$successAlert(this.message || 'Payment confirmed successfully.');
                    }
                } else if (this.status === 'failed' && typeof this.$dangerAlert === 'function') {
                    this.$dangerAlert(this.message || 'Payment failed.');
                }
            } catch (error) {
                console.log('[PaymentReturn] confirmPayment error', {
                    message : error.message,
                    response: error.response?.data,
                    error,
                });
                const response = error.response?.data || {};
                const result = response.result || {};

                if (result.payment || result.booking) {
                    this.normalizeConfirmResult(result);
                } else {
                    this.status = 'failed';
                }

                this.message = response.message || error.message || this.$t('notification.error_occurred');
            } finally {
                this.loading = false;
                this.retrying = false;
                console.log('[PaymentReturn] confirmPaymentStatus end', {
                    status       : this.status,
                    message      : this.message,
                    loading      : this.loading,
                    retrying     : this.retrying,
                    paymentDetails: this.paymentDetails,
                });
            }
        },
        goToDashboard() {
            this.$router.push(this.localePath('/dashboard'));
        },
        goToCheckout() {
            this.$router.push(this.localePath('/checkout'));
        },
    },
    head() {
        return {
            title: 'Payment Return',
        };
    },
};
</script>

<style scoped>
.payment-return-page {
    min-height: 100vh;
    background: #f5f7fb;
    padding: 40px 16px;
}

.payment-return-shell {
    margin: 0 auto;
    max-width: 760px;
}

.payment-return-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
    padding: 30px;
}

.eyebrow {
    color: #0f766e;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin: 0 0 8px;
    text-transform: uppercase;
}

.payment-return-card h1 {
    color: #0f172a;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    line-height: 1.1;
    margin: 0 0 10px;
}

.intro {
    color: #475569;
    margin: 0 0 22px;
}

.status-card {
    border-radius: 18px;
    padding: 22px;
}

.status-card h2 {
    margin: 0 0 8px;
}

.status-card p {
    margin: 0;
}

.status-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
}

.status-pending {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #334155;
}

.status-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
}

.status-grid {
    display: grid;
    gap: 12px;
    margin-top: 18px;
}

.status-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
}

.status-row span {
    color: inherit;
    opacity: 0.8;
}

.status-row strong {
    color: inherit;
    text-align: right;
    word-break: break-word;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
}

.btn-primary,
.btn-secondary {
    border-radius: 14px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 700;
    min-height: 48px;
    padding: 0 18px;
}

.btn-primary {
    background: #0f766e;
    border: none;
    color: #fff;
}

.btn-secondary {
    background: transparent;
    border: 1px solid currentColor;
    color: inherit;
}

.btn-primary:disabled,
.btn-secondary:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}

.spinner {
    animation: spin 0.9s linear infinite;
    border: 3px solid rgba(15, 118, 110, 0.15);
    border-top-color: #0f766e;
    border-radius: 999px;
    height: 28px;
    margin-bottom: 14px;
    width: 28px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 640px) {
    .payment-return-card {
        border-radius: 18px;
        padding: 22px;
    }

    .status-row {
        align-items: flex-start;
        flex-direction: column;
    }

    .status-row strong {
        text-align: left;
    }
}
</style>
