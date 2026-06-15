<template>
    <div id="offcanvas-menu" class="edmov-vue-mobile-popup-menu">
        <div class="mobile-menu-overlay"></div>
        <div class="inner">
            <ul class="edmov-mobile-menu mainmenu">

                <li v-for="(link, i) in menus" :key="i" @click="toggleSubmenu(i)">
                    <a :href="localePath(link.url)" v-if="link.url">
                        {{ link.title }}
                    </a>
                    <span v-else style="
                        padding: 7px 10px;
                        display: block;
                        font-size: 16px;
                        font-weight: 500;
                        color: #000 !important;
            ">
                        {{ link.title }}
                    </span>
                    <span class="submenu-toggle" v-if="link.submenu">
                        <i class="ri-arrow-down-s-line"></i>
                    </span>
                    <ul class="sub-submenu-m" v-if="link.isOpen">
                        <li v-for="(subLink, j) in link.submenu" :key="j" class="title">
                            <a :href="localePath(subLink.url)"> {{ subLink.title }} </a>
                        </li>
                    </ul>
                </li>

                <li v-if="!isLocale('ar')">
                    <span @click="switchLanguage('ar')" style="cursor: pointer;
                        padding: 7px 10px;
                        display: block;
                        font-size: 16px;
                        font-weight: 500;
                        color: #000 !important;
            ">
                        <img src="/img/home/fi-ss-globe.png" alt="Arabic" title="Arabic" style="width: 20px;">
                        {{ $t('header.arabic') }}
                    </span>
                </li>
                <li v-if="!isLocale('tr')">
                    <span @click="switchLanguage('tr')" style="cursor: pointer;
                        padding: 7px 10px;
                        display: block;
                        font-size: 16px;
                        font-weight: 500;
                        color: #000 !important;
            ">
                        <img src="/img/home/fi-ss-globe.png" alt="turkish" title="turkish" style="width: 20px;">
                        {{ $t('header.turkish') }}
                    </span>
                </li>
                <li v-if="!isLocale('en')">
                    <span @click="switchLanguage('en')" style="cursor: pointer;  padding: 7px 10px;
                        display: block;
                        font-size: 16px;
                        font-weight: 500;
                        color: #000 !important;
            ">
                        <img src="/img/home/fi-ss-globe.png" alt="English" title="English"
                            style="width: 20px;margin-bottom: 4px;">
                        {{ $t('header.arabic') }}
                    </span>
                </li>
                <a v-if="$auth.loggedIn" :href="localePath('/dashboard')" class="btn btn-primary w-100">
                    {{ $t('header.My_Account') }}
                </a>
                <a v-if="$auth.loggedIn" @click="logOut" class="btn btn-primary w-100 mt-2">
                    {{ $t('header.log_out') }}
                </a>
                <a v-else :href="localePath('/signin')" class="btn btn-primary w-100 ">
                    {{ $t('header.sign_in') }}
                </a>
                <a v-else :href="localePath('/signup')" class="btn btn-primary w-100 ">
                    {{ $t('header.sign_up') }}
                </a>
            </ul>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { clearPersistedAuthToken } from '@/utils/auth';

Vue.use(VueI18n);
export default {
    data() {
        return {
            openedSubmenus: [],
            menus: [
                {
                    isOpen: false,
                    key: "home",
                    url: this.$nuxt.localePath('/'),
                    title: this.$t('header.home')
                },
                {
                    isOpen: false,
                    key: "discoverRoom",
                    url: this.$nuxt.localePath('/accommodations'),
                    title: this.$t('header.discover_room')
                },
                {
                    isOpen: false,
                    key: "about_us",
                    url: this.$nuxt.localePath('/about-us'),
                    title: this.$t('header.about_us')
                },
                {
                    isOpen: false,
                    key: "about_us",
                    url: this.$nuxt.localePath('/contact-us'),
                    title: this.$t('header.contact_us')
                },
            ]
        }
    },

    methods: {
        toggleSubmenu(i) {
            this.menus[i].isOpen = !this.menus[i].isOpen;
        },
        isLocale(language) {
            return this.$i18n && this.$i18n.locale === language;
        },
        toggleMobileMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            const el = document.querySelector('#offcanvas-menu');
            el.classList.remove('active');
        },
        async switchLanguage(lang) {
            this.toggleMobileMenu();
            try {
                const currentPath = window.location.pathname;

                let newPath = currentPath;
                if (lang === 'ar') {
                    if (!currentPath.startsWith('/ar')) {
                        newPath = `/ar${currentPath}`;
                    }
                } else {
                    if (currentPath.startsWith('/ar')) {
                        newPath = currentPath.replace('/ar', '');
                    }
                }
                window.location.href = newPath;
            } catch (error) {
                // console.error('Error switching language:', error);
            }
        },

        async logOut() {
            this.toggleMobileMenu();
            clearPersistedAuthToken();
            await this.$auth.logout()
            localStorage.removeItem('mobile');
            window.location.href = this.$i18n.locale === 'en' ? '/' : `/${this.$i18n.locale}`;
        }
    }


};
</script>
