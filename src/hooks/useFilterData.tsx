import { useState } from 'react';
import { demoFilterData } from '@/data/demoData';

export interface FilterOption {
  id: number;
  key: string;
  name: string;
  title?: string;
  code?: string;
  count?: number;
}

export interface FilterData {
  countries: FilterOption[];
  StudyingField: FilterOption[];
  StudyingDegrees: FilterOption[];
  ProgramIntake: FilterOption[];
  UniversityName: FilterOption[];
  languages: FilterOption[];
}

// Demo mode: no network requests
export const useFilterData = () => {
  const [filterData] = useState<FilterData | null>(demoFilterData);
  return { filterData, isLoading: false, error: null as string | null };
};
