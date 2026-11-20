import { expect, it } from 'vitest';
import { WHATSAPP_URL } from '@/lib/contact';
it('uses the owner-supplied WhatsApp destination', () => {
  expect(WHATSAPP_URL).toBe('https://wa.me/905555555555');
});