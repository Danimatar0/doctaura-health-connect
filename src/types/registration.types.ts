/**
 * Registration Types
 * Types and interfaces for multi-role registration system
 */

import { Gender } from "./generated/gender";

// ============================================================================
// Enums and Literal Types
// ============================================================================

export type StaffRole = "receptionist" | "nurse" | "lab_technician" | "admin_assistant" | "other";

export type ConsultationType = "in_person" | "video" | "both";

export type PracticeType = "private_clinic" | "hospital_employee" | "existing_clinic";

export type ClinicLinkStatus = "pending" | "approved" | "rejected" | "appealed";

export type RegistrationRole = "patient" | "doctor" | "staff";

// ============================================================================
// Reference Data Types
// ============================================================================

export interface Specialty {
  id: number;
  name: string;
  category?: string;
}

export interface Language {
  id: number;
  name: string;
  code: string; // e.g., "en", "ar", "fr"
}

// ============================================================================
// Working Hours Types
// ============================================================================

export interface DayHours {
  open: string; // HH:mm format
  close: string; // HH:mm format
  isClosed: boolean;
}

export interface WorkingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

// ============================================================================
// Clinic Types
// ============================================================================

export interface ClinicSearchResult {
  id: number;
  name: string;
  address: string;
  city: string;
  doctorCount?: number;
}

export interface ClinicDetails extends ClinicSearchResult {
  phone?: string;
  email?: string;
  workingHours?: WorkingHours;
  countryId?: number;
  governorateId?: number;
  districtId?: number;
  localityId?: number;
  createdAt?: string;
}

export interface ClinicLinkRequest {
  clinicId: number;
  message?: string;
}

export interface ClinicLinkRequestStatus {
  id: number;
  clinicId: number;
  clinicName: string;
  status: ClinicLinkStatus;
  message?: string;
  rejectionReason?: string;
  appealMessage?: string;
  requestedAt: string;
  reviewedAt?: string;
}

// ============================================================================
// Invitation Code Types
// ============================================================================

export interface InvitationCode {
  id: number;
  code: string;
  clinicId?: number;
  doctorId?: string;
  entityType: "clinic" | "doctor";
  allowedRoles?: StaffRole[];
  usesRemaining: number;
  expiresAt?: string;
  createdAt: string;
}

export interface InvitationCodeValidation {
  valid: boolean;
  entityType?: "doctor" | "clinic";
  entityId?: number | string;
  entityName?: string;
  allowedRoles?: StaffRole[];
  errorMessage?: string;
}

// ============================================================================
// Doctor Registration Types
// ============================================================================

export interface DoctorRegistrationRequest {
  // Personal Info
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;

  // Professional Info
  specialtyId: number;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  certificationFileUrl?: string;
  languageIds: number[];
  consultationType: ConsultationType;
  consultationFee?: number;
  bio?: string;

  // Practice Info
  practiceType: PracticeType;

  // For private_clinic
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWorkingHours?: WorkingHours;

  // For hospital_employee
  hospitalName?: string;

  // For existing_clinic
  clinicInvitationCode?: string;
  clinicRequestIds?: number[];

  // Service Areas (for Find Doctor filters)
  serviceAreaCountryIds: number[];
  serviceAreaGovernorateIds?: number[];
  serviceAreaDistrictIds?: number[];
  serviceAreaLocalityIds?: number[];
}

export interface DoctorRegistrationResponse {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  specialtyId: number;
  specialtyName?: string;
  practiceType: PracticeType;
  status: "pending_verification" | "pending_clinic_approval" | "active";
  createdAt: string;
}

// ============================================================================
// Staff Registration Types
// ============================================================================

export interface StaffRegistrationRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  gender: Gender;
  invitationCode: string;
  staffRole: StaffRole;
  customRole?: string; // When staffRole is "other"
}

export interface StaffRegistrationResponse {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  staffRole: StaffRole;
  customRole?: string;
  linkedEntityType: "doctor" | "clinic";
  linkedEntityId: number | string;
  linkedEntityName: string;
  createdAt: string;
}

// ============================================================================
// Doctor-Clinic Affiliation Types
// ============================================================================

