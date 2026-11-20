import { createFileRoute, Link } from '@tanstack/react-router';
import { Header, Footer } from '@/components/edmovinn/homepage';
import { ResidenceDetails } from '@/components/edmovinn/residence-details';
import { Button } from '@/components/ui/button';
import { getResidence } from '@/lib/residences';
import { LanguageProvider, useLanguage } from '@/lib/localization';

export const Route = createFileRoute('/accommodations/$slug')({
  head: ({ params }) => {
    const residence = getResidence(params.slug);
    const title = residence ? `${residence.name} — Residence Preview | Edmovinn` : 'Residence Unavailable | Edmovinn';
    const description = 'Explore student residence photos, facilities and room options with Edmovinn. Temporary illustrative content; booking is not available.';
    return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, { name: 'robots', content: 'noindex, nofollow' }] };
  },
  component: AccommodationRoute,
});
function MissingResidence() {
  const { t } = useLanguage();
  return <main className="residence-missing page-container"><h1>{t('details.missing')}</h1><p>{t('details.missingText')}</p><Button asChild><Link to="/">{t('header.home')}</Link></Button></main>;
}
function AccommodationRoute() {
  const { slug } = Route.useParams();
  const residence = getResidence(slug);
  return <LanguageProvider><Header />{residence ? <ResidenceDetails key={residence.slug} residence={residence} /> : <MissingResidence />}<Footer /></LanguageProvider>;
}
