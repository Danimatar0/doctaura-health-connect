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
import { mockAppointments } from "@/data/mockAppointments";
import { mockPrescriptions } from "@/data/mockPrescriptions";
import { getMockPatientProfile, mockDashboardStats } from "@/data/mockPatientProfile";

// API endpoints
const API_ENDPOINTS = {
  appointments: `${env.api.baseUrl}/api/patient/appointments`,
  prescriptions: `${env.api.baseUrl}/api/patient/prescriptions`,
  profile: `${env.api.baseUrl}/api/patient/profile`,
  stats: `${env.api.baseUrl}/api/patient/stats`,
};

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
};

// Helper to check if using mock data
export const isUsingMockData = () => env.features.useMockData;