export interface DoctorClinicAffiliation {
  id: number;
  doctorId: string;
  clinicId: number;
  clinicName: string;
  clinicAddress?: string;
  joinedVia: "invitation_code" | "request_approval" | "owner";
  isPrimary: boolean;
  createdAt: string;
}

// ============================================================================
// File Upload Types
// ============================================================================

export interface FileUploadResponse {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

// ============================================================================
// Form Data Types (for multi-step forms)
// ============================================================================

export interface DoctorFormData {
  // Step 1: Account
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: Personal
  phone: string;
  gender: number;
  dateOfBirth: string;

  // Step 3: Professional
  specialtyId: number;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  certificationFile?: File;
  languageIds: number[];
  consultationType: ConsultationType;
  consultationFee?: number;
  bio?: string;

  // Step 4: Practice
  practiceType: PracticeType;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWorkingHours?: WorkingHours;
  hospitalName?: string;
  clinicInvitationCode?: string;
  selectedClinicIds?: number[];

  // Step 5: Service Areas
  serviceAreaCountryIds: number[];
  serviceAreaGovernorateIds: number[];
  serviceAreaDistrictIds: number[];
  serviceAreaLocalityIds: number[];
}

export interface StaffFormData {
  // Step 1: Invitation
  invitationCode: string;
  validatedEntity?: InvitationCodeValidation;

  // Step 2: Account
  email: string;
  password: string;
  confirmPassword: string;

  // Step 3: Personal
  firstName: string;
  lastName: string;
  phone: string;
  gender: number;

  // Step 4: Role
  staffRole: StaffRole;
  customRole?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const STAFF_ROLES: { value: StaffRole; label: string }[] = [
  { value: "receptionist", label: "Receptionist" },
  { value: "nurse", label: "Nurse" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "admin_assistant", label: "Admin Assistant" },
  { value: "other", label: "Other" },
];

export const CONSULTATION_TYPES: { value: ConsultationType; label: string; description: string }[] = [
  { value: "in_person", label: "In-Person Only", description: "Patients visit your clinic" },
  { value: "video", label: "Video Only", description: "Online consultations only" },
  { value: "both", label: "Both", description: "In-person and video consultations" },
];

export const PRACTICE_TYPES: { value: PracticeType; label: string; description: string }[] = [
  { value: "private_clinic", label: "Own Private Clinic", description: "I have my own clinic" },
  { value: "hospital_employee", label: "Hospital Employee", description: "I work at a hospital" },
  { value: "existing_clinic", label: "Link to Existing Clinic", description: "Join an existing clinic on Doctaura" },
];

// Default specialties (fallback if API fails)
export const DEFAULT_SPECIALTIES: Specialty[] = [
  { id: 1, name: "General Practice", category: "Primary Care" },
  { id: 2, name: "Cardiology", category: "Internal Medicine" },
  { id: 3, name: "Dermatology", category: "Specialties" },
  { id: 4, name: "Pediatrics", category: "Primary Care" },
  { id: 5, name: "Orthopedics", category: "Surgery" },
  { id: 6, name: "Gynecology", category: "Women's Health" },
  { id: 7, name: "Neurology", category: "Internal Medicine" },
  { id: 8, name: "Psychiatry", category: "Mental Health" },
  { id: 9, name: "Ophthalmology", category: "Specialties" },
  { id: 10, name: "ENT (Ear, Nose, Throat)", category: "Specialties" },
  { id: 11, name: "Dentistry", category: "Dental" },
  { id: 12, name: "Internal Medicine", category: "Internal Medicine" },
  { id: 13, name: "Family Medicine", category: "Primary Care" },
  { id: 14, name: "Emergency Medicine", category: "Emergency" },
  { id: 15, name: "Radiology", category: "Diagnostics" },
];

// Default languages (fallback if API fails)
export const DEFAULT_LANGUAGES: Language[] = [
  { id: 1, name: "Arabic", code: "ar" },
  { id: 2, name: "English", code: "en" },
  { id: 3, name: "French", code: "fr" },
  { id: 4, name: "Spanish", code: "es" },
  { id: 5, name: "German", code: "de" },
  { id: 6, name: "Turkish", code: "tr" },
  { id: 7, name: "Russian", code: "ru" },
  { id: 8, name: "Chinese", code: "zh" },
];
