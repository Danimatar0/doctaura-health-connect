import { useState, useEffect } from "react";
import PrescriptionsPage from "@/components/prescriptions/PrescriptionsPage";
import { patientDataService } from "@/services/patientDataService";
import { Prescription } from "@/types";

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await patientDataService.getPrescriptions();
        setPrescriptions(data);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Failed to load prescriptions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  return (
    <PrescriptionsPage
      prescriptions={prescriptions}
      loading={loading}
      error={error}
      showDoctor={true}
      showPatient={false}
      pageTitle="My Prescriptions"
      pageDescription="View and manage all your medical prescriptions and medications"
    />
  );
};

export default PatientPrescriptions;
