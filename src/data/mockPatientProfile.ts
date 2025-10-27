import { Patient } from "@/types";

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
