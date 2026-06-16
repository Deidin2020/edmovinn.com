# Room Booking API Contract

## Purpose

This document defines the backend contract required by the current accommodation flow in this frontend.

It reflects the actual code paths in:

- `components/search/RoomBox.vue`
- `pages/cart.vue`
- `pages/checkout.vue`
- `pages/auth/index.vue`
- `components/frontend/common/SummaryOrder.vue`
- `components/frontend/common/FormCheckout.vue`
- `components/frontend/common/EmergencyContact.vue`
- `components/frontend/common/PaymentMethod.vue`
- `services/BookingApiService.js`

## Current Journey

1. Guest browses rooms
2. Guest can add room to cart without login
3. Guest cart is stored in `sessionStorage`
4. If guest logs in, frontend syncs guest cart into tenant cart
5. Logged-in user opens cart
6. Logged-in user proceeds to checkout
7. Checkout validates cart, updates profile, creates booking
8. Payment flow continues based on selected payment method

## Source Of Truth

### Guest cart

- Stored in backend database using a guest cart token
- No backend auth required
- Frontend sends the token in `X-Cart-Token`
- Used before login and merged after login

### Tenant cart

- Stored in backend
- Used after login
- Required for checkout

## Implementation Status

### Already used by frontend

- `POST /api/tenant/register`
- `POST /api/tenant/login`
- `GET /api/tenant/me`
- `GET /api/rooms`
- `GET /api/rooms/{slug}`
- `GET /api/accommodations/{slug}`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/{itemId}`
- `DELETE /api/cart/items/{itemId}`
- `DELETE /api/cart`
- `GET /api/tenant/cart`
- `POST /api/tenant/cart/items`
- `PATCH /api/tenant/cart/items/{itemId}`
- `DELETE /api/tenant/cart/items/{itemId}`
- `POST /api/tenant/cart/merge`
- `POST /api/tenant/cart/validate`
- `GET /api/tenant/checkout/context`
- `PUT /api/tenant/profile`
- `POST /api/tenant/bookings`
- `POST /api/tenant/bookings/{bookingId}/payment-sessions`
- `POST /api/tenant/bookings/{bookingId}/payments/confirm`
- `POST /api/tenant/bookings/{bookingId}/bank-transfer-proof`
- `GET /api/tenant/bookings`
- `GET /api/tenant/dashboard`
- `GET /api/tenant/dashboard/bookings`
- `GET /api/tenant/dashboard/payments`
- `GET /api/tenant/dashboard/profile`

### Still required or recommended

- `POST /api/tenant/verify-mobile`
- `POST /api/tenant/resend-mobile-code`
- Google auth endpoints
- Forgot password endpoints
- Optional bulk guest-cart merge endpoint
- Optional booking details endpoint by reference or id

## Remaining Operations Required

### P0: Mandatory for booking flow to work cleanly

1. `GET /api/tenant/cart`
2. `POST /api/tenant/cart/items`
3. `PATCH /api/tenant/cart/items/{itemId}`
4. `DELETE /api/tenant/cart/items/{itemId}`
5. `POST /api/tenant/cart/validate`
6. `GET /api/tenant/checkout/context`
7. `PUT /api/tenant/profile`
8. `POST /api/tenant/bookings`
9. `POST /api/tenant/bookings/{bookingId}/payment-sessions`
10. `POST /api/tenant/bookings/{bookingId}/bank-transfer-proof`

### P1: Needed for complete payment and account continuity

1. `POST /api/tenant/bookings/{bookingId}/payments/confirm`
2. `GET /api/tenant/bookings`
3. `GET /api/tenant/dashboard`
4. `GET /api/tenant/dashboard/bookings`
5. `GET /api/tenant/dashboard/payments`
6. `GET /api/tenant/dashboard/profile`

### P2: Recommended improvements

1. `POST /api/tenant/cart/merge`
2. `GET /api/tenant/bookings/{reference}`
3. cart item hold / reservation expiry fields
4. payment webhook status sync

## Contract Rules

### Authentication

- Cart endpoints require tenant auth except guest cart, which is frontend-only
- Checkout requires authenticated, verified, profile-complete user
- Backend must return `401` for unauthenticated requests
- Backend should return `403` or business-code error for unverified or incomplete-profile users

### Pricing and inventory

- Backend must never trust frontend totals
- Backend must revalidate room availability during:
  - add to cart
  - cart validate
  - booking create
- Backend must be able to reject stale pricing or sold-out rooms

### Payments

- Raw card details must not be sent to your API
- Credit card flow must use provider session/tokenization
- Bank transfer proof must accept multipart upload

## Standard Response Shape

### Success

```json
{
  "success": true,
  "message": "Optional success message",
  "result": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": {
    "field": [
      "Validation message"
    ]
  },
  "code": "VALIDATION_ERROR"
}
```

### Recommended business codes

- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `MOBILE_NOT_VERIFIED`
- `PROFILE_INCOMPLETE`
- `ROOM_NOT_AVAILABLE`
- `PRICE_CHANGED`
- `CART_EMPTY`
- `BOOKING_EXPIRED`
- `PAYMENT_FAILED`

## Data Shapes Used By Frontend

### Room card shape

```json
{
  "id": 501,
  "name": "Single Standard Room",
  "slug": "single-standard-room",
  "image": "https://cdn.example.com/rooms/501/main.jpg",
  "availability": true,
  "available_from": "2026-09-01",
  "available_to": "2027-06-30",
  "size": 18,
  "room_type": "Single",
  "no_bed": 1,
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
    { "name": "WiFi" }
  ],
  "gender_map": [
    { "name": "Female" }
  ]
}
```

### Cart shape consumed by frontend

```json
{
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
      "availability_status": "available",
      "quantity": 1,
      "pricing": {
        "unit_price": 450,
        "deposit": 200,
        "currency": "USD",
        "payment_per": "month",
        "contract_type": "12 Months"
      },
      "line_total": 650
    }
  ],
  "summary": {
    "subtotal": 450,
    "deposit_total": 200,
    "grand_total": 650
  }
}
```

## Endpoint Contract

## A. Cart

### GET `/api/tenant/cart`

Returns the active authenticated cart.

#### Response `200`

```json
{
  "success": true,
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
          "availability_status": "available",
          "quantity": 1,
          "pricing": {
            "unit_price": 450,
            "deposit": 200,
            "currency": "USD",
            "payment_per": "month",
            "contract_type": "12 Months"
          },
          "line_total": 650
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

### POST `/api/tenant/cart/items`

Adds room to authenticated cart.

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
      "items": [],
      "summary": {
        "subtotal": 450,
        "deposit_total": 200,
        "grand_total": 650
      }
    }
  }
}
```

### PATCH `/api/tenant/cart/items/{itemId}`

Updates quantity or selected date.

#### Request

```json
{
  "quantity": 2,
  "stay_start_date": "2026-09-01"
}
```

### DELETE `/api/tenant/cart/items/{itemId}`

Removes item from cart.

### POST `/api/tenant/cart/validate`

Revalidates prices and availability before booking.

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

#### Response `409`

```json
{
  "success": false,
  "message": "One or more cart items are no longer available.",
  "code": "ROOM_NOT_AVAILABLE",
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

### POST `/api/tenant/cart/merge`

Required when guest cart is stored in the database and must be merged after login.

#### Request

Header:

```text
X-Cart-Token: gct_01JZEXAMPLE
```

Optional body:

```json
{
  "items": [
    {
      "room_id": 501,
      "quantity": 1,
      "stay_start_date": "2026-09-01"
    }
  ]
}
```

## B. Checkout Context

### GET `/api/tenant/checkout/context`

Returns checkout-safe cart, tenant profile, and payment methods.

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
      "currency": "USD",
      "items_count": 1,
      "items": [],
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

## C. Profile Update

### PUT `/api/tenant/profile`

Persists checkout profile fields.

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

## D. Booking Creation

### POST `/api/tenant/bookings`

Creates booking from validated cart.

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

## E. Payment Flows

### POST `/api/tenant/bookings/{bookingId}/payment-sessions`

Creates gateway session for credit card payments.

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

Confirms provider payment result.

#### Request

```json
{
  "provider": "stripe",
  "payment_intent_id": "pi_123"
}
```

### POST `/api/tenant/bookings/{bookingId}/bank-transfer-proof`

Accepts `multipart/form-data`.

#### Fields

- `receipt_file`
- `reference_number`
- `notes`

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

## F. Booking Retrieval

### GET `/api/tenant/bookings`

Returns authenticated user's bookings list.

#### Response `200`

```json
{
  "success": true,
  "result": {
    "items": [
      {
        "reference": "BK-20260601-9001",
        "date": "2026-06-01",
        "status": "confirmed",
        "status_label": "Confirmed",
        "payment_status": "paid",
        "payment_status_label": "Paid",
        "total": {
          "amount": 650,
          "formatted": "650 USD",
          "currency": "USD"
        },
        "room": {
          "name": "Single Standard Room"
        },
        "location": {
          "formatted": "Istanbul, Turkey"
        },
        "duration": {
          "label": "12 Months"
        }
      }
    ]
  }
}
```

### Optional: GET `/api/tenant/bookings/{reference}`

Recommended for future booking details page.

## G. Dashboard

### GET `/api/tenant/dashboard`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "stats": {
      "total_bookings": 3,
      "active_bookings": 1,
      "total_spent": {
        "amount": 1850,
        "formatted": "1850 USD",
        "currency": "USD"
      }
    },
    "recent_bookings": [],
    "bookings": [],
    "payments": [],
    "profile": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+905551112233",
      "university": "Istanbul University",
      "nationality": "Egyptian",
      "status_label": "Complete"
    }
  }
}
```

### GET `/api/tenant/dashboard/bookings`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "items": [],
    "pagination": null
  }
}
```

### GET `/api/tenant/dashboard/payments`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "items": [],
    "pagination": null
  }
}
```

### GET `/api/tenant/dashboard/profile`

#### Response `200`

```json
{
  "success": true,
  "result": {
    "profile": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+905551112233",
      "university": "Istanbul University",
      "nationality": "Egyptian",
      "status_label": "Complete"
    }
  }
}
```

## Backend Notes

### Guest cart persistence is now backend-required

The frontend no longer treats guest cart as local-only storage.

Backend is required for:

- guest add to cart
- guest update quantity
- guest remove from cart
- guest revisit cart before login
- merge after login

### Current frontend sync behavior after login

Frontend first attempts `POST /api/tenant/cart/merge` using `X-Cart-Token`.

If merge is unavailable, frontend falls back to:

- loading the guest database cart
- replaying its items into `POST /api/tenant/cart/items`

That means:

- `POST /api/tenant/cart/merge` should be implemented
- fallback replay still exists for compatibility

## Recommended Delivery Order

1. Finish guest cart endpoints
2. Finish checkout context
3. Finish profile update
4. Finish booking creation
5. Finish payment session and bank transfer proof
6. Finish booking list and dashboard endpoints
7. Add optional merge and booking-details endpoints
