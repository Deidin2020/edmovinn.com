import { createFileRoute } from '@tanstack/react-router';
import { LanguageProvider } from '@/lib/localization';
import { AuthForm } from '@/components/edmovinn/authentication';
import { Header, Footer } from '@/components/edmovinn/homepage';
export const Route = createFileRoute('/auth')({
  validateSearch: (raw: Record<string, unknown>): { mode: 'signup' | 'login' } => ({ mode: raw['mode'] === 'signup' ? 'signup' : 'login' }),
  head: () => ({ meta: [
    { title: 'Student Sign Up & Log In | Edmovinn' },
    { name: 'description', content: 'Access Edmovinn student account registration and login with an international phone number.' },
    { property: 'og:title', content: 'Student Sign Up & Log In | Edmovinn' },
    { property: 'og:description', content: 'Edmovinn student account registration and login.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: AuthPage,
});
function AuthPage() {
  const { mode } = Route.useSearch();
  return <LanguageProvider><Header /><main className="auth-page"><div className="auth-page-form"><AuthForm key={mode} initialMode={mode} /></div></main><Footer /></LanguageProvider>;
}
