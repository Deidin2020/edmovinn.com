<template>
    <footer class="bg-secondary text-white py-8 ltr">
        <div class="max-w-6xl mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <!-- Logo and Description -->
                <div class="space-y-3">
                    <img src="/img/edmovinn-logo-White.png" alt="Movinn Logo" style="height: 70px;"
                        class="h-8 w-auto object-contain brightness-200">
                    <p class="text-sm text-white/80">{{ $t('footer.description') }}</p>
                </div>

                <!-- Quick Links -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-white" style="min-height: 26px;">{{ $t('footer.quickLinksTitle') }}
                    </h4>
                    <div class="space-y-2">
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            :href="localePath('/')">{{
                                $t('header.home') }}</a>
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            :href="localePath('/search')">{{
                                $t('header.discover_room') }}</a>
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            :href="localePath('/about')">{{
                                $t('header.about_us') }}</a>
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            :href="localePath('/contact')">{{
                                $t('header.contact_us') }}</a>
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            href="/documents/movinn-housing-contract-and-regulations-2026-09-15.pdf"
                            target="_blank" rel="noopener noreferrer" type="application/pdf">
                            {{ $t('footer.housingContract') }}</a>
                    </div>
                </div>

                <!-- Contact Info -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-white">{{ $t('header.contact_us') }}</h4>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2 text-sm text-white/80">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-mail w-4 h-4">
                                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                            </svg>
                            <span>{{ $t('footer.contact.email') }}</span>
                        </div>

                        <div class="flex items-center gap-2 text-sm text-white/80">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-phone w-4 h-4">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2
                  19.79 19.79 0 0 1-8.63-3.07
                  19.5 19.5 0 0 1-6-6
                  19.79 19.79 0 0 1-3.07-8.67
                  A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72
                  12.84 12.84 0 0 0 .7 2.81
                  2 2 0 0 1-.45 2.11L8.09 9.91
                  a16 16 0 0 0 6 6l1.27-1.27
                  a2 2 0 0 1 2.11-.45
                  12.84 12.84 0 0 0 2.81.7
                  A2 2 0 0 1 22 16.92z">
                                </path>
                            </svg>
                            <span style="
    direction: ltr;
    text-align: left;
">{{ $t('footer.contact.phone') }}</span>
                        </div>

                        <div class="flex items-center gap-2 text-sm text-white/80">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-map-pin w-4 h-4">
                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799
                  a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10
                  a8 8 0 0 1 16 0">
                                </path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{{ $t('footer.contact.address') }}</span>
                        </div>
                    </div>
                </div>

                <!-- Languages -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-white">{{ $t('header.language') }}</h4>
                    <div class="space-y-2">
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            :href="localePath('/tr')">{{
                                $t('header.turkish') }}</a>
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            :href="localePath('/ar')">{{
                                $t('header.arabic') }}</a>
                        <a class="block text-sm text-white/80 hover:text-white transition-colors"
                            :href="localePath('/')">{{
                                $t('header.english') }}</a>
                    </div>
                </div>
            </div>

            <!-- Footer Bottom -->
            <div class="border-t border-white/20 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center">
                <p class="text-sm text-white/60">{{ $t('footer.rights') }}</p>
                <p class="text-sm text-white/60 flex items-center gap-1">
                    {{ $t('footer.madeWith') }}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-heart w-4 h-4 text-red-400">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5
              A5.5 5.5 0 0 0 16.5 3
              c-1.76 0-3 .5-4.5 2
              -1.5-1.5-2.74-2-4.5-2
              A5.5 5.5 0 0 0 2 8.5
              c0 2.3 1.5 4.05 3 5.5l7 7Z">
                        </path>
                    </svg>
                </p>
            </div>
        </div>
        <WhatsappIcon />
    </footer>
</template>


<script>
import WhatsappIcon from '@/components/frontend/layouts/WhatsappIcon.vue'
export default {
    components: {
        WhatsappIcon,
    },
    data() {
        return {
            newsletter_form: {
                email: null,
            },
            alert_type: null,
            alert_message: null,
            where_studies: []
        };
    },
    created() {
    },
    methods: {

        async newsLetterSubscribe() {
            await this.$axios
                .post('/api/website/subscribe_news_letter', this.newsletter_form)
                .then((res) => {
                    this.alert_message = res.data.message;
                    this.alert_type = res.data.success ? 'alert-success' : 'alert-danger';
                })
                .catch((e) => {
                    if (e.response) {
                        this.alert_message = e.response.data.errors && e.response.data.errors.email ? e.response.data.errors.email[0] : e.response.data.message;
                        this.alert_type = e.response.data.success ? 'alert-success' : 'alert-danger';
                    }
                });

            setTimeout(() => {
                this.alert_message = null;
                this.alert_type = null;
            }, 5000);
        },
    },
};
</script>
