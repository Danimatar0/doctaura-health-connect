/**
 * Doctor Registration Service
 * Handles doctor registration, certification uploads, and clinic linking
 */

import { env } from "@/config/env";
import { httpClient } from "@/api/httpClient";
import {
  DoctorRegistrationRequest,
  DoctorRegistrationResponse,
  Specialty,
  Language,
  ClinicSearchResult,
  ClinicLinkRequest,
  ClinicLinkRequestStatus,
  InvitationCodeValidation,
  FileUploadResponse,
  DEFAULT_SPECIALTIES,
  DEFAULT_LANGUAGES,
} from "@/types/registration.types";

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  register: `${env.api.baseUrl}/doctors/register`,
  uploadCertification: `${env.api.baseUrl}/doctors/upload-certification`,
  specialties: `${env.api.baseUrl}/specialties`,
  languages: `${env.api.baseUrl}/languages`,
  searchClinics: `${env.api.baseUrl}/clinics/search`,
  validateInvitationCode: `${env.api.baseUrl}/invitation-codes/validate`,
  submitClinicRequest: (clinicId: number) => `${env.api.baseUrl}/clinics/${clinicId}/doctor-requests`,
  myClinicRequests: `${env.api.baseUrl}/doctors/me/clinic-requests`,
  appealRequest: (requestId: number) => `${env.api.baseUrl}/doctor-requests/${requestId}/appeal`,
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Register a new doctor
 */
export const registerDoctor = async (
  data: DoctorRegistrationRequest
): Promise<DoctorRegistrationResponse> => {
  return httpClient.post<DoctorRegistrationResponse>(ENDPOINTS.register, {
    body: data,
  });
};

/**
 * Upload medical certification file
 */
export const uploadCertification = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(ENDPOINTS.uploadCertification, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload certification file");
  }

  return response.json();
};

/**
 * Get all specialties
 * Falls back to default list if API fails
 */
export const getSpecialties = async (): Promise<Specialty[]> => {
  try {
    const response = await httpClient.get<Specialty[]>(ENDPOINTS.specialties);
    return response.length > 0 ? response : DEFAULT_SPECIALTIES;
  } catch (error) {
    console.warn("Failed to fetch specialties, using defaults:", error);
    return DEFAULT_SPECIALTIES;
  }
};

/**
 * Get all languages
 * Falls back to default list if API fails
 */
export const getLanguages = async (): Promise<Language[]> => {
  try {
    const response = await httpClient.get<Language[]>(ENDPOINTS.languages);
    return response.length > 0 ? response : DEFAULT_LANGUAGES;
  } catch (error) {
    console.warn("Failed to fetch languages, using defaults:", error);
    return DEFAULT_LANGUAGES;
  }
};

/**
 * Search for clinics by name or location
 */
export const searchClinics = async (query: string): Promise<ClinicSearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await httpClient.get<ClinicSearchResult[]>(
      `${ENDPOINTS.searchClinics}?q=${encodeURIComponent(query)}`
    );
    return response;
  } catch (error) {
    console.error("Failed to search clinics:", error);
    return [];
  }
};

/**
 * Validate an invitation code
 */
export const validateInvitationCode = async (
  code: string
): Promise<InvitationCodeValidation> => {
  try {
    const response = await httpClient.post<InvitationCodeValidation>(
      ENDPOINTS.validateInvitationCode,
      {
        body: { code },
      }
    );
    return response;
  } catch (error) {
    return {
      valid: false,
      errorMessage: "Invalid or expired invitation code",
    };
  }
};

/**
 * Submit a request to link with a clinic
 */
export const submitClinicLinkRequest = async (
  request: ClinicLinkRequest
): Promise<{ requestId: number }> => {
  return httpClient.post<{ requestId: number }>(
    ENDPOINTS.submitClinicRequest(request.clinicId),
    {
      body: { message: request.message },
    }
  );
};

/**
 * Get current doctor's clinic link requests
 */
export const getMyClinicRequests = async (): Promise<ClinicLinkRequestStatus[]> => {
  return httpClient.get<ClinicLinkRequestStatus[]>(ENDPOINTS.myClinicRequests);
};

/**
 * Appeal a rejected clinic link request
 */
export const appealClinicRequest = async (
  requestId: number,
  message: string
): Promise<void> => {
  return httpClient.put<void>(ENDPOINTS.appealRequest(requestId), {
    body: { appealMessage: message },
  });
};

// ============================================================================
// Service Object Export
// ============================================================================

export const doctorRegistrationService = {
  registerDoctor,
  uploadCertification,
  getSpecialties,
  getLanguages,
  searchClinics,
  validateInvitationCode,
  submitClinicLinkRequest,
  getMyClinicRequests,
  appealClinicRequest,
};

export default doctorRegistrationService;
