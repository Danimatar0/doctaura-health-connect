/**
 * Medical Records Page
 *
 * Comprehensive health profile management page with tabs for:
 * - Overview: Personal info, emergency contacts, allergies, conditions, medications
 * - Records: Medical records (visits, labs, imaging, etc.)
 * - Health Tracking: Vital signs charts and history
 * - History: Medical timeline, family history, vaccinations
 *
 * All sections controlled by feature flags for phased rollout.
 */

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  FileText,
  Activity,
  History,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Tab components
import {
  OverviewTab,
  RecordsTab,
  HealthTrackingTab,
  HistoryTab,
} from '@/components/medical-records';

// Services
import { medicalRecordsDataService } from '@/services/medicalRecordsDataService';
import { healthProfileDataService } from '@/services/healthProfileDataService';
import { useFeatureFlags } from '@/services/featureFlagsService';

// Types
import type { MedicalRecord } from '@/types';
import type {
  EmergencyContact,
  Allergy,
  ChronicCondition,
  CurrentMedication,
  HeightWeightReading,
  BloodPressureReading,
  BloodSugarReading,
  PastMedicalEvent,
  FamilyMedicalHistory,
  VaccinationRecord,
} from '@/types/healthProfile.types';
import type {
  EmergencyContactFormData,
  AllergyFormData,
  ChronicConditionFormData,
  CurrentMedicationFormData,
  HeightWeightFormData,
  BloodPressureFormData,
  BloodSugarFormData,
  PastMedicalEventFormData,
  FamilyMedicalHistoryFormData,
  VaccinationRecordFormData,
} from '@/schemas/healthProfile.schemas';

interface PatientInfo {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bloodType?: string;
  email?: string;
  phone?: string;
}

