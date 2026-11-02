import { useBookingCopy } from "@/content/booking-copy";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  api,
  mediaUrl,
  money,
  type Catalog,
  type Accommodation,
  type Room,
  type Session,
  type Booking,
} from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContent, PageSections } from "@/components/ManagedPage";

const input = "w-full rounded-lg border bg-background p-3";
function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      {children}
    </div>
  );
}
function ErrorBox({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="rounded-lg bg-destructive/10 text-destructive p-4">
      {error instanceof Error ? error.message : String(error)}
    </p>
  ) : null;
}
function Photo({ src, name }: { src: string; name: string }) {
  const c = useBookingCopy();
  return src ? (
    <img src={mediaUrl(src)} alt={name} className="w-full h-52 object-cover rounded-lg" />
  ) : (
    <div className="h-52 rounded-lg bg-muted grid place-items-center text-muted-foreground">{c("No photo yet")} </div>
  );
}
function RoomCard({ room }: { room: Room }) {
  const c = useBookingCopy();
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Photo src={room.image} name={room.name} />
        <h2 className="text-xl font-semibold">{room.name}</h2>
        {room.contract_period && <p>{c("Contract term:")} {c(room.contract_period)}</p>}
        {room.review_required && <p>{c("Imported price awaiting review; booking is not yet available.")}</p>}
        <p>
          {room.city}, {room.country} · {c(room.room_type)} · {c(room.gender)}
        </p>
        <p>
          {room.price === null
            ? c("Price not published")
            : `${money(room.price, room.currency)} / ${c(room.reservation_type)} ${c("/ bed")}`}
        </p>
        <p>{c("Deposit:")} {money(room.deposit, room.currency)} {c("/ bed")}</p>
        <Button asChild>
          <Link to={`/room/${room.id}`}>{c("View room")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function Catalogue({ propertiesOnly = false }: { propertiesOnly?: boolean }) {
  const c = useBookingCopy();
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const q = params.get("q") || "";
  const [search, setSearch] = useState(q);
  const result = useQuery({
    queryKey: ["catalog", page, q],
    queryFn: () => api<Catalog>(`/public/catalog?page=${page}&q=${encodeURIComponent(q)}`),
  });
  const pagination = propertiesOnly
    ? result.data?.accommodations_pagination
    : result.data?.rooms_pagination;
  return (
    <Shell title={propertiesOnly ? t("accommodation.title") : t("header.discover_room")}>
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ q: search, page: "1" });
        }}
      >
        <input
          aria-label={c("Search by accommodation, city, country or university")}
          placeholder={c("Accommodation, city, country or university")}
          className={input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button>{t("actions.search")}</Button>
      </form>
      <div className="flex gap-4">
        <Link to="/search">{t("labels.rooms")}</Link>
        <Link to="/accommodations">{t("labels.accommodations")}</Link>
      </div>
      <ErrorBox error={result.error} />
      {result.isPending && <p>{c("Loading…")}</p>}
      {result.data && (
        <>
          <p>{pagination?.total_records} {c("results")}</p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {propertiesOnly
              ? result.data.accommodations.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4 space-y-3">
                      <Photo src={p.image} name={p.name} />
                      <h2 className="text-xl font-semibold">{p.name}</h2>
                      <p>
                        {p.city}, {p.country}
                      </p>
                      <Button asChild>
                        <Link to={`/dormitory/${p.id}`}>{c("View accommodation")}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              : result.data.rooms.map((r) => <RoomCard key={r.id} room={r} />)}
          </div>
          {pagination?.total_records === 0 && <p>{c("No published listings match your search.")}</p>}
          <div className="flex gap-4">
            <Button disabled={page <= 1} onClick={() => setParams({ q, page: String(page - 1) })}>{c("Previous")} </Button>
            <span>{c("Page")} {page}</span>
            <Button
              disabled={page >= (pagination?.last_page || 1)}
              onClick={() => setParams({ q, page: String(page + 1) })}
            >{c("Next")} </Button>
          </div>
        </>
      )}
    </Shell>
  );
}
export function ConnectedRoom() {
  const c = useBookingCopy();
  const { id } = useParams();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const result = useQuery({
    queryKey: ["room", id],
    queryFn: () => api<Room>(`/public/rooms/${id}`),
  });
  const r = result.data;
  return (
    <Shell title={r?.name || c("Room")}>
      <ErrorBox error={result.error} />
      {result.isPending && <p>{c("Loading…")}</p>}
      {r && (
        <>
          <Link to={`/dormitory/${r.property_id}`}>{c("View accommodation")}</Link>
          <Photo src={r.image} name={r.name} />
          <p>{r.description}</p>
          {r.contract_period && <p>{c("Contract term:")} {c(r.contract_period)}</p>}
          {r.review_required && <p role="status">{c("Imported price awaiting review; booking is not yet available.")}</p>}
          <p>
            {r.city}, {r.country} · {c(r.room_type)} · {r.capacity} {c("beds · Floor")} {r.floor} · {c(r.gender)}
          </p>
          <div className="flex flex-wrap gap-2">
            {r.details.map((d) => (
              <span className="rounded-lg bg-muted p-2" key={d}>
                {d}
              </span>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {r.media.slice(1).map((m) => (
              <Photo key={m.url} src={m.url} name={m.caption || r.name} />
            ))}
          </div>
          <p>
            {r.price === null
              ? c("Price not published")
              : `${money(r.price, r.currency)} / ${c(r.reservation_type)} ${c("/ bed")}`}{" "} {c("· Deposit")} {money(r.deposit, r.currency)} {c("/ bed")} </p>
          <p>{c("Availability is checked for your dates when you submit your request. Final stay pricing is confirmed by the property before payment.")} </p>
          <Button
            disabled={!r.bookable}
            onClick={() => {
              addToCart({
                id: String(r.id),
                price_id: r.price_id,
                title: r.name,
                location: r.city,
                price: r.price!,
                deposit: r.deposit,
                image: mediaUrl(r.image),
                currency: r.currency,
                capacity: r.capacity,
                contract: r.reservation_type,
              });
              setAdded(true);
            }}
          >
            {r.bookable ? c("Add to booking request") : c("Currently unavailable")}
          </Button>
          {added && (
            <p role="status">{c("Added.")}{" "}
              <Link className="underline" to="/cart">{c("View your request")} </Link>
            </p>
          )}
        </>
      )}
    </Shell>
  );
}
export function ConnectedAccommodation() {
  const c = useBookingCopy();
  const { id } = useParams();
  const result = useQuery({
    queryKey: ["accommodation", id],
    queryFn: () => api<Accommodation>(`/public/properties/${id}`),
  });
  const p = result.data;
  return (
    <Shell title={p?.name || c("Accommodation")}>
      <ErrorBox error={result.error} />
      {result.isPending && <p>{c("Loading…")}</p>}
      {p && (
        <>
          <Photo src={p.image} name={p.name} />
          <div className="grid md:grid-cols-3 gap-4">
            {p.media?.slice(1).map((image) => (
              <Photo key={image.url} src={image.url} name={image.caption || p.name} />
            ))}
          </div>
          <p>
            {p.address} · {p.city}, {p.country}
          </p>
          <p>{p.description}</p>
          <div className="flex flex-wrap gap-2">
            {p.facilities.map((f) => (
              <span className="bg-muted rounded-lg p-2" key={f}>
                {f}
              </span>
            ))}
          </div>
          <h2 className="text-xl font-bold">{c("University & transport")}</h2>
          <p>{p.university}</p>
          {p.transportation.map((t, i) => (
            <p key={i}>
              {t.type} {t.name} → {t.destination} · {t.walking_minutes} {c("min walk ·")}{" "}
              {t.travel_minutes} {c("min travel")} </p>
          ))}
          <h2 className="text-xl font-bold">{c("Rooms")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {p.rooms.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
          {p.rooms.length === 0 && <p>{c("No rooms published yet.")}</p>}
        </>
      )}
    </Shell>
  );
}
export function StudentAuth() {
  const [authParams] = useSearchParams();
  const c = useBookingCopy();
  const { t } = useLanguage();
  const client = useQueryClient();
  const [register, setRegister] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError(null);
    try {
      await api("/tenant/" + (register ? "register" : "login"), "POST", data);
      client.clear();
      navigate(authParams.get("next") === "checkout" ? "/checkout" : "/dashboard");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell title={register ? t("pages.sign_up.title") : t("pages.login.title")}>
      <p>{t(register ? "pages.sign_up.description" : "pages.login.description")}</p>
      <form className="max-w-md space-y-4" onSubmit={submit}>
        {register && (
          <label className="block">
            {t("auth.full_name")}
            <input className={input} name="name" required maxLength={150} autoComplete="name" />
          </label>
        )}
        <label className="block">
          {t("auth.email")}
          <input className={input} name="email" type="email" required autoComplete="email" />
        </label>
        <label className="block">
          {t("auth.password")}
          <input
            className={input}
            name="password"
            type="password"
            minLength={register ? 12 : 1}
            maxLength={72}
            required
            autoComplete={register ? "new-password" : "current-password"}
          />
        </label>
        <ErrorBox error={error} />
        <Button disabled={busy}>
          {busy ? c("Please wait…") : t(register ? "auth.create_account" : "auth.sign_in")}
        </Button>
        <Button type="button" variant="outline" onClick={() => setRegister(!register)}>
          {t(register ? "auth.do_have_account" : "auth.create_account")}
        </Button>
      </form>
    </Shell>
  );
}
export function ConnectedCart() {
  const c = useBookingCopy();
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart } = useCart();
  return (
    <Shell title={t("cart.breadcrumb_cart")}>
      {items.length === 0 ? (
        <div>
          <h2>{t("cart.empty_title")}</h2>
          <p>{t("cart.empty_description")}</p>
          <Link to="/search">{t("cart.browse_button")}</Link>
        </div>
      ) : (
        <>
          {items.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-5 space-y-3">
                <Link className="font-bold" to={`/room/${i.id}`}>
                  {i.title}
                </Link>
                <p>
                  {money(i.price, i.currency)} / {c(i.contract)} {c("/ bed · Deposit")}{" "}
                  {money(i.deposit, i.currency)} {c("/ bed")} </p>
                <label>{c("Beds")} <input
                    className={input}
                    type="number"
                    min={1}
                    max={i.capacity}
                    value={i.quantity}
                    onChange={(e) => updateQuantity(i.id, Number(e.target.value))}
                  />
                </label>
                <Button variant="outline" onClick={() => removeFromCart(i.id)}>{c("Remove")} </Button>
              </CardContent>
            </Card>
          ))}
          <p>{c("Prices and available beds will be checked when you submit. Final stay pricing is confirmed by the property.")} </p>
          <Button asChild>
            <Link to="/checkout">{c("Choose dates & submit")}</Link>
          </Button>
        </>
      )}
    </Shell>
  );
}
export function ConnectedCheckout() {
  const c = useBookingCopy();
  const session = useQuery({
    queryKey: ["student-session"],
    queryFn: () => api<Session>("/tenant/me"),
    retry: false,
    staleTime: 0,
  });
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError(null);
    try {
      await api("/tenant/bookings", "POST", {
        ...fields,
        request_key: key,
        payment_method: "property",
        items: items.map((i) => ({ room_id: Number(i.id), price_id: i.price_id, payment_type: i.contract, quantity: i.quantity })),
      });
      clearCart();
      navigate("/dashboard");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell title={c("Submit your booking request")}>
      {session.isPending ? (
        <p>{c("Loading…")}</p>
      ) : !session.data ? (
        <>
          <ErrorBox error={session.error} />
          <Button asChild>
            <Link to="/auth">{c("Sign in or create an account")}</Link>
          </Button>
        </>
      ) : items.length === 0 ? (
        <Link to="/search">{c("Find a room")}</Link>
      ) : (
        <form className="max-w-xl space-y-4" onSubmit={submit}>
          <p>{c("Signed in as")} {session.data.user.name} {c(". A request reserves beds until the property confirms or cancels it. No payment is taken now.")} </p>
          {items.map((i) => (
            <p key={i.id}>
              {i.title} · {i.quantity} {c("beds ·")} {money(i.price * i.quantity, i.currency)} {c("per contract, plus")} {money(i.deposit * i.quantity, i.currency)} {c("deposit")} </p>
          ))}
          <label className="block">{c("Check-in")} <input className={input} name="start_date" type="date" required />
          </label>
          <label className="block">{c("Check-out")} <input className={input} name="end_date" type="date" required />
          </label>
          <label className="block">{c("Notes / university / special requirements")} <textarea className={input} name="notes" maxLength={2000} />
          </label>
          <p>{c("Payment: at the property after confirmation. The property will confirm the total for your full stay.")} </p>
          <label className="flex gap-2">
            <input type="checkbox" required />{c("I understand this is a booking request and the final stay price requires confirmation.")} </label>
          <ErrorBox error={error} />
          <Button disabled={busy}>{busy ? c("Submitting…") : c("Submit request")}</Button>
        </form>
      )}
    </Shell>
  );
}
export function StudentDashboard() {
  const paymentConfig = useQuery({ queryKey: ["payment-config"], queryFn: () => api<{ enabled: boolean }>("/tenant/payment/config"), retry: false });
  const c = useBookingCopy();
  const client = useQueryClient();
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
  const navigate = useNavigate();
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  async function profile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError(null);
    try {
      await api("/tenant/profile", "PUT", data);
      await session.refetch();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell title={c("Your account & bookings")}>
      {session.isPending ? (
        <p>{c("Loading…")}</p>
      ) : !session.data ? (
        <>
          <ErrorBox error={session.error} />
          <Link to="/auth">{c("Sign in")}</Link>
        </>
      ) : (
        <>
          <form className="max-w-md space-y-4" onSubmit={profile}>
            <label className="block">{c("Full name")} <input
                key={session.data.user.name}
                className={input}
                name="name"
                required
                defaultValue={session.data.user.name}
              />
            </label>
            <label className="block">{c("Phone")} <input
                className={input}
                name="phone"
                type="tel"
                defaultValue={session.data.user.phone}
              />
            </label>
            <p>{session.data.user.email}</p>
            <Button disabled={busy}>{c("Save profile")}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await api("/tenant/logout", "POST");
                  client.clear();
                  navigate("/auth");
                } catch (err) {
                  setError(err);
                }
              }}
            >{c("Sign out")} </Button>
          </form>
          <ErrorBox error={error || bookings.error} />
          <p>{!paymentConfig.data?.enabled && c("Online payment is disabled until bank testing is complete.")}</p><h2 className="text-xl font-bold">{c("Booking requests")}</h2>
          {bookings.isPending && <p>{c("Loading…")}</p>}
          {bookings.data?.length === 0 && (
            <p>{c("No requests yet.")} <Link to="/search">{c("Find a room")}</Link>
            </p>
          )}
          {bookings.data?.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold">
                  #{b.id} · {b.property_name} {c("· Room")} {b.room_number}
                </h3>
                <p>
                  {b.start_date} → {b.end_date} · {b.quantity} {c("beds")} </p>
                <p>{c("Request:")} {c(b.status)} {c("· Payment:")} {c(b.payment_status)}
                </p>
                <p>{c("Contract price")} {money(b.amount_cents / 100, b.currency)} {c("· Deposit")}{" "}
                  {money(b.deposit_cents / 100, b.currency)}
                </p>
                {b.quote_cents && (
                  <p>{c("Final stay total including deposit:")} {money(b.quote_cents / 100, b.currency)}
                  </p>
                )}
                {b.latest_payment_status && (
                  <p>{c("Bank attempt:")} {c(b.latest_payment_status)}.{" "}
                    {["starting", "awaiting", "provisioning", "review"].includes(
                      b.latest_payment_status,
                    ) && c("Contact the property before trying another payment.")}
                  </p>
                )}
                {paymentConfig.data?.enabled && b.status === "confirmed" &&
                  b.payment_status === "unpaid" &&
                  b.quote_cents &&
                  (!b.latest_payment_status ||
                    ["failed", "test_paid"].includes(b.latest_payment_status)) && (
                    <Button asChild>
                      <Link to={"/pay/" + b.id}>{c("Pay with Kuveyt Türk")}</Link>
                    </Button>
                  )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Shell>
  );
}
export function ConnectedContact() {
  const c = useBookingCopy();
  const { t } = useLanguage();
  const content = useSiteContent("contact");
  const catalogue = useQuery({
    queryKey: ["contact-properties"],
    queryFn: () => api<Catalog>("/public/catalog?per_page=100"),
  });
  const [error, setError] = useState<unknown>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setError(null);
    setBusy(true);
    setSent(false);
    try {
      await api("/public/messages", "POST", fields);
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell title={content.data?.title || c("Contact an accommodation")}>
      {content.data && (
        <div className="space-y-4">
          <p className="whitespace-pre-wrap">{content.data.body}</p>
          <p>{content.data.address}</p>
          <p>
            {content.data.email} {content.data.phone}
          </p>
          <PageSections sections={content.data.sections} />
        </div>
      )}
      <ErrorBox error={catalogue.error || error} />
      {catalogue.isPending && <p>{c("Loading…")}</p>}
      {sent && (
        <p role="status">{c("Your message was saved and sent to the property's management inbox.")}</p>
      )}
      {catalogue.data && (
        <form onSubmit={submit} className="max-w-xl space-y-4">
          <label className="block">{c("Accommodation")} <select className={input} name="property_id" required defaultValue="">
              <option value="" disabled>{c("Select accommodation")} </option>
              {catalogue.data.accommodations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            {t("contact.full_name")}
            <input className={input} name="name" required maxLength={150} />
          </label>
          <label className="block">
            {t("contact.email")}
            <input className={input} name="email" type="email" required />
          </label>
          <label className="block">
            {t("contact.phone")}
            <input className={input} name="phone" type="tel" maxLength={50} />
          </label>
          <label className="block">
            {t("contact.message")}
            <textarea className={input} name="message" required maxLength={5000} />
          </label>
          <Button disabled={busy || catalogue.data.accommodations.length === 0}>
            {busy ? c("Sending…") : t("contact.send_button")}
          </Button>
        </form>
      )}
    </Shell>
  );
}
