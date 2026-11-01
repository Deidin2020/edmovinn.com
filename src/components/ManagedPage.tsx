import { useBookingCopy } from "@/content/booking-copy";
import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
export type PageSection = {
  slot?: string;
  heading: string;
  body: string;
  image: string;
  label: string;
  link: string;
  visible: number;
};
export type PageContent = {
  sections: PageSection[];
  title: string;
  body: string;
  seo_title: string;
  seo_description: string;
  email: string;
  phone: string;
  address: string;
};
export function useSiteContent(slug: string) {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/ar" && language !== "ar") setLanguage("ar");
  }, [location.pathname, language, setLanguage]);
  const contentLanguage = location.pathname === "/ar" ? "ar" : language;
  return useQuery({
    queryKey: ["site-page", slug, contentLanguage],
    queryFn: () => api<PageContent | null>(`/public/pages/${slug}/${contentLanguage}`),
    refetchInterval: 30000,
  });
}
export function SiteContentStatus({ query }: { query: ReturnType<typeof useSiteContent> }) {
  const c = useBookingCopy();
  return (
    <div className="max-w-4xl mx-auto px-4 py-16" role={query.isError ? "alert" : "status"}>
      <p>
        {query.isPending
          ? c("Loading…")
          : query.isError
            ? c("Unable to load this page. Please try again.")
            : c("This page has not been published yet.")}
      </p>
      {query.isError && (
        <button className="mt-4 text-primary underline" onClick={() => query.refetch()}>
          {c("Try again")}
        </button>
      )}
    </div>
  );
}
export function PageSections({ sections = [] }: { sections?: PageSection[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sections.map((section, index) => (
        <section key={index} className="rounded-xl border bg-card p-6 space-y-4">
          {section.image && (
            <img
              src={section.image}
              alt={section.heading}
              loading="lazy"
              className="w-full h-56 object-cover rounded-lg"
            />
          )}
          {section.heading && <h2 className="text-2xl font-semibold">{section.heading}</h2>}
          <p className="whitespace-pre-wrap leading-8">{section.body}</p>
          {section.link && section.label && (
            <Link
              className="inline-block rounded-lg bg-primary px-5 py-3 text-primary-foreground"
              to={section.link}
            >
              {section.label}
            </Link>
          )}
        </section>
      ))}
    </div>
  );
}
export function ManagedPage({ slug, fallback }: { slug: string; fallback?: ReactNode }) {
  const c = useBookingCopy();
  const query = useSiteContent(slug);
  const { isRTL } = useLanguage();
  useEffect(() => {
    if (!query.data) return;
    const previous = document.title;
    document.title = query.data.seo_title || query.data.title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const existing = !!meta;
    const content = meta?.content || "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = query.data.seo_description;
    return () => {
      document.title = previous;
      if (existing) meta.content = content;
      else meta.remove();
    };
  }, [query.data]);
  if (!query.data)
    return (
      <>
        {fallback || (
          <div className="max-w-4xl mx-auto p-8">
            {query.isPending
              ? c("Loading…")
              : query.error
                ? c("Unable to load this page. Please try again.")
                : c("This page has not been published yet.")}
          </div>
        )}
      </>
    );
  return (
    <article dir={isRTL ? "rtl" : "ltr"} className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold text-primary">{query.data.title}</h1>
      <div className="whitespace-pre-wrap leading-8">{query.data.body}</div>
      {slug === "home" && !query.data.sections?.length && (
        <Link
          to="/search"
          className="inline-block rounded-lg bg-primary text-primary-foreground px-6 py-3"
        >
          {isRTL ? "استكشف السكن والغرف" : c("Explore accommodations")}
        </Link>
      )}
      {slug === "privacy" || slug === "terms" ? (
        <div className="space-y-8">
          {query.data.sections.map((section, index) => (
            <section key={index} className="space-y-3">
              <h2 className="text-xl font-semibold text-primary">{section.heading}</h2>
              <p className="whitespace-pre-wrap leading-8">{section.body}</p>
            </section>
          ))}
        </div>
      ) : (
        <PageSections sections={query.data.sections} />
      )}
    </article>
  );
}
