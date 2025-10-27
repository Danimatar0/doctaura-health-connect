// Keycloak Configuration
export const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || "https://auth.doctaura.com",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "doctaura",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "doctaura-web",
};

export const keycloakEndpoints = {
  login: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`,
  token: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
  register: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/registrations`,
  logout: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`,
  userInfo: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/userinfo`,
  resetPassword: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/login-actions/reset-credentials`,
};
