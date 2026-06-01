# Room Booking API Contract

## Purpose

This document defines the API contract for the full accommodation booking journey based on the current frontend flow in this project:

1. Create account
2. Login
3. Verify mobile number
4. Complete profile if needed
5. Browse room details
6. Add room to cart
7. Review cart
8. Checkout
9. Create booking
10. Complete payment

It is based on the current UI and data usage in:

- `pages/auth/index.vue`
- `components/frontend/auth/FormRegister.vue`
- `components/frontend/auth/FormVerify.vue`
- `components/frontend/auth/FormCompleteProfile.vue`
- `pages/rooms/_slug.vue`
- `components/search/RoomBox.vue`
- `pages/cart.vue`
- `pages/checkout.vue`
- `components/frontend/common/SummaryOrder.vue`
- `components/frontend/common/FormCheckout.vue`
- `components/frontend/common/EmergencyContact.vue`
- `components/frontend/common/PaymentMethod.vue`
- `utils/DataFormatter.js`

## Current Frontend State

### Already integrated

- `POST /api/tenant/register`
- `POST /api/tenant/login`
- `GET /api/tenant/logout`
- `GET /api/tenant/me`
- `POST /api/tenant/verify-mobile`
- `POST /api/tenant/resend-mobile-code`
- `PUT /api/tenant/complete-profile`
- `GET /api/rooms`
- `GET /api/rooms/{slug}`
- `GET /api/accommodations/{slug}`

### Not yet integrated, but required by the checkout flow

- Server-side cart
- Booking price revalidation
- Room availability lock/reservation hold
- Booking creation
- Payment session/initiation
- Payment proof upload or payment confirmation
- Booking status retrieval

## Journey Analysis

### 1. Registration

Frontend sends:

- `full_name`
- `email`
- `password`
- `password_confirmation`
- `country_code`
- `mobile`
- `contact_number`

Observed behavior:

- After registration, frontend auto-logs the user in using `mobile + password`
- Then redirects user to OTP verification page

### 2. Login

Frontend sends:

- `mobile`
- `password`
- `remember_me`
- `country_code` may also be present from phone component

Observed behavior:

- Auth token is expected in `access_token`
- User payload is expected in `result.tenant`
- If a redirect path was saved before login, frontend returns the user there after success

### 3. Mobile Verification

Frontend sends:

- `mobile`
- `code`

Observed behavior:

- OTP length is 6 digits
- Frontend also supports resend OTP

### 4. Complete Profile

Current screen only updates:

- `mobile`

But the checkout design already asks for a richer customer profile:

- first name
- last name
- email
- mobile
- date of birth
- university name
- nationality
- address

This means either:

1. Checkout submits booking-only customer data every time, or
2. A profile API is expanded so checkout can preload and persist these fields

Recommendation:

- Keep `complete-profile` for account readiness
- Add profile read/update endpoints for reusable checkout identity data

### 5. Room Selection

Room card currently depends on these fields:

- `id`
- `name`
- `slug`
- `image`
- `availability`
- `available_from`
- `available_to`
- `size`
- `room_type`
- `no_bed`
- `accommodation.id`
- `accommodation.name`
- `accommodation.slug`
- `accommodation.image`
- `accommodation.state`
- `accommodation.city`
- `accommodation.country`
- `price.service` mapped as `contract_type`
- `price.payment_method` mapped as `payment_per`
- `price.price`
- `price.deposit`
- `price.currency`
- `facilities[].name`
- `gender_map[].name`

Current issue:

- Add to cart is client-only in `localStorage`
- Quantity can increase for the same room, which is risky for room inventory unless business rules truly allow multi-booking of the same room by one user

Recommendation:

- Treat each room line as a single reservable inventory unit by default
- Backend must validate whether quantity > 1 is allowed

### 6. Cart

Cart currently stores:

- `id`
- `name`
- `price`
- `image`
- `slug`
- `accommodation`
- `available_from`
- `quantity`

