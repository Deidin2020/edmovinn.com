<!-- TEMPORARY dev-only preview of the payment form. Delete before committing. -->
<template>
    <main style="background:#F9FAFB;min-height:100vh;padding:40px 16px;">
        <div style="max-width:720px;margin:0 auto;">
            <div style="background:#fff;border:1px solid #e5e5e5;border-radius:14px;overflow:hidden;">
                <div style="padding:24px 24px 8px;">
                    <h3 style="color:#050066;font-size:1.5rem;font-weight:700;margin:0 0 4px;">Payment Method</h3>
                    <p style="color:#344054;font-size:0.9rem;margin:0;">Choose your preferred payment method</p>
                </div>
                <PaymentMethod
                    v-model="form"
                    :available-methods="backendMethods"
                    :amount="1125"
                    currency="USD" />
            </div>
        </div>
    </main>
</template>

<script>
export default {
    layout: 'blank',
    data() {
        return {
            // Shape the backend actually returns after normalizePaymentMethod.
            backendMethods: [
                { code: 'pay_at_property', label: '', description: '' },
                { code: 'credit_card', label: '', description: '' },
                { code: 'bank_transfer', label: '', description: '' },
            ],
            form: {
                method: 'credit_card',
                card  : {
                    holderName : '',
                    number     : '',
                    expireMonth: '',
                    expireYear : '',
                    cvv        : '',
                    type       : 'CreditCard',
                },
            },
        };
    },
};
</script>
