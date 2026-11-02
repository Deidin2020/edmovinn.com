import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContent } from "./ManagedPage";

export function Footer() {
  const { t, setLanguage } = useLanguage();
  const contact = useSiteContent("contact");
  const footer = useSiteContent("footer");
  const phone = contact.data?.phone || t("footer.contact.phone");
  return (
    <footer className="bg-secondary text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <img
              src="/img/edmovinn-logo-White.png"
              alt="Movinn Logo"
              className="h-[70px] w-auto object-contain brightness-200"
            />
            <p className="text-sm text-white/80">{footer.data?.body || t("footer.description")}</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold min-h-[26px]">{t("footer.quickLinksTitle")}</h4>
            <div className="space-y-2">
              {[
                ["/", "header.home"],
                ["/accommodations", "labels.accommodations"],
                ["/search", "header.discover_room"],
                ["/about", "header.about_us"],
                ["/contact", "header.contact_us"],
              ].map(([url, key]) => (
                <Link className="block text-sm text-white/80 hover:text-white" key={url} to={url}>
                  {t(key)}
                </Link>
              ))}
              <a
                className="block text-sm text-white/80 hover:text-white"
                href="/documents/movinn-housing-contract-and-regulations-2026-09-15.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("footer.housingContract")}
              </a>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">{t("header.contact_us")}</h4>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{contact.data?.email || t("footer.contact.email")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span dir="ltr">{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{contact.data?.address || t("footer.contact.address")}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">{t("header.language")}</h4>
            <div className="space-y-2">
              {(["tr", "ar", "en"] as const).map((language, index) => (
                <Link
                  className="block text-sm text-white/80 hover:text-white"
                  key={language}
                  to={language === "ar" ? "/ar" : "/"}
                  onClick={() => setLanguage(language)}
                >
                  {t(["header.turkish", "header.arabic", "header.english"][index])}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {footer.data?.sections?.length ? (
          <div className="grid gap-6 md:grid-cols-3 mt-8">
            {footer.data.sections.map((section, index) => (
              <section key={section.slot || index} className="space-y-3">
                {section.image && (
                  <img
                    src={section.image}
                    alt={section.heading}
                    className="w-full h-40 object-cover rounded-lg"
                    loading="lazy"
                  />
                )}
                {section.heading && <h4 className="font-semibold">{section.heading}</h4>}
                {section.body && (
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{section.body}</p>
                )}
                {section.link && section.label && (
                  <Link to={section.link} className="inline-block text-sm underline">
                    {section.label}
                  </Link>
                )}
              </section>
            ))}
          </div>
        ) : null}
        <div className="border-t border-white/20 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/60">{t("footer.rights")}</p>
          <p className="text-sm text-white/60">{t("footer.madeWith")}</p>
        </div>
      </div>
      <a
        className="fixed bottom-5 right-5 w-[60px] h-[60px] z-40"
        href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <img src="/img/whatsapp.webp" alt="WhatsApp" className="w-[88%] h-[88%]" />
      </a>
    </footer>
  );
}
