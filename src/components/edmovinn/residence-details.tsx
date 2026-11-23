import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, BedDouble, BookOpen, ChevronRight, ConciergeBell, Dumbbell, GraduationCap, Headphones, Home, Images, Info, MapPin, ShieldCheck, Sofa, Sparkles, TrainFront, UsersRound, Utensils, WashingMachine, Wifi, X, Building2, Coffee, Flame, Library, Landmark, Refrigerator, Waves, Bath, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { HousingLabel } from './housing-label';
import { FavoriteButton } from './favorite-button';
import { RoomBookingSidebar } from './room-interactions';
import { detailPreview } from '@/lib/residences';
import { RoomOptionCard } from './room-option-card';
import { prepareRoomSelection, type Facility, type Residence } from '@/lib/residences';
import { readRoomIntent, saveRoomIntent, useAuthUI } from '@/lib/auth-ui';

const facilityIcons: Record<Facility, LucideIcon> = { wifi: Wifi, meals: Utensils, gym: Dumbbell, study: BookOpen, common: Sofa, laundry: WashingMachine, cleaning: Sparkles, security: ShieldCheck, reception: ConciergeBell, elevator: Building2, buffet: Utensils, cafeteria: Coffee, heating: Flame, library: Library, mosque: Landmark, receptionHall: ConciergeBell, refrigerator: Refrigerator, sauna: Waves, turkishBath: Bath };
function PhotoGallery({ residence }: { residence: Residence }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const image = residence.photos[active];
  function move(direction: number) { setActive(old => (old + direction + residence.photos.length) % residence.photos.length); }
  function open(index: number) { setActive(index); dialog.current?.showModal(); }
  const touchStart = useRef<number | null>(null);
  return <div className="residence-gallery-wrap"><div className="residence-gallery">{residence.photos.slice(0, 5).map((photo, index) => <Button key={`${photo}-${index}`} variant="ghost" className="residence-photo" onClick={() => open(index)} aria-label={`${t('details.photos')} ${index + 1}`}><img src={photo} alt={`${t('details.photoPlaceholder')} ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} /></Button>)}</div><span className="residence-photo-label">{t('details.photoPlaceholder')}</span><Button variant="outline" className="residence-gallery-all" onClick={() => open(0)}><Images />{t('details.viewPhotos')} ({residence.photos.length})</Button><dialog ref={dialog} className="residence-lightbox" aria-labelledby="gallery-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} onKeyDown={e => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}><div className="residence-lightbox-inner"><div className="residence-lightbox-heading"><div><h2 id="gallery-title">{t('details.photos')}</h2><p>{t('details.photoPlaceholder')}</p></div><Button variant="ghost" size="icon" aria-label={t('common.close')} onClick={() => dialog.current?.close()}><X /></Button></div><div className="residence-lightbox-image" onTouchStart={e => { touchStart.current = e.touches[0]?.clientX ?? null; }} onTouchEnd={e => { const end = e.changedTouches[0]?.clientX; if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 40) move(end < touchStart.current ? 1 : -1); touchStart.current = null; }}>{image && <img src={image} alt={`${t('details.photoPlaceholder')} ${active + 1}`} />}</div><div className="residence-lightbox-controls"><Button variant="outline" size="icon" aria-label={t('details.previous')} onClick={() => move(-1)}><ArrowLeft /></Button><span aria-live="polite">{active + 1} / {residence.photos.length}</span><Button variant="outline" size="icon" aria-label={t('details.next')} onClick={() => move(1)}><ArrowRight /></Button></div></div></dialog></div>;
}
function ResidenceLocation({ residence }: { residence: Residence }) {
  const { t } = useLanguage();
  const coordinates = residence.coordinates;
  const mapUrl = coordinates ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.01},${coordinates.lat - 0.006},${coordinates.lng + 0.01},${coordinates.lat + 0.006}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}` : null;
  return <section className="residence-section" aria-labelledby="location-heading"><h2 id="location-heading">{t('details.location')}</h2><div className="residence-location-grid">{mapUrl ? <iframe title={t('details.location')} src={mapUrl} loading="lazy" referrerPolicy="no-referrer" /> : <div className="residence-map-pending"><MapPin size={30} /><span>{t('details.mapPending')}</span></div>}<div className="residence-location-info"><p><MapPin />{residence.address ?? 'Basın Ekspres, Istanbul'}</p><h3><GraduationCap />{t('details.universities')}</h3>{residence.universities.length ? <ul>{residence.universities.map(university => <li key={university}>{university}</li>)}</ul> : <p>{t('details.universitiesPending')}</p>}<p><TrainFront />{residence.transport?.startsWith('details.') ? t(residence.transport) : residence.transport}</p></div></div></section>;
}
export function ResidenceDetails({ residence: source }: { residence: Residence }) {
  const residence = detailPreview(source);
  const { t } = useLanguage();
  const name = residence.nameKey ? t(residence.nameKey) : residence.name;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { openAuth } = useAuthUI();
  useEffect(() => {
    const intent = readRoomIntent();
    if (intent?.residenceSlug === residence.slug) setSelectedId(intent.roomId);
  }, [residence.slug]);
  function selectRoom(roomId: string) {
    const next = selectedId === roomId ? null : prepareRoomSelection(residence, roomId)?.roomId ?? null;
    setSelectedId(next);
    const intent = next ? { residenceSlug: residence.slug, roomId: next } : null;
    saveRoomIntent(intent);
    if (intent) openAuth('signup', intent);
  }

  return <main className="residence-page page-container"><nav className="residence-breadcrumb" aria-label={t('details.residences')}><Link to="/"><Home size={14} />{t('header.home')}</Link><ChevronRight size={13} /><Link to="/" hash="accommodations">{t('details.residences')}</Link><ChevronRight size={13} /><span>{name}</span></nav><div className="residence-preview-note"><Info size={17} /><p><strong>{t('details.preview')}</strong> · {t('details.completePreviewNotice')}</p>{residence.slug !== 'moveinn' && <Button variant="link" asChild><Link to="/accommodations/$slug" params={{ slug: 'moveinn' }}>{t('details.exploreMoveinn')}<ArrowRight /></Link></Button>}</div><div className="residence-overview"><div className="residence-overview-copy"><div className="residence-title-row"><h1>{name}</h1><FavoriteButton item={{ kind: 'residence', residenceSlug: residence.slug }} /></div><span className="residence-verification"><ShieldCheck size={16} />{t(residence.verified ? 'details.verified' : 'details.sampleVerified')}</span><p className="residence-address"><MapPin size={16} />{t(residence.locationKey)}</p><div className="residence-primary-gender"><HousingLabel genderKey={residence.genderKey} /></div><p>{t(residence.descriptionKey)}</p><a className="residence-room-jump" href="#residence-rooms"><BedDouble size={17} />{t('details.rooms')}<ChevronRight size={15} /></a></div><PhotoGallery residence={residence} /></div><div className="residence-columns"><div className="residence-main"><section className="residence-section"><h2>{t('details.about')}</h2><p>{t(residence.descriptionKey)}</p></section><section className="residence-section"><div className="residence-section-heading"><h2>{t('details.facilities')}</h2><span>{residence.isMock ? t('details.sampleFacilities') : ''}</span></div><div className="residence-facilities">{residence.facilities.map(f => { const Icon = facilityIcons[f]; return <div key={f}><Icon size={25} strokeWidth={1.7} /><span>{t(`details.${f}`)}</span></div>; })}</div></section><ResidenceLocation residence={residence} /><section className="residence-section residence-rooms" id="residence-rooms" aria-labelledby="rooms-heading"><h2 id="rooms-heading">{t('details.rooms')}</h2><p>{t('details.sampleRoomIntro')}</p><div className="room-option-grid">{residence.rooms.map(room => <RoomOptionCard key={room.id} room={room} residence={residence} selected={selectedId === room.id} onSelect={() => selectRoom(room.id)} />)}</div></section></div><RoomBookingSidebar residence={residence} selectedId={selectedId} /></div><section className="residence-why"><h2>{t('details.why')}</h2><p>{residence.isMock ? t('details.benefitsPending') : ''}</p><div>{[{ key: 'Location', icon: GraduationCap }, { key: 'Safety', icon: ShieldCheck }, { key: 'Experience', icon: UsersRound }].map(({ key, icon: Icon }) => <article className="benefit-card" key={key}><Icon size={29} /><div><h3>{t(`details.benefit${key}`)}</h3><p>{t(key === 'Safety' ? 'details.sampleSafety' : key === 'Location' ? 'details.ownerBenefitLocation' : 'details.ownerBenefitExperience')}</p></div></article>)}</div></section></main>;
}
