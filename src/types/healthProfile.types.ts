/**
 * Health Profile Types
 *
 * Comprehensive types for personal health information management including:
 * - Emergency contacts
 * - Allergies with severity levels
 * - Chronic conditions with management status
 * - Current medications
 * - Vital signs tracking (height/weight, blood pressure, blood sugar)
 * - Medical history timeline
 * - Family medical history
 * - Vaccination records with reminders
 */

// ============================================================================
// Emergency Contact Types
// ============================================================================

export type EmergencyContactRelationship =
  | 'spouse'
  | 'parent'
  | 'sibling'
  | 'child'
  | 'friend'
  | 'other';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: EmergencyContactRelationship;
  isPrimary: boolean;
}

// ============================================================================
// Allergy Types
// ============================================================================

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export type AllergyCategory =
  | 'medication'
  | 'food'
  | 'environmental'
  | 'insect'
  | 'latex'
  | 'other';

export interface Allergy {
  id: string;
  name: string;
  category: AllergyCategory;
  severity: AllergySeverity;
  reactions?: string[];
  notes?: string;
  diagnosedDate?: string;
}

// ============================================================================
// Chronic Condition Types
// ============================================================================

export type ManagementStatus =
  | 'well-controlled'
  | 'partially-controlled'
  | 'uncontrolled'
  | 'in-remission';

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedDate?: string;
  managementStatus: ManagementStatus;
  managedBy?: string; // Doctor name
  notes?: string;
}

// ============================================================================
// Medication Types
// ============================================================================

export interface CurrentMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  instructions?: string;
  isActive: boolean;
}

// ============================================================================
// Vital Signs Base Type
// ============================================================================

export interface VitalReading {
  id: string;
  date: string;
  recordedAt: string; // ISO timestamp
  notes?: string;
}

// ============================================================================
// Height/Weight Tracking
// ============================================================================

export interface HeightWeightReading extends VitalReading {
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number; // calculated: weight / (height/100)^2
}

// ============================================================================
// Blood Pressure Tracking
// ============================================================================

export type BloodPressurePosition = 'sitting' | 'standing' | 'lying';

export interface BloodPressureReading extends VitalReading {
  systolic: number;
  diastolic: number;
  pulse?: number;
  position?: BloodPressurePosition;
}

// Blood pressure category helpers
export type BloodPressureCategory =
  | 'normal'
  | 'elevated'
  | 'high-stage-1'
  | 'high-stage-2'
  | 'crisis';

export const getBloodPressureCategory = (
  systolic: number,
  diastolic: number
): BloodPressureCategory => {
  if (systolic >= 180 || diastolic >= 120) return 'crisis';
  if (systolic >= 140 || diastolic >= 90) return 'high-stage-2';
  if (systolic >= 130 || diastolic >= 80) return 'high-stage-1';
  if (systolic >= 120 && diastolic < 80) return 'elevated';
  return 'normal';
};

// ============================================================================
// Blood Sugar Tracking
// ============================================================================

export type BloodSugarUnit = 'mg/dL' | 'mmol/L';

export type BloodSugarMeasurementType =
  | 'fasting'
  | 'post-meal'
  | 'random'
  | 'bedtime';

export interface BloodSugarReading extends VitalReading {
  value: number;
  unit: BloodSugarUnit;
  measurementType: BloodSugarMeasurementType;
}

// Blood sugar category helpers
export type BloodSugarCategory = 'normal' | 'prediabetic' | 'diabetic';

export const getBloodSugarCategory = (
  value: number,
  type: BloodSugarMeasurementType,
  unit: BloodSugarUnit = 'mg/dL'
): BloodSugarCategory => {
  // Convert to mg/dL if needed
  const mgdL = unit === 'mmol/L' ? value * 18 : value;

  if (type === 'fasting') {
    if (mgdL < 100) return 'normal';
    if (mgdL < 126) return 'prediabetic';
    return 'diabetic';
  }

  // Post-meal or random
  if (mgdL < 140) return 'normal';
  if (mgdL < 200) return 'prediabetic';
  return 'diabetic';
};

// ============================================================================
// Past Medical History Types
// ============================================================================

export type MedicalEventType =
  | 'surgery'
  | 'hospitalization'
  | 'diagnosis'
  | 'injury'
  | 'procedure'
  | 'other';

export interface PastMedicalEvent {
  id: string;
  type: MedicalEventType;
  title: string;
  date: string;
  description?: string;
  facility?: string;
  outcome?: string;
  doctorName?: string;
}

// ============================================================================
// Family Medical History Types
// ============================================================================

export type FamilyRelationship =
  | 'mother'
  | 'father'
  | 'sibling'
  | 'grandparent'
  | 'aunt'
  | 'uncle'
  | 'child'
  | 'other';

export interface FamilyMedicalHistory {
  id: string;
  relationship: FamilyRelationship;
  relationshipDetails?: string; // e.g., "maternal grandmother", "older brother"
  condition: string;
  ageAtDiagnosis?: number;
  isDeceased?: boolean;
  ageAtDeath?: number;
  notes?: string;
}

// ============================================================================
// Vaccination Record Types
// ============================================================================

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  manufacturer?: string;
  dateAdministered: string;
  administeredBy?: string;
  facility?: string;
  lotNumber?: string;
  nextDueDate?: string;
  doseNumber?: number; // For multi-dose vaccines
  totalDoses?: number;
  notes?: string;
}

// Vaccination status helpers
export type VaccinationStatus = 'completed' | 'upcoming' | 'due-soon' | 'overdue';

export const getVaccinationStatus = (nextDueDate?: string): VaccinationStatus => {
  if (!nextDueDate) return 'completed';

  const dueDate = new Date(nextDueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 30) return 'due-soon';
  return 'upcoming';
};

