import { createServerFn } from '@tanstack/react-start';

/** USD→TRY ForexSelling rate from the Central Bank of the Republic of Türkiye (TCMB) daily bulletin. */
export const getUsdTryRate = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const res = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    if (!res.ok) return { rate: null as number | null, date: null as string | null };
    const xml = await res.text();
    const block = xml.match(/<Currency[^>]*Kod="USD"[\s\S]*?<\/Currency>/)?.[0] ?? '';
    const value = Number(block.match(/<ForexSelling>([\d.]+)<\/ForexSelling>/)?.[1]);
    const date = xml.match(/Tarih="([^"]+)"/)?.[1] ?? null;
    return { rate: Number.isFinite(value) && value > 0 ? value : null, date };
  } catch {
    return { rate: null as number | null, date: null as string | null };
  }
});
