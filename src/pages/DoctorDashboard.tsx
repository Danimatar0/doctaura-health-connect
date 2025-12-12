import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Clock, DollarSign, Video, MapPin } from "lucide-react";
import { DoctorAppointment, DoctorStats, WeeklySchedule } from "@/types";
import { doctorDataService } from "@/services/doctorDataService";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  // State for all doctor data
  const [doctorName, setDoctorName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    todayAppointments: 0,
    totalPatients: 0,
    weekAppointments: 0,
    monthlyRevenue: 0,
  });
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>([]);

  // Fetch all doctor data on component mount
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [profile, appointmentsData, statsData, scheduleData] = await Promise.all([
          doctorDataService.getDoctorProfile(),
          doctorDataService.getAppointments(),
          doctorDataService.getStats(),
          doctorDataService.getWeeklySchedule(),
        ]);

        // Update state with fetched data
        setDoctorName(profile.name);
        setAppointments(appointmentsData);
        setStats(statsData);
        setWeeklySchedule(scheduleData);
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const todayAppointments = appointments.filter(a => a.status === 'upcoming');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Sidebar />

      <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Good day, <span className="text-primary">{doctorName}</span>!
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to make a difference today? Here's your schedule and patient overview.
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
                    <p className="text-2xl font-bold">{stats.totalPatients}</p>
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
                    <p className="text-2xl font-bold">{stats.weekAppointments}</p>
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
                    <p className="text-2xl font-bold">${(stats.monthlyRevenue / 1000).toFixed(1)}k</p>
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
                                <h4 className="font-bold text-lg">{apt.patientName}</h4>
                                <p className="text-primary">{apt.reason}</p>
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
                              <h4 className="font-bold text-lg mb-2">{apt.patientName}</h4>
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
                              <h4 className="font-bold text-lg mb-2">{apt.patientName}</h4>
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/doctor/schedule')}
                  >
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
                    {weeklySchedule
                      .filter(day => day.appointmentCount > 0)
                      .map((day, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{day.day}</span>
                          <span className="font-medium">
                            {day.appointmentCount} {day.appointmentCount === 1 ? 'appointment' : 'appointments'}
                          </span>
                        </div>
                      ))}
                    {weeklySchedule.filter(day => day.appointmentCount > 0).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No appointments scheduled this week
                      </p>
                    )}
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
