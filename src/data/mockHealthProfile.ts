/**
 * Mock Health Profile Data
 *
 * Comprehensive mock data for development and testing of the
 * enhanced Medical Records page features.
 */

import type {
  PersonalHealthProfile,
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

// ============================================================================
// Emergency Contacts
// ============================================================================

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'ec-001',
    name: 'Sarah Ahmad',
    phone: '+961 71 123 456',
    relationship: 'spouse',
    isPrimary: true,
  },
  {
    id: 'ec-002',
    name: 'Karim Ahmad',
    phone: '+961 70 987 654',
    relationship: 'sibling',
    isPrimary: false,
  },
  {
    id: 'ec-003',
    name: 'Fatima Khalil',
    phone: '+961 76 555 789',
    relationship: 'parent',
    isPrimary: false,
  },
];

// ============================================================================
// Allergies
// ============================================================================

export const mockAllergies: Allergy[] = [
  {
    id: 'allergy-001',
    name: 'Penicillin',
    category: 'medication',
    severity: 'severe',
    reactions: ['Hives', 'Difficulty breathing', 'Swelling'],
    diagnosedDate: '2018-03-15',
    notes: 'Confirmed by allergist. Carry EpiPen at all times.',
  },
  {
    id: 'allergy-002',
    name: 'Peanuts',
    category: 'food',
    severity: 'moderate',
    reactions: ['Itching', 'Stomach upset', 'Mild swelling'],
    diagnosedDate: '2010-06-20',
    notes: 'Avoid all peanut products including peanut oil.',
  },
  {
    id: 'allergy-003',
    name: 'Dust Mites',
    category: 'environmental',
    severity: 'mild',
    reactions: ['Sneezing', 'Runny nose', 'Itchy eyes'],
  },
  {
    id: 'allergy-004',
    name: 'Bee Stings',
    category: 'insect',
    severity: 'moderate',
    reactions: ['Localized swelling', 'Redness', 'Pain'],
    diagnosedDate: '2015-07-10',
  },
];

// ============================================================================
// Chronic Conditions
// ============================================================================

export const mockChronicConditions: ChronicCondition[] = [
  {
    id: 'cc-001',
    name: 'Type 2 Diabetes',
    diagnosedDate: '2020-01-10',
    managementStatus: 'well-controlled',
    managedBy: 'Dr. Sarah Johnson',
    notes: 'Managed with diet, exercise, and Metformin. HbA1c target: <7%',
  },
  {
    id: 'cc-002',
    name: 'Essential Hypertension',
    diagnosedDate: '2019-05-22',
    managementStatus: 'partially-controlled',
    managedBy: 'Dr. Sarah Johnson',
    notes: 'On Lisinopril 10mg daily. Target BP: <130/80',
  },
  {
    id: 'cc-003',
    name: 'Mild Asthma',
    diagnosedDate: '2005-09-15',
    managementStatus: 'well-controlled',
    managedBy: 'Dr. Ahmad Hassan',
    notes: 'Uses inhaler as needed. Triggers: cold air, dust.',
  },
];

// ============================================================================
// Current Medications
// ============================================================================

export const mockCurrentMedications: CurrentMedication[] = [
  {
    id: 'med-001',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily with meals',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2020-01-15',
    purpose: 'Blood sugar control',
    instructions: 'Take with breakfast and dinner',
    isActive: true,
  },
  {
    id: 'med-002',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily in the morning',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2019-06-01',
    purpose: 'Blood pressure control',
    instructions: 'Take in the morning on an empty stomach',
    isActive: true,
  },
  {
    id: 'med-003',
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    purpose: 'Vitamin supplementation',
    instructions: 'Take with food for better absorption',
    isActive: true,
  },
  {
    id: 'med-004',
    name: 'Salbutamol Inhaler',
    dosage: '100mcg/puff',
    frequency: 'As needed',
    prescribedBy: 'Dr. Ahmad Hassan',
    startDate: '2005-09-20',
    purpose: 'Asthma relief',
    instructions: '1-2 puffs when experiencing breathing difficulty',
    isActive: true,
  },
  {
    id: 'med-005',
    name: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2021-03-01',
    purpose: 'Cardiovascular protection',
    isActive: true,
  },
];

// ============================================================================
// Height/Weight History (6 months of data)
// ============================================================================

