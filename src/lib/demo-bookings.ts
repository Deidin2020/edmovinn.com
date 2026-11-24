import { useSyncExternalStore } from 'react';
import type { PortalBooking } from './student-portal';

// Owner-requested design demo: demo-paid bookings live only in this browser tab's session,
// never in the database, and never contain student identity or card details.
const KEY = 'edmovinn-demo-bookings';
const EMPTY: PortalBooking[] = [];
const listeners = new Set<() => void>();
let cache: PortalBooking[] | null = null;

function read(): PortalBooking[] {
  if (cache) return cache;
  try { const raw = sessionStorage.getItem(KEY); const parsed: unknown = raw ? JSON.parse(raw) : []; cache = Array.isArray(parsed) ? (parsed as PortalBooking[]) : []; }
  catch { cache = []; }
  return cache;
}
export function isDemoBooking(b: Pick<PortalBooking, 'id'>) { return b.id.startsWith('demo-'); }
export function addDemoBooking(studentId: string, residenceSlug: string, roomId: string) {
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const booking: PortalBooking & { student: string } = { id: `demo-${code.toLowerCase()}`, student: studentId, residence_slug: residenceSlug, room_id: roomId, reference: `DEMO-${code}`, status: 'pending_confirmation', payment_status: 'received', contract_status: 'not_started', check_in_status: 'not_started', availability_status: 'pending', created_at: new Date().toISOString() };
  cache = [booking, ...read()];
  try { sessionStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* session only */ }
  listeners.forEach(l => l());
}
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
export function useDemoBookings(studentId: string, real: readonly PortalBooking[]) {
  const all = useSyncExternalStore(subscribe, read, () => EMPTY);
  const mine = all.filter(b => (b as PortalBooking & { student?: string }).student === studentId);
  return mine.length ? [...mine, ...real] : (real as PortalBooking[]);
}
