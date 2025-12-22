/**
 * Encryption Middleware
 *
 * Centralized middleware for encrypting/decrypting HTTP payloads.
 * Supports two modes:
 *
 * 1. **Field-Level Encryption** (Default when schema specified):
 *    - Only encrypts specific fields marked in the schema
 *    - Rest of the payload remains in plaintext
 *    - Use `schemaId` option to specify which fields to encrypt
 *
 * 2. **Whole Payload Encryption** (Disabled by default):
 *    - Encrypts the entire request/response payload
 *    - Enable via VITE_ENABLE_PAYLOAD_ENCRYPTION=true
 *    - Or force per-request with `encryptFullPayload: true`
 *
 * Features:
 * - Automatic encryption/decryption based on configuration
 * - Section-based key derivation (health, financial, identity, etc.)
 * - Request signing for integrity verification
 * - Flexible per-request control
 */

import { env } from '@/config/env';
import { EncryptionSessionManager } from '../managers/encryption-session-manager';
import type { EncryptionSection } from '../types';
import {
  encryptPayload,
  decryptPayload,
  signPayload,
  isEncryptedPayload,
  createEncryptedRequestBody,
  type EncryptedPayload,
} from '../utils/payload-encryption';
import {
  encryptFields,
  decryptFields,
  autoDecryptFields,
  isEncryptedFieldValue,
} from '../utils/field-encryption';
import {
  getEncryptedFieldConfig,
  hasEncryptedRequestFields,
  hasEncryptedResponseFields,
} from '../schemas/encrypted-fields';

// ============================================================================
// Types
// ============================================================================

export interface EncryptionOptions {
  /**
   * Schema ID to use for field-level encryption.
   * When specified, only fields defined in the schema are encrypted.
   */
  schemaId?: string;

  /**
   * Encrypt the entire payload (not just specific fields).
   * Overrides schemaId if both are specified.
   * Defaults to env.security.enablePayloadEncryption
   */
  encryptFullPayload?: boolean;

  /**
   * The section to use for key derivation.
   * Defaults to the section defined in the schema, or 'health' if not specified.
   */
  section?: EncryptionSection;

  /**
   * Whether to sign the request for integrity.
   * Defaults to true when encryption is applied.
   */
  sign?: boolean;

  /**
   * Explicitly disable encryption for this request.
   * Useful to override global settings.
   */
  disabled?: boolean;
}

export interface EncryptedRequestResult {
  /** The processed body (JSON string) */
  body: string;
  /** Additional headers to include */
  headers: Record<string, string>;
  /** Whether any encryption was applied */
  wasEncrypted: boolean;
  /** Type of encryption applied */
  encryptionType: 'none' | 'field' | 'full';
}

export interface ProcessedResponse<T> {
  /** The decrypted data */
  data: T;
  /** Whether the response was encrypted */
  wasEncrypted: boolean;
  /** Type of encryption that was applied */
  encryptionType: 'none' | 'field' | 'full';
}

// ============================================================================
// Constants
// ============================================================================

/** Default encryption section for general requests */
const DEFAULT_SECTION: EncryptionSection = 'health';

/** Header names for encryption metadata */
export const ENCRYPTION_HEADERS = {
  /** Indicates the request payload is encrypted */
  ENCRYPTED: 'X-Encrypted',
  /** Type of encryption: 'field' or 'full' */
  ENCRYPTION_TYPE: 'X-Encryption-Type',
  /** The encryption session ID */
  SESSION_ID: 'X-Session-Id',
  /** The section used for encryption */
  SECTION: 'X-Encryption-Section',
  /** Schema ID for field-level encryption */
  SCHEMA_ID: 'X-Encryption-Schema',
  /** Request signature for integrity */
  SIGNATURE: 'X-Signature',
  /** List of encrypted field paths (comma-separated) */
  ENCRYPTED_FIELDS: 'X-Encrypted-Fields',
} as const;

// ============================================================================
// Middleware State
// ============================================================================

let sessionManager: EncryptionSessionManager | null = null;

/**
 * Initialize the middleware with the session manager.
 * Called once during app initialization.
 */
