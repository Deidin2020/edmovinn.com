import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Maximize, Calendar, Users, Building2, Home } from "lucide-react";
import { AccommodationCard } from "@/components/AccommodationCard";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import room1 from "@/assets/room1.jpg";
import room2 from "@/assets/room2.jpg";

// Sample data - in a real app this would come from an API
const roomData = {
  id: "1",
  title: "Room 3 in Accommodation 7",
  location: "Downtown Campus",
  price: "$800/month",
  deposit: "$400",
  contractType: "Monthly",
  genderType: "mixed" as const,
  amenities: ["WiFi", "Desk", "Private Bathroom", "Air Conditioning", "Study Area"],
  image: room1,
  housingType: "Student Accommodation 3",
  roomType: "Couple room",
  accommodationType: "Monthly", 
  floor: "2",
  area: "25.00",
  community: "4",
  availableFrom: "2024-09-03",
  availableTo: "2024-09-03"
};

const similarRooms = [
  {
    id: "2",
    title: "Room 4 in Accommodation 7",
    location: "Downtown Campus", 
    size: "20 sqm",
    availableFrom: "Sep 5, 2024",
    price: "$750/month",
    deposit: "$375",
    contractType: "Monthly",
    genderType: "female" as const,
    amenities: ["WiFi", "Desk", "Shared Kitchen"],
    image: room2
  },
  {
    id: "3", 
    title: "Room 1 in Accommodation 5",
    location: "Campus North",
    size: "22 sqm", 
    availableFrom: "Sep 1, 2024",
    price: "$820/month",
    deposit: "$410", 
    contractType: "Semester",
    genderType: "male" as const,
    amenities: ["WiFi", "Private Bath", "Balcony"],
    image: room1
  },
  {
    id: "4",
    title: "Room 2 in Accommodation 3", 
    location: "West Campus",
    size: "28 sqm",
    availableFrom: "Aug 28, 2024", 
    price: "$900/month",
    deposit: "$450",
    contractType: "Monthly",
    genderType: "mixed" as const,
    amenities: ["WiFi", "Kitchenette", "Study Area"],
    image: room2
  }
];

const RoomDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleBookNow = () => {
    const priceNumber = parseInt(roomData.price.replace(/[^0-9]/g, ''));
    const depositNumber = parseInt(roomData.deposit.replace(/[^0-9]/g, ''));
    
    addToCart({
      id: roomData.id,
      title: roomData.title,
      location: roomData.location,
      price: priceNumber,
      deposit: depositNumber,
      image: roomData.image
    });

    toast({
      title: "Added to Cart",
      description: `${roomData.title} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with breadcrumb */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            Accommodations
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{roomData.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title and Book Now button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{roomData.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{roomData.location}</span>
            </div>
          </div>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
        </div>

        {/* Room Image */}
        <div className="mb-8">
          <img 
            src={roomData.image} 
            alt={roomData.title}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Room Summary */}
        <div className="bg-secondary/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Room Summary</h2>
          <p className="text-muted-foreground">
            Spacious room in {roomData.title.toLowerCase()} featuring modern amenities and comfortable living space. 
            Perfect for students looking for quality accommodation in a prime location.
          </p>
        </div>

        {/* About The Room */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">About The Room :</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Housing Type</span>
                </div>
                <span className="font-medium">{roomData.housingType}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Room Type</span>
                </div>
                <span className="font-medium">{roomData.roomType}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Accommodation Type</span>
                </div>
                <span className="font-medium">{roomData.accommodationType}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Floor</span>
                </div>
                <span className="font-medium">{roomData.floor}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Area</span>
                </div>
                <span className="font-medium">{roomData.area} sqm</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Community</span>
                </div>
                <span className="font-medium">{roomData.community}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground">Available From</span>
                </div>
                <span className="font-medium">{roomData.availableFrom}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span className="text-muted-foreground">Available To</span>
                </div>
                <span className="font-medium">{roomData.availableTo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Similar Rooms</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarRooms.map((room) => (
              <AccommodationCard key={room.id} accommodation={room} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;