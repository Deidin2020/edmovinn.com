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
                    <a class="relative" :href="localePath('/cart')">
                        <button
                            class="inline-flex items-center justify-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
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
                        </button>
                    </a>

                    <a :href="localePath('/auth')" v-if="!$auth.loggedIn">
                        <button class=" inline-flex items-center justify-center gap-2 text-sm font-medium border
                        border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                            {{ $t('header.sign_in') }}
                        </button>
                    </a>

                    <a :href="localePath('/auth')" v-if="!$auth.loggedIn">
                        <button class=" inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md
                        px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                            {{ $t('header.sign_up') }}
                        </button>
                    </a>


                    <a :href="localePath('/dashboard')" v-if="$auth.loggedIn">
                        <button class=" inline-flex items-center justify-center gap-2 text-sm font-medium border
                        border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                            {{ $t('header.dashboard') }}
                        </button>
                    </a>

                    <button class=" inline-flex items-center justify-center gap-2 text-sm font-medium h-9 rounded-md
                        px-3 bg-primary text-primary-foreground hover:bg-primary/90" @click="logOut"
                        v-if="$auth.loggedIn">
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
            cartCount: 0,
        }
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
    methods: {
        logOut() {
            this.$auth.logout().then(() => {
                localStorage.removeItem('mobile');
                this.$successAlert(this.$t('notification.log_out'));
                setTimeout(() => {
                    window.location.href = this.$i18n.locale === 'en' ? '/' : `/${this.$i18n.locale}`;
                }, 1000)
            })
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
