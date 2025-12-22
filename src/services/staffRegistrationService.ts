/**
 * Staff Registration Service
 * Handles staff registration with invitation code validation
 */

import { env } from "@/config/env";
import { httpClient } from "@/api/httpClient";
import {
  StaffRegistrationRequest,
  StaffRegistrationResponse,
  InvitationCodeValidation,
} from "@/types/registration.types";

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  register: `${env.api.baseUrl}/staff/register`,
  validateInvitationCode: `${env.api.baseUrl}/invitation-codes/validate`,
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Validate an invitation code for staff registration
 * Returns entity info (doctor/clinic) if valid
 */
export const validateInvitationCode = async (
  code: string
): Promise<InvitationCodeValidation> => {
  try {
    const response = await httpClient.post<InvitationCodeValidation>(
      ENDPOINTS.validateInvitationCode,
      {
        body: { code, type: "staff" },
      }
    );
    return response;
  } catch (error) {
    return {
      valid: false,
      errorMessage: "Invalid or expired invitation code. Please contact your employer for a valid code.",
    };
  }
};

/**
 * Register a new staff member
 * Requires valid invitation code that was previously validated
 */
export const registerStaff = async (
  data: StaffRegistrationRequest
): Promise<StaffRegistrationResponse> => {
  return httpClient.post<StaffRegistrationResponse>(ENDPOINTS.register, {
    body: data,
  });
};

// ============================================================================
// Service Object Export
// ============================================================================

export const staffRegistrationService = {
  validateInvitationCode,
  registerStaff,
};

export default staffRegistrationService;
