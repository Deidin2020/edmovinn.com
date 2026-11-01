import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Maximize, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface Accommodation {
  id: string;
  title: string;
  location: string;
  size: string;
  availableFrom: string;
  price: string;
  deposit: string;
  contractType: string;
  genderType: "female" | "male" | "mixed";
  amenities: string[];
  image: string;
}

interface AccommodationCardProps {
  accommodation: Accommodation;
}

const getGenderBadgeColor = (type: "female" | "male" | "mixed") => {
  switch (type) {
    case "female":
      return "bg-accommodation-female text-accommodation-female-text";
    case "male":
      return "bg-accommodation-male text-accommodation-male-text";
    case "mixed":
      return "bg-accommodation-mixed text-accommodation-mixed-text";
  }
};

const getGenderText = (type: "female" | "male" | "mixed") => {
  switch (type) {
    case "female":
      return "Females accommodation";
    case "male":
      return "Males accommodation";
    case "mixed":
      return "Mixed accommodation";
  }
};

export const AccommodationCard = ({ accommodation }: AccommodationCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleBookNow = () => {
    const priceNumber = parseInt(accommodation.price.replace(/[^0-9]/g, ''));
    const depositNumber = parseInt(accommodation.deposit.replace(/[^0-9]/g, ''));
    
    addToCart({
      id: accommodation.id,
      title: accommodation.title,
      location: accommodation.location,
      price: priceNumber,
      deposit: depositNumber,
      image: accommodation.image
    });

    toast({
      title: "Added to Cart",
      description: `${accommodation.title} has been added to your cart.`,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={accommodation.image}
          alt={accommodation.title}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <Badge
          className={`absolute top-2 left-2 text-xs ${getGenderBadgeColor(accommodation.genderType)}`}
        >
          {getGenderText(accommodation.genderType)}
        </Badge>
      </div>
      
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 line-clamp-2">{accommodation.title}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground text-xs">Location</span>
          </div>
          <div className="flex items-center gap-1 sm:hidden">
            <Maximize className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground text-xs">Size</span>
          </div>
          <div className="flex items-center gap-1 sm:hidden">
            <Calendar className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-green-600 text-xs">Available From</span>
          </div>
          
          <div className="font-medium text-sm">{accommodation.location}</div>
          
          {/* Hidden on mobile, shown on larger screens */}
          <div className="hidden sm:flex items-center gap-1">
            <Maximize className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Size</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Available From</span>
          </div>
          
          <div className="font-medium text-sm sm:hidden">{accommodation.size}</div>
          <div className="font-medium text-sm sm:hidden">{accommodation.availableFrom}</div>
          
          <div className="hidden sm:block font-medium">{accommodation.size}</div>
          <div className="hidden sm:block font-medium">{accommodation.availableFrom}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">Price</span>
            <span className="font-bold text-base sm:text-lg">{accommodation.price}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Deposit</span>
            <span className="font-medium text-sm">{accommodation.deposit}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Contract</span>
            <span className="font-medium text-sm truncate">{accommodation.contractType}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {accommodation.amenities.slice(0, 3).map((amenity, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-amenity-tag text-amenity-text text-xs px-2 py-1"
            >
              {amenity}
            </Badge>
          ))}
          {accommodation.amenities.length > 3 && (
            <Badge
              variant="secondary" 
              className="bg-amenity-tag text-amenity-text text-xs px-2 py-1"
            >
              +{accommodation.amenities.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to={`/room/${accommodation.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
              See More
            </Button>
          </Link>
          <Button 
            size="sm" 
            className="flex-1 text-xs sm:text-sm"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};