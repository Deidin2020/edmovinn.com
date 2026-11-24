import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { AUTH_UI_ONLY, AuthUIProvider, PHONE_VERIFIED_ON_REGISTRATION, ROOM_INTENT_KEY, normalizePhone, readRoomIntent, saveRoomIntent, signupFields, useAuthUI, validateRoomIntent } from '@/lib/auth-ui';
import { AuthForm } from '@/components/edmovinn/authentication';

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(), signInWithPassword: vi.fn(), getUser: vi.fn(), resetPasswordForEmail: vi.fn(),
  navigate: vi.fn(), invalidateQueries: vi.fn(),
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: mocks } }));
vi.mock('@tanstack/react-query', async importOriginal => ({ ...await importOriginal<typeof import('@tanstack/react-query')>(), useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }) }));
vi.mock('@tanstack/react-router', async importOriginal => ({ ...await importOriginal<typeof import('@tanstack/react-router')>(), useNavigate: () => mocks.navigate }));

afterEach(() => { cleanup(); sessionStorage.clear(); });
describe('Student authentication UI', () => {
  it('hydrates without errors when browser country names differ from the server', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<AuthForm initialMode="signup" />);
    document.body.appendChild(container);
    const realDisplayNames = Intl.DisplayNames;
    const differentNames = vi.spyOn(Intl, 'DisplayNames').mockImplementation(function (locales, options) {
      const names = new realDisplayNames(locales, options);
      const original = names.of.bind(names);
      names.of = code => `Browser region: ${original(code) ?? code}`;
      return names;
    });
    const onRecoverableError = vi.fn();
    try {
      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => { root = hydrateRoot(container, <AuthForm initialMode="signup" />, { onRecoverableError }); });
      await act(async () => { root?.unmount(); });
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally { differentNames.mockRestore(); container.remove(); }
  });
  it('requires email for signup alongside private name and phone', () => {
    expect(signupFields.safeParse({ fullName: 'Test Student', phone: '+905551234567', email: 'student@example.com', password: 'Student123', confirmPassword: 'Student123' }).success).toBe(true);
  });
  it('rejects signup without email', () => {
    expect(signupFields.safeParse({ fullName: 'Test Student', phone: '+905551234567', password: 'Student123', confirmPassword: 'Student123' }).success).toBe(false);
  });
  it('rejects different confirmation passwords', () => {
    expect(signupFields.safeParse({ fullName: 'Test Student', phone: '+905551234567', email: 'student@example.com', password: 'Student123', confirmPassword: 'Student456' }).success).toBe(false);
  });
  it('validates country-specific phone numbers', () => {
    expect(normalizePhone('5551234567', 'TR')).toBe('+905551234567');
    expect(normalizePhone('123', 'TR')).toBeNull();
  });
  it('activates accounts while keeping phone unverified', () => {
    expect(AUTH_UI_ONLY).toBe(false);
    expect(PHONE_VERIFIED_ON_REGISTRATION).toBe(false);
  });
  it('preserves only validated room IDs, then clears them on cancellation', () => {
    const intent = { residenceSlug: 'moveinn', roomId: 'quadruple-70' };
    expect(validateRoomIntent({ ...intent, roomId: 'not-a-room' })).toBeNull();
    saveRoomIntent(intent);
    expect(readRoomIntent()).toEqual(intent);
    expect(Object.keys(JSON.parse(sessionStorage.getItem(ROOM_INTENT_KEY) ?? '{}'))).toEqual(['residenceSlug', 'roomId']);
    saveRoomIntent(null);
    expect(readRoomIntent()).toBeNull();
  });
  it('does not discard the selected room when authentication closes', () => {
    function Control() { const { openAuth, closeAuth } = useAuthUI(); return <><button onClick={() => openAuth('signup', { residenceSlug: 'moveinn', roomId: 'quadruple-70' })}>Open</button><button onClick={closeAuth}>Close</button></>; }
    render(<AuthUIProvider><Control /></AuthUIProvider>);
    fireEvent.click(screen.getByText('Open')); fireEvent.click(screen.getByText('Close'));
    expect(readRoomIntent()?.roomId).toBe('quadruple-70');
  });
  it('sends real signup but does not simulate a session before email confirmation', async () => {
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
    mocks.navigate.mockClear();
    render(<AuthForm initialMode="signup" />);
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '5551234567' } });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), { target: { value: 'Student123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Student123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => expect(mocks.signUp).toHaveBeenCalled());
    expect(mocks.signUp).toHaveBeenCalledWith({ email: 'student@example.com', password: 'Student123', options: { emailRedirectTo: `${window.location.origin}/auth?mode=login`, data: { full_name: 'Test Student', contact_phone: '+905551234567' } } });
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(sessionStorage.length).toBe(0);
    expect(screen.getByLabelText('Phone Number')).toHaveAttribute('aria-invalid', 'false');
  });
  it('signs in with email and continues to the preserved room', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'student-id' } }, error: null });
    mocks.navigate.mockClear();
    saveRoomIntent({ residenceSlug: 'moveinn', roomId: 'quadruple-70' });
    render(<AuthForm initialMode="login" />);
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), { target: { value: 'Student123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In', exact: true }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '/booking', search: { residenceSlug: 'moveinn', roomId: 'quadruple-70' } }));
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'student@example.com', password: 'Student123' });
  });
});
