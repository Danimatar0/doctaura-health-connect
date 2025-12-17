/**
 * Schedule Settings Service (Mock Only)
 */

import { ScheduleSettings, Clinic } from "@/types";
import { mockScheduleSettings } from "@/data/mockScheduleSettings";
import { mockClinics } from "@/data/mockClinics";

const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const scheduleSettingsService = {
  getClinics: async (): Promise<Clinic[]> => {
    await mockDelay();
    return mockClinics;
  },
  getAllScheduleSettings: async (): Promise<ScheduleSettings[]> => {
    await mockDelay();
    return mockScheduleSettings;
  },
  getScheduleSettingsByClinic: async (clinicId: string): Promise<ScheduleSettings | null> => {
    await mockDelay();
    return mockScheduleSettings.find(s => s.clinicId === clinicId) || null;
  },
  updateScheduleSettings: async (settings: ScheduleSettings): Promise<ScheduleSettings> => {
    await mockDelay();
    return { ...settings, lastUpdated: new Date().toISOString() };
  },
};
