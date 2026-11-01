import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  Layers,
  MapPin,
  Maximize,
  GraduationCap,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { api, mediaUrl, type Room, type Catalog, type Accommodation } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingCopy } from "@/content/booking-copy";
import { bookingUnavailableMessage } from "@/lib/booking-availability";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function currency(value: number | null, code: string) {
  return value === null
    ? "—"
    : `${Number(value)} ${{ USD: "$", TRY: "₺", EUR: "€" }[code] || code}`;
}
function useBook() {
  const { addToCart } = useCart();
  const c = useBookingCopy();
  return (r: Room) => {
    const issue = bookingUnavailableMessage(r);
    if (issue) {
      toast.info(c(issue));
      return;
    }
    addToCart({
      id: String(r.id),
      title: r.name,
      location: r.city,
      accommodation: r.property_name,
      price: r.price,
      deposit: r.deposit,
      image: mediaUrl(r.image),
      currency: r.currency,
      capacity: r.capacity,
      contract: r.reservation_type,
    });
    toast.success(c("Added."));
  };
}
export function LegacyRoomCard({ room: r }: { room: Room }) {
  const { t } = useLanguage();
  const c = useBookingCopy();
  const book = useBook();
  const [expanded, setExpanded] = useState(false);
  const bookingIssue = bookingUnavailableMessage(r);
  return (
    <article className="rounded-lg border bg-card shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/rooms/${r.slug}`} className="block relative">
        <img src={mediaUrl(r.image)} alt={r.name} className="w-full h-40 sm:h-48 object-cover" />
        <span className="absolute top-2 start-2 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-pink-100 text-pink-900">
          {c(
            r.gender === "Male"
              ? "Males accommodation"
              : r.gender === "Female"
                ? "Females accommodation"
                : "Mixed accommodation",
          )}
        </span>
      </Link>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 line-clamp-2">
          <Link to={`/rooms/${r.slug}`}>{r.name}</Link> {c("in")}{" "}
          <Link to={`/accommodations/${r.property_slug}`}>{r.property_name}</Link>
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
          <span className="flex gap-1 items-center text-muted-foreground text-xs">
            <MapPin className="w-4 h-4 shrink-0" />
            {t("accommodation.location")}
          </span>
          <span className="font-medium">{r.state || r.city}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Maximize className="w-4 h-4" />
            {t("accommodation.size")}
          </span>
          <span className="flex gap-1 items-center text-green-600">
            <Calendar className="w-4 h-4 shrink-0" />
            {t("accommodation.available_from")}
          </span>
          <span className="font-medium">{r.available_from || "—"}</span>
          <span className="font-medium">{r.area ? `${r.area}m²` : "—"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">{t("accommodation.price")}</span>
            <span className="font-bold text-base sm:text-lg">
              {currency(r.price, r.currency)}{" "}
              <span className="text-[10px] text-muted-foreground font-normal">
                / {c(r.reservation_type)}
              </span>
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">
              {t("accommodation.deposit")}
            </span>
            <span className="font-medium">{currency(r.deposit, r.currency)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">
              {t("accommodation.contract_type")}
            </span>
            <span className="font-medium">{c(r.contract_period || r.reservation_type)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(expanded ? r.facilities : r.facilities.slice(0, 3)).map((f) => (
            <span
              key={f}
              className="rounded-full bg-[hsl(36_64%_90%)] text-[hsl(36_64%_35%)] text-xs px-2 py-1 font-medium"
            >
              {c(f)}
            </span>
          ))}
          {r.facilities.length > 3 && (
            <button className="text-sm" onClick={() => setExpanded(!expanded)}>
              {c(expanded ? "less" : "more")}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/rooms/${r.slug}`}>{t("actions.see_more")}</Link>
          </Button>
          <Button size="sm" className="flex-1" disabled={!!bookingIssue} onClick={() => book(r)}>
            {t("actions.book_now")}
          </Button>
        </div>
        {bookingIssue && <p className="mt-3 text-sm text-muted-foreground">{c(bookingIssue)} <Link to="/contact" className="text-primary underline">{c("Contact us")}</Link></p>}
      </div>
    </article>
  );
}

export function LegacySearch({ propertiesOnly = false }: { propertiesOnly?: boolean }) {
  const { t } = useLanguage();
  const c = useBookingCopy();
  const [params, setParams] = useSearchParams();
  const [show, setShow] = useState(() => window.innerWidth >= 768);
  const [open, setOpen] = useState("");
  const tab = params.get("tab") || (propertiesOnly ? "accommodations" : "rooms");
  const result = useQuery({
    queryKey: ["legacy-catalog", params.toString()],
    queryFn: () => api<Catalog>("/public/catalog?" + params.toString()),
  });
  const pagination =
    tab === "rooms" ? result.data?.rooms_pagination : result.data?.accommodations_pagination;
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setParams(next);
  }
  const filters = [
    ["country", "filter.location.title"],
    ["city", "filter.city.title"],
    ["reservation_type", "filter.reservation.title"],
    ["room_type", "filter.room.title"],
    ["gender", "filter.gender.title"],
    ["university_name", "filter.university_name.title"],
    ["price", "filter.tuitionFees.title"],
  ];
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-8 lg:gap-12">
      <aside className={`${show ? "md:w-[272px]" : "md:w-auto"} shrink-0`}>
        <div className="rounded-lg border bg-[hsl(160_15%_98%)] shadow-sm overflow-hidden">
          <div className="p-4 min-h-[68px] flex items-center justify-between gap-5">
            <h2 className="font-semibold">{c("Filters")}</h2>
            <button className="text-sm font-medium text-primary" onClick={() => setShow(!show)}>
              {c(show ? "Hide Filters" : "Show Filters")}
            </button>
          </div>
          {show &&
            filters.map(([field, label]) => (
              <section className="border-t" key={field}>
                <button
                  className="w-full text-start p-4 flex justify-between gap-4"
                  aria-expanded={open === field}
                  onClick={() => setOpen(open === field ? "" : field)}
                >
                  {t(label)}
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground ${open === field ? "rotate-180" : ""}`}
                  />
                </button>
                {open === field && (
                  <div className="px-4 pb-4 space-y-3">
                    {field === "price" ? (
                      <>
                        <label className="block text-sm">
                          {c("Minimum price")}
                          <input
                            className="w-full border rounded p-2"
                            type="number"
                            min="0"
                            value={params.get("min_price") || ""}
                            onChange={(e) => change("min_price", e.target.value)}
                          />
                        </label>
                        <label className="block text-sm">
                          {c("Maximum price")}
                          <input
                            className="w-full border rounded p-2"
                            type="number"
                            min="0"
                            value={params.get("max_price") || ""}
                            onChange={(e) => change("max_price", e.target.value)}
                          />
                        </label>
                      </>
                    ) : (
                      (result.data?.facets?.[field] || []).map((option) => (
                        <label key={option} className="flex gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={(params.get(field) || "").split(",").includes(option)}
                            onChange={(e) => {
                              const selected = (params.get(field) || "").split(",").filter(Boolean);
                              change(
                                field,
                                (e.target.checked
                                  ? [...selected, option]
                                  : selected.filter((v) => v !== option)
                                ).join(","),
                              );
                            }}
                          />
                          {c(option)}
                        </label>
                      ))
                    )}
                  </div>
                )}
              </section>
            ))}
          {show && Array.from(params.keys()).some((k) => !["page", "tab"].includes(k)) && (
            <button className="m-4 text-sm underline" onClick={() => setParams({ tab })}>
              {c("Clear filters")}
            </button>
          )}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold mb-2">{t("accommodation.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {c("Results")} ({pagination?.total_records || 0}){" "}
          {tab === "rooms" ? c("Room") : c("Accommodation")}
        </p>
        <div role="tablist" className="grid grid-cols-2 p-1 bg-muted rounded-md max-w-md mb-6">
          {["rooms", "accommodations"].map((value) => (
            <button
              role="tab"
              aria-selected={tab === value}
              key={value}
              className={`rounded px-3 py-1.5 text-sm font-medium ${tab === value ? "bg-primary text-white shadow-sm" : "text-muted-foreground"}`}
              onClick={() => change("tab", value)}
            >
              {t("labels." + value)}
            </button>
          ))}
        </div>
        {result.isPending && <p>{c("Loading…")}</p>}
        {result.error && <p role="alert">{result.error.message}</p>}
        <div className="grid lg:grid-cols-2 gap-6">
          {tab === "rooms"
            ? result.data?.rooms.map((r) => <LegacyRoomCard key={r.id} room={r} />)
            : result.data?.accommodations.map((p) => (
                <Link
                  className="block rounded-lg border bg-card shadow-sm p-4 hover:shadow-lg transition-shadow"
                  key={p.id}
                  to={`/accommodations/${p.slug}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {p.image && (
                        <img
                          src={mediaUrl(p.image)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
                      <p className="flex items-center gap-1 text-primary font-medium">
                        <MapPin className="w-4 h-4 shrink-0" />
                        {p.district || p.city}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
        {result.data && pagination?.total_records === 0 && (
          <p>{c("No published listings match your search.")}</p>
        )}
        {(pagination?.last_page || 1) > 1 && (
          <div className="flex gap-4 my-6">
            <Button
              disabled={Number(params.get("page") || 1) <= 1}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(Number(params.get("page") || 1) - 1));
                setParams(next);
              }}
            >
              {c("Previous")}
            </Button>
            <Button
              disabled={Number(params.get("page") || 1) >= pagination!.last_page}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(Number(params.get("page") || 1) + 1));
                setParams(next);
              }}
            >
              {c("Next")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Gallery({
  images,
  name,
  className = "mb-8",
}: {
  images: Room["media"];
  name: string;
  className?: string;
}) {
  const [slide, setSlide] = useState(0),
    [zoom, setZoom] = useState(false);
  const c = useBookingCopy();
  if (!images.length) return null;
  return (
    <>
      <div className={`relative ${className}`}>
        <button
          className="block w-full"
          onClick={() => setZoom(true)}
          aria-label={c("Enlarge image")}
        >
          <img
            src={mediaUrl(images[slide % images.length].url)}
            alt={name}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-md"
          />
        </button>
        {images.length > 1 && (
          <>
            <button
              aria-label={c("Previous")}
              className="absolute start-3 top-1/2 rounded-full bg-white/90 p-2"
              onClick={() => setSlide((slide + images.length - 1) % images.length)}
            >
              <ChevronLeft />
            </button>
            <button
              aria-label={c("Next")}
              className="absolute end-3 top-1/2 rounded-full bg-white/90 p-2"
              onClick={() => setSlide((slide + 1) % images.length)}
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-5xl">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <img
            src={mediaUrl(images[slide % images.length].url)}
            alt={name}
            className="w-full max-h-[80vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
export function LegacyRoom() {
  const { slug, id } = useParams();
  const c = useBookingCopy();
  const book = useBook();
  const result = useQuery({
    queryKey: ["legacy-room", slug || id],
    queryFn: () =>
      api<Room>(slug ? `/public/rooms/by-slug/${encodeURIComponent(slug)}` : `/public/rooms/${id}`),
  });
  const related = useQuery({
    queryKey: ["related-rooms"],
    queryFn: () => api<Catalog>("/public/catalog?per_page=100"),
  });
  const r = result.data;
  if (!r)
    return (
      <div className="max-w-7xl mx-auto p-6" role={result.error ? "alert" : undefined}>
        {result.error ? result.error.message : c("Loading…")}
      </div>
    );
  const bookingIssue = bookingUnavailableMessage(r);
  const fields = [
    [Home, "Housing Type", r.property_name],
    [Building2, "Accommodation Type", c(r.reservation_type)],
    [Layers, "Floor", r.floor],
    [Maximize, "Area", r.area ? `${r.area}m²` : ""],
    [Calendar, "Available From", r.available_from],
    [Calendar, "Available To", r.available_to],
  ] as const;
  return (
    <>
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/search" aria-label={c("Back")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span>/</span>
          <Link to="/accommodations">{c("Accommodations")}</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{r.name}</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{r.name}</h1>
          <Button size="lg" disabled={!!bookingIssue} onClick={() => book(r)}>
            {c("Book Now")}
          </Button>
        </div>
        {bookingIssue && <p role="status" className="mb-6 rounded-lg border p-4">{c(bookingIssue)} <Link to="/contact" className="text-primary underline">{c("Contact us")}</Link></p>}
        <Gallery key={r.id} images={r.media} name={r.name} />
        <section className="bg-secondary/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{c("Room Summary")}</h2>
          <p className="text-muted-foreground">{r.description}</p>
        </section>
        <section className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">{c("About The Room :")}</h2>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            {[fields.slice(0, 3), fields.slice(3)].map((column, index) => (
              <div key={index} className="space-y-4">
                {column
                  .filter(([, , value]) => value)
                  .map(([Icon, label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="w-4 h-4 text-primary" />
                        {c(label)}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">{c("Similar Rooms")}</h2>
            <Button asChild size="sm" variant="outline">
              <Link to="/search">{c("View All")}</Link>
            </Button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
            {related.data?.rooms
              .filter((other) => other.id !== r.id)
              .reverse()
              .map((other) => (
                <div
                  key={other.id}
                  className="min-w-[280px] w-[calc((100%_-_48px)/3)] shrink-0 snap-start"
                >
                  <LegacyRoomCard room={other} />
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function LegacyAccommodation() {
  const { slug, id } = useParams();
  const c = useBookingCopy();
  const result = useQuery({
    queryKey: ["legacy-accommodation", slug || id],
    queryFn: () =>
      api<Accommodation>(
        slug
          ? `/public/properties/by-slug/${encodeURIComponent(slug)}`
          : `/public/properties/${id}`,
      ),
  });
  const p = result.data;
  useEffect(() => {
    if (!p) return;
    const previous = document.title;
    document.title = p.seo_title || p.name;
    return () => {
      document.title = previous;
    };
  }, [p]);
  if (!p) return <p className="p-8">{result.error ? result.error.message : c("Loading…")}</p>;
  const transportNotes = [...new Set(p.rooms.map((room) => room.transport_notes).filter(Boolean))];
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">{p.name}</h1>
        <p className="flex items-center gap-2 text-muted-foreground mb-6">
          <MapPin className="w-4 h-4 shrink-0" />
          {p.address}
        </p>
        <Button asChild className="px-8">
          <Link to={`/search?property_id=${p.id}`}>{c("Apply Now")}</Link>
        </Button>
      </div>
      <section className="rounded-lg border bg-card shadow-sm mb-8">
        <h2 className="p-6 text-2xl font-semibold leading-none tracking-tight text-primary">
          {c("About")}
        </h2>
        <div className="p-6 pt-0">
          <p className="text-muted-foreground mb-6">{p.description}</p>
          <Gallery key={p.id} images={p.media} name={p.name} className="" />
        </div>
      </section>
      {p.facilities.length > 0 && (
        <section className="rounded-lg border bg-card shadow-sm mb-8">
          <h2 className="p-6 text-2xl font-semibold leading-none tracking-tight text-primary">
            {c("Facilities")}
          </h2>
          <div className="p-6 pt-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {p.facilities.map((f) => (
              <div className="flex items-center justify-center text-center p-2 sm:p-4" key={f}>
                <span className="p-3 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  {c(f)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="rounded-lg border bg-card shadow-sm mb-8">
        <h2 className="p-6 text-2xl font-semibold leading-none tracking-tight text-primary">
          {c("Reservation Types")}
        </h2>
        <div className="p-6 pt-0 grid grid-cols-2 md:grid-cols-4 gap-3">
          <span className="rounded-full bg-secondary/50 text-secondary-foreground text-xs font-semibold text-center py-2 px-2.5">
            {c(
              p.gender === "Male"
                ? "Males accommodation"
                : p.gender === "Female"
                  ? "Females accommodation"
                  : "Mixed accommodation",
            )}
          </span>
        </div>
      </section>
      {(p.transportation.length > 0 || transportNotes.length > 0) && (
        <section className="rounded-lg border bg-primary/10 border-primary/20 shadow-sm">
          <h2 className="p-6 text-2xl font-semibold leading-none tracking-tight text-primary">
            {c("Nearest Universities To The Residence")}
          </h2>
          <div className="p-6 pt-0 space-y-4">
            {p.transportation.map((route, index) => (
              <article
                className="rounded-lg border border-primary/10 bg-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-4"
                key={`${route.destination}-${index}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <GraduationCap className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{route.destination}</h3>
                    <p className="text-sm text-muted-foreground">{p.country}</p>
                  </div>
                </div>
                <div className="text-primary text-sm space-y-1">
                  <p>
                    {c(route.type)}
                    {route.name && route.name !== route.type ? ` · ${route.name}` : ""}
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {route.travel_minutes} {c("min")}
                  </p>
                  {route.walking_minutes > 0 && (
                    <p>
                      {route.walking_minutes} {c("min walk")}
                    </p>
                  )}
                </div>
              </article>
            ))}
            {p.transportation.length === 0 &&
              transportNotes.map((note) => (
                <article
                  key={note}
                  className="rounded-lg border border-primary/10 bg-white shadow-sm p-4"
                >
                  {p.university && (
                    <h3 className="font-semibold flex items-center gap-3 mb-2">
                      <GraduationCap className="w-6 h-6 text-primary shrink-0" />
                      {p.university}
                    </h3>
                  )}
                  <p className="text-sm text-primary whitespace-pre-line">{note}</p>
                </article>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
