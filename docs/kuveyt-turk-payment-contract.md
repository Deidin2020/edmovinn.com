# Kuveyt Turk Payment Gateway Contract

This document defines the internal API contract needed to connect the existing booking checkout flow to a Kuveyt Turk card payment gateway without changing the frontend booking sequence.

## Goal

Keep the current frontend flow:

1. Create booking
2. Initialize payment session
3. Redirect customer to the bank-hosted payment page
4. Receive gateway callback / return
5. Confirm and sync booking payment state

## Existing Frontend Assumptions

Current frontend already expects:

- booking is created first
- then `POST /api/tenant/bookings/{bookingId}/payment-sessions`
- response returns a redirect-capable payment session object
- frontend redirects using one of:
  - `redirect_url`
  - `checkout_url`
  - `url`

The frontend also has a separate confirm endpoint:

- `POST /api/tenant/bookings/{bookingId}/payments/confirm`

## Provider Code

Use this provider key consistently:

```text
kuveyt_turk
```

## 1. Create Booking

No structural change is required in booking creation.

### Request

`POST /api/tenant/bookings`

```json
{
  "cart_id": "cart_123",
  "payment_method": "credit_card",
  "notes": "optional customer note"
}
```

### Response

```json
{
  "success": true,
  "message": "Booking created successfully.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260623-9001",
      "status": "awaiting_payment",
      "payment_status": "pending",
      "currency": "TRY",
      "grand_total": 18500.00,
      "expires_at": "2026-06-23T22:30:00Z"
    },
    "next_action": {
      "type": "init_payment"
    }
  }
}
```

## 2. Initialize Kuveyt Turk Payment Session

This is the main endpoint the frontend already calls after booking creation.

### Request

`POST /api/tenant/bookings/{bookingId}/payment-sessions`

```json
{
  "provider": "kuveyt_turk",
  "language": "ar",
  "return_url": "https://edmovinn.com/checkout/payment-return",
  "cancel_url": "https://edmovinn.com/checkout/payment-cancel",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+905551112233"
  }
}
```

### Backend Responsibility

The backend should:

1. Load booking by `bookingId`
2. Verify booking belongs to authenticated tenant
3. Verify booking status is still payable
4. Create a local payment record with status `pending`
5. Build the Kuveyt Turk gateway request using merchant credentials
6. Generate provider request signature / hash if required by the merchant setup
7. Store:
   - internal payment id
   - booking id
   - provider `kuveyt_turk`
   - provider order id
   - request payload snapshot
   - session expiration
8. Return a redirect URL or form-post payload for the hosted payment page

### Response `200`

```json
{
  "success": true,
  "result": {
    "payment_session": {
      "id": "pay_9f4fd3b2",
      "provider": "kuveyt_turk",
      "type": "redirect",
      "redirect_method": "GET",
      "redirect_url": "https://pos.kuveytturk.com.tr/vpos/checkout?token=example",
      "amount": 18500.00,
      "currency": "TRY",
      "booking_reference": "BK-20260623-9001",
      "provider_order_id": "EDM-9001-20260623",
      "expires_at": "2026-06-23T22:30:00Z"
    }
  }
}
```

## 3. Alternative Hosted Form Response

If Kuveyt Turk requires form-post instead of direct redirect URL, return a hosted form contract.

### Response `200`

```json
{
  "success": true,
  "result": {
    "payment_session": {
      "id": "pay_9f4fd3b2",
      "provider": "kuveyt_turk",
      "type": "form_post",
      "form_action": "https://pos.kuveytturk.com.tr/vpos/sale",
      "form_method": "POST",
      "fields": {
        "merchant_id": "MERCHANT_ID",
        "order_id": "EDM-9001-20260623",
        "amount": "18500.00",
        "currency": "TRY",
        "success_url": "https://api.edmovinn.com/api/payments/kuveyt-turk/return",
        "failure_url": "https://api.edmovinn.com/api/payments/kuveyt-turk/return",
        "hash": "SIGNED_VALUE"
      },
      "amount": 18500.00,
      "currency": "TRY"
    }
  }
}
```

If you use this variant, frontend must submit a hidden form instead of `window.location.href`.

## 4. Gateway Return Endpoint

Kuveyt Turk should return the customer to your backend or frontend after payment completion.

Recommended backend return endpoint:

`POST /api/payments/kuveyt-turk/return`

or if the provider only supports browser redirect with query params:

`GET /api/payments/kuveyt-turk/return`

### Expected Provider Mapping

Your backend should normalize the provider payload into:

```json
{
  "provider": "kuveyt_turk",
  "provider_order_id": "EDM-9001-20260623",
  "provider_transaction_id": "KTX123456789",
  "status": "success",
  "status_code": "00",
  "status_message": "Approved",
  "amount": 18500.00,
  "currency": "TRY",
  "raw": {}
}
```

