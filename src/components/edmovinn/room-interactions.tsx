import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BedDouble, CalendarDays, Check, MapPin, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { prepareRoomSelection, type Residence, type Room } from '@/lib/residences';
import { WHATSAPP_URL } from '@/lib/contact';
import { HousingLabel } from './housing-label';
import { WhatsAppIcon } from './favorite-button';
import { useAuthUI } from '@/lib/auth-ui';

// Only room-owned images are eligible; never borrow residence or other room photos.
export function roomPhotos(room: Room & { photos?: readonly string[] }): readonly string[] {
  return room.photos?.length ? room.photos : [room.image];
}

export function RoomPhotoGallery({ photos, title }: { photos: readonly string[]; title: string }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const multiple = photos.length > 1;
  function move(direction: number) {
    if (multiple) setActive(old => (old + direction + photos.length) % photos.length);
  }
  return <div className="room-photo-browser" onKeyDown={event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  }} onTouchStart={event => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }} onTouchEnd={event => {
    const end = event.changedTouches[0];
    const start = touchStart.current;
    if (start && end && Math.abs(end.clientX - start.x) > 40 && Math.abs(end.clientX - start.x) > Math.abs(end.clientY - start.y)) move(end.clientX < start.x ? 1 : -1);
    touchStart.current = null;
  }} onTouchCancel={() => { touchStart.current = null; }}>
    <img src={photos[active] ?? photos[0]} alt={title} loading="lazy" />
    <Button className="room-photo-arrow room-photo-previous" variant="outline" size="icon" disabled={!multiple} onClick={() => move(-1)} aria-label={t('details.previous')} title={t('details.previous')}><ArrowLeft /></Button>
    <Button className="room-photo-arrow room-photo-next" variant="outline" size="icon" disabled={!multiple} onClick={() => move(1)} aria-label={t('details.next')} title={t('details.next')}><ArrowRight /></Button>
    <span className="sr-only" aria-live="polite">{active + 1} / {photos.length}</span>
  </div>;
}

export function RoomFacts({ room }: { room: Room }) {
  const { t } = useLanguage();
  return <dl className="room-option-facts">
    <div><dt><MapPin />{t('details.location')}</dt><dd>{t('search.cities.istanbul')}</dd></div>
    <div><dt><Maximize />{t('details.size')}</dt><dd>{room.area !== undefined ? `${room.area.toFixed(2)} m²` : t('details.notProvided')}</dd></div>
    <div><dt><CalendarDays />{t('details.availableFrom')}</dt><dd>{room.availableFrom ?? t('details.notProvided')}</dd></div>
    <div><dt><BedDouble />{t('details.bed')}</dt><dd>{room.bed?.startsWith('details.') ? t(room.bed) : room.bed ?? t('details.notProvided')}</dd></div>
  </dl>;
}

export function RoomDetailsPopup({ room, residence, open, onClose }: { room: Room; residence: Residence; open: boolean; onClose: () => void }) {
  const { t, language } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const title = room.nameKey ? t(room.nameKey) : t(`search.${room.type}`);
  const money = (amount: number) => new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: residence.currency, maximumFractionDigits: 0 }).format(amount);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return <dialog ref={dialog} className="room-details-popup" aria-label={`${t('details.roomDetails')}: ${title}`} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className="room-details-popup-heading"><h2>{title}</h2><Button variant="ghost" size="icon" onClick={() => dialog.current?.close()} aria-label={t('common.close')}><X /></Button></div>
    <div className="room-details-popup-gallery"><RoomPhotoGallery photos={roomPhotos(room)} title={`${title} · ${t(room.suppliedPhoto ? 'details.suppliedRoomPhoto' : 'details.photoPlaceholder')}`} /></div>
    <div className="room-option-body"><HousingLabel genderKey={residence.genderKey} /><RoomFacts room={room} />
      <div className="room-option-terms"><div><span>{t('details.price')}</span><p><strong>{money(room.price)}</strong> <small>{t('details.month')}</small></p></div><div><span>{t('details.deposit')}</span><p>{room.deposit !== undefined ? money(room.deposit) : t('details.notProvided')}</p></div><div><span>{t('details.contract')}</span><p>{room.contract ? t('details.monthly') : t('details.notProvided')}</p></div></div>
      <div className="room-option-tags">{room.amenities.map(amenity => <span key={amenity}>{t(`details.${amenity}`)}</span>)}</div>
      <p>{room.occupancy} {t(room.occupancy === 1 ? 'details.person' : 'details.people')} · {t(`details.${room.availability}`)}</p>
      <p className="room-option-note">{t(residence.isMock ? 'details.notice' : 'details.referenceTerms')}</p>
      <p className="room-option-note">{t('details.bookingUnavailable')}</p>
    </div>
  </dialog>;
}

export function RoomBookingSidebar({ residence, selectedId }: { residence: Residence; selectedId: string | null }) {
  const { t, language } = useLanguage();
  const { openAuth } = useAuthUI();
  const selection = selectedId ? prepareRoomSelection(residence, selectedId) : null;
  const room = selection ? residence.rooms.find(item => item.id === selection.roomId) : undefined;
  const title = room ? (room.nameKey ? t(room.nameKey) : t(`search.${room.type}`)) : t('details.selectToContinue');
  const money = (amount: number) => new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: residence.currency, maximumFractionDigits: 0 }).format(amount);
  return <aside className="residence-booking" aria-label={t('details.selection')}>
    {room && <img className="residence-booking-photo" src={room.image} alt={`${title} · ${t(room.suppliedPhoto ? 'details.suppliedRoomPhoto' : 'details.photoPlaceholder')}`} />}
    <h2 aria-live="polite">{title}</h2>
    {room && <><p className="residence-booking-meta"><MapPin size={16} />{t(residence.locationKey)}</p><div className="residence-booking-meta"><HousingLabel genderKey={residence.genderKey} /></div>
      <div className="residence-booking-price"><span>{t(residence.isMock ? 'details.samplePrice' : 'details.monthlyPrice')}</span><p><strong>{money(room.price)}</strong> {t('details.month')}</p><span>{t('details.deposit')}</span><p>{room.deposit !== undefined ? money(room.deposit) : t('details.notProvided')}</p></div>
      <div className="residence-selected-room-facts"><RoomFacts room={room} /></div>
      <div className="residence-selection" role="status"><strong><Check size={16} />{t('details.selection')}: {title}</strong><p>{room.occupancy} {t(room.occupancy === 1 ? 'details.person' : 'details.people')} · {room.contract ? t('details.monthly') : t('details.notProvided')}</p><p>{t('details.selectionReady')}</p></div>
    </>}
    {/* Opens authentication UI only; no booking or payment is created. */}
    <Button variant="search" className="residence-booking-action" disabled={!selection} data-room-id={selection?.roomId} onClick={() => { if (selection) openAuth('signup', { residenceSlug: residence.slug, roomId: selection.roomId }); }}>{t('details.bookNowAction')}</Button>
    <Button variant="brandOutline" className="residence-booking-action" asChild><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{t('details.getInTouch')}</a></Button>
    <p className="residence-booking-disclaimer">{t('details.bookingUnavailable')}</p>
  </aside>;
}