import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Header, Footer } from '@/components/edmovinn/homepage';
import { AccommodationResults } from '@/components/edmovinn/accommodation-results';
import { LanguageProvider } from '@/lib/localization';
import { validateResultsSearch, type ResultsPatch } from '@/lib/accommodation-results';

export const Route = createFileRoute('/accommodations/')({
  validateSearch: validateResultsSearch,
  head: () => ({ meta: [
    { title: 'Student Accommodation Search in Istanbul | Edmovinn' },
    { name: 'description', content: 'Explore Edmovinn student housing previews in Istanbul. Filter by housing gender, room type, monthly USD budget and facilities, then compare matching room options.' },
    { property: 'og:title', content: 'Student Accommodation Search in Istanbul | Edmovinn' },
    { property: 'og:description', content: 'Compare student accommodation previews, matching rooms and monthly prices in Istanbul with Edmovinn.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'robots', content: 'noindex, follow' },
  ] }),
  component: ResultsRoute,
});
function ResultsRoute() {
  const search = Route.useSearch(); const navigate = useNavigate({ from: Route.fullPath });
  function update(patch: ResultsPatch, reset = true) {
    void navigate({ search: previous => validateResultsSearch(Object.fromEntries(Object.entries({ ...previous, ...patch, ...(reset ? { page: 1 } : {}) }).filter(([, value]) => value !== undefined && value !== ''))), resetScroll: false });
  }
  return <LanguageProvider><Header /><AccommodationResults search={search} update={update} clear={() => { void navigate({ search: {}, resetScroll: false }); }} /><Footer /></LanguageProvider>;
}