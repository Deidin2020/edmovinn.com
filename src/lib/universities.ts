import { ISTANBUL_UNIVERSITIES } from './istanbul-universities';

// Campus coordinates are added only from verified sources; without them no distance or "nearby" claim is made.
export interface Campus { id: string; name: string; coordinates?: { lat: number; lng: number } }
export interface University { name: string; city: 'istanbul'; campuses: Campus[] }

const campusNames: Record<string, string[]> = {
  'Istanbul Technical University': ['Ayazağa', 'Gümüşsuyu', 'Maçka', 'Taşkışla', 'Tuzla'],
  'Boğaziçi University': ['South Campus', 'North Campus', 'Hisar', 'Uçaksavar', 'Kilyos'],
  'Yıldız Technical University': ['Davutpaşa', 'Beşiktaş'],
};
const slug = (v: string) => v.toLocaleLowerCase('en').normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const universities: University[] = ISTANBUL_UNIVERSITIES.map(name => ({ name, city: 'istanbul', campuses: (campusNames[name] ?? []).map(c => ({ id: slug(c), name: c })) }));
export const featuredUniversityNames = ['Istanbul University', 'Istanbul Technical University', 'Boğaziçi University', 'Yıldız Technical University', 'Marmara University', 'Galatasaray University'];
export const featuredUniversities = featuredUniversityNames.flatMap(n => universities.filter(u => u.name === n));
export function findUniversity(name?: string) { return name ? universities.find(u => u.name === name) : undefined; }
export function searchUniversities(query: string, list = universities) {
  const q = query.trim().toLocaleLowerCase('tr');
  return q ? list.filter(u => u.name.toLocaleLowerCase('tr').includes(q)) : list;
}
/** Coordinates of the chosen campus, or of a single-location university; null when unknown or campus not chosen. */
export function campusCoordinates(universityName?: string, campusId?: string) {
  const u = findUniversity(universityName); if (!u) return null;
  if (u.campuses.length > 1) return u.campuses.find(c => c.id === campusId)?.coordinates ?? null;
  return u.campuses[0]?.coordinates ?? null;
}
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (d: number) => (d * Math.PI) / 180; const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
