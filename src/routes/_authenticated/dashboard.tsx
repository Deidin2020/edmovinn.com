import { createFileRoute } from '@tanstack/react-router';
import { studentPortalQuery } from '@/lib/student-portal-query';
import { StudentDashboard, StudentPortalShell, PortalError, PortalLoading } from '@/components/edmovinn/student-portal';

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context }) => context.queryClient.ensureQueryData(studentPortalQuery(context.studentId)),
  head: () => ({ meta: [
    { title: 'Student Dashboard | Edmovinn' },
    { name: 'description', content: 'Your Edmovinn student accommodation overview, recent booking and deposit-to-check-in progress.' },
    { property: 'og:title', content: 'Student Dashboard | Edmovinn' },
    { property: 'og:description', content: 'Your private student accommodation booking overview.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: DashboardPage,
  pendingComponent: () => <StudentPortalShell><PortalLoading /></StudentPortalShell>,
  errorComponent: () => <StudentPortalShell><PortalError /></StudentPortalShell>,
  notFoundComponent: () => <StudentPortalShell><PortalError /></StudentPortalShell>,
});
function DashboardPage() {
  const { studentId } = Route.useRouteContext();
  return <StudentPortalShell><StudentDashboard studentId={studentId} /></StudentPortalShell>;
}