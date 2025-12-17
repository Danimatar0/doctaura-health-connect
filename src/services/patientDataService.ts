/**
 * Patient Data Service
 *
 * Unified interface for patient-related data operations.
 * Uses orval-generated APIs with mock data fallback.
 */

import { env } from "@/config/env";
import { AuthUser } from "@/types/auth.types";
import { customInstanceWithToken } from "@/api/mutator/customInstance";

// Generated API functions
import {
  getApiPatientsMe,
  putApiPatientsMe,
  postApiPatientsAppointmentsSummary,
} from "@/api/generated/patients/patients";

// Generated DTOs
import type {
  PatientAddRequestDto,
  PatientAddResponseDto,
  PatientDetailsDto,
  PatientEditRequestDto,
  PatientEditResponseDto,
  PatientAppointmentsSummaryRequestDto,
  PatientAppointmentsSummaryResponseDto,
  Gender,
} from "@/types/generated";

// Re-export hooks for direct component usage
export {
  useGetApiPatientsMe,
  usePutApiPatientsMe,
  usePostApiPatientsAppointmentsSummary,
} from "@/api/generated/patients/patients";

// Re-export DTOs
export type {
  PatientAddRequestDto,
  PatientAddResponseDto,
  PatientDetailsDto,
  PatientEditRequestDto,
  PatientEditResponseDto,
  PatientAppointmentsSummaryRequestDto,
  PatientAppointmentsSummaryResponseDto,
};

// Mock data imports
import { mockAppointments } from "@/data/mockAppointments";
import { mockPrescriptions } from "@/data/mockPrescriptions";
import { getMockPatientProfile, mockDashboardStats } from "@/data/mockPatientProfile";
import { Appointment, Prescription, Patient } from "@/types";

// ============================================================================
// Helpers
// ============================================================================

const GenderMap: Record<string, Gender> = {
  male: 0,
  female: 1,
  other: 2,
};

/**
 * Convert AuthUser (from Keycloak) to PatientAddRequestDto
 * Sends null for empty/missing values (backend requires null, not empty strings)
 */
export function convertAuthUserToPatientRequest(user: AuthUser): PatientAddRequestDto {
  const gender = user.gender
    ? GenderMap[user.gender.toLowerCase()] ?? GenderMap.other
    : GenderMap.other;

  // Helper to convert empty strings to null
  const emptyToNull = (value: string | undefined | null): string | null => {
    return value && value.trim() !== '' ? value : null;
  };

  // Parse location IDs
  const parseId = (value: string | undefined): number | null => {
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  };

  return {
    firstname: emptyToNull(user.firstName || user.name.split(' ')[0]),
    lastname: emptyToNull(user.lastName || user.name.split(' ').slice(1).join(' ')),
    phone: emptyToNull(user.phone),
    gender,
    dateOfBirth: emptyToNull(user.dateOfBirth),
    email: user.email,
    countryId: parseId(user.country), // country → countryId
    governorateId: parseId(user.governorateId),
    districtId: parseId(user.districtId),
    localityId: parseId(user.localityId),
    emergencyContactName: null,
    emergencyContactPhone: null,
    bloodType: emptyToNull(user.bloodType),
    allergies: null,
    chronicConditions: null,
  };
}

// ============================================================================
// Mock Data
// ============================================================================

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 100));

const getMockAppointments = async (): Promise<Appointment[]> => {
  await mockDelay();
  return mockAppointments;
};

const getMockPrescriptions = async (): Promise<Prescription[]> => {
  await mockDelay();
  return mockPrescriptions;
};

const getMockPatientProfileData = async (): Promise<Patient> => {
  await mockDelay();
  return getMockPatientProfile();
};

const getMockDashboardStats = async (): Promise<{ recordsCount: number; doctorsCount: number }> => {
  await mockDelay();
  return mockDashboardStats;
};

// ============================================================================
// Service
// ============================================================================

export const patientDataService = {
  /**
   * Get patient profile from API
   */
  getPatientProfile: async (): Promise<PatientDetailsDto> => {
    return getApiPatientsMe();
  },

  /**
   * Update patient profile
   */
  updatePatientProfile: async (data: PatientEditRequestDto): Promise<PatientEditResponseDto> => {
    return putApiPatientsMe(data);
  },

  /**
   * Register a new patient (uses explicit token for auth callback flow)
   */
  registerPatient: async (data: PatientAddRequestDto, token: string): Promise<PatientAddResponseDto> => {
    return customInstanceWithToken<PatientAddResponseDto>(
      '/api/patients',
      token,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Get appointments summary
   */
  getAppointmentsSummary: async (
    data: PatientAppointmentsSummaryRequestDto
  ): Promise<PatientAppointmentsSummaryResponseDto> => {
    return postApiPatientsAppointmentsSummary(data);
  },

  /**
   * Get all appointments (mock only)
   */
  getAppointments: async (): Promise<Appointment[]> => {
    return getMockAppointments();
  },

  /**
   * Get all prescriptions (mock only)
   */
  getPrescriptions: async (): Promise<Prescription[]> => {
    return getMockPrescriptions();
  },

  /**
   * Get dashboard statistics (mock only)
   */
  getDashboardStats: async (): Promise<{ recordsCount: number; doctorsCount: number }> => {
    return getMockDashboardStats();
  },

  /**
   * Get appointments by status
   */
  getAppointmentsByStatus: async (
    status: 'upcoming' | 'completed' | 'cancelled'
  ): Promise<Appointment[]> => {
    const appointments = await patientDataService.getAppointments();
    return appointments.filter(apt => apt.status === status);
  },

  /**
   * Get appointment by ID
   */
  getAppointmentById: async (id: string): Promise<Appointment | undefined> => {
    const appointments = await patientDataService.getAppointments();
    return appointments.find(apt => apt.id === id);
  },

  /**
   * Get prescription by ID
   */
  getPrescriptionById: async (id: string): Promise<Prescription | undefined> => {
    const prescriptions = await patientDataService.getPrescriptions();
    return prescriptions.find(rx => rx.id === id);
  },
};
