import { createFileRoute } from '@tanstack/react-router';
import { Header, Footer } from '@/components/edmovinn/homepage';
import { AboutPage } from '@/components/edmovinn/about-page';
import { LanguageProvider } from '@/lib/localization';

export const Route = createFileRoute('/about-us')({
  head: () => ({ meta: [
    { title: 'About Us | Edmovinn Student Accommodation' },
    { name: 'description', content: 'Learn about Edmovinn, our mission, vision and how we make finding student accommodation in Turkey simpler.' },
    { property: 'og:title', content: 'About Us | Edmovinn Student Accommodation' },
    { property: 'og:description', content: 'Edmovinn makes finding student accommodation in Turkey simpler, clearer and more comfortable.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: '/about-us' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ], links: [{ rel: 'canonical', href: '/about-us' }] }),
  component: () => <LanguageProvider><Header /><AboutPage /><Footer /></LanguageProvider>,
});
