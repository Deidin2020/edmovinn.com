# Kuveyt Turk Checkout Contract

هذا العقد يصف التدفق المطلوب بين فرونت `edmovinn.com` والباك إند Laravel عند الدفع من صفحة `checkout`.

## الهدف

عندما يختار المستخدم وسيلة الدفع البنكي `credit_card` في صفحة `checkout`:

1. يتم إنشاء الحجز أولًا بحالة `awaiting_payment`
2. يتم إنشاء جلسة دفع Kuveyt Turk من الباك إند
3. يتم تحويل المستخدم إلى بوابة البنك
4. بعد الرجوع من البنك يتم استدعاء endpoint تأكيد الدفع
5. إذا كانت النتيجة `paid` يتم اعتبار الـ checkout مكتملًا
6. إذا كانت النتيجة `failed` أو `pending` يبقى الحجز في حالة انتظار/فشل دفع مع رسالة واضحة للمستخدم

## الفرونت الحالي

الفرونت المنفذ الآن يعتمد على:

- صفحة checkout الحالية: `/checkout`
- صفحة callback جديدة: `/checkout/payment-return`
- وسيلة الدفع في الفرونت تبقى `credit_card`
- موفر الدفع المرسل للباك إند هو `kuveyt_turk`

## 1. جلب سياق checkout

### Request

`GET /api/tenant/checkout/context`

### Response

```json
{
  "success": true,
  "result": {
    "tenant": {
      "first_name": "Ahmad",
      "last_name": "Ali",
      "email": "ahmad@example.com",
      "mobile": "+905551112233"
    },
    "cart": {
      "id": "cart_123",
      "currency": "TRY",
      "items": [],
      "summary": {
        "subtotal": 1000,
        "deposit_total": 500,
        "grand_total": 1500
      }
    },
    "payment_methods": [
      {
        "code": "credit_card",
        "label": "Bank Gateway Payment",
        "description": "Pay securely through the bank 3D Secure page"
      }
    ]
  }
}
```

## 2. إنشاء الحجز

### Request

`POST /api/tenant/bookings`

```json
{
  "cart_id": "cart_123",
  "guest": {
    "first_name": "Ahmad",
    "last_name": "Ali",
    "email": "ahmad@example.com",
    "mobile": "+905551112233"
  },
  "emergency_contact": {
    "name": "Ali",
    "phone": "+905551112233",
    "relation": "Brother"
  },
  "payment_method": "credit_card",
  "notes": "optional"
}
```

### Required behavior

- ينشئ الباك إند الحجز بحالة `awaiting_payment`
- لا يعتبر الحجز مؤكدًا بعد
- يعيد `booking.id` ويفضل `booking.reference`

### Response

```json
{
  "success": true,
  "message": "Booking created successfully.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260624-9001",
      "status": "awaiting_payment",
      "payment_status": "pending"
    }
  }
}
```

## 3. إنشاء جلسة دفع Kuveyt Turk

### Request

`POST /api/tenant/bookings/{bookingId}/payment-sessions`

```json
{
  "provider": "kuveyt_turk",
  "language": "ar",
  "return_url": "https://edmovinn.com/checkout/payment-return?booking_id=9001",
  "cancel_url": "https://edmovinn.com/checkout/payment-return?booking_id=9001",
  "customer": {
    "name": "Ahmad Ali",
    "email": "ahmad@example.com",
    "phone": "+905551112233"
  }
}
```

### Required behavior

- الباك إند وحده يتصل مع Kuveyt Turk
- الباك إند ينشئ payment record محلي
- الباك إند يربط payment record مع booking
- الباك إند يعيد واحدًا من شكلين

### Redirect response

```json
{
  "success": true,
  "result": {
    "payment_session": {
      "id": "pay_123",
      "provider": "kuveyt_turk",
      "type": "redirect",
      "redirect_url": "https://bank.example/redirect",
      "provider_order_id": "KT-ORDER-123",
      "expires_at": "2026-06-24T10:30:00Z"
    }
  }
}
```

### Hosted form response

