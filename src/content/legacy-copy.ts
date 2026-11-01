import dictionaries from "./legacy-locales.json";
const aliases: Record<string, string> = {
  "header.discover": "header.discover_room",
  "header.about": "header.about_us",
  "header.contact": "header.contact_us",
  "header.signin": "header.sign_in",
  "header.signup": "header.sign_up",
  "footer.contactInfo": "contact.info_title",
  "footer.quickLinks": "footer.quickLinksTitle",
  "footer.languages": "header.language",
};
export function legacyCopy(language: "en" | "ar" | "tr", key: string): string | undefined {
  const path = aliases[key] || key;
  let value: unknown = dictionaries[language];
  for (const part of path.split(".")) {
    if (!value || typeof value !== "object") return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === "string" ? value : undefined;
}
