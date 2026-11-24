import type { Tables } from '@/integrations/supabase/types';

export type PortalBooking = Pick<Tables<'bookings'>, 'id' | 'residence_slug' | 'room_id' | 'reference' | 'status' | 'payment_status' | 'contract_status' | 'check_in_status' | 'availability_status' | 'created_at'>;
export type BookingFilter = 'all' | 'pending' | 'confirmed';
const pendingStatuses = new Set(['awaiting_payment', 'pending_confirmation']);
const confirmedStatuses = new Set(['booking_confirmed', 'contract_pending', 'contract_signed']);
export function parseBookingFilter(value: unknown): BookingFilter {
  return value === 'pending' || value === 'confirmed' ? value : 'all';
}
export function filterStudentBookings(bookings: readonly PortalBooking[], filter: BookingFilter) {
  return bookings.filter(b => filter === 'all' || (filter === 'pending' ? pendingStatuses : confirmedStatuses).has(b.status));
}
export function portalOverview(bookings: readonly PortalBooking[]) {
  return { total: bookings.length, pending: bookings.filter(b => b.status === 'pending_confirmation').length,
    recent: [...bookings].sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null };
}
export function bookingProgress(booking: PortalBooking) {
  // Independent trusted fields: receiving a deposit never confirms a room or signs a contract.
  return [booking.payment_status === 'received',
    booking.availability_status === 'available' && (confirmedStatuses.has(booking.status) || booking.status === 'check_in_completed'),
    booking.contract_status === 'signed', booking.check_in_status === 'completed'];
}