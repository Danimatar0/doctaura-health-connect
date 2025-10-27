import { keycloakConfig, keycloakEndpoints } from "@/config/keycloak";

export type UserRole = "patient" | "doctor";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private readonly STORAGE_KEY = "doctaura_auth";
  private readonly ROLE_KEY = "doctaura_role";

  /**
   * Redirect to Keycloak login page
   * NOTE: This is a legacy method. Use keycloakService.redirectToLogin() instead for PKCE support.
   */
  async redirectToLogin(role: UserRole): Promise<void> {
    // Store the selected role for post-login redirect
    sessionStorage.setItem(this.ROLE_KEY, role);

    const params = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      redirect_uri: window.location.origin + "/auth/callback",
      response_type: "code",
      scope: "openid profile email",
      // Pass role as a custom parameter to Keycloak
      kc_idp_hint: role === "doctor" ? "doctor-idp" : "patient-idp",
    });

    window.location.href = `${keycloakEndpoints.login}?${params.toString()}`;
  }

  /**
   * Redirect to Keycloak registration page
   * NOTE: This is a legacy method. Use keycloakService.redirectToRegister() instead for PKCE support.
   */
  async redirectToRegister(role: UserRole): Promise<void> {
    // Store the selected role for post-registration redirect
    sessionStorage.setItem(this.ROLE_KEY, role);

    const params = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      redirect_uri: window.location.origin + "/auth/callback",
      response_type: "code",
      scope: "openid profile email",
      kc_idp_hint: role === "doctor" ? "doctor-idp" : "patient-idp",
    });

    window.location.href = `${keycloakEndpoints.register}?${params.toString()}`;
  }

  /**
   * Redirect to Keycloak password reset page
   */
  redirectToResetPassword() {
    const params = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      redirect_uri: window.location.origin + "/login",
    });

    window.location.href = `${keycloakEndpoints.resetPassword}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(code: string): Promise<AuthUser> {
    try {
      const response = await fetch(keycloakEndpoints.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: keycloakConfig.clientId,
          code: code,
          redirect_uri: window.location.origin + "/auth/callback",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange authorization code");
      }

      const tokens = await response.json();

      // Get user info
      const userInfoResponse = await fetch(keycloakEndpoints.userInfo, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      const userInfo = await userInfoResponse.json();

      // Extract role from token or user attributes
      const role = this.extractRole(tokens.access_token);

      const user: AuthUser = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name || userInfo.preferred_username,
        role: role,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };

      this.saveUser(user);
      return user;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  /**
   * Extract user role from JWT token
   */
  private extractRole(token: string): UserRole {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check for role in token claims
      if (payload.realm_access?.roles?.includes("doctor")) {
        return "doctor";
      }

      // Check custom attributes
      if (payload.user_type === "doctor") {
        return "doctor";
      }

      // Check stored role from session
      const storedRole = sessionStorage.getItem(this.ROLE_KEY);
      if (storedRole === "doctor" || storedRole === "patient") {
        return storedRole as UserRole;
      }

      // Default to patient
      return "patient";
    } catch (error) {
      console.error("Error extracting role:", error);
      return "patient";
    }
  }

  /**
   * Save user to local storage
   */
  private saveUser(user: AuthUser) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    sessionStorage.removeItem(this.ROLE_KEY);
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.STORAGE_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
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
   * Check if token is valid (not expired)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthUser | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      const response = await fetch(keycloakEndpoints.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: keycloakConfig.clientId,
          refresh_token: user.refreshToken,
        }),
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const tokens = await response.json();

      const updatedUser: AuthUser = {
        ...user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };

      this.saveUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.logout();
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    const user = this.getCurrentUser();

    // Clear local storage
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.ROLE_KEY);

    // Redirect to Keycloak logout
    if (user) {
      const params = new URLSearchParams({
        client_id: keycloakConfig.clientId,
        post_logout_redirect_uri: window.location.origin,
        id_token_hint: user.accessToken,
      });

      window.location.href = `${keycloakEndpoints.logout}?${params.toString()}`;
    } else {
      window.location.href = "/";
    }
  }

  /**
   * Get dashboard URL based on user role
   */
  getDashboardUrl(role: UserRole): string {
    return role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard";
  }
}

export const authService = new AuthService();
