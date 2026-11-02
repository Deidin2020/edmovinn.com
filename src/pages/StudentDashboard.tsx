import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingCopy } from "@/content/booking-copy";
import { api, money, ApiError, type Session, type Booking } from "@/lib/api";

const field = "mt-2 w-full rounded-xl border bg-background px-4 py-3 focus-visible:outline-primary";
export function StudentDashboard() {
  const { language, isRTL, t } = useLanguage();
  const c = useBookingCopy();
  const copy = (en: string, ar: string, tr: string) =>
    language === "ar" ? ar : language === "tr" ? tr : en;
  const client = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState<unknown>(null);
  const session = useQuery({
    queryKey: ["student-session"],
    queryFn: () => api<Session>("/tenant/me"),
    retry: false,
    staleTime: 0,
  });
  const bookings = useQuery({
    queryKey: ["student-bookings", session.data?.user.id],
    queryFn: () => api<Booking[]>("/tenant/bookings"),
    enabled: !!session.data,
  });
  const payment = useQuery({
    queryKey: ["payment-config"],
    queryFn: () => api<{ enabled: boolean }>("/tenant/payment/config"),
    enabled: !!session.data,
    retry: false,
  });
  const rows = bookings.data || [];
  const today = new Date().toLocaleDateString("en-CA");
  const active = rows.filter((b) => b.status === "confirmed" && b.end_date > today);
  const pending = rows.filter((b) => b.status === "pending");
  const alert = (value: unknown) =>
    value ? (
      <p
        role="alert"
        className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive"
      >
        {value instanceof Error ? value.message : String(value)}
      </p>
    ) : null;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      await api("/tenant/profile", "PUT", data);
      await session.refetch();
      setNotice(
        copy("Your profile has been saved.", "تم حفظ بياناتك بنجاح.", "Profiliniz kaydedildi."),
      );
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await api("/tenant/logout", "POST");
      client.clear();
      navigate("/auth");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  function bookingCard(b: Booking) {
    const canPay =
      payment.data?.enabled &&
      b.status === "confirmed" &&
      b.payment_status === "unpaid" &&
      (b.quote_cents || 0) > 0 &&
      (!b.latest_payment_status || ["failed", "test_paid"].includes(b.latest_payment_status));
    return (
      <article key={b.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-primary/5 p-3 text-primary">
              <BedDouble aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                {c("Request:")} #{b.id}
              </p>
              <h3 className="font-semibold text-primary">{b.property_name}</h3>
              <p className="text-sm text-muted-foreground">
                {c("Room")} {b.room_number}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${b.status === "confirmed" ? "bg-emerald-50 text-emerald-800" : b.status === "cancelled" ? "bg-muted text-muted-foreground" : "bg-amber-50 text-amber-900"}`}
          >
            {c(b.status)}
          </span>
        </div>
        <dl className="grid gap-5 p-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">
              {copy("Stay dates", "مدة الإقامة", "Konaklama tarihleri")}
            </dt>
            <dd className="mt-1 text-sm font-medium" dir="ltr">
              <span className="whitespace-nowrap">{b.start_date}</span> →{" "}
              <span className="whitespace-nowrap">{b.end_date}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {copy("Reserved beds", "عدد الأسرّة", "Yatak sayısı")}
            </dt>
            <dd className="mt-1 font-medium">{b.quantity}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {copy("Payment status", "حالة الدفع", "Ödeme durumu")}
            </dt>
            <dd className="mt-1 font-medium">{c(b.payment_status)}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {b.quote_cents !== null
                ? c("Final stay total including deposit:")
                : copy("Awaiting final quote", "بانتظار السعر النهائي", "Kesin fiyat bekleniyor")}
            </p>
            {b.quote_cents !== null && (
              <p className="mt-1 text-lg font-bold text-primary">
                {money(b.quote_cents / 100, b.currency)}
              </p>
            )}
          </div>
          {canPay && (
            <Button asChild>
              <Link to={`/pay/${b.id}`}>{c("Pay with Kuveyt Türk")}</Link>
            </Button>
          )}
        </div>
        <details className="border-t px-5 py-3">
          <summary className="cursor-pointer text-sm font-medium text-primary">
            {copy("Booking details", "تفاصيل الحجز", "Rezervasyon detayları")}
          </summary>
          <div className="space-y-2 py-3 text-sm">
            {b.contract_type && <p>{c("Contract term:")} {c(b.contract_type)}</p>}
            <p>
              {c("Contract price")} {money(b.amount_cents / 100, b.currency)}
            </p>
            <p>
              {c("Deposit:")} {money(b.deposit_cents / 100, b.currency)}
            </p>
            {b.latest_payment_status && (
              <p>
                {c("Bank attempt:")} {c(b.latest_payment_status)}
              </p>
            )}
            {b.latest_payment_status &&
              ["starting", "awaiting", "provisioning", "review"].includes(
                b.latest_payment_status,
              ) && (
                <p className="rounded-lg bg-amber-50 p-3 text-amber-900">
                  {c("Contact the property before trying another payment.")}
                </p>
              )}
          </div>
        </details>
      </article>
    );
  }
  const empty = (
    <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
      <BedDouble className="mx-auto mb-4 text-primary/60" size={36} aria-hidden="true" />
      <h3 className="font-semibold">{c("No requests yet.")}</h3>
      <Button asChild className="mt-5">
        <Link to="/search">{c("Find a room")}</Link>
      </Button>
    </div>
  );
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="student-dashboard min-h-[65vh] bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {session.isPending ? (
          <p role="status" className="p-8">
            {c("Loading…")}
          </p>
        ) : !session.data ? (
          <div className="mx-auto max-w-md space-y-5 rounded-2xl border bg-card p-8 text-center">
            <UserRound className="mx-auto text-primary" size={40} />
            <h1 className="text-2xl font-bold">{c("Your account & bookings")}</h1>
            {!(session.error instanceof ApiError && session.error.status === 401) &&
              alert(session.error)}
            <Button asChild>
              <Link to="/auth">{c("Sign in")}</Link>
            </Button>
            <Button variant="outline" onClick={() => session.refetch()}>
              {copy("Try again", "إعادة المحاولة", "Tekrar dene")}
            </Button>
          </div>
        ) : (
          <>
            <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  {session.data.user.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {copy("Your student account", "حسابك الطلابي", "Öğrenci hesabınız")}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-primary md:text-3xl">
                    {copy("Welcome,", "أهلًا،", "Merhaba,")} {session.data.user.name}
                  </h1>
                </div>
              </div>
              <Button variant="outline" disabled={busy} onClick={logout}>
                <LogOut size={16} className="me-2" />
                {c("Sign out")}
              </Button>
            </header>
            {alert(error)}
            {notice && (
              <p role="status" className="mb-5 rounded-xl bg-emerald-50 p-4 text-emerald-800">
                {notice}
              </p>
            )}
            <Tabs value={tab} onValueChange={setTab} dir={isRTL ? "rtl" : "ltr"}>
              <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border bg-card p-1.5 sm:grid-cols-4">
                {(
                  [
                    ["overview", LayoutDashboard],
                    ["bookings", CalendarDays],
                    ["payments", CreditCard],
                    ["profile", UserRound],
                  ] as const
                ).map(([name, Icon]) => (
                  <TabsTrigger
                    key={String(name)}
                    value={String(name)}
                    className="gap-2 rounded-lg py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon size={17} aria-hidden="true" />
                    {t(`dashboard.${name}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tab !== "profile" && bookings.isError && (
                <div className="mb-5 space-y-3">
                  {alert(bookings.error)}
                  <Button variant="outline" onClick={() => bookings.refetch()}>
                    {copy("Try again", "إعادة المحاولة", "Tekrar dene")}
                  </Button>
                </div>
              )}
              {tab !== "profile" && bookings.isPending && <p role="status">{c("Loading…")}</p>}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {(
                    [
                      [t("dashboard.totalBookings"), rows.length, CalendarDays],
                      [t("dashboard.activeBookings"), active.length, CheckCircle2],
                      [
                        copy("Awaiting confirmation", "بانتظار التأكيد", "Onay bekliyor"),
                        pending.length,
                        BedDouble,
                      ],
                    ] as const
                  ).map(([label, count, Icon]) => (
                    <div
                      key={String(label)}
                      className="flex items-center justify-between rounded-2xl border bg-card p-6"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">{String(label)}</p>
                        <p className="mt-2 text-3xl font-bold text-primary">
                          {bookings.isSuccess ? String(count) : "—"}
                        </p>
                      </div>
                      <Icon size={28} className="text-primary/40" aria-hidden="true" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">{t("dashboard.recentBookings")}</h2>
                  <Button variant="ghost" onClick={() => setTab("bookings")}>
                    {copy("View all", "عرض الكل", "Tümünü gör")}
                  </Button>
                </div>
                {bookings.isSuccess &&
                  (rows.length ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {rows.slice(0, 4).map(bookingCard)}
                    </div>
                  ) : (
                    empty
                  ))}
              </TabsContent>
              <TabsContent value="bookings" className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">{t("dashboard.allBookings")}</h2>
                  <label className="text-sm">
                    {copy("Status", "الحالة", "Durum")}{" "}
                    <select
                      className="ms-2 rounded-lg border bg-card p-2"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      {["all", "pending", "confirmed", "cancelled"].map((s) => (
                        <option key={s} value={s}>
                          {s === "all" ? copy("All", "الكل", "Tümü") : c(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {bookings.isSuccess &&
                  (rows.length ? (
                    <>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {rows
                          .filter((b) => filter === "all" || b.status === filter)
                          .map(bookingCard)}
                      </div>
                      {!rows.some((b) => filter === "all" || b.status === filter) && (
                        <p className="rounded-xl border bg-card p-8 text-center">
                          {copy(
                            "No bookings match this status.",
                            "لا توجد حجوزات بهذه الحالة.",
                            "Bu durumda rezervasyon yok.",
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    empty
                  ))}
              </TabsContent>
              <TabsContent value="payments" className="space-y-5">
                <h2 className="text-xl font-bold">
                  {copy("Booking payments", "مدفوعات الحجوزات", "Rezervasyon ödemeleri")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {copy(
                    "Payment status and the final quote for each booking.",
                    "حالة الدفع والسعر النهائي لكل حجز.",
                    "Her rezervasyonun ödeme durumu ve kesin fiyatı.",
                  )}
                </p>
                {payment.isSuccess && !payment.data.enabled && (
                  <p className="rounded-xl border bg-card p-4 text-sm">
                    {copy(
                      "Online payment is currently unavailable. Contact the property to arrange payment.",
                      "الدفع الإلكتروني غير متاح حاليًا. تواصل مع السكن لترتيب الدفع.",
                      "Çevrimiçi ödeme şu anda kullanılamıyor. Ödeme için tesisle iletişime geçin.",
                    )}
                  </p>
                )}
                {alert(payment.error)}
                {bookings.isSuccess &&
                  (rows.length ? (
                    <div className="grid gap-4 lg:grid-cols-2">{rows.map(bookingCard)}</div>
                  ) : (
                    empty
                  ))}
              </TabsContent>
              <TabsContent value="profile">
                <form
                  onSubmit={save}
                  className="max-w-2xl space-y-5 rounded-2xl border bg-card p-6 md:p-8"
                >
                  <div>
                    <h2 className="text-xl font-bold">{t("dashboard.personalInfo")}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {copy(
                        "Keep your contact details up to date for your stay.",
                        "حدّث معلومات التواصل الخاصة بإقامتك.",
                        "Konaklamanız için iletişim bilgilerinizi güncel tutun.",
                      )}
                    </p>
                  </div>
                  <label className="block text-sm font-medium">
                    {c("Full name")}
                    <input
                      key={session.data.user.name}
                      className={field}
                      name="name"
                      autoComplete="name"
                      maxLength={150}
                      required
                      defaultValue={session.data.user.name}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    {c("Phone")}
                    <input
                      key={session.data.user.phone}
                      className={field}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      dir="ltr"
                      maxLength={50}
                      defaultValue={session.data.user.phone}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    {t("dashboard.email")}
                    <input
                      className={`${field} bg-muted text-muted-foreground`}
                      type="email"
                      value={session.data.user.email}
                      readOnly
                      dir="ltr"
                    />
                  </label>
                  {(
                    [
                      ["university", "University", "الجامعة", "Üniversite", 200],
                      ["nationality", "Nationality", "الجنسية", "Uyruk", 100],
                      ["date_of_birth", "Date of birth", "تاريخ الميلاد", "Doğum tarihi", 10],
                      ["address", "Address", "العنوان", "Adres", 1000],
                    ] as const
                  ).map(([name, en, ar, tr, limit]) => (
                    <label key={name} className="block text-sm font-medium">
                      {copy(en, ar, tr)}
                      <input
                        key={`${name}-${session.data.user[name]}`}
                        className={field}
                        name={name}
                        type={name === "date_of_birth" ? "date" : "text"}
                        max={name === "date_of_birth" ? today : undefined}
                        maxLength={limit}
                        defaultValue={session.data.user[name] || ""}
                      />
                    </label>
                  ))}
                  <Button disabled={busy} type="submit">
                    {busy ? c("Loading…") : c("Save profile")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
