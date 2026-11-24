import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import { getUsdTryRate } from '@/lib/exchange-rate.functions';

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
export type DisplayCurrency = 'USD' | 'TRY';
export const CURRENCY_STORAGE_KEY = 'edmovinn-currency';
const RATE_STORAGE_KEY = 'edmovinn-usd-try-rate';
/** Formats a price, converting USD to TRY for display at the TCMB rate when it is known; otherwise keeps the source currency. */
export function formatMoney(amount: number, language: Language, display: DisplayCurrency, rate: number | null, source = 'USD') {
  const converted = display === 'TRY' && source === 'USD' && rate ? { value: amount * rate, currency: 'TRY' } : { value: amount, currency: source };
  return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: converted.currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(converted.value);
}
type Ctx = { language: Language; setLanguage: (language: Language) => void; t: (key: string) => string; currency: DisplayCurrency; setCurrency: (c: DisplayCurrency) => void; money: (amount: number, source?: string) => string };
const LanguageContext = createContext<Ctx>({ language: 'en', setLanguage: () => {}, t: key => translate('en', key), currency: 'USD', setCurrency: () => {}, money: (a, s) => formatMoney(a, 'en', 'USD', null, s) });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => {
    try { if (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'tr') setLanguageState('tr'); } catch { /* Storage can be blocked. */ }
  }, []);
  const [currency, setCurrencyState] = useState<DisplayCurrency>('USD');
  const [rate, setRate] = useState<number | null>(null);
  useEffect(() => {
    try { if (localStorage.getItem(CURRENCY_STORAGE_KEY) === 'TRY') setCurrencyState('TRY'); } catch { /* Storage can be blocked. */ }
  }, []);
  useEffect(() => {
    if (currency !== 'TRY' || rate) return;
    try { const cached = JSON.parse(sessionStorage.getItem(RATE_STORAGE_KEY) ?? 'null') as { rate: number; at: number } | null; if (cached && Date.now() - cached.at < 3_600_000) { setRate(cached.rate); return; } } catch { /* ignore */ }
    getUsdTryRate().then(({ rate: value }) => { if (value) { setRate(value); try { sessionStorage.setItem(RATE_STORAGE_KEY, JSON.stringify({ rate: value, at: Date.now() })); } catch { /* ignore */ } } }).catch(() => { /* Prices stay in USD when no rate is available. */ });
  }, [currency, rate]);
  function setCurrency(next: DisplayCurrency) {
    setCurrencyState(next);
    try { localStorage.setItem(CURRENCY_STORAGE_KEY, next); } catch { /* ignore */ }
  }
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  function setLanguage(next: Language) {
    setLanguageState(next);
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* Switching remains available. */ }
  }
  return <LanguageContext.Provider value={{ language, setLanguage, t: key => translate(language, key), currency, setCurrency, money: (amount, source) => formatMoney(amount, language, currency, rate, source) }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);