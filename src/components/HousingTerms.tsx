import { FileText, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, mediaUrl, type HousingTermsDocument } from "@/lib/api";
import { useBookingCopy } from "@/content/booking-copy";
import { useLanguage } from "@/contexts/LanguageContext";
import { ManagedPage } from "./ManagedPage";

export function HousingTerms({
  name,
  document,
  checked,
  onAccept,
}: {
  name: string;
  document?: HousingTermsDocument | null;
  checked?: boolean;
  onAccept?: (accepted: boolean) => void;
}) {
  const c = useBookingCopy();
  return (
    <section className="min-w-0 space-y-3 rounded-xl border bg-card p-5">
      <h3 className="flex items-start gap-2 font-semibold">
        <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
        <span>{name}</span>
      </h3>
      {document ? (
        <>
          <a
            href={mediaUrl(document.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
          >
            {c("Read housing terms (PDF)")}
            <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
          </a>
          <p className="break-all text-xs text-muted-foreground">{document.name}</p>
          {onAccept && (
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                required
                checked={checked ?? false}
                onChange={(event) => onAccept(event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>{c("I have read and agree to the housing terms for this accommodation.")}</span>
            </label>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {c("No housing terms document has been uploaded for this accommodation.")}
        </p>
      )}
    </section>
  );
}

export function HousingTermsPage() {
  const c = useBookingCopy();
  const { language, isRTL } = useLanguage();
  const query = useQuery({
    queryKey: ["housing-terms", language],
    queryFn: () =>
      api<
        {
          property_id: number;
          property_name: string;
          property_slug: string;
          document: HousingTermsDocument;
        }[]
      >(`/public/housing-terms?lang=${language}`),
  });
  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <section id="housing-terms" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-10 sm:px-8">
        <h1 className="mb-3 text-3xl font-bold text-primary">
          {c("Housing terms for each accommodation")}
        </h1>
        <p className="mb-6 text-muted-foreground">
          {c(
            "Each accommodation has its own terms. Read the document for your selected residence before booking.",
          )}
        </p>
        {query.isPending && <p role="status">{c("Loading…")}</p>}
        {query.isError && (
          <div role="alert">
            <p>{c("Unable to load housing terms. Please try again.")}</p>
            <button className="mt-2 text-primary underline" onClick={() => void query.refetch()}>
              {c("Try again")}
            </button>
          </div>
        )}
        {query.data?.length === 0 && (
          <p>{c("No housing terms documents have been published yet.")}</p>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          {query.data?.map((property) => (
            <div key={property.property_id} className="space-y-2">
              <HousingTerms name={property.property_name} document={property.document} />
              <Link
                to={`/dormitory/${property.property_id}`}
                className="inline-block text-sm text-primary underline"
              >
                {c("View residence and rooms")}
              </Link>
            </div>
          ))}
        </div>
      </section>
      <ManagedPage slug="terms" />
    </div>
  );
}
