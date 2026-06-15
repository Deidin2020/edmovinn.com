# Critical Frontend API Contract

This is the minimum backend contract required by the rewritten frontend flows:

- registration
- login
- cart
- checkout
- dashboard

All endpoints should return this envelope:

```json
{
  "success": true,
  "message": "Optional message",
  "result": {}
}
```

Validation or business errors should return:

```json
{
  "success": false,
  "message": "Human readable error",
  "code": "VALIDATION_ERROR",
  "errors": {
    "field": [
      "Error message"
    ]
  }
}
```

## Auth

### `POST /api/tenant/register`

Request:

```json
{
  "full_name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "mobile": "+201001234567",
  "password": "StrongPassword123",
  "password_confirmation": "StrongPassword123"
}
```

Success:

```json
{
  "success": true,
  "message": "Registered successfully.",
  "result": {
    "tenant": {
      "id": 10,
      "full_name": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "mobile": "+201001234567",
      "is_verified": true
    },
    "requires_verification": false
  }
}
```

### `POST /api/tenant/login`

Request:

```json
{
  "mobile": "+201001234567",
  "password": "StrongPassword123",
  "remember_me": true
}
```

Success:

```json
{
  "access_token": "jwt-or-api-token"
}
```

### `GET /api/tenant/me`

Success:

```json
{
  "success": true,
  "result": {
    "tenant": {
      "id": 10,
      "full_name": "Ahmed Hassan",
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "email": "ahmed@example.com",
      "mobile": "+201001234567",
      "date_of_birth": "2002-03-12",
      "university": "Istanbul Aydin University",
      "university_name": "Istanbul Aydin University",
      "nationality": "Egyptian",
      "address": "Istanbul, Turkey",
      "is_verified": true
    }
  }
}
```

### `GET /api/tenant/logout`

Success:

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

## Cart

### `GET /api/tenant/cart`
### `POST /api/tenant/cart/items`
### `PATCH /api/tenant/cart/items/{itemId}`
### `DELETE /api/tenant/cart/items/{itemId}`
### `POST /api/tenant/cart/validate`

Cart shape:

```json
{
  "id": "cart_123",
  "currency": "USD",
  "items_count": 1,
  "items": [
    {
      "id": "ci_1",
      "room_id": 501,
      "name": "Single Standard Room",
      "slug": "single-standard-room",
      "image": "https://cdn.example.com/room.jpg",
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

## Checkout

### `GET /api/tenant/checkout/context`

Success:

```json
{
  "success": true,
  "result": {
    "tenant": {
      "full_name": "Ahmed Hassan",
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "email": "ahmed@example.com",
      "mobile": "+201001234567",
      "date_of_birth": "2002-03-12",
      "university": "Istanbul Aydin University",
      "university_name": "Istanbul Aydin University",
      "nationality": "Egyptian",
      "address": "Istanbul, Turkey"
    },
    "cart": {},
    "payment_methods": [
      {
        "code": "pay_at_property",
        "label": "Pay at Property",
        "description": "Pay when you arrive."
      },
      {
        "code": "credit_card",
        "label": "Credit Card",
        "description": "Pay online."
      },
      {
        "code": "bank_transfer",
        "label": "Bank Transfer",
        "description": "Upload proof after transfer."
      }
    ]
  }
}
```

### `PUT /api/tenant/profile`

The frontend now sends both naming variants for compatibility:

```json
{
  "full_name": "Ahmed Hassan",
  "first_name": "Ahmed",
  "last_name": "Hassan",
  "email": "ahmed@example.com",
  "mobile": "+201001234567",
  "phone": "+201001234567",
  "date_of_birth": "2002-03-12",
  "university": "Istanbul Aydin University",
  "university_name": "Istanbul Aydin University",
  "nationality": "Egyptian",
  "address": "Istanbul, Turkey"
}
```

### `POST /api/tenant/bookings`

Request:

```json
{
  "cart_id": "cart_123",
  "guest": {
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "email": "ahmed@example.com",
    "mobile": "+201001234567",
    "date_of_birth": "2002-03-12",
    "university_name": "Istanbul Aydin University",
    "nationality": "Egyptian",
    "address": "Istanbul, Turkey"
  },
  "emergency_contact": {
    "name": "Sara Hassan",
    "phone": "+201009998887",
    "relation": "Mother"
  },
  "payment_method": "credit_card",
  "notes": "Optional notes"
}
```

Success:

```json
{
  "success": true,
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260615-9001",
      "status": "awaiting_payment",
      "payment_status": "pending"
    }
  }
}
```

### `POST /api/tenant/bookings/{bookingId}/payment-sessions`

Success should return at least one of:

- `redirect_url`
- `checkout_url`
- `url`
- `client_secret`

Example:

```json
{
  "success": true,
  "result": {
    "payment_session": {
      "id": "ps_123",
      "provider": "stripe",
      "redirect_url": "https://checkout.stripe.com/pay/example"
    }
  }
}
```

### `POST /api/tenant/bookings/{bookingId}/bank-transfer-proof`

Accept `multipart/form-data` with:

- `receipt_file`
- `reference_number`
- `notes`

## Dashboard

### `GET /api/tenant/dashboard`
### `GET /api/tenant/dashboard/bookings`
### `GET /api/tenant/dashboard/payments`
### `GET /api/tenant/dashboard/profile`

Profile fields returned by dashboard endpoints should include:

```json
{
  "full_name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "mobile": "+201001234567",
  "phone": "+201001234567",
  "university": "Istanbul Aydin University",
  "university_name": "Istanbul Aydin University",
  "nationality": "Egyptian",
  "address": "Istanbul, Turkey",
  "date_of_birth": "2002-03-12",
  "completion": {
    "percentage": 100,
    "label": "100% Completed"
  }
}
```

For more details, also see:

- [auth-api-contract.md](/C:/laragon/www/edmovinn.com/docs/auth-api-contract.md)
- [room-booking-api-contract.md](/C:/laragon/www/edmovinn.com/docs/room-booking-api-contract.md)
- [dashboard-api-contract.md](/C:/laragon/www/edmovinn.com/docs/dashboard-api-contract.md)
