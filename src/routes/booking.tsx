import { createFileRoute } from '@tanstack/react-router';
import { LanguageProvider } from '@/lib/localization';
import { Header,Footer } from '@/components/edmovinn/homepage';
import { BookingFlow } from '@/components/edmovinn/booking/booking-flow';
export const Route=createFileRoute('/booking')({
 validateSearch:(raw:Record<string,unknown>)=>({residenceSlug:typeof raw['residenceSlug']==='string'?raw['residenceSlug'].slice(0,100):'',roomId:typeof raw['roomId']==='string'?raw['roomId'].slice(0,100):''}),
 head:()=>({meta:[{title:'Room Booking & Deposit Review | Edmovinn'},{name:'description',content:'Review your selected Edmovinn student room, academic contract, student details and deposit payment terms.'},{property:'og:title',content:'Room Booking & Deposit Review | Edmovinn'},{property:'og:description',content:'Review your room selection and student accommodation booking details.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'},{name:'robots',content:'noindex, nofollow'}]}),
 component:BookingPage,
});
function BookingPage(){const search=Route.useSearch();return <LanguageProvider><Header/><BookingFlow {...search}/><Footer/></LanguageProvider>;}
