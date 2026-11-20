import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, BedDouble, CalendarCheck, ChevronDown, ChevronRight, Globe, GraduationCap, Headphones, Layers, MapPin, Menu, Search, ShieldCheck, Sparkles, Star, UserRound, UsersRound, Wallet, X, Zap, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import { budgetOptions, cities, initialFilters, prepareSearchParams, roomTypes, validateFilters, type SearchFilters } from '@/lib/accommodation-search';
import logo from '@/assets/edmovinn-logo.png.asset.json';
import hero from '@/assets/student-istanbul.png.asset.json';
import { DemoAccommodations } from './demo-accommodations';
import { Link, useNavigate } from '@tanstack/react-router';
import { validateResultsSearch } from '@/lib/accommodation-results';

function Logo({ footer = false }: { footer?: boolean }) {
  const { t } = useLanguage();
  return <Link to="/" hash="home" className={`brand-logo ${footer ? 'footer-logo' : ''}`} aria-label={t('common.brand')}><img src={logo.url} alt={t('common.brand')} /></Link>;
}
function LanguageSwitcher({ footer = false }: { footer?: boolean }) {
  const { t, language, setLanguage } = useLanguage();
  return <label className={`language-switch ${footer ? 'footer-language' : ''}`}><Globe size={17} /><span className="sr-only">{t('common.language')}</span><select aria-label={t('common.language')} value={language} onChange={e => setLanguage(e.target.value === 'tr' ? 'tr' : 'en')}><option value="en">EN</option><option value="tr">TR</option></select><ChevronDown size={12} /></label>;
}
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  return <nav aria-label={t('header.menu')} className="main-navigation"><Button variant="link" asChild><Link to="/" hash="home" onClick={onNavigate}>{t('header.home')}</Link></Button><Button variant="ghost" asChild><Link to="/accommodations" onClick={onNavigate}>{t('header.accommodations')}</Link></Button><Button variant="ghost" disabled>{t('header.universities')}</Button><Button variant="ghost" asChild><Link to="/" hash="how-it-works" onClick={onNavigate}>{t('header.howItWorks')}</Link></Button><Button variant="ghost" disabled>{t('header.about')}</Button></nav>;
}
export function Header() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('a,button,select')?.focus();
    function closeOnEscape(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  return <header className="site-header"><div className="page-container header-inner"><Logo /><div className="desktop-navigation"><Navigation /></div><div className="header-actions"><LanguageSwitcher /><span className="currency" aria-label={t('common.currency')}>{t('common.usd')}</span><Button variant="brandOutline" disabled>{t('header.listProperty')}</Button><Button variant="ghost" disabled><UserRound />{t('header.login')}</Button><Button disabled>{t('header.signup')}</Button></div><div className="mobile-actions"><Button variant="ghost" size="icon" aria-label={t('header.account')} disabled><UserRound /></Button><Button ref={trigger} variant="ghost" size="icon" aria-label={open ? t('common.close') : t('header.menu')} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div></div>{open && <div id="mobile-navigation" ref={menuRef} className="mobile-navigation"><Navigation onNavigate={() => setOpen(false)} /><div className="mobile-menu-actions"><LanguageSwitcher /><span>{t('common.usd')}</span><Button variant="brandOutline" disabled>{t('header.listProperty')}</Button><Button disabled>{t('header.signup')}</Button><Button variant="ghost" disabled>{t('header.login')}</Button></div></div>}</header>;
}
export function Hero() {
  const { t } = useLanguage();
  return <section className="hero" aria-labelledby="hero-title"><img className="hero-photo" src={hero.url} alt="" fetchPriority="high" /><div className="page-container hero-inner"><div className="hero-copy"><h1 id="hero-title">{t('hero.title')}</h1><p>{t('hero.description')}</p></div></div></section>;
}
export function AccommodationSearch() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [message, setMessage] = useState<string | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const cityRef = useRef<HTMLDivElement>(null);
  useEffect(() => { function outside(e: MouseEvent) { if (e.target instanceof Node && !cityRef.current?.contains(e.target)) setCityOpen(false); } document.addEventListener('mousedown', outside); return () => document.removeEventListener('mousedown', outside); }, []);
  function update(key: keyof SearchFilters, value: string) { setFilters(old => ({ ...old, [key]: value })); setMessage(null); }
  function submit(e: FormEvent) { e.preventDefault(); const error = validateFilters(filters); if (error) { setMessage(error); return; } void navigate({ to: '/accommodations', search: validateResultsSearch(Object.fromEntries(prepareSearchParams(filters))) }); }
  const fields: { key: 'gender' | 'roomType' | 'budget'; label: string; placeholder: string; icon: LucideIcon; options: readonly string[] }[] = [
    { key: 'gender', label: 'search.gender', placeholder: 'search.genderPlaceholder', icon: UsersRound, options: ['male', 'female'] },
    { key: 'roomType', label: 'search.roomType', placeholder: 'search.anyRoom', icon: BedDouble, options: roomTypes },
    { key: 'budget', label: 'search.budget', placeholder: 'search.anyBudget', icon: Wallet, options: budgetOptions },
  ];
  return <div className="page-container search-container"><form className="accommodation-search" onSubmit={submit} noValidate><div className="search-fields"><div className="search-field city-field" ref={cityRef}><label id="city-label"><MapPin size={18} />{t('search.city')}</label><Button type="button" variant="ghost" className="city-trigger" role="combobox" aria-labelledby="city-label" aria-expanded={cityOpen} aria-controls="city-options" onClick={() => { setCityOpen(!cityOpen); setCityQuery(''); }} onKeyDown={e => { if (e.key === 'Escape') setCityOpen(false); }}><span>{filters.city ? t(`search.cities.${filters.city}`) : t('search.cityPlaceholder')}</span><ChevronDown size={16} /></Button>{cityOpen && <div className="city-popover"><div className="city-input"><Search size={16} /><input autoFocus aria-label={t('search.cityPlaceholder')} placeholder={t('search.cityPlaceholder')} value={cityQuery} onChange={e => setCityQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setCityOpen(false); if (e.key === 'Enter' && t('search.cities.istanbul').toLocaleLowerCase(language).includes(cityQuery.toLocaleLowerCase(language))) { e.preventDefault(); update('city', 'istanbul'); setCityOpen(false); } }} /></div><div role="listbox" id="city-options" aria-labelledby="city-label">{cities.filter(city => t(`search.cities.${city}`).toLocaleLowerCase(language).includes(cityQuery.toLocaleLowerCase(language))).map(city => <Button key={city} type="button" variant="ghost" role="option" aria-selected={filters.city === city} onClick={() => { update('city', city); setCityOpen(false); }}><MapPin />{t(`search.cities.${city}`)}</Button>)}</div></div>}</div>{fields.map(({ key, label, placeholder, icon: Icon, options }) => <div className="search-field" key={key}><label htmlFor={key}><Icon size={18} />{t(label)}</label><div className="select-wrap"><select id={key} value={filters[key]} onChange={e => update(key, e.target.value)}><option value="">{t(placeholder)}</option>{options.map(option => <option key={option} value={option}>{t(`search.${option}`)}</option>)}</select><ChevronDown size={16} /></div></div>)}<Button type="submit" variant="search" className="search-submit"><Search size={21} />{t('search.submit')}</Button></div>{message && <p className={`search-message ${message === 'search.searchUnavailable' ? '' : 'validation-message'}`} role="status">{t(message)}</p>}</form></div>;
}
const quickBenefits: { key: string; icon: LucideIcon }[] = [{ key: 'studentFocused', icon: GraduationCap }, { key: 'verified', icon: ShieldCheck }, { key: 'easy', icon: Zap }, { key: 'support', icon: Headphones }];
export function QuickBenefits() {
  const { t } = useLanguage();
  return <section className="page-container quick-benefits">{quickBenefits.map(({ key, icon: Icon }) => <div className="quick-benefit" key={key}><Icon size={31} strokeWidth={1.7} /><div><h3>{t(`quickBenefits.${key}.title`)}</h3><p>{t(`quickBenefits.${key}.description`)}</p></div></div>)}</section>;
}
export function FeaturedAccommodations() {
  const { t } = useLanguage();
  return <section id="accommodations" className="page-container featured-section" aria-labelledby="featured-title"><div className="section-heading"><h2 id="featured-title">{t('featured.title')}</h2><Button variant="link" asChild><Link to="/accommodations">{t('featured.viewAll')}<ArrowRight /></Link></Button></div><DemoAccommodations /></section>;
}
const whyBenefits: { key: string; icon: LucideIcon }[] = [{ key: 'smartSearch', icon: Search }, { key: 'verified', icon: MapPin }, { key: 'tracking', icon: ShieldCheck }, { key: 'payments', icon: Star }, { key: 'support', icon: UsersRound }, { key: 'ai', icon: Sparkles }];
export function WhyChooseEdmovinn() {
  const { t } = useLanguage();
  return <section className="page-container why-section" aria-labelledby="why-title"><div className="center-heading"><h2 id="why-title">{t('why.title')}</h2><span className="heading-accent" /><p>{t('why.subtitle')}</p></div><div className="why-grid">{whyBenefits.map(({ key, icon: Icon }) => <article className="benefit-card" key={key}><Icon size={27} strokeWidth={1.8} /><h3>{t(`why.${key}.title`)}</h3><p>{t(`why.${key}.description`)}</p></article>)}</div></section>;
}
export function HowItWorks() {
  const { t } = useLanguage();
  const steps: { key: string; icon: LucideIcon }[] = [{ key: 'search', icon: Search }, { key: 'compare', icon: Layers }, { key: 'book', icon: CalendarCheck }];
  return <section id="how-it-works" className="page-container how-section" aria-labelledby="how-title"><div className="center-heading"><h2 id="how-title">{t('how.title')}</h2><span className="heading-accent" /><p>{t('how.subtitle')}</p></div><div className="steps-grid">{steps.map(({ key, icon: Icon }, index) => <article className="step-card" key={key}><div className="step-icon"><Icon size={31} strokeWidth={1.7} /></div><div><span className="step-number">0{index + 1}</span><h3>{t(`how.${key}.title`)}</h3><p>{t(`how.${key}.description`)}</p></div>{index < 2 && <ChevronRight className="step-arrow" size={22} />}</article>)}</div></section>;
}
export function Footer() {
  const { t } = useLanguage();
  const groups = [{ title: 'footer.explore', links: [{ key: 'header.accommodations', href: '#accommodations' }, { key: 'header.universities' }, { key: 'header.howItWorks', href: '#how-it-works' }] }, { title: 'footer.partners', links: [{ key: 'header.listProperty' }] }, { title: 'footer.support', links: [{ key: 'footer.contact' }, { key: 'footer.help' }] }, { title: 'footer.company', links: [{ key: 'footer.about' }] }, { title: 'footer.legal', links: [{ key: 'footer.privacy' }, { key: 'footer.terms' }, { key: 'footer.cookies' }] }];
  return <footer className="site-footer"><div className="page-container"><div className="footer-top"><div className="footer-brand"><Logo footer /><p>{t('footer.tagline')}</p></div>{groups.map(group => <div className="footer-group" key={group.title}><h3>{t(group.title)}</h3>{group.links.map(link => 'href' in link && typeof link.href === 'string' ? <Button key={link.key} variant="link" asChild><Link to="/" hash={link.href.slice(1)}>{t(link.key)}</Link></Button> : <Button key={link.key} variant="link" disabled>{t(link.key)}</Button>)}</div>)}</div><div className="footer-bottom"><p>{t('footer.copyright')}</p><LanguageSwitcher footer /></div></div></footer>;
}