Missing but needed in a real contract:

- `room_id`
- selected stay period or intake date if applicable
- pricing snapshot version
- reservation token or hold token
- availability status at validation time

### 7. Checkout

Checkout UI collects three groups:

#### Personal information

- `first_name`
- `last_name`
- `email`
- `mobile`
- `date_of_birth`
- `university_name`
- `nationality`
- `address`

#### Emergency contact

- `name`
- `phone`
- `relation`

#### Payment method

- `property`
- `credit`
- `bank`

Payment-specific extra fields shown by the current design:

- For `credit`: cardholder name, card number, expiry, cvc
- For `bank`: receipt upload

Important recommendation:

- Card details must never pass through this frontend to your own API unless you are PCI compliant
- Use a payment gateway session/tokenization flow instead

### 8. Booking and Payment

The current UI suggests 3 payment modes:

1. Pay at property
2. Credit card
3. Bank transfer

Each one needs a different backend path:

- `pay_at_property`: booking can be created as `pending_confirmation` or `reserved`
- `credit_card`: booking is created, then payment session is initialized
- `bank_transfer`: booking is created as `awaiting_transfer_proof` or `awaiting_manual_verification`

## Proposed API Contract

---

## A. Authentication

### POST `/api/tenant/register`

Creates a tenant account.

#### Request

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "Secret123!",
  "password_confirmation": "Secret123!",
  "country_code": "TR",
  "mobile": "+905551112233",
  "contact_number": "+90 555 111 22 33"
}
```

#### Response `201`

```json
{
  "success": true,
  "message": "Registered successfully. Verification code sent.",
  "result": {
    "tenant": {
      "id": 101,
      "full_name": "John Doe",
      "email": "john@example.com",
      "mobile": "+905551112233",
      "is_verified": false,
      "profile_completed": false
    }
  }
}
```

#### Validation errors `422`

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["The email has already been taken."],
    "mobile": ["The mobile format is invalid."]
  }
}
```

### POST `/api/tenant/login`

#### Request

```json
{
  "mobile": "+905551112233",
  "password": "Secret123!",
  "remember_me": true
}
```

#### Response `200`

```json
{
  "access_token": "jwt-or-api-token",
  "token_type": "Bearer",
  "expires_in": 1800,
  "result": {
    "tenant": {
      "id": 101,
      "full_name": "John Doe",
      "email": "john@example.com",
      "mobile": "+905551112233",
      "is_verified": true,
      "profile_completed": true
    }
  }
}
```

### GET `/api/tenant/me`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "tenant": {
      "id": 101,
      "full_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "mobile": "+905551112233",
      "is_verified": true,
      "profile_completed": true,
      "date_of_birth": "2002-05-14",
      "university_name": "Istanbul University",
      "nationality": "Egyptian",
      "address": "Istanbul, Turkey"
    }
  }
}
```

### POST `/api/tenant/verify-mobile`

#### Request

```json
{
  "mobile": "+905551112233",
  "code": "123456"
}
```

#### Response `200`

```json
{
  "success": true,
  "message": "Mobile verified successfully."
}
```

### POST `/api/tenant/resend-mobile-code`

#### Request

```json
{
  "mobile": "+905551112233"
}
```

#### Response `200`

```json
{
  "success": true,
  "message": "Verification code resent successfully."
}
```

### PUT `/api/tenant/profile`

Recommended new endpoint to support checkout prefill.

#### Request

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile": "+905551112233",
  "date_of_birth": "2002-05-14",
  "university_name": "Istanbul University",
  "nationality": "Egyptian",
  "address": "Istanbul, Turkey"
}
```

