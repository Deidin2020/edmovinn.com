export const cities = ['istanbul'] as const;
export const roomTypes = ['single', 'double', 'triple', 'quadruple', 'studio'] as const;
export const budgetOptions = ['under300', 'between300and600', 'between600and1000', 'above1000'] as const;
export type SearchFilters = { city: string; gender: string; roomType: string; budget: string };
export const initialFilters: SearchFilters = { city: '', gender: '', roomType: '', budget: '' };
export function validateFilters(filters: SearchFilters): string | null {
  if (!cities.some(city => city === filters.city)) return 'search.cityRequired';
  if (filters.gender !== 'male' && filters.gender !== 'female') return 'search.genderRequired';
  return null;
}
export function prepareSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.city) params.set('city', filters.city);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.roomType) params.set('roomType', filters.roomType);
  if (filters.budget) params.set('monthlyBudget', filters.budget);
  params.set('currency', 'USD');
  return params;
}