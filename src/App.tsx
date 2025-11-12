import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";
import DoctorDirectory from "./pages/DoctorDirectory";
import DoctorProfile from "./pages/DoctorProfile";
import PharmacyLocator from "./pages/PharmacyLocator";
import BookingPage from "./pages/BookingPage";
import PatientDashboard from "./pages/PatientDashboard";
import MedicalRecords from "./pages/MedicalRecords";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientProfile from "./pages/PatientProfile";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import PatientAppointments from "./pages/PatientAppointments";
import DoctorAppointments from "./pages/DoctorAppointments";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import DoctorPrescriptions from "./pages/DoctorPrescriptions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Index />} />

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
                <Register />
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
          <Route path="/auth/callback" element={<AuthCallback />} />

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
                <MedicalRecords />
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
                <PatientPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/preferences"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <NotFound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <NotFound />
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
                <NotFound />
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
            path="/doctor/preferences"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <NotFound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <NotFound />
              </ProtectedRoute>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
