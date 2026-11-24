import { describe, expect, it } from 'vitest';
import { filterResults, matchingRooms, paginateResults, priceBounds, selectedPriceRange, resultRoomTypes, resultsInventory, validateResultsSearch } from '@/lib/accommodation-results';
import { moveinn, type Residence, type Room } from '@/lib/residences';

const makeRoom = (type: Room['type'], price: number, availability: Room['availability'] = 'available'): Room => ({ id: `${type}-${price}`, type, price, occupancy: 1, availability, image: '', amenities: [] });
const fixture: Residence = { ...moveinn, rooms: [makeRoom('single', 250), makeRoom('double', 420), makeRoom('double', 550), makeRoom('triple', 700, 'unavailable'), makeRoom('studio', 800, 'unconfirmed')] };
describe('Accommodation results rules', () => {
  it('synchronizes the selected $300–$600 budget with the sidebar range', () => { expect(selectedPriceRange({ monthlyBudget: 'between300and600' }, { min: 300, max: 620 })).toEqual({ min: 300, max: 600 }); });
  it('includes apartment as a results filter without inventing apartment inventory', () => { expect(resultRoomTypes).toEqual(['single', 'double', 'triple', 'quadruple', 'studio', 'apartment']); expect(filterResults(resultsInventory, { roomType: 'apartment' })).toEqual([]); });
  it('returns one residence and its cheapest matching double room, not a cheaper single', () => { const matches = filterResults([fixture], { roomType: 'double' }); expect(matches).toHaveLength(1); expect(matches[0]?.room.price).toBe(420); expect(matches[0]?.room.type).toBe('double'); });
  it('applies room type and price to the same room', () => { expect(filterResults([fixture], { roomType: 'double', max: 300 })).toEqual([]); expect(filterResults([fixture], { roomType: 'single,double', min: 500 })[0]?.room.price).toBe(550); });
  it('excludes unavailable and unconfirmed rooms from available results', () => { expect(filterResults([fixture], { roomType: 'triple,studio' })).toEqual([]); expect(filterResults([moveinn], {})).toEqual([]); });
  it('shows supplied Moveinn terms only as a separate unconfirmed reference', () => { expect(matchingRooms(moveinn, { roomType: 'quadruple' }, true)[0]?.price).toBe(375); expect(matchingRooms(moveinn, { gender: 'female' }, true)).toEqual([]); expect(moveinn.rooms[0]?.availability).toBe('unconfirmed'); });
  it('requires all selected residence facilities', () => { expect(filterResults([fixture], { facilities: 'wifi,gym' })).toHaveLength(1); expect(filterResults([fixture], { facilities: 'wifi,security' })).toEqual([]); });
  it('filters male/female housing and excludes other cities', () => { expect(filterResults([fixture], { gender: 'female' })).toEqual([]); expect(filterResults([fixture], { gender: 'male,female' })).toHaveLength(1); expect(filterResults([fixture], { city: 'ankara' })).toEqual([]); });
  it('does not use invented university associations or geographic distances', () => { expect(filterResults(resultsInventory, { university: 'Marmara University' })).toEqual([]); expect(resultsInventory.every(item => item.coordinates === undefined)).toBe(true); });
  it('ignores legacy distance URL params without keeping an active filter', () => { const search = validateResultsSearch({ university: 'Boğaziçi University', distance: '3' }); expect(search).toEqual({ university: 'Boğaziçi University' }); expect('distance' in search).toBe(false); });
  it('uses exact monthly USD budget boundaries', () => { const residence = { ...fixture, rooms: [makeRoom('single', 300), makeRoom('double', 600), makeRoom('studio', 1000)] }; expect(matchingRooms(residence, { monthlyBudget: 'under300' })).toEqual([]); expect(matchingRooms(residence, { monthlyBudget: 'between300and600' }).map(room => room.price)).toEqual([300, 600]); expect(matchingRooms(residence, { monthlyBudget: 'between600and1000' }).map(room => room.price)).toEqual([600, 1000]); expect(matchingRooms(residence, { monthlyBudget: 'above1000' })).toEqual([]); });
  it('sorts using matching-room prices', () => { expect(filterResults(resultsInventory, { sort: 'low' }).map(item => item.room.price)).toEqual([300, 420, 520, 620]); expect(filterResults(resultsInventory, { sort: 'high' }).map(item => item.room.price)).toEqual([620, 520, 420, 300]); });
  it('derives price bounds from data and preserves one page for an empty set', () => { expect(priceBounds(resultsInventory)).toEqual({ min: 300, max: 620 }); expect(paginateResults([], 10)).toEqual({ page: 1, pages: 1, items: [] }); });
  it('clamps pagination and slices without duplicating residences', () => { expect(paginateResults([1, 2, 3, 4, 5], 20, 4)).toEqual({ page: 2, pages: 2, items: [5] }); expect(paginateResults([1, 2, 3, 4, 5], -1, 4).items).toEqual([1, 2, 3, 4]); });
  it('preserves homepage filters and does not silently reset unknown URL filters', () => { expect(validateResultsSearch({ city: 'istanbul', gender: 'female', roomType: 'apartment', monthlyBudget: 'between300and600', page: '2' })).toEqual({ city: 'istanbul', gender: 'female', roomType: 'apartment', monthlyBudget: 'between300and600', page: 2 }); expect(validateResultsSearch({ roomType: 'unknown' }).roomType).toBe('unknown'); });
});
import { filterResults as filterNear, resultsInventory as inventoryNear, validateResultsSearch as validateNear } from '@/lib/accommodation-results';
import { campusCoordinates } from '@/lib/universities';
describe('university proximity', () => {
  it('keeps the chosen university and campus from the URL', () => {
    expect(validateNear({ university: 'Boğaziçi University', campus: 'kilyos' })).toMatchObject({ university: 'Boğaziçi University', campus: 'kilyos' });
  });
  it('never claims a residence is near a university without verified locations', () => {
    expect(campusCoordinates('Istanbul University')).toBeNull();
    expect(filterNear(inventoryNear, { university: 'Istanbul University' })).toEqual([]);
  });
});
