# Dashboard API Contract

## Scope

This document defines the backend contract for the dashboard experience rendered in:

- `pages/dashboard/index.vue`

It covers all dashboard sections:

- Overview summary cards
- Recent bookings
- Full bookings list
- Booking process timeline details
- Payments list
- Invoice modal details
- Profile summary

The goal is to make frontend integration thin, predictable, and production-safe.

---

## Design Principles

1. Use one aggregate endpoint for the initial dashboard page load.
2. Allow optional tab-specific endpoints for pagination or independent refresh.
3. Return both raw values and frontend-ready formatted values where formatting stability matters.
4. Keep enum values stable and machine-friendly.
5. Keep translations optional at API level.
   The frontend can localize labels, but the backend may also return localized labels if desired.

---

## Authentication

All dashboard endpoints require authenticated tenant access.

Recommended middleware assumptions:

- User is logged in
- User belongs to tenant guard / tenant auth strategy
- User is allowed to view only their own dashboard data

Recommended authorization behavior:

- `401` if unauthenticated
- `403` if authenticated but forbidden

---

## Endpoint Strategy

### Required aggregate endpoint

- `GET /api/tenant/dashboard`

### Recommended tab-specific endpoints

- `GET /api/tenant/dashboard/bookings`
- `GET /api/tenant/dashboard/payments`
- `GET /api/tenant/dashboard/profile`

### Recommended optional detail endpoints

- `GET /api/tenant/bookings/{bookingReference}`
- `GET /api/tenant/payments/{paymentId}`

The aggregate endpoint should power the first render. The tab-specific endpoints are useful if:

- bookings become paginated
- payments become paginated
- profile can be edited and re-fetched independently
- timeline sections get refreshed after uploads or payment changes

---

