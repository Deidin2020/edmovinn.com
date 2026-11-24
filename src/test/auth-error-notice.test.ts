import { describe, expect, it } from 'vitest';
import { authErrorNotice } from '@/components/edmovinn/authentication';

describe('authErrorNotice', () => {
  it('explains a rejected weak password instead of a generic error', () => {
    expect(authErrorNotice({ code: 'weak_password' })).toBe('auth.weakPassword');
  });
  it('explains reusing the current password on reset', () => {
    expect(authErrorNotice({ code: 'same_password' })).toBe('auth.samePassword');
  });
  it('explains wrong login details', () => {
    expect(authErrorNotice({ code: 'invalid_credentials' })).toBe('auth.invalidLogin');
  });
  it('falls back to the generic message for unknown failures', () => {
    expect(authErrorNotice(new Error('boom'))).toBe('auth.authError');
  });
});
