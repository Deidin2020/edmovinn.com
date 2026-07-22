<template>
    <div class="pm">
        <div class="pm__list" role="radiogroup">
            <div
                v-for="method in methods"
                :key="method.code"
                class="pm__option"
                :class="{ 'is-selected': form.method === method.code }">

                <button
                    type="button"
                    role="radio"
                    class="pm__head"
                    :aria-checked="form.method === method.code"
                    @click="selectPayment(method.code)">
                    <span class="pm__radio" aria-hidden="true"><span class="pm__radio-dot" /></span>

                    <span class="pm__icon" aria-hidden="true" v-html="methodIcon(method.code)" />

                    <span class="pm__labels">
                        <span class="pm__label">{{ method.label }}</span>
                        <span class="pm__desc">{{ method.description }}</span>
                    </span>
                </button>

                <!-- Pay at property -->
                <div v-if="isActive(method.code, 'pay_at_property')" class="pm__body">
                    <div class="pm__note">
                        <strong>{{ $t('payment.instructions_title') }}</strong>
                        <p>{{ $t('payment.pay_at_property_note') }}</p>
                    </div>
                </div>

                <!-- Card payment -->
                <div v-if="isActive(method.code, 'credit_card')" class="pm__body">
                    <div class="pm__amount">
                        <span class="pm__amount-label">{{ $t('payment.amount_to_pay') }}</span>
                        <span class="pm__amount-value">{{ formattedAmount }}</span>
                    </div>

                    <div class="pm__card">
                        <div class="pm__field pm__field--full">
                            <label for="pm-number">{{ $t('payment.card_number') }}</label>
                            <div class="pm__input-wrap">
                                <input
                                    id="pm-number"
                                    dir="ltr"
                                    class="pm__input pm__input--number"
                                    :class="{ 'is-invalid': errors.number }"
                                    :value="displayCardNumber"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="cc-number"
                                    maxlength="23"
                                    placeholder="0000 0000 0000 0000"
                                    @input="onCardNumberInput"
                                    @blur="touch('number')">
                                <span class="pm__brand" aria-hidden="true" v-html="brandIcon" />
                            </div>
                            <span v-if="errors.number" class="pm__error">{{ errors.number }}</span>
                        </div>

                        <div class="pm__field pm__field--full">
                            <label for="pm-holder">{{ $t('payment.card_holder') }}</label>
                            <input
                                id="pm-holder"
                                dir="ltr"
                                class="pm__input pm__input--holder"
                                :class="{ 'is-invalid': errors.holderName }"
                                :value="form.card.holderName"
                                type="text"
                                autocomplete="cc-name"
                                :placeholder="$t('payment.card_holder_placeholder')"
                                @input="updateCardField('holderName', $event.target.value)"
                                @blur="touch('holderName')">
                            <span v-if="errors.holderName" class="pm__error">{{ errors.holderName }}</span>
                        </div>

                        <div class="pm__field">
                            <label for="pm-exp">{{ $t('payment.expiry') }}</label>
                            <input
                                id="pm-exp"
                                dir="ltr"
                                class="pm__input"
                                :class="{ 'is-invalid': errors.expiry }"
                                :value="displayExpiry"
                                type="text"
                                inputmode="numeric"
                                autocomplete="cc-exp"
                                maxlength="5"
                                placeholder="MM / YY"
                                @input="onExpiryInput"
                                @blur="touch('expiry')">
                            <span v-if="errors.expiry" class="pm__error">{{ errors.expiry }}</span>
                        </div>

                        <div class="pm__field">
                            <label for="pm-cvv">
                                {{ $t('payment.cvv') }}
                                <span
                                    class="pm__hint-icon"
                                    role="img"
                                    :aria-label="$t('payment.cvv_hint')"
                                    :title="$t('payment.cvv_hint')">?</span>
                            </label>
                            <input
                                id="pm-cvv"
                                dir="ltr"
                                class="pm__input"
                                :class="{ 'is-invalid': errors.cvv }"
                                :value="form.card.cvv"
                                type="password"
                                inputmode="numeric"
                                autocomplete="cc-csc"
                                :maxlength="cvvLength"
                                placeholder="•••"
                                @input="onCvvInput"
                                @blur="touch('cvv')">
                            <span v-if="errors.cvv" class="pm__error">{{ errors.cvv }}</span>
                        </div>

                        <div class="pm__field pm__field--full">
                            <label for="pm-type">{{ $t('payment.card_type') }}</label>
                            <select
                                id="pm-type"
                                class="pm__input"
                                :value="form.card.type"
                                @change="updateCardField('type', $event.target.value)">
                                <option value="CreditCard">{{ $t('payment.card_type_credit') }}</option>
                                <option value="DebitCard">{{ $t('payment.card_type_debit') }}</option>
                                <option value="PrePaidCard">{{ $t('payment.card_type_prepaid') }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="pm__secure">
                        <span class="pm__secure-icon" aria-hidden="true" v-html="lockIcon" />
                        <p>{{ $t('payment.secure_note') }}</p>
                    </div>
                </div>

                <!-- Bank transfer -->
                <div v-if="isActive(method.code, 'bank_transfer')" class="pm__body">
                    <dl class="pm__bank">
                        <div>
                            <dt>{{ $t('payment.bank_name') }}</dt>
                            <dd>Ziraat Bankasi</dd>
                        </div>
                        <div>
                            <dt>{{ $t('payment.account_name') }}</dt>
                            <dd>MovInn Accommodation LTD</dd>
                        </div>
                        <div class="pm__bank-wide">
                            <dt>IBAN</dt>
                            <dd><code dir="ltr">TR12 3456 7890 1234 5678 9012 34</code></dd>
                        </div>
                        <div>
                            <dt>SWIFT / BIC</dt>
                            <dd>TCZBTR2A</dd>
                        </div>
                    </dl>

                    <div class="pm__field pm__field--full">
                        <label for="pm-receipt">{{ $t('payment.upload_receipt') }}</label>
                        <input
                            id="pm-receipt"
                            type="file"
                            class="pm__input pm__input--file"
                            accept="image/*,application/pdf"
                            @change="updateFile">
                    </div>

                    <div class="pm__field pm__field--full">
                        <label for="pm-ref">{{ $t('payment.reference_number') }}</label>
                        <input
                            id="pm-ref"
                            class="pm__input"
                            :value="form.reference_number"
                            @input="updateField('reference_number', $event.target.value)">
                    </div>

                    <div class="pm__note">
                        <strong>{{ $t('payment.important_note') }}</strong>
                        <p>{{ $t('payment.bank_transfer_note') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const METHOD_CODES = ['pay_at_property', 'credit_card', 'bank_transfer'];

// Inline so the icons survive the strict CSP and need no extra request.
const ICONS = {
    pay_at_property: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>',
    credit_card    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    bank_transfer  : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18"/><path d="M5 10V7l7-4 7 4v3"/><path d="M5 10v8m5-8v8m4-8v8m5-8v8"/><path d="M3 21h18"/></svg>',
};

const BRAND_ICONS = {
    visa      : '<svg viewBox="0 0 48 16" aria-label="Visa"><text x="0" y="13" font-family="Arial,Helvetica,sans-serif" font-size="14" font-style="italic" font-weight="700" fill="#1A1F71">VISA</text></svg>',
    mastercard: '<svg viewBox="0 0 40 24" aria-label="Mastercard"><circle cx="15" cy="12" r="9" fill="#EB001B"/><circle cx="25" cy="12" r="9" fill="#F79E1B" fill-opacity="0.85"/></svg>',
    amex      : '<svg viewBox="0 0 48 16" aria-label="American Express"><text x="0" y="13" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" fill="#2E77BC">AMEX</text></svg>',
    troy      : '<svg viewBox="0 0 48 16" aria-label="Troy"><text x="0" y="13" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="700" fill="#00A0DF">troy</text></svg>',
};

const LOCK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';

function digitsOnly(value) {
    return String(value || '').replace(/\D+/g, '');
}

// Card schemes group digits differently; Amex is 4-6-5, everything else 4-4-4-4.
function groupCardNumber(digits, brand) {
    if (brand === 'amex') {
        return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
            .filter(Boolean)
            .join(' ');
    }

    return digits.replace(/(.{4})/g, '$1 ').trim();
}

function detectBrand(digits) {
    if (/^4/.test(digits)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^9/.test(digits)) return 'troy';

    return '';
}

// Luhn checksum — catches mistyped digits before the request reaches the bank.
function passesLuhn(digits) {
    let sum = 0;
    let double = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let value = Number(digits[i]);

        if (double) {
            value *= 2;
            if (value > 9) value -= 9;
        }

        sum += value;
        double = !double;
    }

    return sum > 0 && sum % 10 === 0;
}

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
        amount: {
            type: [Number, String],
            default: 0,
        },
        currency: {
            type: String,
            default: 'TRY',
        },
    },
    data() {
        return {
            touched: {},
        };
    },
    computed: {
        form() {
            return {
                method: 'pay_at_property',
                receipt_file: null,
                reference_number: '',
                notes: '',
                ...this.value,
                card: {
                    holderName : '',
                    number     : '',
                    expireMonth: '',
                    expireYear : '',
                    cvv        : '',
                    type       : 'CreditCard',
                    ...(this.value && this.value.card),
                },
            };
        },
        cardDigits() {
            return digitsOnly(this.form.card.number);
        },
        brand() {
            return detectBrand(this.cardDigits);
        },
        brandIcon() {
            return BRAND_ICONS[this.brand] || '';
        },
        lockIcon() {
            return LOCK_ICON;
        },
        cvvLength() {
            return this.brand === 'amex' ? 4 : 3;
        },
        displayCardNumber() {
            return groupCardNumber(this.cardDigits, this.brand);
        },
        displayExpiry() {
            const month = this.form.card.expireMonth || '';
            const year = this.form.card.expireYear || '';

            if (!month && !year) return '';

            return year ? `${month}/${year}` : month;
        },
        formattedAmount() {
            const amount = Number(this.amount || 0);
            const currency = this.currency || 'TRY';

            if (!Number.isFinite(amount)) return `${this.amount} ${currency}`;

            try {
                return new Intl.NumberFormat(this.$i18n?.locale || 'en', {
                    style   : 'currency',
                    currency,
                }).format(amount);
            } catch (error) {
                return `${amount.toFixed(2)} ${currency}`;
            }
        },
        errors() {
            const card = this.form.card;
            const result = {};

            if (this.touched.number) {
                const expected = this.brand === 'amex' ? 15 : 16;

                if (!this.cardDigits) {
                    result.number = this.$t('payment.error_card_required');
                } else if (this.cardDigits.length !== expected || !passesLuhn(this.cardDigits)) {
                    result.number = this.$t('payment.error_card_invalid');
                }
            }

            if (this.touched.holderName && !String(card.holderName || '').trim()) {
                result.holderName = this.$t('payment.error_holder_required');
            }

            if (this.touched.expiry) {
                const month = Number(card.expireMonth);
                const year = Number(card.expireYear);

                if (!card.expireMonth || !card.expireYear) {
                    result.expiry = this.$t('payment.error_expiry_required');
                } else if (!(month >= 1 && month <= 12)) {
                    result.expiry = this.$t('payment.error_expiry_invalid');
                } else {
                    const now = new Date();
                    const currentYear = now.getFullYear() % 100;
                    const currentMonth = now.getMonth() + 1;

                    if (year < currentYear || (year === currentYear && month < currentMonth)) {
                        result.expiry = this.$t('payment.error_expiry_past');
                    }
                }
            }

            if (this.touched.cvv) {
                const cvv = digitsOnly(card.cvv);

                if (cvv.length !== this.cvvLength) {
                    result.cvv = this.$t('payment.error_cvv_invalid');
                }
            }

            return result;
        },
        methods() {
            const copy = code => ({
                code,
                label      : this.$t(`payment.method_${code}_label`),
                description: this.$t(`payment.method_${code}_description`),
            });

            if (!this.availableMethods.length) {
                return METHOD_CODES.map(copy);
            }

            return this.availableMethods
                .map(method => {
                    const code = method.code || method.key;

                    if (!code) return null;

                    // Unknown codes have no translation, so show the code itself
                    // rather than an empty row.
                    const fallback = METHOD_CODES.includes(code)
                        ? copy(code)
                        : { code, label: code, description: '' };

                    return {
                        ...fallback,
                        // Backend copy wins when it provides its own wording.
                        ...(method.label ? { label: method.label } : {}),
                        ...(method.description ? { description: method.description } : {}),
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

                if (!methods.some(method => method.code === this.form.method)) {
                    this.selectPayment(methods[0].code);
                }
            },
        },
    },
    methods: {
        isActive(code, expected) {
            return this.form.method === code && code === expected;
        },
        methodIcon(code) {
            return ICONS[code] || ICONS.credit_card;
        },
        touch(field) {
            this.$set(this.touched, field, true);
        },
        selectPayment(method) {
            this.$emit('input', { ...this.form, method });
        },
        updateField(field, fieldValue) {
            this.$emit('input', { ...this.form, [field]: fieldValue });
        },
        updateCardField(field, fieldValue) {
            this.$emit('input', {
                ...this.form,
                card: { ...this.form.card, [field]: fieldValue },
            });
        },
        onCardNumberInput(event) {
            const brand = detectBrand(digitsOnly(event.target.value));
            const max = brand === 'amex' ? 15 : 16;
            const digits = digitsOnly(event.target.value).slice(0, max);

            // Keep the box showing the grouped value even when the digits did not
            // change (e.g. the user typed a space), otherwise Vue skips the update.
            event.target.value = groupCardNumber(digits, brand);

            this.updateCardField('number', digits);
        },
        onExpiryInput(event) {
            const digits = digitsOnly(event.target.value).slice(0, 4);
            let month = digits.slice(0, 2);
            const year = digits.slice(2, 4);

            // A leading 2..9 can only mean a single-digit month.
            if (month.length === 1 && Number(month) > 1) {
                month = `0${month}`;
            }

            event.target.value = year ? `${month}/${year}` : month;

            this.$emit('input', {
                ...this.form,
                card: { ...this.form.card, expireMonth: month, expireYear: year },
            });
        },
        onCvvInput(event) {
            const cvv = digitsOnly(event.target.value).slice(0, this.cvvLength);

            event.target.value = cvv;
            this.updateCardField('cvv', cvv);
        },
        updateFile(event) {
            const [file] = event.target.files || [];

            this.$emit('input', { ...this.form, receipt_file: file || null });
        },
    },
};
</script>

<style lang="scss" scoped>
.pm {
    padding: 0 24px 24px;

    &__list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__option {
        background: var(--color-white, #fff);
        border: 1px solid var(--color-border, #e5e5e5);
        border-radius: 12px;
        overflow: hidden;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;

        &:hover {
            border-color: rgba(48, 61, 191, 0.35);
        }

        &.is-selected {
            border-color: var(--color-primary, #303dbf);
            box-shadow: 0 0 0 3px rgba(48, 61, 191, 0.1);
        }
    }

    &__head {
        align-items: center;
        background: none;
        border: 0;
        cursor: pointer;
        display: flex;
        gap: 14px;
        padding: 18px 20px;
        text-align: left;
        width: 100%;
    }

    &__radio {
        align-items: center;
        border: 2px solid #cbd0dd;
        border-radius: 50%;
        display: inline-flex;
        flex: 0 0 auto;
        height: 20px;
        justify-content: center;
        transition: border-color 0.18s ease;
        width: 20px;
    }

    &__radio-dot {
        background: var(--color-primary, #303dbf);
        border-radius: 50%;
        height: 10px;
        transform: scale(0);
        transition: transform 0.18s ease;
        width: 10px;
    }

    &__icon {
        align-items: center;
        color: var(--color-primary, #303dbf);
        display: inline-flex;
        flex: 0 0 auto;
        height: 22px;
        width: 22px;

        ::v-deep svg {
            height: 100%;
            width: 100%;
        }
    }

    &__labels {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    &__label {
        color: var(--color-heading-2, #050066);
        font-size: 0.98rem;
        font-weight: 600;
        line-height: 1.3;
    }

    &__desc {
        color: var(--color-body, #344054);
        font-size: 0.84rem;
        line-height: 1.4;
        opacity: 0.75;
    }

    &__body {
        border-top: 1px solid var(--color-border, #e5e5e5);
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 20px;
    }

    &__amount {
        align-items: baseline;
        background: var(--bg-light-gray, #f9fafb);
        border-radius: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: space-between;
        padding: 14px 16px;
    }

    &__amount-label {
        color: var(--color-body, #344054);
        font-size: 0.85rem;
    }

    &__amount-value {
        color: var(--color-heading-2, #050066);
        font-size: 1.45rem;
        font-weight: 700;
        letter-spacing: -0.01em;
    }

    &__card {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;

        &--full {
            grid-column: 1 / -1;
        }

        label {
            align-items: center;
            color: var(--color-textSecondary-2, #344054);
            display: flex;
            font-size: 0.83rem;
            font-weight: 600;
            gap: 6px;
            margin: 0;
        }
    }

    &__hint-icon {
        align-items: center;
        background: #eef0fb;
        border-radius: 50%;
        color: var(--color-primary, #303dbf);
        cursor: help;
        display: inline-flex;
        font-size: 0.68rem;
        font-weight: 700;
        height: 15px;
        justify-content: center;
        width: 15px;
    }

    &__input-wrap {
        position: relative;
    }

    &__input {
        background: #fff;
        border: 1px solid #d5d9e4;
        border-radius: 9px;
        color: #111827;
        font-size: 0.94rem;
        height: 46px;
        padding: 0 14px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        width: 100%;

        &::placeholder {
            color: #a5acbd;
        }

        &:focus {
            border-color: var(--color-primary, #303dbf);
            box-shadow: 0 0 0 3px rgba(48, 61, 191, 0.12);
            outline: none;
        }

        &.is-invalid {
            border-color: #dc2626;

            &:focus {
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
            }
        }

        &--number {
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.06em;
            // The field is forced to dir="ltr", so the badge always sits on the right.
            padding-right: 62px;
        }

        &--holder {
            text-transform: uppercase;
        }

        &--file {
            height: auto;
            padding: 11px 14px;
        }
    }

    select.pm__input {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-position: right 12px center;
        background-repeat: no-repeat;
        background-size: 18px;
        padding-right: 38px;
    }

    &__brand {
        align-items: center;
        display: flex;
        height: 22px;
        right: 12px;
        pointer-events: none;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;

        ::v-deep svg {
            height: 100%;
            width: 100%;
        }
    }

    &__error {
        color: #dc2626;
        font-size: 0.78rem;
        line-height: 1.35;
    }

    &__secure {
        align-items: flex-start;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 10px;
        color: #14532d;
        display: flex;
        gap: 10px;
        padding: 12px 14px;

        p {
            font-size: 0.83rem;
            line-height: 1.5;
            margin: 0;
        }
    }

    &__secure-icon {
        flex: 0 0 auto;
        height: 18px;
        margin-top: 1px;
        width: 18px;

        ::v-deep svg {
            height: 100%;
            width: 100%;
        }
    }

    &__note {
        background: var(--bg-light-gray, #f9fafb);
        border-left: 3px solid var(--color-primary, #303dbf);
        border-radius: 8px;
        padding: 13px 15px;

        strong {
            color: var(--color-heading-2, #050066);
            display: block;
            font-size: 0.88rem;
            margin-bottom: 4px;
        }

        p {
            color: var(--color-body, #344054);
            font-size: 0.84rem;
            line-height: 1.55;
            margin: 0;
        }
    }

    &__bank {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin: 0;

        dt {
            color: var(--color-body, #344054);
            font-size: 0.78rem;
            font-weight: 500;
            opacity: 0.75;
        }

        dd {
            color: var(--color-heading-2, #050066);
            font-size: 0.9rem;
            font-weight: 600;
            margin: 2px 0 0;
        }

        code {
            background: #eef0fb;
            border-radius: 6px;
            color: var(--color-primary-dark, #04005c);
            display: inline-block;
            font-size: 0.82rem;
            letter-spacing: 0.05em;
            padding: 5px 9px;
            user-select: all;
        }
    }

    &__bank-wide {
        grid-column: 1 / -1;
    }
}

.pm__option.is-selected {
    .pm__radio {
        border-color: var(--color-primary, #303dbf);
    }

    .pm__radio-dot {
        transform: scale(1);
    }
}

// Logical properties do not flip in this build, so mirror explicitly — the same
// approach the rest of the project uses. The card number field and its brand badge
// stay left-to-right on purpose: the digits themselves are always LTR.
[dir='rtl'] {
    .pm__head {
        text-align: right;
    }

    .pm__note {
        border-left: 0;
        border-right: 3px solid var(--color-primary, #303dbf);
    }

    select.pm__input {
        background-position: left 12px center;
        padding-left: 38px;
        padding-right: 14px;
    }
}

@media (max-width: 575px) {
    .pm {
        padding: 0 16px 16px;

        &__card,
        &__bank {
            grid-template-columns: minmax(0, 1fr);
        }

        &__head {
            padding: 15px 16px;
        }

        &__body {
            padding: 16px;
        }
    }
}
</style>
