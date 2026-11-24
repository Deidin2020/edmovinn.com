import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, GraduationCap, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { featuredUniversities, searchUniversities, universities, type University } from '@/lib/universities';

function UniversityCard({ university }: { university: University }) {
  const { t } = useLanguage(); const [campus, setCampus] = useState('');
  const multi = university.campuses.length > 1;
  return <article className="university-card"><div className="university-card-icon" aria-hidden="true"><GraduationCap size={28} strokeWidth={1.7} /></div><h3>{university.name}</h3><p className="university-card-city"><MapPin size={14} />{t('search.cities.istanbul')}</p>
    {multi && <label className="university-campus">{t('universities.campus')}<select value={campus} onChange={e => setCampus(e.target.value)}><option value="">{t('universities.allCampuses')}</option>{university.campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
    <Button variant="brandOutline" asChild><Link to="/accommodations" search={{ city: 'istanbul', university: university.name, ...(campus ? { campus } : {}) }}>{t('universities.explore')}<ArrowRight /></Link></Button></article>;
}
export function UniversitiesSection() {
  const { t } = useLanguage(); const [query, setQuery] = useState(''); const [all, setAll] = useState(false);
  const list = query.trim() ? searchUniversities(query) : all ? universities : featuredUniversities;
  return <section id="universities" className="page-container universities-section" aria-labelledby="universities-title"><div className="center-heading"><h2 id="universities-title">{t('universities.title')}</h2><span className="heading-accent" /><p>{t('universities.subtitle')}</p></div>
    <div className="universities-search"><Search size={17} /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('universities.searchPlaceholder')} aria-label={t('universities.searchPlaceholder')} /></div>
    {list.length ? <div className="universities-grid">{list.map(u => <UniversityCard key={u.name} university={u} />)}</div> : <p className="universities-empty">{t('universities.noMatch')}</p>}
    {!query.trim() && <div className="universities-more"><Button variant="link" onClick={() => setAll(v => !v)}>{t(all ? 'universities.showFewer' : 'universities.viewAll')}<ArrowRight /></Button></div>}
  </section>;
}
