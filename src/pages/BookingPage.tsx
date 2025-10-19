import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mockDoctors } from "@/data/mockDoctors";
import { cn } from "@/lib/utils";
import { ArrowLeft, Video, MapPin } from "lucide-react";
import { toast } from "sonner";

const BookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const doctor = mockDoctors.find((d) => d.id === doctorId);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<"in-person" | "video">("in-person");

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    toast.success("Appointment booked successfully!");
    setTimeout(() => navigate("/patient-dashboard"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-bold mb-8">Book Appointment</h1>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 shadow-soft h-fit">
              <CardContent className="pt-6">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold mb-1">{doctor.name}</h3>
                <p className="text-primary font-medium mb-2">{doctor.specialty}</p>
                <p className="text-sm text-muted-foreground mb-2">{doctor.location}</p>
                <p className="text-lg font-bold text-accent">${doctor.price}/visit</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-soft">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Appointment Type
                  </Label>
                  <RadioGroup
                    value={appointmentType}
                    onValueChange={(value: any) => setAppointmentType(value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="in-person"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-smooth",
                        appointmentType === "in-person"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="in-person" id="in-person" />
                      <MapPin className="h-5 w-5" />
                      <span>In-Person</span>
                    </Label>
                    <Label
                      htmlFor="video"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-smooth",
                        appointmentType === "video"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="video" id="video" />
                      <Video className="h-5 w-5" />
                      <span>Video Call</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Select Date
                  </Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className={cn("rounded-md border shadow-soft pointer-events-auto")}
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Select Time
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "transition-smooth",
                          selectedTime === time && "gradient-hero text-white"
                        )}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full gradient-hero text-white shadow-soft hover:shadow-hover transition-smooth"
                  size="lg"
                >
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