export function initializeEncryptionMiddleware(apiBaseUrl: string): void {
  sessionManager = EncryptionSessionManager.getInstance(apiBaseUrl);
}

/**
 * Get the session manager instance.
 * Auto-initializes if not already done.
 */
function getSessionManager(): EncryptionSessionManager {
  if (!sessionManager) {
    sessionManager = EncryptionSessionManager.getInstance(env.api.baseUrl);
  }
  return sessionManager;
}

// ============================================================================
// Encryption Mode Detection
// ============================================================================

/**
 * Determine the encryption mode for a request.
 */
function getRequestEncryptionMode(options?: EncryptionOptions): 'none' | 'field' | 'full' {
  // Explicitly disabled
  if (options?.disabled) {
    return 'none';
  }

  // Full payload encryption requested
  if (options?.encryptFullPayload) {
    return 'full';
  }

  // Check if whole payload encryption is enabled globally
  if (env.security.enablePayloadEncryption && !options?.schemaId) {
    return 'full';
  }

  // Field-level encryption if schema has requestFields
  if (options?.schemaId && hasEncryptedRequestFields(options.schemaId)) {
    return 'field';
  }

  return 'none';
}


/**
 * Determine the decryption mode for a response.
 */
function getResponseDecryptionMode(options?: EncryptionOptions): 'none' | 'field' | 'full' {
  // Explicitly disabled
  if (options?.disabled) {
    return 'none';
  }

  // Field-level decryption if schema has responseFields
  if (options?.schemaId && hasEncryptedResponseFields(options.schemaId)) {
    return 'field';
  }

  return 'none';
}

/**
 * Check if the encryption session is ready.
 */
export function isEncryptionReady(): boolean {
  try {
    const manager = getSessionManager();
    return manager.hasValidSession();
  } catch {
    return false;
  }
}

// ============================================================================
// Field-Level Encryption
// ============================================================================

/**
 * Encrypt specific fields in a request payload using requestFields from schema.
 */
async function encryptRequestFields(
  data: Record<string, unknown>,
  schemaId: string,
  options?: EncryptionOptions
): Promise<EncryptedRequestResult> {
  const config = getEncryptedFieldConfig(schemaId);
  if (!config || !config.requestFields || config.requestFields.length === 0) {
    return {
      body: JSON.stringify(data),
      headers: {},
      wasEncrypted: false,
      encryptionType: 'none',
    };
  }

  const manager = getSessionManager();
  const sessionId = manager.getSessionId();

  if (!sessionId || !manager.hasValidSession()) {
    console.warn('[EncryptionMiddleware] No valid session, skipping field encryption');
    return {
      body: JSON.stringify(data),
      headers: {},
      wasEncrypted: false,
      encryptionType: 'none',
    };
  }

  const section = options?.section ?? config.section;
  const key = await manager.getSectionKey(section);

  // Encrypt only the requestFields
  const result = await encryptFields(
    data,
    config.requestFields,
    key,
    section,
    { conditions: config.conditions }
  );

  const body = JSON.stringify(result.data);
  const headers: Record<string, string> = {
    [ENCRYPTION_HEADERS.ENCRYPTED]: 'true',
    [ENCRYPTION_HEADERS.ENCRYPTION_TYPE]: 'field',
    [ENCRYPTION_HEADERS.SESSION_ID]: sessionId,
    [ENCRYPTION_HEADERS.SECTION]: section,
    [ENCRYPTION_HEADERS.SCHEMA_ID]: schemaId,
  };

  if (result.encryptedFields.length > 0) {
    headers[ENCRYPTION_HEADERS.ENCRYPTED_FIELDS] = result.encryptedFields.join(',');
  }

  // Sign the request if enabled
  if (options?.sign !== false) {
    const signingKey = await manager.getSigningKey();
    headers[ENCRYPTION_HEADERS.SIGNATURE] = await signPayload(body, signingKey);
  }

  return {
    body,
    headers,
    wasEncrypted: result.encryptedFields.length > 0,
    encryptionType: 'field',
  };
}

/**
 * Decrypt specific fields in a response payload using responseFields from schema.
 */
