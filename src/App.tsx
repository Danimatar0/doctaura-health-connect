import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeatureFlagsProvider } from "@/contexts/FeatureFlagsContext";
import { EncryptionProvider } from "@/contexts/EncryptionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import FeatureRoute from "@/components/FeatureRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoleSelection from "./pages/RoleSelection";
import DoctorRegister from "./pages/register/DoctorRegister";
import StaffRegister from "./pages/register/StaffRegister";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import DoctorDirectory from "./pages/DoctorDirectory";
import DoctorProfile from "./pages/DoctorProfile";
import PharmacyLocator from "./pages/PharmacyLocator";
import BookingPage from "./pages/BookingPage";
import PatientDashboard from "./pages/PatientDashboard";
import MedicalRecords from "./pages/MedicalRecords";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientProfile from "./pages/PatientProfile";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import ScheduleSettings from "./pages/ScheduleSettings";
import PatientAppointments from "./pages/PatientAppointments";
import DoctorAppointments from "./pages/DoctorAppointments";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import DoctorPrescriptions from "./pages/DoctorPrescriptions";
import Preferences from "./pages/Preferences";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EncryptionProvider>
      <FeatureFlagsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <Routes>
          {/* Public Landing Page - Redirects to dashboard if authenticated */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Index />
              </PublicRoute>
            }
          />

          {/* Authentication Routes - Redirect if already authenticated */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RoleSelection />
              </PublicRoute>
            }
          />
          <Route
            path="/register/patient"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/register/doctor"
            element={
              <PublicRoute>
                <DoctorRegister />
              </PublicRoute>
            }
          />
          <Route
            path="/register/staff"
            element={
              <PublicRoute>
                <StaffRegister />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Public Doctor/Pharmacy Routes */}
          <Route path="/doctors" element={<DoctorDirectory />} />
          <Route path="/doctors/:doctorId" element={<DoctorProfile />} />
          <Route path="/pharmacies" element={<PharmacyLocator />} />

          {/* Protected Booking Route - Requires Authentication */}
          <Route
            path="/booking/:doctorId"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Patient Routes - Only for patients */}
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-records"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <FeatureRoute
                  featureFlag="medicalRecords"
                  featureTitle="Medical Records"
                  featureDescription="Access to medical records is coming soon. You'll be able to view and manage your complete health history here."
                >
                  <MedicalRecords />
                </FeatureRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <FeatureRoute
                  featureFlag="prescriptions"
                  featureTitle="Prescriptions"
                  featureDescription="Access to prescriptions is coming soon. You'll be able to view and manage all your prescriptions here."
                >
                  <PatientPrescriptions />
                </FeatureRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <Preferences />
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Routes - Only for doctors */}
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <ScheduleSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <NotFound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <Preferences />
              </ProtectedRoute>
            }
          />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FeatureFlagsProvider>
    </EncryptionProvider>
  </QueryClientProvider>
);

export default App;
