<template>
    <main class="flex-1 pt-16">
        <div class="min-h-screen bg-background flex items-center justify-center p-4">
            <div class="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">
                <div class="flex flex-col space-y-1.5 p-6 text-center">
                    <h3 class="tracking-tight text-2xl font-bold">{{ $t('auth.welcome') }}</h3>
                    <p class="text-sm text-muted-foreground">{{ $t('auth.subtitle') }}</p>
                </div>
                <div class="p-6 pt-0">
                    <div dir="ltr" class="space-y-4">
                        <div role="tablist" aria-orientation="horizontal"
                            class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2">
                            <button type="button" role="tab" :aria-selected="activeTab === 'signin'"
                                :aria-controls="'tabpanel-signin'"
                                :data-state="activeTab === 'signin' ? 'active' : 'inactive'" :id="'trigger-signin'"
                                @click="activeTab = 'signin'" :tabindex="activeTab === 'signin' ? 0 : -1"
                                class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                                {{ $t('auth.sign_in') }}
                            </button>

                            <button type="button" role="tab" :aria-selected="activeTab === 'signup'"
                                :aria-controls="'tabpanel-signup'"
                                :data-state="activeTab === 'signup' ? 'active' : 'inactive'" :id="'trigger-signup'"
                                @click="activeTab = 'signup'" :tabindex="activeTab === 'signup' ? 0 : -1"
                                class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                                {{ $t('auth.sign_up') }}
                            </button>
                        </div>

                        <!-- Sign In Panel -->
                        <div role="tabpanel" :aria-labelledby="'trigger-signin'" id="tabpanel-signin" tabindex="0"
                            v-show="activeTab === 'signin'"
                            class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <div class="space-y-4">
                                <form class="space-y-4">
                                    <div class="space-y-2"> <label>{{ $t('inputs.phone') }}</label>

                                        <vue-phone-number-input v-model="form.contact_number"
                                            :default-country-code="country_code" :placeholder="$t('inputs.phone')"
                                            mode="international" :translations="translations"
                                            @update="updatePhoneNumber" />

                                        <small v-if="errors && 'mobile' in errors" class="text-sm text-danger">
                                            {{ errors['mobile'][0] }}
                                        </small>
                                    </div>

                                    <AppInput v-model="form.password"
                                        :error="errors && 'password' in errors ? errors['password'][0] : null"
                                        :label="$t('inputs.password')" icon="/img/auth/icon-password.svg"
                                        type="password" />

                                    <small v-if="error" class="text-sm text-danger">
                                        {{ error }}
                                    </small>
                                    <div class=" space-y-4" style="
    display: flex;
    align-items: center;
    justify-content: space-between;
">
                                        <div class="edu-form-check">
                                            <input id="remember-me" v-model="form.remember_me" type="checkbox">
                                            <label for="remember-me">{{ $t('auth.remember_me') }}</label>
                                        </div>
                                        <NuxtLink class="password-reset" :to="localePath('/auth/forgot-password')">{{
                                            $t('auth.forget_password') }}
                                        </NuxtLink>
                                    </div>

                                    <div class="form-group space-y-4">
                                        <button
                                            class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                                            type="button" @click="login">
                                            {{ $t('actions.login') }}
                                        </button>
                                    </div>
                                </form>
                                <div class="primary-auth-container auth-social-block">
                                    <div class="auth-social-divider">
                                        <span>or</span>
                                    </div>

                                    <GoogleLogin />

                                    <div class="sign-helper text-center mt-3">
                                        <p>{{ $t('auth.have_account') }}
                                            <NuxtLink :to="localePath({ path: '/auth', query: { tab: 'signup' } })">{{ $t('auth.sing_up') }}
                                            </NuxtLink>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div role="tabpanel" :aria-labelledby="'trigger-signup'" id="tabpanel-signup" tabindex="0"
                            v-show="activeTab === 'signup'"
                            class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <div class="space-y-4">
                                <FormRegister />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import { consumePostAuthRedirect, resolvePostAuthRedirect } from '@/utils/authFlow';

