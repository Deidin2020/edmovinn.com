import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { useFavorite, type FavoriteItem } from '@/lib/favorites';
export function FavoriteButton({ item }: { item: FavoriteItem }) {
 const { t } = useLanguage(); const { saved, toggle } = useFavorite(item);
 return <Button variant="ghost" size="icon" className="favorite-button" aria-label={t(saved ? 'featured.removeSaved' : 'featured.save')} aria-pressed={saved} onClick={toggle}><Heart fill={saved ? 'currentColor' : 'none'} /></Button>;
}
export function WhatsAppIcon() {
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8A8.5 8.5 0 1 1 20.5 11.7Z" /><path d="M8.5 7.6c.4-.2.9 1.4 1.1 1.8.2.4-.4.8-.6 1 .6 1.5 1.7 2.6 3.3 3.2.3-.3.7-1 1.1-.8l1.8.9c.5.3.3 1.3-.2 1.6-1.7 1.1-5.5-1-7-3.4-1-1.6-1.1-3.6.5-4.3Z" /></svg>;
}
