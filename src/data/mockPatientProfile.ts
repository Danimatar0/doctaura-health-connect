import { Patient } from "@/types";
import { keycloakService } from "@/services/keycloakService";

// Get the mock patient profile, using authenticated user data when available
export const getMockPatientProfile = (): Patient => {
  const user = keycloakService.getCurrentUser();

  return {
    id: user?.id || "patient-001",
    name: user?.name || "Elias",
    email: user?.email || "hankselias5@gmail.com",
    phone: user?.phone || "+961 70 123 456",
    dateOfBirth: user?.dateOfBirth || "1990-05-15",
    medicalHistory: [
      "Hypertension (diagnosed 2023)",
      "Seasonal allergies",
      "Previous knee injury (2022)",
    ],
  };
};

// For backwards compatibility, export a default profile
export const mockPatientProfile: Patient = {
  id: "patient-001",
  name: "Elias",
  email: "hankselias5@gmail.com",
  phone: "+961 70 123 456",
  dateOfBirth: "1990-05-15",
  medicalHistory: [
    "Hypertension (diagnosed 2023)",
    "Seasonal allergies",
    "Previous knee injury (2022)",
  ],
};

// Dashboard statistics - these would typically be calculated from backend or aggregated data
export const mockDashboardStats = {
  recordsCount: 8,
  doctorsCount: 5,
};
