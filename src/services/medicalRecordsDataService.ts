/**
 * Medical Records Data Service
 *
 * This service provides a unified interface for accessing medical records data.
 * It automatically toggles between mock data and API calls based on the
 * VITE_USE_MOCK_DATA environment variable.
 *
 * Usage:
 * - Set VITE_USE_MOCK_DATA=false in .env to use real API
 * - Set VITE_USE_MOCK_DATA=true (or omit) to use mock data
 */

import { env } from "@/config/env";
import { MedicalRecord } from "@/types";
import { mockMedicalRecords } from "@/data/mockMedicalRecords";

// API endpoints
const API_ENDPOINTS = {
  records: `${env.api.baseUrl}/patient/medical-records`,
  recordById: (id: string) => `${env.api.baseUrl}/patient/medical-records/${id}`,
};

// Mock data functions
const getMockMedicalRecords = async (): Promise<MedicalRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockMedicalRecords;
};

const getMockMedicalRecordById = async (id: string): Promise<MedicalRecord | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockMedicalRecords.find(record => record.id === id);
};

// API data functions
const getApiMedicalRecords = async (): Promise<MedicalRecord[]> => {
  const response = await fetch(API_ENDPOINTS.records, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch medical records: ${response.statusText}`);
  }

  return response.json();
};

const getApiMedicalRecordById = async (id: string): Promise<MedicalRecord | undefined> => {
  const response = await fetch(API_ENDPOINTS.recordById(id), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new Error(`Failed to fetch medical record: ${response.statusText}`);
  }

  return response.json();
};

// Public API
export const medicalRecordsDataService = {
  /**
   * Get all medical records for the current patient
   */
  getMedicalRecords: async (): Promise<MedicalRecord[]> => {
    if (env.features.useMockData) {
      return getMockMedicalRecords();
    }
    return getApiMedicalRecords();
  },

  /**
   * Get a specific medical record by ID
   */
  getMedicalRecordById: async (id: string): Promise<MedicalRecord | undefined> => {
    if (env.features.useMockData) {
      return getMockMedicalRecordById(id);
    }
    return getApiMedicalRecordById(id);
  },

  /**
   * Get medical records filtered by type
   */
  getMedicalRecordsByType: async (type: MedicalRecord['type']): Promise<MedicalRecord[]> => {
    const records = await medicalRecordsDataService.getMedicalRecords();
    return records.filter(record => record.type === type);
  },

  /**
   * Get medical records within a date range
   */
  getMedicalRecordsByDateRange: async (startDate: string, endDate: string): Promise<MedicalRecord[]> => {
    const records = await medicalRecordsDataService.getMedicalRecords();
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
  },

  /**
   * Get medical records by doctor
   */
  getMedicalRecordsByDoctor: async (doctorId: string): Promise<MedicalRecord[]> => {
    const records = await medicalRecordsDataService.getMedicalRecords();
    return records.filter(record => record.doctorId === doctorId);
  },

  /**
   * Get records with upcoming follow-up appointments
   */
  getRecordsWithFollowUp: async (): Promise<MedicalRecord[]> => {
    const records = await medicalRecordsDataService.getMedicalRecords();
    const today = new Date();
    return records.filter(record => {
      if (!record.followUpDate) return false;
      return new Date(record.followUpDate) >= today;
    });
  },

  /**
   * Get statistics about medical records
   */
  getRecordStatistics: async () => {
    const records = await medicalRecordsDataService.getMedicalRecords();

    return {
      total: records.length,
      byType: {
        visit: records.filter(r => r.type === 'visit').length,
        lab: records.filter(r => r.type === 'lab').length,
        imaging: records.filter(r => r.type === 'imaging').length,
        vaccination: records.filter(r => r.type === 'vaccination').length,
        procedure: records.filter(r => r.type === 'procedure').length,
      },
      recentCount: records.filter(r => {
        const recordDate = new Date(r.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return recordDate >= thirtyDaysAgo;
      }).length,
    };
  },
};

// Helper to check if using mock data
export const isUsingMockData = () => env.features.useMockData;
