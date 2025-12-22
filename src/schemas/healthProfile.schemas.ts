/**
 * Health Profile Validation Schemas
 *
 * Zod schemas for validating health profile form data including:
 * - Emergency contacts
 * - Allergies
 * - Chronic conditions
 * - Medications
 * - Vital signs (height/weight, blood pressure, blood sugar)
 * - Medical history events
 * - Family medical history
 * - Vaccination records
 */

import { z } from 'zod';

// ============================================================================
// Common Validators
// ============================================================================

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date');

const optionalDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
  .optional()
  .or(z.literal(''));

// ============================================================================
// Emergency Contact Schema
// ============================================================================

export const emergencyContactRelationshipSchema = z.enum([
  'spouse',
  'parent',
  'sibling',
  'child',
  'friend',
  'other',
]);

export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(phoneRegex, 'Invalid phone number format'),
  relationship: emergencyContactRelationshipSchema,
  isPrimary: z.boolean().default(false),
});

export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;

// ============================================================================
// Allergy Schema
// ============================================================================

export const allergySeveritySchema = z.enum(['mild', 'moderate', 'severe']);

export const allergyCategorySchema = z.enum([
  'medication',
  'food',
  'environmental',
  'insect',
  'latex',
  'other',
]);

export const allergySchema = z.object({
  name: z
    .string()
    .min(2, 'Allergy name must be at least 2 characters')
    .max(100, 'Allergy name must be less than 100 characters'),
  category: allergyCategorySchema,
  severity: allergySeveritySchema,
  reactions: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((s) => s.trim()).filter(Boolean) : undefined)),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().or(z.literal('')),
  diagnosedDate: optionalDateStringSchema,
});

export type AllergyFormData = z.infer<typeof allergySchema>;

// ============================================================================
// Chronic Condition Schema
// ============================================================================

export const managementStatusSchema = z.enum([
  'well-controlled',
  'partially-controlled',
  'uncontrolled',
  'in-remission',
]);

export const chronicConditionSchema = z.object({
  name: z
    .string()
    .min(2, 'Condition name must be at least 2 characters')
    .max(150, 'Condition name must be less than 150 characters'),
  diagnosedDate: optionalDateStringSchema,
  managementStatus: managementStatusSchema,
  managedBy: z.string().max(100, 'Doctor name must be less than 100 characters').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().or(z.literal('')),
});

export type ChronicConditionFormData = z.infer<typeof chronicConditionSchema>;

// ============================================================================
// Current Medication Schema
// ============================================================================

export const currentMedicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Medication name must be at least 2 characters')
    .max(150, 'Medication name must be less than 150 characters'),
  dosage: z
    .string()
    .min(1, 'Dosage is required')
    .max(50, 'Dosage must be less than 50 characters'),
  frequency: z
    .string()
    .min(1, 'Frequency is required')
    .max(100, 'Frequency must be less than 100 characters'),
  prescribedBy: z.string().max(100, 'Doctor name must be less than 100 characters').optional().or(z.literal('')),
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema,
  purpose: z.string().max(200, 'Purpose must be less than 200 characters').optional().or(z.literal('')),
  instructions: z.string().max(500, 'Instructions must be less than 500 characters').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type CurrentMedicationFormData = z.infer<typeof currentMedicationSchema>;

// ============================================================================
// Height/Weight Reading Schema
// ============================================================================

export const heightWeightSchema = z.object({
  date: dateStringSchema,
  height: z
    .number()
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm')
    .optional(),
  weight: z
    .number()
    .min(10, 'Weight must be at least 10 kg')
    .max(500, 'Weight must be less than 500 kg')
    .optional(),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional().or(z.literal('')),
}).refine(
  (data) => data.height !== undefined || data.weight !== undefined,
  { message: 'At least height or weight must be provided' }
);

export type HeightWeightFormData = z.infer<typeof heightWeightSchema>;

// ============================================================================
// Blood Pressure Reading Schema
// ============================================================================

export const bloodPressurePositionSchema = z.enum(['sitting', 'standing', 'lying']);

export const bloodPressureSchema = z.object({
  date: dateStringSchema,
  systolic: z
    .number()
    .min(60, 'Systolic pressure must be at least 60 mmHg')
    .max(250, 'Systolic pressure must be less than 250 mmHg'),
  diastolic: z
    .number()
    .min(40, 'Diastolic pressure must be at least 40 mmHg')
    .max(150, 'Diastolic pressure must be less than 150 mmHg'),
  pulse: z
    .number()
    .min(30, 'Pulse must be at least 30 bpm')
    .max(220, 'Pulse must be less than 220 bpm')
    .optional(),
  position: bloodPressurePositionSchema.optional(),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional().or(z.literal('')),
}).refine(
  (data) => data.systolic > data.diastolic,
  { message: 'Systolic pressure must be greater than diastolic pressure', path: ['systolic'] }
);

