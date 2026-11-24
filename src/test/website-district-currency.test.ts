import { describe, expect, it } from 'vitest';
import { districtName, istanbulDistricts, searchDistricts } from '@/lib/istanbul-districts';
import { initialFilters, prepareSearchParams, validateFilters } from '@/lib/accommodation-search';
import { filterResults, matchingRooms, resultsInventory, validateResultsSearch } from '@/lib/accommodation-results';
import { moveinn } from '@/lib/residences';
import { cachedRate, convertedMoney, DEFAULT_DISPLAY_CURRENCY, RATE_CACHE_TTL } from '@/lib/display-money';

describe('Website district location rules', () => {
  it('offers exactly 39 unique official Istanbul districts', () => {
    expect(istanbulDistricts).toHaveLength(39);
    expect(new Set(istanbulDistricts.map(([key]) => key)).size).toBe(39);
    expect(districtName('kucukcekmece')).toBe('Küçükçekmece');
    expect(districtName('istanbul')).toBeUndefined();
  });
  it('searches Turkish and ASCII district names', () => { expect(searchDistricts('kucuk')).toEqual([['kucukcekmece', 'Küçükçekmece']]); expect(searchDistricts('ŞİŞ')).toEqual([['sisli', 'Şişli']]); });
  it('keeps fixed Istanbul and distinct district state in the search URL', () => { expect(Object.fromEntries(prepareSearchParams({ ...initialFilters, district: 'kucukcekmece', gender: 'male' }))).toMatchObject({ city: 'istanbul', district: 'kucukcekmece', gender: 'male' }); expect(validateFilters({ ...initialFilters, district: 'istanbul', gender: 'male' })).toBe('search.districtRequired'); });
  it('matches Moveinn only to its supplied Küçükçekmece district without asserting availability', () => { expect(matchingRooms(moveinn, { district: 'kucukcekmece' }, true)[0]?.price).toBe(375); expect(matchingRooms(moveinn, { district: 'basaksehir' }, true)).toEqual([]); expect(filterResults(resultsInventory, { district: 'kucukcekmece' })).toEqual([]); });
  it('keeps unspecified demos out of specific districts and includes them in all districts', () => { expect(resultsInventory.filter(r => r.isMock).every(r => r.district === undefined)).toBe(true); expect(filterResults(resultsInventory, { district: 'sisli' })).toEqual([]); expect(filterResults(resultsInventory, { district: 'all' })).toHaveLength(4); });
  it('preserves old city links and district when sorting with other filters', () => { expect(filterResults(resultsInventory, validateResultsSearch({ city: 'istanbul' }))).toHaveLength(4); expect(validateResultsSearch({ district: 'kucukcekmece', sort: 'high', university: 'Istanbul University', gender: 'male', roomType: 'quadruple', monthlyBudget: 'between300and600' })).toMatchObject({ district: 'kucukcekmece', sort: 'high', gender: 'male', university: 'Istanbul University', monthlyBudget: 'between300and600' }); });
});
describe('Website currency rules', () => {
  it('defaults first visits to TRY', () => { expect(DEFAULT_DISPLAY_CURRENCY).toBe('TRY'); });
  it('converts USD to TRY without changing the source amount', () => { expect(convertedMoney(375, 'TRY', 40, 'USD')).toEqual({ value: 15000, currency: 'TRY', unavailable: false }); expect(moveinn.rooms[0]?.price).toBe(375); expect(moveinn.rooms[0]?.deposit).toBe(750); expect(moveinn.currency).toBe('USD'); });
  it('supports TRY to USD with the same rate', () => { expect(convertedMoney(15000, 'USD', 40, 'TRY')).toEqual({ value: 375, currency: 'USD', unavailable: false }); });
  it('keeps source currency when exchange rate is unavailable or invalid', () => { for (const rate of [null, 0, -1, NaN, Infinity]) expect(convertedMoney(375, 'TRY', rate, 'USD')).toEqual({ value: 375, currency: 'USD', unavailable: true }); expect(convertedMoney(15000, 'USD', null, 'TRY')).toEqual({ value: 15000, currency: 'TRY', unavailable: true }); });
  it('needs no rate when display equals source', () => { expect(convertedMoney(375, 'USD', null, 'USD')).toEqual({ value: 375, currency: 'USD', unavailable: false }); });
  it('accepts only positive finite rates in a fresh cache, rejecting future or expired entries', () => { const now = 10_000_000; expect(cachedRate(JSON.stringify({ rate: 40, at: now - 1000 }), now)).toBe(40); for (const value of [{ rate: -40, at: now }, { rate: 40, at: now + 1 }, { rate: 40, at: now - RATE_CACHE_TTL }, { rate: '40', at: now }, { rate: 40 }]) expect(cachedRate(JSON.stringify(value), now)).toBeNull(); expect(cachedRate('broken', now)).toBeNull(); });
});
