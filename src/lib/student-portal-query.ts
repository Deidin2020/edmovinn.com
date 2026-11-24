import { queryOptions } from '@tanstack/react-query';
import { getStudentPortal } from './student-portal.functions';

export const studentPortalQuery = (studentId: string) => queryOptions({
  queryKey: ['student-portal', studentId],
  queryFn: () => getStudentPortal(),
  staleTime: 0,
  retry: false,
});