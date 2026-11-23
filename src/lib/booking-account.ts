import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
// Observe the real account only; the UI-only login never supplies a simulated session.
export function useBookingAccount() {
 return useQuery({queryKey:['booking-account'],queryFn:async () => {const {data,error}=await supabase.auth.getUser(); return error?null:data.user;},staleTime:0,retry:false});
}
