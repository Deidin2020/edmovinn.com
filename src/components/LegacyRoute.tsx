import { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import NotFound from "@/pages/NotFound";

// Keep bookmarked legacy URLs and their checkout/reset query parameters usable.
export function LegacyRedirect({
  to,
  params = {},
}: {
  to: string;
  params?: Record<string, string>;
}) {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  Object.entries(params).forEach(([key, value]) => search.set(key, value));
  return <Navigate replace to={{ pathname: to, search: search.toString(), hash: location.hash }} />;
}

export function LegacyLanguageRoute() {
  const { locale, "*": path } = useParams();
  const { setLanguage } = useLanguage();
  const valid = locale === "ar" || locale === "tr" || locale === "en";
  useEffect(() => {
    if (locale === "ar" || locale === "tr" || locale === "en") setLanguage(locale);
  }, [locale, setLanguage]);
  return valid ? <LegacyRedirect to={`/${path || ""}`} /> : <NotFound />;
}
