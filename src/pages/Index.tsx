import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterSidebar } from "@/components/FilterSidebar";
import { MobileFilterSheet } from "@/components/MobileFilterSheet";
import { AccommodationCard } from "@/components/AccommodationCard";
import { DormitoryCard } from "@/components/DormitoryCard";
import room1 from "@/assets/room1.jpg";
import room2 from "@/assets/room2.jpg";
import { useSearchResults, SearchFilters } from "@/hooks/useSearchResults";

const accommodations = [
  {
    id: "1",
    title: "Student Accommodation 7 Room 3 in Accommodation 7",
    location: "Adana",
    size: "26.00m²",
    availableFrom: "2025-09-03",
    price: "$1,620",
    deposit: "$405",
    contractType: "Monthly",
    genderType: "female" as const,
    amenities: ["Heating", "Two meals", "Gym"],
    image: room1,
  },
  {
    id: "2",
    title: "Student Accommodation 8 Room 5 in Accommodation 8",
    location: "Adana",
    size: "33.00m²",
    availableFrom: "2025-09-03",
    price: "$1,129",
    deposit: "$282",
    contractType: "Monthly, Annual",
    genderType: "mixed" as const,
    amenities: ["Three meals", "Gym", "Air conditioning"],
    image: room2,
  },
  {
    id: "3",
    title: "Student Accommodation 9 Room 2 in Accommodation 9",
    location: "Adana",
    size: "28.00m²",
    availableFrom: "2025-09-15",
    price: "$1,450",
    deposit: "$362",
    contractType: "Monthly",
    genderType: "male" as const,
    amenities: ["Heating", "Two meals", "Laundry"],
    image: room1,
  },
  {
    id: "4",
    title: "Student Accommodation 10 Room 1 in Accommodation 10",
    location: "Adana",
    size: "30.00m²",
    availableFrom: "2025-10-01",
    price: "$1,320",
    deposit: "$330",
    contractType: "Annual",
    genderType: "female" as const,
    amenities: ["Heating", "Three meals", "WiFi", "Study Room"],
    image: room2,
  },
];

const dormitories = [
  {
    id: "1",
    title: "Student Accommodation 1",
    location: "Adana",
    district: "Küçükcekmece",
    type: "mixed" as const,
    image: room1,
  },
  {
    id: "2",
    title: "Student Accommodation 2", 
    location: "Adana",
    district: "Seyhan",
    type: "female" as const,
    image: room2,
  },
  {
    id: "3",
    title: "Student Accommodation 3",
    location: "Adana",
    district: "Yüreğir", 
    type: "male" as const,
    image: room1,
  },
  {
    id: "4",
    title: "Student Accommodation 4",
    location: "Adana",
    district: "Çukurova",
    type: "mixed" as const,
    image: room2,
  },
  {
    id: "5",
    title: "Student Accommodation 5",
    location: "Adana",
    district: "Sarıçam",
    type: "female" as const,
    image: room1,
  },
  {
    id: "6",
    title: "Student Accommodation 6",
    location: "Adana",
    district: "Ceyhan",
    type: "male" as const,
    image: room2,
  },
];

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Wire filters to API calls and display results
  const [filters, setFilters] = useState<SearchFilters>({});
  const { results, isLoading, error, refetch } = useSearchResults({ page: 1, useFilterAPI: true });

  useEffect(() => {
    const handleFilterChange = (event: CustomEvent) => {
      const newFilters = event.detail as SearchFilters;
      setFilters(newFilters);
      // Always use filter API when filters change
      refetch({ ...newFilters, page: 1, useFilterAPI: true });
    };

    window.addEventListener('filtersChanged', handleFilterChange as EventListener);
    return () => window.removeEventListener('filtersChanged', handleFilterChange as EventListener);
  }, [refetch]);

  // Use API results or fallback to static data
  const displayRooms = results?.rooms || accommodations;
  const displayAccommodations = results?.accommodations || dormitories;
  const totalResults = results?.rooms_pagination?.total_records || 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:block transition-all duration-300 ${showFilters ? 'w-80' : 'w-0'}`}>
          <div className="sticky top-0 p-6">
            <FilterSidebar 
              isVisible={showFilters} 
              onToggle={() => setShowFilters(false)} 
            />
          </div>
        </aside>
        
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Accommodations</h1>
              <p className="text-sm text-muted-foreground">
                Results ({totalResults}) {isLoading ? 'Loading...' : 'Room'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <div className="md:hidden">
                <MobileFilterSheet 
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                />
              </div>
              
              {/* Desktop Show Filters Button */}
              {!showFilters && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(true)}
                  className="hidden md:inline-flex text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Show Filters
                </Button>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="rooms" className="mb-4 sm:mb-6">
            <TabsList className="grid w-full max-w-xs sm:max-w-md grid-cols-2">
              <TabsTrigger 
                value="rooms" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
              >
                Rooms
              </TabsTrigger>
              <TabsTrigger value="accommodations" className="text-sm">
                Accommodations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="rooms" className="mt-4 sm:mt-6">
              {error ? (
                <div className="text-center p-8 text-destructive">
                  <p>Failed to load rooms: {error}</p>
                </div>
              ) : isLoading ? (
                <div className="text-center p-8">
                  <p>Loading rooms...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {displayRooms.map((room, index) => (
                    <AccommodationCard 
                      key={room.id || index} 
                      accommodation={{
                        id: room.id?.toString() || index.toString(),
                        title: room.name || `Room ${index + 1}`,
                        location: room.city || 'Unknown Location',
                        size: `${room.capacity || 1} Person${room.capacity > 1 ? 's' : ''}`,
                        availableFrom: "Available Now",
                        price: `$${room.price || 0}`,
                        deposit: `$${Math.round((room.price || 0) * 0.25)}`,
                        contractType: "Monthly",
                        genderType: (room.gender?.toLowerCase() as "male" | "female" | "mixed") || "mixed",
                        amenities: ["WiFi", "Furnished", "Security"],
                        image: room.image || room1,
                      }} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="accommodations" className="mt-4 sm:mt-6">
              {error ? (
                <div className="text-center p-8 text-destructive">
                  <p>Failed to load accommodations: {error}</p>
                </div>
              ) : isLoading ? (
                <div className="text-center p-8">
                  <p>Loading accommodations...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {displayAccommodations.map((accommodation, index) => (
                    <DormitoryCard 
                      key={accommodation.id || index} 
                      dormitory={{
                        id: accommodation.id?.toString() || index.toString(),
                        title: accommodation.name || `Accommodation ${index + 1}`,
                        location: accommodation.city || 'Unknown City',
                        district: accommodation.state || 'Unknown District',
                        type: "mixed" as const,
                        image: accommodation.image || room1,
                      }} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
