import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

interface Dormitory {
  id: string;
  title: string;
  location: string;
  district: string;
  type: "male" | "female" | "mixed";
  image: string;
}

interface DormitoryCardProps {
  dormitory: Dormitory;
}

export const DormitoryCard = ({ dormitory }: DormitoryCardProps) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "female":
        return "bg-accommodation-female text-accommodation-female-text";
      case "male":
        return "bg-accommodation-male text-accommodation-male-text";
      case "mixed":
        return "bg-accommodation-mixed text-accommodation-mixed-text";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Link 
      to={`/dormitory/${dormitory.id}`}
      className="block hover:scale-105 transition-transform duration-200"
    >
      <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={dormitory.image}
                alt={dormitory.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground mb-1 flex-1">
                  {dormitory.title}
                </h3>
                <Badge 
                  className={`${getTypeStyles(dormitory.type)} ml-2 capitalize text-xs`}
                >
                  {dormitory.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-primary font-medium mb-1">
                <MapPin className="w-4 h-4" />
                <span>{dormitory.location}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {dormitory.district}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};