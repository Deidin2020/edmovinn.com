import { createFileRoute } from '@tanstack/react-router';
import { LanguageProvider } from '@/lib/localization';
import { ResetPasswordForm } from '@/components/edmovinn/authentication';
import { Header, Footer } from '@/components/edmovinn/homepage';

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [
    { title: 'Reset Student Password | Edmovinn' },
    { name: 'description', content: 'Securely reset your Edmovinn student account password.' },
    { property: 'og:title', content: 'Reset Student Password | Edmovinn' },
    { property: 'og:description', content: 'Restore access to your Edmovinn student account.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: () => <LanguageProvider><Header /><main className="auth-page"><div className="auth-page-form"><ResetPasswordForm /></div></main><Footer /></LanguageProvider>,
});