import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, BedDouble, Check, Circle, Clock3, LayoutDashboard, LogOut, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider, useLanguage } from '@/lib/localization';
import { WHATSAPP_URL } from '@/lib/contact';
import { getResidence } from '@/lib/residences';
import { bookingProgress, filterStudentBookings, portalOverview, type BookingFilter, type PortalBooking } from '@/lib/student-portal';
import { studentPortalQuery } from '@/lib/student-portal-query';
import { Header, Footer } from './homepage';
import { WhatsAppIcon } from './favorite-button';
import { HousingLabel } from './housing-label';

function SupportLink() {
  const { t } = useLanguage();
  return <Button variant="brandOutline" asChild><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{t('portal.support')}</a></Button>;
}
function PortalNavigation() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function signOut() {
    setBusy(true); setError(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    const result = await supabase.auth.signOut();
    if (result.error) { setBusy(false); setError(true); return; }
    await navigate({ to: '/auth', search: { mode: 'login' }, replace: true });
  }
  return <div className="portal-nav-band"><div className="page-container portal-nav"><nav aria-label={t('portal.navigation')}>
    <Button variant="ghost" asChild><Link to="/dashboard" activeOptions={{ exact: true }}><LayoutDashboard />{t('portal.dashboard')}</Link></Button>
    <Button variant="ghost" asChild><Link to="/my-bookings" search={{ filter: 'all' }}><BedDouble />{t('booking.myBookings')}</Link></Button>
  </nav><Button variant="ghost" onClick={() => void signOut()} disabled={busy}><LogOut />{t('portal.signOut')}</Button></div>{error && <p role="alert" className="page-container booking-error">{t('common.error')}</p>}</div>;
}
export function StudentPortalShell({ children }: { children: ReactNode }) {
  return <LanguageProvider><Header studentPortal /><PortalNavigation />{children}<Footer /></LanguageProvider>;
}
function PortalHeading({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useLanguage();
  return <div className="portal-heading"><div><p className="booking-eyebrow">{t('portal.studentPortal')}</p><h1>{title}</h1><p>{subtitle}</p></div><SupportLink /></div>;
}
export function PortalLoading() {
  const { t } = useLanguage();
  return <main className="page-container portal-page"><p role="status">{t('common.loading')}</p><div className="portal-skeleton" aria-hidden="true" /><div className="portal-skeleton" aria-hidden="true" /></main>;
}
export function PortalError() {
  const { t } = useLanguage(); const router = useRouter();
  return <main className="page-container portal-page portal-empty"><ShieldCheck size={36} /><h1>{t('portal.loadError')}</h1><p role="alert">{t('common.error')}</p><Button onClick={() => void router.invalidate()}><RefreshCw />{t('portal.retry')}</Button></main>;
}
export function PortalEmpty({ filtered = false }: { filtered?: boolean }) {
  const { t } = useLanguage();
  return <div className="portal-empty"><BedDouble size={42} strokeWidth={1.5} /><h2>{t(filtered ? 'portal.noMatches' : 'portal.noBookings')}</h2><p>{t(filtered ? 'portal.filterEmpty' : 'portal.emptyText')}</p><Button asChild>{filtered ? <Link to="/my-bookings" search={{ filter: 'all' }}>{t('portal.viewAll')}</Link> : <Link to="/accommodations">{t('portal.explore')}<ArrowRight /></Link>}</Button></div>;
}
function statusText(t: (key: string) => string, group: string, value: string) {
  const key = `booking.${group}.${value}`; const text = t(key);
  return text === key ? value.replaceAll('_', ' ') : text;
}
function BookingCard({ booking, progress = false }: { booking: PortalBooking; progress?: boolean }) {
  const { t } = useLanguage();
  const residence = getResidence(booking.residence_slug);
  const room = residence?.rooms.find(r => r.id === booking.room_id);
  const name = residence?.nameKey ? t(residence.nameKey) : residence?.name ?? booking.residence_slug;
  const roomName = room?.nameKey ? t(room.nameKey) : room ? t(`search.${room.type}`) : booking.room_id;
  const image = residence?.photos[0] ?? room?.image;
  const received = booking.payment_status === 'received';
  const done = bookingProgress(booking);
  return <article className="portal-booking-card">
    <div className="portal-booking-content">{image ? <img src={image} alt={name} className="portal-booking-image" /> : <div className="portal-booking-image portal-image-fallback"><BedDouble size={36} /></div>}
      <div className="portal-booking-info"><div className="portal-card-top"><p className="portal-reference">{t('booking.reference')} · {booking.reference}</p><span className={`portal-status ${booking.status === 'cancelled' ? 'is-cancelled' : ''}`}>{statusText(t, 'statuses', booking.status)}</span></div>
        <h3>{name}</h3><p className="portal-room"><BedDouble size={16} />{roomName}</p>{residence && <HousingLabel genderKey={residence.genderKey} />}
        <div className="portal-card-bottom"><p className="portal-deposit"><Wallet size={17} /><span>{t('booking.paymentStatus')}<strong>{statusText(t, 'payments', booking.payment_status)}</strong></span></p><Button variant="brandOutline" asChild><Link to="/my-bookings/$bookingId" params={{ bookingId: booking.id }}>{t('portal.viewDetails')}<ArrowRight /></Link></Button></div>
      </div>
    </div>
    {progress && <div className="portal-progress-section"><h4>{t('portal.progress')}</h4><ol className="portal-progress">{['depositReceived', 'roomConfirmation', 'contract', 'checkIn'].map((key, i) => <li key={key} className={done[i] ? 'is-complete' : ''}><span className="portal-step-icon">{done[i] ? <Check size={16} /> : <Circle size={15} />}</span><span>{t(`portal.${key}`)}<small>{t(done[i] ? 'portal.complete' : 'portal.notComplete')}</small></span></li>)}</ol>{received && booking.status === 'pending_confirmation' && <p className="portal-confirmation-note"><Clock3 size={15} />{t('portal.pendingNote')}</p>}</div>}
  </article>;
}
export function StudentDashboard({ studentId }: { studentId: string }) {
  const { t } = useLanguage();
  const { data } = useSuspenseQuery(studentPortalQuery(studentId));
  const overview = portalOverview(data.bookings);
  const welcome = data.name.trim() ? t('portal.welcomeName').replace('{name}', data.name.trim()) : t('portal.welcome');
  return <main className="page-container portal-page"><PortalHeading title={welcome} subtitle={t('portal.overviewSubtitle')} />
    <div className="portal-overview"><Link to="/my-bookings" search={{ filter: 'all' }} className="portal-stat"><div><p>{t('booking.myBookings')}</p><strong>{overview.total}</strong></div><BedDouble size={27} /></Link><Link to="/my-bookings" search={{ filter: 'pending' }} className="portal-stat portal-stat-pending"><div><p>{t('booking.statuses.pending_confirmation')}</p><strong>{overview.pending}</strong></div><Clock3 size={27} /></Link></div>
    <section className="portal-recent"><div className="portal-section-heading"><h2>{t('portal.recent')}</h2><Button variant="link" asChild><Link to="/my-bookings" search={{ filter: 'all' }}>{t('portal.viewAll')}<ArrowRight /></Link></Button></div>{overview.recent ? <BookingCard booking={overview.recent} progress /> : <PortalEmpty />}</section>
  </main>;
}
export function StudentBookings({ studentId, filter }: { studentId: string; filter: BookingFilter }) {
  const { t } = useLanguage(); const { data } = useSuspenseQuery(studentPortalQuery(studentId));
  const bookings = filterStudentBookings(data.bookings, filter);
  return <main className="page-container portal-page"><PortalHeading title={t('booking.myBookings')} subtitle={t('portal.bookingsSubtitle')} />
    <nav className="portal-filter-tabs" aria-label={t('portal.filterBookings')}>{(['all', 'pending', 'confirmed'] as const).map(key => <Button key={key} variant="ghost" asChild><Link to="/my-bookings" search={{ filter: key }} aria-current={filter === key ? 'page' : undefined} className={filter === key ? 'is-active' : ''}>{t(`portal.${key}`)}<span>{filterStudentBookings(data.bookings, key).length}</span></Link></Button>)}</nav>
    {!data.bookings.length ? <PortalEmpty /> : !bookings.length ? <PortalEmpty filtered /> : <div className="portal-booking-list">{bookings.map(b => <BookingCard key={b.id} booking={b} />)}</div>}
  </main>;
}
export function BookingDetailsDestination({ studentId, bookingId }: { studentId: string; bookingId: string }) {
  const { t } = useLanguage(); const { data } = useSuspenseQuery(studentPortalQuery(studentId));
  const booking = data.bookings.find(b => b.id === bookingId);
  // Navigation destination only; the full Booking Details page is intentionally deferred.
  return <main className="page-container portal-page"><PortalHeading title={t('portal.viewDetails')} subtitle={booking ? booking.reference : t('portal.bookingNotFound')} /><div className="portal-empty"><p>{t(booking ? 'portal.detailsLater' : 'portal.bookingNotFoundText')}</p><Button asChild><Link to="/my-bookings" search={{ filter: 'all' }}>{t('portal.viewAll')}</Link></Button></div></main>;
}