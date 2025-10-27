import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Pill, User, Clock, MapPin, Video } from "lucide-react";
import { Appointment, Prescription } from "@/types";
import { useNavigate } from "react-router-dom";
import PrescriptionMedicineSearch from "@/components/PrescriptionMedicineSearch";

const PatientDashboard = () => {
  const navigate = useNavigate();

  // Mock patient data - in production, this would come from auth context or API
  const patientName = "Sarah";
  
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      doctorId: "1",
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "2025-10-25",
      time: "10:00 AM",
      status: "upcoming",
      type: "in-person",
      location: "Beirut Medical Center",
    },
    {
      id: "2",
      doctorId: "2",
      doctorName: "Dr. Ahmad Hassan",
      specialty: "Pediatrics",
      date: "2025-10-28",
      time: "02:00 PM",
      status: "upcoming",
      type: "video",
    },
    {
      id: "3",
      doctorId: "3",
      doctorName: "Dr. Maya Khalil",
      specialty: "Dermatology",
      date: "2025-10-15",
      time: "11:00 AM",
      status: "completed",
      type: "in-person",
      location: "Tripoli Clinic",
    },
  ]);

  const [prescriptions] = useState<Prescription[]>([
    {
      id: "1",
      doctorId: "3",
      doctorName: "Dr. Maya Khalil",
      date: "2025-10-15",
      diagnosis: "Bacterial Infection",
      medications: [
        {
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "3 times daily",
          duration: "7 days",
          instructions: "Take with food",
        },
        {
          name: "Paracetamol",
          dosage: "500mg",
          frequency: "As needed",
          duration: "5 days",
          instructions: "For fever or pain",
        },
      ],
      notes: "Complete the full course of antibiotics even if feeling better",
    },
    {
      id: "2",
      doctorId: "1",
      doctorName: "Dr. Sarah Johnson",
      date: "2025-10-10",
      diagnosis: "Hypertension",
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "Ongoing",
          instructions: "Take in the morning",
        },
      ],
      notes: "Monitor blood pressure regularly",
    },
    {
      id: "3",
      doctorId: "2",
      doctorName: "Dr. Ahmad Hassan",
      date: "2025-10-05",
      diagnosis: "Vitamin Deficiency",
      medications: [
        {
          name: "Vitamin D3",
          dosage: "1000 IU",
          frequency: "Once daily",
          duration: "3 months",
        },
        {
          name: "Multivitamin",
          dosage: "1 tablet",
          frequency: "Once daily",
          duration: "Ongoing",
        },
      ],
    },
  ]);

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
  const pastAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="text-primary">{patientName}</span>!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your health journey starts here. Stay on top of your appointments and wellness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary/10 text-secondary w-12 h-12 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 text-accent w-12 h-12 rounded-xl flex items-center justify-center">
                    <Pill className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{prescriptions.length}</p>
                    <p className="text-sm text-muted-foreground">Prescriptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-destructive/10 text-destructive w-12 h-12 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Doctors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>My Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upcoming">
                    <TabsList className="mb-6">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming" className="space-y-4">
                      {upcomingAppointments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No upcoming appointments
                        </p>
                      ) : (
                        upcomingAppointments.map((apt) => (
                          <Card key={apt.id} className="border-l-4 border-l-primary">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-lg">{apt.doctorName}</h4>
                                  <p className="text-primary">{apt.specialty}</p>
                                </div>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                  {apt.type === 'video' ? 'Video Call' : 'In-Person'}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(apt.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{apt.time}</span>
                                </div>
                                {apt.type === 'in-person' && apt.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{apt.location}</span>
                                  </div>
                                )}
                                {apt.type === 'video' && (
                                  <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    <span>Online consultation</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past" className="space-y-4">
                      {pastAppointments.map((apt) => (
                        <Card key={apt.id} className="opacity-75">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-lg">{apt.doctorName}</h4>
                                <p className="text-muted-foreground">{apt.specialty}</p>
                              </div>
                              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                                Completed
                              </span>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(apt.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => navigate('/doctors')}
                    className="w-full gradient-hero text-white"
                  >
                    Book New Appointment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/medical-records')}
                  >
                    View Medical Records
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/pharmacies')}
                  >
                    Find Pharmacy
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>My Prescriptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prescriptions.slice(0, 2).map((prescription) => (
                    <div key={prescription.id} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm mb-1">
                        {prescription.medications.map(m => m.name).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prescription.doctorName} - {new Date(prescription.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}

                  <PrescriptionMedicineSearch prescriptions={prescriptions} />
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

export default PatientDashboard;
