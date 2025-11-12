import { useState, useEffect } from "react";
import PrescriptionsPage from "@/components/prescriptions/PrescriptionsPage";
import { Prescription } from "@/types";

// Mock data for doctor prescriptions - showing prescriptions they've issued
const mockDoctorPrescriptions: Prescription[] = [
  {
    id: "doc-1",
    doctorId: "current-doctor",
    doctorName: "Dr. Current User",
    date: "2025-01-12",
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
    id: "doc-2",
    doctorId: "current-doctor",
    doctorName: "Dr. Current User",
    date: "2025-01-10",
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
    notes: "Monitor blood pressure regularly. Schedule follow-up in 3 months",
  },
  {
    id: "doc-3",
    doctorId: "current-doctor",
    doctorName: "Dr. Current User",
    date: "2025-01-08",
    diagnosis: "Vitamin D Deficiency",
    medications: [
      {
        name: "Vitamin D3",
        dosage: "2000 IU",
        frequency: "Once daily",
        duration: "3 months",
        instructions: "Take with a meal containing fat for better absorption",
      },
    ],
    notes: "Recheck levels after 3 months",
  },
  {
    id: "doc-4",
    doctorId: "current-doctor",
    doctorName: "Dr. Current User",
    date: "2025-01-05",
    diagnosis: "Seasonal Allergies",
    medications: [
      {
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "As needed",
        instructions: "Take in the evening",
      },
      {
        name: "Fluticasone Nasal Spray",
        dosage: "2 sprays",
        frequency: "Once daily per nostril",
        duration: "As needed",
      },
    ],
    notes: "Use as needed during allergy season",
  },
  {
    id: "doc-5",
    doctorId: "current-doctor",
    doctorName: "Dr. Current User",
    date: "2024-12-28",
    diagnosis: "Lower Back Pain",
    medications: [
      {
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "3 times daily",
        duration: "10 days",
        instructions: "Take with food to avoid stomach upset",
      },
    ],
    notes: "Physical therapy recommended. Avoid heavy lifting",
  },
];

// Mock patient names mapping
const patientNames: Record<string, string> = {
  "doc-1": "Sarah Johnson",
  "doc-2": "Michael Chen",
  "doc-3": "Emma Davis",
  "doc-4": "James Wilson",
  "doc-5": "Lisa Anderson",
};

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setPrescriptions(mockDoctorPrescriptions);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Failed to load prescriptions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const getPatientName = (prescription: Prescription): string => {
    return patientNames[prescription.id] || "Unknown Patient";
  };

  return (
    <PrescriptionsPage
      prescriptions={prescriptions}
      loading={loading}
      error={error}
      showDoctor={false}
      showPatient={true}
      getPatientName={getPatientName}
      pageTitle="Issued Prescriptions"
      pageDescription="View and manage all prescriptions you've issued to patients"
    />
  );
};

export default DoctorPrescriptions;
