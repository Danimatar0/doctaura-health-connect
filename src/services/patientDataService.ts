/**
 * Patient Data Service
 *
 * This service provides a unified interface for accessing patient-related data.
 * It automatically toggles between mock data and API calls based on the
 * VITE_USE_MOCK_DATA environment variable.
 *
 * Usage:
 * - Set VITE_USE_MOCK_DATA=false in .env to use real API
 * - Set VITE_USE_MOCK_DATA=true (or omit) to use mock data
 */

import { env } from "@/config/env";
import { Appointment, Prescription, Patient } from "@/types";
import { AuthUser } from "@/types/auth.types";
import { mockAppointments } from "@/data/mockAppointments";
import { mockPrescriptions } from "@/data/mockPrescriptions";
import { getMockPatientProfile, mockDashboardStats } from "@/data/mockPatientProfile";

// API endpoints
const API_ENDPOINTS = {
  appointments: `${env.api.baseUrl}/api/patients/appointments`,
  prescriptions: `${env.api.baseUrl}/api/patients/prescriptions`,
  profile: `${env.api.baseUrl}/api/patients/profile`,
  stats: `${env.api.baseUrl}/api/patients/stats`,
  registration: `${env.api.baseUrl}/api/patients`
};

// Types for patient registration
export interface PatientRegistrationRequest {
  firstname: string;
  lastname: string;
  phone?: string;
  gender: number; // 0 = male, 1 = female, 2 = other
  dateOfBirth: string; // Format: "YYYY-MM-DD"
  email: string;
  governorateId?: number | null; // Optional: User's governorate ID
  districtId?: number | null; // Optional: User's district ID
  localityId?: number | null; // Optional: User's locality ID
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  preferredLanguage: string; // e.g., "en", "ar", "fr"
}

export interface PatientRegistrationResponse {
  id: string;
  message: string;
}

/**
 * Helper function to convert AuthUser (from Keycloak) to PatientRegistrationRequest
 * Maps Keycloak user attributes to the backend API format
 */
export function convertAuthUserToPatientRequest(user: AuthUser): PatientRegistrationRequest {
  // Convert gender string to number (0 = male, 1 = female, 2 = other)
  const genderMap: Record<string, number> = {
    'male': 0,
    'female': 1,
    'other': 2,
  };
  const gender = user.gender ? genderMap[user.gender.toLowerCase()] ?? 2 : 2;

  // Extract preferred language from locale or default to 'en'
  const preferredLanguage = user.locale?.split('-')[0] || 'en';

  // Convert location IDs to numbers (they come as strings from Keycloak)
  const governorateId = user.governorateId ? parseInt(user.governorateId, 10) : null;
  const districtId = user.districtId ? parseInt(user.districtId, 10) : null;
  const localityId = user.localityId ? parseInt(user.localityId, 10) : null;

  return {
    firstname: user.firstName || user.name.split(' ')[0] || '',
    lastname: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
    phone: user.phone || '',
    gender,
    dateOfBirth: user.dateOfBirth || '',
    email: user.email,
    governorateId: isNaN(governorateId as number) ? null : governorateId,
    districtId: isNaN(districtId as number) ? null : districtId,
    localityId: isNaN(localityId as number) ? null : localityId,
    emergencyContactName: '', // Not currently collected in Keycloak form - can be added later
    emergencyContactPhone: '', // Not currently collected in Keycloak form - can be added later
    bloodType: user.bloodType || '',
    allergies: '', // Not currently collected in Keycloak form - can be added later
    chronicConditions: '', // Not currently collected in Keycloak form - can be added later
    preferredLanguage,
  };
}

// Mock data functions (synchronous for simplicity, but wrapped in Promises)
const getMockAppointments = async (): Promise<Appointment[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockAppointments;
};

const getMockPrescriptions = async (): Promise<Prescription[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPrescriptions;
};

const getMockPatientProfileData = async (): Promise<Patient> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return getMockPatientProfile();
};

const getMockDashboardStats = async (): Promise<typeof mockDashboardStats> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockDashboardStats;
};

// API data functions (to be implemented when backend is ready)
const getApiAppointments = async (): Promise<Appointment[]> => {
  const response = await fetch(API_ENDPOINTS.appointments, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch appointments: ${response.statusText}`);
  }

  return response.json();
};

const getApiPrescriptions = async (): Promise<Prescription[]> => {
  const response = await fetch(API_ENDPOINTS.prescriptions, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch prescriptions: ${response.statusText}`);
  }

  return response.json();
};

const getApiPatientProfile = async (): Promise<Patient> => {
  const response = await fetch(API_ENDPOINTS.profile, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch patient profile: ${response.statusText}`);
  }

  return response.json();
};

const getApiDashboardStats = async (): Promise<{ recordsCount: number; doctorsCount: number }> => {
  const response = await fetch(API_ENDPOINTS.stats, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Register a new patient in the backend system
 * This should be called after successful Keycloak registration
 */
const registerPatient = async (
  data: PatientRegistrationRequest,
  token: string
): Promise<PatientRegistrationResponse> => {
  const response = await fetch(API_ENDPOINTS.registration, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `Failed to register patient: ${response.statusText}`
    );
  }

  return response.json();
};


// Public API - automatically switches between mock and real API based on env flag
export const patientDataService = {
  /**
   * Get all appointments for the current patient
   */
  getAppointments: async (): Promise<Appointment[]> => {
    if (env.features.useMockData) {
      return getMockAppointments();
    }
    return getApiAppointments();
  },

  /**
   * Get all prescriptions for the current patient
   */
  getPrescriptions: async (): Promise<Prescription[]> => {
    if (env.features.useMockData) {
      return getMockPrescriptions();
    }
    return getApiPrescriptions();
  },

  /**
   * Get patient profile information
   */
  getPatientProfile: async (): Promise<Patient> => {
    if (env.features.useMockData) {
      return getMockPatientProfileData();
    }
    return getApiPatientProfile();
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<{ recordsCount: number; doctorsCount: number }> => {
    if (env.features.useMockData) {
      return getMockDashboardStats();
    }
    return getApiDashboardStats();
  },

  /**
   * Get filtered appointments by status
   */
  getAppointmentsByStatus: async (status: 'upcoming' | 'completed' | 'cancelled'): Promise<Appointment[]> => {
    const appointments = await patientDataService.getAppointments();
    return appointments.filter(apt => apt.status === status);
  },

  /**
   * Get a single appointment by ID
   */
  getAppointmentById: async (id: string): Promise<Appointment | undefined> => {
    const appointments = await patientDataService.getAppointments();
    return appointments.find(apt => apt.id === id);
  },

  /**
   * Get a single prescription by ID
   */
  getPrescriptionById: async (id: string): Promise<Prescription | undefined> => {
    const prescriptions = await patientDataService.getPrescriptions();
    return prescriptions.find(rx => rx.id === id);
  },

  /**
   * Register a new patient after Keycloak registration
   * This creates the patient record in the backend system
   */
  registerPatient: async (
    data: PatientRegistrationRequest,
    token: string
  ): Promise<PatientRegistrationResponse> => {
    // Always call the real API for registration (no mock)
    return registerPatient(data, token);
  },
};

// Helper to check if using mock data
export const isUsingMockData = () => env.features.useMockData;
