import { useState } from 'react';
import { BedDouble, CalendarDays, Check, MapPin, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { HousingLabel } from './housing-label';
import { FavoriteButton } from './favorite-button';
import type { Residence, Room } from '@/lib/residences';

export function RoomOptionCard({ room, residence, selected, onSelect }: { room: Room; residence: Residence; selected: boolean; onSelect: () => void }) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const money = (amount: number) => new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: residence.currency, maximumFractionDigits: 0 }).format(amount);
  const title = room.nameKey ? t(room.nameKey) : t(`search.${room.type}`);
  return <article className={`room-option-card ${selected ? 'is-selected' : ''}`}>
    <div className="room-option-photo"><img src={room.image} alt={`${title} · ${t(room.suppliedPhoto ? 'details.suppliedRoomPhoto' : 'details.photoPlaceholder')}`} loading="lazy" /><div className="card-gender"><HousingLabel genderKey={residence.genderKey} /></div><FavoriteButton item={{ kind: 'room', residenceSlug: residence.slug, roomId: room.id }} /></div>
    <div className="room-option-body"><span className="room-contract-badge">{room.contract ? t('details.monthly') : t(`details.${room.availability}`)}</span><h3>{title}</h3>
      <dl className="room-option-facts"><div><dt><MapPin />{t('details.location')}</dt><dd>{t('search.cities.istanbul')}</dd></div><div><dt><Maximize />{t('details.size')}</dt><dd>{room.area !== undefined ? `${room.area.toFixed(2)} m²` : t('details.notProvided')}</dd></div><div><dt><CalendarDays />{t('details.availableFrom')}</dt><dd>{room.availableFrom ?? t('details.notProvided')}</dd></div><div><dt><BedDouble />{t('details.bed')}</dt><dd>{room.bed?.startsWith('details.') ? t(room.bed) : room.bed}</dd></div></dl>
      <div className="room-option-terms"><div><span>{t('details.price')}</span><p><strong>{money(room.price)}</strong> <small>{t('details.month')}</small></p></div><div><span>{t('details.deposit')}</span><p>{room.deposit !== undefined ? money(room.deposit) : t('details.notProvided')}</p></div><div><span>{t('details.contract')}</span><p>{room.contract ? t('details.monthly') : t('details.notProvided')}</p></div></div>
      <div className="room-option-tags">{room.amenities.slice(0, 3).map(amenity => <span key={amenity}>{t(`details.${amenity}`)}</span>)}<Button variant="link" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{t('details.more')}</Button></div>
      {expanded && <div className="room-option-extra"><p>{room.occupancy} {t(room.occupancy === 1 ? 'details.person' : 'details.people')} · {t(`details.${room.availability}`)}</p><p>{t(residence.isMock ? 'details.notice' : 'details.referenceTerms')}</p></div>}
      <div className="room-option-actions"><Button variant="brandOutline" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{t('details.seeMore')}</Button><Button variant={selected ? 'default' : 'search'} aria-pressed={selected} disabled={room.availability === 'unavailable'} onClick={onSelect}>{selected && <Check />}{t(selected ? 'details.selected' : 'details.select')}</Button></div>
      <p className="room-option-note">{t('details.bookingUnavailable')}</p>
    </div>
  </article>;
}
