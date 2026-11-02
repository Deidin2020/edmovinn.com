import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Minus, Plus, X, Building2, CreditCard } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/useCart";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingCopy } from "@/content/booking-copy";
import { api, offerQuery, type Session, type Room } from "@/lib/api";
import { bookingUnavailableMessage } from "@/lib/booking-availability";
import { Button } from "@/components/ui/button";

const cash = (n: number, currency: string) => `${Number(n.toFixed(2))} ${currency}`;
function AccommodationName({ item }: { item: CartItem }) {
  const room = useQuery({
    queryKey: ["cart-room", item.id, item.price_id],
    queryFn: () => api<Room>("/public/rooms/" + item.id + offerQuery(item.price_id)),
    staleTime: 30000,
  });
  return <>{room.data?.property_name || item.accommodation || item.location}</>;
}
function Totals({ items }: { items: CartItem[] }) {
  const sums = items.reduce<Record<string, number>>(
    (a, i) => ({ ...a, [i.currency]: (a[i.currency] || 0) + (i.price + i.deposit) * i.quantity }),
    {},
  );
  return (
    <span className="text-primary text-end">
      {Object.entries(sums).map(([currency, n]) => (
        <span className="block" key={currency}>
          {cash(n, currency)}
        </span>
      ))}
    </span>
  );
}
function Frame({ checkout = false, children }: { checkout?: boolean; children: ReactNode }) {
  const { t } = useLanguage();
  const c = useBookingCopy();
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link
            to={checkout ? "/cart" : "/"}
            aria-label={c("Back")}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="font-medium">
            {t(checkout ? "pages.checkout.breadcrumb_checkout" : "cart.breadcrumb_cart")}
          </h1>
        </div>
      </div>
      {children}
    </div>
  );
}
export function LegacyCart() {
  const { items, updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();
  const c = useBookingCopy();
  return (
    <Frame>
      {!items.length ? (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">{t("cart.empty_title")}</h2>
          <p className="text-muted-foreground mb-8">{t("cart.empty_description")}</p>
          <Button asChild size="lg">
            <Link to="/search">{t("cart.browse_button")}</Link>
          </Button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-secondary/10 rounded-t-lg border-b">
            {["Accommodation / Location", "Price", "Deposit", "Quantity", "Total"].map((key, i) => (
              <div
                key={key}
                className={`font-semibold ${i === 0 ? "col-span-5" : i === 4 ? "col-span-1 text-center" : "col-span-2 text-center"}`}
              >
                {t("cart." + key)}
              </div>
            ))}
          </div>
          {items.map((i) => (
            <div key={i.id} className="bg-white border rounded-b-lg p-4">
              <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                <div className="col-span-2 lg:col-span-5 flex items-center gap-4">
                  <button
                    aria-label={`${c("Remove")} ${i.title}`}
                    onClick={() => removeFromCart(i.id)}
                    className="order-last lg:order-none ms-auto lg:ms-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img src={i.image} alt={i.title} className="w-20 h-20 lg:w-16 lg:h-16 object-cover rounded-lg" />
                  <div>
                    <Link to={`/room/${i.id}${offerQuery(i.price_id)}`} className="font-semibold">
                      {i.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      <AccommodationName item={i} />
                      <span className="block text-primary font-medium">{c(i.contract)}</span>
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block lg:col-span-2 lg:text-center font-medium">
                  <span className="lg:hidden text-muted-foreground text-sm block">
                    {t("cart.Price")}
                  </span>
                  {cash(i.price, i.currency)}
                </div>
                <div className="hidden lg:block lg:col-span-2 lg:text-center font-medium">
                  <span className="lg:hidden text-muted-foreground text-sm block">
                    {t("cart.Deposit")}
                  </span>
                  {cash(i.deposit, i.currency)}
                </div>
                <div className="lg:col-span-2 flex items-center lg:justify-center gap-2">
                  <button
                    aria-label={`${c("Decrease quantity")} ${i.title}`}
                    disabled={i.quantity <= 1}
                    onClick={() => updateQuantity(i.id, i.quantity - 1)}
                    className="w-8 h-8 rounded-md border bg-background hover:bg-secondary/50 flex items-center justify-center disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span aria-live="polite" className="w-8 text-center font-medium">
                    {i.quantity}
                  </span>
                  <button
                    aria-label={`${c("Increase quantity")} ${i.title}`}
                    disabled={i.quantity >= i.capacity}
                    onClick={() => updateQuantity(i.id, i.quantity + 1)}
                    className="w-8 h-8 rounded-md border bg-background hover:bg-secondary/50 flex items-center justify-center disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-1 text-end lg:text-center font-bold text-lg">
                  {cash((i.price + i.deposit) * i.quantity, i.currency)}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-8 bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center text-xl font-bold mb-4">
              <span>{t("cart.Total")}:</span>
              <Totals items={items} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" size="lg" className="w-full sm:flex-1">
                <Link to="/search">{t("cart.Continue Shopping")}</Link>
              </Button>
              <Button asChild size="lg" className="w-full sm:flex-1">
                <Link to="/checkout">{t("cart.Proceed to Checkout")}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Frame>
  );
}
function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card shadow-sm">
      <div className="p-6 space-y-1.5">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="px-6 pb-6 space-y-4">{children}</div>
    </section>
  );
}
export function LegacyCheckout() {
  const { t, language } = useLanguage();
  const c = useBookingCopy();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const availability = useQuery({
    queryKey: ["checkout-availability", items.map(i => [i.id, i.price_id])],
    queryFn: () => Promise.all(items.map(i => api<Room>("/public/rooms/" + i.id + offerQuery(i.price_id)))),
    enabled: items.length > 0,
    staleTime: 0,
    retry: false,
    refetchOnMount: "always",
  });
  function checkoutIssue(rooms: Room[]): string | null {
    for (const item of items) {
      const room = rooms.find(r => String(r.id) === item.id);
      if (!room) return c("Unable to verify room availability. Please try again.");
      const issue = bookingUnavailableMessage(room);
      if (issue) return `${room.name}: ${c(issue)}`;
      if (item.quantity > room.capacity) return `${room.name}: ${c("Not enough beds for these dates.")}`;
      if ((item.price_id != null && item.price_id !== room.price_id) || item.price !== room.price || item.deposit !== room.deposit || item.currency !== room.currency || item.contract !== room.reservation_type)
        return `${room.name}: ${c("The price or booking terms have changed. Remove this room from your cart and add it again to review the current offer.")}`;
    }
    return null;
  }
  const availabilityIssue = availability.isError
    ? c("Unable to verify room availability. Please try again.")
    : availability.data ? checkoutIssue(availability.data) : null;
  const session = useQuery({
    queryKey: ["student-session"],
    queryFn: () => api<Session>("/tenant/me"),
    retry: false,
    staleTime: 0,
  });
  const [review, setReview] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [key] = useState(() => crypto.randomUUID());
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const dateRules = useQuery({queryKey:["booking-dates"],queryFn:()=>api<{today:string;latest_checkout:string}>("/public/booking-dates")});
  function readableDate(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Intl.DateTimeFormat(language, {day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(value+"T12:00:00Z")) : "";
  }
  function field(name: string, label: string, type = "text", required = false, value = "") {
    return (
      <label className="block space-y-2 text-sm font-medium">
        {c(label)}{required ? " *" : <span className="text-muted-foreground font-normal"> — {c("Optional")}</span>}
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={value}
          min={name === "start_date" || name === "end_date" ? dateRules.data?.today : undefined}
          max={name === "start_date" || name === "end_date" ? dateRules.data?.latest_checkout : undefined}
          onChange={name === "start_date" || name === "end_date" ? (event) => {setSelectedDates(current=>({...current,[name]:event.target.value})); setError("");} : undefined}
          maxLength={name === "notes" ? 2000 : name === "address" || name === "bill_addr_line1" ? 400 : 150}
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base md:text-sm"
        />
        {selectedDates[name] && <span className="block text-xs text-muted-foreground">{readableDate(selectedDates[name])}</span>}
      </label>
    );
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values=Object.fromEntries(new FormData(e.currentTarget)) as Record<string,string>;
    setBusy(true);
    setError("");
    try {
      const latest = await availability.refetch();
      if (latest.error || !latest.data) { setError(c("Unable to verify room availability. Please try again.")); return; }
      const issue = checkoutIssue(latest.data);
      if (issue) { setError(issue); return; }
      if (!review) {
        let limits;
        try { limits=await api<{today:string;latest_checkout:string}>("/public/booking-dates"); }
        catch { setError(c("Unable to verify booking dates. Please try again.")); return; }
        if (values.start_date < limits.today) { setError(c("Check-in cannot be before today.")+" "+readableDate(limits.today)); return; }
        if (values.end_date <= values.start_date) { setError(c("Check-out must be after check-in.")); return; }
        if (values.end_date > limits.latest_checkout) { setError(c("Latest available check-out:")+" "+readableDate(limits.latest_checkout)); return; }
        setDetails(values);
        setSelectedDates({start_date:values.start_date,end_date:values.end_date});
        setReview(true);
        return;
      }
      await api("/tenant/bookings", "POST", {
        start_date: details.start_date,
        end_date: details.end_date,
        notes: details.notes || "",
        checkout_details: details,
        request_key: key,
        payment_method: "property",
        items: items.map((i) => ({ room_id: Number(i.id), price_id: i.price_id, payment_type: i.contract, quantity: i.quantity, expected_price: i.price, expected_deposit: i.deposit, expected_currency: i.currency })),
      });
      clearCart();
      navigate("/dashboard");
    } catch (e) {
      setError(c(e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Frame checkout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!items.length ? (
          <Button asChild>
            <Link to="/search">{t("cart.browse_button")}</Link>
          </Button>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <aside>
              <Panel title={t("cart.Order Summary")}>
                {items.map((i) => (
                  <div key={i.id} className="text-sm border-b pb-4 space-y-1">
                    <p className="font-medium">
                      {i.title} — <AccommodationName item={i} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("cart.Quantity")}: {i.quantity}
                    </p>
                    <p>
                      {cash(i.price, i.currency)} × {i.quantity}
                    </p>
                    <p>
                      {t("cart.Deposit")}: {cash(i.deposit * i.quantity, i.currency)}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>{t("cart.Total")}:</span>
                  <Totals items={items} />
                </div>
              </Panel>
            </aside>
            <div className="lg:col-span-2">
              {availability.isPending ? (
                <p role="status">{c("Checking room availability…")}</p>
              ) : availabilityIssue ? (
                <Panel title={c("Booking availability")}>
                  <p role="alert">{availabilityIssue}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" disabled={availability.isFetching} onClick={() => void availability.refetch()}>{c("Try again")}</Button>
                    <Button asChild><Link to="/cart">{c("Back to cart")}</Link></Button>
                    <Button asChild variant="outline"><Link to="/contact">{c("Contact us")}</Link></Button>
                  </div>
                </Panel>
              ) : session.isPending ? (
                <p>{c("Loading…")}</p>
              ) : !session.data ? (
                <Panel title={c("Sign in or create an account")}>
                  <Button asChild className="w-full">
                    <Link to="/auth?next=checkout">{c("Sign in")}</Link>
                  </Button>
                </Panel>
              ) : (
                <form onSubmit={submit} className="space-y-6">
                  <p role="status" className="text-sm text-muted-foreground">{c(review ? "Step 2 of 2: Review and send your request. No payment will be taken." : "Step 1 of 2: Guest details. Only fields marked * are required.")}</p>
                  <div hidden={review} className="space-y-6">
                    <Panel
                      title={t("pages.checkout.payment_method_title")}
                      description={t("pages.checkout.payment_method_description")}
                    >
                      <div className="border border-primary rounded-lg p-4 space-y-3">
                        <label className="flex gap-3 items-center">
                          <input
                            type="radio"
                            checked
                            readOnly
                            name="payment_method"
                            value="property"
                          />
                          <Building2 className="w-5 h-5" />
                          <span>
                            <strong className="block">
                              {t("payment.method_pay_at_property_label")}
                            </strong>
                            <span className="text-sm text-muted-foreground">
                              {t("payment.method_pay_at_property_description")}
                            </span>
                          </span>
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {c(
                            "Payment: at the property after confirmation. The property will confirm the total for your full stay.",
                          )}
                        </p>
                      </div>
                      <div className="border rounded-lg p-4 flex gap-3 items-center opacity-60">
                        <CreditCard className="w-5 h-5" />
                        <span>
                          {t("payment.method_credit_card_label")}
                          <small className="block">
                            {c("Online payment is currently disabled.")}
                          </small>
                        </span>
                      </div>
                      <div className="border rounded-lg p-4 flex gap-3 items-center opacity-60" aria-disabled="true">
                        <Building2 className="w-5 h-5" />
                        <span>{c("Bank transfer")}<small className="block">{c("Bank transfers are currently disabled.")}</small></span>
                      </div>
                    </Panel>
                    <Panel
                      title={t("pages.checkout.personal_info_title")}
                      description={t("pages.checkout.personal_info_description")}
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        {field(
                          "first_name",
                          "First Name",
                          "text",
                          true,
                          session.data.user.name.split(" ")[0],
                        )}
                        {field(
                          "last_name",
                          "Last Name",
                          "text",
                          true,
                          session.data.user.name.split(" ").slice(1).join(" "),
                        )}
                      </div>
                      {field("email", "Email Address", "email", true, session.data.user.email)}
                      <div className="grid md:grid-cols-2 gap-4">
                        {field("mobile", "Mobile Number", "tel", true, session.data.user.phone)}
                        {field("phone_country_code", "Phone Country Code", "tel", false, "+90")}
                        {field("phone_number", "Phone Number", "tel")}
                        {field("date_of_birth", "Date of Birth", "date")}
                        {field("university_name", "University Name")}
                        {field("nationality", "Nationality")}
                      </div>
                      <label className="block space-y-2 text-sm font-medium">{c("Address")} — {c("Optional")}<textarea name="address" maxLength={400} className="min-h-20 w-full rounded-md border bg-background px-3 py-2" /></label>
                      <details className="rounded-lg border border-dashed p-4">
                        <summary className="cursor-pointer font-medium">{c("Billing Address")} — {c("Optional")}</summary>
                        <div className="mt-4 space-y-4">
                          <p className="text-sm text-muted-foreground">{c("Billing details are optional while online payment is disabled.")}</p>
                          {field("bill_addr_line1", "Billing address line")}
                          <div className="grid md:grid-cols-2 gap-4">
                            {field("bill_addr_city", "City")}{field("bill_addr_state", "State / Province")}
                            {field("bill_addr_post_code", "Postal code")}{field("bill_addr_country", "Country", "text", false, "Turkey")}
                          </div>
                        </div>
                      </details>
                      <div className="grid md:grid-cols-2 gap-4">
                        {field("start_date", "Check-in", "date", true)}
                        {field("end_date", "Check-out", "date", true)}
                      </div>
                      {dateRules.data && <p className="text-xs text-muted-foreground">{c("Earliest check-in:")} {readableDate(dateRules.data.today)}. {c("Latest available check-out:")} {readableDate(dateRules.data.latest_checkout)}.</p>}
                      {field("notes", "Notes / university / special requirements")}
                    </Panel>
                    <Panel
                      title={t("pages.checkout.emergency_contact_title")}
                      description={t("pages.checkout.emergency_contact_description")}
                    >
                      {field("emergency_name", "Emergency Contact Name")}
                      <div className="grid md:grid-cols-2 gap-4">
                        {field("emergency_phone", "Emergency Contact Phone", "tel")}
                        {field("emergency_relation", "Relation")}
                      </div>
                    </Panel>
                  </div>
                  {review && (
                    <Panel title={c("Review your booking request")}>
                      <p>
                        {details.first_name} {details.last_name}
                      </p>
                      <p>
                        {readableDate(details.start_date)} — {readableDate(details.end_date)}
                      </p>
                      <a
                        href="/documents/movinn-housing-contract-and-regulations-2026-09-15.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {t("footer.housingContract")}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {c(
                          "Prices and available beds will be checked when you submit. Final stay pricing is confirmed by the property.",
                        )}
                      </p>
                      <label className="flex gap-2 text-sm">
                        <input required type="checkbox" />
                        {c(
                          "I understand this is a booking request and the final stay price requires confirmation.",
                        )}
                      </label>
                      <Button type="button" variant="outline" onClick={() => setReview(false)}>
                        {c("Back")}
                      </Button>
                    </Panel>
                  )}
                  {error && (
                    <p role="alert" className="bg-destructive/10 text-destructive p-4 rounded-lg">
                      {error}
                    </p>
                  )}
                  <Button disabled={busy} size="lg" className="w-full">
                    {busy
                      ? c("Submitting…")
                      : review
                        ? c("Submit request")
                        : c("Review booking request")}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
}
