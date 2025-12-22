/**
 * Authentication Service
 * Handles all authentication operations via REST API
 * Backend uses Keycloak internally, but frontend only interacts with REST endpoints
 */

import { env } from "@/config/env";
import { httpClient, ApiError } from "@/api/httpClient";
import { customInstance, ApiError as CustomApiError } from "@/api/mutator/customInstance";
import {
  AuthUser,
  UserRole,
  AuthStorageKeys,
  AuthError,
  AuthErrorCode,
} from "@/types/auth.types";
import { Gender } from "@/types/generated/gender";

// ============= API Request/Response Types =============

/**
 * Login request payload
 * Matches backend LoginRequestDto
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * User information returned after login
 * Matches backend UserInfoDto
 */
export interface UserInfoDto {
  /** Keycloak user ID */
  id: string;
  /** Username - ENCRYPTED in response */
  username: string;
  /** Email address */
  email?: string;
  /** Whether email is verified */
  emailVerified: boolean;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** User's roles */
  roles: string[];
}

/**
 * Login response payload
 * Matches backend LoginResponseDto
 */
export interface LoginResponse {
  /** JWT access token (stored in HTTP-only cookie) */
  accessToken?: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** Token type (always "Bearer") */
  tokenType: string;
  /** Access token expiration time in seconds */
  expiresIn: number;
  /** Refresh token expiration time in seconds */
  refreshExpiresIn: number;
  /** UTC timestamp when access token expires */
  expiresAt: string;
  /** User information */
  user?: UserInfoDto;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PatientRegistrationRequest {
  firstname: string;
  lastname: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  email: string;
  password: string;
  countryId?: number;
  governorateId?: number;
  districtId?: number;
  localityId?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
}

export interface PatientRegistrationResponse {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId: string;
  username: string;
  expiresAt: string;
  roles: string[];
  message: string | null;
}

export interface ApiMessageResponse {
  message: string;
}

// ============= Auth Service Class =============

class AuthService {
  private readonly baseUrl = env.api.baseUrl;

  // API endpoints
  private readonly endpoints = {
    login: `${this.baseUrl}/auth/login`,
    refreshToken: `${this.baseUrl}/auth/refresh-token`,
    logout: `${this.baseUrl}/auth/logout`,
    me: `${this.baseUrl}/auth/me`,
    forgotPassword: `${this.baseUrl}/auth/forgot-password`,
    changePassword: `${this.baseUrl}/auth/change-password`,
    resendVerification: `${this.baseUrl}/auth/resend-verification`,
    validateToken: `${this.baseUrl}/auth/validate-token`,
    patientRegister: `${this.baseUrl}/patients/register`,
  };

  /**
   * Login with email/username and password
   * Tokens are now stored in HTTP-only cookies by the backend
   *
   * Encryption Flow:
   * 1. Anonymous encryption session established on app load
   * 2. Login request uses encrypted fields (username, password)
   * 3. Response decrypts user.username
   * 4. After login, session is bound to authenticated user
   *
   * Schema: 'auth-login'
   * - requestFields: ['username', 'password']
   * - responseFields: ['user.username']
   */
  async login(email: string, password: string, rememberMe = false): Promise<AuthUser> {
    try {
      const requestBody: LoginRequest = {
        username: email,
        password,
        rememberMe,
      };

      // Use customInstance with encryption
      // Anonymous session must be established before calling this
      const response = await customInstance<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        encryption: { schemaId: 'auth-login' },
      });

      const user = this.mapLoginResponseToAuthUser(response, rememberMe);
      this.saveUser(user, rememberMe);