// ============================================================================
// Aggregated Personal Health Profile
// ============================================================================

export interface PersonalHealthProfile {
  // Basic info (from PatientDetailsDto)
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bloodType?: string;
  gender?: string;

  // Enhanced health data
  emergencyContacts: EmergencyContact[];
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  currentMedications: CurrentMedication[];

  // Vitals tracking history
  heightWeightHistory: HeightWeightReading[];
  bloodPressureHistory: BloodPressureReading[];
  bloodSugarHistory: BloodSugarReading[];

  // Medical history
  pastMedicalHistory: PastMedicalEvent[];
  familyMedicalHistory: FamilyMedicalHistory[];
  vaccinationRecords: VaccinationRecord[];
}

// ============================================================================
// Sharing and Export Types
// ============================================================================

export interface ShareRecordRequest {
  recipientDoctorId: string;
  recipientDoctorName?: string;
  sectionIds: string[]; // Which sections to share
  consentAcknowledged: boolean;
  expirationDate?: string;
  notes?: string;
}

export type ShareStatus = 'active' | 'expired' | 'revoked';

export interface SharedRecordInfo {
  id: string;
  sharedWith: string; // Doctor name
  sharedWithId: string; // Doctor ID
  sharedOn: string;
  expiresOn?: string;
  sectionsShared: string[];
  status: ShareStatus;
}

// ============================================================================
// Input Types for Forms (without id for creation)
// ============================================================================

export type EmergencyContactInput = Omit<EmergencyContact, 'id'>;
export type AllergyInput = Omit<Allergy, 'id'>;
export type ChronicConditionInput = Omit<ChronicCondition, 'id'>;
export type CurrentMedicationInput = Omit<CurrentMedication, 'id'>;
export type HeightWeightInput = Omit<HeightWeightReading, 'id' | 'recordedAt' | 'bmi'>;
export type BloodPressureInput = Omit<BloodPressureReading, 'id' | 'recordedAt'>;
export type BloodSugarInput = Omit<BloodSugarReading, 'id' | 'recordedAt'>;
export type PastMedicalEventInput = Omit<PastMedicalEvent, 'id'>;
export type FamilyMedicalHistoryInput = Omit<FamilyMedicalHistory, 'id'>;
export type VaccinationRecordInput = Omit<VaccinationRecord, 'id'>;

// ============================================================================
// Display Helpers
// ============================================================================

export const ALLERGY_SEVERITY_LABELS: Record<AllergySeverity, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
};

export const ALLERGY_CATEGORY_LABELS: Record<AllergyCategory, string> = {
  medication: 'Medication',
  food: 'Food',
  environmental: 'Environmental',
  insect: 'Insect',
  latex: 'Latex',
  other: 'Other',
};

export const MANAGEMENT_STATUS_LABELS: Record<ManagementStatus, string> = {
  'well-controlled': 'Well Controlled',
  'partially-controlled': 'Partially Controlled',
  'uncontrolled': 'Uncontrolled',
  'in-remission': 'In Remission',
};

export const RELATIONSHIP_LABELS: Record<EmergencyContactRelationship, string> = {
  spouse: 'Spouse',
  parent: 'Parent',
  sibling: 'Sibling',
  child: 'Child',
  friend: 'Friend',
  other: 'Other',
};

export const FAMILY_RELATIONSHIP_LABELS: Record<FamilyRelationship, string> = {
  mother: 'Mother',
  father: 'Father',
  sibling: 'Sibling',
  grandparent: 'Grandparent',
  aunt: 'Aunt',
  uncle: 'Uncle',
  child: 'Child',
  other: 'Other',
};

export const MEDICAL_EVENT_TYPE_LABELS: Record<MedicalEventType, string> = {
  surgery: 'Surgery',
  hospitalization: 'Hospitalization',
  diagnosis: 'Diagnosis',
  injury: 'Injury',
  procedure: 'Procedure',
  other: 'Other',
};

export const BLOOD_SUGAR_MEASUREMENT_LABELS: Record<BloodSugarMeasurementType, string> = {
  fasting: 'Fasting',
  'post-meal': 'Post-Meal',
  random: 'Random',
  bedtime: 'Bedtime',
};

export const BLOOD_PRESSURE_POSITION_LABELS: Record<BloodPressurePosition, string> = {
  sitting: 'Sitting',
  standing: 'Standing',
  lying: 'Lying Down',
};

// Aliases for backward compatibility with dialog components
export const CONDITION_MANAGEMENT_STATUS_LABELS = MANAGEMENT_STATUS_LABELS;
export const EMERGENCY_CONTACT_RELATIONSHIP_LABELS = RELATIONSHIP_LABELS;

// Medication frequency options
export type MedicationFrequency =
  | 'once-daily'
  | 'twice-daily'
  | 'three-times-daily'
  | 'four-times-daily'
  | 'every-4-hours'
  | 'every-6-hours'
  | 'every-8-hours'
  | 'every-12-hours'
  | 'as-needed'
  | 'weekly'
  | 'monthly'
  | 'other';

export const MEDICATION_FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  'once-daily': 'Once Daily',
  'twice-daily': 'Twice Daily',
  'three-times-daily': 'Three Times Daily',
  'four-times-daily': 'Four Times Daily',
  'every-4-hours': 'Every 4 Hours',
  'every-6-hours': 'Every 6 Hours',
  'every-8-hours': 'Every 8 Hours',
  'every-12-hours': 'Every 12 Hours',
  'as-needed': 'As Needed (PRN)',
  weekly: 'Weekly',
  monthly: 'Monthly',
  other: 'Other',
};
