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

            <!-- Checkout Section -->
            <div class="max-w-4xl mx-auto px-4 py-8">
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
                                <PaymentMethod v-model="paymentForm" />
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
            loading: false,
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
        async loadCheckoutContext() {
            this.loading = true;

            try {
                const context = await this.$bookingApi.getCheckoutContext();
                this.cartData = context.cart;
                this.guestForm = {
                    ...this.guestForm,
                    ...context.tenant,
                };
            } catch (error) {
                this.$dangerAlert(error.response?.data?.message || this.$t('notification.error_occurred'));
            } finally {
                this.loading = false;
            }
        },
        async submitCheckout() {
            this.submitting = true;

            try {
                await this.$bookingApi.validateCart();
                await this.$bookingApi.updateProfile(this.guestForm);

                const bookingResult = await this.$bookingApi.createBooking({
                    cart_id           : this.cartData.id,
                    guest             : this.guestForm,
                    emergency_contact : this.emergencyContactForm,
                    payment_method    : this.paymentForm.method,
                    notes             : this.paymentForm.notes || undefined,
                });

                const booking = bookingResult.booking || {};

                if (!booking.id) {
                    throw new Error('Booking was created without an id.');
                }

                if (this.paymentForm.method === 'bank_transfer' && this.paymentForm.receipt_file) {
                    await this.$bookingApi.uploadBankTransferProof(booking.id, {
                        receipt_file    : this.paymentForm.receipt_file,
                        reference_number: this.paymentForm.reference_number,
                        notes           : this.paymentForm.notes,
                    });

                    this.$successAlert('Booking created and transfer proof uploaded successfully.');
                } else if (this.paymentForm.method === 'credit_card') {
                    const session = await this.$bookingApi.createPaymentSession(booking.id, { provider: 'stripe' });
                    const reference = booking.reference ? ` (${booking.reference})` : '';

                    this.$successAlert(`Booking created${reference}. Payment session initialized${session.id ? `: ${session.id}` : ''}.`);
                } else {
                    this.$successAlert('Booking created successfully.');
                }

                this.cartData = await this.$bookingApi.clearCart();
                window.dispatchEvent(new CustomEvent('cart-updated', {
                    detail: {
                        count: 0,
                        cart : this.cartData,
                    }
                }));
                window.location.href = this.localePath('/dashboard');
            } catch (error) {
                this.$dangerAlert(error.response?.data?.message || error.message || this.$t('notification.error_occurred'));
            } finally {
                this.submitting = false;
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