      return user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a new patient
   */
  async registerPatient(data: PatientRegistrationRequest): Promise<PatientRegistrationResponse> {
    try {
      const response = await httpClient.post<PatientRegistrationResponse>(
        this.endpoints.patientRegister,
        {
          body: data,
        }
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh the access token
   * The refresh token is read from HTTP-only cookie by the backend
   */
  async refreshToken(): Promise<AuthUser | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      // Backend reads refresh token from HTTP-only cookie
      const response = await httpClient.post<LoginResponse>(this.endpoints.refreshToken);

      const updatedUser = this.mapLoginResponseToAuthUser(response);
      this.saveUser(updatedUser);

      return updatedUser;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Logout and revoke tokens
   * The backend reads tokens from HTTP-only cookies and clears them
   */
  async logout(): Promise<void> {
    try {
      // Backend reads tokens from cookies and clears them
      await httpClient.post<ApiMessageResponse>(this.endpoints.logout);
    } catch (error) {
      console.error("Logout error:", error);
    }

    this.clearSession();
  }

  /**
   * Get current user info from API
   */
  async fetchCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await httpClient.get<LoginResponse["user"]>(this.endpoints.me);
      const currentUser = this.getCurrentUser();

      if (currentUser) {
        const updatedUser: AuthUser = {
          ...currentUser,
          id: response.id,
          email: response.email,
          emailVerified: response.emailVerified,
          firstName: response.firstName,
          lastName: response.lastName,
          name: `${response.firstName} ${response.lastName}`.trim(),
          role: this.extractRole(response.roles),
        };
        this.saveUser(updatedUser);
        return updatedUser;
      }

      return null;
    } catch (error) {
      console.error("Fetch current user failed:", error);
      return null;
    }
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await httpClient.post<ApiMessageResponse>(
        this.endpoints.forgotPassword,
        {
          body: { email } as ForgotPasswordRequest,
        }
      );
      return response.message;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<string> {
    try {
      const response = await httpClient.post<ApiMessageResponse>(
        this.endpoints.changePassword,
        {
          body: {
            currentPassword,
            newPassword,
            confirmNewPassword,
          } as ChangePasswordRequest,
        }
      );
      return response.message;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(): Promise<string> {
    try {
      const response = await httpClient.post<ApiMessageResponse>(
        this.endpoints.resendVerification
      );
      return response.message;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate current access token
   */
  async validateToken(): Promise<ValidateTokenResponse | null> {
    try {
      const response = await httpClient.get<ValidateTokenResponse>(
        this.endpoints.validateToken
      );
      return response;
    } catch {
      return null;
    }
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): AuthUser | null {
    // Check session storage first
    const sessionUser = sessionStorage.getItem(AuthStorageKeys.USER);
    if (sessionUser) {
      try {
        const user: AuthUser = JSON.parse(sessionUser);
        if (user.expiresAt > Date.now()) {
          return user;
        }
        // Token expired, try to use refresh token
        sessionStorage.removeItem(AuthStorageKeys.USER);
      } catch {
        sessionStorage.removeItem(AuthStorageKeys.USER);
      }
    }

    // Check localStorage for "remember me"
    const persistedUser = localStorage.getItem(AuthStorageKeys.USER);
    if (persistedUser) {
      try {
        const user: AuthUser = JSON.parse(persistedUser);
        if (user.expiresAt > Date.now()) {
          // Restore to session storage
          sessionStorage.setItem(AuthStorageKeys.USER, persistedUser);
          return user;
        }
        // Expired, clear it
        localStorage.removeItem(AuthStorageKeys.USER);
      } catch {
        localStorage.removeItem(AuthStorageKeys.USER);
      }
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.expiresAt > Date.now();
  }

  /**
   * Get user role
   */
  getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role || null;
  }

  /**
   * Get access token
   * @deprecated Tokens are now stored in HTTP-only cookies and not accessible from JavaScript
   */
  getAccessToken(): string | null {
    // Tokens are now stored in HTTP-only cookies
    return null;
  }

  /**
   * Get dashboard URL based on role
   */
  getDashboardUrl(role?: UserRole): string {
    const userRole = role || this.getUserRole();
    switch (userRole) {
      case "doctor":
        return "/doctor-dashboard";
      case "patient":
        return "/patient-dashboard";
      case "staff":
        return "/staff-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/";
    }
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    sessionStorage.removeItem(AuthStorageKeys.USER);
    sessionStorage.removeItem(AuthStorageKeys.ROLE);
    sessionStorage.removeItem(AuthStorageKeys.STATE);
    sessionStorage.removeItem(AuthStorageKeys.REDIRECT);
    sessionStorage.removeItem(AuthStorageKeys.CODE_VERIFIER);
    localStorage.removeItem(AuthStorageKeys.USER);
    // Also clear the legacy keycloak storage keys
    sessionStorage.removeItem("keycloak_state");
    sessionStorage.removeItem("keycloak_code_verifier");
    localStorage.removeItem("keycloak_user");
  }

  // ============= Private Helper Methods =============

  private mapLoginResponseToAuthUser(
    response: LoginResponse,
    rememberMe = false
  ): AuthUser {
    const expiresAt = new Date(response.expiresAt).getTime();
    const user = response.user;

    if (!user) {
      throw new AuthError(
        AuthErrorCode.SERVER_ERROR,
        "Login response missing user information"
      );
    }

    const role = this.extractRole(user.roles);
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    // Tokens are now stored in HTTP-only cookies, not in the user object
    return {
      id: user.id,
      email: user.email || "",
      emailVerified: user.emailVerified,
      name: `${firstName} ${lastName}`.trim() || user.username,
      firstName,
      lastName,
      role,
      expiresAt,
      provider: "keycloak",
    };
  }

  private extractRole(roles: string[]): UserRole {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("doctor")) return "doctor";
    if (roles.includes("staff")) return "staff";
    if (roles.includes("patient")) return "patient";
    return "patient"; // Default role
  }

  private saveUser(user: AuthUser, rememberMe = false): void {
    sessionStorage.setItem(AuthStorageKeys.USER, JSON.stringify(user));

    // Store in localStorage if rememberMe is true
    if (rememberMe) {
      localStorage.setItem(AuthStorageKeys.USER, JSON.stringify(user));
    }
  }

  private handleError(error: unknown): AuthError {
    // Handle httpClient ApiError
    if (error instanceof ApiError) {
      const code = this.mapStatusToErrorCode(error.statusCode);
      return new AuthError(code, error.message, error.data);
    }

    // Handle customInstance ApiError
    if (error instanceof CustomApiError) {
      const code = this.mapStatusToErrorCode(error.status);
      return new AuthError(code, error.message, error.data);
    }

    if (error instanceof AuthError) {
      return error;
    }

    if (error instanceof Error) {
      return new AuthError(AuthErrorCode.UNKNOWN_ERROR, error.message, error);
    }

    return new AuthError(
      AuthErrorCode.UNKNOWN_ERROR,
      "An unexpected error occurred",
      error
    );
  }

  private mapStatusToErrorCode(status: number): AuthErrorCode {
    switch (status) {
      case 400:
        return AuthErrorCode.VALIDATION_ERROR;
      case 401:
        return AuthErrorCode.INVALID_CREDENTIALS;
      case 403:
        return AuthErrorCode.FORBIDDEN;
      case 404:
        return AuthErrorCode.USER_NOT_FOUND;
      case 409:
        return AuthErrorCode.USER_ALREADY_EXISTS;
      default:
        return AuthErrorCode.SERVER_ERROR;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