import { mapActions, mapGetters } from 'vuex';
export default {
    middleware: ['guest'],
    data() {
        return {
            activeTab: 'signin',
            method: 'email',
            sources: null,
            form: {
                email: null,
                password: null,
                remember_me: null,
                mobile: null,
            },
            errors: {},
            error: null,
            showPassword: false,
            translations: {
                phoneNumberLabel: this.$t('inputs.phone_number_placeholder'),
            },
        }
    },
    watch: {
        '$route.query.tab': {
            immediate: true,
            handler() {
                this.syncActiveTabWithRoute();
            },
        },
    },
    mounted() {
        this.fetchVisitorInfo();
        this.handleTokenLogin();
    },
    methods: {
        ...mapActions('visitor', ['fetchVisitorInfo']),
        syncActiveTabWithRoute() {
            const requestedTab = String(this.$route.query.tab || '').toLowerCase();

            if (requestedTab === 'signup') {
                this.activeTab = 'signup';
                return;
            }

            if (requestedTab === 'signin') {
                this.activeTab = 'signin';
            }
        },
        async handleTokenLogin() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!token) return;

            try {
                await this.$auth.setUserToken(token);
                await this.$auth.fetchUser();
                await this.finalizeLogin();
            } catch (error) {
                this.error = error.response?.data?.message || this.$t('notification.error_occurred');
            }
        },
        async finalizeLogin() {
            try {
                const cart = await this.$bookingApi.syncGuestCartToServer();

                window.dispatchEvent(new CustomEvent('cart-updated', {
                    detail: {
                        count: cart.items_count || 0,
                        cart,
                    }
                }));
            } catch (error) {
                // Keep login flow resilient even if cart sync fails.
            }

            const destination = resolvePostAuthRedirect({
                redirectPath: consumePostAuthRedirect(),
                locale      : this.$i18n.locale,
                localePath  : this.localePath,
                fallback    : '/dashboard',
            });

            await this.$router.replace(destination);
        },
        async login() {
            this.error = null;
            this.errors = {};

            try {
                await this.$auth.loginWith('local', {
                    data: this.form,
                });

                await this.$auth.fetchUser();
                localStorage.setItem('mobile', this.form.mobile);
                this.$successAlert(this.$t('notification.login_successfully'));

                await this.finalizeLogin();
            } catch (errors) {
                if (errors.response?.status === 422) {
                    this.errors = errors.response.data.errors;
                } else {
                    this.$dangerAlert(errors.response?.data?.message ?? this.$t('notification.error_occurred'));
                }
            }
        },
        updatePhoneNumber({ countryCode, formattedNumber }) {
            this.form.country_code = countryCode;
            this.form.mobile = formattedNumber;
        },
    },
    computed: {
        ...mapGetters({
            country_code: 'visitor/countryCode'
        })
    }
};
</script>
<style>
input[type="tel"] {
    margin-top: calc(.5rem * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(.5rem * var(--tw-space-y-reverse));

    /* typography */
    font-size: 1rem;
    line-height: 1.5rem;
    font-family: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    color: inherit;

    /* padding */
    padding-top: .5rem;
    padding-bottom: .5rem;
    padding-left: .75rem;
    padding-right: .75rem;

    /* background & border */
    background-color: hsl(var(--background));
    border-color: hsl(var(--input));
    border-width: 1px;
    border-radius: calc(var(--radius) - 2px);

    /* size */
    width: 100%;
    height: 2.5rem;

    /* display */
    display: flex;

    /* remove default input/button styles */
    margin: 0;
    padding: 0;
}

.auth-social-block {
    padding-top: 0.5rem;
}

.auth-social-divider {
    position: relative;
    margin: 1rem 0 1rem;
    text-align: center;
}

.auth-social-divider::before {
    position: absolute;
    inset-inline: 0;
    top: 50%;
    border-top: 1px solid hsl(var(--input));
    content: '';
}

.auth-social-divider span {
    position: relative;
    display: inline-block;
    padding: 0 0.85rem;
    background: hsl(var(--background));
    color: hsl(var(--muted-foreground));
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
</style>
