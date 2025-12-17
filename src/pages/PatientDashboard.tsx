import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Pill, User, Clock, MapPin, Video, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { patientDataService } from "@/services/patientDataService";
import { ApiError } from "@/api/mutator/customInstance";
import { keycloakService } from "@/services/keycloakService";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import type { ApiFeatureFlags } from "@/services/featureFlagsService";
import type {
  PatientAppointmentsSummaryResponseDto,
  PatientAppointmentSummaryDto,
  PrescriptionSummaryDto,
} from "@/types/generated";
import { useToast } from "@/hooks/use-toast";

// Extended response type with feature flags
interface AppointmentsSummaryWithFlags extends PatientAppointmentsSummaryResponseDto {
  featureFlags?: ApiFeatureFlags;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { featureFlags, updateFeatureFlags } = useFeatureFlags();

  // State for appointments summary data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<AppointmentsSummaryWithFlags | null>(null);

  // Ref to prevent double-fetching in StrictMode
  const fetchedRef = useRef(false);

  // Fetch appointments summary on component mount
  useEffect(() => {
    // Prevent double-fetch in React StrictMode
    if (fetchedRef.current) return;

    const fetchAppointmentsSummary = async () => {
      // Check if user is authenticated
      if (!keycloakService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      fetchedRef.current = true;

      try {
        setLoading(true);
        setError(null);

        const data = await patientDataService.getAppointmentsSummary({
          includeCancelled: false,
        });

        setSummaryData(data);

        // Update feature flags in context (will also cache them)
        const apiFlags = (data as AppointmentsSummaryWithFlags).featureFlags;
        console.log('[PatientDashboard] Raw API response featureFlags:', JSON.stringify(apiFlags));
        updateFeatureFlags(apiFlags);
      } catch (err: unknown) {
        console.error("Error fetching appointments summary:", err);
        fetchedRef.current = false; // Allow retry on error

        // Handle 401 specially - redirect to login
        if (err instanceof ApiError && err.status === 401) {
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/login"), 2000);
        }

        setError("Oops, something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsSummary();
  }, [navigate, toast, updateFeatureFlags]);

  // Extract data from summary
  const patientName = summaryData?.patientName || "Patient";
  const upcomingAppointments = summaryData?.upcomingAppointments || [];
  const recentAppointments = summaryData?.recentAppointments || [];
  const prescriptions = summaryData?.prescriptions || [];
  const statistics = summaryData?.statistics;

  // Feature flags from context (cached globally)
  const showPrescriptions = featureFlags.prescriptions;
  const showMedicalRecords = featureFlags.medicalRecords;
  const showTelemedicine = featureFlags.telemedicine;
  const showPharmacyFinder = featureFlags.pharmacyFinder;

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
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{error}</h2>
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
              Welcome back, <span className="text-primary">{patientName}</span>!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your health journey starts here. Stay on top of your appointments and wellness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {showMedicalRecords && (
              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary/10 text-secondary w-12 h-12 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{statistics?.medicalRecordsCount ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showPrescriptions && (
              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/10 text-accent w-12 h-12 rounded-xl flex items-center justify-center">
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{statistics?.prescriptionsCount ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-destructive/10 text-destructive w-12 h-12 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statistics?.topProviders?.length ?? 0}</p>
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
                        upcomingAppointments.map((apt: PatientAppointmentSummaryDto) => (
                          <Card key={apt.id} className="border-l-4 border-l-primary">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-lg">{apt.doctorFullName}</h4>
                                  <p className="text-primary">{apt.statusDisplayName}</p>
                                </div>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                  {apt.appointmentType === 1 ? 'Video Call' : 'In-Person'}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {apt.appointmentType === 1 ? (
                                    <>
                                      <Video className="h-4 w-4" />
                                      <span>Online consultation</span>
                                    </>
                                  ) : (
                                    <>
                                      <MapPin className="h-4 w-4" />
                                      <span>In-person visit</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-4">
                      {recentAppointments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No past appointments
                        </p>
                      ) : (
                        recentAppointments.map((apt: PatientAppointmentSummaryDto) => (
                          <Card key={apt.id} className="opacity-75">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-lg">{apt.doctorFullName}</h4>
                                  <p className="text-muted-foreground">{apt.statusDisplayName}</p>
                                </div>
                                <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                                  {apt.statusDisplayName || 'Completed'}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleDateString() : 'N/A'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
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
                  {showMedicalRecords && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/medical-records')}
                    >
                      View Medical Records
                    </Button>
                  )}
                  {showPharmacyFinder && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/pharmacies')}
                    >
                      Find Pharmacy
                    </Button>
                  )}
                </CardContent>
              </Card>

              {showPrescriptions && (
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>My Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {prescriptions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        No prescriptions yet
                      </p>
                    ) : (
                      prescriptions.slice(0, 2).map((prescription: PrescriptionSummaryDto) => (
                        <div key={prescription.id} className="p-3 bg-muted rounded-lg">
                          <p className="font-medium text-sm mb-1">
                            {prescription.medicines?.map(m => m.name).join(', ') || prescription.content || 'Prescription'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {prescription.doctorName} - {prescription.dateIssued ? new Date(prescription.dateIssued).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
