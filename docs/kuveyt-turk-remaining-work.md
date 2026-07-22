# Kuveyt Turk — Remaining Work Before Go-Live

آخر تحديث: 2026-07-22

هذا المستند يحصر ما تبقّى لتشغيل مسار «اختيار الدفع البنكي → إدخال البطاقة → التحويل إلى Kuveyt Türk» على الإنتاج.

---

## ✅ منجز

- بناء رسالة `KuveytTurkVPosMessage` والهاش (SHA1 + ISO-8859-9) — `server-middleware/kuveyt.js`
- نقاط `/api/kuveyt/start` و `/ok` و `/fail` مع خطوة الـ Provision
- فورم البطاقة — `components/frontend/common/PaymentMethod.vue`
- حقول عنوان الفوترة المطلوبة لـ 3DS 2.0 — `components/frontend/common/FormCheckout.vue`
- صفحة الرجوع — `pages/checkout/payment-return.vue`
- إغلاق تسريب متغيّرات البيئة إلى bundle المتصفح — `nuxt.config.js`
- إغلاق ثغرة open redirect في `frontendReturnUrl`
- ربط رمز العملة بعملة السلة بدل تثبيته على الليرة
- حماية `/api/kuveyt/start` بالمصادقة وحدّ المحاولات
- `instances: 1` في `ecosystem.config.js` لمنع فقدان العملية المعلّقة
- استدعاء التثبيت server-to-server (جاهز في الفرونت، معطّل حتى يُنفَّذ في Laravel)
- إلغاء تتبّع `.env` في git

---

## 🔴 P0 — يمنع التشغيل

### 1. تدوير بيانات التاجر لدى البنك

كان `nuxt.config.js` بلا كتلة `env`، فيجعل Nuxt الكائن `options.env` مرجعاً إلى
`process.env` بالكامل، ثم يحقن webpack كل مفتاح فيه داخل bundle العميل.
نتيجةً لذلك كانت `KUVEYT_USERNAME` و `KUVEYT_PASSWORD` و `KUVEYT_CUSTOMER_ID`
تُطبع داخل ملف JS عام.

التسريب مُغلق في الكود الآن، لكن **أي بناء سابق منشور يحتوي القيم القديمة**.

المطلوب:

1. طلب بيانات اعتماد جديدة من Kuveyt Türk
2. تحديث `.env` على السيرفر
3. `npm run build:clean` ثم `pm2 reload` — يجب ألا يبقى البناء القديم على القرص

قاعدة دائمة: أي متغيّر يُضاف إلى كتلة `env` في `nuxt.config.js` يصبح عاماً.
الأسرار تُقرأ من `process.env` داخل `server-middleware/` فقط.

### 2. ✅ حماية `POST /api/kuveyt/start` — منفَّذ

صار كل طلب يمرّ بالتحقق من الجلسة عبر `GET /api/tenant/me` (التوكن من ترويسة
`Authorization` أو كوكي `auth._token.local`)، ثم بحدّ محاولات.

عدّاد محاولات المصادقة الفاشلة منفصل عن عدّاد محاولات الدفع عمداً: لو تشاركا
ميزانية واحدة لاستطاعت حركة مجهولة من IP خلف NAT أن تحجب عملاء حقيقيين على
نفس العنوان.

الإعدادات في `.env` (اختيارية): `KUVEYT_RATE_LIMIT_MAX` (٥)،
`KUVEYT_RATE_LIMIT_WINDOW_MS` (١٠ دقائق)، `KUVEYT_AUTH_FAIL_LIMIT_MAX` (٣٠).

**متبقٍّ:** التحقق من أن الحجز يخص المستخدم الحالي — يحتاج endpoint لجلب حجز
بالـ id، وهو غير موجود بعد (مذكور في `room-booking-api-contract.md`).

**تنبيه:** العدّادات في ذاكرة العملية، فدقّتها مشروطة بـ `instances: 1`.
كما أن `getClientIp` يثق بترويسة `x-forwarded-for`؛ تأكدي أن الـ reverse proxy
يعيد كتابتها ولا يمررها من العميل.

### 3. ✅ فقدان بيانات العملية في وضع cluster — حُلّ مؤقتاً

ضُبط `instances: 1` في `ecosystem.config.js`. هذا يحلّ المشكلة فوراً لكنه يقلّل
الأداء إلى عملية واحدة.

للعودة إلى cluster لاحقاً يجب أولاً نقل `pendingPayments` وعدّادات الحدّ إلى
Redis أو إلى الباك إند.

### 4. ⏳ تثبيت نتيجة الدفع server-to-server — نصفه منفَّذ

الجانب الفرونت جاهز: بعد نجاح الـ Provision يستدعي `settlePaymentWithBackend`
الباك إند مباشرة بتوقيع `HMAC-SHA256`.

**الاستدعاء معطّل حتى تُضبط `KUVEYT_INTERNAL_SECRET`**، ويبقى الباك إند حتى ذلك
الحين معتمداً على `query params` القابلة للتزوير: يكفي فتح
`/checkout/payment-return?booking_id=123&status=success` لتأكيد حجز بلا دفع.

**المطلوب من مطوّر Laravel:** تنفيذ الـ endpoint أدناه، ثم ضبط المفتاح في `.env`
على الطرفين، ثم جعل `payments/confirm` يقرأ من سجل الباك إند فقط ويتجاهل
`gateway_status` القادم من المتصفح.

```
POST /api/internal/payments/kuveyt-turk/settle
X-Internal-Signature: <hex HMAC-SHA256 للجسم الخام بمفتاح KUVEYT_INTERNAL_SECRET>
Content-Type: application/json

{
  "booking_id": 9001,
  "tenant_id": 42,
  "provider": "kuveyt_turk",
  "provider_order_id": "BK-20260722-9001",
  "provider_transaction_id": "KTX123456789",
  "status": "paid",
  "amount_minor": 1850000,
  "currency_code": "0949",
  "response_code": "00",
  "response_message": "Approved"
}
```

