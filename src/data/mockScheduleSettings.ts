import { ScheduleSettings } from "@/types";

export const mockScheduleSettings: ScheduleSettings = {
  id: "schedule-1",
  doctorId: "doc-1",
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
  appointmentDuration: 30, // 30 minutes
  bufferTime: 10, // 10 minutes between appointments
  maxPatientsPerDay: 20,
  lastUpdated: new Date().toISOString(),
};
