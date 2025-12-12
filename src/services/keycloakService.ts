import { env } from "@/config/env";
import {
  IAuthService,
  AuthUser,
  LoginCredentials,
  RegistrationData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  EmailVerificationRequest,
  EmailVerificationResponse,
  TokenResponse,
  KeycloakUserInfo,
  UserRole,
  AuthError,
  AuthErrorCode,
  AuthStorageKeys,
  OAuthState,
  EmailVerificationStatus,
  ProfileUpdateData,
} from "@/types/auth.types";

/**
 * Keycloak Service Implementation
 * Handles all authentication operations with Keycloak
 */
class KeycloakService implements IAuthService {
  private readonly baseUrl = env.keycloak.url;
  private readonly realm = env.keycloak.realm;
  private readonly clientId = env.keycloak.clientId;
  private readonly clientSecret = env.keycloak.clientSecret;

  // Keycloak endpoints
  private readonly endpoints = {
    auth: `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/auth`,
    token: `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
    userInfo: `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
    logout: `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/logout`,
    registration: `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/registrations`,
    account: `${this.baseUrl}/realms/${this.realm}/account`,
    // Admin endpoints (requires admin access)
    admin: {
      users: `${this.baseUrl}/admin/realms/${this.realm}/users`,
      emailVerification: `${this.baseUrl}/admin/realms/${this.realm}/users/{userId}/send-verify-email`,
      resetPassword: `${this.baseUrl}/admin/realms/${this.realm}/users/{userId}/reset-password`,
    },
  };

  /**
   * OAuth Login - Redirect to Keycloak login page
   */
  async redirectToLogin(role: UserRole): Promise<void> {
    const state = this.generateState(role);
    this.saveState(state);

    // Generate PKCE parameters
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // Store code verifier for token exchange
    sessionStorage.setItem(AuthStorageKeys.CODE_VERIFIER, codeVerifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: "code",
      scope: "openid profile email phone",
      state: JSON.stringify(state),
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      // Identity provider hint based on role
      kc_idp_hint: role === "doctor" ? "doctor-idp" : "patient-idp",
    });