export const mockHeightWeightHistory: HeightWeightReading[] = [
  { id: 'hw-001', date: '2024-07-15', recordedAt: '2024-07-15T09:00:00Z', height: 175, weight: 85, bmi: 27.8 },
  { id: 'hw-002', date: '2024-08-15', recordedAt: '2024-08-15T09:30:00Z', height: 175, weight: 84, bmi: 27.4 },
  { id: 'hw-003', date: '2024-09-15', recordedAt: '2024-09-15T10:00:00Z', height: 175, weight: 83, bmi: 27.1 },
  { id: 'hw-004', date: '2024-10-15', recordedAt: '2024-10-15T09:15:00Z', height: 175, weight: 82, bmi: 26.8 },
  { id: 'hw-005', date: '2024-11-15', recordedAt: '2024-11-15T09:45:00Z', height: 175, weight: 81, bmi: 26.4 },
  { id: 'hw-006', date: '2024-12-15', recordedAt: '2024-12-15T10:30:00Z', height: 175, weight: 80, bmi: 26.1 },
];

// ============================================================================
// Blood Pressure History (recent readings)
// ============================================================================

export const mockBloodPressureHistory: BloodPressureReading[] = [
  { id: 'bp-001', date: '2024-12-01', recordedAt: '2024-12-01T08:00:00Z', systolic: 138, diastolic: 90, pulse: 75, position: 'sitting' },
  { id: 'bp-002', date: '2024-12-05', recordedAt: '2024-12-05T08:15:00Z', systolic: 135, diastolic: 88, pulse: 72, position: 'sitting' },
  { id: 'bp-003', date: '2024-12-08', recordedAt: '2024-12-08T08:30:00Z', systolic: 132, diastolic: 85, pulse: 70, position: 'sitting' },
  { id: 'bp-004', date: '2024-12-12', recordedAt: '2024-12-12T08:00:00Z', systolic: 130, diastolic: 84, pulse: 71, position: 'sitting' },
  { id: 'bp-005', date: '2024-12-15', recordedAt: '2024-12-15T08:45:00Z', systolic: 128, diastolic: 82, pulse: 69, position: 'sitting' },
  { id: 'bp-006', date: '2024-12-18', recordedAt: '2024-12-18T07:30:00Z', systolic: 126, diastolic: 80, pulse: 68, position: 'sitting' },
  { id: 'bp-007', date: '2024-12-20', recordedAt: '2024-12-20T08:00:00Z', systolic: 124, diastolic: 78, pulse: 70, position: 'sitting' },
];

// ============================================================================
// Blood Sugar History (fasting and post-meal readings)
// ============================================================================

export const mockBloodSugarHistory: BloodSugarReading[] = [
  { id: 'bs-001', date: '2024-12-01', recordedAt: '2024-12-01T07:00:00Z', value: 125, unit: 'mg/dL', measurementType: 'fasting' },
  { id: 'bs-002', date: '2024-12-03', recordedAt: '2024-12-03T13:00:00Z', value: 165, unit: 'mg/dL', measurementType: 'post-meal' },
  { id: 'bs-003', date: '2024-12-05', recordedAt: '2024-12-05T07:15:00Z', value: 118, unit: 'mg/dL', measurementType: 'fasting' },
  { id: 'bs-004', date: '2024-12-08', recordedAt: '2024-12-08T07:30:00Z', value: 115, unit: 'mg/dL', measurementType: 'fasting' },
  { id: 'bs-005', date: '2024-12-10', recordedAt: '2024-12-10T13:30:00Z', value: 155, unit: 'mg/dL', measurementType: 'post-meal' },
  { id: 'bs-006', date: '2024-12-12', recordedAt: '2024-12-12T07:00:00Z', value: 112, unit: 'mg/dL', measurementType: 'fasting' },
  { id: 'bs-007', date: '2024-12-15', recordedAt: '2024-12-15T07:00:00Z', value: 108, unit: 'mg/dL', measurementType: 'fasting' },
  { id: 'bs-008', date: '2024-12-17', recordedAt: '2024-12-17T21:00:00Z', value: 135, unit: 'mg/dL', measurementType: 'bedtime' },
  { id: 'bs-009', date: '2024-12-20', recordedAt: '2024-12-20T07:00:00Z', value: 105, unit: 'mg/dL', measurementType: 'fasting' },
];

// ============================================================================
// Past Medical History
// ============================================================================

