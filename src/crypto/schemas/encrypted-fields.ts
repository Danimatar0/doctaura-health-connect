/**
 * Encrypted Fields Schema
 *
 * Defines which fields should be encrypted in request/response payloads.
 * Similar to [Encrypt] attribute in C# - mark fields for selective encryption.
 *
 * Usage:
 * 1. Register your encrypted fields in ENCRYPTED_FIELD_SCHEMAS
 * 2. The middleware will automatically encrypt/decrypt only these fields
 * 3. Request and response can have DIFFERENT encrypted fields
 *
 * @example
 * ENCRYPTED_FIELD_SCHEMAS['patient-update'] = {
 *   requestFields: ['password', 'ssn'],           // Encrypt when sending
 *   responseFields: ['ssn', 'diagnosis', 'notes'], // Decrypt when receiving
 *   section: 'health',
 * };
 */

import type { EncryptionSection } from '../types';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for encrypted fields in a schema.
 * Supports separate field lists for requests and responses.
 */
export interface EncryptedFieldConfig {
  /**
   * Fields to encrypt in outgoing requests.
   * Supports nested paths like 'address.street'.
   */
  requestFields?: string[];

  /**
   * Fields to decrypt in incoming responses.
   * Supports nested paths like 'patient.medicalHistory'.
   */
  responseFields?: string[];

  /** The encryption section to use for request key derivation */
  section: EncryptionSection;

  /**
   * Optional: Different section for response decryption.
   * If not specified, uses `section` for both request and response.
   * Useful when backend encrypts response fields with a different section key.
   */
  responseSection?: EncryptionSection;

  /** Optional: only encrypt if field value matches certain conditions */
  conditions?: Record<string, (value: unknown) => boolean>;
}

/**
 * Registry of schemas with their encrypted field configurations
 */
export type EncryptedFieldSchemas = Record<string, EncryptedFieldConfig>;

// ============================================================================
// Field Encryption Registry
// ============================================================================

/**
 * Registry of encrypted field schemas.
 * Add your encrypted fields here.
 *
 * Key: Schema identifier (endpoint path, action name, or DTO name)
 * Value: Configuration specifying which fields to encrypt/decrypt
 *
 * @example
 * // Patient profile update - different fields for request vs response
 * 'patient-update': {
 *   requestFields: ['ssn', 'password'],              // What we send encrypted
 *   responseFields: ['ssn', 'medicalHistory'],       // What we receive encrypted
 *   section: 'health',
 * },
 *
 * // Get patient - only response has encrypted fields
 * 'patient-get': {
 *   responseFields: ['ssn', 'dateOfBirth', 'diagnosis', 'prescriptions'],
 *   section: 'health',
 * },
 *
 * // Password change - only request has encrypted fields
 * 'password-change': {
 *   requestFields: ['currentPassword', 'newPassword'],
 *   section: 'authentication',
 * },
 */
export const ENCRYPTED_FIELD_SCHEMAS: EncryptedFieldSchemas = {
  // ─────────────────────────────────────────────────────────────────
  // Authentication Section - Login/Auth endpoints
  // ─────────────────────────────────────────────────────────────────

  /**
   * Login endpoint encryption schema
   * POST /auth/login
   *
   * Note: Request uses 'authentication' section for password,
   * Response uses 'identity' section for user data.
   */
  'auth-login': {
    // Request: encrypt credentials when sending
    requestFields: ['password'],
    // Response: decrypt username from user object
    responseFields: ['user.username'],
    section: 'authentication',
    // Response fields use identity section for user profile data
    responseSection: 'identity',
  },

  // ─────────────────────────────────────────────────────────────────
  // Health Section - PHI (Protected Health Information)
  // ─────────────────────────────────────────────────────────────────

  // Example: Patient health profile
  // 'patient-profile': {
  //   requestFields: ['ssn'],
  //   responseFields: [
  //     'ssn',
  //     'dateOfBirth',
  //     'bloodType',
  //     'allergies',
  //     'chronicConditions',
  //     'currentMedications',
  //     'medicalHistory',
  //   ],
  //   section: 'health',
  // },

  // Example: Medical records - typically read-only
  // 'medical-records': {
  //   responseFields: [
  //     'diagnosis',
  //     'treatment',
  //     'prescriptions',
  //     'labResults',
  //     'notes',
  //   ],
  //   section: 'health',
  // },

  // ─────────────────────────────────────────────────────────────────
  // Financial Section - PCI DSS sensitive data
  // ─────────────────────────────────────────────────────────────────

  // Example: Add payment method - request only
  // 'payment-add': {
  //   requestFields: [
  //     'cardNumber',
  //     'cvv',
  //     'expiryDate',
  //   ],
  //   section: 'financial',
  // },

  // Example: Get payment methods - response only (masked)
  // 'payment-list': {
  //   responseFields: [
  //     'lastFourDigits',
  //     'bankAccountMasked',
  //   ],
  //   section: 'financial',
  // },

  // ─────────────────────────────────────────────────────────────────
  // Identity Section - PII (Personally Identifiable Information)
  // ─────────────────────────────────────────────────────────────────

  // Example: Identity verification
  // 'identity-verify': {
  //   requestFields: ['nationalId', 'passportNumber'],
  //   responseFields: ['verificationResult'],
  //   section: 'identity',
  // },

  // ─────────────────────────────────────────────────────────────────
  // Authentication Section - Credentials
  // ─────────────────────────────────────────────────────────────────

  // Example: Password change - request only
  // 'password-change': {
  //   requestFields: ['currentPassword', 'newPassword'],
  //   section: 'authentication',
  // },
};

