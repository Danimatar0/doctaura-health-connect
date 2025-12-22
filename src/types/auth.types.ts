/**
 * Authentication Types and Interfaces
 * Provides type safety for all authentication-related operations
 */

export type UserRole = "patient" | "doctor" | "staff" | "admin";

export type AuthProvider = "keycloak" | "google" | "facebook";

export type EmailVerificationStatus = "pending" | "verified" | "expired" | "failed";

/**
 * User information from authentication provider
 * Note: accessToken and refreshToken are now stored in HTTP-only cookies
 * and are no longer accessible from JavaScript for security
 */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  profilePicture?: string;
  phone?: string;
  /** @deprecated Tokens are now stored in HTTP-only cookies */
  accessToken?: string;
  /** @deprecated Tokens are now stored in HTTP-only cookies */
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  provider: AuthProvider;
  // Additional user attributes from Keycloak
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  locale?: string;
  bloodType?: string;
  // Location fields (stored as strings in Keycloak, converted to numbers for API)
  governorateId?: string;
  districtId?: string;
  localityId?: string;
  // Doctor-specific fields
  specialty?: string;
  specialtyId?: number;
  medicalCertification?: string;
  medicalLicenseNumber?: string;
  yearsOfExperience?: number;
  consultationType?: "in_person" | "video" | "both";
  consultationFee?: number;
  practiceType?: "private_clinic" | "hospital_employee" | "existing_clinic";
  // Staff-specific fields
  staffRole?: "receptionist" | "nurse" | "lab_technician" | "admin_assistant" | "other";
  customStaffRole?: string;
  linkedEntityType?: "doctor" | "clinic";
  linkedEntityId?: string | number;
  linkedEntityName?: string;
  // Metadata
  roleAssignedAt?: string;
}

/**
 * Token response from Keycloak
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in?: number;
  scope?: string;
}

/**
 * User info response from Keycloak
 */
export interface KeycloakUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
  phone_number?: string;
  phone?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  attributes?: {
    [key: string]: string | string[];
  };
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  acceptTerms: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  locale?: string;
  bloodType?: string;
  // Location fields
  governorateId?: string;
  districtId?: string;
  localityId?: string;
  // Doctor-specific fields
  specialty?: string;
  medicalCertification?: string;
  // email, id, and role are immutable
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  email: string;
  redirectUrl?: string;
}

/**
 * Email verification response
 */
export interface EmailVerificationResponse {
  status: EmailVerificationStatus;
  message: string;
  expiresAt?: number;
}

