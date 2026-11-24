import { campusCoordinates, distanceKm } from './universities';
import { getResidence, moveinn, type Facility, type Residence, type Room } from './residences';

export const resultRoomTypes = ['single', 'double', 'triple', 'quadruple', 'studio', 'apartment'] as const;
export const resultsInventory = [moveinn, ...['demo-twin', 'demo-single', 'demo-studio', 'demo-shared'].flatMap(slug => { const record = getResidence(slug); return record ? [record] : []; })];
export interface ResultsSearch { city?: string; district?: string; gender?: string; roomType?: string; monthlyBudget?: string; facilities?: string; min?: number; max?: number; sort?: string; page?: number; university?: string; campus?: string; distance?: number }
export type ResultsPatch = { [K in keyof ResultsSearch]?: ResultsSearch[K] | undefined };
export function validateResultsSearch(raw: Record<string, unknown>): ResultsSearch {
  const result: ResultsSearch = {};
  for (const key of ['city', 'district', 'gender', 'roomType', 'monthlyBudget', 'facilities', 'sort', 'university', 'campus'] as const) if (typeof raw[key] === 'string') result[key] = raw[key];
  for (const key of ['min', 'max', 'page', 'distance'] as const) { const value = Number(raw[key]); if (raw[key] !== undefined && Number.isFinite(value)) result[key] = value; }
  return result;
}
export const splitFilter = (value?: string) => value?.split(',').filter(Boolean) ?? [];
export function priceBounds(inventory: Residence[]) {
  const prices = inventory.flatMap(item => item.currency === 'USD' ? item.rooms.map(room => room.price) : []);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
}
export function selectedPriceRange(search: ResultsSearch, bounds: { min: number; max: number }) {
  const budget = search.monthlyBudget;
  const floor = budget === 'between300and600' ? 300 : budget === 'between600and1000' ? 600 : budget === 'above1000' ? 1001 : bounds.min;
  const ceiling = budget === 'under300' ? 299 : budget === 'between300and600' ? 600 : budget === 'between600and1000' ? 1000 : bounds.max;
  const min = Math.max(bounds.min, Math.min(bounds.max, search.min ?? floor));
  return { min, max: Math.max(min, Math.min(bounds.max, search.max ?? ceiling)) };
}
function withinBudget(price: number, budget?: string) {
  switch (budget) { case 'under300': return price < 300; case 'between300and600': return price >= 300 && price <= 600; case 'between600and1000': return price >= 600 && price <= 1000; case 'above1000': return price > 1000; default: return true; }
}
export function matchingRooms(residence: Residence, search: ResultsSearch, reference = false): Room[] {
  if (residence.currency !== 'USD' || (search.city && search.city !== 'istanbul')) return [];
  if (search.district && search.district !== 'all' && residence.district !== search.district) return [];
  const genders = splitFilter(search.gender), types = splitFilter(search.roomType), facilities = splitFilter(search.facilities);
  if (genders.length && !genders.includes(residence.genderKey === 'search.male' ? 'male' : 'female')) return [];
  if (!facilities.every(facility => residence.facilities.includes(facility as Facility))) return [];
  // Only verified campus and residence coordinates may place a residence near a university.
  if (search.university && residenceDistance(residence, search) == null) return [];
  if (search.distance && (residenceDistance(residence, search) ?? Infinity) > search.distance) return [];
  return residence.rooms.filter(room => (room.availability === 'available' || room.availability === 'limited' || (reference && room.availability === 'unconfirmed')) && (!types.length || types.includes(room.type)) && withinBudget(room.price, search.monthlyBudget) && room.price >= (search.min ?? -Infinity) && room.price <= (search.max ?? Infinity)).sort((a, b) => a.price - b.price);
}
export function residenceDistance(residence: Residence, search: ResultsSearch) {
  const campus = campusCoordinates(search.university, search.campus);
  return campus && residence.coordinates ? distanceKm(campus, residence.coordinates) : null;
}
export function filterResults(inventory: Residence[], search: ResultsSearch) {
  const matches = inventory.flatMap(residence => { const room = matchingRooms(residence, search)[0]; return room ? [{ residence, room }] : []; });
  if (search.university) matches.sort((a, b) => (residenceDistance(a.residence, search) ?? Infinity) - (residenceDistance(b.residence, search) ?? Infinity));
  if (search.sort === 'low') matches.sort((a, b) => a.room.price - b.room.price);
  if (search.sort === 'high') matches.sort((a, b) => b.room.price - a.room.price);
  return matches;
}
export function paginateResults<T>(items: T[], requested = 1, pageSize = 4) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.max(1, Math.min(pages, Math.floor(requested)));
  return { page, pages, items: items.slice((page - 1) * pageSize, page * pageSize) };
}