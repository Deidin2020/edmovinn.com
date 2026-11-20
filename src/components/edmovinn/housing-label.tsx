import { UsersRound } from 'lucide-react';
import { useLanguage } from '@/lib/localization';
export function HousingLabel({ genderKey }: { genderKey: 'search.male' | 'search.female' }) {
 const { t } = useLanguage();
 return <span className={`housing-label ${genderKey === 'search.female' ? 'housing-female' : 'housing-male'}`}><UsersRound size={14} />{t(genderKey)}</span>;
}