export type BloodPressureFormData = z.infer<typeof bloodPressureSchema>;

// ============================================================================
// Blood Sugar Reading Schema
// ============================================================================

export const bloodSugarUnitSchema = z.enum(['mg/dL', 'mmol/L']);

export const bloodSugarMeasurementTypeSchema = z.enum([
  'fasting',
  'post-meal',
  'random',
  'bedtime',
]);

export const bloodSugarSchema = z.object({
  date: dateStringSchema,
  value: z
    .number()
    .min(20, 'Blood sugar must be at least 20')
    .max(600, 'Blood sugar must be less than 600'),
  unit: bloodSugarUnitSchema,
  measurementType: bloodSugarMeasurementTypeSchema,
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional().or(z.literal('')),
});

export type BloodSugarFormData = z.infer<typeof bloodSugarSchema>;

// ============================================================================
// Past Medical Event Schema
// ============================================================================

export const medicalEventTypeSchema = z.enum([
  'surgery',
  'hospitalization',
  'diagnosis',
  'injury',
  'procedure',
  'other',
]);

export const pastMedicalEventSchema = z.object({
  type: medicalEventTypeSchema,
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title must be less than 150 characters'),
  date: dateStringSchema,
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  facility: z.string().max(150, 'Facility name must be less than 150 characters').optional().or(z.literal('')),
  outcome: z.string().max(300, 'Outcome must be less than 300 characters').optional().or(z.literal('')),
  doctorName: z.string().max(100, 'Doctor name must be less than 100 characters').optional().or(z.literal('')),
});

export type PastMedicalEventFormData = z.infer<typeof pastMedicalEventSchema>;

// ============================================================================
// Family Medical History Schema
// ============================================================================

export const familyRelationshipSchema = z.enum([
  'mother',
  'father',
  'sibling',
  'grandparent',
  'aunt',
  'uncle',
  'child',
  'other',
]);

export const familyMedicalHistorySchema = z.object({
  relationship: familyRelationshipSchema,
  relationshipDetails: z.string().max(100, 'Details must be less than 100 characters').optional().or(z.literal('')),
  condition: z
    .string()
    .min(2, 'Condition must be at least 2 characters')
    .max(150, 'Condition must be less than 150 characters'),
  ageAtDiagnosis: z
    .number()
    .min(0, 'Age must be positive')
    .max(120, 'Age must be less than 120')
    .optional(),
  isDeceased: z.boolean().optional(),
  ageAtDeath: z
    .number()
    .min(0, 'Age must be positive')
    .max(120, 'Age must be less than 120')
    .optional(),
  notes: z.string().max(300, 'Notes must be less than 300 characters').optional().or(z.literal('')),
});

export type FamilyMedicalHistoryFormData = z.infer<typeof familyMedicalHistorySchema>;

// ============================================================================
// Vaccination Record Schema
// ============================================================================

export const vaccinationRecordSchema = z.object({
  vaccineName: z
    .string()
    .min(2, 'Vaccine name must be at least 2 characters')
    .max(150, 'Vaccine name must be less than 150 characters'),
  manufacturer: z.string().max(100, 'Manufacturer must be less than 100 characters').optional().or(z.literal('')),
  dateAdministered: dateStringSchema,
  administeredBy: z.string().max(100, 'Administrator must be less than 100 characters').optional().or(z.literal('')),
  facility: z.string().max(150, 'Facility must be less than 150 characters').optional().or(z.literal('')),
  lotNumber: z.string().max(50, 'Lot number must be less than 50 characters').optional().or(z.literal('')),
  nextDueDate: optionalDateStringSchema,
  doseNumber: z.number().min(1).max(10).optional(),
  totalDoses: z.number().min(1).max(10).optional(),
  notes: z.string().max(300, 'Notes must be less than 300 characters').optional().or(z.literal('')),
});

export type VaccinationRecordFormData = z.infer<typeof vaccinationRecordSchema>;

// ============================================================================
// Share Records Schema
// ============================================================================

export const shareRecordsSchema = z.object({
  recipientDoctorId: z.string().min(1, 'Please select a doctor'),
  recipientDoctorName: z.string().optional(),
  sectionIds: z.array(z.string()).min(1, 'Select at least one section to share'),
  consentAcknowledged: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge consent to share records' }),
  }),
  expirationDate: optionalDateStringSchema,
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().or(z.literal('')),
});

export type ShareRecordsFormData = z.infer<typeof shareRecordsSchema>;
