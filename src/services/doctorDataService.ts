/**
 * Doctor Data Service
 *
 * This service provides a unified interface for accessing doctor-related data.
 * It automatically toggles between mock data and API calls based on the
 * VITE_USE_MOCK_DATA environment variable.
 *
 * Usage:
 * - Set VITE_USE_MOCK_DATA=false in .env to use real API
 * - Set VITE_USE_MOCK_DATA=true (or omit) to use mock data
 */

import { env } from "@/config/env";
import { Doctor, DoctorAppointment, DoctorStats, WeeklySchedule } from "@/types";
import { mockDoctorProfile, mockDoctorStats } from "@/data/mockDoctorProfile";
import { mockDoctorAppointments } from "@/data/mockDoctorAppointments";
import { mockWeeklySchedule } from "@/data/mockWeeklySchedule";

// API endpoints
const API_ENDPOINTS = {
  profile: `${env.api.baseUrl}/api/doctor/profile`,
  appointments: `${env.api.baseUrl}/api/doctor/appointments`,
  stats: `${env.api.baseUrl}/api/doctor/stats`,
  weeklySchedule: `${env.api.baseUrl}/api/doctor/weekly-schedule`,
};

// Mock data functions
const getMockDoctorProfile = async (): Promise<Doctor> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockDoctorProfile;
};

const getMockDoctorAppointments = async (): Promise<DoctorAppointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockDoctorAppointments;
};

const getMockDoctorStats = async (): Promise<DoctorStats> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockDoctorStats;
};

const getMockWeeklySchedule = async (): Promise<WeeklySchedule[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockWeeklySchedule;
};

// API data functions
const getApiDoctorProfile = async (): Promise<Doctor> => {
  const response = await fetch(API_ENDPOINTS.profile, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch doctor profile: ${response.statusText}`);
  }

  return response.json();
};

const getApiDoctorAppointments = async (): Promise<DoctorAppointment[]> => {
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

const getApiDoctorStats = async (): Promise<DoctorStats> => {
  const response = await fetch(API_ENDPOINTS.stats, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch doctor stats: ${response.statusText}`);
  }

  return response.json();
};

const getApiWeeklySchedule = async (): Promise<WeeklySchedule[]> => {
  const response = await fetch(API_ENDPOINTS.weeklySchedule, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch weekly schedule: ${response.statusText}`);
  }

  return response.json();
};

// Public API
export const doctorDataService = {
  /**
   * Get doctor profile information
   */
  getDoctorProfile: async (): Promise<Doctor> => {
    if (env.features.useMockData) {
      return getMockDoctorProfile();
    }
    return getApiDoctorProfile();
  },

  /**
   * Get all appointments for the doctor
   */
  getAppointments: async (): Promise<DoctorAppointment[]> => {
    if (env.features.useMockData) {
      return getMockDoctorAppointments();
    }
    return getApiDoctorAppointments();
  },

  /**
   * Get doctor dashboard statistics
   */
  getStats: async (): Promise<DoctorStats> => {
    if (env.features.useMockData) {
      return getMockDoctorStats();
    }
    return getApiDoctorStats();
  },

  /**
   * Get weekly schedule breakdown
   */
  getWeeklySchedule: async (): Promise<WeeklySchedule[]> => {
    if (env.features.useMockData) {
      return getMockWeeklySchedule();
    }
    return getApiWeeklySchedule();
  },

  /**
   * Get appointments filtered by date
   */
  getAppointmentsByDate: async (date: string): Promise<DoctorAppointment[]> => {
    const appointments = await doctorDataService.getAppointments();
    return appointments.filter(apt => apt.date === date);
  },

  /**
   * Get today's appointments
   */
  getTodayAppointments: async (): Promise<DoctorAppointment[]> => {
    const today = new Date().toISOString().split('T')[0];
    return doctorDataService.getAppointmentsByDate(today);
  },

  /**
   * Get appointments by type
   */
  getAppointmentsByType: async (type: 'in-person' | 'video'): Promise<DoctorAppointment[]> => {
    const appointments = await doctorDataService.getAppointments();
    return appointments.filter(apt => apt.type === type);
  },

  /**
   * Get appointments by status
   */
  getAppointmentsByStatus: async (status: 'upcoming' | 'completed' | 'cancelled'): Promise<DoctorAppointment[]> => {
    const appointments = await doctorDataService.getAppointments();
    return appointments.filter(apt => apt.status === status);
  },
};

// Helper to check if using mock data
export const isUsingMockData = () => env.features.useMockData;