    window.location.href = `${this.endpoints.auth}?${params.toString()}`;
  }

  /**
   * OAuth Registration - Redirect to Keycloak registration page
   * Supports two strategies:
   * 1. "webapp" - Role is selected in the web app and passed to Keycloak
   * 2. "keycloak" - Role selection is handled by Keycloak theme
   */
  async redirectToRegister(role?: UserRole): Promise<void> {
    const registrationStrategy = env.features.registrationStrategy;

    // For "webapp" strategy, role is required
    // For "keycloak" strategy, role can be undefined (Keycloak will handle it)
    const state = this.generateState(role || "patient", undefined, true); // Mark as new registration
    this.saveState(state);

    // Generate PKCE parameters
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // Store code verifier for token exchange
    sessionStorage.setItem(AuthStorageKeys.CODE_VERIFIER, codeVerifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: "code",
      scope: "openid profile email phone",
      state: JSON.stringify(state),
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      kc_theme: "my-healthcare-theme",
    });

    // Scenario 1: Web app handles role selection
    // Pass role as IDP hint to pre-configure Keycloak
    if (registrationStrategy === "webapp" && role) {
      // params.append("kc_idp_hint", role === "doctor" ? "doctor-idp" : "patient-idp");
      // Optionally pass role as a custom parameter that your Keycloak theme can read
      params.append("kc_role", role);
    }

    // Scenario 2: Keycloak theme handles role selection
    // Don't pass any role-specific parameters, let the theme handle it
    // The theme will display tabs for patient/doctor selection

    window.location.href = `${this.endpoints.registration}?${params.toString()}`;
  }

  /**
   * Direct Login with Credentials (requires Resource Owner Password Credentials flow)
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const body = new URLSearchParams({
        grant_type: "password",
        client_id: this.clientId,
        username: credentials.email,
        password: credentials.password,
        scope: "openid profile email phone",
      });

      if (this.clientSecret) {
        body.append("client_secret", this.clientSecret);
      }

      const response = await this.fetchWithRetry(this.endpoints.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const tokens: TokenResponse = await response.json();
      const user = await this.createAuthUserFromTokens(tokens, credentials.role);

      this.saveUser(user);
      return user;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Register new user
   * Note: Direct registration via API requires admin credentials
   * In most cases, use redirectToRegister() instead
   */
  async register(data: RegistrationData): Promise<AuthUser> {
    // For direct registration, you would need admin credentials
    // This is typically not recommended for production
    // Instead, use redirectToRegister() for OAuth flow
    throw new AuthError(
      AuthErrorCode.UNKNOWN_ERROR,
      "Direct registration not supported. Please use OAuth registration flow."
    );
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, stateParam?: string): Promise<AuthUser> {
    try {
      // Validate state
      const savedState = this.getState();
      if (stateParam && savedState) {
        const receivedState: OAuthState = JSON.parse(stateParam);
        if (receivedState.nonce !== savedState.nonce) {
          throw new AuthError(AuthErrorCode.INVALID_TOKEN, "Invalid state parameter");
        }
      }

      // Get code verifier for PKCE
      const codeVerifier = sessionStorage.getItem(AuthStorageKeys.CODE_VERIFIER);
      if (!codeVerifier) {
        throw new AuthError(AuthErrorCode.INVALID_TOKEN, "Missing code verifier");
      }

      // Exchange code for tokens
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        code: code,
        redirect_uri: this.getRedirectUri(),
        code_verifier: codeVerifier,
      });

      if (this.clientSecret) {
        body.append("client_secret", this.clientSecret);
      }

      const response = await this.fetchWithRetry(this.endpoints.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const tokens: TokenResponse = await response.json();
      const role = savedState?.role || "patient";
      const user = await this.createAuthUserFromTokens(tokens, role);

      this.saveUser(user);
      this.clearState();
      // Clear code verifier after successful exchange
      sessionStorage.removeItem(AuthStorageKeys.CODE_VERIFIER);

      return user;
    } catch (error) {
      this.clearState();
      sessionStorage.removeItem(AuthStorageKeys.CODE_VERIFIER);
      throw this.normalizeError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const user = this.getCurrentUser();
    if (user) {
      try {
        const body = new URLSearchParams({
          client_id: this.clientId,
          refresh_token: user.refreshToken,
        });

        if (this.clientSecret) {
          body.append("client_secret", this.clientSecret);
        }

        await fetch(this.endpoints.logout, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    this.clearSession();

    // Redirect to landing page after logout
    window.location.href = "/";
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthUser | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.clientId,
        refresh_token: user.refreshToken,
      });

      if (this.clientSecret) {
        body.append("client_secret", this.clientSecret);
      }

      const response = await fetch(this.endpoints.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        this.clearSession();
        return null;
      }

      const tokens: TokenResponse = await response.json();
      const updatedUser = await this.createAuthUserFromTokens(tokens, user.role);

      this.saveUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    request: EmailVerificationRequest
  ): Promise<EmailVerificationResponse> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new AuthError(AuthErrorCode.UNAUTHORIZED, "User not authenticated");
      }

      // In production, this should call Keycloak admin API
      // For now, we'll return a mock response
      // You'll need admin credentials or configure Keycloak to allow this

      return {
        status: "pending" as EmailVerificationStatus,
        message: "Verification email sent successfully",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Keycloak handles email verification through its own flow
      // When user clicks the verification link, Keycloak verifies the email
      // Then redirects back to your app

      // You would typically check the email_verified claim in the token
      const user = this.getCurrentUser();
      if (user) {
        // Refresh tokens to get updated email_verified claim
        await this.refreshToken();
      }

      return true;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<boolean> {
    try {
      // This requires admin API access
      // In production, you'd call your backend which has admin credentials
      return true;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<boolean> {
    try {
      // Keycloak handles password reset through its own flow
      // Redirect to password reset page
      const params = new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: window.location.origin + "/login",
      });

      window.location.href = `${this.baseUrl}/realms/${this.realm}/login-actions/reset-credentials?${params.toString()}`;

      return true;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(confirmation: PasswordResetConfirmation): Promise<boolean> {
    // Keycloak handles this through its own UI
    // Your app receives the user back after successful reset
    return true;
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new AuthError(AuthErrorCode.UNAUTHORIZED, "User not authenticated");
      }

      // This would require calling Keycloak account API
      // Or your backend API that has admin credentials
      return true;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<AuthUser> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new AuthError(AuthErrorCode.UNAUTHORIZED, "User not authenticated");
      }

      // Prepare update payload for Keycloak Account API
      const updatePayload: {
        firstName?: string;
        lastName?: string;
        attributes?: Record<string, string[]>;
      } = {};

      if (data.firstName !== undefined) {
        updatePayload.firstName = data.firstName;
      }

      if (data.lastName !== undefined) {
        updatePayload.lastName = data.lastName;
      }

      // Prepare attributes object for custom fields
      const attributes: Record<string, string[]> = {};

      if (data.phone !== undefined) {
        attributes.phone = [data.phone];
      }
      if (data.gender !== undefined) {
        attributes.gender = [data.gender];
      }
      if (data.dateOfBirth !== undefined) {
        attributes.dateOfBirth = [data.dateOfBirth];
      }
      if (data.country !== undefined) {
        attributes.country = [data.country];
      }
      if (data.locale !== undefined) {
        attributes.locale = [data.locale];
      }
      if (data.bloodType !== undefined) {
        attributes.bloodType = [data.bloodType];
      }
      // Location fields
      if (data.governorateId !== undefined) {
        attributes.governorateId = [data.governorateId];
      }
      if (data.districtId !== undefined) {
        attributes.districtId = [data.districtId];
      }
      if (data.localityId !== undefined) {
        attributes.localityId = [data.localityId];
      }
      // Doctor-specific fields
      if (data.specialty !== undefined) {
        attributes.specialty = [data.specialty];
      }
      if (data.medicalCertification !== undefined) {
        attributes.medicalCertification = [data.medicalCertification];
      }

      if (Object.keys(attributes).length > 0) {
        updatePayload.attributes = attributes;
      }

      // Call Keycloak Account API to update profile
      const response = await fetch(this.endpoints.account, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      // Refresh user info after update
      const userInfoResponse = await fetch(this.endpoints.userInfo, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new AuthError(AuthErrorCode.SERVER_ERROR, "Failed to fetch updated user info");
      }

      const userInfo: KeycloakUserInfo = await userInfoResponse.json();

      // Extract custom attributes
      const extractAttribute = (key: string): string | undefined => {
        const value = userInfo.attributes?.[key];
        return Array.isArray(value) ? value[0] : value;
      };

      // Update the user object with new data
      const updatedUser: AuthUser = {
        ...user,
        name: userInfo.name || user.name,
        firstName: userInfo.given_name || data.firstName,
        lastName: userInfo.family_name || data.lastName,
        phone: userInfo.phone_number || extractAttribute("phone") || data.phone,
        gender: extractAttribute("gender") || data.gender,
        dateOfBirth: extractAttribute("dateOfBirth") || data.dateOfBirth,
        country: extractAttribute("country") || data.country,
        locale: extractAttribute("locale") || data.locale,
        bloodType: extractAttribute("bloodType") || data.bloodType,
        // Location fields
        governorateId: extractAttribute("governorateId") || data.governorateId,
        districtId: extractAttribute("districtId") || data.districtId,
        localityId: extractAttribute("localityId") || data.localityId,
        // Doctor-specific fields
        specialty: extractAttribute("specialty") || data.specialty,
        medicalCertification: extractAttribute("medicalCertification") || data.medicalCertification,
        roleAssignedAt: extractAttribute("role_assigned_at"),
      };

      // Save updated user to storage
      this.saveUser(updatedUser);

      return updatedUser;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    const userStr = sessionStorage.getItem(AuthStorageKeys.USER);
    if (!userStr) return null;

    try {
      const user: AuthUser = JSON.parse(userStr);

      // Check if token is expired
      if (user.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }

      return user;
    } catch {
      this.clearSession();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && this.isTokenValid(user.accessToken);
  }

  /**
   * Get user role
   */
  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.getCurrentUser()?.accessToken || null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.getCurrentUser()?.refreshToken || null;
  }

  /**
   * Check if token is valid (not expired)
   */
  isTokenValid(token: string): boolean {
    try {
      const expiry = this.getTokenExpiry(token);
      return expiry !== null && expiry > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Get token expiry timestamp
   */
  getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * Get dashboard URL based on role
   */
  getDashboardUrl(role: UserRole): string {
    switch (role) {
      case "doctor":
        return "/doctor-dashboard";
      case "patient":
        return "/patient-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/";
    }
  }

  /**
   * Get current OAuth state (useful for checking registration status)
   */
  getOAuthState(): OAuthState | null {
    return this.getState();
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    sessionStorage.removeItem(AuthStorageKeys.USER);
    sessionStorage.removeItem(AuthStorageKeys.ROLE);
    sessionStorage.removeItem(AuthStorageKeys.STATE);
    sessionStorage.removeItem(AuthStorageKeys.REDIRECT);
    sessionStorage.removeItem(AuthStorageKeys.CODE_VERIFIER);
  }

  // ===== Private Helper Methods =====

  /**
   * Create AuthUser from token response
   */
  private async createAuthUserFromTokens(tokens: TokenResponse, role: UserRole): Promise<AuthUser> {
    // Get user info from Keycloak
    const userInfoResponse = await fetch(this.endpoints.userInfo, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new AuthError(AuthErrorCode.SERVER_ERROR, "Failed to fetch user info");
    }

    const userInfo: KeycloakUserInfo = await userInfoResponse.json();

    // Extract role from token or user attributes
    const extractedRole = this.extractRole(tokens.access_token, userInfo);
    const finalRole = extractedRole || role;

    const expiresAt = Date.now() + (tokens.expires_in * 1000);

    // Extract custom attributes
    const extractAttribute = (key: string): string | undefined => {
      const value = userInfo.attributes?.[key];
      return Array.isArray(value) ? value[0] : value;
    };

    return {
      id: userInfo.sub,
      email: userInfo.email,
      emailVerified: userInfo.email_verified,
      name: userInfo.name || userInfo.preferred_username || userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      role: finalRole,
      profilePicture: userInfo.picture,
      phone: userInfo.phone_number,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt,
      provider: "keycloak",
      // Additional user attributes
      gender: extractAttribute("gender"),
      dateOfBirth: extractAttribute("dateOfBirth"),
      country: extractAttribute("country"),
      locale: extractAttribute("locale"),
      bloodType: extractAttribute("bloodType"),
      // Location fields
      governorateId: extractAttribute("governorateId"),
      districtId: extractAttribute("districtId"),
      localityId: extractAttribute("localityId"),
      // Doctor-specific fields
      specialty: extractAttribute("specialty"),
      medicalCertification: extractAttribute("medicalCertification"),
      // Metadata
      roleAssignedAt: extractAttribute("role_assigned_at"),
    };
  }

  /**
   * Extract role from JWT token or user info
   */
  private extractRole(token: string, userInfo: KeycloakUserInfo): UserRole | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check realm roles
      if (payload.realm_access?.roles) {
        if (payload.realm_access.roles.includes("doctor")) return "doctor";
        if (payload.realm_access.roles.includes("admin")) return "admin";
        if (payload.realm_access.roles.includes("patient")) return "patient";
      }

      // Check resource roles
      if (payload.resource_access?.[this.clientId]?.roles) {
        const roles = payload.resource_access[this.clientId].roles;
        if (roles.includes("doctor")) return "doctor";
        if (roles.includes("admin")) return "admin";
        if (roles.includes("patient")) return "patient";
      }

      // Check user attributes
      if (userInfo.attributes?.role) {
        const role = Array.isArray(userInfo.attributes.role)
          ? userInfo.attributes.role[0]
          : userInfo.attributes.role;
        if (["doctor", "patient", "admin"].includes(role)) {
          return role as UserRole;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate OAuth state
   */
  private generateState(role: UserRole, redirectUrl?: string, isNewRegistration?: boolean): OAuthState {
    return {
      role,
      redirectUrl,
      timestamp: Date.now(),
      nonce: this.generateNonce(),
      isNewRegistration,
    };
  }

  /**
   * Generate random nonce
   */
  private generateNonce(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return this.base64UrlEncode(new Uint8Array(hash));
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(array: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...array));
    return base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /**
   * Save OAuth state
   */
  private saveState(state: OAuthState): void {
    sessionStorage.setItem(AuthStorageKeys.STATE, JSON.stringify(state));
  }

  /**
   * Get OAuth state
   */
  private getState(): OAuthState | null {
    const stateStr = sessionStorage.getItem(AuthStorageKeys.STATE);
    if (!stateStr) return null;

    try {
      return JSON.parse(stateStr);
    } catch {
      return null;
    }
  }

  /**
   * Clear OAuth state
   */
  private clearState(): void {
    sessionStorage.removeItem(AuthStorageKeys.STATE);
  }

  /**
   * Save user to storage
   */
  private saveUser(user: AuthUser): void {
    sessionStorage.setItem(AuthStorageKeys.USER, JSON.stringify(user));
  }

  /**
   * Get redirect URI
   */
  private getRedirectUri(): string {
    return `${env.app.baseUrl}/auth/callback`;
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(env.api.timeout),
        });
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error("Max retries exceeded");
  }

  /**
   * Handle error response from Keycloak
   */
  private async handleErrorResponse(response: Response): Promise<AuthError> {
    try {
      const error = await response.json();

      const errorCode = this.mapKeycloakError(error.error || response.status);
      const message = error.error_description || error.message || "Authentication failed";

      return new AuthError(errorCode, message, error);
    } catch {
      return new AuthError(
        AuthErrorCode.SERVER_ERROR,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
  }

  /**
   * Map Keycloak error to AuthErrorCode
   */
  private mapKeycloakError(error: string | number): AuthErrorCode {
    if (typeof error === "number") {
      switch (error) {
        case 401: return AuthErrorCode.INVALID_CREDENTIALS;
        case 403: return AuthErrorCode.FORBIDDEN;
        case 404: return AuthErrorCode.USER_NOT_FOUND;
        default: return AuthErrorCode.SERVER_ERROR;
      }
    }

    switch (error) {
      case "invalid_grant":
        return AuthErrorCode.INVALID_CREDENTIALS;
      case "invalid_token":
        return AuthErrorCode.INVALID_TOKEN;
      case "user_not_found":
        return AuthErrorCode.USER_NOT_FOUND;
      default:
        return AuthErrorCode.UNKNOWN_ERROR;
    }
  }

  /**
   * Normalize error to AuthError
   */
  private normalizeError(error: unknown): AuthError {
    if (error instanceof AuthError) {
      return error;
    }

    if (error instanceof Error) {
      return new AuthError(AuthErrorCode.UNKNOWN_ERROR, error.message, error);
    }

    return new AuthError(AuthErrorCode.UNKNOWN_ERROR, "An unknown error occurred", error);
  }
}

// Export singleton instance
export const keycloakService = new KeycloakService();

// Export class for testing
export { KeycloakService };
