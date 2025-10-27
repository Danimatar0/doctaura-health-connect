/**
 * Environment Configuration
 * This file centralizes all environment variables with type safety
 * Replace placeholder values with actual values in your .env file
 */

export const env = {
  // Keycloak Configuration
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL || "https://keycloak.example.com",
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "your-realm",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "your-client-id",
    clientSecret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET || "", // Optional for public clients
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "https://api.doctaura.com",
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),
  },

  // Application Configuration
  app: {
    name: "Doctaura",
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    environment: import.meta.env.MODE || "development",
    baseUrl: import.meta.env.VITE_APP_BASE_URL || window.location.origin,
  },

  // Feature Flags
  features: {
    enableEmailVerification: import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION === "true",
    enableSocialLogin: import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === "true",
    enableTwoFactorAuth: import.meta.env.VITE_ENABLE_2FA === "true",
    // Registration Strategy: "webapp" or "keycloak"
    // "webapp" = show role selector in web app (Scenario 1)
    // "keycloak" = use Keycloak theme with role tabs (Scenario 2)
    registrationStrategy: (import.meta.env.VITE_REGISTRATION_STRATEGY || "webapp") as "webapp" | "keycloak",
    // Data Source: "mock" or "api"
    // Toggle between mock data and real API calls
    useMockData: import.meta.env.VITE_USE_MOCK_DATA !== "false", // Default to true for development
  },
} as const;

// Type-safe environment checker
export const isDevelopment = env.app.environment === "development";
export const isProduction = env.app.environment === "production";
export const isStaging = env.app.environment === "staging";

// Validation helper
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!env.keycloak.url.startsWith("https://") && isProduction) {
    errors.push("Keycloak URL must use HTTPS in production");
  }

  if (!env.keycloak.realm) {
    errors.push("Keycloak realm is required");
  }

  if (!env.keycloak.clientId) {
    errors.push("Keycloak client ID is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
