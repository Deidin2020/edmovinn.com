import { UniversitiesSection } from '@/components/edmovinn/universities-section';
import { createFileRoute } from "@tanstack/react-router";
import { LanguageProvider } from '@/lib/localization';
import { AccommodationSearch, FeaturedAccommodations, Footer, Header, Hero, HowItWorks, QuickBenefits, WhyChooseEdmovinn } from '@/components/edmovinn/homepage';
import hero from '@/assets/student-istanbul.png.asset.json';

// Use the same absolute cover image shown on the homepage for social sharing.
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Edmovinn — Find Your Student Home in Turkey' },
    { name: 'description', content: 'Discover student accommodation in Turkey, compare housing options, and find the right place to live near your university with Edmovinn.' },
    { property: 'og:title', content: 'Edmovinn — Find Your Student Home in Turkey' },
    { property: 'og:description', content: 'Discover student accommodation and find your place near your university in Turkey.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { property: 'og:image', content: hero.url },
    { name: 'twitter:image', content: hero.url },
  ] }),
  component: Index,
});

function Index() {
  return <LanguageProvider><div id="home"><Header /><main><Hero /><AccommodationSearch /><QuickBenefits /><FeaturedAccommodations /><UniversitiesSection /><WhyChooseEdmovinn /><HowItWorks /></main><Footer /></div></LanguageProvider>;
}
