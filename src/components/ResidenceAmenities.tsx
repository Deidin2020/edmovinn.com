import { Bath, BellRing, BookOpen, Check, Clock3, Coffee, Dumbbell, Footprints, Heater, MapPin, MoonStar, Refrigerator, Utensils, WashingMachine, Waves, Wifi, type LucideIcon } from "lucide-react";
import { useBookingCopy } from "@/content/booking-copy";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Accommodation } from "@/lib/api";

const facilityIcons: Record<string, LucideIcon> = {
  "laundry room": WashingMachine,
  gym: Dumbbell,
  heating: Heater,
  refrigerator: Refrigerator,
  library: BookOpen,
  sauna: Waves,
  "turkish bath": Bath,
  mosque: MoonStar,
  cafeteria: Coffee,
  buffet: Utensils,
  "reception hall": BellRing,
  wifi: Wifi,
  "wi-fi": Wifi,
};
type Journey = { destination: string; service: string; duration: string; walk?: string };

function residenceJourneys(
  p: Accommodation,
  c: (value: string) => string,
  minutes: (n: number) => string,
): Journey[] {
  if (p.transportation.length) {
    return p.transportation.map((route) => ({
      destination: route.destination,
      service: [...new Set([c(route.type), c(route.name)].filter(Boolean))].join(" · "),
      duration: route.travel_minutes > 0 ? minutes(route.travel_minutes) : "",
      walk: route.walking_minutes > 0 ? `${minutes(route.walking_minutes)} ${c("on foot")}` : "",
    }));
  }

  // Older residences store the same imported itinerary on each room or contract.
  const notes = new Set(
    p.rooms
      .flatMap((room) => (room.transport_notes || "").split(/;\s*(?=[^;]+ → )/u))
      .map((note) => note.trim())
      .filter(Boolean),
  );
  return Array.from(notes, (note) => {
    const route = /^(.+?) → (.+?) · (.+)$/u.exec(note);
    if (!route) return { destination: "", service: note, duration: "" };
    const [, service, destination, duration] = route;
    const numericDuration = /^(\d+)\s*min$/i.exec(duration);
    return {
      destination,
      service: c(service),
      duration: numericDuration ? minutes(Number(numericDuration[1])) : duration,
    };
  });
}

export function ResidenceAmenities({ property }: { property: Accommodation }) {
  const c = useBookingCopy();
  const { language } = useLanguage();
  const minutes = new Intl.NumberFormat(language, {
    style: "unit",
    unit: "minute",
    unitDisplay: "long",
    numberingSystem: "latn",
  });
  const journeys = residenceJourneys(property, c, minutes.format);
  if (!property.facilities.length && !journeys.length) return null;

  return (
    <section
      id="residence-amenities"
      aria-label={c("Facilities and transportation")}
      className="mb-8 scroll-mt-24 space-y-8"
    >
      {journeys.length > 0 && (
        <section aria-labelledby="residence-transport-title" className="rounded-lg border bg-card p-6">
          <h2 id="residence-transport-title" className="mb-6 text-xl font-semibold">
            {c("Transportation")}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {journeys.map((journey, index) => (
              <li key={index} className="flex min-w-0 items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
                <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" strokeWidth={1.65} />
                <div className="min-w-0 flex-1 break-words">
                  {journey.destination && <h3 className="font-semibold">{journey.destination}</h3>}
                  <div className="flex flex-wrap items-baseline gap-x-2 whitespace-pre-line text-sm text-muted-foreground">
                    <span>{journey.service}</span>
                    {journey.destination && property.country && <span>{c(property.country)}</span>}
                  </div>
                  {(journey.duration || journey.walk) && (
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-foreground">
                      {journey.duration && <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-4 text-primary" />{journey.duration}</span>}
                      {journey.walk && <span className="inline-flex items-center gap-1.5"><Footprints aria-hidden="true" className="size-4 text-primary" />{journey.walk}</span>}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {property.facilities.length > 0 && (
        <section
          aria-labelledby="residence-facilities-title"
        >
          <h2 id="residence-facilities-title" className="mb-5 text-2xl font-semibold text-primary">
            {c("Facilities")}
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
            {property.facilities.map((facility) => {
              const Icon = facilityIcons[facility.trim().toLowerCase()] ?? Check;
              return (
                <li key={facility} className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/[0.07] text-primary">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.65} />
                  </span>
                  <span className="min-w-0 break-words text-sm font-medium">{c(facility)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}
