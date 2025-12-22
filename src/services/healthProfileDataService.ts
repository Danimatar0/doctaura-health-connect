/**
 * Health Profile Data Service
 *
 * Unified interface for health profile data operations with mock data fallback.
 * Handles: Emergency contacts, allergies, chronic conditions, medications,
 * vitals tracking, medical history, family history, and vaccination records.
 */

import { env } from '@/config/env';
import { customInstance } from '@/api/mutator/customInstance';
import type {
  PersonalHealthProfile,
  EmergencyContact,
  EmergencyContactInput,
  Allergy,
  AllergyInput,
  ChronicCondition,
  ChronicConditionInput,
  CurrentMedication,
  CurrentMedicationInput,
  HeightWeightReading,
  HeightWeightInput,
  BloodPressureReading,
  BloodPressureInput,
  BloodSugarReading,
  BloodSugarInput,
  PastMedicalEvent,
  PastMedicalEventInput,
  FamilyMedicalHistory,
  FamilyMedicalHistoryInput,
  VaccinationRecord,
  VaccinationRecordInput,
  ShareRecordRequest,
  SharedRecordInfo,
} from '@/types/healthProfile.types';
import {
  getMockHealthProfile,
  getMockEmergencyContacts,
  getMockAllergies,
  getMockChronicConditions,
  getMockCurrentMedications,
  getMockHeightWeightHistory,
  getMockBloodPressureHistory,
  getMockBloodSugarHistory,
  getMockPastMedicalHistory,
  getMockFamilyMedicalHistory,
  getMockVaccinationRecords,
  mockEmergencyContacts,
  mockAllergies,
  mockChronicConditions,
  mockCurrentMedications,
  mockHeightWeightHistory,
  mockBloodPressureHistory,
  mockBloodSugarHistory,
  mockPastMedicalHistory,
  mockFamilyMedicalHistory,
  mockVaccinationRecords,
} from '@/data/mockHealthProfile';

// ============================================================================
// Helpers
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const mockDelay = (ms: number = 150) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// Mock Data State (mutable for CRUD operations in dev mode)
// ============================================================================

let mockData = {
  emergencyContacts: [...mockEmergencyContacts],
  allergies: [...mockAllergies],
  chronicConditions: [...mockChronicConditions],
  currentMedications: [...mockCurrentMedications],
  heightWeightHistory: [...mockHeightWeightHistory],
  bloodPressureHistory: [...mockBloodPressureHistory],
  bloodSugarHistory: [...mockBloodSugarHistory],
  pastMedicalHistory: [...mockPastMedicalHistory],
  familyMedicalHistory: [...mockFamilyMedicalHistory],
  vaccinationRecords: [...mockVaccinationRecords],
};

// Reset mock data (useful for testing)
export const resetMockData = () => {
  mockData = {
    emergencyContacts: [...mockEmergencyContacts],
    allergies: [...mockAllergies],
    chronicConditions: [...mockChronicConditions],
    currentMedications: [...mockCurrentMedications],
    heightWeightHistory: [...mockHeightWeightHistory],
    bloodPressureHistory: [...mockBloodPressureHistory],
    bloodSugarHistory: [...mockBloodSugarHistory],
    pastMedicalHistory: [...mockPastMedicalHistory],
    familyMedicalHistory: [...mockFamilyMedicalHistory],
    vaccinationRecords: [...mockVaccinationRecords],
  };
};

// ============================================================================
// Health Profile Data Service
// ============================================================================