ملاحظات للتنفيذ:

- `amount_minor` بالوحدة الصغرى (قروش/كuruş) — أي ١٨٥٠٠٫٠٠ ليرة = `1850000`
- `status` إما `paid` أو `failed`
- التوقيع يُحسب على **الجسم الخام** قبل أي إعادة ترميز
- المطلوب: التحقق من التوقيع، مطابقة `amount_minor` مع مبلغ الحجز المحسوب في
  السيرفر ورفض أي اختلاف، معالجة idempotent بمفتاح `provider_order_id`، ثم
  تحديث حالة الدفع والحجز

---

## 🟡 P1 — مهم قبل الإطلاق

### 5. التحقق من المبلغ في السيرفر

`pages/checkout.vue` يرسل المبلغ من حالة المتصفح. يجب أن يعيد
`server-middleware/kuveyt.js` قراءة المبلغ من الحجز في الباك إند ويرفض الطلب
عند أي اختلاف، بدل الوثوق بما يصل من العميل.

### 6. حفظ حقول الفوترة

`buildTenantProfilePayload` في `services/BookingApiService.js` يُسقط
`bill_addr_*` و `phone_country_code` و `phone_number` لأن عقد
`PUT /api/tenant/profile` لا يقبلها. النتيجة: يعيد المستخدم إدخالها في كل مرة.

المطلوب: توسيع العقد في الباك إند لقبول هذه الحقول، ثم إضافتها في الدالة.
(الدفع نفسه يعمل بدونها لأنها تُرسل للبنك من حالة الفورم مباشرة.)

### 7. ⏳ بيئة اختبار — الإعداد جاهز، البيانات مطلوبة من البنك

صار التبديل بمتغيّر واحد. في `.env`:

```
KUVEYT_ENV=test

KUVEYT_TEST_CUSTOMER_ID=
KUVEYT_TEST_MERCHANT_ID=
KUVEYT_TEST_USERNAME=
KUVEYT_TEST_PASSWORD=
KUVEYT_TEST_PAY_URL=
KUVEYT_TEST_PROVISION_URL=
```

القيم المقبولة لـ `KUVEYT_ENV`: `test` أو `sandbox` للاختبار، و `live` أو
`production` أو `prod` أو تركه فارغًا للإنتاج. أي قيمة أخرى — مثل خطأ إملائي
`testing` — تُرفض ويُمنع الدفع بدل أن يذهب بصمت إلى الحساب الحقيقي.

عند الإقلاع يطبع الـ middleware سطرًا يوضح الوضع النشط:

```
[kuveyt] mode=TEST (sandbox) gateway=https://boatest... credentials=complete
```

تحققي من هذا السطر قبل أي تجربة. إن ظهر `mode=LIVE` فالخصم حقيقي.

**المطلوب من البنك:** روابط بيئة الاختبار، بيانات اعتماد اختبارية، وأرقام بطاقات
اختبار. لا تُخمَّن هذه القيم ولا تُنسخ من أمثلة على الإنترنت.

#### خطوات التجربة

1. احصلي على بيانات الاختبار من البنك واملئي `KUVEYT_TEST_*` مع `KUVEYT_ENV=test`
2. `npm run dev` وتأكدي من سطر `mode=TEST` في الطرفية
3. سجّلي الدخول، أضيفي غرفة إلى السلة، وافتحي `/checkout`
4. اختاري «بطاقة ائتمان أو خصم» وأدخلي بطاقة الاختبار
5. المتوقع: تحويل إلى صفحة 3D Secure الخاصة بالبنك
6. بعد التأكيد: رجوع إلى `/checkout/payment-return` وعرض النتيجة

**تنبيه:** الروابط المسجّلة عند البنك حاليًا (`KUVEYT_OK_URL` و `KUVEYT_FAIL_URL`)
تشير إلى `https://edmovinn.com`. البنك لا يستطيع الوصول إلى `localhost`، فالتجربة
من جهازك المحلي لن تكتمل: ستصلين لصفحة البنك لكن الـ callback لن يعود إليك.
الحل إمّا التجربة على السيرفر مباشرة، أو استخدام نفق (مثل ngrok) وتسجيل عنوانه
لدى البنك في بيئة الاختبار.

### 8. اعتماد روابط الـ callback لدى البنك

```
https://edmovinn.com/api/kuveyt/ok
https://edmovinn.com/api/kuveyt/fail
```

بعض حسابات KT تتطلب تسجيل هذه الروابط مسبقاً وإلا يُرفض الاتصال.

---

## 🟢 P2 — تحسينات

- تحقق Luhn وصلاحية التاريخ في الفورم قبل إرسال الطلب للبنك
- مراجعة أن رقم البطاقة والـ CVV لا يظهران في أي سجل (`debug` يُرجع رقماً مقنّعاً — سليم)
- إزالة `console.log` التشخيصية من `payment-return.vue` و `BookingApiService.js`
- توثيق أن الموقع صار ضمن PCI-DSS SAQ A-EP لأن البطاقة تُدخل على الموقع وتمر عبر السيرفر

---

## ترتيب التنفيذ المقترح

1. تدوير بيانات التاجر + إعادة بناء نظيفة (P0-1)
2. حماية `/start` (P0-2)
3. حسم تخزين العملية المعلّقة (P0-3)
4. التثبيت server-to-server (P0-4) + التحقق من المبلغ (P1-5)
5. اختبار end-to-end على بيئة البنك الاختبارية (P1-7)
6. الإطلاق
