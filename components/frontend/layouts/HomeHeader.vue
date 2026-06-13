<template>
    <header class="bg-white shadow-sm border-b border-border fixed top-0 left-0 right-0 z-50 ltr">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <a class="flex-shrink-0" :href="localePath('/')">
                    <img src="/img/edmovinn-logo-Main.png" style="height: 50px;" alt="Movinn Logo"
                        class="h-10 w-auto object-contain" />
                </a>

                <!-- Navigation -->
                <nav class="hidden md:flex items-center space-x-4">
                    <a class="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                        :href="localePath('/')">
                        {{ $t('header.home') }}
                    </a>
                    <a class="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                        :href="localePath('/search')">
                        {{ $t('header.discover_room') }}
                    </a>
                    <a class="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                        :href="localePath('/about')">
                        {{ $t('header.about_us') }}
                    </a>
                    <a class="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                        :href="localePath('/contact')">
                        {{ $t('header.contact_us') }}
                    </a>
                </nav>
                <!-- Right Section -->
                <div class="hidden md:flex items-center space-x-3">
                    <!-- Dropdown Language -->
                    <div class="relative inline-block text-left">
                        <button @click="isLangOpen = !isLangOpen"
                            class="justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 flex items-center space-x-1"
                            type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-globe w-4 h-4">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                                <path d="M2 12h20"></path>
                            </svg>
                            <span class="text-sm">{{ $t('header.language') }}</span>
                        </button>

                        <!-- Dropdown Menu -->
                        <transition name="fade">
                            <div v-if="isLangOpen" @click.outside="isLangOpen = false"
                                class="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                <ul class="py-1 text-sm text-gray-700">
                                    <li>
                                        <a href="#" @click.prevent="switchLanguage('ar')"
                                            class="block px-4 py-2 hover:bg-gray-100">
                                            {{ $t('header.arabic') }}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" @click.prevent="switchLanguage('tr')"
                                            class="block px-4 py-2 hover:bg-gray-100">
                                            {{ $t('header.turkish') }}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" @click.prevent="switchLanguage('en')"
                                            class="block px-4 py-2 hover:bg-gray-100">
                                            {{ $t('header.english') }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </transition>
                    </div>

                    <!-- Buttons -->
                    <a
                        class="relative inline-flex items-center justify-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                        :href="localePath('/cart')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" class="lucide lucide-shopping-cart w-4 h-4">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path
                                d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12">
                            </path>
                        </svg>
                        <span
                            class="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {{ cartCount }}
                        </span>
                    </a>

                    <a
                        v-if="!isLoggedIn"
                        :href="localePath('/auth')"
                        class="inline-flex items-center justify-center gap-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                        {{ $t('header.sign_in') }}
                    </a>

                    <a
                        v-if="!isLoggedIn"
                        :href="localePath('/auth')"
                        class="inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                        {{ $t('header.sign_up') }}
                    </a>

                    <a
                        v-if="isLoggedIn"
                        :href="localePath('/dashboard')"
                        class="inline-flex items-center justify-center gap-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                        {{ $t('header.dashboard') }}
                    </a>

                    <button class=" inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md
                        px-3 bg-primary text-primary-foreground hover:bg-primary/90" @click="logOut"
                        v-if="isLoggedIn">
                        {{ $t('header.log_out') }}
                    </button>


                </div>

                <!-- Mobile Menu Toggle -->
                <button
                    class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    type="button"
                    :aria-expanded="isMobileMenuOpen"
                    @click="isMobileMenuOpen = !isMobileMenuOpen"
                >
                    <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-menu w-6 h-6">
                        <line x1="4" x2="20" y1="6" y2="6"></line>
                        <line x1="4" x2="20" y1="12" y2="12"></line>
                        <line x1="4" x2="20" y1="18" y2="18"></line>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-x w-6 h-6">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- Mobile Menu Panel -->
            <div v-if="isMobileMenuOpen" class="md:hidden border-t border-border py-3 space-y-1">
                <a class="block text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                    :href="localePath('/')" @click="isMobileMenuOpen = false">
                    {{ $t('header.home') }}
                </a>
                <a class="block text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                    :href="localePath('/search')" @click="isMobileMenuOpen = false">
                    {{ $t('header.discover_room') }}
                </a>
                <a class="block text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                    :href="localePath('/about')" @click="isMobileMenuOpen = false">
                    {{ $t('header.about_us') }}
                </a>
                <a class="block text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
                    :href="localePath('/contact')" @click="isMobileMenuOpen = false">
                    {{ $t('header.contact_us') }}
                </a>

                <div class="border-t border-border my-2"></div>

                <a class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    :href="localePath('/cart')" @click="isMobileMenuOpen = false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-shopping-cart w-4 h-4">
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                    </svg>
                    <span>{{ $t('header.cart') }} ({{ cartCount }})</span>
                </a>

                <div class="px-3 py-2 space-y-1">
                    <p class="text-xs font-medium text-muted-foreground mb-1">{{ $t('header.language') }}</p>
                    <div class="flex gap-2">
                        <button @click="switchLanguage('ar')"
                            class="text-sm px-3 py-1.5 rounded-md border border-input hover:bg-accent">
                            {{ $t('header.arabic') }}
                        </button>
                        <button @click="switchLanguage('tr')"
                            class="text-sm px-3 py-1.5 rounded-md border border-input hover:bg-accent">
                            {{ $t('header.turkish') }}
                        </button>
                        <button @click="switchLanguage('en')"
                            class="text-sm px-3 py-1.5 rounded-md border border-input hover:bg-accent">
                            {{ $t('header.english') }}
                        </button>
                    </div>
                </div>

                <div class="px-3 pt-2 space-y-2">
                    <a
                        v-if="!isLoggedIn"
                        :href="localePath('/auth')"
                        class="w-full inline-flex items-center justify-center gap-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                        @click="isMobileMenuOpen = false">
                        {{ $t('header.sign_in') }}
                    </a>

                    <a
                        v-if="!isLoggedIn"
                        :href="localePath('/auth')"
                        class="w-full inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                        @click="isMobileMenuOpen = false">
                        {{ $t('header.sign_up') }}
                    </a>

                    <a
                        v-if="isLoggedIn"
                        :href="localePath('/dashboard')"
                        class="w-full inline-flex items-center justify-center gap-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                        @click="isMobileMenuOpen = false">
                        {{ $t('header.dashboard') }}
                    </a>

                    <button class="w-full inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md
                        px-3 bg-primary text-primary-foreground hover:bg-primary/90" @click="logOut"
                        v-if="isLoggedIn">
                        {{ $t('header.log_out') }}
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>
<script>
export default {
    data() {
        return {
            isLangOpen: false,
            isMobileMenuOpen: false,
            cartCount: 0,
        }
    },
    computed: {
        isLoggedIn() {
            return this.$auth.loggedIn;
        },
    },
    mounted() {
        this.loadCartCount()

        this.handleCartUpdated = (e) => {
            this.cartCount = e.detail.count
        };

        window.addEventListener('cart-updated', this.handleCartUpdated)
    },
    beforeDestroy() {
        if (this.handleCartUpdated) {
            window.removeEventListener('cart-updated', this.handleCartUpdated);
        }
    },
    watch: {
        isLoggedIn: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.loadCartCount();
                    return;
                }

                this.cartCount = 0;
            },
        },
    },
    methods: {
        async logOut() {
            await this.$auth.logout();
                localStorage.removeItem('mobile');
                this.$successAlert(this.$t('notification.log_out'));
                await this.$router.replace(this.localePath('/'));
        },
        async loadCartCount() {
            try {
                const cart = await this.$bookingApi.getCart();
                this.cartCount = cart.items_count || 0;
            } catch (error) {
                this.cartCount = 0;
            }
        },
        async switchLanguage(lang) {
            this.isLangOpen = false
            localStorage.setItem('preferred_language', lang)

            let newPath = '/'
            if (lang === 'ar') newPath = '/ar'
            else if (lang === 'tr') newPath = '/tr'

            window.location.href = newPath
        },
    }
}
</script>