/**
 * Authentication error types
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = "invalid_credentials",
  EMAIL_NOT_VERIFIED = "email_not_verified",
  USER_NOT_FOUND = "user_not_found",
  USER_ALREADY_EXISTS = "user_already_exists",
  INVALID_TOKEN = "invalid_token",
  TOKEN_EXPIRED = "token_expired",
  NETWORK_ERROR = "network_error",
  SERVER_ERROR = "server_error",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  VALIDATION_ERROR = "validation_error",
  UNKNOWN_ERROR = "unknown_error",
}

/**
 * User-friendly error messages for each auth error code
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: "Invalid email or password. Please check your credentials and try again.",
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: "Please verify your email address before logging in.",
  [AuthErrorCode.USER_NOT_FOUND]: "No account found with this email address.",
  [AuthErrorCode.USER_ALREADY_EXISTS]: "An account with this email already exists.",
  [AuthErrorCode.INVALID_TOKEN]: "Your session has expired. Please log in again.",
  [AuthErrorCode.TOKEN_EXPIRED]: "Your session has expired. Please log in again.",
  [AuthErrorCode.NETWORK_ERROR]: "Unable to connect to the server. Please check your internet connection.",
  [AuthErrorCode.SERVER_ERROR]: "Something went wrong on our end. Please try again later.",
  [AuthErrorCode.UNAUTHORIZED]: "You need to log in to access this resource.",
  [AuthErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [AuthErrorCode.VALIDATION_ERROR]: "Please check your input and try again.",
  [AuthErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
};

/**
 * Authentication error
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public details?: unknown
  ) {
    // Use user-friendly message if available, otherwise use provided message
    super(AUTH_ERROR_MESSAGES[code] || message);
    this.name = "AuthError";
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return AUTH_ERROR_MESSAGES[this.code] || this.message;
  }
}

/**
 * Get user-friendly error message from any error
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.getUserMessage();
  }

  if (error && typeof error === "object") {
    // Check for API error format with message
    if ("message" in error && typeof (error as Record<string, unknown>).message === "string") {
      const message = (error as Record<string, unknown>).message as string;
      // Don't expose raw HTTP status messages
      if (message.match(/^HTTP \d{3}/i) || message.match(/^\d{3}\s/)) {
        return AUTH_ERROR_MESSAGES[AuthErrorCode.SERVER_ERROR];
      }
      return message;
    }

    // Check for status code
    if ("status" in error || "statusCode" in error) {
      const status = (error as Record<string, unknown>).status || (error as Record<string, unknown>).statusCode;
      if (typeof status === "number") {
        switch (status) {
          case 400:
            return AUTH_ERROR_MESSAGES[AuthErrorCode.VALIDATION_ERROR];
          case 401:
            return AUTH_ERROR_MESSAGES[AuthErrorCode.INVALID_CREDENTIALS];
          case 403:
            return AUTH_ERROR_MESSAGES[AuthErrorCode.FORBIDDEN];
          case 404:
            return AUTH_ERROR_MESSAGES[AuthErrorCode.USER_NOT_FOUND];
          case 409:
            return AUTH_ERROR_MESSAGES[AuthErrorCode.USER_ALREADY_EXISTS];
          case 500:
          case 502:
          case 503:
            return AUTH_ERROR_MESSAGES[AuthErrorCode.SERVER_ERROR];
          default:
            return AUTH_ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR];
        }
      }
    }
  }

  if (error instanceof Error) {
    // Don't expose raw error messages that might contain technical details
    if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("CORS")) {
      return AUTH_ERROR_MESSAGES[AuthErrorCode.NETWORK_ERROR];
    }
    return error.message;
  }

  return AUTH_ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR];
}

/**
 * Auth service interface
 * Defines the contract for authentication operations
 */
export interface IAuthService {
  // Authentication
  login(credentials: LoginCredentials): Promise<AuthUser>;
  register(data: RegistrationData): Promise<AuthUser>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthUser | null>;

  // OAuth Flow
  redirectToLogin(role: UserRole): Promise<void>;
  redirectToRegister(role: UserRole): Promise<void>;
  handleCallback(code: string, state?: string): Promise<AuthUser>;

  // User Management
  getCurrentUser(): AuthUser | null;
  isAuthenticated(): boolean;
  getUserRole(): UserRole | null;

  // Email Verification
  sendEmailVerification(request: EmailVerificationRequest): Promise<EmailVerificationResponse>;
  verifyEmail(token: string): Promise<boolean>;
  resendEmailVerification(email: string): Promise<boolean>;

  // Password Management
  requestPasswordReset(request: PasswordResetRequest): Promise<boolean>;
  resetPassword(confirmation: PasswordResetConfirmation): Promise<boolean>;
  changePassword(currentPassword: string, newPassword: string): Promise<boolean>;

  // Token Management
  /** @deprecated Tokens are now stored in HTTP-only cookies */
  getAccessToken(): string | null;
  /** @deprecated Tokens are now stored in HTTP-only cookies */
  getRefreshToken(): string | null;
  isTokenValid(token: string): boolean;
  getTokenExpiry(token: string): number | null;

  // Utility
  getDashboardUrl(role: UserRole): string;
  clearSession(): void;
}

/**
 * Storage keys for auth data
 */
export const AuthStorageKeys = {
  USER: "doctaura_auth_user",
  ROLE: "doctaura_auth_role",
  STATE: "doctaura_auth_state",
  REDIRECT: "doctaura_auth_redirect",
  CODE_VERIFIER: "doctaura_auth_code_verifier",
} as const;

/**
 * OAuth state parameter
 */
export interface OAuthState {
  role: UserRole;
  redirectUrl?: string;
  timestamp: number;
  nonce: string;
  isNewRegistration?: boolean; // Flag to identify new user registrations
}
