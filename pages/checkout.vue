<template>
    <main class="flex-1 pt-16">
        <div class="min-h-screen bg-background ltr">
            <!-- Breadcrumb -->
            <div class="bg-white border-b border-border px-4 py-3">
                <div class="max-w-7xl mx-auto flex items-center gap-2">
                    <a class="text-muted-foreground hover:text-primary transition-colors" href="/cart">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-arrow-left w-4 h-4">
                            <path d="m12 19-7-7 7-7"></path>
                            <path d="M19 12H5"></path>
                        </svg>
                    </a>
                    <span class="text-muted-foreground">/</span>
                    <span class="text-foreground font-medium">
                        {{ $t('pages.checkout.breadcrumb_checkout') }}
                    </span>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="max-w-4xl mx-auto px-4 py-16 flex justify-center">
                <LoadingSpinner />
            </div>

            <!-- Checkout Section -->
            <div v-else class="max-w-4xl mx-auto px-4 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <SummaryOrder :cart-data="cartData" />
                    <div class="lg:col-span-2">
                        <form class="space-y-6" @submit.prevent="submitCheckout">
                            <!-- Payment Method -->
                            <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div class="flex flex-col space-y-1.5 p-6">
                                    <h3 class="text-2xl font-semibold leading-none tracking-tight">
                                        {{ $t('pages.checkout.payment_method_title') }}
                                    </h3>
                                    <p class="text-sm text-muted-foreground">
                                        {{ $t('pages.checkout.payment_method_description') }}
                                    </p>
                                </div>
                                <PaymentMethod v-model="paymentForm" :available-methods="paymentMethods" />
                            </div>

                            <!-- Personal Information -->
                            <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div class="flex flex-col space-y-1.5 p-6">
                                    <h3 class="text-2xl font-semibold leading-none tracking-tight">
                                        {{ $t('pages.checkout.personal_info_title') }}
                                    </h3>
                                    <p class="text-sm text-muted-foreground">
                                        {{ $t('pages.checkout.personal_info_description') }}
                                    </p>
                                </div>
                                <FormCheckout v-model="guestForm" />
                            </div>

                            <!-- Emergency Contact -->
                            <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div class="flex flex-col space-y-1.5 p-6">
                                    <h3 class="text-2xl font-semibold leading-none tracking-tight">
                                        {{ $t('pages.checkout.emergency_contact_title') }}
                                    </h3>
                                    <p class="text-sm text-muted-foreground">
                                        {{ $t('pages.checkout.emergency_contact_description') }}
                                    </p>
                                </div>
                                <EmergencyContact v-model="emergencyContactForm" />
                            </div>

                            <!-- Continue Button -->
                            <button
                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 w-full"
                                type="submit" :disabled="submitting || loading">
                                {{ $t('pages.checkout.continue_button') }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
export default {
    middleware: ['redirect-auth', 'verified', 'profile_completed'],
    data() {
        return {
            loading: true,
            submitting: false,
            cartData: {
                id      : null,
                items   : [],
                currency: '',
                summary : {
                    subtotal     : 0,
                    deposit_total: 0,
                    grand_total  : 0,
                }
            },
            paymentMethods: [],
            guestForm: {
                first_name    : '',
                last_name     : '',
                email         : '',
                mobile        : '',
                date_of_birth : '',
                university_name: '',
                nationality   : '',
                address       : '',
            },
            emergencyContactForm: {
                name    : '',
                phone   : '',
                relation: '',
            },
            paymentForm: {
                method          : 'pay_at_property',
                receipt_file    : null,
                reference_number: '',
                notes           : '',
            },
        };
    },
    async mounted() {
        await this.loadCheckoutContext();
    },
    methods: {
        buildAbsoluteUrl(path) {
            if (typeof window === 'undefined') return path;

            return new URL(path, window.location.origin).toString();
        },
        async redirectToHostedPayment(booking) {
            console.log('[Checkout] redirectToHostedPayment start', { booking });
            const returnPath = this.localePath('/checkout/payment-return');
            const payload = {
                provider  : 'kuveyt_turk',
                language  : this.$i18n?.locale || 'en',
                return_url: this.buildAbsoluteUrl(returnPath),
                cancel_url: this.buildAbsoluteUrl(returnPath),
                customer  : {
                    name : [this.guestForm.first_name, this.guestForm.last_name].filter(Boolean).join(' ').trim(),
                    email: this.guestForm.email,
                    phone: this.guestForm.mobile || this.guestForm.phone || '',
                },
            };
            console.log('[Checkout] createPaymentSession before', { bookingId: booking.id, payload });
            const paymentSession = await this.$bookingApi.createPaymentSession(booking.id, payload);
            console.log('[Checkout] createPaymentSession after', paymentSession);

            const redirectUrl = paymentSession.redirect_url || paymentSession.checkout_url || paymentSession.url;
            console.log('[Checkout] redirect URL resolved', { redirectUrl });

            if (redirectUrl) {
                const reference = booking.reference ? ` (${booking.reference})` : '';
                this.$successAlert(`Booking created${reference}. Redirecting to payment...`);
                console.log('[Checkout] redirecting browser', { redirectUrl });
                window.location.href = redirectUrl;
                return;
            }

            console.log('[Checkout] redirectToHostedPayment failed', paymentSession);
            throw new Error(
                paymentSession.backend_message
                || paymentSession.message
                || 'Payment session did not provide a redirect_url.'
            );
        },
        async loadCheckoutContext() {
            this.loading = true;

            try {
                const context = await this.$bookingApi.getCheckoutContext();
                this.cartData = context.cart;
                this.paymentMethods = context.payment_methods || [];
                this.guestForm = {
                    ...this.guestForm,
                    ...context.tenant,
                };

                if (this.paymentMethods.length && !this.paymentMethods.some(method => method.code === this.paymentForm.method)) {
                    this.paymentForm = {
                        ...this.paymentForm,
                        method: this.paymentMethods[0].code,
                    };
                }
            } catch (error) {
                this.$dangerAlert(error.response?.data?.message || this.$t('notification.error_occurred'));
            } finally {
                this.loading = false;
            }
        },
        async submitCheckout() {
            this.submitting = true;
            console.log('[Checkout] submitCheckout start', {
                cartId        : this.cartData.id,
                paymentMethod : this.paymentForm.method,
                guestForm     : this.guestForm,
                emergencyContactForm: this.emergencyContactForm,
            });

            try {
                if (!this.cartData.items?.length) {
                    throw new Error('Your cart is empty.');
                }

                if (this.paymentForm.method === 'bank_transfer' && !this.paymentForm.receipt_file) {
                    throw new Error('Please upload your bank transfer receipt before submitting the booking.');
                }

                console.log('[Checkout] validateCart before');
                await this.$bookingApi.validateCart();
                console.log('[Checkout] validateCart after');
                console.log('[Checkout] updateProfile before', this.guestForm);
                await this.$bookingApi.updateProfile(this.guestForm);
                console.log('[Checkout] updateProfile after');

                const bookingPayload = {
                    cart_id           : this.cartData.id,
                    guest             : this.guestForm,
                    emergency_contact : this.emergencyContactForm,
                    payment_method    : this.paymentForm.method,
                    notes             : this.paymentForm.notes || undefined,
                };
                console.log('[Checkout] createBooking before', bookingPayload);
                const bookingResult = await this.$bookingApi.createBooking(bookingPayload);
                console.log('[Checkout] createBooking response', bookingResult);

                const booking = bookingResult.booking || {};

                if (!booking.id) {
                    throw new Error('Booking was created without an id.');
                }

                if (this.paymentForm.method === 'bank_transfer' && this.paymentForm.receipt_file) {
                    console.log('[Checkout] uploadBankTransferProof before', { bookingId: booking.id });
                    await this.$bookingApi.uploadBankTransferProof(booking.id, {
                        receipt_file    : this.paymentForm.receipt_file,
                        reference_number: this.paymentForm.reference_number,
                        notes           : this.paymentForm.notes,
                    });
                    console.log('[Checkout] uploadBankTransferProof after');

                    this.$successAlert('Booking created and transfer proof uploaded successfully.');
                } else if (this.paymentForm.method === 'credit_card') {
                    console.log('[Checkout] credit card flow start', { booking });
                    await this.redirectToHostedPayment(booking);
                    return;
                } else {
                    this.$successAlert('Booking created successfully.');
                }

                console.log('[Checkout] clearCart before');
                this.cartData = await this.$bookingApi.clearCart();
                console.log('[Checkout] clearCart after', this.cartData);
                window.dispatchEvent(new CustomEvent('cart-updated', {
                    detail: {
                        count: 0,
                        cart : this.cartData,
                    }
                }));
                console.log('[Checkout] redirecting to dashboard');
                window.location.href = this.localePath('/dashboard');
            } catch (error) {
                console.log('[Checkout] submitCheckout error', {
                    message : error.message,
                    response: error.response?.data,
                    error,
                });
                this.$dangerAlert(error.response?.data?.message || error.message || this.$t('notification.error_occurred'));
            } finally {
                this.submitting = false;
                console.log('[Checkout] submitCheckout end', { submitting: this.submitting });
            }
        }
    },
    head() {
        return { title: this.$t('pages.checkout.breadcrumb_checkout') };
    }
};
</script>
<style>
[dir=rtl] .pl-4 {
    padding-right: 1rem;
}
</style>
