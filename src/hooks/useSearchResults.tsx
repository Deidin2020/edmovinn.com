import { demoRooms, demoAccommodations } from '@/data/demoData';
import { useState, useEffect } from 'react';

export interface Room {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  description: string;
  city: string;
  state: string;
  capacity: number;
  room_type: string;
  gender: string;
  university_name: string;
}

export interface Accommodation {
  id: number;
  name: string;
  slug: string;
  image: string;
  state: string;
  city: string;
  description: string;
  address: string;
  rating: number;
  price_range: string;
}

export interface PaginationInfo {
  has_more: boolean;
  current_page: number;
  next_page: number;
  prev_page: number;
  last_page: number;
  total_records: number;
}

export interface SearchResults {
  rooms: Room[];
  accommodations: Accommodation[];
  rooms_pagination: PaginationInfo;
  accommodations_pagination: PaginationInfo;
}

export interface SearchFilters {
  // Original search filters
  country?: string;
  studying_field?: string;
  studying_degree?: string;
  program_intake?: string;
  university_name?: string;
  language?: string;
  page?: number;
  per_page?: number;
  
  // New filter API parameters
  countryKeys?: string;
  universityKeys?: string;
  fees_from?: number;
  fees_to?: number;
  cityKeys?: string;
  reservationKeys?: string;
  roomKeys?: string;
  genderKeys?: string;

  // Control which endpoint to use
  useFilterAPI?: boolean;
}

export const useSearchResults = (filters: SearchFilters = {}) => {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (f: SearchFilters = {}) => {
    setIsLoading(true);
    setError(null);
    const ids = (v?: string) => (v ? String(v).split(',').map(Number).filter(Boolean) : []);
    const countries = ids(f.countryKeys);
    const unis = ids(f.universityKeys);
    const from = f.fees_from ? Number(f.fees_from) : 0;
    const to = f.fees_to ? Number(f.fees_to) : Infinity;
    const match = (x: { countryId: number; universityId: number }) =>
      (!countries.length || countries.includes(x.countryId)) &&
      (!unis.length || unis.includes(x.universityId));
    const rooms = demoRooms.filter((r) => match(r) && r.price >= from && r.price <= to);
    const accs = demoAccommodations.filter((a) => match(a) && a.minPrice <= to);
    const page = Number(f.page) || 1;
    const per = Number(f.per_page) || 12;
    const pag = (total: number): PaginationInfo => {
      const last = Math.max(1, Math.ceil(total / per));
      return {
        has_more: page < last,
        current_page: page,
        next_page: page < last ? page + 1 : 0,
        prev_page: page > 1 ? page - 1 : 0,
        last_page: last,
        total_records: total,
      };
    };
    const slice = <T,>(arr: T[]) => arr.slice((page - 1) * per, page * per);
    setResults({
      rooms: slice(rooms),
      accommodations: slice(accs),
      rooms_pagination: pag(rooms.length),
      accommodations_pagination: pag(accs.length),
    });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchResults(filters);
  }, []);

  return { 
    results, 
    isLoading, 
    error, 
    refetch: (newFilters?: SearchFilters) => fetchResults(newFilters || filters),
    fetchPage: (page: number) => fetchResults({ ...filters, page })
  };
};