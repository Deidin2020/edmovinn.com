import { describe, expect, it } from 'vitest';
import { favoriteKey } from '@/lib/favorites';
describe('Favorite record identity', () => {
  it('keeps residence and room favorites separate for future account sync', () => {
    expect(favoriteKey({ kind: 'residence', residenceSlug: 'moveinn' })).toBe('residence:moveinn');
    expect(favoriteKey({ kind: 'room', residenceSlug: 'moveinn', roomId: 'quadruple-70' })).toBe('room:moveinn:quadruple-70');
  });
  it('keeps identically named rooms at different residences separate', () => {
    expect(favoriteKey({ kind: 'room', residenceSlug: 'moveinn', roomId: 'single' })).not.toBe(favoriteKey({ kind: 'room', residenceSlug: 'demo-single', roomId: 'single' }));
  });
});