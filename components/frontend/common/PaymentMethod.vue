<template>
    <div class="p-6 pt-0">
        <div class="space-y-2">
            <div role="radiogroup" aria-required="false" dir="ltr" class="grid gap-2 space-y-4">
                <div v-for="method in methods" :key="method.code"
                    class="space-y-3 border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                    <div class="flex items-center space-x-3">
                        <button type="button" role="radio" :aria-checked="form.method === method.code"
                            @click="selectPayment(method.code)" :class="radioClass(form.method === method.code)">
                            <span v-if="form.method === method.code">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" style="margin-left: 2px;"
                                    class="lucide lucide-circle h-2.5 w-2.5 fill-current text-current">
                                    <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                            </span>
                        </button>
                        <label class="flex-1 cursor-pointer">
                            <div class="font-medium">{{ method.label }}</div>
                            <div class="text-sm text-muted-foreground">{{ method.description }}</div>
                        </label>
                    </div>

                    <div v-if="form.method === method.code && method.code === 'pay_at_property'"
                        class="ml-8 pl-4 border-l-2 border-muted space-y-2">
                        <div role="alert" class="relative w-full rounded-lg border p-4 bg-background text-foreground">
                            <h5 class="mb-1 font-medium leading-none tracking-tight">Payment Instructions</h5>
                            <div class="text-sm [&_p]:leading-relaxed">
                                Please visit the accommodation and complete your payment within <strong>48
                                    hours</strong>
                                of booking. Bring a valid ID and your booking confirmation email.
                            </div>
                        </div>
                    </div>

                    <div v-if="form.method === method.code && method.code === 'credit_card'"
                        class="ml-8 pl-4 border-l-2 border-muted space-y-3">
                        <div role="alert" class="border rounded-lg p-4 bg-background text-foreground">
                            <h5 class="mb-1 font-medium">Bank Gateway Flow</h5>
                            <div class="text-sm">
                                After checkout, you will be redirected to the bank-hosted 3D Secure page to complete your payment.
                            </div>
                        </div>
                    </div>

                    <div v-if="form.method === method.code && method.code === 'bank_transfer'"
                        class="ml-8 pl-4 border-l-2 border-muted space-y-3">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div><span class="text-muted-foreground">Bank Name</span>
                                <div class="font-medium">Ziraat Bankasi</div>
                            </div>
                            <div><span class="text-muted-foreground">Account Name</span>
                                <div class="font-medium">MovInn Accommodation LTD</div>
                            </div>
                            <div class="md:col-span-2"><span class="text-muted-foreground">IBAN</span>
                                <div class="font-mono text-xs tracking-wide select-all bg-secondary/20 p-2 rounded">TR12
                                    3456 7890 1234 5678 9012 34</div>
                            </div>
                            <div><span class="text-muted-foreground">SWIFT/BIC</span>
                                <div class="font-medium">TCZBTR2A</div>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium" for="receipt">Upload Transfer Receipt
                                (JPG/PNG/PDF)</label>
                            <input type="file" id="receipt" accept="image/*,application/pdf" class="input"
                                @change="updateFile">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium">Reference Number</label>
                            <input class="input" :value="form.reference_number"
                                @input="updateField('reference_number', $event.target.value)">
                        </div>
                        <div role="alert" class="border rounded-lg p-4 bg-background text-foreground mt-2">
                            <h5 class="mb-1 font-medium">Important Note</h5>
                            <div class="text-sm [&_p]:leading-relaxed">Include your full name and booking email as the
                                transfer reference. We will verify payment within 24 hours.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const METHOD_COPY = {
    pay_at_property: {
        code: 'pay_at_property',
        label: 'Pay at Property',
        description: 'Pay when you arrive at the accommodation',
    },
    credit_card: {
        code: 'credit_card',
        label: 'Bank Gateway Payment',
        description: 'Pay securely through the bank 3D Secure page',
    },
    bank_transfer: {
        code: 'bank_transfer',
        label: 'Bank Transfer',
        description: 'Transfer directly to our bank account',
    },
};

export default {
    props: {
        value: {
            type: Object,
            default: () => ({}),
        },
        availableMethods: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        form() {
            return {
                method: 'pay_at_property',
                receipt_file: null,
                reference_number: '',
                notes: '',
                ...this.value,
            };
        },
        methods() {
            if (!this.availableMethods.length) {
                return Object.values(METHOD_COPY);
            }

            return this.availableMethods
                .map(method => {
                    const code = method.code || method.key;

                    if (!code) return null;

                    return {
                        ...(METHOD_COPY[code] || {}),
                        ...method,
                        code,
                    };
                })
                .filter(Boolean);
        },
    },
    watch: {
        methods: {
            immediate: true,
            handler(methods) {
                if (!methods.length) return;

                const selectedMethodExists = methods.some(method => method.code === this.form.method);

                if (!selectedMethodExists) {
                    this.selectPayment(methods[0].code);
                }
            },
        },
    },
    methods: {
        radioClass(isSelected) {
            return [
                'aspect-square h-4 w-4 rounded-full border ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'
            ];
        },
        selectPayment(method) {
            this.$emit('input', {
                ...this.form,
                method,
            });
        },
        updateField(field, fieldValue) {
            this.$emit('input', {
                ...this.form,
                [field]: fieldValue,
            });
        },
        updateFile(event) {
            const [file] = event.target.files || [];

            this.$emit('input', {
                ...this.form,
                receipt_file: file || null,
            });
        },
    },
};
</script>

<style>
.input {
    flex: 1;
    height: 2.5rem;
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    background-color: #fff;
    color: #111827;
    font-size: 0.875rem;
}
</style>
