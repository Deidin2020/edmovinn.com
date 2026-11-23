import { createFileRoute, Link } from '@tanstack/react-router';
import { Header, Footer } from '@/components/edmovinn/homepage';
import { ResidenceDetails } from '@/components/edmovinn/residence-details';
import { Button } from '@/components/ui/button';
import { getResidence } from '@/lib/residences';
import { LanguageProvider, useLanguage } from '@/lib/localization';

export const Route = createFileRoute('/accommodations/$slug')({
  head: ({ params }) => {
    const residence = getResidence(params.slug);
    const title = residence ? `${residence.name} — ${residence.isMock ? 'Residence Preview' : 'Male Student Residence in Istanbul'} | Edmovinn` : 'Residence Unavailable | Edmovinn';
    const description = residence && !residence.isMock ? 'Explore Moveinn male student housing in Küçükçekmece, opposite Mall of Istanbul, with twelve facilities and monthly room information. Booking is not yet available.' : 'Explore student residence photos, facilities and room options with Edmovinn. Temporary illustrative content; booking is not available.';
    const cover = residence?.photos[0];
    return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, { name: 'robots', content: 'noindex, nofollow' }, ...(cover?.startsWith('https://') ? [{ property: 'og:image', content: cover }, { name: 'twitter:image', content: cover }] : [])] };
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
