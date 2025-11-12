/**
 * Schedule Settings Service
 *
 * This service provides a unified interface for managing doctor schedule settings.
 * It automatically toggles between mock data and API calls based on the
 * VITE_USE_MOCK_DATA environment variable.
 *
 * Usage:
 * - Set VITE_USE_MOCK_DATA=false in .env to use real API
 * - Set VITE_USE_MOCK_DATA=true (or omit) to use mock data
 */

import { env } from "@/config/env";
import { ScheduleSettings, Clinic } from "@/types";
import { mockScheduleSettings } from "@/data/mockScheduleSettings";
import { mockClinics } from "@/data/mockClinics";

// API endpoints
const API_ENDPOINTS = {
  clinics: `${env.api.baseUrl}/api/doctor/clinics`,
  scheduleSettings: `${env.api.baseUrl}/api/doctor/schedule-settings`,
};

// Mock data functions
const getMockClinics = async (): Promise<Clinic[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockClinics;
};

const getMockAllScheduleSettings = async (): Promise<ScheduleSettings[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockScheduleSettings;
};

const getMockScheduleSettingsByClinic = async (clinicId: string): Promise<ScheduleSettings | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const setting = mockScheduleSettings.find(s => s.clinicId === clinicId);
  return setting || null;
};

const updateMockScheduleSettings = async (settings: ScheduleSettings): Promise<ScheduleSettings> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // In mock mode, just return the updated settings with a new timestamp
  return {
    ...settings,
    lastUpdated: new Date().toISOString(),
  };
};

// API data functions
const getApiClinics = async (): Promise<Clinic[]> => {
  const response = await fetch(API_ENDPOINTS.clinics, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch clinics: ${response.statusText}`);
  }

  return response.json();
};

const getApiAllScheduleSettings = async (): Promise<ScheduleSettings[]> => {
  const response = await fetch(API_ENDPOINTS.scheduleSettings, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch schedule settings: ${response.statusText}`);
  }

  return response.json();
};

const getApiScheduleSettingsByClinic = async (clinicId: string): Promise<ScheduleSettings | null> => {
  const response = await fetch(`${API_ENDPOINTS.scheduleSettings}/${clinicId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch schedule settings: ${response.statusText}`);
  }

  return response.json();
};

const updateApiScheduleSettings = async (settings: ScheduleSettings): Promise<ScheduleSettings> => {
  const response = await fetch(`${API_ENDPOINTS.scheduleSettings}/${settings.clinicId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`Failed to update schedule settings: ${response.statusText}`);
  }

  return response.json();
};

// Public API
export const scheduleSettingsService = {
  /**
   * Get all clinics for the doctor
   */
  getClinics: async (): Promise<Clinic[]> => {
    if (env.features.useMockData) {
      return getMockClinics();
    }
    return getApiClinics();
  },

  /**
   * Get all schedule settings for the doctor
   */
  getAllScheduleSettings: async (): Promise<ScheduleSettings[]> => {
    if (env.features.useMockData) {
      return getMockAllScheduleSettings();
    }
    return getApiAllScheduleSettings();
  },

  /**
   * Get schedule settings for a specific clinic
   */
  getScheduleSettingsByClinic: async (clinicId: string): Promise<ScheduleSettings | null> => {
    if (env.features.useMockData) {
      return getMockScheduleSettingsByClinic(clinicId);
    }
    return getApiScheduleSettingsByClinic(clinicId);
  },

  /**
   * Update schedule settings for a specific clinic
   */
  updateScheduleSettings: async (settings: ScheduleSettings): Promise<ScheduleSettings> => {
    if (env.features.useMockData) {
      return updateMockScheduleSettings(settings);
    }
    return updateApiScheduleSettings(settings);
  },
};

// Helper to check if using mock data
export const isUsingMockData = () => env.features.useMockData;
