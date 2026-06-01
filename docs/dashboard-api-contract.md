# Dashboard API Contract

## Purpose

This document defines the API contract for the dashboard page currently implemented as static UI in:

- `pages/dashboard/index.vue`

Step status:

1. UI is implemented with fixed data
2. This document defines the backend contract
3. Frontend wiring to live endpoints will replace the static objects in the next step

## Goal

The dashboard needs four areas of data:

- Overview summary cards
- Recent and full bookings
- Payments
- Profile snapshot

The contract below is designed to match the current page structure closely so the integration layer stays thin.

---

## Recommended Endpoint Strategy

Use one aggregate endpoint for the first dashboard load, plus optional dedicated endpoints for tab-specific refreshes.

### Required

- `GET /api/tenant/dashboard`

### Optional, if tabs will paginate or refresh independently later

- `GET /api/tenant/dashboard/bookings`
- `GET /api/tenant/dashboard/payments`
- `GET /api/tenant/dashboard/profile`

---

## 1. Dashboard Overview

### GET `/api/tenant/dashboard`

Returns the complete initial dashboard payload.

### Response `200`

```json
{
  "success": true,
  "result": {
    "stats": {
      "total_bookings": 3,
      "active_bookings": 2,
      "total_spent": {
        "amount": 4150,
        "formatted": "$4,150.00",
        "currency": "USD"
      }
    },
    "recent_bookings": [
      {
        "reference": "BK-00000",
        "date": "2024-09-10",
        "status": "confirmed",
        "status_label": "Confirmed",
        "payment_status": "paid",
        "payment_status_label": "Paid",
        "total": {
          "amount": 1350,
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "room": {
          "name": "Studio Room - Movinn Residence",
          "slug": "studio-room-movinn-residence"
        },
        "location": {
          "area": "Beylikduzu",
          "city": "Istanbul",
          "country": "Turkey",
          "formatted": "Beylikduzu, Istanbul"
        },
        "duration": {
          "value": 3,
          "unit": "month",
          "label": "3 Months"
        }
      },
      {
        "reference": "BK-00001",
        "date": "2024-10-05",
        "status": "pending",
        "status_label": "Pending",
        "payment_status": "pending",
        "payment_status_label": "Pending",
        "total": {
          "amount": 950,
          "formatted": "$950.00",
          "currency": "USD"
        },
        "room": {
          "name": "Shared Room - City Campus",
          "slug": "shared-room-city-campus"
        },
        "location": {
          "area": "Sisli",
          "city": "Istanbul",
          "country": "Turkey",
          "formatted": "Sisli, Istanbul"
        },
        "duration": {
          "value": 1,
          "unit": "month",
          "label": "1 Month"
        }
      }
    ],
    "bookings": [
      {
        "reference": "BK-00000",
        "date": "2024-09-10",
        "status": "confirmed",
        "status_label": "Confirmed",
        "payment_status": "paid",
        "payment_status_label": "Paid",
        "room": {
          "name": "Studio Room - Movinn Residence",
          "slug": "studio-room-movinn-residence"
        },
        "location": {
          "area": "Beylikduzu",
          "city": "Istanbul",
          "country": "Turkey",
          "formatted": "Beylikduzu, Istanbul"
        },
        "total": {
          "amount": 1350,
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "duration": {
          "value": 3,
          "unit": "month",
          "label": "3 Months"
        }
      }
    ],
    "payments": [
      {
        "id": "pay-1",
        "title": "Booking BK-00000",
        "date": "2024-09-10",
        "amount": {
          "amount": 1350,
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "status": "paid",
        "status_label": "Paid"
      }
    ],
    "profile": {
      "completion_percentage": 85,
      "status_label": "85% Completed",
      "full_name": "Omar Ahmed",
      "email": "omar.ahmed@example.com",
      "phone": "+90 555 111 2233",
      "university": "Istanbul Aydin University",
      "nationality": "Egyptian"
    }
  }
}
```

