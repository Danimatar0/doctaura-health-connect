import { ScheduleSettings } from "@/types";

export const mockScheduleSettings: ScheduleSettings[] = [
  {
    id: "schedule-1",
    doctorId: "doc-1",
    clinicId: "clinic-1",
    weeklySchedule: {
      monday: {
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      tuesday: {
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      wednesday: {
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      thursday: {
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      friday: {
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
      saturday: {
        startTime: "10:00",
        endTime: "14:00",
        isAvailable: true,
      },
      sunday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
    },
    appointmentDuration: 30,
    bufferTime: 10,
    maxPatientsPerDay: 20,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "schedule-2",
    doctorId: "doc-1",
    clinicId: "clinic-2",
    weeklySchedule: {
      monday: {
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
      tuesday: {
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
      wednesday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
      thursday: {
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
      friday: {
        startTime: "10:00",
        endTime: "18:00",
        isAvailable: true,
      },
      saturday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
      sunday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
    },
    appointmentDuration: 45,
    bufferTime: 15,
    maxPatientsPerDay: 15,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "schedule-3",
    doctorId: "doc-1",
    clinicId: "clinic-3",
    weeklySchedule: {
      monday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
      tuesday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
      wednesday: {
        startTime: "08:00",
        endTime: "16:00",
        isAvailable: true,
      },
      thursday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
      friday: {
        startTime: "08:00",
        endTime: "16:00",
        isAvailable: true,
      },
      saturday: {
        startTime: "09:00",
        endTime: "13:00",
        isAvailable: true,
      },
      sunday: {
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      },
    },
    appointmentDuration: 30,
    bufferTime: 10,
    maxPatientsPerDay: 12,
    lastUpdated: new Date().toISOString(),
  },
];
