// Shared card rules for the checkout flow.
//
// The payment form and the checkout submit handler must agree on what counts as a
// valid card. When the form only highlighted problems visually, an invalid number
// could still be submitted and was rejected by the bank instead — costing the
// customer a failed attempt against the gateway's rate limits.

export const CARD_BRANDS = {
    visa      : { pattern: /^4/, length: 16, cvvLength: 3 },
    mastercard: { pattern: /^(5[1-5]|2[2-7])/, length: 16, cvvLength: 3 },
    amex      : { pattern: /^3[47]/, length: 15, cvvLength: 4 },
    troy      : { pattern: /^9/, length: 16, cvvLength: 3 },
};

const DEFAULT_RULES = { length: 16, cvvLength: 3 };

export function digitsOnly(value) {
    return String(value || '').replace(/\D+/g, '');
}

export function detectBrand(cardNumber) {
    const digits = digitsOnly(cardNumber);
    const match = Object.entries(CARD_BRANDS).find(([, rules]) => rules.pattern.test(digits));

    return match ? match[0] : '';
}

export function getBrandRules(cardNumber) {
    return CARD_BRANDS[detectBrand(cardNumber)] || DEFAULT_RULES;
}

// Amex groups 4-6-5; every other scheme groups in fours.
export function formatCardNumber(cardNumber) {
    const brand = detectBrand(cardNumber);
    const digits = digitsOnly(cardNumber).slice(0, getBrandRules(cardNumber).length);

    if (brand === 'amex') {
        return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
            .filter(Boolean)
            .join(' ');
    }

    return digits.replace(/(.{4})/g, '$1 ').trim();
}

// Luhn checksum: catches transposed or mistyped digits before the bank sees them.
export function passesLuhn(cardNumber) {
    const digits = digitsOnly(cardNumber);
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

export function isCardNumberValid(cardNumber) {
    const digits = digitsOnly(cardNumber);

    return digits.length === getBrandRules(cardNumber).length && passesLuhn(digits);
}

export function isCvvValid(cvv, cardNumber) {
    return digitsOnly(cvv).length === getBrandRules(cardNumber).cvvLength;
}

// `now` is injectable so the boundary case (card expiring this month) is testable.
export function isExpiryValid(expireMonth, expireYear, now = new Date()) {
    const month = Number(digitsOnly(expireMonth));
    const year = Number(digitsOnly(expireYear));

    if (!month || !expireYear || month < 1 || month > 12) return false;

    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

// Returns the failing rules as { field: reasonKey } so each caller can render the
// message in its own way. An empty object means the card is good to send.
export function validateCard(card = {}, now = new Date()) {
    const failures = {};

    if (!digitsOnly(card.number)) {
        failures.number = 'error_card_required';
    } else if (!isCardNumberValid(card.number)) {
        failures.number = 'error_card_invalid';
    }

    if (!String(card.holderName || '').trim()) {
        failures.holderName = 'error_holder_required';
    }

    if (!card.expireMonth || !card.expireYear) {
        failures.expiry = 'error_expiry_required';
    } else if (Number(digitsOnly(card.expireMonth)) < 1 || Number(digitsOnly(card.expireMonth)) > 12) {
        failures.expiry = 'error_expiry_invalid';
    } else if (!isExpiryValid(card.expireMonth, card.expireYear, now)) {
        failures.expiry = 'error_expiry_past';
    }

    if (!isCvvValid(card.cvv, card.number)) {
        failures.cvv = 'error_cvv_invalid';
    }

    return failures;
}
