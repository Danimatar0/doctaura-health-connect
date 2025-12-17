/**
 * Doctor Data Service (Mock Only)
 */

import { Doctor, DoctorAppointment, DoctorStats, WeeklySchedule } from "@/types";
import { mockDoctorProfile, mockDoctorStats } from "@/data/mockDoctorProfile";
import { mockDoctorAppointments } from "@/data/mockDoctorAppointments";
import { mockWeeklySchedule } from "@/data/mockWeeklySchedule";

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export const doctorDataService = {
  getDoctorProfile: async (): Promise<Doctor> => {
    await mockDelay();
    return mockDoctorProfile;
  },
  getStats: async (): Promise<DoctorStats> => {
    await mockDelay();
    return mockDoctorStats;
  },
  getWeeklySchedule: async (): Promise<WeeklySchedule[]> => {
    await mockDelay();
    return mockWeeklySchedule;
  },
  getAppointments: async (): Promise<DoctorAppointment[]> => {
    await mockDelay();
    return mockDoctorAppointments;
  },
};
