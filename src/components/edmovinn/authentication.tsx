import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, ArrowRight, X, LockKeyhole, ChevronDown } from 'lucide-react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { loginFields, normalizePhone, signupFields, useAuthUI, validateRoomIntent, type AuthMode, type RoomIntent } from '@/lib/auth-ui';
import { detailPreview, getResidence } from '@/lib/residences';
import { WHATSAPP_URL } from '@/lib/contact';
import logo from '@/assets/edmovinn-logo.png.asset.json';
import { WhatsAppIcon } from './favorite-button';

function SelectedRoom({ intent }: { intent: RoomIntent }) {
  const { t, language } = useLanguage();
  const validated = validateRoomIntent(intent);
  const source = validated ? getResidence(validated.residenceSlug) : null;
  const room = source ? detailPreview(source).rooms.find(item => item.id === validated?.roomId) : null;
  if (!source || !room) return null;
  const money = (amount: number) => new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: source.currency, maximumFractionDigits: 0 }).format(amount);
  return <div className="auth-selected-room" data-room-id={room.id}><img src={room.image} alt={t(room.suppliedPhoto ? 'details.suppliedRoomPhoto' : 'details.photoPlaceholder')} /><div><span>{source.nameKey ? t(source.nameKey) : source.name}</span><strong>{room.nameKey ? t(room.nameKey) : t(`search.${room.type}`)}</strong><p>{money(room.price)} {t('details.month')} · {t('details.deposit')} {room.deposit !== undefined ? money(room.deposit) : t('details.notProvided')}</p></div></div>;
}
function PasswordField({ id, label, value, setValue, error, confirm = false, newPassword = false }: { id: string; label: string; value: string; setValue: (value: string) => void; error?: string; confirm?: boolean; newPassword?: boolean }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  return <div className="auth-field"><label htmlFor={id}>{label}</label><div className="auth-password"><input id={id} type={visible ? 'text' : 'password'} value={value} onChange={event => setValue(event.target.value)} autoComplete={confirm || newPassword ? 'new-password' : 'current-password'} maxLength={128} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /><Button type="button" variant="ghost" size="icon" onClick={() => setVisible(!visible)} aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')} title={t(visible ? 'auth.hidePassword' : 'auth.showPassword')} aria-pressed={visible}>{visible ? <EyeOff /> : <Eye />}</Button></div>{error && <p className="auth-field-error" id={`${id}-error`}>{error}</p>}</div>;
}
export function AuthForm({ initialMode, intent = null }: { initialMode: AuthMode; intent?: RoomIntent | null }) {
  const { t, language, setLanguage } = useLanguage();
  const id = useId();
  const [mode, setMode] = useState<AuthMode | 'forgot'>(initialMode);
  const [country, setCountry] = useState<CountryCode>('TR');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState(false);
  const countryNames = new Intl.DisplayNames([language], { type: 'region' });
  const countries = getCountries().sort((a, b) => (countryNames.of(a) ?? a).localeCompare(countryNames.of(b) ?? b, language));
  function switchMode(next: typeof mode) { setMode(next); setErrors({}); setNotice(false); setPassword(''); setConfirmPassword(''); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizePhone(phone, country);
    const parsed = mode === 'signup' ? signupFields.safeParse({ fullName, phone: normalized ?? '', password, confirmPassword }) : loginFields.safeParse({ phone: normalized ?? '', password });
    const next: Record<string, string> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) { const key = issue.path[0]; if (typeof key === 'string' && !next[key]) next[key] = t(`auth.${issue.message}`); }
    setErrors(next);
    // UI-only by owner request: no credentials are stored or sent, and no successful session is simulated.
    setNotice(parsed.success);
  }
  return <div className="auth-content"><div className="auth-brand-row"><img className="auth-logo" src={logo.url} alt="edmovinn" /><label className="auth-language"><span className="sr-only">{t('common.language')}</span><select aria-label={t('common.language')} value={language} onChange={event => setLanguage(event.target.value === 'tr' ? 'tr' : 'en')}><option value="en">EN</option><option value="tr">TR</option></select><ChevronDown size={14} /></label></div>
    <div className="auth-heading"><h1>{t(mode === 'signup' ? 'auth.signupTitle' : mode === 'forgot' ? 'auth.forgotTitle' : 'auth.loginTitle')}</h1><p>{t(mode === 'signup' ? 'auth.signupSubtitle' : mode === 'forgot' ? 'auth.forgotSubtitle' : 'auth.loginSubtitle')}</p></div>
    {intent && <SelectedRoom intent={intent} />}
    {mode === 'forgot' ? <div className="auth-recovery"><LockKeyhole size={28} /><p>{t('auth.recoveryUnavailable')}</p><Button variant="brandOutline" onClick={() => switchMode('login')}>{t('auth.backToLogin')}</Button></div> : <form onSubmit={submit} noValidate>
      {mode === 'signup' && <div className="auth-field"><label htmlFor={`${id}-name`}>{t('auth.fullName')}</label><input id={`${id}-name`} value={fullName} onChange={event => { setFullName(event.target.value); setNotice(false); }} autoComplete="name" maxLength={100} placeholder={t('auth.namePlaceholder')} aria-invalid={Boolean(errors['fullName'])} aria-describedby={errors['fullName'] ? `${id}-name-error` : undefined} />{errors['fullName'] && <p className="auth-field-error" id={`${id}-name-error`}>{errors['fullName']}</p>}</div>}
      <div className="auth-field"><label htmlFor={`${id}-phone`}>{t('auth.phone')}</label><div className="auth-phone"><select aria-label={t('auth.countryCode')} value={country} onChange={event => { setCountry(event.target.value as CountryCode); setNotice(false); }}>{countries.map(code => <option key={code} value={code}>{countryNames.of(code)} (+{getCountryCallingCode(code)})</option>)}</select><input id={`${id}-phone`} type="tel" inputMode="tel" autoComplete="tel-national" maxLength={24} value={phone} placeholder="5XX XXX XX XX" onChange={event => { setPhone(event.target.value); setNotice(false); }} aria-invalid={Boolean(errors['phone'])} aria-describedby={errors['phone'] ? `${id}-phone-error` : undefined} /></div>{errors['phone'] && <p className="auth-field-error" id={`${id}-phone-error`}>{errors['phone']}</p>}</div>
      <PasswordField id={`${id}-password`} label={t('auth.password')} newPassword={mode === 'signup'} value={password} setValue={value => { setPassword(value); setNotice(false); }} {...(errors['password'] ? { error: errors['password'] } : {})} />
      {mode === 'signup' ? <><p className="auth-password-hint">{t('auth.passwordHint')}</p><PasswordField id={`${id}-confirm`} label={t('auth.confirmPassword')} value={confirmPassword} setValue={value => { setConfirmPassword(value); setNotice(false); }} confirm {...(errors['confirmPassword'] ? { error: errors['confirmPassword'] } : {})} /></> : <Button type="button" variant="link" className="auth-forgot" onClick={() => switchMode('forgot')}>{t('auth.forgotPassword')}</Button>}
      {notice && <p className="auth-notice" role="status">{t('auth.notConnected')}</p>}
      <Button type="submit" className="auth-submit">{t(mode === 'signup' ? 'auth.createAccount' : 'auth.login')}<ArrowRight size={18} /></Button>
      <p className="auth-switch">{t(mode === 'signup' ? 'auth.hasAccount' : 'auth.noAccount')} <Button type="button" variant="link" onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}>{t(mode === 'signup' ? 'auth.login' : 'auth.signup')}</Button></p>
    </form>}
    <div className="auth-support"><Button variant="link" asChild><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{t('auth.support')}</a></Button></div>
  </div>;
}
export function AuthenticationModal() {
  const { request, closeAuth } = useAuthUI();
  const { t } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (request) dialog.current?.showModal(); else dialog.current?.close(); }, [request]);
  return <dialog ref={dialog} className="auth-modal" aria-label={t('auth.account')} onClose={closeAuth} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}><Button className="auth-close" variant="ghost" size="icon" onClick={() => dialog.current?.close()} aria-label={t('common.close')}><X /></Button>{request && <AuthForm key={`${request.intent?.roomId ?? 'account'}-${request.mode}`} initialMode={request.mode} intent={request.intent} />}</dialog>;
}
