import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { getResidence } from './residences';
export const TERMS_VERSION = '2026-11-23-v1';
export const bookingIntentSchema = z.object({ residenceSlug: z.string().min(1).max(100), roomId: z.string().min(1).max(100) });
export const studentSchema = z.object({
 fullName: z.string().trim().min(2).max(100), birthDate: z.string().date().refine(v => v < new Date().toISOString().slice(0,10)),
 citizenship: z.enum(['turkish','international']), turkishId: z.string().trim().max(11), nationality: z.string().trim().max(100), identity: z.string().trim().max(50),
 phone: z.string().max(30).refine(v => parsePhoneNumberFromString(v)?.isValid() === true),
 email: z.union([z.literal(''), z.string().trim().email().max(255)]), university: z.string().trim().min(2).max(200),
 enrollment: z.enum(['enrolled','accepted','pending']), requests: z.string().trim().max(1000),
}).superRefine((v, ctx) => {
 if (v.citizenship === 'turkish' && !/^[1-9]\d{10}$/.test(v.turkishId)) ctx.addIssue({code:'custom',path:['turkishId'],message:'invalid'});
 if (v.citizenship === 'international') {
  if (v.nationality.length < 2) ctx.addIssue({code:'custom',path:['nationality'],message:'invalid'});
  if (!/^[\p{L}\p{N} -]{4,50}$/u.test(v.identity)) ctx.addIssue({code:'custom',path:['identity'],message:'invalid'});
 }
});
export type StudentInfo = z.infer<typeof studentSchema>;
export const initialStudent: StudentInfo = {fullName:'',birthDate:'',citizenship:'international',turkishId:'',nationality:'',identity:'',phone:'',email:'',university:'',enrollment:'enrolled',requests:''};
export const quoteSchema = z.object({id:z.string().uuid(),residence_slug:z.string(),room_id:z.string(),move_in:z.string().date(),contract_end:z.string().date(),payment_plan:z.enum(['monthly','annual']),currency:z.enum(['USD','TRY']),total_rent:z.coerce.number().positive(),deposit:z.coerce.number().positive(),active:z.boolean()}).refine(v => v.active && v.deposit <= v.total_rent && v.contract_end.slice(5,7) === '06' && v.move_in < v.contract_end);
export type BookingQuote = z.infer<typeof quoteSchema>;
export function quoteTotals(quote: BookingQuote) { const valid = quoteSchema.parse(quote); return {total: valid.total_rent, deposit: valid.deposit, remaining: Math.round((valid.total_rent - valid.deposit)*100)/100}; }
export function realBookingRoom(intent: z.infer<typeof bookingIntentSchema>) { const residence = getResidence(intent.residenceSlug); const room = residence?.rooms.find(r => r.id === intent.roomId && r.availability !== 'unavailable'); return residence && !residence.isMock && room ? {residence,room} : null; }
export function canPayDeposit({authenticated, agreed, paymentReady, quoteReady}: {authenticated:boolean;agreed:boolean;paymentReady:boolean;quoteReady:boolean}) { return authenticated && agreed && paymentReady && quoteReady; }
export function termsReachedBottom(scrollTop:number,clientHeight:number,scrollHeight:number) { return scrollHeight > 0 && scrollTop + clientHeight >= scrollHeight - 2; }
export const submitBookingSchema = z.object({quoteId:z.string().uuid(),student:studentSchema,termsVersion:z.literal(TERMS_VERSION),agreed:z.literal(true)});
