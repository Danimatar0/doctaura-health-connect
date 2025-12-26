import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { keycloakService } from "@/services/keycloakService";
import { patientDataService } from "@/services/patientDataService";
import { locationService } from "@/services/locationService";
import { useOnboardingConfig } from "@/hooks/useOnboardingConfig";
import { ApiError } from "@/api/mutator/customInstance";
import { AuthUser } from "@/types/auth.types";
import type { PatientDetailsDto } from "@/types/generated";
import EditProfileDialog from "@/components/EditProfileDialog";

// Gender enum to string mapping
const GenderDisplay: Record<number, string> = {
  0: "Male",
  1: "Female",
  2: "Other",
};

// Location names state
interface LocationNames {
  country: string | null;
  governorate: string | null;
  district: string | null;
  locality: string | null;
}

const PatientProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [patientData, setPatientData] = useState<PatientDetailsDto | null>(null);
  const [locationNames, setLocationNames] = useState<LocationNames>({
    country: null,
    governorate: null,
    district: null,
    locality: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Use cached onboarding config for countries and governorates
  const { data: configData } = useOnboardingConfig();

  useEffect(() => {
    const fetchProfileData = async () => {
      // Check if user is authenticated
      if (!keycloakService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get auth user from session
        const currentUser = keycloakService.getCurrentUser();
        setUser(currentUser);

        // Fetch patient details from API
        const patientDetails = await patientDataService.getPatientProfile();
        setPatientData(patientDetails);
      } catch (err) {
        console.error("Error fetching profile data:", err);

        // Handle 401 - redirect to login
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login");
          return;
        }

        setError("Oops, something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  // Resolve location names from cached config and API (for districts/localities)
  useEffect(() => {
    const resolveLocationNames = async () => {
      if (!patientData) return;

      const names: LocationNames = {
        country: null,
        governorate: null,
        district: null,
        locality: null,
      };

      // Get country name from cached config
      if (patientData.countryId && configData?.reference?.countries) {
        const country = configData.reference.countries.find(
          c => c.id === patientData.countryId
        );
        names.country = country?.name || null;
      }

      // Get governorate name from cached config
      if (patientData.governorateId && configData?.reference?.governorates) {
        const governorate = configData.reference.governorates.find(
          g => g.id === patientData.governorateId
        );
        names.governorate = governorate?.name || null;
      }

      // Fetch district name from API (dynamic, depends on governorate)
      if (patientData.districtId) {
        try {
          const location = await locationService.getLocationById(patientData.districtId);
          names.district = location?.name || null;
        } catch (e) {
          console.error("Failed to fetch district:", e);
        }
      }

      // Fetch locality name from API (dynamic, depends on district)
      if (patientData.localityId) {
        try {
          const location = await locationService.getLocationById(patientData.localityId);
          names.locality = location?.name || null;
        } catch (e) {
          console.error("Failed to fetch locality:", e);
        }
      }

      setLocationNames(names);
    };

    resolveLocationNames();
  }, [patientData, configData]);

  const handleProfileUpdated = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {error || "Oops, something went wrong. Please try again."}
            </h2>
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
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your personal information and settings
                </p>
              </div>
              <Button onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <div className="mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground break-all">{user.email}</span>
                  </div>
                  {(patientData?.phone || user.phone) && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{patientData?.phone || user.phone}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center gap-2 text-sm">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Email Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-500">Email Not Verified</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      First Name
                    </label>
                    <p className="mt-1 text-base">{patientData?.firstName || user.firstName || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Name
                    </label>
                    <p className="mt-1 text-base">{patientData?.lastName || user.lastName || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </label>
                    <p className="mt-1 text-base">{patientData?.email || user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </label>
                    <p className="mt-1 text-base">{patientData?.phone || user.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Gender
                    </label>
                    <p className="mt-1 text-base">
                      {patientData?.gender !== undefined
                        ? GenderDisplay[patientData.gender] || "Not provided"
                        : user.gender || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <p className="mt-1 text-base">
                      {patientData?.dateOfBirth
                        ? new Date(patientData.dateOfBirth).toLocaleDateString()
                        : user.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString()
                          : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Country
                    </label>
                    <p className="mt-1 text-base">{locationNames.country || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Governorate
                    </label>
                    <p className="mt-1 text-base">{locationNames.governorate || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      District
                    </label>
                    <p className="mt-1 text-base">{locationNames.district || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Locality
                    </label>
                    <p className="mt-1 text-base">{locationNames.locality || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information Card */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>
                  Your medical details and emergency contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Blood Type
                    </label>
                    <p className="mt-1 text-base">{patientData?.bloodType || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Allergies
                    </label>
                    <p className="mt-1 text-base">{patientData?.allergies || "None reported"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Chronic Conditions
                    </label>
                    <p className="mt-1 text-base">{patientData?.chronicConditions || "None reported"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Emergency Contact Name
                    </label>
                    <p className="mt-1 text-base">{patientData?.emergencyContactName || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Emergency Contact Phone
                    </label>
                    <p className="mt-1 text-base">{patientData?.emergencyContactPhone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Status
                    </label>
                    <p className="mt-1 text-base">
                      {patientData?.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-muted-foreground">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Edit Profile Dialog */}
      {user && (
        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={user}
          patientData={patientData}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default PatientProfile;
