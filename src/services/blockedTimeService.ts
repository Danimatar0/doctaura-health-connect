/**
 * Blocked Time Service (Mock Only)
 */

import { BlockedTimeSlot } from "@/types";
import { mockBlockedTimeSlots } from "@/data/mockBlockedTimeSlots";

let mockStorage = [...mockBlockedTimeSlots];

const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const blockedTimeService = {
  getBlockedTimeSlots: async (clinicId: string): Promise<BlockedTimeSlot[]> => {
    await mockDelay();
    return mockStorage.filter(slot => slot.clinicId === clinicId);
  },
  createBlockedTimeSlot: async (
    slotData: Omit<BlockedTimeSlot, "id" | "createdAt">
  ): Promise<BlockedTimeSlot> => {
    await mockDelay();
    const newSlot: BlockedTimeSlot = {
      ...slotData,
      id: `block-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockStorage.push(newSlot);
    return newSlot;
  },
  deleteBlockedTimeSlot: async (id: string): Promise<void> => {
    await mockDelay();
    mockStorage = mockStorage.filter(slot => slot.id !== id);
  },
};
