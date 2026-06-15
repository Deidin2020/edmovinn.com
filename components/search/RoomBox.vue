<template>
    <div>
        <div
            class="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <a :href="localePath('/rooms/' + room.slug)">
                <div class="relative"><img :src="room.image ?? '/img/search/default-room.jpg'"
                        alt="Student Accommodation 7 Room 3 in Accommodation 7"
                        class="w-full h-40 sm:h-48 object-cover">
                    <div v-for="(gender, index) in room.gender_map"
                        class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 absolute top-2 left-2 text-xs bg-accommodation-female text-accommodation-female-text">
                        {{ gender.name }}
                    </div>
                </div>
            </a>
            <div class="p-3 sm:p-4">
                <h3 class="font-semibold text-base sm:text-lg mb-2 sm:mb-3 line-clamp-2">
                    <a :href="localePath('/rooms/' + room.slug)">
                        {{ room.name }}
                    </a>
                    in <a :href="localePath('/accommodations/' + room.accommodation?.slug)">
                        {{ room.accommodation?.name }}
                    </a>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                    <div class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-map-pin w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0">
                            <path
                                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0">
                            </path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg><span class="text-muted-foreground text-xs">{{ $t('accommodation.location') }}</span>
                    </div>
                    <div class="flex items-center gap-1 sm:hidden"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-maximize w-3 h-3 text-muted-foreground flex-shrink-0">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                            <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                            <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                            <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                        </svg><span class="text-muted-foreground text-xs">Size</span></div>
                    <div class="flex items-center gap-1 sm:hidden"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-calendar w-3 h-3 text-green-600 flex-shrink-0">
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                        </svg><span class="text-green-600 text-xs">{{ $t('accommodation.available_from') }}</span></div>
                    <div class="font-medium text-sm">{{ room.accommodation?.state }}</div>
                    <div class="hidden sm:flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-maximize w-4 h-4 text-muted-foreground">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                            <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                            <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                            <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                        </svg><span class="text-muted-foreground">{{ $t('accommodation.size') }}</span></div>
                    <div class="hidden sm:flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-calendar w-4 h-4 text-green-600">
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                        </svg><span class="text-green-600">{{ $t('accommodation.available_from') }}</span></div>
                    <div class="font-medium text-sm sm:hidden">{{ room.available_from }}</div>
                    <div class="font-medium text-sm sm:hidden">{{ room.size }}m²</div>

                    <div class="hidden sm:block font-medium">{{ room.available_from }}</div>
                    <div class="hidden sm:block font-medium">{{ room.size }}m²</div>

                </div>
                <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                    <div>
                        <span class="text-muted-foreground block text-xs">{{ $t('accommodation.price') }}</span>
                        <span class="font-bold text-base sm:text-lg">{{ room.price.price }} {{ room.price.currency }}
                            <span class="cost_type">
                                / {{ room.price.payment_per }}</span>
                        </span>
                    </div>
                    <div>
                        <span class="text-muted-foreground block text-xs">{{ $t('accommodation.deposit') }}</span>
                        <span class="font-medium text-sm">{{ room.price.deposit }} {{ room.price.currency }}</span>
                    </div>
                    <div>
                        <span class="text-muted-foreground block text-xs">{{ $t('accommodation.contract_type') }}</span>
                        <span class="font-medium text-sm truncate">{{ room.price.contract_type }}</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <div v-for="(facility, index) in displayedFacilities" :key="index"
                        class="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 bg-amenity-tag text-amenity-text text-xs px-2 py-1">
                        {{ facility.name }}
                    </div>
                    <button v-if="room.facilities.length > 3" @click="toggleFacilities" class="toggle-btn">
                        {{ showAll ? 'less' : 'more' }}
                    </button>
                </div>
                <div class="flex flex-col sm:flex-row gap-2">
                    <a class="flex-1" :href="localePath('/rooms/' + room.slug)">
                        <button
                            class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 w-full text-xs sm:text-sm">
                            {{ $t('actions.see_more') }} </button></a>
                    <button @click="addToCart(room)" :disabled="!room.availability"
                        class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 flex-1 text-xs sm:text-sm">
                        {{ room.availability ? $t('actions.book_now') : $t('actions.book_close') }}
                    </button>
                </div>
            </div>
        </div>

        <ApplyModal v-if="$auth.loggedIn" ref="applyModal" :room_id="selectedRoomId" :room_name="selectedRoomName" />
    </div>
</template>

<script>
import { setPostAuthRedirect } from '@/utils/authFlow';

export default {
    props: {
        room: Object,
    },
    data() {
        return {
            formErrors: null,
            selectedRoomId: null,
            selectedRoomName: null,
            showAll: false,
        };
    },
    computed: {
        displayedFacilities() {
            return this.showAll ? this.room.facilities : this.room.facilities.slice(0, 3);
        },
    },
    methods: {
        toggleFacilities() {
            this.showAll = !this.showAll;
        },
        async addToCart(room) {
            if (!room.availability) return;

            try {
                const cart = await this.$bookingApi.addCartItem({
                    room_id        : room.id,
                    quantity       : 1,
                    stay_start_date: room.available_from || undefined,
                    room,
                });

                window.dispatchEvent(new CustomEvent('cart-updated', {
                    detail: {
                        count: cart.items_count || 0,
                        cart,
                    }
                }));

                this.$successAlert(this.$t('notification.added_to_cart'));
            } catch (error) {
                this.$dangerAlert(error.response?.data?.message || this.$t('notification.error_occurred'));
            }
        },

        openModal(roomId, roomName) {
            if (!this.$auth.loggedIn) {
                setPostAuthRedirect(this.$route.fullPath);
                this.$router.push(this.localePath({ path: '/auth', query: { tab: 'signup' } }));
                return;
            }

            if (this.$refs.applyModal?.$refs.myModal) {
                this.selectedRoomId = roomId;
                this.selectedRoomName = roomName;
                this.$refs.applyModal.$refs.myModal.show();
            }
        },
        sendWhatsAppMessage(room) {
            if (!room.availability) return;

            const phoneNumber = "905550772000";

            const message = this.$t('whatsapp.message', {
                room: room.name,
                accommodation: room.accommodation?.name || 'N/A',
                location: room.accommodation?.state || 'N/A',
                price: room.price?.price,
                currency: room.price?.currency,
                payment_per: room.price?.payment_per,
                deposit: room.price?.deposit,
                available_from: room.available_from,
                size: room.size
            });

            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, "_blank");
        }
    },
};
</script>
<style>
.cost_type {
    color: #848484;
    font-weight: 400;
    font-size: 11px;
}
</style>