```json
{
  "success": true,
  "result": {
    "payment_session": {
      "id": "pay_123",
      "provider": "kuveyt_turk",
      "type": "form_post",
      "form_action": "https://bank.example/form",
      "form_method": "POST",
      "fields": {
        "merchant_id": "abc",
        "order_id": "KT-ORDER-123",
        "hash": "signed"
      },
      "provider_order_id": "KT-ORDER-123"
    }
  }
}
```

## 4. الرجوع من البنك إلى الفرونت

البنك أو الباك إند يعيد توجيه المستخدم إلى:

`GET /checkout/payment-return`

ويُفضّل أن يحتوي الرابط على:

- `booking_id`
- `payment_id`
- `order_id`
- `transaction_id`
- `status`
- `message`

مثال:

```text
/checkout/payment-return?booking_id=9001&payment_id=pay_123&order_id=KT-ORDER-123&transaction_id=KT-TXN-456&status=success&message=Approved
```

مهم:

- الفرونت لا يعتمد على هذه القيم وحدها
- الفرونت يعيد طلب التأكيد النهائي من الباك إند

## 5. تأكيد الدفع النهائي

### Request

`POST /api/tenant/bookings/{bookingId}/payments/confirm`

```json
{
  "provider": "kuveyt_turk",
  "payment_id": "pay_123",
  "provider_order_id": "KT-ORDER-123",
  "provider_transaction_id": "KT-TXN-456",
  "gateway_status": "success",
  "gateway_message": "Approved",
  "gateway_payload": {
    "booking_id": "9001",
    "payment_id": "pay_123",
    "order_id": "KT-ORDER-123",
    "transaction_id": "KT-TXN-456",
    "status": "success",
    "message": "Approved"
  }
}
```

### Required behavior

- التحقق من العملية من سجل الباك إند
- التحقق من hash/signature إذا كان الرجوع يمر عبر الباك إند
- تنفيذ idempotent confirmation
- تحديث حالة الدفع والحجز

### Success response

```json
{
  "success": true,
  "message": "Payment confirmed successfully.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260624-9001",
      "status": "confirmed",
      "payment_status": "paid"
    },
    "payment": {
      "id": "pay_123",
      "status": "paid",
      "provider_order_id": "KT-ORDER-123",
      "provider_transaction_id": "KT-TXN-456"
    }
  }
}
```

### Failed response

يفضل استخدام `422`:

```json
{
  "success": false,
  "message": "Payment was not approved.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260624-9001",
      "status": "awaiting_payment",
      "payment_status": "failed"
    },
    "payment": {
      "id": "pay_123",
      "status": "failed",
      "provider_order_id": "KT-ORDER-123",
      "provider_transaction_id": "KT-TXN-456",
      "failure_message": "Do not honor"
    }
  }
}
```

### Pending response

```json
{
  "success": true,
  "message": "Payment is still pending confirmation.",
  "result": {
    "booking": {
      "id": 9001,
      "reference": "BK-20260624-9001",
      "status": "awaiting_payment",
      "payment_status": "pending"
    },
    "payment": {
      "id": "pay_123",
      "status": "pending",
      "provider_order_id": "KT-ORDER-123",
      "provider_transaction_id": "KT-TXN-456"
    }
  }
}
```

## 6. سلوك الفرونت المنفذ

### عند `credit_card`

1. `validateCart`
2. `updateProfile`
3. `createBooking`
4. `createPaymentSession(provider=kuveyt_turk)`
5. `redirect_url` أو `form_post`

### عند الرجوع إلى `/checkout/payment-return`

1. قراءة `booking_id` وباقي query params
2. استدعاء `POST /payments/confirm`
3. إذا `paid`
   - تفريغ السلة
   - إشعار نجاح
   - عرض تفاصيل العملية
4. إذا `failed`
   - إبقاء الحجز غير مؤكد
   - عرض رسالة فشل
5. إذا `pending`
   - عرض حالة انتظار
   - السماح بإعادة طلب التأكيد

## 7. ملاحظات مهمة

- لا يتم مسح السلة قبل نجاح الدفع النهائي
- لا يتم الاعتماد على query params كمرجع نهائي للحالة
- المرجع النهائي هو استجابة الباك إند من `confirm`
- بيانات البطاقة لا تمر عبر هذا الفرونت الحالي؛ البوابة البنكية هي من تتكفل بذلك
