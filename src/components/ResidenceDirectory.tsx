import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, ArrowUpRight } from "lucide-react";
import { api, mediaUrl, type Accommodation, type Catalog } from "@/lib/api";
import { useBookingCopy } from "@/content/booking-copy";
import { Button } from "@/components/ui/button";

export function ResidenceCard({ property: p }: { property: Accommodation }) {
  const c = useBookingCopy();
  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <Link to={`/accommodations/${p.slug}`} className="block h-full group">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {p.image ? (
            <img
              src={mediaUrl(p.image)}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-primary/40">
              <Building2 className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="space-y-3 p-5">
          <h3 className="text-xl font-semibold text-primary">{p.name}</h3>
          {[p.district, p.city, p.country].some(Boolean) && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {[...new Set([p.district, p.city, p.country].filter(Boolean))].join(" · ")}
            </p>
          )}
          {p.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
          )}
          <span className="flex items-center gap-2 pt-2 font-semibold text-primary">
            {c("View residence and rooms")} <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function ResidenceDirectory() {
  const c = useBookingCopy();
  const [page, setPage] = useState(1);
  const result = useQuery({
    queryKey: ["home-residences", page],
    queryFn: () => api<Catalog>(`/public/catalog?per_page=12&page=${page}`),
  });
  const pagination = result.data?.accommodations_pagination;
  return (
    <section
      id="residences"
      aria-labelledby="residences-title"
      className="py-12 sm:py-16 bg-muted/30 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 id="residences-title" className="text-3xl font-bold text-primary">
              {c("Our residences")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {c("Explore each residence and all its rooms in one place.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/accommodations">{c("All residences")}</Link>
            </Button>
            <Button asChild>
              <Link to="/search">{c("All rooms")}</Link>
            </Button>
          </div>
        </div>
        {result.isPending && <p role="status">{c("Loading…")}</p>}
        {result.error && (
          <div role="alert" className="space-y-3">
            <p>{c("We could not load the residences. Please try again.")}</p>
            <Button variant="outline" onClick={() => result.refetch()}>
              {c("Try again")}
            </Button>
          </div>
        )}
        {result.data && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.data.accommodations.map((p) => (
                <ResidenceCard key={p.id} property={p} />
              ))}
            </div>
            {pagination?.total_records === 0 && (
              <p>{c("No residences have been published yet.")}</p>
            )}
            {(pagination?.last_page || 1) > 1 && (
              <nav
                aria-label={c("Residence pages")}
                className="mt-6 flex flex-wrap items-center gap-4"
              >
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {c("Previous")}
                </Button>
                <span>
                  {c("Page")} {page} / {pagination?.last_page}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= pagination!.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  {c("Next")}
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
