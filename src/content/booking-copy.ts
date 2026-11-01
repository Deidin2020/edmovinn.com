import { useLanguage } from "@/contexts/LanguageContext";
import translations from "./booking-translations.json";

export function useBookingCopy() {
  const { language } = useLanguage();
  return (text: string) => {
    const entry = translations[text as keyof typeof translations] || translations[text.toLowerCase() as keyof typeof translations];
    return entry && language !== "en" ? entry[language] : text;
  };
}