const MedicalRecords = () => {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Medical records state (existing functionality)
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  // Health profile state
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({});
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [chronicConditions, setChronicConditions] = useState<ChronicCondition[]>([]);
  const [medications, setMedications] = useState<CurrentMedication[]>([]);

  // Vital signs state
  const [heightWeightData, setHeightWeightData] = useState<HeightWeightReading[]>([]);
  const [bloodPressureData, setBloodPressureData] = useState<BloodPressureReading[]>([]);
  const [bloodSugarData, setBloodSugarData] = useState<BloodSugarReading[]>([]);

  // History state
  const [medicalHistory, setMedicalHistory] = useState<PastMedicalEvent[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyMedicalHistory[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          recordsData,
          profileData,
          contactsData,
          allergiesData,
          conditionsData,
          medicationsData,
          heightWeightResp,
          bloodPressureResp,
          bloodSugarResp,
          historyData,
          familyData,
          vaccinationsData,
        ] = await Promise.all([
          medicalRecordsDataService.getMedicalRecords(),
          healthProfileDataService.getHealthProfile(),
          healthProfileDataService.getEmergencyContacts(),
          healthProfileDataService.getAllergies(),
          healthProfileDataService.getChronicConditions(),
          healthProfileDataService.getCurrentMedications(),
          healthProfileDataService.getHeightWeightHistory(),
          healthProfileDataService.getBloodPressureHistory(),
          healthProfileDataService.getBloodSugarHistory(),
          healthProfileDataService.getPastMedicalHistory(),
          healthProfileDataService.getFamilyMedicalHistory(),
          healthProfileDataService.getVaccinationRecords(),
        ]);

        setRecords(recordsData);
        setPatientInfo(profileData);
        setEmergencyContacts(contactsData);
        setAllergies(allergiesData);
        setChronicConditions(conditionsData);
        setMedications(medicationsData);
        setHeightWeightData(heightWeightResp);
        setBloodPressureData(bloodPressureResp);
        setBloodSugarData(bloodSugarResp);
        setMedicalHistory(historyData);
        setFamilyHistory(familyData);
        setVaccinations(vaccinationsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load medical records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Generic handler wrapper for async operations
  const handleAsyncOperation = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      successMessage: string,
      errorMessage: string
    ): Promise<T | null> => {
      setIsSubmitting(true);
      try {
        const result = await operation();
        toast.success(successMessage);
        return result;
      } catch (err) {
        console.error(errorMessage, err);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  // Emergency Contact handlers
  const handleAddEmergencyContact = async (data: EmergencyContactFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addEmergencyContact(data),
      'Emergency contact added',
      'Failed to add emergency contact'
    );
    if (result) {
      setEmergencyContacts((prev) => [...prev, result]);
    }
  };

  const handleEditEmergencyContact = async (id: string, data: EmergencyContactFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateEmergencyContact(id, data),
      'Emergency contact updated',
      'Failed to update emergency contact'
    );
    if (result) {
      setEmergencyContacts((prev) => prev.map((c) => (c.id === id ? result : c)));
    }
  };

  const handleDeleteEmergencyContact = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteEmergencyContact(id),
      'Emergency contact deleted',
      'Failed to delete emergency contact'
    );
    if (success) {
      setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Allergy handlers
  const handleAddAllergy = async (data: AllergyFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addAllergy(data),
      'Allergy added',
      'Failed to add allergy'
    );
    if (result) {
      setAllergies((prev) => [...prev, result]);
    }
  };

  const handleEditAllergy = async (id: string, data: AllergyFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateAllergy(id, data),
      'Allergy updated',
      'Failed to update allergy'
    );
    if (result) {
      setAllergies((prev) => prev.map((a) => (a.id === id ? result : a)));
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteAllergy(id),
      'Allergy deleted',
      'Failed to delete allergy'
    );
    if (success) {
      setAllergies((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Chronic Condition handlers
  const handleAddCondition = async (data: ChronicConditionFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addChronicCondition(data),
      'Condition added',
      'Failed to add condition'
    );
    if (result) {
      setChronicConditions((prev) => [...prev, result]);
    }
  };

  const handleEditCondition = async (id: string, data: ChronicConditionFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateChronicCondition(id, data),
      'Condition updated',
      'Failed to update condition'
    );
    if (result) {
      setChronicConditions((prev) => prev.map((c) => (c.id === id ? result : c)));
    }
  };

  const handleDeleteCondition = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteChronicCondition(id),
      'Condition deleted',
      'Failed to delete condition'
    );
    if (success) {
      setChronicConditions((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Medication handlers
  const handleAddMedication = async (data: CurrentMedicationFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addCurrentMedication(data),
      'Medication added',
      'Failed to add medication'
    );
    if (result) {
      setMedications((prev) => [...prev, result]);
    }
  };

  const handleEditMedication = async (id: string, data: CurrentMedicationFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateCurrentMedication(id, data),
      'Medication updated',
      'Failed to update medication'
    );
    if (result) {
      setMedications((prev) => prev.map((m) => (m.id === id ? result : m)));
    }
  };

  const handleDeleteMedication = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteCurrentMedication(id),
      'Medication deleted',
      'Failed to delete medication'
    );
    if (success) {
      setMedications((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Height/Weight handlers
  const handleAddHeightWeight = async (data: HeightWeightFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addHeightWeightReading(data),
      'Reading added',
      'Failed to add reading'
    );
    if (result) {
      setHeightWeightData((prev) => [result, ...prev]);
    }
  };

  const handleEditHeightWeight = async (id: string, data: HeightWeightFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateHeightWeightReading(id, data),
      'Reading updated',
      'Failed to update reading'
    );
    if (result) {
      setHeightWeightData((prev) => prev.map((r) => (r.id === id ? result : r)));
    }
  };

  const handleDeleteHeightWeight = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteHeightWeightReading(id),
      'Reading deleted',
      'Failed to delete reading'
    );
    if (success) {
      setHeightWeightData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Blood Pressure handlers
  const handleAddBloodPressure = async (data: BloodPressureFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addBloodPressureReading(data),
      'Reading added',
      'Failed to add reading'
    );
    if (result) {
      setBloodPressureData((prev) => [result, ...prev]);
    }
  };

  const handleEditBloodPressure = async (id: string, data: BloodPressureFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateBloodPressureReading(id, data),
      'Reading updated',
      'Failed to update reading'
    );
    if (result) {
      setBloodPressureData((prev) => prev.map((r) => (r.id === id ? result : r)));
    }
  };

  const handleDeleteBloodPressure = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteBloodPressureReading(id),
      'Reading deleted',
      'Failed to delete reading'
    );
    if (success) {
      setBloodPressureData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Blood Sugar handlers
  const handleAddBloodSugar = async (data: BloodSugarFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addBloodSugarReading(data),
      'Reading added',
      'Failed to add reading'
    );
    if (result) {
      setBloodSugarData((prev) => [result, ...prev]);
    }
  };

  const handleEditBloodSugar = async (id: string, data: BloodSugarFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateBloodSugarReading(id, data),
      'Reading updated',
      'Failed to update reading'
    );
    if (result) {
      setBloodSugarData((prev) => prev.map((r) => (r.id === id ? result : r)));
    }
  };

  const handleDeleteBloodSugar = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteBloodSugarReading(id),
      'Reading deleted',
      'Failed to delete reading'
    );
    if (success) {
      setBloodSugarData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Past Medical Event handlers
  const handleAddMedicalEvent = async (data: PastMedicalEventFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addPastMedicalEvent(data),
      'Medical event added',
      'Failed to add medical event'
    );
    if (result) {
      setMedicalHistory((prev) => [...prev, result]);
    }
  };

  const handleEditMedicalEvent = async (id: string, data: PastMedicalEventFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updatePastMedicalEvent(id, data),
      'Medical event updated',
      'Failed to update medical event'
    );
    if (result) {
      setMedicalHistory((prev) => prev.map((e) => (e.id === id ? result : e)));
    }
  };

  const handleDeleteMedicalEvent = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deletePastMedicalEvent(id),
      'Medical event deleted',
      'Failed to delete medical event'
    );
    if (success) {
      setMedicalHistory((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Family History handlers
  const handleAddFamilyHistory = async (data: FamilyMedicalHistoryFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addFamilyMedicalHistory(data),
      'Family history added',
      'Failed to add family history'
    );
    if (result) {
      setFamilyHistory((prev) => [...prev, result]);
    }
  };

  const handleEditFamilyHistory = async (id: string, data: FamilyMedicalHistoryFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateFamilyMedicalHistory(id, data),
      'Family history updated',
      'Failed to update family history'
    );
    if (result) {
      setFamilyHistory((prev) => prev.map((f) => (f.id === id ? result : f)));
    }
  };

  const handleDeleteFamilyHistory = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteFamilyMedicalHistory(id),
      'Family history deleted',
      'Failed to delete family history'
    );
    if (success) {
      setFamilyHistory((prev) => prev.filter((f) => f.id !== id));
    }
  };

  // Vaccination handlers
  const handleAddVaccination = async (data: VaccinationRecordFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.addVaccinationRecord(data),
      'Vaccination record added',
      'Failed to add vaccination record'
    );
    if (result) {
      setVaccinations((prev) => [...prev, result]);
    }
  };

  const handleEditVaccination = async (id: string, data: VaccinationRecordFormData) => {
    const result = await handleAsyncOperation(
      () => healthProfileDataService.updateVaccinationRecord(id, data),
      'Vaccination record updated',
      'Failed to update vaccination record'
    );
    if (result) {
      setVaccinations((prev) => prev.map((v) => (v.id === id ? result : v)));
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    const success = await handleAsyncOperation(
      () => healthProfileDataService.deleteVaccinationRecord(id),
      'Vaccination record deleted',
      'Failed to delete vaccination record'
    );
    if (success) {
      setVaccinations((prev) => prev.filter((v) => v.id !== id));
    }
  };

  // Check which tabs should be visible based on feature flags
  const showOverviewTab =
    flags.healthProfileSection ||
    flags.allergiesSection ||
    flags.chronicConditionsSection ||
    flags.medicationsSection;
  const showHealthTrackingTab =
    flags.healthTrackingSection ||
    flags.heightWeightTracking ||
    flags.bloodPressureTracking ||
    flags.bloodSugarTracking;
  const showHistoryTab =
    flags.medicalHistorySection || flags.familyHistorySection || flags.vaccinationRecords;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Sidebar />
        <main className="flex-1 pt-24 pb-16 pl-64 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading medical records...</p>
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
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
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
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/patient-dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Medical Records</h1>
            <p className="text-muted-foreground">
              View and manage your complete health profile and medical history
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue={showOverviewTab ? 'overview' : 'records'} className="space-y-6">
            <TabsList className="h-auto flex-wrap">
              {showOverviewTab && (
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Overview
                </TabsTrigger>
              )}
              <TabsTrigger value="records" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Records
              </TabsTrigger>
              {showHealthTrackingTab && (
                <TabsTrigger value="tracking" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Health Tracking
                </TabsTrigger>
              )}
              {showHistoryTab && (
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            {showOverviewTab && (
              <TabsContent value="overview">
                <OverviewTab
                  patientInfo={patientInfo}
                  emergencyContacts={emergencyContacts}
                  allergies={allergies}
                  chronicConditions={chronicConditions}
                  medications={medications}
                  heightWeightData={heightWeightData}
                  bloodPressureData={bloodPressureData}
                  bloodSugarData={bloodSugarData}
                  medicalHistory={medicalHistory}
                  familyHistory={familyHistory}
                  vaccinations={vaccinations}
                  onAddEmergencyContact={handleAddEmergencyContact}
                  onEditEmergencyContact={handleEditEmergencyContact}
                  onDeleteEmergencyContact={handleDeleteEmergencyContact}
                  onAddAllergy={handleAddAllergy}
                  onEditAllergy={handleEditAllergy}
                  onDeleteAllergy={handleDeleteAllergy}
                  onAddCondition={handleAddCondition}
                  onEditCondition={handleEditCondition}
                  onDeleteCondition={handleDeleteCondition}
                  onAddMedication={handleAddMedication}
                  onEditMedication={handleEditMedication}
                  onDeleteMedication={handleDeleteMedication}
                  isLoading={isSubmitting}
                />
              </TabsContent>
            )}

            {/* Records Tab */}
            <TabsContent value="records">
              <RecordsTab records={records} isLoading={loading} />
            </TabsContent>

            {/* Health Tracking Tab */}
            {showHealthTrackingTab && (
              <TabsContent value="tracking">
                <HealthTrackingTab
                  heightWeightData={heightWeightData}
                  bloodPressureData={bloodPressureData}
                  bloodSugarData={bloodSugarData}
                  onAddHeightWeight={handleAddHeightWeight}
                  onEditHeightWeight={handleEditHeightWeight}
                  onDeleteHeightWeight={handleDeleteHeightWeight}
                  onAddBloodPressure={handleAddBloodPressure}
                  onEditBloodPressure={handleEditBloodPressure}
                  onDeleteBloodPressure={handleDeleteBloodPressure}
                  onAddBloodSugar={handleAddBloodSugar}
                  onEditBloodSugar={handleEditBloodSugar}
                  onDeleteBloodSugar={handleDeleteBloodSugar}
                  isLoading={isSubmitting}
                />
              </TabsContent>
            )}

            {/* History Tab */}
            {showHistoryTab && (
              <TabsContent value="history">
                <HistoryTab
                  medicalHistory={medicalHistory}
                  familyHistory={familyHistory}
                  vaccinations={vaccinations}
                  onAddMedicalEvent={handleAddMedicalEvent}
                  onEditMedicalEvent={handleEditMedicalEvent}
                  onDeleteMedicalEvent={handleDeleteMedicalEvent}
                  onAddFamilyHistory={handleAddFamilyHistory}
                  onEditFamilyHistory={handleEditFamilyHistory}
                  onDeleteFamilyHistory={handleDeleteFamilyHistory}
                  onAddVaccination={handleAddVaccination}
                  onEditVaccination={handleEditVaccination}
                  onDeleteVaccination={handleDeleteVaccination}
                  isLoading={isSubmitting}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MedicalRecords;
