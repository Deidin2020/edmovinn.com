import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSearchResults, SearchFilters } from "@/hooks/useSearchResults";
import { FilterSidebar } from "@/components/FilterSidebar";
import { MobileFilterSheet } from "@/components/MobileFilterSheet";
import room1 from "@/assets/room1.jpg";

export const SearchWithFilters = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { results, isLoading, error, refetch } = useSearchResults({ 
    ...filters, 
    page: currentPage,
    useFilterAPI: true,
  });

  // Listen for filter changes from child components
  useEffect(() => {
    const handleFilterChange = (event: CustomEvent) => {
      const newFilters = event.detail as SearchFilters;
      console.info('Filter changed:', newFilters); // Debug log
      setFilters(newFilters);
      setCurrentPage(1);
      refetch({ ...newFilters, page: 1, useFilterAPI: true });
    };

    window.addEventListener('filtersChanged', handleFilterChange as EventListener);
    
    return () => {
      window.removeEventListener('filtersChanged', handleFilterChange as EventListener);
    };
  }, [refetch]);

  // Re-fetch when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      refetch({ ...filters, page: currentPage, useFilterAPI: true });
    }
  }, [filters, currentPage, refetch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch({ ...filters, page, useFilterAPI: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rooms = results?.rooms || [];
  const accommodations = results?.accommodations || [];
  const roomsPagination = results?.rooms_pagination;
  const accommodationsPagination = results?.accommodations_pagination;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              isVisible={isFilterVisible}
              onToggle={() => setIsFilterVisible(!isFilterVisible)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <MobileFilterSheet
                open={isMobileFilterOpen}
                onOpenChange={setIsMobileFilterOpen}
              />
            </div>

            {/* Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Search Results</h1>
              <p className="text-muted-foreground">
                Found {(roomsPagination?.total_records || 0) + (accommodationsPagination?.total_records || 0)} results
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading results...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Failed to load results</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Rooms Section */}
                {rooms.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4">
                      Rooms ({roomsPagination?.total_records || 0})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {rooms.map((room) => (
                        <Link
                          key={room.id}
                          to={`/room/${room.slug || room.id}`}
                          className="block hover:scale-105 transition-transform duration-200"
                        >
                          <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                              <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                                <img
                                  src={room.image || room1}
                                  alt={room.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = room1;
                                  }}
                                />
                              </div>
                              <h3 className="text-lg font-semibold text-foreground mb-1">
                                {room.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {room.city}, {room.state}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-primary font-semibold">
                                  ${room.price}/month
                                </span>
                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                  {room.room_type}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Rooms Pagination */}
                    {roomsPagination && roomsPagination.last_page > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(roomsPagination.prev_page)}
                          disabled={!roomsPagination.prev_page}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <span className="text-sm text-muted-foreground px-4">
                          Page {roomsPagination.current_page} of {roomsPagination.last_page}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(roomsPagination.next_page)}
                          disabled={!roomsPagination.has_more}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </section>
                )}

                {/* Accommodations Section */}
                {accommodations.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4">
                      Accommodations ({accommodationsPagination?.total_records || 0})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {accommodations.map((accommodation) => (
                        <Link
                          key={accommodation.id}
                          to={`/dormitory/${accommodation.slug || accommodation.id}`}
                          className="block hover:scale-105 transition-transform duration-200"
                        >
                          <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={accommodation.image || room1}
                                    alt={accommodation.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = room1;
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-foreground mb-1">
                                    {accommodation.name}
                                  </h3>
                                  <p className="text-primary font-medium">
                                    {accommodation.city}, {accommodation.state}
                                  </p>
                                  {accommodation.rating && (
                                    <p className="text-sm text-muted-foreground">
                                      Rating: {accommodation.rating}/5
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {/* Accommodations Pagination */}
                    {accommodationsPagination && accommodationsPagination.last_page > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(accommodationsPagination.prev_page)}
                          disabled={!accommodationsPagination.prev_page}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <span className="text-sm text-muted-foreground px-4">
                          Page {accommodationsPagination.current_page} of {accommodationsPagination.last_page}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(accommodationsPagination.next_page)}
                          disabled={!accommodationsPagination.has_more}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </section>
                )}

                {/* No Results */}
                {rooms.length === 0 && accommodations.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};