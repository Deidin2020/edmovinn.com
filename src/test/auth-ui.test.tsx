import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AUTH_UI_ONLY, AuthUIProvider, PHONE_VERIFIED_ON_REGISTRATION, ROOM_INTENT_KEY, normalizePhone, readRoomIntent, saveRoomIntent, signupFields, useAuthUI, validateRoomIntent } from '@/lib/auth-ui';
import { AuthForm } from '@/components/edmovinn/authentication';

afterEach(() => { cleanup(); sessionStorage.clear(); });
describe('Student authentication UI', () => {
  it('accepts a signup with name and phone, without requiring email', () => {
    expect(signupFields.safeParse({ fullName: 'Test Student', phone: '+905551234567', password: 'Student123', confirmPassword: 'Student123' }).success).toBe(true);
  });
  it('rejects different confirmation passwords', () => {
    expect(signupFields.safeParse({ fullName: 'Test Student', phone: '+905551234567', password: 'Student123', confirmPassword: 'Student456' }).success).toBe(false);
  });
  it('validates country-specific phone numbers', () => {
    expect(normalizePhone('5551234567', 'TR')).toBe('+905551234567');
    expect(normalizePhone('123', 'TR')).toBeNull();
  });
  it('keeps accounts UI-only and phone unverified', () => {
    expect(AUTH_UI_ONLY).toBe(true);
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
  it('does not store credentials or simulate signup when submitting valid input', () => {
    render(<AuthForm initialMode="signup" />);
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test Student' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '5551234567' } });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), { target: { value: 'Student123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Student123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(sessionStorage.length).toBe(0);
    expect(screen.getByLabelText('Phone Number')).toHaveAttribute('aria-invalid', 'false');
  });
});