### Backend Responsibility

1. Validate provider signature / hash
2. Match `provider_order_id` to local payment record
3. Prevent duplicate processing with idempotency checks
4. Update payment record:
   - `paid` when approved
   - `failed` when rejected
   - `cancelled` when abandoned
5. Update booking status accordingly
6. Redirect user to frontend success or failure page

## 5. Confirm Payment Endpoint

Use this endpoint when the frontend needs to finalize payment state after redirect.

### Request

`POST /api/tenant/bookings/{bookingId}/payments/confirm`

```json
{
  "provider": "kuveyt_turk",
  "payment_id": "pay_9f4fd3b2",
  "provider_order_id": "EDM-9001-20260623",
  "provider_transaction_id": "KTX123456789"
}
```

### Response `200` Success

```json
{
  "success": true,
  "message": "Payment confirmed successfully.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260623-9001",
      "status": "confirmed",
      "payment_status": "paid"
    },
    "payment": {
      "id": "pay_9f4fd3b2",
      "provider": "kuveyt_turk",
      "status": "paid",
      "provider_transaction_id": "KTX123456789",
      "paid_at": "2026-06-23T14:22:10Z"
    }
  }
}
```

### Response `422` Failure

```json
{
  "success": false,
  "message": "Payment was not approved.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260623-9001",
      "status": "awaiting_payment",
      "payment_status": "failed"
    },
    "payment": {
      "id": "pay_9f4fd3b2",
      "provider": "kuveyt_turk",
      "status": "failed",
      "failure_code": "05",
      "failure_message": "Do not honor"
    }
  }
}
```

## 6. Optional Server-to-Server Callback

If Kuveyt Turk supports an asynchronous notification callback, expose:

`POST /api/webhooks/payments/kuveyt-turk`

### Requirements

- validate source signature / hash
- log raw payload
- idempotent processing
- reply with provider-required acknowledgement body

### Internal Normalized Result

```json
{
  "provider": "kuveyt_turk",
  "provider_order_id": "EDM-9001-20260623",
  "provider_transaction_id": "KTW123456789",
  "payment_status": "paid"
}
```

## 7. Payment State Mapping

Normalize provider outcomes into your local states:

| Provider Result | Local Payment Status | Local Booking Status |
| --- | --- | --- |
| approved | `paid` | `confirmed` |
| pending_review | `pending` or `under_review` | `awaiting_payment_review` |
| declined | `failed` | `awaiting_payment` |
| cancelled | `cancelled` | `awaiting_payment` |
| expired | `expired` | `awaiting_payment` or `cancelled` |

## 8. Recommended Local Payment Table Fields

```text
id
booking_id
tenant_id
provider
provider_order_id
provider_transaction_id
status
amount
currency
request_payload_json
response_payload_json
callback_payload_json
failure_code
failure_message
paid_at
expires_at
created_at
updated_at
```

## 9. Frontend Change Needed

Current frontend sends:

```js
{ provider: 'stripe' }
```

It should send:

```js
{ provider: 'kuveyt_turk' }
```

No other frontend change is required if backend returns `redirect_url`.

If backend returns `form_post`, frontend must dynamically build and submit a form.

## 10. Recommended Validation Rules

### `POST /payment-sessions`

- `provider` required and must equal `kuveyt_turk`
- booking must exist
- booking must belong to logged-in user
- booking `payment_status` must be `pending` or `failed`
- amount must be recalculated server-side, never trusted from frontend

### `POST /payments/confirm`

- `provider` required and must equal `kuveyt_turk`
- `payment_id` or `provider_order_id` required
- booking must match payment record
- confirmation must be idempotent

## 11. Implementation Summary

To make the requirement work, backend must implement:

1. `POST /api/tenant/bookings/{bookingId}/payment-sessions`
2. `POST or GET /api/payments/kuveyt-turk/return`
3. `POST /api/tenant/bookings/{bookingId}/payments/confirm`
4. optional `POST /api/webhooks/payments/kuveyt-turk`

Frontend must:

1. call payment session with `provider: "kuveyt_turk"`
2. redirect using returned `redirect_url`
3. optionally call confirm endpoint on payment return page

## 12. Important Note About Bank-Specific Fields

The exact outbound fields sent from your backend to Kuveyt Turk, such as:

- merchant id
- terminal / store id
- hash or signature field name
- success / fail URL field names
- transaction type field name
- installment field names

must be taken from the merchant-specific Kuveyt Turk Sanal POS integration documents provided to your business account.

This internal contract keeps your frontend stable even if those provider-side field names differ.