#### Response `200`

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "result": {
    "tenant": {
      "id": 101,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "mobile": "+905551112233",
      "date_of_birth": "2002-05-14",
      "university_name": "Istanbul University",
      "nationality": "Egyptian",
      "address": "Istanbul, Turkey"
    }
  }
}
```

---

## B. Room Listing and Details

### GET `/api/rooms`

Should return items compatible with `formatRoomData`.

#### Query params

- `page`
- `accommodation_id`
- `reservation_keys[]`
- `room_keys[]`
- `available_from`
- `min_price`
- `max_price`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "item": [
      {
        "id": 501,
        "name": "Single Standard Room",
        "slug": "single-standard-room",
        "image": "https://cdn.example.com/rooms/501/main.jpg",
        "availability": true,
        "available_from": "2026-09-01",
        "available_to": "2027-06-30",
        "no_bed": 1,
        "room_type": "Single",
        "size": 18,
        "accommodation": {
          "id": 12,
          "name": "MovInn Residence",
          "slug": "movinn-residence",
          "image": "https://cdn.example.com/accommodations/12/main.jpg",
          "state": "Istanbul",
          "city": "Istanbul",
          "country": "Turkey"
        },
        "price": {
          "service": "12 Months",
          "payment_method": "month",
          "price": "450",
          "deposit": "200",
          "currency": "USD"
        },
        "facilities": [
          { "name": "WiFi" },
          { "name": "Desk" }
        ],
        "gender_map": [
          { "name": "Female" }
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 4,
      "total_records": 80
    }
  }
}
```

