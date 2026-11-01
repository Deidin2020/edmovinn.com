import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFilterData } from "@/hooks/useFilterData";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileFilterSheet = ({ open, onOpenChange }: MobileFilterSheetProps) => {
  const { filterData, isLoading, error } = useFilterData();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    
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
    
    // Emit filter changes to parent component
    const filterChangeEvent = new CustomEvent('filtersChanged', { detail: mappedFilters });
    window.dispatchEvent(filterChangeEvent);
  };
  
  const FilterSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8 mt-6">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading filters...</span>
          </div>
        ) : error ? (
          <div className="p-4 mt-6 text-center text-destructive">
            <p>Failed to load filters</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            <FilterSection label="Countries">
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
            
            <FilterSection label="Studying Field">
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
            
            <FilterSection label="Studying Degrees">
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
            
            <FilterSection label="Program Intake">
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
            
            <FilterSection label="University Name">
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
            
            <FilterSection label="Languages">
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
            
            <div className="pt-4 space-y-2">
              <Button className="w-full">Apply Filters</Button>
              <Button variant="outline" className="w-full">Clear All</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};