export const healthProfileDataService = {
  // ==========================================================================
  // Full Profile
  // ==========================================================================

  /**
   * Get complete health profile
   */
  getHealthProfile: async (): Promise<PersonalHealthProfile> => {
    if (env.features.useMockData) {
      return getMockHealthProfile();
    }
    return customInstance<PersonalHealthProfile>('/patients/health-profile', { method: 'GET' });
  },

  // ==========================================================================
  // Emergency Contacts
  // ==========================================================================

  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.emergencyContacts];
    }
    return customInstance<EmergencyContact[]>('/patients/emergency-contacts', { method: 'GET' });
  },

  addEmergencyContact: async (data: EmergencyContactInput): Promise<EmergencyContact> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newContact: EmergencyContact = { ...data, id: generateId() };
      // If setting as primary, unset others
      if (newContact.isPrimary) {
        mockData.emergencyContacts = mockData.emergencyContacts.map(c => ({ ...c, isPrimary: false }));
      }
      mockData.emergencyContacts.push(newContact);
      return newContact;
    }
    return customInstance<EmergencyContact>('/patients/emergency-contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEmergencyContact: async (id: string, data: EmergencyContactInput): Promise<EmergencyContact> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.emergencyContacts.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Contact not found');
      // If setting as primary, unset others
      if (data.isPrimary) {
        mockData.emergencyContacts = mockData.emergencyContacts.map(c => ({ ...c, isPrimary: false }));
      }
      const updated: EmergencyContact = { ...data, id };
      mockData.emergencyContacts[index] = updated;
      return updated;
    }
    return customInstance<EmergencyContact>(`/patients/emergency-contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEmergencyContact: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.emergencyContacts = mockData.emergencyContacts.filter(c => c.id !== id);
      return;
    }
    return customInstance<void>(`/patients/emergency-contacts/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Allergies
  // ==========================================================================

  getAllergies: async (): Promise<Allergy[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.allergies];
    }
    return customInstance<Allergy[]>('/patients/allergies', { method: 'GET' });
  },

  addAllergy: async (data: AllergyInput): Promise<Allergy> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newAllergy: Allergy = { ...data, id: generateId() };
      mockData.allergies.push(newAllergy);
      return newAllergy;
    }
    return customInstance<Allergy>('/patients/allergies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAllergy: async (id: string, data: AllergyInput): Promise<Allergy> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.allergies.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Allergy not found');
      const updated: Allergy = { ...data, id };
      mockData.allergies[index] = updated;
      return updated;
    }
    return customInstance<Allergy>(`/patients/allergies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAllergy: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.allergies = mockData.allergies.filter(a => a.id !== id);
      return;
    }
    return customInstance<void>(`/patients/allergies/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Chronic Conditions
  // ==========================================================================

  getChronicConditions: async (): Promise<ChronicCondition[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.chronicConditions];
    }
    return customInstance<ChronicCondition[]>('/patients/chronic-conditions', { method: 'GET' });
  },

  addChronicCondition: async (data: ChronicConditionInput): Promise<ChronicCondition> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newCondition: ChronicCondition = { ...data, id: generateId() };
      mockData.chronicConditions.push(newCondition);
      return newCondition;
    }
    return customInstance<ChronicCondition>('/patients/chronic-conditions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateChronicCondition: async (id: string, data: ChronicConditionInput): Promise<ChronicCondition> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.chronicConditions.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Condition not found');
      const updated: ChronicCondition = { ...data, id };
      mockData.chronicConditions[index] = updated;
      return updated;
    }
    return customInstance<ChronicCondition>(`/patients/chronic-conditions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteChronicCondition: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.chronicConditions = mockData.chronicConditions.filter(c => c.id !== id);
      return;
    }
    return customInstance<void>(`/patients/chronic-conditions/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Current Medications
  // ==========================================================================

  getCurrentMedications: async (): Promise<CurrentMedication[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.currentMedications];
    }
    return customInstance<CurrentMedication[]>('/patients/medications', { method: 'GET' });
  },

  addMedication: async (data: CurrentMedicationInput): Promise<CurrentMedication> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newMedication: CurrentMedication = { ...data, id: generateId() };
      mockData.currentMedications.push(newMedication);
      return newMedication;
    }
    return customInstance<CurrentMedication>('/patients/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMedication: async (id: string, data: CurrentMedicationInput): Promise<CurrentMedication> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.currentMedications.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Medication not found');
      const updated: CurrentMedication = { ...data, id };
      mockData.currentMedications[index] = updated;
      return updated;
    }
    return customInstance<CurrentMedication>(`/patients/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMedication: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.currentMedications = mockData.currentMedications.filter(m => m.id !== id);
      return;
    }
    return customInstance<void>(`/patients/medications/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Height/Weight Tracking
  // ==========================================================================

  getHeightWeightHistory: async (): Promise<HeightWeightReading[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.heightWeightHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return customInstance<HeightWeightReading[]>('/patients/vitals/height-weight', { method: 'GET' });
  },

  addHeightWeightReading: async (data: HeightWeightInput): Promise<HeightWeightReading> => {
    if (env.features.useMockData) {
      await mockDelay();
      const bmi = data.height && data.weight
        ? Math.round((data.weight / Math.pow(data.height / 100, 2)) * 10) / 10
        : undefined;
      const newReading: HeightWeightReading = {
        ...data,
        id: generateId(),
        recordedAt: new Date().toISOString(),
        bmi,
      };
      mockData.heightWeightHistory.push(newReading);
      return newReading;
    }
    return customInstance<HeightWeightReading>('/patients/vitals/height-weight', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateHeightWeightReading: async (id: string, data: HeightWeightInput): Promise<HeightWeightReading> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.heightWeightHistory.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Reading not found');
      const existing = mockData.heightWeightHistory[index];
      const bmi = data.height && data.weight
        ? Math.round((data.weight / Math.pow(data.height / 100, 2)) * 10) / 10
        : undefined;
      const updated: HeightWeightReading = {
        ...data,
        id,
        recordedAt: existing.recordedAt,
        bmi,
      };
      mockData.heightWeightHistory[index] = updated;
      return updated;
    }
    return customInstance<HeightWeightReading>(`/patients/vitals/height-weight/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteHeightWeightReading: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.heightWeightHistory = mockData.heightWeightHistory.filter(r => r.id !== id);
      return;
    }
    return customInstance<void>(`/patients/vitals/height-weight/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Blood Pressure Tracking
  // ==========================================================================

  getBloodPressureHistory: async (): Promise<BloodPressureReading[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.bloodPressureHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return customInstance<BloodPressureReading[]>('/patients/vitals/blood-pressure', { method: 'GET' });
  },

  addBloodPressureReading: async (data: BloodPressureInput): Promise<BloodPressureReading> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newReading: BloodPressureReading = {
        ...data,
        id: generateId(),
        recordedAt: new Date().toISOString(),
      };
      mockData.bloodPressureHistory.push(newReading);
      return newReading;
    }
    return customInstance<BloodPressureReading>('/patients/vitals/blood-pressure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBloodPressureReading: async (id: string, data: BloodPressureInput): Promise<BloodPressureReading> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.bloodPressureHistory.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Reading not found');
      const existing = mockData.bloodPressureHistory[index];
      const updated: BloodPressureReading = {
        ...data,
        id,
        recordedAt: existing.recordedAt,
      };
      mockData.bloodPressureHistory[index] = updated;
      return updated;
    }
    return customInstance<BloodPressureReading>(`/patients/vitals/blood-pressure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBloodPressureReading: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.bloodPressureHistory = mockData.bloodPressureHistory.filter(r => r.id !== id);
      return;
    }
    return customInstance<void>(`/patients/vitals/blood-pressure/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Blood Sugar Tracking
  // ==========================================================================

  getBloodSugarHistory: async (): Promise<BloodSugarReading[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.bloodSugarHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return customInstance<BloodSugarReading[]>('/patients/vitals/blood-sugar', { method: 'GET' });
  },

  addBloodSugarReading: async (data: BloodSugarInput): Promise<BloodSugarReading> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newReading: BloodSugarReading = {
        ...data,
        id: generateId(),
        recordedAt: new Date().toISOString(),
      };
      mockData.bloodSugarHistory.push(newReading);
      return newReading;
    }
    return customInstance<BloodSugarReading>('/patients/vitals/blood-sugar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBloodSugarReading: async (id: string, data: BloodSugarInput): Promise<BloodSugarReading> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.bloodSugarHistory.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Reading not found');
      const existing = mockData.bloodSugarHistory[index];
      const updated: BloodSugarReading = {
        ...data,
        id,
        recordedAt: existing.recordedAt,
      };
      mockData.bloodSugarHistory[index] = updated;
      return updated;
    }
    return customInstance<BloodSugarReading>(`/patients/vitals/blood-sugar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBloodSugarReading: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.bloodSugarHistory = mockData.bloodSugarHistory.filter(r => r.id !== id);
      return;
    }
    return customInstance<void>(`/patients/vitals/blood-sugar/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Past Medical History
  // ==========================================================================

  getPastMedicalHistory: async (): Promise<PastMedicalEvent[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.pastMedicalHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return customInstance<PastMedicalEvent[]>('/patients/medical-history', { method: 'GET' });
  },

  addPastMedicalEvent: async (data: PastMedicalEventInput): Promise<PastMedicalEvent> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newEvent: PastMedicalEvent = { ...data, id: generateId() };
      mockData.pastMedicalHistory.push(newEvent);
      return newEvent;
    }
    return customInstance<PastMedicalEvent>('/patients/medical-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePastMedicalEvent: async (id: string, data: PastMedicalEventInput): Promise<PastMedicalEvent> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.pastMedicalHistory.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Event not found');
      const updated: PastMedicalEvent = { ...data, id };
      mockData.pastMedicalHistory[index] = updated;
      return updated;
    }
    return customInstance<PastMedicalEvent>(`/patients/medical-history/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePastMedicalEvent: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.pastMedicalHistory = mockData.pastMedicalHistory.filter(e => e.id !== id);
      return;
    }
    return customInstance<void>(`/patients/medical-history/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Family Medical History
  // ==========================================================================

  getFamilyMedicalHistory: async (): Promise<FamilyMedicalHistory[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.familyMedicalHistory];
    }
    return customInstance<FamilyMedicalHistory[]>('/patients/family-history', { method: 'GET' });
  },

  addFamilyMedicalHistory: async (data: FamilyMedicalHistoryInput): Promise<FamilyMedicalHistory> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newEntry: FamilyMedicalHistory = { ...data, id: generateId() };
      mockData.familyMedicalHistory.push(newEntry);
      return newEntry;
    }
    return customInstance<FamilyMedicalHistory>('/patients/family-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFamilyMedicalHistory: async (id: string, data: FamilyMedicalHistoryInput): Promise<FamilyMedicalHistory> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.familyMedicalHistory.findIndex(h => h.id === id);
      if (index === -1) throw new Error('History entry not found');
      const updated: FamilyMedicalHistory = { ...data, id };
      mockData.familyMedicalHistory[index] = updated;
      return updated;
    }
    return customInstance<FamilyMedicalHistory>(`/patients/family-history/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFamilyMedicalHistory: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.familyMedicalHistory = mockData.familyMedicalHistory.filter(h => h.id !== id);
      return;
    }
    return customInstance<void>(`/patients/family-history/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Vaccination Records
  // ==========================================================================

  getVaccinationRecords: async (): Promise<VaccinationRecord[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      return [...mockData.vaccinationRecords].sort((a, b) =>
        new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime()
      );
    }
    return customInstance<VaccinationRecord[]>('/patients/vaccinations', { method: 'GET' });
  },

  addVaccinationRecord: async (data: VaccinationRecordInput): Promise<VaccinationRecord> => {
    if (env.features.useMockData) {
      await mockDelay();
      const newRecord: VaccinationRecord = { ...data, id: generateId() };
      mockData.vaccinationRecords.push(newRecord);
      return newRecord;
    }
    return customInstance<VaccinationRecord>('/patients/vaccinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateVaccinationRecord: async (id: string, data: VaccinationRecordInput): Promise<VaccinationRecord> => {
    if (env.features.useMockData) {
      await mockDelay();
      const index = mockData.vaccinationRecords.findIndex(v => v.id === id);
      if (index === -1) throw new Error('Vaccination record not found');
      const updated: VaccinationRecord = { ...data, id };
      mockData.vaccinationRecords[index] = updated;
      return updated;
    }
    return customInstance<VaccinationRecord>(`/patients/vaccinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteVaccinationRecord: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      mockData.vaccinationRecords = mockData.vaccinationRecords.filter(v => v.id !== id);
      return;
    }
    return customInstance<void>(`/patients/vaccinations/${id}`, { method: 'DELETE' });
  },

  // ==========================================================================
  // Sharing
  // ==========================================================================

  shareRecords: async (data: ShareRecordRequest): Promise<SharedRecordInfo> => {
    if (env.features.useMockData) {
      await mockDelay();
      const sharedInfo: SharedRecordInfo = {
        id: generateId(),
        sharedWith: data.recipientDoctorName || 'Doctor',
        sharedWithId: data.recipientDoctorId,
        sharedOn: new Date().toISOString(),
        expiresOn: data.expirationDate,
        sectionsShared: data.sectionIds,
        status: 'active',
      };
      return sharedInfo;
    }
    return customInstance<SharedRecordInfo>('/patients/records/share', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSharedRecords: async (): Promise<SharedRecordInfo[]> => {
    if (env.features.useMockData) {
      await mockDelay();
      // Return empty array for mock - no persistent shared records
      return [];
    }
    return customInstance<SharedRecordInfo[]>('/patients/records/shared', { method: 'GET' });
  },

  revokeSharedRecord: async (shareId: string): Promise<void> => {
    if (env.features.useMockData) {
      await mockDelay();
      return;
    }
    return customInstance<void>(`/patients/records/share/${shareId}/revoke`, { method: 'POST' });
  },
};

export default healthProfileDataService;
