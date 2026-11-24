import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useBookingAccount } from '@/lib/booking-account';
import { readRoomIntent } from '@/lib/auth-ui';
import { LanguageProvider } from '@/lib/localization';
import { AuthForm } from '@/components/edmovinn/authentication';
import { Header, Footer } from '@/components/edmovinn/homepage';
export const Route = createFileRoute('/auth')({
  validateSearch: (raw: Record<string, unknown>): { mode: 'signup' | 'login' } => ({ mode: raw['mode'] === 'signup' ? 'signup' : 'login' }),
  head: () => ({ meta: [
    { title: 'Student Sign Up & Log In | Edmovinn' },
    { name: 'description', content: 'Create or access your Edmovinn student account securely with email and password.' },
    { property: 'og:title', content: 'Student Sign Up & Log In | Edmovinn' },
    { property: 'og:description', content: 'Edmovinn student account registration and login.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: AuthPage,
});
function AuthPage() {
  const { mode } = Route.useSearch();
  const account = useBookingAccount();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<ReturnType<typeof readRoomIntent>>(null);
  useEffect(() => { setIntent(readRoomIntent()); }, []);
  useEffect(() => {
    if (!account.data) return;
    const selected = readRoomIntent();
    if (selected) void navigate({ to: '/booking', search: selected, replace: true });
    else void navigate({ to: '/dashboard', replace: true });
  }, [account.data, navigate]);
  return <LanguageProvider><Header /><main className="auth-page"><div className="auth-page-form"><AuthForm key={mode} initialMode={mode} intent={intent} /></div></main><Footer /></LanguageProvider>;
}
