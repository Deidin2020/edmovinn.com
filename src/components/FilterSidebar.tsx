import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFilterData } from "@/hooks/useFilterData";

interface FilterSidebarProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const FilterSidebar = ({ isVisible, onToggle }: FilterSidebarProps) => {
  const { filterData, isLoading, error } = useFilterData();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    countries: true,
    studyingField: true,
    studyingDegrees: true,
    programIntake: true,
    universityName: true,
    languages: true,
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    
    console.log('Filter changing:', key, value); // Debug log
    
    // Map to filter API parameters
    const mappedFilters: Record<string, string> = {};
    Object.entries(newFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) {
        switch (filterKey) {
          case 'country':
            // Find country ID from filterData
            const country = filterData?.countries?.find(c => c.key === filterValue);
            if (country) mappedFilters.countryKeys = String(country.id);
            break;
          case 'university_name':
            // Find university ID from filterData
            const university = filterData?.UniversityName?.find(u => u.key === filterValue);
            if (university) mappedFilters.universityKeys = String(university.id);
            break;
          default:
            mappedFilters[filterKey] = filterValue;
        }
      }
    });
    
    console.log('Mapped filters:', mappedFilters); // Debug log
    
    // Emit filter changes to parent component
    const filterChangeEvent = new CustomEvent('filtersChanged', { detail: mappedFilters });
    window.dispatchEvent(filterChangeEvent);
  };

  const toggleFilter = (filterName: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const FilterSection = ({ name, label, children }: { name: string; label: string; children: React.ReactNode }) => (
    <div className="border-b border-filter-border last:border-b-0">
      <button
        onClick={() => toggleFilter(name)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <Label className="font-medium cursor-pointer">{label}</Label>
        {expandedFilters[name] ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {expandedFilters[name] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  if (!isVisible) return null;

  return (
    <Card className="bg-filter-bg border-filter-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-filter-border">
          <h2 className="font-semibold text-lg">Filters</h2>
          <Button 
            variant="outline"
            size="sm" 
            onClick={onToggle}
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
          >
            Hide Filters
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading filters...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">
            <p>Failed to load filters</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="divide-y divide-filter-border">
            <FilterSection name="countries" label="Countries">
              <Select onValueChange={(value) => handleFilterChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {filterData?.countries?.map((country) => (
                    <SelectItem key={country.id} value={country.key}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            
            <FilterSection name="studyingField" label="Studying Field">
              <Select onValueChange={(value) => handleFilterChange('studying_field', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {filterData?.StudyingField?.map((field) => (
                    <SelectItem key={field.id} value={field.key}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            
            <FilterSection name="studyingDegrees" label="Studying Degrees">
              <Select onValueChange={(value) => handleFilterChange('studying_degree', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent>
                  {filterData?.StudyingDegrees?.map((degree) => (
                    <SelectItem key={degree.id} value={degree.key}>
                      {degree.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            
            <FilterSection name="programIntake" label="Program Intake">
              <Select onValueChange={(value) => handleFilterChange('program_intake', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intake" />
                </SelectTrigger>
                <SelectContent>
                  {filterData?.ProgramIntake?.map((intake) => (
                    <SelectItem key={intake.id} value={intake.key}>
                      {intake.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            
            <FilterSection name="universityName" label="University Name">
              <Select onValueChange={(value) => handleFilterChange('university_name', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {filterData?.UniversityName?.map((university) => (
                    <SelectItem key={university.id} value={university.key}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
            
            <FilterSection name="languages" label="Languages">
              <Select onValueChange={(value) => handleFilterChange('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {filterData?.languages?.map((language) => (
                    <SelectItem key={language.id} value={language.name.toLowerCase()}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>
          </div>
        )}
      </CardContent>
    </Card>
  );
};