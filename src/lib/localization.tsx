import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';

export type Language = 'en' | 'tr';
export const LANGUAGE_STORAGE_KEY = 'edmovinn-language';
export function translate(language: Language, key: string): string {
  let value: unknown = language === 'tr' ? tr : en;
  for (const part of key.split('.')) {
    if (typeof value !== 'object' || value === null || !(part in value)) return key;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' ? value : key;
}
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string }>({ language: 'en', setLanguage: () => {}, t: key => translate('en', key) });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => {
    try { if (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'tr') setLanguageState('tr'); } catch { /* Storage can be blocked. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  function setLanguage(next: Language) {
    setLanguageState(next);
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* Switching remains available. */ }
  }
  return <LanguageContext.Provider value={{ language, setLanguage, t: key => translate(language, key) }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);