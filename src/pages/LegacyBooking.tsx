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
import { HousingTerms } from "@/components/HousingTerms";

const cash = (n: number, currency: string) => `${Number(n.toFixed(2))} ${currency}`;
function AccommodationName({ item }: { item: CartItem }) {
  const room = useQuery({
    queryKey: ["cart-room", item.id, item.price_id],
    queryFn: () => api<Room>("/public/rooms/" + item.id + offerQuery(item.price_id)),
    staleTime: 30000,
  });
  return <>{room.data?.property_name || item.accommodation || item.location}</>;
}
function BookingTotals({ items }: { items: CartItem[] }) {
  const c = useBookingCopy();
  const sums = items.reduce<Record<string, { room: number; deposit: number }>>((totals, item) => {
    const sum = totals[item.currency] ?? { room: 0, deposit: 0 };
    // Match the API's integer cents, including the deposit for every selected bed.
    sum.room += Math.round(item.price * 100) * item.quantity;
    sum.deposit += Math.round(item.deposit * 100) * item.quantity;
    totals[item.currency] = sum;
    return totals;
  }, {});
  return (
    <div className="space-y-4" aria-live="polite">
      {Object.entries(sums).map(([currency, sum]) => (
        <dl className="space-y-2 text-sm" key={currency}>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt>{c("Room price")}</dt>
            <dd>
              <bdi>{cash(sum.room / 100, currency)}</bdi>
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt>{c("Deposit")}</dt>
            <dd>
              <bdi>{cash(sum.deposit / 100, currency)}</bdi>
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t pt-3 font-bold text-primary">
            <dt>{c("Total including deposit")}</dt>
            <dd>
              <bdi>{cash((sum.room + sum.deposit) / 100, currency)}</bdi>
            </dd>
          </div>
        </dl>
      ))}
    </div>
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
                {key === "Deposit" ? c("Deposit") : t("cart." + key)}
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
                  <img
                    src={i.image}
                    alt={i.title}
                    className="w-20 h-20 lg:w-16 lg:h-16 object-cover rounded-lg"
                  />
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
                <div className="lg:col-span-2 lg:text-center font-medium">
                  <span className="lg:hidden text-muted-foreground text-sm block">
                    {c("Room price")}
                  </span>
                  <bdi>{cash(i.price, i.currency)}</bdi>
                </div>
                <div className="lg:col-span-2 lg:text-center font-medium">
                  <span className="lg:hidden text-muted-foreground text-sm block">
                    {c("Deposit")}
                  </span>
                  <bdi>{cash(i.deposit, i.currency)}</bdi>
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
                  <span className="lg:hidden text-muted-foreground text-xs block font-normal">
                    {c("Total including deposit")}
                  </span>
                  <bdi>
                    {cash(
                      ((Math.round(i.price * 100) + Math.round(i.deposit * 100)) * i.quantity) /
                        100,
                      i.currency,
                    )}
                  </bdi>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-8 bg-white rounded-lg border p-6">
            <div className="mb-6">
              <BookingTotals items={items} />
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
    queryKey: ["checkout-availability", language, items.map((i) => [i.id, i.price_id])],
    queryFn: () =>
      Promise.all(
        items.map((i) =>
          api<Room>(
            "/public/rooms/" +
              i.id +
              (offerQuery(i.price_id) || "?") +
              (i.price_id ? "&" : "") +
              "lang=" +
              language,
          ),
        ),
      ),
    enabled: items.length > 0,
    staleTime: 0,
    retry: false,
    refetchOnMount: "always",
  });
  function checkoutIssue(rooms: Room[]): string | null {
    for (const item of items) {
      const room = rooms.find((r) => String(r.id) === item.id);
      if (!room) return c("Unable to verify room availability. Please try again.");
      const issue = bookingUnavailableMessage(room);
      if (issue) return `${room.name}: ${c(issue)}`;
      if (item.quantity > room.capacity)
        return `${room.name}: ${c("Not enough beds for these dates.")}`;
      if (
        (item.price_id != null && item.price_id !== room.price_id) ||
        item.price !== room.price ||
        item.deposit !== room.deposit ||
        item.currency !== room.currency ||
        item.contract !== room.reservation_type
      )
        return `${room.name}: ${c("The price or booking terms have changed. Remove this room from your cart and add it again to review the current offer.")}`;
    }
    return null;
  }
  const availabilityIssue = availability.isError
    ? c("Unable to verify room availability. Please try again.")
    : availability.data
      ? checkoutIssue(availability.data)
      : null;
  const session = useQuery({
    queryKey: ["student-session"],
    queryFn: () => api<Session>("/tenant/me"),
    retry: false,
    staleTime: 0,
  });
  const [review, setReview] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("property");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState<Record<number, number>>({});
  const residences = [
    ...new Map((availability.data ?? []).map((room) => [room.property_id, room])).values(),
  ];
  const residencesWithTerms = residences.filter((room) => room.housing_terms);
  const allTermsAccepted = residencesWithTerms.every(
    (room) => !room.housing_terms || acceptedTerms[room.property_id] === room.housing_terms.id,
  );
  const [key] = useState(() => crypto.randomUUID());
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const dateRules = useQuery({
    queryKey: ["booking-dates"],
    queryFn: () => api<{ today: string; latest_checkout: string }>("/public/booking-dates"),
  });
  function readableDate(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Intl.DateTimeFormat(language, {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(value + "T12:00:00Z"))
      : "";
  }
  function field(name: string, label: string, type = "text", required = false, value = "") {
    return (
      <label className="block space-y-2 text-sm font-medium">
        {c(label)}
        {required ? (
          " *"
        ) : (
          <span className="text-muted-foreground font-normal"> — {c("Optional")}</span>
        )}
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={value}
          min={name === "start_date" || name === "end_date" ? dateRules.data?.today : undefined}
          max={
            name === "start_date" || name === "end_date"
              ? dateRules.data?.latest_checkout
              : undefined
          }
          onChange={
            name === "start_date" || name === "end_date"
              ? (event) => {
                  setSelectedDates((current) => ({ ...current, [name]: event.target.value }));
                  setError("");
                }
              : undefined
          }
          maxLength={
            name === "notes" ? 2000 : name === "address" || name === "bill_addr_line1" ? 400 : 150
          }
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base md:text-sm"
        />
        {selectedDates[name] && (
          <span className="block text-xs text-muted-foreground">
            {readableDate(selectedDates[name])}
          </span>
        )}
      </label>
    );
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    setError("");
    try {
      const latest = await availability.refetch();
      if (latest.error || !latest.data) {
        setError(c("Unable to verify room availability. Please try again."));
        return;
      }
      const issue = checkoutIssue(latest.data);
      if (issue) {
        setError(issue);
        return;
      }
      if (paymentMethod === "bank_transfer" && !receiptFile) {
        setError(c("Upload a JPG, PNG or PDF receipt up to 3 MB."));
        return;
      }
      if (!review) {
        let limits;
        try {
          limits = await api<{ today: string; latest_checkout: string }>("/public/booking-dates");
        } catch {
          setError(c("Unable to verify booking dates. Please try again."));
          return;
        }
        if (values.start_date < limits.today) {
          setError(c("Check-in cannot be before today.") + " " + readableDate(limits.today));
          return;
        }
        if (values.end_date <= values.start_date) {
          setError(c("Check-out must be after check-in."));
          return;
        }
        if (values.end_date > limits.latest_checkout) {
          setError(c("Latest available check-out:") + " " + readableDate(limits.latest_checkout));
          return;
        }
        setDetails(values);
        setSelectedDates({ start_date: values.start_date, end_date: values.end_date });
        setReview(true);
        return;
      }
      const currentResidences = [
        ...new Map(latest.data.map((room) => [room.property_id, room])).values(),
      ];
      if (
        currentResidences.some(
          (room) => room.housing_terms && acceptedTerms[room.property_id] !== room.housing_terms.id,
        )
      ) {
        setError(
          c(
            "Housing terms have not been accepted or have changed. Review and accept the current terms for each accommodation.",
          ),
        );
        return;
      }
      const booking = {
        housing_terms_acceptances: currentResidences
          .filter((room) => room.housing_terms)
          .map((room) => ({
            property_id: room.property_id,
            document_id: room.housing_terms!.id,
            accepted: true,
          })),
        start_date: details.start_date,
        end_date: details.end_date,
        notes: details.notes || "",
        checkout_details: details,
        request_key: key,
        payment_method: paymentMethod,
        items: items.map((i) => ({
          room_id: Number(i.id),
          price_id: i.price_id,
          payment_type: i.contract,
          quantity: i.quantity,
          expected_price: i.price,
          expected_deposit: i.deposit,
          expected_currency: i.currency,
        })),
      };
      const upload = new FormData();
      upload.append("booking", JSON.stringify(booking));
      if (receiptFile) upload.append("receipt", receiptFile);
      await api("/tenant/bookings", "POST", paymentMethod === "bank_transfer" ? upload : booking);
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
                      {c("Room price")}:{" "}
                      <bdi>
                        {cash(i.price, i.currency)} × {i.quantity}
                      </bdi>
                    </p>
                    <p>
                      {c("Deposit")}:{" "}
                      <bdi>
                        {cash(i.deposit, i.currency)} × {i.quantity}
                      </bdi>
                    </p>
                  </div>
                ))}
                <BookingTotals items={items} />
              </Panel>
            </aside>
            <div className="lg:col-span-2">
              {availability.isPending ? (
                <p role="status">{c("Checking room availability…")}</p>
              ) : availabilityIssue ? (
                <Panel title={c("Booking availability")}>
                  <p role="alert">{availabilityIssue}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={availability.isFetching}
                      onClick={() => void availability.refetch()}
                    >
                      {c("Try again")}
                    </Button>
                    <Button asChild>
                      <Link to="/cart">{c("Back to cart")}</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/contact">{c("Contact us")}</Link>
                    </Button>
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
                  <p role="status" className="text-sm text-muted-foreground">
                    {c(
                      review
                        ? "Step 2 of 2: Review and send your request. No payment will be taken."
                        : "Step 1 of 2: Guest details. Only fields marked * are required.",
                    )}
                  </p>
                  <div hidden={review} className="space-y-6">
                    <Panel
                      title={t("pages.checkout.payment_method_title")}
                      description={t("pages.checkout.payment_method_description")}
                    >
                      <div
                        className={`border rounded-lg p-4 space-y-3 ${paymentMethod === "property" ? "border-primary" : ""}`}
                      >
                        <label className="flex gap-3 items-center">
                          <input
                            type="radio"
                            checked={paymentMethod === "property"}
                            onChange={() => setPaymentMethod("property")}
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
                      <div
                        className={`border rounded-lg p-4 space-y-4 ${paymentMethod === "bank_transfer" ? "border-primary" : ""}`}
                      >
                        <label className="flex gap-3 items-center cursor-pointer">
                          <input
                            type="radio"
                            name="payment_method"
                            value="bank_transfer"
                            checked={paymentMethod === "bank_transfer"}
                            onChange={() => setPaymentMethod("bank_transfer")}
                          />
                          <Building2 className="w-5 h-5" />
                          <span>
                            <strong className="block">{c("Bank transfer")}</strong>
                            <small className="block">
                              {c(
                                "Upload your payment receipt. Payment remains pending until our team verifies it.",
                              )}
                            </small>
                          </span>
                        </label>
                        {paymentMethod === "bank_transfer" && (
                          <label className="block space-y-2 text-sm font-medium">
                            <span>{c("Payment receipt")} *</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              disabled={busy}
                              className="block w-full min-w-0 text-sm"
                              onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                if (
                                  file &&
                                  (file.size > 3 * 1024 * 1024 ||
                                    file.size === 0 ||
                                    !["image/jpeg", "image/png", "application/pdf"].includes(
                                      file.type,
                                    ))
                                ) {
                                  setReceiptFile(null);
                                  event.target.value = "";
                                  setError(c("Upload a JPG, PNG or PDF receipt up to 3 MB."));
                                  return;
                                }
                                setReceiptFile(file);
                                setError("");
                              }}
                            />
                            <span className="block text-xs text-muted-foreground">
                              {c("JPG, PNG or PDF, up to 3 MB.")}
                            </span>
                            {receiptFile && (
                              <span className="block break-all">{receiptFile.name}</span>
                            )}
                          </label>
                        )}
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
                      <label className="block space-y-2 text-sm font-medium">
                        {c("Address")} — {c("Optional")}
                        <textarea
                          name="address"
                          maxLength={400}
                          className="min-h-20 w-full rounded-md border bg-background px-3 py-2"
                        />
                      </label>
                      <details className="rounded-lg border border-dashed p-4">
                        <summary className="cursor-pointer font-medium">
                          {c("Billing Address")} — {c("Optional")}
                        </summary>
                        <div className="mt-4 space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {c("Billing details are optional while online payment is disabled.")}
                          </p>
                          {field("bill_addr_line1", "Billing address line")}
                          <div className="grid md:grid-cols-2 gap-4">
                            {field("bill_addr_city", "City")}
                            {field("bill_addr_state", "State / Province")}
                            {field("bill_addr_post_code", "Postal code")}
                            {field("bill_addr_country", "Country", "text", false, "Turkey")}
                          </div>
                        </div>
                      </details>
                      <div className="grid md:grid-cols-2 gap-4">
                        {field("start_date", "Check-in", "date", true)}
                        {field("end_date", "Check-out", "date", true)}
                      </div>
                      {dateRules.data && (
                        <p className="text-xs text-muted-foreground">
                          {c("Earliest check-in:")} {readableDate(dateRules.data.today)}.{" "}
                          {c("Latest available check-out:")}{" "}
                          {readableDate(dateRules.data.latest_checkout)}.
                        </p>
                      )}
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
                      <p className="font-medium">
                        {paymentMethod === "bank_transfer"
                          ? c("Bank transfer")
                          : t("payment.method_pay_at_property_label")}
                      </p>
                      {paymentMethod === "bank_transfer" && (
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                          <p className="break-all">
                            {c("Payment receipt")}: {receiptFile?.name}
                          </p>
                          <p>
                            {c(
                              "Upload your payment receipt. Payment remains pending until our team verifies it.",
                            )}
                          </p>
                        </div>
                      )}
                      <p>
                        {details.first_name} {details.last_name}
                      </p>
                      <p>
                        {readableDate(details.start_date)} — {readableDate(details.end_date)}
                      </p>
                      <BookingTotals items={items} />
                      {residencesWithTerms.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold">
                            {c("Read and accept each accommodation’s housing terms")}
                          </h3>
                          {residencesWithTerms.map((room) => (
                            <HousingTerms
                              key={`${room.property_id}:${room.housing_terms?.id ?? 0}`}
                              name={room.property_name}
                              document={room.housing_terms}
                              checked={
                                !!room.housing_terms &&
                                acceptedTerms[room.property_id] === room.housing_terms.id
                              }
                              onAccept={(accepted) =>
                                setAcceptedTerms((previous) => ({
                                  ...previous,
                                  [room.property_id]: accepted ? room.housing_terms!.id : 0,
                                }))
                              }
                            />
                          ))}
                        </div>
                      )}
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
                  <Button
                    disabled={
                      busy ||
                      (review && (!allTermsAccepted || availability.isError || !availability.data))
                    }
                    size="lg"
                    className="w-full"
                  >
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
