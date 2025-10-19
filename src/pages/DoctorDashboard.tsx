import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Clock, DollarSign, Video, MapPin } from "lucide-react";
import { Appointment } from "@/types";

const DoctorDashboard = () => {
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      doctorId: "1",
      doctorName: "John Smith",
      specialty: "General Checkup",
      date: "2025-10-20",
      time: "09:00 AM",
      status: "upcoming",
      type: "in-person",
      location: "Clinic Room 1",
    },
    {
      id: "2",
      doctorId: "1",
      doctorName: "Sarah Williams",
      specialty: "Follow-up",
      date: "2025-10-20",
      time: "10:00 AM",
      status: "upcoming",
      type: "video",
    },
    {
      id: "3",
      doctorId: "1",
      doctorName: "Mike Johnson",
      specialty: "Consultation",
      date: "2025-10-20",
      time: "11:00 AM",
      status: "upcoming",
      type: "in-person",
      location: "Clinic Room 2",
    },
  ]);

  const todayAppointments = appointments.filter(a => a.status === 'upcoming');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Manage your appointments and patients</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayAppointments.length}</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary/10 text-secondary w-12 h-12 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 text-accent w-12 h-12 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">32</p>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-destructive/10 text-destructive w-12 h-12 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">$2.4k</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                      <TabsTrigger value="all">All ({todayAppointments.length})</TabsTrigger>
                      <TabsTrigger value="in-person">In-Person</TabsTrigger>
                      <TabsTrigger value="video">Video</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-4">
                      {todayAppointments.map((apt) => (
                        <Card key={apt.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-lg">{apt.doctorName}</h4>
                                <p className="text-primary">{apt.specialty}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{apt.time}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                  apt.type === 'video' 
                                    ? 'bg-secondary/10 text-secondary' 
                                    : 'bg-accent/10 text-accent'
                                }`}>
                                  {apt.type === 'video' ? (
                                    <span className="flex items-center gap-1">
                                      <Video className="h-3 w-3" />
                                      Video
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      In-Person
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                            {apt.location && (
                              <p className="text-sm text-muted-foreground mb-4">
                                Location: {apt.location}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" className="gradient-hero text-white">
                                Start Consultation
                              </Button>
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                              <Button size="sm" variant="outline">
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="in-person" className="space-y-4">
                      {todayAppointments
                        .filter(apt => apt.type === 'in-person')
                        .map((apt) => (
                          <Card key={apt.id} className="border-l-4 border-l-primary">
                            <CardContent className="pt-6">
                              <h4 className="font-bold text-lg mb-2">{apt.doctorName}</h4>
                              <p className="text-sm text-muted-foreground">{apt.time} - {apt.location}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="video" className="space-y-4">
                      {todayAppointments
                        .filter(apt => apt.type === 'video')
                        .map((apt) => (
                          <Card key={apt.id} className="border-l-4 border-l-secondary">
                            <CardContent className="pt-6">
                              <h4 className="font-bold text-lg mb-2">{apt.doctorName}</h4>
                              <p className="text-sm text-muted-foreground">{apt.time} - Video Call</p>
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
                  <Button className="w-full gradient-hero text-white">
                    Add Appointment
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Schedule
                  </Button>
                  <Button variant="outline" className="w-full">
                    Patient Records
                  </Button>
                  <Button variant="outline" className="w-full">
                    Manage Availability
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monday</span>
                      <span className="font-medium">8 appointments</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tuesday</span>
                      <span className="font-medium">6 appointments</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Wednesday</span>
                      <span className="font-medium">10 appointments</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Thursday</span>
                      <span className="font-medium">5 appointments</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Friday</span>
                      <span className="font-medium">3 appointments</span>
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

export default DoctorDashboard;