// ============================================================================
// Schema Registration Helpers
// ============================================================================

/**
 * Register encrypted fields for a schema.
 *
 * @param schemaId - Unique identifier for the schema
 * @param config - Encrypted field configuration
 *
 * @example
 * registerEncryptedFields('patient-update', {
 *   requestFields: ['ssn', 'password'],
 *   responseFields: ['ssn', 'medicalHistory'],
 *   section: 'health',
 * });
 */
export function registerEncryptedFields(
  schemaId: string,
  config: EncryptedFieldConfig
): void {
  ENCRYPTED_FIELD_SCHEMAS[schemaId] = config;
}

/**
 * Get encrypted field configuration for a schema.
 *
 * @param schemaId - The schema identifier
 * @returns The configuration or undefined if not registered
 */
export function getEncryptedFieldConfig(
  schemaId: string
): EncryptedFieldConfig | undefined {
  return ENCRYPTED_FIELD_SCHEMAS[schemaId];
}

/**
 * Check if a schema has any encrypted fields registered (request or response).
 *
 * @param schemaId - The schema identifier
 */
export function hasEncryptedFields(schemaId: string): boolean {
  const config = ENCRYPTED_FIELD_SCHEMAS[schemaId];
  if (!config) return false;
  return (
    (config.requestFields && config.requestFields.length > 0) ||
    (config.responseFields && config.responseFields.length > 0)
  );
}

/**
 * Check if a schema has encrypted request fields.
 *
 * @param schemaId - The schema identifier
 */
export function hasEncryptedRequestFields(schemaId: string): boolean {
  const config = ENCRYPTED_FIELD_SCHEMAS[schemaId];
  return config?.requestFields !== undefined && config.requestFields.length > 0;
}

/**
 * Check if a schema has encrypted response fields.
 *
 * @param schemaId - The schema identifier
 */
export function hasEncryptedResponseFields(schemaId: string): boolean {
  const config = ENCRYPTED_FIELD_SCHEMAS[schemaId];
  return config?.responseFields !== undefined && config.responseFields.length > 0;
}

/**
 * Get all registered schema IDs.
 */
export function getRegisteredSchemas(): string[] {
  return Object.keys(ENCRYPTED_FIELD_SCHEMAS);
}

// ============================================================================
// Field Path Utilities
// ============================================================================

/**
 * Get a nested field value using dot notation path.
 *
 * @param obj - The object to get the value from
 * @param path - Dot notation path (e.g., 'address.street')
 * @returns The value at the path or undefined
 */
export function getFieldValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Set a nested field value using dot notation path.
 *
 * @param obj - The object to set the value on
 * @param path - Dot notation path (e.g., 'address.street')
 * @param value - The value to set
 */
export function setFieldValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Check if a field exists in an object using dot notation path.
 *
 * @param obj - The object to check
 * @param path - Dot notation path
 */
export function hasField(obj: unknown, path: string): boolean {
  return getFieldValue(obj, path) !== undefined;
}
