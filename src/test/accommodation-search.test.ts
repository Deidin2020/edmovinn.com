import { describe, expect, it } from 'vitest';
import { budgetOptions, cities, initialFilters, prepareSearchParams, roomTypes, validateFilters } from '@/lib/accommodation-search';

describe('Homepage search rules', () => {
  it('makes only Istanbul available', () => { expect(cities).toEqual(['istanbul']); expect(validateFilters({ ...initialFilters, city: 'ankara', gender: 'male' })).toBe('search.cityRequired'); });
  it('requires city before housing type', () => { expect(validateFilters(initialFilters)).toBe('search.cityRequired'); });
  it('requires male or female housing', () => { expect(validateFilters({ ...initialFilters, city: 'istanbul' })).toBe('search.genderRequired'); expect(validateFilters({ ...initialFilters, city: 'istanbul', gender: 'female' })).toBeNull(); });
  it('offers one to four occupants and a separate studio type', () => { expect(roomTypes).toEqual(['single', 'double', 'triple', 'quadruple', 'studio']); });
  it('uses the specified monthly USD budget ranges', () => { expect(budgetOptions).toEqual(['under300', 'between300and600', 'between600and1000', 'above1000']); const params = prepareSearchParams({ city: 'istanbul', gender: 'male', roomType: 'studio', budget: 'between300and600' }); expect(Object.fromEntries(params)).toEqual({ city: 'istanbul', gender: 'male', roomType: 'studio', monthlyBudget: 'between300and600', currency: 'USD' }); });
  it('keeps any room and any budget unset without adding move-in dates', () => { const params = prepareSearchParams({ ...initialFilters, city: 'istanbul', gender: 'female' }); expect([...params.keys()]).toEqual(['city', 'gender', 'currency']); });
});