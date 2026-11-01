import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Shield,
  Star,
  Users,
  Mail,
  Phone,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PageSections,
  SiteContentStatus,
  useSiteContent,
  type PageContent,
} from "@/components/ManagedPage";
import { Button } from "@/components/ui/button";
import { api, type Catalog } from "@/lib/api";
import { useBookingCopy } from "@/content/booking-copy";

function usePageMeta(page: PageContent | null | undefined) {
  useEffect(() => {
    if (!page) return;
    document.title = page.seo_title || page.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) meta.content = page.seo_description;
  }, [page]);
}
export function LegacyHome() {
  const { t } = useLanguage();
  const page = useSiteContent("home");
  usePageMeta(page.data);
  const sections = Array.from({ length: 8 }, (_, i) =>
    page.data?.sections.find((s) => s.slot === `text${i}`),
  );
  const titles = (page.data?.title ?? `${t("hero.titleLine1")} — ${t("hero.titleLine2")}`).split(
    " — ",
  );
  const actions = Array.from({ length: 4 }, (_, i) =>
    page.data?.sections.find((s) => s.slot === `action${i}`),
  );
  const image = page.data
    ? page.data.sections.find((s) => s.slot === "image0")?.image
    : "/legacy-assets/mall-istanbul-hero-CtsvBOyl.webp";
  const keys = [
    "easySearch",
    "idealLocation",
    "safeEnvironment",
    "qualityService",
    "socialLife",
    "support247",
  ];
  const icons = [Search, MapPin, Shield, Star, Users, Search];
  if (!page.data) return <SiteContentStatus query={page} />;
  const extraSections = page.data.sections.filter(
    (s) => !/^(text[0-7]|action[0-2]|image0)$/.test(s.slot || ""),
  );
  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: image ? `url(${image})` : undefined }}
        >
          <div className="absolute inset-0 bg-primary/70" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {titles[0]}
            <br />
            <span className="text-accent">{titles.slice(1).join(" — ")}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            {page.data?.body ?? t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(!page.data || actions[0]) && (
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white">
                <Link to={actions[0]?.link || "/search"}>
                  {actions[0]?.label || t("hero.exploreButton")}
                </Link>
              </Button>
            )}
            {(!page.data || actions[1]) && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white hover:text-primary"
              >
                <Link to={actions[1]?.link || "/about"}>
                  {actions[1]?.label || t("hero.aboutButton")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
      {(!page.data || sections[0]) && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {sections[0]?.heading ?? t("whyChooseUs.title")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {sections[0]?.body ?? t("whyChooseUs.subtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {keys.map((key, index) => {
                if (page.data && !sections[index + 1]) return null;
                const Icon = icons[index];
                return (
                  <section
                    key={key}
                    className="rounded-lg border bg-card shadow-sm p-6 hover:shadow-lg transition-shadow"
                  >
                    <Icon className="w-8 h-8 text-accent mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-3">
                      {sections[index + 1]?.heading ?? t(`whyChooseUs.${key}.title`)}
                    </h3>
                    <p className="text-muted-foreground">
                      {sections[index + 1]?.body ?? t(`whyChooseUs.${key}.desc`)}
                    </p>
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {(!page.data || sections[7]) && (
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {sections[7]?.heading ?? t("cta.title")}
            </h2>
            <p className="text-xl mb-8 text-white/90">{sections[7]?.body ?? t("cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to={sections[7]?.link ?? "/search"}>
                  {sections[7]?.label ?? t("cta.startNow")}
                </Link>
              </Button>
              {(!page.data || actions[2]) && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
                >
                  <Link to={actions[2]?.link || "/about"}>
                    {actions[2]?.label || t("cta.moreInfo")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
      {extraSections.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <PageSections sections={extraSections} />
        </div>
      )}
    </div>
  );
}

export function LegacyAbout() {
  const { t } = useLanguage();
  const page = useSiteContent("about");
  const [slide, setSlide] = useState(0);
  usePageMeta(page.data);
  const sections = Array.from({ length: 3 }, (_, i) =>
    page.data?.sections.find((s) => s.slot === `text${i}`),
  );
  const hero = page.data?.sections.find((s) => s.slot === "image0")?.image;
  const gallery =
    page.data?.sections.filter((s) => s.image && s.slot !== "image0").map((s) => s.image) || [];
  if (!page.data) return <SiteContentStatus query={page} />;
  const extraSections = page.data.sections.filter(
    (s) => !s.image && !/^text[0-2]$/.test(s.slot || ""),
  );
  return (
    <div className="container mx-auto px-4 py-8 -mt-16 space-y-12">
      <section className="text-center space-y-6">
        {hero && (
          <div className="aspect-[21/9] rounded-2xl overflow-hidden border-2 border-accent/20 mb-8">
            <img src={hero} alt={t("about.title")} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-[33.6px] leading-none font-bold text-primary">
          {page.data?.title ?? t("about.title")}
        </h1>
        <p className="!mt-4 text-[18.4px] leading-7 text-muted-foreground max-w-4xl mx-auto">
          {page.data?.body ?? t("about.intro")}
        </p>
      </section>
      {["vision", "mission", "how"].map(
        (key, index) =>
          (!page.data || sections[index]) && (
            <section key={key} className="space-y-8">
              <h2 className="text-3xl font-bold text-center">
                {sections[index]?.heading ?? t(`about.${key}.title`)}
              </h2>
              <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm p-6">
                <p>{sections[index]?.body ?? t(`about.${key}.text`)}</p>
              </div>
            </section>
          ),
      )}
      {gallery.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">{t("about.gallery")}</h2>
          <div className="rounded-lg border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-accent/20">
              <img
                className="w-full h-full object-cover"
                src={gallery[slide % gallery.length]}
                alt={`${t("about.gallery")} ${slide + 1}`}
              />
              {gallery.length > 1 && (
                <>
                  <button
                    aria-label={t("actions.previous")}
                    className="absolute start-4 top-1/2 bg-primary/80 text-white rounded p-2"
                    onClick={() => setSlide((slide + gallery.length - 1) % gallery.length)}
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    aria-label={t("actions.next")}
                    className="absolute end-4 top-1/2 bg-primary/80 text-white rounded p-2"
                    onClick={() => setSlide((slide + 1) % gallery.length)}
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
      {extraSections.length > 0 && <PageSections sections={extraSections} />}
    </div>
  );
}

export function LegacyContact() {
  const { t } = useLanguage();
  const c = useBookingCopy();
  const page = useSiteContent("contact");
  const catalog = useQuery({
    queryKey: ["contact-properties"],
    queryFn: () => api<Catalog>("/public/catalog?per_page=100"),
  });
  const [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [error, setError] = useState("");
  usePageMeta(page.data);
  const sections = Array.from({ length: 3 }, (_, i) =>
    page.data?.sections.find((s) => s.slot === `text${i}`),
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setSent(false);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(form));
      await api("/public/messages", "POST", {
        ...values,
        property_id: Number(values.property_id || catalog.data?.accommodations[0]?.id),
      });
      setSent(true);
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  const hours = (
    sections[2]?.body ??
    [
      t("contact.weekdays"),
      t("contact.weekdays_hours"),
      t("contact.saturday"),
      t("contact.saturday_hours"),
      t("contact.sunday"),
      t("contact.sunday_hours"),
    ].join("\n")
  ).split("\n");
  if (!page.data) return <SiteContentStatus query={page} />;
  const phone =
    page.data.sections.find((s) => s.heading === "contact_phones")?.body || page.data.phone;
  const extraSections = page.data.sections.filter(
    (s) => !/^text[0-2]$/.test(s.slot || "") && s.heading !== "contact_phones",
  );
  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{page.data?.title ?? t("contact.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {page.data?.body ?? t("contact.subtitle")}
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          {sections[0] && (
            <section className="rounded-lg border bg-card shadow-sm">
              <h2 className="text-2xl leading-none font-semibold tracking-tight flex items-center gap-2 p-6">
                <Send className="w-5 h-5" />
                {sections[0]?.heading ?? t("contact.form_title")}
              </h2>
              <form onSubmit={submit} className="p-6 pt-4 space-y-4">
                {catalog.data && catalog.data.accommodations.length > 1 && (
                  <label className="block text-sm font-medium">
                    {t("accommodation.title")}
                    <select
                      required
                      name="property_id"
                      className="mt-2 w-full border rounded-md p-3 bg-background"
                    >
                      {catalog.data.accommodations.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="block text-sm font-medium">
                  {t("contact.full_name")}
                  <input
                    required
                    name="name"
                    maxLength={150}
                    autoComplete="name"
                    placeholder={t("contact.full_name_placeholder")}
                    className="mt-2 w-full border rounded-md h-10 px-3 bg-background"
                  />
                </label>
                <label className="block text-sm font-medium">
                  {t("contact.phone")}
                  <input
                    required
                    name="phone"
                    type="tel"
                    maxLength={50}
                    autoComplete="tel"
                    placeholder={t("contact.phone_placeholder")}
                    className="mt-2 w-full border rounded-md h-10 px-3 bg-background"
                  />
                </label>
                <label className="block text-sm font-medium">
                  {t("contact.message")}
                  <textarea
                    required
                    name="message"
                    maxLength={5000}
                    rows={5}
                    placeholder={t("contact.message_placeholder")}
                    className="mt-2 w-full border rounded-md p-3 h-[120px] bg-background"
                  />
                </label>
                {(error || catalog.error) && (
                  <p role="alert" className="text-destructive">
                    {error || String(catalog.error)}
                  </p>
                )}
                {sent && (
                  <p role="status">
                    {c("Your message was saved and sent to the property's management inbox.")}
                  </p>
                )}
                <Button className="w-full" disabled={busy || !catalog.data?.accommodations.length}>
                  {busy ? c("Sending…") : t("contact.send_button")}
                </Button>
              </form>
            </section>
          )}
          <div className="space-y-8">
            {sections[1] && (
              <section className="rounded-lg border bg-card shadow-sm p-6">
                <h2 className="text-2xl leading-none font-semibold tracking-tight mb-6">
                  {sections[1]?.body ?? t("contact.info_description")}
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold">{t("contact.email_label")}</h3>
                      <p className="text-muted-foreground">
                        <a href={`mailto:${page.data.email}`}>{page.data.email}</a>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold">{t("contact.phone_label")}</h3>
                      <p dir="ltr" className="text-muted-foreground whitespace-pre-line">
                        {phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold">{t("contact.office_label")}</h3>
                      <p className="text-muted-foreground">{page.data.address}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {sections[2] && (
              <section className="rounded-lg border bg-card shadow-sm p-6">
                <h2 className="text-2xl leading-none font-semibold tracking-tight mb-6">
                  {sections[2]?.heading ?? t("contact.office_hours")}
                </h2>
                <div className="space-y-2">
                  {[0, 2, 4].map((i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{hours[i]}</span>
                      <span className="font-medium">{hours[i + 1]}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
        {extraSections.length > 0 && (
          <div className="mt-12">
            <PageSections sections={extraSections} />
          </div>
        )}
      </div>
    </div>
  );
}
