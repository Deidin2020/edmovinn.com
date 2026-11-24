import { describe, expect, it } from 'vitest';
import { bookingProgress, filterStudentBookings, parseBookingFilter, portalOverview, type PortalBooking } from '@/lib/student-portal';

const booking = (id: string, status: string, changes: Partial<PortalBooking> = {}): PortalBooking => ({
  id, status, residence_slug: 'moveinn', room_id: 'quadruple-70', reference: `EDM-${id}`,
  payment_status: 'unpaid', contract_status: 'not_started', check_in_status: 'not_started',
  availability_status: 'pending', created_at: '2026-11-24T07:00:00Z', ...changes,
});
describe('Student portal booking rules', () => {
  it('includes cancelled and completed bookings under All', () => {
    const rows = [booking('cancelled', 'cancelled'), booking('completed', 'check_in_completed')];
    expect(filterStudentBookings(rows, 'all').map(b => b.id)).toEqual(['cancelled', 'completed']);
  });
  it('filters pending and confirmed using existing lifecycle statuses', () => {
    const rows = ['awaiting_payment', 'pending_confirmation', 'booking_confirmed', 'contract_pending', 'contract_signed', 'check_in_completed', 'cancelled'].map(s => booking(s, s));
    expect(filterStudentBookings(rows, 'pending').map(b => b.status)).toEqual(['awaiting_payment', 'pending_confirmation']);
    expect(filterStudentBookings(rows, 'confirmed').map(b => b.status)).toEqual(['booking_confirmed', 'contract_pending', 'contract_signed']);
  });
  it('does not turn a received deposit into confirmed room or completed progress', () => {
    const paid = booking('paid', 'pending_confirmation', { payment_status: 'received' });
    expect(filterStudentBookings([paid], 'confirmed')).toEqual([]);
    expect(bookingProgress(paid)).toEqual([true, false, false, false]);
  });
  it('marks each progress step only from its trusted status fields', () => {
    expect(bookingProgress(booking('signed', 'contract_signed', { payment_status: 'received', availability_status: 'available', contract_status: 'signed' }))).toEqual([true, true, true, false]);
    expect(bookingProgress(booking('done', 'check_in_completed', { payment_status: 'received', availability_status: 'available', contract_status: 'signed', check_in_status: 'completed' }))).toEqual([true, true, true, true]);
  });
  it('shows most recent booking regardless of input order and counts only pending confirmation', () => {
    const rows = [booking('older', 'awaiting_payment'), booking('latest', 'cancelled', { created_at: '2026-11-24T08:00:00Z' }), booking('pending', 'pending_confirmation')];
    const result = portalOverview(rows);
    expect(result.total).toBe(3); expect(result.pending).toBe(1); expect(result.recent?.id).toBe('latest');
    expect(rows[0]?.id).toBe('older');
  });
  it('has no fabricated recent booking in an empty account', () => {
    expect(portalOverview([])).toEqual({ total: 0, pending: 0, recent: null });
    expect(filterStudentBookings([], 'confirmed')).toEqual([]);
  });
  it('validates URL filters without accepting unknown states', () => {
    expect(parseBookingFilter('pending')).toBe('pending');
    expect(parseBookingFilter('confirmed')).toBe('confirmed');
    expect(parseBookingFilter('received')).toBe('all');
  });
});