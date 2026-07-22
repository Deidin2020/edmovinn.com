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
                        <div class="space-y-6">
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
                                <PaymentMethod
                                    v-model="paymentForm"
                                    :available-methods="paymentMethods"
                                    :amount="checkoutAmount"
                                    :currency="checkoutCurrency" />
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
                                type="button" :disabled="submitting || loading" @click="submitCheckout">
                                {{ $t('pages.checkout.continue_button') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
// ISO 4217 numeric codes expected by the Kuveyt Turk VPos CurrencyCode field.
const KUVEYT_CURRENCY_CODES = {
    TRY: '0949',
    USD: '0840',
    EUR: '0978',
    GBP: '0826',
};

function splitPhoneNumber(value = '') {
    const normalized = String(value || '').replace(/\s+/g, '');
    const match = normalized.match(/^(\+\d{1,4})(\d{6,})$/);

    if (match) {
        return {
            phoneCountryCode: match[1],
            phoneNumber     : match[2],
        };
    }

    return {
        phoneCountryCode: '+90',
        phoneNumber     : normalized.replace(/\D+/g, ''),
    };
}

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
                phone_country_code: '+90',
                phone_number  : '',
                date_of_birth : '',
                university_name: '',
                nationality   : '',
                address       : '',
                bill_addr_line1   : '',
                bill_addr_city    : '',
                bill_addr_country : 'Turkey',
                bill_addr_post_code: '',
                bill_addr_state   : '',
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
                card            : {
                    holderName : '',
                    number     : '',
                    expireMonth: '',
                    expireYear : '',
                    cvv        : '',
                    type       : 'CreditCard',
                },
            },
        };
    },
    computed: {
        checkoutAmount() {
            return Number(
                this.cartData.summary?.grand_total
                || this.cartData.summary?.deposit_total
                || this.cartData.summary?.subtotal
                || 0
            );
        },
        checkoutCurrency() {
            return this.cartData.currency || 'TRY';
        },
        kuveytCurrencyCode() {
            return KUVEYT_CURRENCY_CODES[String(this.checkoutCurrency).toUpperCase()] || '';
        },
    },
    async mounted() {
        await this.loadCheckoutContext();
    },
    methods: {
        buildAbsoluteUrl(path) {
            if (typeof window === 'undefined') return path;

            return new URL(path, window.location.origin).toString();
        },
        normalizeGuestForm(profile = {}) {
            const mobileSource = profile.mobile || profile.phone || '';
            const phoneParts = splitPhoneNumber(mobileSource);

            return {
                ...this.guestForm,
                ...profile,
                mobile             : mobileSource,
                phone_country_code : profile.phone_country_code || phoneParts.phoneCountryCode || '+90',
                phone_number       : profile.phone_number || phoneParts.phoneNumber || '',
                bill_addr_line1    : profile.bill_addr_line1 || profile.address || '',
                bill_addr_city     : profile.bill_addr_city || '',
                bill_addr_country  : profile.bill_addr_country || 'Turkey',
                bill_addr_post_code: profile.bill_addr_post_code || '',
                bill_addr_state    : profile.bill_addr_state || '',
            };
        },
        normalizeCardYear(value = '') {
            const digits = String(value || '').replace(/\D+/g, '');

            if (digits.length === 4) {
                return digits.slice(-2);
            }

            return digits.slice(0, 2);
        },
        buildPaymentPhone() {
            const subscriber = (this.guestForm.phone_number || this.guestForm.mobile || '').replace(/\D+/g, '');

            return {
                phoneCountryCode: this.guestForm.phone_country_code || '+90',
                phoneNumber     : subscriber,
            };
        },
        validateKuveytForm() {
            const card = this.paymentForm.card || {};
            const phone = this.buildPaymentPhone();

            // Fail loudly instead of silently charging the customer in the wrong currency.
            if (!this.kuveytCurrencyCode) {
                throw new Error(`Currency ${this.checkoutCurrency} is not supported by the bank gateway.`);
            }

            const requiredEntries = [
                ['Card holder name', card.holderName],
                ['Card number', card.number],
                ['Expiry month', card.expireMonth],
                ['Expiry year', card.expireYear],
                ['CVV', card.cvv],
                ['Email', this.guestForm.email],
                ['Phone country code', phone.phoneCountryCode],
                ['Phone number', phone.phoneNumber],
                ['Billing address line 1', this.guestForm.bill_addr_line1 || this.guestForm.address],
                ['Billing city', this.guestForm.bill_addr_city],
                ['Billing state', this.guestForm.bill_addr_state],
                ['Billing post code', this.guestForm.bill_addr_post_code],
                ['Billing country', this.guestForm.bill_addr_country],
            ].filter(([, value]) => !value);

            if (requiredEntries.length) {
                throw new Error(`Please complete the required payment fields: ${requiredEntries.map(([label]) => label).join(', ')}.`);
            }
        },
        async redirectToHostedPayment(booking) {
            this.validateKuveytForm();
            const returnPath = this.localePath('/checkout/payment-return');
            const phone = this.buildPaymentPhone();
            const payload = {
                orderId        : booking.reference || `BOOKING-${booking.id}`,
                bookingId      : booking.id,
                amount         : booking.grand_total || booking.amount || this.checkoutAmount,
                currencyCode   : this.kuveytCurrencyCode,
                installmentCount: 0,
                frontendReturnUrl: this.buildAbsoluteUrl(`${returnPath}?booking_id=${booking.id}`),
                card           : {
                    ...this.paymentForm.card,
                    expireMonth: String(this.paymentForm.card.expireMonth || '').replace(/\D+/g, '').slice(0, 2),
                    expireYear : this.normalizeCardYear(this.paymentForm.card.expireYear),
                },
                customer: {
                    email           : this.guestForm.email,
                    phoneCountryCode: phone.phoneCountryCode,
                    phoneNumber     : phone.phoneNumber,
                    billAddrCity    : this.guestForm.bill_addr_city,
                    billAddrCountry : this.guestForm.bill_addr_country,
                    billAddrLine1   : this.guestForm.bill_addr_line1 || this.guestForm.address,
                    billAddrPostCode: this.guestForm.bill_addr_post_code,
                    billAddrState   : this.guestForm.bill_addr_state,
                },
            };

            // The middleware verifies this token against the booking API before it will
            // talk to the bank, so an unauthenticated caller cannot reach the gateway.
            const authToken = this.$auth?.strategy?.token?.get?.() || '';
            const response = await window.fetch('/api/kuveyt/start', {
                method     : 'POST',
                credentials: 'same-origin',
                headers    : {
                    'Content-Type': 'application/json',
                    Accept        : 'text/html,application/json',
                    ...(authToken ? { Authorization: authToken } : {}),
                },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get('content-type') || '';

            if (!response.ok) {
                if (contentType.includes('application/json')) {
                    const errorPayload = await response.json();
                    throw new Error(errorPayload.message || 'Unable to start Kuveyt payment.');
                }

                throw new Error('Unable to start Kuveyt payment.');
            }

            if (contentType.includes('text/html') || contentType.includes('text/xml') || contentType.includes('application/xml')) {
                const html = await response.text();

                document.open();
                document.write(html);
                document.close();
                return;
            }

            const data = await response.json();
            const redirectUrl = data.redirect_url || data.checkout_url || data.url;

            if (redirectUrl) {
                window.location.assign(redirectUrl);
                return;
            }

            throw new Error(data.message || 'Payment session did not provide a redirect document.');
        },
        async loadCheckoutContext() {
            this.loading = true;

            try {
                const context = await this.$bookingApi.getCheckoutContext();
                this.cartData = context.cart;
                this.paymentMethods = context.payment_methods || [];
                this.guestForm = this.normalizeGuestForm(context.tenant || {});

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

            try {
                if (!this.cartData.items?.length) {
                    throw new Error('Your cart is empty.');
                }

                if (this.paymentForm.method === 'bank_transfer' && !this.paymentForm.receipt_file) {
                    throw new Error('Please upload your bank transfer receipt before submitting the booking.');
                }

                await this.$bookingApi.validateCart();
                await this.$bookingApi.updateProfile(this.guestForm);

                const bookingPayload = {
                    cart_id           : this.cartData.id,
                    guest             : this.guestForm,
                    emergency_contact : this.emergencyContactForm,
                    payment_method    : this.paymentForm.method,
                    notes             : this.paymentForm.notes || undefined,
                };
                const bookingResult = await this.$bookingApi.createBooking(bookingPayload);

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
                    await this.redirectToHostedPayment(booking);
                    return;
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