async function decryptResponseFields<T>(
  data: T,
  schemaId?: string,
  section?: EncryptionSection
): Promise<ProcessedResponse<T>> {
  const manager = getSessionManager();

  if (!manager.hasValidSession()) {
    return { data, wasEncrypted: false, encryptionType: 'none' };
  }

  // If schema specified, use responseFields from it
  if (schemaId) {
    const config = getEncryptedFieldConfig(schemaId);
    if (config?.responseFields && config.responseFields.length > 0 && typeof data === 'object' && data !== null) {
      // Use responseSection if specified, otherwise fall back to section
      const responseSection = config.responseSection ?? config.section;
      const key = await manager.getSectionKey(section ?? responseSection);
      const decrypted = await decryptFields(
        data as Record<string, unknown>,
        config.responseFields,
        key
      );
      return {
        data: decrypted as T,
        wasEncrypted: true,
        encryptionType: 'field',
      };
    }
  }

  // Auto-detect encrypted fields (fallback when no schema or schema has no responseFields)
  if (typeof data === 'object' && data !== null && containsEncryptedFields(data)) {
    const key = await manager.getSectionKey(section ?? DEFAULT_SECTION);
    const decrypted = await autoDecryptFields(data, key);
    return {
      data: decrypted as T,
      wasEncrypted: true,
      encryptionType: 'field',
    };
  }

  return { data, wasEncrypted: false, encryptionType: 'none' };
}

// ============================================================================
// Full Payload Encryption
// ============================================================================

/**
 * Encrypt the entire request payload.
 */
async function encryptFullRequest(
  data: unknown,
  options?: EncryptionOptions
): Promise<EncryptedRequestResult> {
  const manager = getSessionManager();
  const sessionId = manager.getSessionId();

  if (!sessionId || !manager.hasValidSession()) {
    console.warn('[EncryptionMiddleware] No valid session, skipping full encryption');
    return {
      body: JSON.stringify(data),
      headers: {},
      wasEncrypted: false,
      encryptionType: 'none',
    };
  }

  const section = options?.section ?? DEFAULT_SECTION;
  const key = await manager.getSectionKey(section);

  // Encrypt the entire payload
  const encrypted = await encryptPayload(data, key, section);
  const body = createEncryptedRequestBody(encrypted);

  const headers: Record<string, string> = {
    [ENCRYPTION_HEADERS.ENCRYPTED]: 'true',
    [ENCRYPTION_HEADERS.ENCRYPTION_TYPE]: 'full',
    [ENCRYPTION_HEADERS.SESSION_ID]: sessionId,
    [ENCRYPTION_HEADERS.SECTION]: section,
  };

  // Sign the request if enabled
  if (options?.sign !== false) {
    const signingKey = await manager.getSigningKey();
    headers[ENCRYPTION_HEADERS.SIGNATURE] = await signPayload(body, signingKey);
  }

  return {
    body,
    headers,
    wasEncrypted: true,
    encryptionType: 'full',
  };
}

/**
 * Decrypt the entire response payload.
 */
async function decryptFullResponse<T>(
  data: EncryptedPayload,
  section?: EncryptionSection
): Promise<ProcessedResponse<T>> {
  const manager = getSessionManager();

  if (!manager.hasValidSession()) {
    throw new Error('Cannot decrypt: no valid encryption session');
  }

  const key = await manager.getSectionKey(section ?? data.section);
  const decrypted = await decryptPayload<T>(data, key);

  return {
    data: decrypted.data,
    wasEncrypted: true,
    encryptionType: 'full',
  };
}

// ============================================================================
// High-Level API for HTTP Client
// ============================================================================

/**
 * Process an outgoing request body for encryption.
 *
 * @param body - The original request body (object or string)
 * @param options - Encryption options
 * @returns Object with processed body, headers, and metadata
 */
