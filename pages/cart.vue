<template>
  <main class="flex-1 pt-16">
    <div class="min-h-screen bg-background">
      <!-- Breadcrumb -->
      <div class="bg-white border-b border-border px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center gap-2">
          <a class="text-muted-foreground hover:text-primary transition-colors" href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-arrow-left w-4 h-4">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
          </a>
          <span class="text-muted-foreground">/</span>
          <span class="text-foreground font-medium">{{ $t('cart.breadcrumb_cart') }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner />
      </div>

      <!-- Empty cart -->
      <div v-else-if="!cart.length" class="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-shopping-cart w-16 h-16 text-muted-foreground mx-auto mb-4">
          <circle cx="8" cy="21" r="1"></circle>
          <circle cx="19" cy="21" r="1"></circle>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
        </svg>
        <h2 class="text-2xl font-semibold text-foreground mb-2">{{ $t('cart.empty_title') }}</h2>
        <p class="text-muted-foreground mb-8">{{ $t('cart.empty_description') }}</p>
        <a href="/">
          <button
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8 bg-primary text-primary-foreground hover:bg-primary/90">
            {{ $t('cart.browse_button') }}
          </button>
        </a>
      </div>

      <!-- Cart items -->
      <div v-else class="max-w-7xl mx-auto px-4 py-8">
        <!-- Desktop Header -->
        <div class="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-secondary/10 rounded-t-lg border-b border-border">
          <div class="col-span-5 font-semibold text-foreground"> {{ $t('cart.Accommodation / Location') }}</div>
          <div class="col-span-2 font-semibold text-foreground text-center"> {{ $t('cart.Price') }}</div>
          <div class="col-span-2 font-semibold text-foreground text-center"> {{ $t('cart.Deposit') }}</div>
          <div class="col-span-2 font-semibold text-foreground text-center"> {{ $t('cart.Quantity') }}</div>
          <div class="col-span-1 font-semibold text-foreground text-center"> {{ $t('cart.Total') }}</div>
        </div>

        <!-- Items -->
        <div class="bg-white rounded-b-lg border border-border" v-for="(room, index) in cart" :key="room.id">
          <div class="p-4 border-b border-border">
            <div class="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
              <div class="col-span-5 flex items-center gap-4">
                <button @click="removeFromCart(index)"
                  class="text-muted-foreground hover:text-destructive transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
                <img :src="room.image ?? '/img/search/default-room.jpg'" alt=""
                  class="w-16 h-16 object-cover rounded-lg">
                <div>
                  <h3 class="font-semibold text-foreground">{{ room.name }}</h3>
                  <p class="text-sm text-muted-foreground">{{ room.accommodation }}</p>
                </div>
              </div>
              <div class="col-span-2 text-center font-medium">{{ room.price.price }} {{ room.price.currency }}</div>
              <div class="col-span-2 text-center font-medium">{{ room.price.deposit }} {{ room.price.currency }}</div>
              <div class="col-span-2 flex items-center justify-center gap-2">
                <button @click="decreaseQty(index)"
                  class="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-minus w-4 h-4">
                    <path d="M5 12h14"></path>
                  </svg>
                </button>
                <span class="w-8 text-center font-medium">{{ room.quantity }}</span>
                <button @click="increaseQty(index)"
                  class="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-plus w-4 h-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
              </div>
              <div class="col-span-1 text-center font-bold text-lg">{{ cleanPrice(room.price.price) * room.quantity +
                cleanPrice(room.price.deposit) * room.quantity }} {{ room.price.currency }}</div>
            </div>

            <!-- Mobile layout -->
            <div class="lg:hidden flex flex-col gap-2">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-2">
                  <img :src="room.image ?? '/img/search/default-room.jpg'"
                    class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
                  <div>
                    <h3 class="font-semibold text-sm">{{ room.name }}</h3>
                    <p class="text-xs text-muted-foreground">{{ room.accommodation }}</p>
                  </div>
                </div>
                <button @click="removeFromCart(index)"
                  class="text-muted-foreground hover:text-destructive transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-x w-4 h-4">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <button @click="decreaseQty(index)"
                    class="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      class="lucide lucide-minus w-3 h-3">
                      <path d="M5 12h14"></path>
                    </svg>
                  </button>
                  <span class="w-8 text-center font-medium text-sm">{{ room.quantity }}</span>
                  <button @click="increaseQty(index)"
                    class="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      class="lucide lucide-plus w-4 h-4">
                      <path d="M5 12h14"></path>
                      <path d="M12 5v14"></path>
                    </svg>
                  </button>
                </div>
                <div class="font-bold text-lg text-primary">{{ cleanPrice(room.price.price) * room.quantity +
                  cleanPrice(room.price.deposit) * room.quantity }} {{ room.price.currency }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Total & actions -->
        <div class="mt-8 bg-white rounded-lg border border-border p-6">
          <div class="flex justify-between items-center text-xl font-bold mb-4">
            <span>{{ $t('cart.Total') }}:</span>
            <span class="text-primary">{{ finalTotal }} {{ currency }}</span>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <a class="flex-1" :href="localePath('/search')"><button
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8 w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                {{ $t('cart.Continue Shopping') }}</button></a>
            <button @click="proceedToCheckout"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {{ $t('cart.Proceed to Checkout') }} </button>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script>
import { setPostAuthRedirect } from '@/utils/authFlow';

export default {
  data() {
    return {
      cartData: {
        items     : [],
        currency  : '',
        items_count: 0,
        summary   : {
          subtotal     : 0,
          deposit_total: 0,
          grand_total  : 0,
        }
      },
      loading: true,
    };
  },
  computed: {
    cart() {
      return this.cartData.items;
    },
    subtotal() {
      return this.cartData.summary.subtotal;
    },
    totalDeposit() {
      return this.cartData.summary.deposit_total;
    },
    finalTotal() {
      return this.cartData.summary.grand_total;
    },
    currency() {
      return this.cartData.currency || this.cart[0]?.price?.currency || '';
    }
  },
  mounted() {
    this.loadCart();
  },
  methods: {
    cleanPrice(value) {
      if (!value) return 0;
      return Number(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
    },
    roomTotal(room) {
      const price = this.cleanPrice(room.price.price);
      const deposit = this.cleanPrice(room.price.deposit);
      return (price + deposit) * room.quantity;
    },
    async loadCart() {
      this.loading = true;

      try {
        this.cartData = await this.$bookingApi.getCart();
        this.emitCartCount();
      } catch (error) {
        this.cartData = {
          items     : [],
          currency  : '',
          items_count: 0,
          summary   : {
            subtotal     : 0,
            deposit_total: 0,
            grand_total  : 0,
          }
        };
      } finally {
        this.loading = false;
      }
    },
    emitCartCount() {
      const totalQty = this.cartData.items_count || this.cart.reduce((sum, r) => sum + (r.quantity || 1), 0);
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { count: totalQty } }));
    },
    async removeFromCart(index) {
      const item = this.cart[index];

      if (!item?.id) return;

      try {
        this.cartData = await this.$bookingApi.removeCartItem(item.id);
        this.emitCartCount();
      } catch (error) {
        this.$dangerAlert(error.response?.data?.message || this.$t('notification.error_occurred'));
      }
    },
    async increaseQty(index) {
      const item = this.cart[index];

      if (!item?.id) return;

      try {
        this.cartData = await this.$bookingApi.updateCartItem(item.id, {
          quantity: (item.quantity || 1) + 1,
        });
        this.emitCartCount();
      } catch (error) {
        this.$dangerAlert(error.response?.data?.message || this.$t('notification.error_occurred'));
      }
    },
    async decreaseQty(index) {
      const item = this.cart[index];

      if (!item?.id) return;

      try {
        if ((item.quantity || 1) > 1) {
          this.cartData = await this.$bookingApi.updateCartItem(item.id, {
            quantity: item.quantity - 1,
          });
        } else {
          this.cartData = await this.$bookingApi.removeCartItem(item.id);
        }

        this.emitCartCount();
      } catch (error) {
        this.$dangerAlert(error.response?.data?.message || this.$t('notification.error_occurred'));
      }
    },
    proceedToCheckout() {
      if (!this.$auth.loggedIn) {
        setPostAuthRedirect(this.localePath('/checkout'));
        this.$router.push(this.localePath('/auth'));
      } else {
        this.$router.push(this.localePath('/checkout'));
      }
    }
  }
};
</script>
