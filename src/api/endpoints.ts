/**
 * Centralized API Endpoints Configuration
 *
 * All API endpoints are organized by feature/domain for easy maintenance.
 * Usage: API.Patients.Profile, API.Doctors.Appointments, etc.
 */

import { env } from "@/config/env";

const BASE_URL = env.api.baseUrl;

/**
 * API Endpoints organized by feature
 */
export const API = {
  /**
   * Authentication & Registration endpoints
   */
  Auth: {
    /** Patient registration endpoint */
    PatientRegistration: `${BASE_URL}/api/patients`,
    /** Doctor registration endpoint */
    DoctorRegistration: `${BASE_URL}/api/doctors`,
  },

  /**
   * Patient-related endpoints
   */
  Patients: {
    /** Base patients endpoint */
    Base: `${BASE_URL}/api/patients`,
    /** Patient profile */
    Profile: `${BASE_URL}/api/patients/profile`,
    /** Patient appointments */
    Appointments: `${BASE_URL}/api/patients/appointments`,
    /** Patient prescriptions */
    Prescriptions: `${BASE_URL}/api/patients/prescriptions`,
    /** Patient dashboard stats */
    Stats: `${BASE_URL}/api/patients/stats`,
    /** Patient medical records */
    MedicalRecords: `${BASE_URL}/api/patients/medical-records`,
  },

  /**
   * Doctor-related endpoints
   */
  Doctors: {
    /** Base doctors endpoint */
    Base: `${BASE_URL}/api/doctors`,
    /** Doctor profile */
    Profile: `${BASE_URL}/api/doctor/profile`,
    /** Doctor appointments */
    Appointments: `${BASE_URL}/api/doctor/appointments`,
    /** Doctor dashboard stats */
    Stats: `${BASE_URL}/api/doctor/stats`,
    /** Doctor weekly schedule overview */
    WeeklySchedule: `${BASE_URL}/api/doctor/weekly-schedule`,
    /** Doctor clinics */
    Clinics: `${BASE_URL}/api/doctor/clinics`,
    /** Doctor schedule settings */
    ScheduleSettings: `${BASE_URL}/api/doctor/schedule-settings`,
    /** Doctor blocked time slots */
    BlockedTime: `${BASE_URL}/api/doctor/blocked-time`,
    /** Doctor prescriptions */
    Prescriptions: `${BASE_URL}/api/doctor/prescriptions`,
  },

  /**
   * Pharmacy-related endpoints
   */
  Pharmacies: {
    /** Base pharmacies endpoint */
    Base: `${BASE_URL}/api/pharmacies`,
    /** Search pharmacies */
    Search: `${BASE_URL}/api/pharmacies/search`,
    /** Nearby pharmacies */
    Nearby: `${BASE_URL}/api/pharmacies/nearby`,
  },

  /**
   * Appointment-related endpoints
   */
  Appointments: {
    /** Base appointments endpoint */
    Base: `${BASE_URL}/api/appointments`,
    /** Book new appointment */
    Book: `${BASE_URL}/api/appointments/book`,
    /** Cancel appointment */
    Cancel: (id: string) => `${BASE_URL}/api/appointments/${id}/cancel`,
    /** Reschedule appointment */
    Reschedule: (id: string) => `${BASE_URL}/api/appointments/${id}/reschedule`,
    /** Get appointment by ID */
    ById: (id: string) => `${BASE_URL}/api/appointments/${id}`,
  },

  /**
   * Medical Records endpoints
   */
  MedicalRecords: {
    /** Base medical records endpoint */
    Base: `${BASE_URL}/api/medical-records`,
    /** Get record by ID */
    ById: (id: string) => `${BASE_URL}/api/medical-records/${id}`,
    /** Upload attachment */
    Upload: `${BASE_URL}/api/medical-records/upload`,
  },

  /**
   * Location-related endpoints (governorates, districts, localities)
   */
  Locations: {
    /** Get all governorates */
    Governorates: `${BASE_URL}/api/locations/governorates`,
    /** Get districts by governorate */
    Districts: (governorateId: number) => `${BASE_URL}/api/locations/governorates/${governorateId}/districts`,
    /** Get localities by district */
    Localities: (districtId: number) => `${BASE_URL}/api/locations/districts/${districtId}/localities`,
  },
} as const;

/**
 * Helper type to get endpoint string type
 */
export type ApiEndpoint = string;
