import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingCopy } from "@/content/booking-copy";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, API_BASE, money, type Session, type Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function BankPayment() {
  const c = useBookingCopy();
  const { language } = useLanguage();
  const countryNames = new Intl.DisplayNames([language], { type: "region" });
  const { id } = useParams();
  const session = useQuery({
    queryKey: ["student-session"],
    queryFn: () => api<Session>("/tenant/me"),
    retry: false,
    staleTime: 0,
  });
  const bookings = useQuery({
    queryKey: ["payment-booking", id],
    queryFn: () => api<Booking[]>("/tenant/bookings"),
    enabled: !!session.data,
  });
  const config = useQuery({
    queryKey: ["payment-config"],
    queryFn: () => api<{ enabled: boolean; mode: string }>("/tenant/payment/config"),
    enabled: !!session.data,
  });
  const b = bookings.data?.find((b) => String(b.id) === id);
  const error = session.error || bookings.error || config.error;
  const fields = [
    ["card_holder", c("Cardholder name"), "text", "cc-name", 100],
    ["card_number", c("Card number (digits only)"), "text", "cc-number", 19],
    ["card_month", c("Expiry month (MM)"), "text", "cc-exp-month", 2],
    ["card_year", c("Expiry year (YY)"), "text", "cc-exp-year", 2],
    ["card_cvv", c("Security code"), "password", "cc-csc", 4],
    ["city", c("Billing city"), "text", "address-level2", 100],
    ["state", c("Billing state / district"), "text", "address-level1", 100],
    ["address", c("Billing address"), "text", "street-address", 300],
    ["postcode", c("Postal code"), "text", "postal-code", 20],
    ["phone_code", c("Phone country code (e.g. 90)"), "text", "tel-country-code", 4],
    ["phone", c("Phone number without country code"), "tel", "tel-national", 20],
  ] as const;
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">
      <h1 className="text-3xl font-bold">{c("Kuveyt Türk secure payment")}</h1>
      <Link to="/dashboard">{c("Back to bookings")}</Link>
      {error && <p role="alert">{error.message}</p>}
      {(session.isPending || bookings.isPending || config.isPending) && !error && <p>{c("Loading…")}</p>}
      {config.data && !config.data.enabled && (
        <p>{c("Card payments are awaiting merchant configuration. Contact the property to complete payment.")} </p>
      )}
      {config.data?.enabled &&
        b &&
        session.data &&
        (b.status !== "confirmed" ||
        b.payment_status !== "unpaid" ||
        !b.quote_cents ||
        b.currency !== "TRY" ? (
          <p>{c("This booking is not eligible for online payment. A confirmed TRY quote is required.")}</p>
        ) : (
          <>
            {config.data.mode === "test" && (
              <p role="status" className="bg-yellow-100 p-4">{c("Sandbox test payment. Use bank test cards only. This does not pay your booking.")} </p>
            )}
            <p>{c("Booking #")}{b.id} · {b.property_name} · {b.start_date} → {b.end_date}
            </p>
            <p className="text-xl font-bold">{c("Total including deposit:")} {money(b.quote_cents / 100, b.currency)}
            </p>
            <p>{c("You will continue to your bank's 3D Secure verification. Your card details are not stored by Edmovinn.")} </p>
            <form
              method="post"
              action={`${API_BASE}/api/v1/tenant/payment/start`}
              className="grid sm:grid-cols-2 gap-4"
            >
              <input type="hidden" name="_csrf" value={session.data.csrf} />
              <input type="hidden" name="booking_id" value={b.id} />
              <input type="hidden" name="expected_quote_cents" value={b.quote_cents} />
              {fields.map(([name, label, type, autoComplete, maxLength]) => (
                <label key={name} className="block text-sm font-medium">
                  {label}
                  <input
                    className="mt-2 w-full border rounded-lg p-3"
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    required
                  />
                </label>
              ))}
              <label>{c("Billing country")} <select
                  name="country_code"
                  className="w-full border rounded-lg p-3"
                  required
                  defaultValue="792"
                >
                  {Object.entries({
                    "792": "TR",
                    "818": "EG",
                    "682": "SA",
                    "784": "AE",
                    "400": "JO",
                    "275": "PS",
                    "422": "LB",
                    "760": "SY",
                    "368": "IQ",
                    "414": "KW",
                    "634": "QA",
                    "512": "OM",
                    "048": "BH",
                    "887": "YE",
                    "729": "SD",
                    "434": "LY",
                    "012": "DZ",
                    "504": "MA",
                    "788": "TN",
                    "276": "DE",
                    "528": "NL",
                    "826": "GB",
                    "840": "US",
                    "124": "CA",
                    "250": "FR",
                    "586": "PK",
                    "356": "IN",
                    "050": "BD",
                    "566": "NG",
                    "706": "SO",
                    "031": "AZ",
                    "398": "KZ",
                    "860": "UZ",
                  }).map(([value, label]) => (
                    <option key={value} value={value}>
                      {countryNames.of(label)}
                    </option>
                  ))}
                </select>
              </label>
              <label>{c("Card type")} <select name="card_type" className="w-full border rounded-lg p-3">
                  <option value="Visa">Visa</option>
                  <option value="MasterCard">MasterCard</option>
                  <option value="Troy">Troy</option>
                </select>
              </label>
              <Button className="sm:col-span-2">{c("Pay")} {money(b.quote_cents / 100, b.currency)}
              </Button>
            </form>
          </>
        ))}
    </div>
  );
}
