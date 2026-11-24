import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getStudentPortal = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, bookings] = await Promise.all([
      context.supabase.from('profiles').select('full_name').eq('id', context.userId).maybeSingle(),
      context.supabase.from('bookings').select('id,residence_slug,room_id,reference,status,payment_status,contract_status,check_in_status,availability_status,created_at')
        .eq('student_id', context.userId).order('created_at', { ascending: false }),
    ]);
    if (profile.error || bookings.error) throw new Error('Unable to load student portal');
    return { studentId: context.userId, name: profile.data?.full_name ?? '', bookings: bookings.data ?? [] };
  });