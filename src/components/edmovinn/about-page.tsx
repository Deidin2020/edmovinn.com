import { Link } from '@tanstack/react-router';
import { ArrowRight, Bell, Building2, Compass, Eye, GraduationCap, LifeBuoy, ReceiptText, Search, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/localization';
import hero from '@/assets/about/hero.jpg.asset.json';
import story from '@/assets/about/story.jpg.asset.json';
import students from '@/assets/about/students.jpg.asset.json';

const services = [{ icon: Search, k: 's1' }, { icon: GraduationCap, k: 's2' }, { icon: ReceiptText, k: 's3' }, { icon: Bell, k: 's4' }, { icon: LifeBuoy, k: 's5' }];

export function AboutPage() {
  const { t } = useLanguage(); const a = (k: string) => t(`aboutPage.${k}`);
  const ps = (k: string, n: number) => Array.from({ length: n }, (_, i) => <p key={i}>{a(`${k}${i + 1}`)}</p>);
  return <main className="about-page">
    <section className="about-hero page-container"><div><p className="about-eyebrow">{a('heroEyebrow')}</p><h1>{a('heroTitle')}</h1><div className="about-lead">{ps('hero', 4)}</div></div><img src={hero.url} alt={a('heroImageAlt')} width={1536} height={1024} /></section>
    <section className="about-split page-container"><img src={story.url} alt={a('storyImageAlt')} loading="lazy" width={1312} height={1199} /><div><h2>{a('storyTitle')}</h2><p className="about-sub">{a('storySubtitle')}</p>{ps('story', 4)}</div></section>
    <section className="about-band"><div className="page-container about-mv">{([['mission', Target], ['vision', Eye]] as const).map(([k, Icon]) => <article key={k} className="about-card"><span className="about-icon"><Icon /></span><h3>{a(`${k}Title`)}</h3><p className="about-sub">{a(`${k}Subtitle`)}</p>{ps(k, 2)}</article>)}</div></section>
    <section className="page-container about-what"><div className="center-heading"><h2>{a('whatTitle')}</h2><span className="heading-accent" /><p>{a('whatSubtitle')}</p></div><div className="about-services">{services.map(({ icon: Icon, k }) => <article key={k} className="about-card"><span className="about-icon"><Icon /></span><h3>{a(`${k}Title`)}</h3><p>{a(`${k}Text`)}</p></article>)}</div></section>
    <section className="about-split page-container about-reverse"><div><h2>{a('studentsTitle')}</h2>{ps('students', 3)}</div><img src={students.url} alt={a('studentsImageAlt')} loading="lazy" width={1536} height={1024} /></section>
    <section className="about-band"><div className="page-container about-connect"><span className="about-icon"><Building2 /></span><h2>{a('connectTitle')}</h2>{ps('connect', 3)}</div></section>
    <section className="page-container about-cta"><Compass className="about-cta-icon" /><h2>{a('ctaTitle')}</h2><p>{a('ctaText1')}</p><p>{a('ctaText2')}</p><Button size="lg" asChild><Link to="/accommodations">{a('ctaButton')}<ArrowRight /></Link></Button></section>
  </main>;
}
