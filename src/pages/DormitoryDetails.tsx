import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { MapPin, Building, Car, Utensils, Thermometer } from "lucide-react";
import room1 from "@/assets/room1.jpg";
import room2 from "@/assets/room2.jpg";

const dormitoryData: Record<string, any> = {
  "1": {
    title: "STUDENT ACCOMMODATION 1",
    country: "Turkey",
    city: "Adana", 
    district: "Çanillo",
    address: "University street building 1",
    description: "Description for accommodation 1",
    image: room1,
    facilities: [
      { name: "Parking", icon: Car, color: "bg-green-100 text-green-700" },
      { name: "Three meals", icon: Utensils, color: "bg-blue-100 text-blue-700" },
      { name: "Two meals", icon: Utensils, color: "bg-orange-100 text-orange-700" },
      { name: "Heating", icon: Thermometer, color: "bg-red-100 text-red-700" },
    ],
    reservationTypes: ["Quarterly", "Weekly", "Annual", "Monthly"],
    accommodationTypes: ["Mixed accommodation", "Males accommodation"],
  },
  // Add more dormitory data as needed
};

export default function DormitoryDetails() {
  const { id } = useParams();
  const dormitory = dormitoryData[id || "1"] || dormitoryData["1"];

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            {dormitory.title}
          </h1>
          
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{dormitory.country}, {dormitory.city}, {dormitory.district}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>{dormitory.address}</span>
            </div>
          </div>

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2">
            Apply Now
          </Button>
        </div>

        {/* About Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">About</CardTitle> 
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{dormitory.description}</p>
            <div className="w-full rounded-lg overflow-hidden">
              <img
                src={dormitory.image}
                alt={dormitory.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </CardContent>
        </Card>

        {/* Facilities Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dormitory.facilities.map((facility, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4">
                  <div className={`p-3 rounded-full mb-2 ${facility.color}`}>
                    <facility.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {facility.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reservation Types Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Reservation Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dormitory.reservationTypes.map((type, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="justify-center py-2 bg-secondary/50 text-secondary-foreground hover:bg-secondary/70"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accommodation Type Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Accommodation Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dormitory.accommodationTypes.map((type, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="justify-center py-2 border-primary/20 text-primary hover:bg-primary/10"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nearest Universities Section */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Nearest Universities To The Residence</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Card className="bg-white border-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Florida Atlantic University</h4>
                    <p className="text-sm text-muted-foreground">United States</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}