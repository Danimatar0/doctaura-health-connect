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
import { ScheduleSettings } from "@/types";
import { mockScheduleSettings } from "@/data/mockScheduleSettings";

// API endpoints
const API_ENDPOINTS = {
  scheduleSettings: `${env.api.baseUrl}/api/doctor/schedule-settings`,
};

// Mock data functions
const getMockScheduleSettings = async (): Promise<ScheduleSettings> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockScheduleSettings;
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
const getApiScheduleSettings = async (): Promise<ScheduleSettings> => {
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

const updateApiScheduleSettings = async (settings: ScheduleSettings): Promise<ScheduleSettings> => {
  const response = await fetch(API_ENDPOINTS.scheduleSettings, {
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
   * Get schedule settings for the doctor
   */
  getScheduleSettings: async (): Promise<ScheduleSettings> => {
    if (env.features.useMockData) {
      return getMockScheduleSettings();
    }
    return getApiScheduleSettings();
  },

  /**
   * Update schedule settings
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
