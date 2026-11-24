export type DisplayCurrency = 'USD' | 'TRY';
export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = 'TRY';
export const RATE_CACHE_TTL = 3_600_000;
export function validRate(rate: unknown): rate is number { return typeof rate === 'number' && Number.isFinite(rate) && rate > 0; }
export function cachedRate(raw: string | null, now = Date.now()): number | null {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (typeof value !== 'object' || value === null || !('rate' in value) || !('at' in value)) return null;
    return validRate(value.rate) && typeof value.at === 'number' && Number.isFinite(value.at) && now >= value.at && now - value.at < RATE_CACHE_TTL ? value.rate : null;
  } catch { return null; }
}
export function convertedMoney(amount: number, display: DisplayCurrency, rate: number | null, source = 'USD') {
  if (display === source) return { value: amount, currency: source, unavailable: false };
  if (validRate(rate) && source === 'USD' && display === 'TRY') return { value: amount * rate, currency: 'TRY', unavailable: false };
  if (validRate(rate) && source === 'TRY' && display === 'USD') return { value: amount / rate, currency: 'USD', unavailable: false };
  return { value: amount, currency: source, unavailable: true };
}