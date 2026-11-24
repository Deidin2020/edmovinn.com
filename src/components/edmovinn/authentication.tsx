import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, ArrowRight, X, ChevronDown } from 'lucide-react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { emailField, loginFields, normalizePhone, readRoomIntent, signupFields, useAuthUI, validateRoomIntent, type AuthMode, type RoomIntent } from '@/lib/auth-ui';
import { detailPreview, getResidence } from '@/lib/residences';
import { WHATSAPP_URL } from '@/lib/contact';
import logo from '@/assets/edmovinn-logo.png.asset.json';
import { WhatsAppIcon } from './favorite-button';
import { Link, useHydrated, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
export function authErrorNotice(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
  if (code === 'weak_password') return 'auth.weakPassword';
  if (code === 'same_password') return 'auth.samePassword';
  if (code === 'user_already_exists') return 'auth.userExists';
  if (code === 'invalid_credentials') return 'auth.invalidLogin';
  if (code === 'email_not_confirmed') return 'auth.emailUnconfirmed';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'auth.rateLimited';
  return 'auth.authError';
}

export function AuthForm({ initialMode, intent = null }: { initialMode: AuthMode; intent?: RoomIntent | null }) {
  const { t, language, setLanguage } = useLanguage();
  const id = useId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { closeAuth } = useAuthUI();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<AuthMode | 'forgot'>(initialMode);
  const [country, setCountry] = useState<CountryCode>('TR');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const hydrated = useHydrated();
  // ICU country names differ between server and browser; initial render uses stable codes.
  const countryNames = hydrated && typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames([language], { type: 'region' }) : null;
  const countries = getCountries().sort((a, b) => countryNames ? (countryNames.of(a) ?? a).localeCompare(countryNames.of(b) ?? b, language) : a < b ? -1 : a > b ? 1 : 0);
  function switchMode(next: typeof mode) { setMode(next); setErrors({}); setNotice(null); setPassword(''); setConfirmPassword(''); }
  async function continueSignedIn() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) { setNotice('auth.authError'); return; }
    await queryClient.invalidateQueries();
    closeAuth();
    const selected = validateRoomIntent(intent) ?? readRoomIntent();
    if (selected) await navigate({ to: '/booking', search: selected });
    else await navigate({ to: '/dashboard' });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const normalized = normalizePhone(phone, country);
    const parsed = mode === 'forgot' ? emailField.safeParse(email) : mode === 'signup'
      ? signupFields.safeParse({ fullName, email, phone: normalized ?? '', password, confirmPassword })
      : loginFields.safeParse({ email, password });
    const next: Record<string, string> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) {
      const key = issue.path[0] ?? 'email';
      if (typeof key === 'string' && !next[key]) next[key] = t(`auth.${issue.message}`);
    }
    setErrors(next); setNotice(null);
    if (!parsed.success) return;
    setBusy(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setNotice('auth.resetSent');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/auth?mode=login`, data: { full_name: fullName.trim(), contact_phone: normalized } } });
        if (error) throw error;
        setPassword(''); setConfirmPassword('');
        if (data.session) await continueSignedIn();
        else setNotice('auth.checkEmail');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword('');
        await continueSignedIn();
      }
    } catch (error) {
      setNotice(authErrorNotice(error));
    } finally { setBusy(false); }
  }
  return <div className="auth-content"><div className="auth-brand-row"><img className="auth-logo" src={logo.url} alt="edmovinn" /><label className="auth-language"><span className="sr-only">{t('common.language')}</span><select aria-label={t('common.language')} value={language} onChange={event => setLanguage(event.target.value === 'tr' ? 'tr' : 'en')}><option value="en">EN</option><option value="tr">TR</option></select><ChevronDown size={14} /></label></div>
    <div className="auth-heading"><h1>{t(mode === 'signup' ? 'auth.signupTitle' : mode === 'forgot' ? 'auth.forgotTitle' : 'auth.loginTitle')}</h1><p>{t(mode === 'signup' ? 'auth.signupSubtitle' : mode === 'forgot' ? 'auth.forgotSubtitle' : 'auth.loginSubtitle')}</p></div>
    {intent && <SelectedRoom intent={intent} />}
    <form onSubmit={event => void submit(event)} noValidate>
      <div className="auth-field"><label htmlFor={`${id}-email`}>{t('auth.email')}</label><input id={`${id}-email`} type="email" autoComplete="email" maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setNotice(null); }} aria-invalid={Boolean(errors['email'])} />{errors['email'] && <p className="auth-field-error">{errors['email']}</p>}</div>
      {mode === 'signup' && <div className="auth-field"><label htmlFor={`${id}-name`}>{t('auth.fullName')}</label><input id={`${id}-name`} value={fullName} onChange={event => { setFullName(event.target.value); setNotice(null); }} autoComplete="name" maxLength={100} placeholder={t('auth.namePlaceholder')} aria-invalid={Boolean(errors['fullName'])} aria-describedby={errors['fullName'] ? `${id}-name-error` : undefined} />{errors['fullName'] && <p className="auth-field-error" id={`${id}-name-error`}>{errors['fullName']}</p>}</div>}
      {mode === 'signup' && <div className="auth-field"><label htmlFor={`${id}-phone`}>{t('auth.phone')}</label><div className="auth-phone"><select aria-label={t('auth.countryCode')} value={country} onChange={event => { setCountry(event.target.value as CountryCode); setNotice(null); }}>{countries.map(code => <option key={code} value={code}>{countryNames?.of(code) ?? code} (+{getCountryCallingCode(code)})</option>)}</select><input id={`${id}-phone`} type="tel" inputMode="tel" autoComplete="tel-national" maxLength={24} value={phone} placeholder="5XX XXX XX XX" onChange={event => { setPhone(event.target.value); setNotice(null); }} aria-invalid={Boolean(errors['phone'])} aria-describedby={errors['phone'] ? `${id}-phone-error` : undefined} /></div>{errors['phone'] && <p className="auth-field-error" id={`${id}-phone-error`}>{errors['phone']}</p>}</div>}
      {mode !== 'forgot' && <PasswordField id={`${id}-password`} label={t('auth.password')} newPassword={mode === 'signup'} value={password} setValue={value => { setPassword(value); setNotice(null); }} {...(errors['password'] ? { error: errors['password'] } : {})} />}
      {mode === 'signup' ? <><p className="auth-password-hint">{t('auth.passwordHint')}</p><PasswordField id={`${id}-confirm`} label={t('auth.confirmPassword')} value={confirmPassword} setValue={value => { setConfirmPassword(value); setNotice(null); }} confirm {...(errors['confirmPassword'] ? { error: errors['confirmPassword'] } : {})} /></> : mode === 'login' && <Button type="button" variant="link" className="auth-forgot" onClick={() => switchMode('forgot')}>{t('auth.forgotPassword')}</Button>}
      {notice && <p className="auth-notice" role="status">{t(notice)}</p>}
      <Button type="submit" disabled={busy} className="auth-submit">{t(busy ? 'auth.busy' : mode === 'forgot' ? 'auth.sendReset' : mode === 'signup' ? 'auth.createAccount' : 'auth.login')}<ArrowRight size={18} /></Button>
      {mode === 'forgot' ? <Button type="button" variant="link" onClick={() => switchMode('login')}>{t('auth.backToLogin')}</Button> : <p className="auth-switch">{t(mode === 'signup' ? 'auth.hasAccount' : 'auth.noAccount')} <Button type="button" variant="link" onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}>{t(mode === 'signup' ? 'auth.login' : 'auth.signup')}</Button></p>}
    </form>
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

export function ResetPasswordForm() {
  const { t } = useLanguage();
  const id = useId();
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get('type') !== 'recovery') return;
    void supabase.auth.getUser().then(({ data, error }) => setValid(!error && Boolean(data.user)));
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid || busy) return;
    if (password.length < 8 || password.length > 128) { setNotice('auth.passwordError'); return; }
    if (password !== confirm) { setNotice('auth.confirmError'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(''); setConfirm(''); setNotice('auth.resetSuccess'); setValid(false);
    } catch (error) { setNotice(authErrorNotice(error)); } finally { setBusy(false); }
  }
  return <div className="auth-content"><div className="auth-heading"><h1>{t('auth.resetTitle')}</h1><p>{t('auth.resetSubtitle')}</p></div>{valid ? <form onSubmit={event => void submit(event)}><PasswordField id={`${id}-password`} label={t('auth.password')} value={password} setValue={setPassword} newPassword /><PasswordField id={`${id}-confirm`} label={t('auth.confirmPassword')} value={confirm} setValue={setConfirm} confirm /><Button type="submit" disabled={busy} className="auth-submit">{t(busy ? 'auth.busy' : 'auth.savePassword')}</Button></form> : <p role="status">{t(notice ?? 'auth.resetInvalid')}</p>}{valid && notice && <p role="alert" className="auth-notice">{t(notice)}</p>}<Button variant="link" asChild><Link to="/auth" search={{ mode: 'login' }}>{t('auth.backToLogin')}</Link></Button></div>;
}
