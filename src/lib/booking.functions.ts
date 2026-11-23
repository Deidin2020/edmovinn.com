import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bookingIntentSchema, quoteSchema, realBookingRoom, submitBookingSchema } from './booking';
export const getBookingContext = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((raw:unknown) => bookingIntentSchema.parse(raw)).handler(async ({data,context}) => {
 const source = realBookingRoom(data);
 const [profile,quotes] = await Promise.all([
  context.supabase.from('profiles').select('full_name,phone,phone_verified').eq('id',context.userId).maybeSingle(),
  source ? context.supabase.from('booking_quotes').select('*').eq('residence_slug',data.residenceSlug).eq('room_id',data.roomId).eq('active',true) : Promise.resolve({data:[],error:null}),
 ]);
 if(profile.error || quotes.error) throw new Error('Unable to load booking');
 return {profile:profile.data,quotes:(quotes.data ?? []).flatMap(q => {const parsed=quoteSchema.safeParse(q); return parsed.success?[parsed.data]:[]}),paymentReady:false,whatsappReady:false};
});
export const submitBooking = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((raw:unknown) => submitBookingSchema.parse(raw)).handler(async ({data,context}) => {
 const {data:quote,error} = await context.supabase.from('booking_quotes').select('*').eq('id',data.quoteId).eq('active',true).single();
 if(error || !quote || !quoteSchema.safeParse(quote).success || !realBookingRoom({residenceSlug:quote.residence_slug,roomId:quote.room_id})) throw new Error('Quote unavailable');
 const {data:id,error:saveError} = await context.supabase.rpc('submit_student_booking',{p_quote_id:data.quoteId,p_student_info:data.student,p_terms_version:data.termsVersion});
 if(saveError) throw new Error('Unable to save booking');
 return {id,paymentReady:false};
});
export const getMyBookings = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const {data,error} = await context.supabase.from('bookings').select('*').eq('student_id',context.userId).order('created_at',{ascending:false});
 if(error) throw new Error('Unable to load bookings'); return data ?? [];
});
