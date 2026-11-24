import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { districtName, searchDistricts } from '@/lib/istanbul-districts';

export function DistrictSelect({ value, onChange, results = false }: { value: string; onChange: (value: string) => void; results?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const id = results ? 'results-district' : 'home-district';
  useEffect(() => {
    function outside(event: MouseEvent) { if (event.target instanceof Node && !ref.current?.contains(event.target)) setOpen(false); }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);
  function choose(key: string) { onChange(key); setOpen(false); trigger.current?.focus(); }
  const options = searchDistricts(query);
  return <div className={results ? 'results-search-field results-city' : 'search-field city-field'} ref={ref} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }}>
    <label id={`${id}-label`}><MapPin size={17} />{t('search.district')}</label>
    <Button ref={trigger} type="button" variant="ghost" className={results ? 'results-city-trigger' : 'city-trigger'} role="combobox" aria-labelledby={`${id}-label`} aria-expanded={open} aria-controls={`${id}-options`} onClick={() => { setOpen(!open); setQuery(''); }}><span>{districtName(value) ?? (value || t('search.allDistricts'))}</span><ChevronDown size={15} /></Button>
    {open && <div className="city-popover district-popover"><div className="city-input"><Search size={16} /><input autoFocus aria-label={t('search.districtPlaceholder')} placeholder={t('search.districtPlaceholder')} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const first = options[0]; if (first) choose(first[0]); } }} /></div><div id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`}><Button type="button" variant="ghost" role="option" aria-selected={!value} onClick={() => choose('')}>{t('search.allDistricts')}</Button>{options.map(([key, name]) => <Button key={key} type="button" variant="ghost" role="option" aria-selected={value === key} onClick={() => choose(key)}>{name}</Button>)}{!options.length && <p className="results-field-note">{t('common.noResults')}</p>}</div></div>}
  </div>;
}