### GET `/api/rooms/{slug}`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "item": {
      "id": 501,
      "name": "Single Standard Room",
      "slug": "single-standard-room",
      "description": "Room details...",
      "image": "https://cdn.example.com/rooms/501/main.jpg",
      "images": [
        "https://cdn.example.com/rooms/501/1.jpg",
        "https://cdn.example.com/rooms/501/2.jpg"
      ],
      "availability": true,
      "available_from": "2026-09-01",
      "available_to": "2027-06-30",
      "size": 18,
      "room_type": "Single",
      "payment_types": [
        { "code": "month", "name": "Monthly" }
      ],
      "price": {
        "service": "12 Months",
        "payment_method": "month",
        "price": "450",
        "deposit": "200",
        "currency": "USD"
      },
      "accommodation": {
        "id": 12,
        "name": "MovInn Residence",
        "slug": "movinn-residence",
        "state": "Istanbul",
        "city": "Istanbul",
        "country": "Turkey",
        "address": "Sisli, Istanbul"
      },
      "facilities": [
        { "name": "WiFi" },
        { "name": "Desk" }
      ],
      "gender_map": [
        { "name": "Female" }
      ]
    }
  }
}
```

---

## C. Server-Side Cart

Current frontend uses local storage, but the required contract should be server-side for validation and checkout continuity across devices.

### POST `/api/tenant/cart/items`

Add room to cart.

#### Request

```json
{
  "room_id": 501,
  "quantity": 1,
  "stay_start_date": "2026-09-01"
}
```

#### Response `200`

```json
{
  "success": true,
  "message": "Room added to cart.",
  "result": {
    "cart": {
      "id": "cart_8d91a",
      "currency": "USD",
      "items_count": 1,
      "items": [
        {
          "id": "ci_1001",
          "room_id": 501,
          "name": "Single Standard Room",
          "slug": "single-standard-room",
          "image": "https://cdn.example.com/rooms/501/main.jpg",
          "accommodation": "MovInn Residence",
          "available_from": "2026-09-01",
          "quantity": 1,
          "pricing": {
            "unit_price": 450,
            "deposit": 200,
            "currency": "USD",
            "payment_per": "month",
            "contract_type": "12 Months"
          },
          "line_total": 650,
          "availability_status": "available"
        }
      ],
      "summary": {
        "subtotal": 450,
        "deposit_total": 200,
        "grand_total": 650
      }
    }
  }
}
```

### GET `/api/tenant/cart`

Returns the active cart.

### PATCH `/api/tenant/cart/items/{itemId}`

Update quantity or selected date.

#### Request

```json
{
  "quantity": 1,
  "stay_start_date": "2026-09-01"
}
```

### DELETE `/api/tenant/cart/items/{itemId}`

Remove cart item.

### POST `/api/tenant/cart/validate`

Revalidates pricing and inventory before checkout.

#### Response `200`

```json
{
  "success": true,
  "result": {
    "valid": true,
    "cart": {
      "id": "cart_8d91a",
      "items": [
        {
          "id": "ci_1001",
          "room_id": 501,
          "availability_status": "available",
          "price_changed": false
        }
      ],
      "summary": {
        "subtotal": 450,
        "deposit_total": 200,
        "grand_total": 650
      }
    }
  }
}
```

#### Conflict response `409`

```json
{
  "success": false,
  "message": "One or more cart items are no longer available.",
  "result": {
    "valid": false,
    "items": [
      {
        "room_id": 501,
        "status": "sold_out"
      }
    ]
  }
}
```

---

## D. Checkout Prefill

### GET `/api/tenant/checkout/context`

Returns everything needed to render checkout safely.

#### Response `200`

```json
{
  "success": true,
  "result": {
    "tenant": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "mobile": "+905551112233",
      "date_of_birth": "2002-05-14",
      "university_name": "Istanbul University",
      "nationality": "Egyptian",
      "address": "Istanbul, Turkey"
    },
    "cart": {
      "id": "cart_8d91a",
      "items": [
        {
          "id": "ci_1001",
          "room_id": 501,
          "name": "Single Standard Room",
          "quantity": 1,
          "pricing": {
            "unit_price": 450,
            "deposit": 200,
            "currency": "USD"
          }
        }
      ],
      "summary": {
        "subtotal": 450,
        "deposit_total": 200,
        "grand_total": 650
      }
    },
    "payment_methods": [
      {
        "code": "pay_at_property",
        "label": "Pay at Property"
      },
      {
        "code": "credit_card",
        "label": "Credit Card"
      },
      {
        "code": "bank_transfer",
        "label": "Bank Transfer"
      }
    ]
  }
}
```

---

## E. Booking Creation

### POST `/api/tenant/bookings`

Creates a booking from the validated cart.

#### Request

```json
{
  "cart_id": "cart_8d91a",
  "guest": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "mobile": "+905551112233",
    "date_of_birth": "2002-05-14",
    "university_name": "Istanbul University",
    "nationality": "Egyptian",
    "address": "Istanbul, Turkey"
  },
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "+201001112233",
    "relation": "Mother"
  },
  "payment_method": "credit_card",
  "notes": "Near the university if possible"
}
```

#### Response `201`

```json
{
  "success": true,
  "message": "Booking created successfully.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260601-9001",
      "status": "awaiting_payment",
      "payment_status": "pending",
      "currency": "USD",
      "subtotal": 450,
      "deposit_total": 200,
      "grand_total": 650,
      "expires_at": "2026-06-01T22:30:00Z"
    },
    "next_action": {
      "type": "init_payment"
    }
  }
}
```

#### Conflict response `409`

```json
{
  "success": false,
  "message": "Selected room is no longer available.",
  "result": {
    "booking": null
  }
}
```

---

## F. Payment Flows

## 1. Pay at Property

If `payment_method = pay_at_property`, booking can be finalized immediately.

### Response after booking creation

```json
{
  "success": true,
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260601-9001",
      "status": "reserved",
      "payment_status": "pending_on_arrival"
    },
    "next_action": {
      "type": "show_instructions",
      "instructions": {
        "deadline_hours": 48
      }
    }
  }
}
```

## 2. Credit Card

Do not send raw card details to your API. Use a payment gateway session.

### POST `/api/tenant/bookings/{bookingId}/payment-sessions`

#### Request

```json
{
  "provider": "stripe"
}
```

#### Response `200`

```json
{
  "success": true,
  "result": {
    "payment_session": {
      "id": "ps_123",
      "provider": "stripe",
      "client_secret": "secret_value",
      "publishable_key": "pk_live_or_test",
      "amount": 650,
      "currency": "USD"
    }
  }
}
```

### POST `/api/tenant/bookings/{bookingId}/payments/confirm`

Called after gateway confirmation or by webhook-backed polling flow.

#### Request

```json
{
  "provider": "stripe",
  "payment_intent_id": "pi_123"
}
```

#### Response `200`

```json
{
  "success": true,
  "message": "Payment confirmed.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260601-9001",
      "status": "confirmed",
      "payment_status": "paid"
    }
  }
}
```

## 3. Bank Transfer

### POST `/api/tenant/bookings/{bookingId}/bank-transfer-proof`

`multipart/form-data`

#### Fields

- `receipt_file`
- `reference_number` optional
- `notes` optional

#### Response `200`

```json
{
  "success": true,
  "message": "Transfer proof uploaded successfully.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260601-9001",
      "status": "awaiting_payment_review",
      "payment_status": "under_review"
    }
  }
}
```

---

## G. Booking Retrieval

### GET `/api/tenant/bookings/{reference}`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260601-9001",
      "status": "confirmed",
      "payment_status": "paid",
      "payment_method": "credit_card",
      "currency": "USD",
      "subtotal": 450,
      "deposit_total": 200,
      "grand_total": 650,
      "guest": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "mobile": "+905551112233"
      },
      "emergency_contact": {
        "name": "Jane Doe",
        "phone": "+201001112233",
        "relation": "Mother"
      },
      "items": [
        {
          "room_id": 501,
          "room_name": "Single Standard Room",
          "accommodation_name": "MovInn Residence",
          "quantity": 1,
          "unit_price": 450,
          "deposit": 200
        }
      ]
    }
  }
}
```

