import { HousingLabel } from './housing-label';
import { FavoriteButton } from './favorite-button';
import { BedDouble, Heart, MapPin, LayoutGrid, Wifi, UsersRound } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { moveinn, startingPrice, getResidence } from '@/lib/residences';
import twin from '@/assets/student-room-1.webp.asset.json';
import single from '@/assets/student-room-2.webp.asset.json';
import studio from '@/assets/student-room-3.webp.asset.json';
import shared from '@/assets/student-room-4.webp.asset.json';

const examples = [
  { id: 'twin', image: twin.url, rooms: ['single', 'double'], price: 420 },
  { id: 'single', image: single.url, rooms: ['single'], price: 520 },
  { id: 'studio', image: studio.url, rooms: ['studio', 'single'], price: 620 },
  { id: 'shared', image: shared.url, rooms: ['double', 'triple'], price: 300 },
];
export function DemoAccommodations() {
  const { t, money } = useLanguage();
  return <><p className="demo-notice">{t('featured.demoNotice')}</p><div className="accommodation-grid"><article className="accommodation-card"><div className="accommodation-image"><img src={moveinn.photos[0]} alt={t('details.photoPlaceholder')} loading="lazy" /><div className="card-gender"><HousingLabel genderKey={moveinn.genderKey} /></div><FavoriteButton item={{ kind: 'residence', residenceSlug: 'moveinn' }} /></div><div className="accommodation-content"><h3>Moveinn</h3><p className="accommodation-location"><MapPin size={13} />{t(moveinn.locationKey)}</p><p className="accommodation-price">{t('featured.from')} <strong>{money(startingPrice(moveinn), moveinn.currency)}</strong> <span>{t('featured.perMonth')}</span></p><div className="accommodation-facilities"><span><BedDouble size={14} />{t('search.quadruple')}</span><span><LayoutGrid size={14} />{t('details.servicesCount')}</span></div><Button variant="brandOutline" className="details-button" asChild><Link to="/accommodations/$slug" params={{ slug: 'moveinn' }}>{t('featured.viewDetails')}</Link></Button></div></article>{examples.map(example => <article key={example.id} className="accommodation-card"><div className="accommodation-image"><img src={example.image} alt={t(`featured.demoNames.${example.id}`)} loading="lazy" /><span className="demo-badge">{t('featured.demo')}</span><div className="card-gender"><HousingLabel genderKey={getResidence(`demo-${example.id}`)?.genderKey ?? 'search.male'} /></div><FavoriteButton item={{ kind: 'residence', residenceSlug: `demo-${example.id}` }} /></div><div className="accommodation-content"><h3>{t(`featured.demoNames.${example.id}`)}</h3><p className="accommodation-location"><MapPin size={13} />{t('search.cities.istanbul')} · {t('search.districtUnspecified')}</p><p className="accommodation-price">{t('featured.from')} <strong>{money(example.price)}</strong> <span>{t('featured.perMonth')}</span></p><div className="accommodation-facilities"><span><BedDouble size={14} />{t('featured.roomTypes')}: {example.rooms.map(room => t(`search.${room}`)).join(' · ')}</span><span><Wifi size={14} />{t('featured.wifi')}</span></div><Button variant="brandOutline" className="details-button" asChild><Link to="/accommodations/$slug" params={{ slug: `demo-${example.id}` }}>{t('featured.viewDetails')}</Link></Button></div></article>)}</div></>;
}