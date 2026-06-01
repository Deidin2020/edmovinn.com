<template>
    <div class="lg:col-span-1">
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="flex flex-col space-y-1.5 p-6 border-b">
                <h3 class="text-2xl font-semibold leading-none tracking-tight"> {{ $t('cart.Order Summary') }}</h3>
            </div>

            <div class="p-6 space-y-4">
                <div class="flex justify-between items-start text-sm border-b pb-4" v-for="room in cart.items" :key="room.id || room.room_id">
                    <div class="flex-1 space-y-1">
                        <p class="font-medium">{{ room.name }} - {{ room.accommodation }}</p>
                        <p class="text-muted-foreground text-xs">{{ room.available_from ?? '' }}</p>
                        <p class="text-xs">Qty: {{ room.quantity }}</p>
                        <p v-if="room.price?.deposit" class="text-xs text-muted">
                            {{ $t('cart.Deposit') }}: {{ room.price?.currency }} {{ room.price?.deposit }}
                        </p>
                    </div>
                    <div class="text-right font-medium">
                        <p>{{ room.price?.currency }} {{ room.price?.price }} x {{ room.quantity }}</p>
                        <p v-if="room.price?.deposit">{{ $t('cart.Subtotal') }}: {{ room.price?.currency }} {{ room.line_total }}</p>
                    </div>
                </div>

                <div class="pt-4">
                    <div class="flex justify-between font-bold text-lg border-t pt-4">
                        <span>{{ $t('cart.Total') }}:</span>
                        <span class="text-primary">{{ cart.summary.grand_total }} {{ cart.currency }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        cartData: {
            type   : Object,
            default: null,
        },
    },
    data() {
        return {
            localCart: {
                items   : [],
                currency: '',
                summary : {
                    grand_total: 0,
                },
            },
        };
    },
    computed: {
        cart() {
            return this.cartData || this.localCart;
        },
    },
    mounted() {
        if (!this.cartData) {
            this.loadCart();
        }
    },
    methods: {
        async loadCart() {
            try {
                this.localCart = await this.$bookingApi.getCart();
            } catch (error) {
                this.localCart = {
                    items   : [],
                    currency: '',
                    summary : {
                        grand_total: 0,
                    },
                };
            }
        },
    },
};
</script>

<style scoped>
.border-b {
    border-bottom: 1px solid #e5e7eb;
}

.text-muted {
    color: #6b7280;
}

.text-primary {
    color: #3b82f6;
    font-weight: 600;
}

.space-y-1> :not(:first-child) {
    margin-top: 0.25rem;
}

.space-y-4> :not(:first-child) {
    margin-top: 1rem;
}
</style>