---

## Error Contract

All endpoints should use a consistent error shape.

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": {
    "field_name": ["Validation message"]
  },
  "code": "VALIDATION_ERROR"
}
```

Recommended business codes:

- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `MOBILE_NOT_VERIFIED`
- `PROFILE_INCOMPLETE`
- `ROOM_NOT_AVAILABLE`
- `PRICE_CHANGED`
- `PAYMENT_FAILED`
- `BOOKING_EXPIRED`

## Status Model

### Booking status

- `draft`
- `awaiting_payment`
- `awaiting_payment_review`
- `reserved`
- `confirmed`
- `cancelled`
- `expired`

### Payment status

- `unpaid`
- `pending`
- `under_review`
- `paid`
- `failed`
- `refunded`
- `pending_on_arrival`

## Mandatory Backend Rules

1. Revalidate room availability before booking creation.
2. Revalidate price and deposit before payment.
3. Do not trust local cart totals from frontend.
4. Do not accept raw credit card data into your application backend.
5. Enforce that only verified users can create bookings.
6. Enforce profile completeness if booking requires verified guest identity.
7. Prevent quantity inflation unless the room model explicitly supports multi-unit booking.

## Gaps Between Current Frontend and Required Backend

### Current gaps

- Cart is local only
- Checkout form fields are not bound to API
- Payment method selection is local only
- Credit card form is demo-only
- No booking ID or reservation hold exists
- No checkout validation endpoint exists

### Minimum implementation path

1. Keep existing auth endpoints
2. Add server-side cart endpoints
3. Add checkout context endpoint
4. Add booking creation endpoint
5. Add payment session endpoint
6. Add bank transfer proof upload endpoint
7. Add booking details endpoint

## Recommended Frontend Integration Order

1. Replace `localStorage` cart with `/api/tenant/cart`
2. Bind checkout fields to a real payload
3. Call `/api/tenant/cart/validate` before creating booking
4. Call `POST /api/tenant/bookings`
5. Branch by returned `payment_method`
6. Confirm payment and route to booking confirmation page
