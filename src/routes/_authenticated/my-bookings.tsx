import { createFileRoute } from '@tanstack/react-router';
import { parseBookingFilter, type BookingFilter } from '@/lib/student-portal';
import { studentPortalQuery } from '@/lib/student-portal-query';
import { StudentBookings, StudentPortalShell, PortalError, PortalLoading } from '@/components/edmovinn/student-portal';

export const Route = createFileRoute('/_authenticated/my-bookings')({
  validateSearch: (raw: Record<string, unknown>): { filter: BookingFilter } => ({ filter: parseBookingFilter(raw['filter']) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(studentPortalQuery(context.studentId)),
  head: () => ({ meta: [
    { title: 'My Bookings | Edmovinn' },
    { name: 'description', content: 'View your Edmovinn student accommodation reservations, room confirmation and deposit payment statuses.' },
    { property: 'og:title', content: 'My Bookings | Edmovinn' },
    { property: 'og:description', content: 'Your private student accommodation reservations and statuses.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: BookingsPage,
  pendingComponent: () => <StudentPortalShell><PortalLoading /></StudentPortalShell>,
  errorComponent: () => <StudentPortalShell><PortalError /></StudentPortalShell>,
  notFoundComponent: () => <StudentPortalShell><PortalError /></StudentPortalShell>,
});
function BookingsPage() {
  const { studentId } = Route.useRouteContext(); const { filter } = Route.useSearch();
  return <StudentPortalShell><StudentBookings studentId={studentId} filter={filter} /></StudentPortalShell>;
}