export const mockPastMedicalHistory: PastMedicalEvent[] = [
  {
    id: 'pmh-001',
    type: 'surgery',
    title: 'Appendectomy',
    date: '2015-08-12',
    description: 'Laparoscopic appendectomy for acute appendicitis. Emergency surgery.',
    facility: 'Beirut Medical Center',
    outcome: 'Full recovery with no complications. Discharged after 2 days.',
    doctorName: 'Dr. Michel Haddad',
  },
  {
    id: 'pmh-002',
    type: 'hospitalization',
    title: 'Pneumonia Treatment',
    date: '2019-02-20',
    description: 'Hospitalized for 4 days for community-acquired pneumonia. Required IV antibiotics.',
    facility: 'Tripoli General Hospital',
    outcome: 'Complete resolution with antibiotic therapy. Follow-up chest X-ray clear.',
    doctorName: 'Dr. Ahmad Hassan',
  },
  {
    id: 'pmh-003',
    type: 'diagnosis',
    title: 'Type 2 Diabetes Diagnosis',
    date: '2020-01-10',
    description: 'Diagnosed during routine blood work. HbA1c was 7.2%, fasting glucose 145 mg/dL.',
    outcome: 'Started on lifestyle modifications and Metformin. Regular monitoring initiated.',
    doctorName: 'Dr. Sarah Johnson',
  },
  {
    id: 'pmh-004',
    type: 'diagnosis',
    title: 'Hypertension Diagnosis',
    date: '2019-05-22',
    description: 'Persistent elevated BP readings over 3 visits. Average 145/92 mmHg.',
    outcome: 'Started on Lisinopril 10mg. Diet and exercise recommendations provided.',
    doctorName: 'Dr. Sarah Johnson',
  },
  {
    id: 'pmh-005',
    type: 'injury',
    title: 'Right Ankle Sprain',
    date: '2022-03-15',
    description: 'Grade 2 ankle sprain from playing basketball. Significant swelling and bruising.',
    facility: 'Emergency Room - Beirut Medical Center',
    outcome: 'RICE protocol, physical therapy for 4 weeks. Full recovery.',
  },
  {
    id: 'pmh-006',
    type: 'procedure',
    title: 'Colonoscopy Screening',
    date: '2023-06-10',
    description: 'Routine colonoscopy screening at age 38 due to family history.',
    facility: 'Gastroenterology Associates',
    outcome: 'No polyps found. Normal results. Repeat in 10 years.',
    doctorName: 'Dr. Rami Khoury',
  },
];

// ============================================================================
// Family Medical History
// ============================================================================

export const mockFamilyMedicalHistory: FamilyMedicalHistory[] = [
  {
    id: 'fmh-001',
    relationship: 'father',
    condition: 'Type 2 Diabetes',
    ageAtDiagnosis: 55,
    notes: 'Managed with medication and diet. No major complications.',
  },
  {
    id: 'fmh-002',
    relationship: 'father',
    condition: 'Coronary Artery Disease',
    ageAtDiagnosis: 62,
    notes: 'Had stent placement at 65. Currently stable on medications.',
  },
  {
    id: 'fmh-003',
    relationship: 'mother',
    condition: 'Hypertension',
    ageAtDiagnosis: 50,
    notes: 'Well controlled with ACE inhibitor.',
  },
  {
    id: 'fmh-004',
    relationship: 'mother',
    condition: 'Breast Cancer',
    ageAtDiagnosis: 58,
    notes: 'Stage 1, successfully treated with surgery and radiation. In remission.',
  },
  {
    id: 'fmh-005',
    relationship: 'grandparent',
    relationshipDetails: 'Paternal grandfather',
    condition: 'Heart Disease',
    ageAtDiagnosis: 65,
    isDeceased: true,
    ageAtDeath: 78,
    notes: 'Had bypass surgery at 68. Passed from heart failure.',
  },
  {
    id: 'fmh-006',
    relationship: 'grandparent',
    relationshipDetails: 'Maternal grandmother',
    condition: 'Type 2 Diabetes',
    ageAtDiagnosis: 60,
    isDeceased: true,
    ageAtDeath: 85,
  },
  {
    id: 'fmh-007',
    relationship: 'sibling',
    relationshipDetails: 'Older brother',
    condition: 'Asthma',
    ageAtDiagnosis: 12,
    notes: 'Well controlled. Mostly outgrown.',
  },
  {
    id: 'fmh-008',
    relationship: 'sibling',
    relationshipDetails: 'Younger sister',
    condition: 'Hypothyroidism',
    ageAtDiagnosis: 28,
    notes: 'On levothyroxine, well controlled.',
  },
];

// ============================================================================
// Vaccination Records
// ============================================================================

