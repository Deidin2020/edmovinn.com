import { useRef, useState } from 'react';
import { BedDouble, Heart, MapPin, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
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
  const { t } = useLanguage();
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<(typeof examples)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  function showDetails(example: (typeof examples)[number]) { setSelected(example); dialog.current?.showModal(); }
  return <><p className="demo-notice">{t('featured.demoNotice')}</p><div className="accommodation-grid">{examples.map(example => <article key={example.id} className="accommodation-card"><div className="accommodation-image"><img src={example.image} alt={t(`featured.demoNames.${example.id}`)} loading="lazy" /><span className="demo-badge">{t('featured.demo')}</span><Button variant="ghost" size="icon" className="favorite-button" aria-label={t(saved.includes(example.id) ? 'featured.removeSaved' : 'featured.save')} aria-pressed={saved.includes(example.id)} onClick={() => setSaved(old => old.includes(example.id) ? old.filter(id => id !== example.id) : [...old, example.id])}><Heart fill={saved.includes(example.id) ? 'currentColor' : 'none'} /></Button></div><div className="accommodation-content"><h3>{t(`featured.demoNames.${example.id}`)}</h3><p className="accommodation-location"><MapPin size={13} />{t('search.cities.istanbul')}</p><p className="accommodation-price">{t('featured.from')} <strong>${example.price}</strong> <span>{t('featured.perMonth')}</span></p><div className="accommodation-facilities"><span><BedDouble size={14} />{t('featured.roomTypes')}: {example.rooms.map(room => t(`search.${room}`)).join(' · ')}</span><span><Wifi size={14} />{t('featured.wifi')}</span></div><Button variant="brandOutline" className="details-button" onClick={() => showDetails(example)}>{t('featured.viewDetails')}</Button></div></article>)}</div><dialog ref={dialog} className="demo-dialog" aria-labelledby="demo-dialog-title"><div className="demo-dialog-heading"><h3 id="demo-dialog-title">{selected ? t(`featured.demoNames.${selected.id}`) : t('featured.demo')}</h3><Button variant="ghost" size="icon" aria-label={t('common.close')} onClick={() => dialog.current?.close()}><X /></Button></div>{selected && <img src={selected.image} alt={t(`featured.demoNames.${selected.id}`)} />}<p>{t('featured.demoDetails')}</p><Button onClick={() => dialog.current?.close()}>{t('common.close')}</Button></dialog></>;
}