---

## 2. Bookings Tab

### GET `/api/tenant/dashboard/bookings`

Use this if bookings become paginated or independently refreshed.

### Query Params

- `page`
- `per_page`
- `status` optional

### Response `200`

```json
{
  "success": true,
  "result": {
    "items": [
      {
        "reference": "BK-00000",
        "date": "2024-09-10",
        "status": "confirmed",
        "status_label": "Confirmed",
        "payment_status": "paid",
        "payment_status_label": "Paid",
        "room": {
          "name": "Studio Room - Movinn Residence",
          "slug": "studio-room-movinn-residence"
        },
        "location": {
          "area": "Beylikduzu",
          "city": "Istanbul",
          "country": "Turkey",
          "formatted": "Beylikduzu, Istanbul"
        },
        "total": {
          "amount": 1350,
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "duration": {
          "value": 3,
          "unit": "month",
          "label": "3 Months"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 10,
      "total": 3
    }
  }
}
```

---

## 3. Payments Tab

### GET `/api/tenant/dashboard/payments`

### Query Params

- `page`
- `per_page`
- `status` optional

### Response `200`

```json
{
  "success": true,
  "result": {
    "items": [
      {
        "id": "pay-1",
        "title": "Booking BK-00000",
        "date": "2024-09-10",
        "amount": {
          "amount": 1350,
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "status": "paid",
        "status_label": "Paid"
      },
      {
        "id": "pay-2",
        "title": "Booking BK-00001",
        "date": "2024-10-05",
        "amount": {
          "amount": 950,
          "formatted": "$950.00",
          "currency": "USD"
        },
        "status": "pending",
        "status_label": "Pending"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 10,
      "total": 3
    }
  }
}
```

---

## 4. Profile Tab

### GET `/api/tenant/dashboard/profile`

### Response `200`

```json
{
  "success": true,
  "result": {
    "profile": {
      "completion_percentage": 85,
      "status_label": "85% Completed",
      "full_name": "Omar Ahmed",
      "email": "omar.ahmed@example.com",
      "phone": "+90 555 111 2233",
      "university": "Istanbul Aydin University",
      "nationality": "Egyptian"
    }
  }
}
```

---

## Frontend Mapping Rules

The current dashboard page expects these frontend-ready shapes:

### `stats`

- `total_bookings` maps to stat card 1
- `active_bookings` maps to stat card 2
- `total_spent.formatted` maps to stat card 3

### `recent_bookings[]` and `bookings[]`

- `reference` renders booking number
- `date` should be ISO date so frontend can format it if needed
- `status_label` is preferred for direct UI display
- `payment_status_label` is preferred for direct UI display
- `room.name` maps to room title
- `location.formatted` maps to location label
- `total.formatted` maps to amount display
- `duration.label` maps to duration display

### `payments[]`

- `title` maps to payment row title
- `date` should be ISO date
- `amount.formatted` maps to displayed amount
- `status_label` is preferred for display

### `profile`

- `status_label` maps to profile completion status
- Remaining string fields map directly to the profile tab

---

## Status Values

### Booking status

- `confirmed`
- `pending`
- `cancelled`
- `expired`

### Payment status

- `paid`
- `pending`
- `failed`
- `under_review`

---

## Error Contract

All dashboard endpoints should return a consistent error shape.

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": {
    "field_name": ["Validation message"]
  },
  "code": "DASHBOARD_ERROR"
}
```

Recommended codes:

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `DASHBOARD_NOT_AVAILABLE`
- `VALIDATION_ERROR`

---

## Backend Notes

1. The aggregate endpoint should be fast because it powers the first dashboard render.
2. Prefer returning both raw values and `formatted` values for money and duration.
3. Dates should be returned in ISO format, even if labels are also included.
4. If the backend already has booking and payment resources, the dashboard endpoint can compose them server-side.
5. Keep field names stable to avoid rework in step 3.
