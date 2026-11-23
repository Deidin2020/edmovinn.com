import { useEffect,useRef,useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { WHATSAPP_URL } from '@/lib/contact';
import { WhatsAppIcon } from '../favorite-button';
// Provider must verify the code and update the registered phone server-side before resolving.
export type WhatsAppVerificationAdapter = {send:()=>Promise<void>;verify:(code:string)=>Promise<boolean>;correctPhone:(phone:string)=>Promise<void>};
export function PhoneVerification({open,phone,onClose,onVerified,adapter}: {open:boolean;phone:string;onClose:()=>void;onVerified:()=>void;adapter?:WhatsAppVerificationAdapter}) {
 const {t}=useLanguage();const dialog=useRef<HTMLDialogElement>(null);const [code,setCode]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [correct,setCorrect]=useState(false);const [newPhone,setNewPhone]=useState(phone);const [sent,setSent]=useState(false);const [resendAt,setResendAt]=useState(0);const [now,setNow]=useState(0);
 useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
 useEffect(()=>{if(!open)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[open]);
 async function action(kind:'send'|'verify'|'correct') {
  if(!adapter){setMessage(t('booking.otpUnavailable'));return;}
  setBusy(true);setMessage('');
  try {if(kind==='send'){await adapter.send();setSent(true);setResendAt(Date.now()+60000);setNow(Date.now());}else if(kind==='correct'){await adapter.correctPhone(newPhone);setCorrect(false);setSent(false);setCode('');}else {if(await adapter.verify(code)){onVerified();onClose();}else setMessage(t('booking.otpInvalid'));}}catch{setMessage(t('common.error'));}finally{setBusy(false);}
 }
 return <dialog className="booking-otp" ref={dialog} aria-label={t('booking.verifyPhone')} onClose={onClose}><div className="booking-row"><h2>{t('booking.verifyPhone')}</h2><Button variant="ghost" size="icon" aria-label={t('common.close')} onClick={()=>dialog.current?.close()}><X /></Button></div><ShieldCheck className="text-primary" size={30}/><p>{t('booking.verifyText')}</p><strong>{phone}</strong><p role="status">{adapter?message:t('booking.otpUnavailable')}</p>{correct?<><label className="booking-field">{t('booking.correctPhone')}<input type="tel" maxLength={30} value={newPhone} onChange={e=>setNewPhone(e.target.value)}/></label><Button disabled={busy || !adapter} onClick={()=>void action('correct')}>{t('booking.savePhone')}</Button><p>{t('booking.phoneTrusted')}</p></>:<><label className="booking-field">{t('booking.otpCode')}<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label><div className="booking-actions"><Button variant="outline" disabled={busy || !adapter || now<resendAt} onClick={()=>void action('send')}>{t(sent?'booking.resend':'booking.sendCode')}{now<resendAt?` (${Math.ceil((resendAt-now)/1000)})`:''}</Button><Button disabled={busy || !adapter || !sent || code.length!==6} onClick={()=>void action('verify')}>{t(busy?'common.loading':'booking.verify')}</Button></div>{message && adapter && <p role="alert">{message}</p>}<Button variant="link" onClick={()=>setCorrect(true)}>{t('booking.correctPhone')}</Button></>}<Button variant="brandOutline" asChild><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><WhatsAppIcon/>{t('auth.support')}</a></Button></dialog>;
}
