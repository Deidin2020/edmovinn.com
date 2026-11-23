import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/lib/localization';
export function BookingDateField({label,value,onChange,birth=false,allowed=[]}: {label:string;value:string;onChange:(v:string)=>void;birth?:boolean;allowed?:string[]}) {
 const {t,language}=useLanguage(); const [open,setOpen]=useState(false);
 const today=new Date(); today.setHours(0,0,0,0);
 return <div className="booking-field"><span id={birth?'birth-label':'move-label'}>{label}</span><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="outline" className="booking-date-trigger" aria-labelledby={birth?'birth-label':'move-label'}><CalendarDays />{value?format(parseISO(value),'dd MMM yyyy',{locale:language==='tr'?tr:enUS}):t('booking.chooseDate')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar className="pointer-events-auto" mode="single" captionLayout="dropdown" locale={language==='tr'?tr:enUS} {...(value?{selected:parseISO(value)}:{})} defaultMonth={value?parseISO(value):birth?new Date(2004,0,1):today} startMonth={birth?new Date(1900,0,1):today} endMonth={birth?today:new Date(today.getFullYear()+2,11,31)} disabled={date => birth?date>=today:date<today || (allowed.length>0 && !allowed.includes(format(date,'yyyy-MM-dd')))} onSelect={date=>{if(date){onChange(format(date,'yyyy-MM-dd'));setOpen(false);}}} /></PopoverContent></Popover></div>;
}
