import { describe,it,expect } from 'vitest';
import { canPayDeposit,quoteSchema,quoteTotals,realBookingRoom,studentSchema,termsReachedBottom,TERMS_VERSION,submitBookingSchema } from '@/lib/booking';
const quote={id:'00000000-0000-4000-8000-000000000001',residence_slug:'moveinn',room_id:'quadruple-70',move_in:'2026-12-01',contract_end:'2027-06-30',payment_plan:'monthly' as const,currency:'USD' as const,total_rent:2625,deposit:750,active:true};
const student={fullName:'Test Student',birthDate:'2004-02-01',citizenship:'international' as const,turkishId:'',nationality:'Turkish',identity:'P1234567',phone:'+905555555555',email:'',university:'Test University',enrollment:'accepted' as const,requests:''};
describe('Edmovinn booking rules',()=>{
 it('credits the $750 deposit toward rent rather than adding a fee',()=>{expect(quoteTotals(quote)).toEqual({total:2625,deposit:750,remaining:1875});});
 it('allows only residence monthly or annual plans',()=>{expect(quoteSchema.safeParse({...quote,payment_plan:'semester'}).success).toBe(false);});
 it('never treats fictional residence or added sample rooms as bookable inventory',()=>{expect(realBookingRoom({residenceSlug:'demo-twin',roomId:'double'})).toBeNull();expect(realBookingRoom({residenceSlug:'moveinn',roomId:'sample-double'})).toBeNull();expect(realBookingRoom({residenceSlug:'moveinn',roomId:'quadruple-70'})?.room.id).toBe('quadruple-70');});
 it('requires an authenticated student for payment',()=>{expect(canPayDeposit({authenticated:false,agreed:true,paymentReady:true,quoteReady:true})).toBe(false);});
 it('does not require phone verification for payment',()=>{expect(canPayDeposit({authenticated:true,agreed:true,paymentReady:true,quoteReady:true})).toBe(true);});
 it('does not simulate payment without a real provider',()=>{expect(canPayDeposit({authenticated:true,agreed:true,paymentReady:false,quoteReady:true})).toBe(false);});
 it('requires explicit agreement and current terms version',()=>{expect(submitBookingSchema.safeParse({quoteId:quote.id,student,termsVersion:TERMS_VERSION,agreed:false}).success).toBe(false);expect(submitBookingSchema.safeParse({quoteId:quote.id,student,termsVersion:'old',agreed:true}).success).toBe(false);});
 it('unlocks agreement only at the bottom of the visible terms',()=>{expect(termsReachedBottom(0,220,680)).toBe(false);expect(termsReachedBottom(460,220,680)).toBe(true);});
 it('requires Turkish ID for Turkish citizens instead of passport information',()=>{expect(studentSchema.safeParse({...student,citizenship:'turkish',turkishId:''}).success).toBe(false);expect(studentSchema.safeParse({...student,citizenship:'turkish',turkishId:'12345678901',identity:'',nationality:''}).success).toBe(true);});
 it('requires international identity details while email stays optional',()=>{expect(studentSchema.safeParse(student).success).toBe(true);expect(studentSchema.safeParse({...student,identity:''}).success).toBe(false);});
});

