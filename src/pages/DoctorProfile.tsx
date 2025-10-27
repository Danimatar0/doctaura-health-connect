import { useParams, useNavigate } from "react-router-dom";
import { mockDoctors } from "@/data/mockDoctors";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  DollarSign,
  Calendar,
  GraduationCap,
  Briefcase,
  Languages,
  Clock,
  ArrowLeft,
} from "lucide-react";

const DoctorProfile = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const doctor = mockDoctors.find((d) => d.id === doctorId);

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Doctor Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The doctor profile you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate("/doctors")}>
                Back to Directory
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/doctors")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Doctor Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Profile Card */}
              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-32 h-32 rounded-xl object-cover flex-shrink-0"
                    />

                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
                      <p className="text-xl text-primary font-medium mb-4">
                        {doctor.specialty}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{doctor.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-accent fill-accent" />
                          <span className="font-medium text-foreground">
                            {doctor.rating}
                          </span>
                          <span>({doctor.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{doctor.experience} years experience</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                        <DollarSign className="h-6 w-6" />
                        <span>${doctor.price}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          / visit
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {doctor.about}
                  </p>
                </CardContent>
              </Card>

              {/* Education & Experience */}
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{doctor.education}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {doctor.experience} years in {doctor.specialty}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Languages */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availability.map((day) => (
                      <Badge
                        key={day}
                        variant="outline"
                        className="text-sm px-3 py-1"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-soft sticky top-24">
                <CardHeader>
                  <CardTitle>Book an Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Consultation Fee
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        ${doctor.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per visit
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate(`/booking/${doctor.id}`)}
                    className="w-full gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth"
                    size="lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>

                  <div className="pt-4 border-t space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Highly rated by {doctor.reviewCount} patients</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Available {doctor.availability.length} days a week</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Languages className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Speaks {doctor.languages.join(", ")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorProfile;