export const mockVaccinationRecords: VaccinationRecord[] = [
  {
    id: 'vax-001',
    vaccineName: 'Influenza (Flu)',
    manufacturer: 'Sanofi Pasteur',
    dateAdministered: '2024-09-15',
    administeredBy: 'Dr. Ahmad Hassan',
    facility: 'Family Health Center',
    lotNumber: 'FL2024-789',
    nextDueDate: '2025-09-15',
    notes: 'Annual flu shot. No adverse reactions.',
  },
  {
    id: 'vax-002',
    vaccineName: 'COVID-19 Booster (Bivalent)',
    manufacturer: 'Pfizer-BioNTech',
    dateAdministered: '2024-03-10',
    administeredBy: 'Dr. Sarah Johnson',
    facility: 'Beirut Medical Center',
    lotNumber: 'CV2024-456',
    doseNumber: 5,
    nextDueDate: '2025-03-10',
    notes: 'Updated bivalent booster. Mild arm soreness for 1 day.',
  },
  {
    id: 'vax-003',
    vaccineName: 'Tetanus-Diphtheria-Pertussis (Tdap)',
    manufacturer: 'GlaxoSmithKline',
    dateAdministered: '2020-05-22',
    facility: 'Tripoli Clinic',
    lotNumber: 'TD2020-123',
    nextDueDate: '2030-05-22',
    notes: 'Td booster every 10 years. Tdap given due to pertussis outbreak.',
  },
  {
    id: 'vax-004',
    vaccineName: 'Hepatitis B',
    manufacturer: 'Merck',
    dateAdministered: '1995-01-15',
    doseNumber: 3,
    totalDoses: 3,
    notes: 'Full series completed in childhood. Lifetime immunity.',
  },
  {
    id: 'vax-005',
    vaccineName: 'MMR (Measles, Mumps, Rubella)',
    manufacturer: 'Merck',
    dateAdministered: '1990-06-01',
    doseNumber: 2,
    totalDoses: 2,
    notes: 'Childhood vaccination series completed.',
  },
  {
    id: 'vax-006',
    vaccineName: 'Pneumococcal (Pneumovax 23)',
    manufacturer: 'Merck',
    dateAdministered: '2023-11-20',
    administeredBy: 'Dr. Sarah Johnson',
    facility: 'Beirut Medical Center',
    lotNumber: 'PV2023-890',
    notes: 'Recommended due to diabetes. One-time dose.',
  },
  {
    id: 'vax-007',
    vaccineName: 'Shingles (Shingrix)',
    manufacturer: 'GlaxoSmithKline',
    dateAdministered: '2024-01-15',
    administeredBy: 'Dr. Sarah Johnson',
    facility: 'Beirut Medical Center',
    doseNumber: 1,
    totalDoses: 2,
    nextDueDate: '2024-03-15',
    notes: 'Dose 1 of 2. Dose 2 was administered on schedule.',
  },
];

// ============================================================================
// Aggregated Mock Health Profile
// ============================================================================

export const mockHealthProfile: PersonalHealthProfile = {
  firstName: 'Ahmad',
  lastName: 'Khalil',
  dateOfBirth: '1985-03-15',
  bloodType: 'O+',
  gender: 'male',
  emergencyContacts: mockEmergencyContacts,
  allergies: mockAllergies,
  chronicConditions: mockChronicConditions,
  currentMedications: mockCurrentMedications,
  heightWeightHistory: mockHeightWeightHistory,
  bloodPressureHistory: mockBloodPressureHistory,
  bloodSugarHistory: mockBloodSugarHistory,
  pastMedicalHistory: mockPastMedicalHistory,
  familyMedicalHistory: mockFamilyMedicalHistory,
  vaccinationRecords: mockVaccinationRecords,
};

// ============================================================================
// Helper: Get mock data with simulated delay
// ============================================================================

const mockDelay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const getMockHealthProfile = async (): Promise<PersonalHealthProfile> => {
  await mockDelay();
  return { ...mockHealthProfile };
};

export const getMockEmergencyContacts = async (): Promise<EmergencyContact[]> => {
  await mockDelay();
  return [...mockEmergencyContacts];
};

export const getMockAllergies = async (): Promise<Allergy[]> => {
  await mockDelay();
  return [...mockAllergies];
};

export const getMockChronicConditions = async (): Promise<ChronicCondition[]> => {
  await mockDelay();
  return [...mockChronicConditions];
};

export const getMockCurrentMedications = async (): Promise<CurrentMedication[]> => {
  await mockDelay();
  return [...mockCurrentMedications];
};

export const getMockHeightWeightHistory = async (): Promise<HeightWeightReading[]> => {
  await mockDelay();
  return [...mockHeightWeightHistory];
};

export const getMockBloodPressureHistory = async (): Promise<BloodPressureReading[]> => {
  await mockDelay();
  return [...mockBloodPressureHistory];
};

export const getMockBloodSugarHistory = async (): Promise<BloodSugarReading[]> => {
  await mockDelay();
  return [...mockBloodSugarHistory];
};

export const getMockPastMedicalHistory = async (): Promise<PastMedicalEvent[]> => {
  await mockDelay();
  return [...mockPastMedicalHistory];
};

export const getMockFamilyMedicalHistory = async (): Promise<FamilyMedicalHistory[]> => {
  await mockDelay();
  return [...mockFamilyMedicalHistory];
};

export const getMockVaccinationRecords = async (): Promise<VaccinationRecord[]> => {
  await mockDelay();
  return [...mockVaccinationRecords];
};
