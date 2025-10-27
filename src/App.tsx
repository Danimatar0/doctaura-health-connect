import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Doctor Routes */}
          <Route path="/doctors" element={<DoctorDirectory />} />
          <Route path="/doctors/:doctorId" element={<DoctorProfile />} />
          <Route path="/booking/:doctorId" element={<BookingPage />} />

          {/* Pharmacy Routes */}
          <Route path="/pharmacies" element={<PharmacyLocator />} />

          {/* Dashboard Routes */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