## Standard Response Envelope

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
    "field_name": [
      "Validation or business error message"
    ]
  },
  "code": "DASHBOARD_ERROR"
}
```

### Recommended error codes

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `DASHBOARD_NOT_AVAILABLE`
- `BOOKING_NOT_FOUND`
- `PAYMENT_NOT_FOUND`
- `FILE_UPLOAD_PENDING`
- `PAYMENT_UNDER_REVIEW`

---

## Aggregate Dashboard Endpoint

## `GET /api/tenant/dashboard`

Returns everything needed for the initial dashboard render.

### Query Params

Optional:

- `include=bookings,payments,profile,recent_bookings`
- `bookings_limit=10`
- `payments_limit=10`
- `recent_bookings_limit=2`

If omitted, the backend should return sensible defaults.

### Response `200`

```json
{
  "success": true,
  "result": {
    "generated_at": "2026-06-06T12:30:00Z",
    "currency": "USD",
    "stats": {
      "total_bookings": 3,
      "active_bookings": 2,
      "total_paid": {
        "amount": 2300,
        "formatted": "$2,300.00",
        "currency": "USD"
      }
    },
    "recent_bookings": [
      {
        "reference": "BK-00000",
        "created_at": "2024-09-10",
        "status": "confirmed",
        "status_label": "Confirmed",
        "payment_status": "paid",
        "payment_status_label": "Paid",
        "amount": {
          "amount": 1350,
          "formatted_short": "$1,350",
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "room": {
          "id": 101,
          "name": "Studio Room - Movinn Residence",
          "slug": "studio-room-movinn-residence"
        },
        "location": {
          "area": "Beylikduzu",
          "city": "Istanbul",
          "country": "Turkey",
          "formatted": "Beylikduzu, Istanbul"
        }
      },
      {
        "reference": "BK-00001",
        "created_at": "2024-10-05",
        "status": "pending",
        "status_label": "Pending",
        "payment_status": "pending",
        "payment_status_label": "Pending",
        "amount": {
          "amount": 950,
          "formatted_short": "$950",
          "formatted": "$950.00",
          "currency": "USD"
        },
        "room": {
          "id": 205,
          "name": "Shared Room - City Campus",
          "slug": "shared-room-city-campus"
        },
        "location": {
          "area": "Sisli",
          "city": "Istanbul",
          "country": "Turkey",
          "formatted": "Sisli, Istanbul"
        }
      }
    ],
    "bookings": [
      {
        "reference": "BK-00000",
        "created_at": "2024-09-10",
        "status": "confirmed",
        "status_label": "Confirmed",
        "payment_status": "paid",
        "payment_status_label": "Paid",
        "payment_display_status": "paid",
        "items_count": 1,
        "university": {
          "id": 11,
          "name": "Istanbul Aydin University"
        },
        "payment_method": {
          "code": "credit_card",
          "label": "Credit Card"
        },
        "room": {
          "id": 101,
          "name": "Studio Room - Movinn Residence",
          "details_label": "A-101 • Studio Room - Movinn Residence"
        },
        "location": {
          "area": "Beylikduzu",
          "city": "Istanbul",
          "country": "Turkey",
          "formatted": "Beylikduzu, Istanbul"
        },
        "amount": {
          "amount": 1350,
          "formatted_short": "$1,350",
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "pricing_breakdown": {
          "rent": {
            "amount": 1100,
            "formatted": "$1,100"
          },
          "deposit": {
            "amount": 250,
            "formatted": "$250"
          },
          "price_line": "$1,100/mo + $250 deposit"
        },
        "duration": {
          "check_in": "2024-06-30",
          "check_out": "2024-09-01",
          "formatted": "2024-06-30 → 2024-09-01"
        },
        "progress": {
          "percentage": 75,
          "formatted": "75%",
          "state": "healthy"
        },
        "documents": [
          {
            "code": "passport_copy",
            "name": "Passport Copy",
            "status": "uploaded",
            "status_label": "Uploaded",
            "required": true
          },
          {
            "code": "acceptance_letter",
            "name": "University Acceptance Letter",
            "status": "uploaded",
            "status_label": "Uploaded",
            "required": true
          },
          {
            "code": "financial_statement",
            "name": "Financial Statement",
            "status": "pending",
            "status_label": "Pending",
            "required": true
          }
        ],
        "timeline": {
          "steps": [
            {
              "order": 1,
              "code": "select_room",
              "label": "Select Room",
              "status": "completed"
            },
            {
              "order": 2,
              "code": "upload_documents",
              "label": "Upload Documents",
              "status": "in_progress"
            },
            {
              "order": 3,
              "code": "payment",
              "label": "Payment",
              "status": "completed"
            },
            {
              "order": 4,
              "code": "final_status",
              "label": "Final Status",
              "status": "completed"
            }
          ],
          "summary_flags": {
            "docs_done": false,
            "payment_done": true,
            "final_done": true
          }
        },
        "status_bar": {
          "booking": {
            "code": "booking_confirmed",
            "label": "Booking Confirmed",
            "tone": "success"
          },
          "payment": {
            "code": "paid_successfully",
            "label": "Paid Successfully",
            "tone": "success"
          },
          "documents": {
            "code": "docs_partial",
            "label": "Docs: Partially Uploaded",
            "tone": "warning"
          }
        },
        "step_panels": {
          "select_room": {
            "title": "Room Selection Complete",
            "description": "The room was selected and reserved successfully",
            "status": "completed",
            "note": "Room successfully selected and reserved"
          },
          "upload_documents": {
            "title": "Document Upload",
            "description": "Upload the required documents to continue",
            "status": "in_progress",
            "note": "Please upload all required documents to proceed"
          },
          "payment": {
            "title": "Payment Processing",
            "description": "Credit Card",
            "status": "completed",
            "note": "Payment confirmed successfully."
          },
          "final_status": {
            "title": "Final Booking Status",
            "description": "Application review and final confirmation",
            "status": "completed",
            "note": "Booking completed and confirmed."
          }
        }
      }
    ],
    "payments": [
      {
        "id": "pay_001",
        "reference": "BK-00000",
        "type": "booking_payment",
        "title": "Booking #BK-00000",
        "method": {
          "code": "credit_card",
          "label": "Credit Card",
          "display_code": "credit_card"
        },
        "date": "2024-09-10",
        "amount": {
          "amount": 1350,
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "status": "paid",
        "status_label": "Paid",
        "invoice": {
          "invoice_number": "INV-10001",
          "download_url": "https://api.example.com/storage/invoices/INV-10001.pdf"
        }
      },
      {
        "id": "pay_003",
        "reference": null,
        "type": "security_deposit",
        "title": "Security Deposit",
        "method": {
          "code": "credit_card",
          "label": "Credit Card",
          "display_code": "credit_card"
        },
        "date": "2024-12-04",
        "amount": {
          "amount": 500,
          "formatted": "$500.00",
          "currency": "USD"
        },
        "status": "paid",
        "status_label": "Paid",
        "invoice": {
          "invoice_number": "INV-10003",
          "download_url": "https://api.example.com/storage/invoices/INV-10003.pdf"
        }
      }
    ],
    "profile": {
      "full_name": "Ahmed Al-Rashidi",
      "email": "demo@edmovinn.com",
      "mobile": "+966501234567",
      "university": "Istanbul Aydin University",
      "nationality": "Saudi Arabian",
      "address": "Istanbul, Turkey",
      "date_of_birth": "2000-05-15",
      "completion": {
        "percentage": 85,
        "label": "85% Completed"
      },
      "avatar": {
        "initials": "AA",
        "image_url": null
      }
    }
  }
}
```

---

## Tab-Specific Endpoints

## `GET /api/tenant/dashboard/bookings`

Use this when bookings are paginated or refreshed independently.

### Query Params

- `page`
- `per_page`
- `status` optional
- `payment_status` optional
- `search` optional
- `sort_by` optional
- `sort_direction` optional

### Response `200`

```json
{
  "success": true,
  "result": {
    "items": [
      {
        "reference": "BK-00000",
        "created_at": "2024-09-10",
        "status": "confirmed",
        "status_label": "Confirmed",
        "payment_status": "paid",
        "payment_status_label": "Paid",
        "items_count": 1,
        "university": {
          "id": 11,
          "name": "Istanbul Aydin University"
        },
        "payment_method": {
          "code": "credit_card",
          "label": "Credit Card"
        },
        "room": {
          "id": 101,
          "name": "Studio Room - Movinn Residence",
          "details_label": "A-101 • Studio Room - Movinn Residence"
        },
        "location": {
          "formatted": "Beylikduzu, Istanbul"
        },
        "amount": {
          "amount": 1350,
          "formatted_short": "$1,350",
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "pricing_breakdown": {
          "rent": {
            "amount": 1100,
            "formatted": "$1,100"
          },
          "deposit": {
            "amount": 250,
            "formatted": "$250"
          },
          "price_line": "$1,100/mo + $250 deposit"
        },
        "duration": {
          "check_in": "2024-06-30",
          "check_out": "2024-09-01",
          "formatted": "2024-06-30 → 2024-09-01"
        },
        "progress": {
          "percentage": 75,
          "formatted": "75%"
        },
        "documents": [],
        "timeline": {
          "steps": [],
          "summary_flags": {
            "docs_done": false,
            "payment_done": true,
            "final_done": true
          }
        },
        "status_bar": {
          "booking": {
            "code": "booking_confirmed",
            "label": "Booking Confirmed",
            "tone": "success"
          },
          "payment": {
            "code": "paid_successfully",
            "label": "Paid Successfully",
            "tone": "success"
          },
          "documents": {
            "code": "docs_partial",
            "label": "Docs: Partially Uploaded",
            "tone": "warning"
          }
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "last_page": 1,
      "total": 2,
      "from": 1,
      "to": 2
    }
  }
}
```

---

## `GET /api/tenant/dashboard/payments`

Use this when payments need pagination or independent refresh.

### Query Params

- `page`
- `per_page`
- `status` optional
- `type` optional
- `method` optional
- `date_from` optional
- `date_to` optional

### Response `200`

```json
{
  "success": true,
  "result": {
    "items": [
      {
        "id": "pay_001",
        "reference": "BK-00000",
        "type": "booking_payment",
        "title": "Booking #BK-00000",
        "method": {
          "code": "credit_card",
          "label": "Credit Card",
          "display_code": "credit_card"
        },
        "date": "2024-09-10",
        "amount": {
          "amount": 1350,
          "formatted": "$1,350.00",
          "currency": "USD"
        },
        "status": "paid",
        "status_label": "Paid",
        "invoice": {
          "invoice_number": "INV-10001",
          "download_url": "https://api.example.com/storage/invoices/INV-10001.pdf"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "last_page": 1,
      "total": 3
    }
  }
}
```

---

## `GET /api/tenant/dashboard/profile`

### Response `200`

```json
{
  "success": true,
  "result": {
    "profile": {
      "full_name": "Ahmed Al-Rashidi",
      "email": "demo@edmovinn.com",
      "mobile": "+966501234567",
      "university": "Istanbul Aydin University",
      "nationality": "Saudi Arabian",
      "address": "Istanbul, Turkey",
      "date_of_birth": "2000-05-15",
      "completion": {
        "percentage": 85,
        "label": "85% Completed"
      },
      "avatar": {
        "initials": "AA",
        "image_url": null
      }
    }
  }
}
```

---

## Optional Detail Endpoints

These are not required for the current UI but are strongly recommended for future extensibility.

## `GET /api/tenant/bookings/{bookingReference}`

Returns one booking with full timeline, documents, payment breakdown, notes, and invoice relations.

## `GET /api/tenant/payments/{paymentId}`

Returns a single payment with invoice metadata, provider metadata, and downloadable assets.

---

## Field Definitions

## `stats`

```json
{
  "total_bookings": 3,
  "active_bookings": 2,
  "total_paid": {
    "amount": 2300,
    "formatted": "$2,300.00",
    "currency": "USD"
  }
}
```

Rules:

- `total_bookings`: total count of bookings created by the tenant
- `active_bookings`: bookings currently in active business states
- `total_paid`: sum of successfully paid amounts only

---

## `booking`

Required fields:

- `reference`
- `created_at`
- `status`
- `payment_status`
- `items_count`
- `university.name`
- `payment_method.code`
- `room.name`
- `location.formatted`
- `amount.formatted`
- `duration.formatted`
- `progress.percentage`
- `timeline.steps[]`
- `status_bar`

Recommended fields:

- `room.details_label`
- `pricing_breakdown`
- `documents[]`
- `step_panels`

---

## `payment`

Required fields:

- `id`
- `type`
- `title`
- `method.code`
- `date`
- `amount.formatted`
- `status`

Recommended fields:

- `reference`
- `invoice.invoice_number`
- `invoice.download_url`

---

## `profile`

Required fields:

- `full_name`
- `email`
- `mobile`
- `university`
- `nationality`
- `address`
- `date_of_birth`
- `completion.percentage`

Recommended fields:

- `completion.label`
- `avatar.initials`
- `avatar.image_url`

---

## Enumerations

## Booking status

- `confirmed`
- `pending`
- `cancelled`
- `expired`
- `under_review`

## Payment status

- `paid`
- `pending`
- `under_review`
- `failed`
- `refunded`

## Timeline step status

- `completed`
- `in_progress`
- `pending`
- `blocked`

## Document status

- `uploaded`
- `pending`
- `not_uploaded`
- `rejected`
- `under_review`

## Payment method codes

- `credit_card`
- `bank_transfer`
- `cash`
- `pay_at_property`
- `wallet`

## Payment types

- `booking_payment`
- `security_deposit`
- `adjustment`
- `refund`

## Tone values for UI badges / bars

- `success`
- `warning`
- `neutral`
- `danger`

---

## Frontend Mapping Notes

The current dashboard frontend benefits from the following mapping rules:

### Overview tab

- `stats.total_bookings` -> stat card 1
- `stats.active_bookings` -> stat card 2
- `stats.total_paid.formatted` -> stat card 3
- `recent_bookings[]` -> recent bookings block

### Bookings tab

- `items_count` -> bookings meta grid
- `payment_method.label` -> payment method display
- `pricing_breakdown.price_line` -> accommodation price summary
- `progress.formatted` -> progress indicator
- `documents[]` -> document checklist panel
- `timeline.steps[]` -> process flow steps
- `status_bar.*` -> status footer chips

### Payments tab

- `payments[].title` -> payment row title
- `payments[].method.display_code` -> compact code line in payment row
- `payments[].amount.formatted` -> amount
- `payments[].invoice.*` -> invoice modal / download / print actions

### Profile tab

- profile fields map directly to profile cards
- `completion.label` is display-ready but frontend may also compose it from `percentage`

---

## Validation Rules

Recommended backend guarantees:

1. `reference` values are unique per booking.
2. `payment.id` values are unique and stable.
3. Dates use ISO `YYYY-MM-DD` or full ISO timestamp if time matters.
4. Monetary `amount` fields return numeric values, not strings.
5. `formatted` monetary fields are safe for direct rendering.
6. Enum fields always use documented machine values.
7. If a timeline step is omitted, it is treated as unavailable, not pending.

---

## Performance Notes

1. The aggregate endpoint should be optimized for first render.
2. Consider eager-loading booking room, university, payment, and document relations.
3. Consider separate tab endpoints if bookings or payments exceed 10-20 items.
4. `generated_at` is useful for stale-data debugging.
5. Profile and payments may be cached briefly if business rules allow it.

---

## Backward Compatibility Guidance

If the backend already exposes:

- booking resources
- payment resources
- profile resources

then `GET /api/tenant/dashboard` can be composed server-side from those sources without changing underlying domains.

To reduce frontend rework:

- keep keys stable
- avoid renaming enum values
- preserve `formatted` string fields once shipped

---

## Minimum Viable Delivery Order

1. `GET /api/tenant/dashboard`
2. `GET /api/tenant/dashboard/bookings`
3. `GET /api/tenant/dashboard/payments`
4. `GET /api/tenant/dashboard/profile`
5. Optional booking detail endpoint
6. Optional payment detail endpoint

This order fully covers the current dashboard UI while leaving room for deeper interactions later.