export async function processRequestBody(
  body: unknown,
  options?: EncryptionOptions
): Promise<EncryptedRequestResult> {
  // Parse body if string
  const data = typeof body === 'string' ? JSON.parse(body) : body;

  // Determine encryption mode for requests
  const mode = getRequestEncryptionMode(options);

  // Check if session is ready
  if (mode !== 'none' && !isEncryptionReady()) {
    console.warn('[EncryptionMiddleware] Encryption requested but session not ready');
    return {
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {},
      wasEncrypted: false,
      encryptionType: 'none',
    };
  }

  try {
    switch (mode) {
      case 'field':
        return await encryptRequestFields(
          data as Record<string, unknown>,
          options!.schemaId!,
          options
        );

      case 'full':
        return await encryptFullRequest(data, options);

      default:
        return {
          body: typeof body === 'string' ? body : JSON.stringify(body),
          headers: {},
          wasEncrypted: false,
          encryptionType: 'none',
        };
    }
  } catch (error) {
    console.error('[EncryptionMiddleware] Encryption failed:', error);
    // Return unencrypted on error (fail-open for development)
    return {
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {},
      wasEncrypted: false,
      encryptionType: 'none',
    };
  }
}

/**
 * Process an incoming response for decryption.
 *
 * @param responseData - The response data
 * @param options - Encryption options (schemaId, section)
 * @returns The processed (possibly decrypted) data
 */
export async function processResponseData<T>(
  responseData: unknown,
  options?: EncryptionOptions
): Promise<T> {
  try {
    // Check if response is a fully encrypted payload
    if (isEncryptedPayload(responseData)) {
      const result = await decryptFullResponse<T>(
        responseData as EncryptedPayload,
        options?.section
      );
      return result.data;
    }

    // Determine decryption mode for responses
    const mode = getResponseDecryptionMode(options);

    // Check for field-level decryption based on schema responseFields
    if (mode === 'field') {
      const result = await decryptResponseFields<T>(
        responseData as T,
        options?.schemaId,
        options?.section
      );
      return result.data;
    }

    // Auto-detect encrypted fields if response contains them (fallback)
    if (containsEncryptedFields(responseData)) {
      const result = await decryptResponseFields<T>(
        responseData as T,
        undefined, // no schema, will auto-detect
        options?.section
      );
      return result.data;
    }

    return responseData as T;
  } catch (error) {
    console.error('[EncryptionMiddleware] Decryption failed:', error);
    throw error;
  }
}

/**
 * Check if an object contains any encrypted field values.
 */
function containsEncryptedFields(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  function checkObject(obj: Record<string, unknown>): boolean {
    for (const value of Object.values(obj)) {
      if (isEncryptedFieldValue(value)) return true;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (checkObject(value as Record<string, unknown>)) return true;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (isEncryptedFieldValue(item)) return true;
          if (item && typeof item === 'object') {
            if (checkObject(item as Record<string, unknown>)) return true;
          }
        }
      }
    }
    return false;
  }

  return checkObject(data as Record<string, unknown>);
}

// ============================================================================
// Utility Exports
// ============================================================================

export { isEncryptedPayload, isEncryptedFieldValue };

/**
 * Legacy compatibility - check if encryption should be applied to request
 * @deprecated Use getRequestEncryptionMode instead
 */
export function shouldEncrypt(options?: EncryptionOptions): boolean {
  return getRequestEncryptionMode(options) !== 'none';
}

/**
 * Legacy compatibility - encrypt request (full payload)
 * @deprecated Use processRequestBody with encryptFullPayload: true
 */
export async function encryptRequest<T>(
  data: T,
  options?: EncryptionOptions
): Promise<EncryptedRequestResult | null> {
  const result = await processRequestBody(data, { ...options, encryptFullPayload: true });
  return result.wasEncrypted ? result : null;
}

/**
 * Legacy compatibility - decrypt response
 * @deprecated Use processResponseData
 */
export async function decryptResponse<T>(
  responseData: unknown,
  section?: EncryptionSection
): Promise<ProcessedResponse<T>> {
  const data = await processResponseData<T>(responseData, { section });
  return {
    data,
    wasEncrypted: isEncryptedPayload(responseData) || containsEncryptedFields(responseData),
    encryptionType: isEncryptedPayload(responseData) ? 'full' : 'field',
  };
}
