/**
 * Blocked Time Service
 *
 * This service provides a unified interface for managing blocked time slots.
 * It automatically toggles between mock data and API calls based on the
 * VITE_USE_MOCK_DATA environment variable.
 */

import { env } from "@/config/env";
import { BlockedTimeSlot } from "@/types";
import { mockBlockedTimeSlots } from "@/data/mockBlockedTimeSlots";

// In-memory storage for mock data (simulates database)
let mockBlockedTimeStorage = [...mockBlockedTimeSlots];

// API endpoints
const API_ENDPOINTS = {
  blockedTime: `${env.api.baseUrl}/api/doctor/blocked-time`,
};

// Mock data functions
const getMockBlockedTimeSlots = async (clinicId: string): Promise<BlockedTimeSlot[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockBlockedTimeStorage.filter(slot => slot.clinicId === clinicId);
};

const createMockBlockedTimeSlot = async (
  slotData: Omit<BlockedTimeSlot, "id" | "createdAt">
): Promise<BlockedTimeSlot> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const newSlot: BlockedTimeSlot = {
    ...slotData,
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  mockBlockedTimeStorage.push(newSlot);
  return newSlot;
};

const deleteMockBlockedTimeSlot = async (id: string): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  mockBlockedTimeStorage = mockBlockedTimeStorage.filter(slot => slot.id !== id);
};

// API data functions
const getApiBlockedTimeSlots = async (clinicId: string): Promise<BlockedTimeSlot[]> => {
  const response = await fetch(`${API_ENDPOINTS.blockedTime}?clinicId=${clinicId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blocked time slots: ${response.statusText}`);
  }

  return response.json();
};

const createApiBlockedTimeSlot = async (
  slotData: Omit<BlockedTimeSlot, "id" | "createdAt">
): Promise<BlockedTimeSlot> => {
  const response = await fetch(API_ENDPOINTS.blockedTime, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(slotData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create blocked time slot: ${response.statusText}`);
  }

  return response.json();
};

const deleteApiBlockedTimeSlot = async (id: string): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.blockedTime}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete blocked time slot: ${response.statusText}`);
  }
};

// Public API
export const blockedTimeService = {
  /**
   * Get all blocked time slots for a specific clinic
   */
  getBlockedTimeSlots: async (clinicId: string): Promise<BlockedTimeSlot[]> => {
    if (env.features.useMockData) {
      return getMockBlockedTimeSlots(clinicId);
    }
    return getApiBlockedTimeSlots(clinicId);
  },

  /**
   * Create a new blocked time slot
   */
  createBlockedTimeSlot: async (
    slotData: Omit<BlockedTimeSlot, "id" | "createdAt">
  ): Promise<BlockedTimeSlot> => {
    if (env.features.useMockData) {
      return createMockBlockedTimeSlot(slotData);
    }
    return createApiBlockedTimeSlot(slotData);
  },

  /**
   * Delete a blocked time slot
   */
  deleteBlockedTimeSlot: async (id: string): Promise<void> => {
    if (env.features.useMockData) {
      return deleteMockBlockedTimeSlot(id);
    }
    return deleteApiBlockedTimeSlot(id);
  },
};
