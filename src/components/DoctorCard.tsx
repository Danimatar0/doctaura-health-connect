import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign, Calendar } from "lucide-react";
import { Doctor } from "@/types";
import { useNavigate } from "react-router-dom";

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-soft hover:shadow-hover transition-smooth overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4 p-6">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1 truncate">{doctor.name}</h3>
            <p className="text-primary font-medium mb-2">{doctor.specialty}</p>
            
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span>{doctor.rating} ({doctor.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>${doctor.price}/visit</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {doctor.languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs bg-muted px-2 py-1 rounded-full"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:w-40">
            <Button
              onClick={() => navigate(`/booking/${doctor.id}`)}
              className="gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/doctors/${doctor.id}`)}
              className="w-full"
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
