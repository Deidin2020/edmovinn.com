import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import { getUsdTryRate } from '@/lib/exchange-rate.functions';
import { cachedRate, convertedMoney, DEFAULT_DISPLAY_CURRENCY, RATE_CACHE_TTL, validRate, type DisplayCurrency } from './display-money';
export type { DisplayCurrency } from './display-money';

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
export const CURRENCY_STORAGE_KEY = 'edmovinn-currency';
const RATE_STORAGE_KEY = 'edmovinn-usd-try-rate';
/** Formats a price, converting USD to TRY for display at the TCMB rate when it is known; otherwise keeps the source currency. */
export function formatMoney(amount: number, language: Language, display: DisplayCurrency, rate: number | null, source = 'USD', contract = false) {
  const converted = convertedMoney(amount, display, rate, source);
  return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: converted.currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: contract ? 2 : 0, maximumFractionDigits: contract ? 2 : 0 }).format(converted.value);
}
type Ctx = { language: Language; setLanguage: (language: Language) => void; t: (key: string) => string; currency: DisplayCurrency; rateStatus: 'loading' | 'ready' | 'unavailable'; setCurrency: (c: DisplayCurrency) => void; money: (amount: number, source?: string) => string; contractMoney: (amount: number, source?: string) => string };
const LanguageContext = createContext<Ctx>({ language: 'en', setLanguage: () => {}, t: key => translate('en', key), currency: DEFAULT_DISPLAY_CURRENCY, rateStatus: 'loading', setCurrency: () => {}, money: (a, s) => formatMoney(a, 'en', DEFAULT_DISPLAY_CURRENCY, null, s), contractMoney: (a, s = 'USD') => formatMoney(a, 'en', s === 'TRY' ? 'TRY' : 'USD', null, s) });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => {
    try { if (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'tr') setLanguageState('tr'); } catch { /* Storage can be blocked. */ }
  }, []);
  const [currency, setCurrencyState] = useState<DisplayCurrency>(DEFAULT_DISPLAY_CURRENCY);
  const [rate, setRate] = useState<number | null>(null);
  const [rateStatus, setRateStatus] = useState<Ctx['rateStatus']>('loading');
  useEffect(() => {
    try { const saved = localStorage.getItem(CURRENCY_STORAGE_KEY); if (saved === 'TRY' || saved === 'USD') setCurrencyState(saved); } catch { /* Storage can be blocked. */ }
  }, []);
  useEffect(() => {
    let active = true; let timer: ReturnType<typeof setTimeout> | undefined;
    async function refresh() {
      let cached: number | null = null;
      let at = Date.now();
      try { const raw = sessionStorage.getItem(RATE_STORAGE_KEY); cached = cachedRate(raw); if (cached) { const value = JSON.parse(raw ?? '{}') as { at: number }; at = value.at; } } catch { /* Storage can be blocked. */ }
      if (cached && active) { setRate(cached); setRateStatus('ready'); timer = setTimeout(() => void refresh(), Math.max(1, RATE_CACHE_TTL - (Date.now() - at))); return; }
      if (!active) return;
      setRate(null); setRateStatus('loading');
      try {
        const { rate: value } = await getUsdTryRate();
        if (!active) return;
        if (validRate(value)) {
          setRate(value); setRateStatus('ready');
          try { sessionStorage.setItem(RATE_STORAGE_KEY, JSON.stringify({ rate: value, at: Date.now() })); } catch { /* Storage can be blocked. */ }
          timer = setTimeout(() => void refresh(), RATE_CACHE_TTL);
        } else setRateStatus('unavailable');
      } catch { if (active) setRateStatus('unavailable'); }
    }
    void refresh();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, []);
  function setCurrency(next: DisplayCurrency) {
    setCurrencyState(next);
    try { localStorage.setItem(CURRENCY_STORAGE_KEY, next); } catch { /* ignore */ }
  }
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  function setLanguage(next: Language) {
    setLanguageState(next);
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* Switching remains available. */ }
  }
  return <LanguageContext.Provider value={{ language, setLanguage, t: key => translate(language, key), currency, rateStatus, setCurrency, money: (amount, source) => formatMoney(amount, language, currency, rate, source), contractMoney: (amount, source = 'USD') => formatMoney(amount, language, source === 'TRY' ? 'TRY' : 'USD', null, source, true) }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);