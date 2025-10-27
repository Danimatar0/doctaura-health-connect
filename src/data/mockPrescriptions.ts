import { Prescription } from "@/types";

export const mockPrescriptions: Prescription[] = [
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
  {
    id: "4",
    doctorId: "4",
    doctorName: "Dr. Karim Mansour",
    date: "2025-09-28",
    diagnosis: "Knee Pain - Post Injury",
    medications: [
      {
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "3 times daily",
        duration: "10 days",
        instructions: "Take with food to avoid stomach upset",
      },
    ],
    notes: "Physical therapy recommended twice a week",
  },
];
