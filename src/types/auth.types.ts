/**
 * Authentication Types and Interfaces
 * Provides type safety for all authentication-related operations
 */

export type UserRole = "patient" | "doctor" | "admin";

export type AuthProvider = "keycloak" | "google" | "facebook";

export type EmailVerificationStatus = "pending" | "verified" | "expired" | "failed";

/**
 * User information from authentication provider
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
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: number;
  provider: AuthProvider;
  // Additional user attributes from Keycloak
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  locale?: string;
  bloodType?: string;
  // Doctor-specific fields
  specialty?: string;
  medicalCertification?: string;
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
 * Authentication error
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AuthError";
  }
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
  getAccessToken(): string | null;
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
}
