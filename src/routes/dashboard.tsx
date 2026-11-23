import { createFileRoute } from '@tanstack/react-router';
import { LanguageProvider } from '@/lib/localization';
import { Header,Footer } from '@/components/edmovinn/homepage';
import { MyBookings } from '@/components/edmovinn/booking/my-bookings';
export const Route=createFileRoute('/dashboard')({
 head:()=>({meta:[{title:'My Student Bookings | Edmovinn'},{name:'description',content:'Track your Edmovinn room booking, deposit payment, contract, residence updates, check-in and refund status.'},{property:'og:title',content:'My Student Bookings | Edmovinn'},{property:'og:description',content:'Your student accommodation booking and payment progress.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'},{name:'robots',content:'noindex, nofollow'}]}),
 component:()=> <LanguageProvider><Header/><MyBookings/><Footer/></LanguageProvider>,
});
