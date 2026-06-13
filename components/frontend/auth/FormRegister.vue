<template>
    <div class="space-y-4">
        <form @submit.prevent="submitRegisterForm()" class="space-y-4">
            <AppInput v-model="form.full_name" :error="errors && 'full_name' in errors ? errors['full_name'][0] : null"
                :label="$t('inputs.full_name')" icon="/img/auth/icon-user.svg" />
            <div class="space-y-2">
                <label class="text-sm font-medium leading-none">{{ $t('inputs.phone') }}</label>
                <vue-phone-number-input v-model="form.contact_number" :translations="translations" mode="international"
                    @update="updatePhoneNumber" :default-country-code="country_code" />

                <small v-if="errors && 'mobile' in errors" class="text-sm text-danger">
                    {{ errors['mobile'][0] }}
                </small>
            </div>
            <AppInput v-model="form.email" type="email" :error="errors && 'email' in errors ? errors['email'][0] : null"
                :label="$t('inputs.email')" icon="/img/auth/icon-email.svg" placeholder="Email@mail.com" />

            <AppInput v-model="form.password" :error="errors && 'password' in errors ? errors['password'][0] : null"
                :label="$t('inputs.password')" :type="passwordFieldType" icon="/img/auth/icon-password.svg" />

            <AppInput v-model="form.password_confirmation"
                :error="errors && 'password' in errors ? errors['password'][0] : null"
                :label="$t('inputs.password_confirmation')" :type="passwordConfirmationFieldType"
                icon="/img/auth/icon-password.svg" />

            <div class="form-group mt-4">
                <button
                    class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    type="submit" :disabled="disabledButton">
                    {{ $t('actions.sign_up') }}
                </button>
            </div>
        </form>

        <div class="primary-auth-container auth-register-footer">
            <div class="sign-helper text-center mt-3">
                <p>{{ $t('auth.do_have_account') }}
                    <NuxtLink :to="localePath('/auth')">
                        {{ $t('auth.sign_in') }}
                    </NuxtLink>
                </p>
            </div>

            <div class="auth-social-divider">
                <span>or</span>
            </div>

            <GoogleLogin />
        </div>
    </div>
</template>


<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    props: {
        apiUrl: {
            type: String,
            default: '/api/tenant/register'
        }
    },
    data() {
        return {
            alert_message: null,
            alert_type: null,
            sources: [],
            form: {
                full_name: null,
                email: null,
                password: null,
                password_confirmation: null,
                country_code: null,
                contact_number: null,
            },
            errors: {},
            passwordFieldType: 'password',
            passwordConfirmationFieldType: 'password',
            disabledButton: false,
            translations: {
                phoneNumberLabel: this.$t('inputs.phone_number_placeholder'),
            },
        }
    },
    methods: {
        ...mapActions('visitor', ['fetchVisitorInfo']),
        async finalizeAuthenticatedCart() {
            try {
                const cart = await this.$bookingApi.syncGuestCartToServer();

                window.dispatchEvent(new CustomEvent('cart-updated', {
                    detail: {
                        count: cart.items_count || 0,
                        cart,
                    }
                }));
            } catch (error) {
                this.$dangerAlert(error.response?.data?.message || this.$t('notification.error_occurred'));
            }
        },

        togglePasswordVisibility(fieldType) {
            this[fieldType] = this[fieldType] === 'password' ? 'text' : 'password';
        },
        async submitRegisterForm() {
            this.disabledButton = true;
            this.emptyInitialAlerts();

            await this.$axios.post('/api/tenant/register', this.form)
                .then((res) => {
                    console.log(res.data);
                    if (res.data.success) {

                        this.$successAlert(this.$t('notification.register_successfully'));

                        this.loginUser()
                            .then(async () => {
                                await this.finalizeAuthenticatedCart();
                                localStorage.setItem('mobile', this.form.mobile);
                                this.gotToVerifyPage();
                            })
                            .finally(() => {
                                this.disabledButton = false;
                            });
                    }
                }).catch((errors) => {
                    console.log(errors);
                    // 502 that's mean there is a problem with send OTP
                    if (errors.response.status === 502) {
                        this.loginUser()
                            .then(async () => {
                                await this.finalizeAuthenticatedCart();
                                localStorage.setItem('mobile', this.form.mobile);
                                this.gotToVerifyPage(errors.response.data.message);
                            })
                            .finally(() => {
                                this.disabledButton = false;
                            });
                        // this.gotToVerifyPage(errors.response.data.message);
                    } else if (errors.response.status === 422) {
                        this.errors = errors.response.data.errors;
                        this.disabledButton = false;
                    } else {
                        this.$dangerAlert(this.$t('notification.error_occurred'))
                        this.disabledButton = false;
                    }
                }
                )
                ;
        },
        gotToVerifyPage(message) {
            setTimeout(() => {
                this.$router.push({
                    path: this.localePath('/auth/verify'),
                    query: { mobile: this.form.mobile, error: message }
                });
            }, 2500);
        }
        ,
        resetFormData() {
            this.form = {
                full_name: null,
                email: null,
                password: null,
                password_confirmation: null,
                country_code: null,
                mobile: null,
                contact_number: null,
            };
        },
        emptyInitialAlerts() {
            this.alert_message = null;
            this.alert_type = null;
            this.errors = {};
        },
        updatePhoneNumber({ countryCode, formattedNumber }) {
            this.form.country_code = countryCode;
            this.form.mobile = formattedNumber;
        },
        async loginUser() {
            try {
                await this.$auth.loginWith('local', {
                    data: {
                        mobile: this.form.mobile,
                        password: this.form.password,
                    },
                });

                this.$successAlert(this.$t('notification.register_successfully'))
            } catch (error) {
                this.errors = error.response.data.errors;
                this.error = error.response.data.message;
                throw error;
            }
        }
    },
    async mounted() {
        await this.fetchVisitorInfo();
    },
    computed: {
        ...mapGetters({
            country_code: 'visitor/countryCode'
        })
    }
};
</script>

<style scoped>
.auth-register-footer {
    padding-top: 0.5rem;
}

.auth-social-divider {
    position: relative;
    margin: 1.5rem 0 1rem;
    text-align: center;
}

.auth-social-divider::before {
    position: absolute;
    inset-inline: 0;
    top: 50%;
    border-top: 1px solid #d7deeb;
    content: '';
}

.auth-social-divider span {
    position: relative;
    display: inline-block;
    padding: 0 0.85rem;
    background: #ffffff;
    color: #6b7280;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
</style>
