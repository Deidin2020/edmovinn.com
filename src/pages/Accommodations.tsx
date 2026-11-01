import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSearchResults } from "@/hooks/useSearchResults";
import room1 from "@/assets/room1.jpg";

const Accommodations = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { results, isLoading, error, fetchPage } = useSearchResults({ page: currentPage });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading accommodations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Failed to load accommodations</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const accommodations = results?.accommodations || [];
  const pagination = results?.accommodations_pagination;

  return (
    <div className="min-h-screen bg-background p-8">      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Student Accommodations
          </h1>
          <p className="text-muted-foreground">
            Discover the best accommodations in the city ({pagination?.total_records || 0} results)
          </p>
        </div>

        {accommodations.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No accommodations found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
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

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.prev_page)}
                  disabled={!pagination.prev_page}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground px-4">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.next_page)}
                  disabled={!pagination.has_more}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Accommodations;