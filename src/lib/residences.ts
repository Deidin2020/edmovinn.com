import exterior from '@/assets/moveinn-exterior.webp.asset.json';
import twin from '@/assets/student-room-1.webp.asset.json';
import single from '@/assets/student-room-2.webp.asset.json';
import studio from '@/assets/student-room-3.webp.asset.json';
import shared from '@/assets/student-room-4.webp.asset.json';
import quadruplePhoto from '@/assets/moveinn-quadruple.webp.asset.json';

export type RoomType = 'single' | 'double' | 'triple' | 'quadruple' | 'studio';
export type Facility = 'wifi' | 'meals' | 'gym' | 'study' | 'common' | 'laundry' | 'cleaning' | 'security' | 'reception' | 'elevator' | 'buffet' | 'cafeteria' | 'heating' | 'library' | 'mosque' | 'receptionHall' | 'refrigerator' | 'sauna' | 'turkishBath';
export interface Room { id: string; type: RoomType; occupancy: number; image: string; price: number; availability: 'available' | 'limited' | 'unavailable' | 'unconfirmed'; amenities: string[]; nameKey?: string; area?: number; deposit?: number; availableFrom?: string; contract?: 'monthly'; bed?: string; suppliedPhoto?: boolean }
export interface Residence { slug: string; name: string; nameKey?: string; isMock: boolean; verified: boolean; locationKey: string; genderKey: 'search.male' | 'search.female'; descriptionKey: string; photos: string[]; facilities: Facility[]; currency: 'TRY' | 'USD'; rooms: Room[]; address?: string; coordinates?: { lat: number; lng: number }; universities: string[]; transport?: string }
const images = { single: single.url, double: twin.url, triple: shared.url, quadruple: shared.url, studio: studio.url };
function room(type: RoomType, price: number, availability: Room['availability'] = 'available'): Room {
  return { id: type, type, occupancy: type === 'studio' ? 1 : { single: 1, double: 2, triple: 3, quadruple: 4 }[type], image: images[type], price, availability, amenities: type === 'studio' ? ['kitchenette', 'bathroom', 'desk'] : ['desk', 'wardrobe', 'fridge'] };
}
export const moveinn: Residence = { slug: 'moveinn', name: 'Moveinn', isMock: false, verified: false, locationKey: 'details.moveinnLocation', genderKey: 'search.male', descriptionKey: 'details.moveinnDescription', photos: [exterior.url, single.url, twin.url, shared.url, studio.url], facilities: ['buffet', 'cafeteria', 'gym', 'heating', 'laundry', 'library', 'mosque', 'receptionHall', 'refrigerator', 'sauna', 'turkishBath', 'wifi'], currency: 'USD', rooms: [{ id: 'quadruple-70', type: 'quadruple', nameKey: 'details.quadruple70', occupancy: 4, image: quadruplePhoto.url, suppliedPhoto: true, price: 375, deposit: 750, area: 24.80, availableFrom: '2026-11-01', contract: 'monthly', availability: 'unconfirmed', amenities: ['laundry', 'wifi', 'gym'] }], address: 'Basın Ekspres, Küçükçekmece, Istanbul — opposite Mall of Istanbul', universities: [] };
const demos: Residence[] = [
  { id: 'twin', types: ['single', 'double'] as RoomType[], price: 420 },
  { id: 'single', types: ['single'] as RoomType[], price: 520 },
  { id: 'studio', types: ['studio', 'single'] as RoomType[], price: 620 },
  { id: 'shared', types: ['double', 'triple'] as RoomType[], price: 300 },
].map(({ id, types, price }) => ({ slug: `demo-${id}`, name: `Demo ${id}`, nameKey: `featured.demoNames.${id}`, isMock: true, verified: false, locationKey: 'details.istanbul', genderKey: id === 'single' || id === 'studio' ? 'search.female' as const : 'search.male' as const, descriptionKey: 'details.description', photos: [images[types[0] ?? 'single'], exterior.url, twin.url, single.url, studio.url], currency: 'USD', facilities: ['wifi'], rooms: types.map(type => room(type, price)), universities: [] }));
export function getResidence(slug: string) { return [moveinn, ...demos].find(item => item.slug === slug); }
export function startingPrice(residence: Residence) { return Math.min(...residence.rooms.map(item => item.price)); }
export function prepareRoomSelection(residence: Residence, roomId: string) {
  const selected = residence.rooms.find(item => item.id === roomId && item.availability !== 'unavailable');
  if (!selected) return null;
  return { residenceSlug: residence.slug, roomId: selected.id, roomType: selected.type, occupancy: selected.occupancy, monthlyPrice: selected.price, currency: residence.currency, isMock: residence.isMock };
}
export function canRequestBooking(residence: Residence) { return !residence.isMock && residence.verified; }

export function detailPreview(residence: Residence): Residence {
 return { ...residence, coordinates: residence.coordinates ?? { lat: 41.0628, lng: 28.8077 }, universities: residence.universities.length ? residence.universities : ['İstanbul Sabahattin Zaim University', 'İstanbul Aydın University'], transport: residence.transport ?? 'details.sampleTransport', rooms: residence.rooms.map(item => ({ ...item, area: item.area ?? 28, deposit: item.deposit ?? item.price * 2, availableFrom: item.availableFrom ?? '2026-11-01', contract: item.contract ?? 'monthly', bed: item.bed ?? 'details.sampleBed' })) };
}
