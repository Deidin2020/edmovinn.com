import { createContext, useContext, useState, type ReactNode } from 'react';
import { z } from 'zod';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { detailPreview, getResidence, prepareRoomSelection } from './residences';

export type AuthMode = 'signup' | 'login';
export type RoomIntent = { residenceSlug: string; roomId: string };
export const ROOM_INTENT_KEY = 'edmovinn-auth-room';
export const PHONE_VERIFIED_ON_REGISTRATION = false;
export const AUTH_UI_ONLY = true;
export function normalizePhone(value: string, country: CountryCode) {
  const number = parsePhoneNumberFromString(value.trim(), country);
  return number?.isValid() ? number.number : null;
}
export const signupFields = z.object({
  fullName: z.string().trim().min(2, 'nameError').max(100, 'nameError'),
  phone: z.string().min(1, 'phoneError'),
  password: z.string().min(8, 'passwordError').max(128, 'passwordError'),
  confirmPassword: z.string(),
}).refine(value => value.password === value.confirmPassword, { path: ['confirmPassword'], message: 'confirmError' });
export const loginFields = z.object({ phone: z.string().min(1, 'phoneError'), password: z.string().min(1, 'requiredPassword').max(128, 'passwordError') });
// Display-only context may include explicitly illustrative rooms; it never authorizes a booking.
export function validateRoomIntent(raw: unknown): RoomIntent | null {
  const parsed = z.object({ residenceSlug: z.string().max(100), roomId: z.string().max(100) }).safeParse(raw);
  if (!parsed.success) return null;
  const residence = getResidence(parsed.data.residenceSlug);
  return residence && prepareRoomSelection(detailPreview(residence), parsed.data.roomId) ? parsed.data : null;
}
export function readRoomIntent(): RoomIntent | null {
  try { return validateRoomIntent(JSON.parse(sessionStorage.getItem(ROOM_INTENT_KEY) ?? 'null')); } catch { return null; }
}
export function saveRoomIntent(intent: RoomIntent | null) {
  try { if (intent) sessionStorage.setItem(ROOM_INTENT_KEY, JSON.stringify(intent)); else sessionStorage.removeItem(ROOM_INTENT_KEY); } catch { /* Selection still works with storage blocked. */ }
}
type AuthRequest = { mode: AuthMode; intent: RoomIntent | null };
const AuthUIContext = createContext<{ request: AuthRequest | null; openAuth: (mode: AuthMode, intent?: RoomIntent) => void; closeAuth: () => void }>({ request: null, openAuth: () => {}, closeAuth: () => {} });
export function AuthUIProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<AuthRequest | null>(null);
  function openAuth(mode: AuthMode, raw?: RoomIntent) {
    const intent = raw ? validateRoomIntent(raw) : null;
    if (intent) saveRoomIntent(intent);
    setRequest({ mode, intent });
  }
  return <AuthUIContext.Provider value={{ request, openAuth, closeAuth: () => setRequest(null) }}>{children}</AuthUIContext.Provider>;
}
export const useAuthUI = () => useContext(AuthUIContext);
