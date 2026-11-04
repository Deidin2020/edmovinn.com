import { MapPin } from "lucide-react";
import { useBookingCopy } from "@/content/booking-copy";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Accommodation } from "@/lib/api";

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
      {property.facilities.length > 0 && (
        <section
          aria-labelledby="residence-facilities-title"
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <h2
            id="residence-facilities-title"
            className="p-6 text-2xl font-semibold leading-none tracking-tight text-primary"
          >
            {c("Facilities")}
          </h2>
          <ul className="grid grid-cols-2 gap-4 px-6 pb-6 sm:grid-cols-3 lg:grid-cols-6">
            {property.facilities.map((facility) => (
              <li
                key={facility}
                className="flex min-w-0 flex-col items-center p-2 text-center sm:p-4"
              >
                <span className="max-w-full break-words rounded-full bg-green-100 p-3 text-sm font-medium text-foreground">
                  {c(facility)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {journeys.length > 0 && (
        <section
          aria-labelledby="residence-transport-title"
          className="rounded-lg border border-primary/20 bg-primary/10 text-card-foreground shadow-sm"
        >
          <h2
            id="residence-transport-title"
            className="p-6 text-2xl font-semibold leading-none tracking-tight text-primary"
          >
            {c("Transportation")}
          </h2>
          <ul className="space-y-4 px-6 pb-6">
            {journeys.map((journey, index) => (
              <li
                key={index}
                className={`grid items-center gap-4 rounded-lg border border-primary/10 bg-white p-4 shadow-sm ${journey.destination ? "grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : ""}`}
              >
                {journey.destination && (
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-12">
                      <MapPin aria-hidden="true" className="size-6 text-primary" />
                    </span>
                    <div className="min-w-0 break-words">
                      <h3 className="font-semibold text-foreground">{journey.destination}</h3>
                      <p className="text-sm text-muted-foreground">{c(property.country)}</p>
                    </div>
                  </div>
                )}
                <div
                  className={`min-w-0 whitespace-pre-line break-words text-sm ${journey.destination ? "text-end" : ""}`}
                >
                  <p className="text-primary">{journey.service}</p>
                  {journey.duration && <p className="text-muted-foreground">{journey.duration}</p>}
                  {journey.walk && <p className="text-muted-foreground">{journey.walk}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
