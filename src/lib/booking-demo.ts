// TEMPORARY DEMO RULES — replace with residence contract settings and administrator quotes when available.
// Demo amounts are estimates only and must never be sent to a payment gateway.
export const DEMO_BOOKING_CONFIG = {
 contractEnd: { month: 6, day: 24 },
 /** Demo deposit = this many months of the room's monthly rent, used only when no administrator deposit exists. */
 depositMonths: 1,
} as const;
export type RentPlan = 'monthly' | 'annual';
const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (v: string) => { const [y, m, d] = v.split('-').map(Number); return new Date(Date.UTC(y!, m! - 1, d!)); };
const daysIn = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
const round = (n: number) => Math.round(n * 100) / 100;
/** Next contract end strictly after the move-in date. */
export function contractEndFor(moveIn: string, end: { month: number; day: number } = DEMO_BOOKING_CONFIG.contractEnd) {
 const start = utc(moveIn); let candidate = new Date(Date.UTC(start.getUTCFullYear(), end.month - 1, end.day));
 if (candidate <= start) candidate = new Date(Date.UTC(start.getUTCFullYear() + 1, end.month - 1, end.day));
 return iso(candidate);
}
/** Calendar-month segments from move-in (inclusive) to contract end (exclusive), prorated by occupied days. */
export function stayPeriods(moveIn: string, contractEnd: string, monthlyRent: number) {
 const out: { month: string; days: number; monthDays: number; amount: number }[] = [];
 let cur = utc(moveIn); const end = utc(contractEnd);
 while (cur < end) {
  const y = cur.getUTCFullYear(), m = cur.getUTCMonth(); const monthDays = daysIn(y, m);
  const next = new Date(Date.UTC(y, m + 1, 1)); const stop = next < end ? next : end;
  const days = Math.round((stop.getTime() - cur.getTime()) / 86400000);
  out.push({ month: iso(cur).slice(0, 7), days, monthDays, amount: round(monthlyRent * days / monthDays) });
  cur = stop;
 }
 return out;
}
export function demoQuote(moveIn: string, monthlyRent: number, adminDeposit?: number | null) {
 const contractEnd = contractEndFor(moveIn); const periods = stayPeriods(moveIn, contractEnd, monthlyRent);
 const total = round(periods.reduce((s, p) => s + p.amount, 0));
 const s0 = utc(moveIn), e0 = utc(contractEnd); let fullMonths = (e0.getUTCFullYear() - s0.getUTCFullYear()) * 12 + e0.getUTCMonth() - s0.getUTCMonth();
 const anchor = (n: number) => new Date(Date.UTC(s0.getUTCFullYear(), s0.getUTCMonth() + n, Math.min(s0.getUTCDate(), daysIn(s0.getUTCFullYear(), s0.getUTCMonth() + n))));
 if (anchor(fullMonths) > e0) fullMonths--; const extraDays = Math.round((e0.getTime() - anchor(fullMonths).getTime()) / 86400000);
 const isDemoDeposit = adminDeposit == null; const deposit = round(Math.min(total, adminDeposit ?? monthlyRent * DEMO_BOOKING_CONFIG.depositMonths));
 return { contractEnd, periods, total, deposit, remaining: round(total - deposit), fullMonths, extraDays, isDemoDeposit };
}
