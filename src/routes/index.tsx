import { createFileRoute } from "@tanstack/react-router";
import { LanguageProvider } from '@/lib/localization';
import { AccommodationSearch, FeaturedAccommodations, Footer, Header, Hero, HowItWorks, QuickBenefits, WhyChooseEdmovinn } from '@/components/edmovinn/homepage';

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Edmovinn — Find Your Student Home in Turkey' },
    { name: 'description', content: 'Discover student accommodation in Turkey, compare housing options, and find the right place to live near your university with Edmovinn.' },
    { property: 'og:title', content: 'Edmovinn — Find Your Student Home in Turkey' },
    { property: 'og:description', content: 'Discover student accommodation and find your place near your university in Turkey.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

function Index() {
  return <LanguageProvider><div id="home"><Header /><main><Hero /><AccommodationSearch /><QuickBenefits /><FeaturedAccommodations /><WhyChooseEdmovinn /><HowItWorks /></main><Footer /></div></LanguageProvider>;
}
