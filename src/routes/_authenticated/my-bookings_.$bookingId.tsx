import { createFileRoute } from '@tanstack/react-router';
import { studentPortalQuery } from '@/lib/student-portal-query';
import { BookingDetailsDestination, StudentPortalShell, PortalError, PortalLoading } from '@/components/edmovinn/student-portal';

export const Route = createFileRoute('/_authenticated/my-bookings_/$bookingId')({
  loader: ({ context }) => context.queryClient.ensureQueryData(studentPortalQuery(context.studentId)),
  head: () => ({ meta: [
    { title: 'Booking Details | Edmovinn Student Portal' },
    { name: 'description', content: 'Private destination for your specific Edmovinn student accommodation booking.' },
    { property: 'og:title', content: 'Booking Details | Edmovinn Student Portal' },
    { property: 'og:description', content: 'Your private Edmovinn booking details destination.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: DetailsPage,
  pendingComponent: () => <StudentPortalShell><PortalLoading /></StudentPortalShell>,
  errorComponent: () => <StudentPortalShell><PortalError /></StudentPortalShell>,
  notFoundComponent: () => <StudentPortalShell><PortalError /></StudentPortalShell>,
});
function DetailsPage() {
  const { studentId } = Route.useRouteContext(); const { bookingId } = Route.useParams();
  return <StudentPortalShell><BookingDetailsDestination studentId={studentId} bookingId={bookingId} /></StudentPortalShell>;
}