/**
 * Custom Fetch Instance for Orval
 *
 * Unified HTTP client used by all orval-generated API calls.
 * Handles language headers, error handling, and optional payload encryption.
 * Authentication is handled via HTTP-only cookies (credentials: 'include').
 *
 * Headers sent with every request:
 * - Accept-Language: <user preferred language>
 * - X-Device-Id: <persistent device ID>
 * - X-Session-Id: <encryption session ID> (when session established)
 *
 * When encryption is enabled:
 * - X-Encrypted: true
 * - X-Encryption-Type: 'field' or 'full'
 * - X-Session-Id: <encryption session ID>
 * - X-Encryption-Section: <section used for key derivation>
 * - X-Signature: <HMAC signature for integrity>
 */

import { env } from '@/config/env';
import { keycloakService } from '@/services/keycloakService';
import {
  processRequestBody,
  processResponseData,
  ENCRYPTION_HEADERS,
  type EncryptionOptions,
} from '@/crypto';
import { EncryptionSessionManager } from '@/crypto/managers/encryption-session-manager';

// ============================================================================
// Types
// ============================================================================

/**
 * API Error with status code and response data
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Check if error is a specific status code
   */
  is(status: number): boolean {
    return this.status === status;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}

// ============================================================================
// Session ID Management
// ============================================================================

const SESSION_ID_STORAGE_KEY = 'doctaura_session_id';

/**
 * Generate a UUID v4
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get or create a session ID for tracking anonymous users
 * Session ID persists for the browser session (sessionStorage)
 */
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);

  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
  }

  return sessionId;
};

/**
 * Clear the session ID (e.g., on logout)
 */
export const clearSessionId = (): void => {
  sessionStorage.removeItem(SESSION_ID_STORAGE_KEY);
};

// ============================================================================
// Language Management
// ============================================================================

const LANGUAGE_STORAGE_KEY = 'doctaura_preferred_language';
const DEFAULT_LANGUAGE = 'en';

/**
 * Get the user's preferred language
 * Priority: sessionStorage > Keycloak profile > browser > default
 */
export const getPreferredLanguage = (): string => {
  // 1. Check sessionStorage (user's explicit UI choice)
  const stored = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored) return stored;

  // 2. Check Keycloak user profile
  const user = keycloakService.getCurrentUser();
  if (user?.locale) return user.locale.split('-')[0];

  // 3. Check browser language
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.split('-')[0];
  }

  // 4. Default
  return DEFAULT_LANGUAGE;
};

/**
 * Set the user's preferred language
 */
export const setPreferredLanguage = (language: string): void => {
  sessionStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

/**
 * Clear the stored language preference
 */
export const clearPreferredLanguage = (): void => {
  sessionStorage.removeItem(LANGUAGE_STORAGE_KEY);
};

// ============================================================================
// Custom Instance
// ============================================================================

// ============================================================================
// Device ID Management (for encryption)
// ============================================================================

const DEVICE_ID_STORAGE_KEY = 'device_id';

/**
 * Get or create a persistent device ID.
 * This is independent of the encryption session manager.
 */
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }
  return deviceId;
};

/**
 * Get encryption session headers.
 * - X-Device-Id: Always sent (persistent device identifier)
 * - X-Session-Id: Only sent when a valid encryption session exists
 */
const getEncryptionSessionHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};

  // Always send device ID (independent of encryption session)
  headers['X-Device-Id'] = getDeviceId();

  // Try to get session ID if encryption session exists
  try {
    const manager = EncryptionSessionManager.getInstance(env.api.baseUrl);
    const sessionId = manager.getSessionId();
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
  } catch {
    // Session manager not initialized yet, only send device ID
  }

  return headers;
};

// ============================================================================
// Security Headers (for request integrity)
// ============================================================================

/**
 * Generate a random nonce (16 bytes, base64 encoded)
 */
const generateNonce = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Hash data with SHA-256 and return base64
 */
const hashToBase64 = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const bytes = new Uint8Array(hashBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Generate HMAC-SHA256 signature for request integrity.
 * Canonical format: {method}|{path}|{timestamp}|{nonce}|{bodyHash}
 */
const generateSignature = async (
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  body: string,
  signingKey: CryptoKey
): Promise<string> => {
  const encoder = new TextEncoder();
  const bodyHash = await hashToBase64(body);
  
  const canonical = `${method}|/api${path}|${timestamp}|${nonce}|${bodyHash}`;

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    signingKey,
    encoder.encode(canonical)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
};

/**
 * Generate security headers for request integrity.
 * Returns X-Timestamp, X-Nonce, and X-Signature headers.
 */
const generateSecurityHeaders = async (
  method: string,
  path: string,
  body: string | null
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  // Generate timestamp (milliseconds since epoch)
  const timestamp = Date.now().toString();
  headers['X-Timestamp'] = timestamp;

  // Generate nonce
  const nonce = generateNonce();
  headers['X-Nonce'] = nonce;

  // Try to generate signature if we have a valid session
  try {
    const manager = EncryptionSessionManager.getInstance(env.api.baseUrl);
    if (manager.hasValidSession()) {
      const signingKey = await manager.getSigningKey();
      const signature = await generateSignature(method, path, timestamp, nonce, body || '', signingKey);
      headers['X-Signature'] = signature;
    }
  } catch (error) {
    console.error("No valid encryption session for signature generation:", error);
    // No valid session, skip signature
  }

  return headers;
};

/**
 * Build request headers
 * Note: Authentication is handled via HTTP-only cookies (credentials: 'include')
 */
const buildHeaders = (customHeaders?: HeadersInit, token?: string): HeadersInit => {
  return {
    'Accept-Language': getPreferredLanguage(),
    ...getEncryptionSessionHeaders(), // X-Session-Id and X-Device-Id from encryption session
    // Only add Authorization header if explicitly provided (for special cases like email verification)
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };
};


const getKeyDerivationSalt = (): Uint8Array => {
  const base64 = env.security.derivationSalt;
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
};

const getSigningContext = (): Uint8Array => {
  return new TextEncoder().encode(env.security.signingContext);
};


/**
 * Parse error response and extract message
 */
const parseErrorResponse = async (response: Response): Promise<{ message: string; data?: unknown }> => {
  let data: unknown;
  let message = response.statusText || `HTTP ${response.status}`;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
      // Extract message from common error response formats
      if (typeof data === 'object' && data !== null) {
        if ('message' in data && typeof (data as Record<string, unknown>).message === 'string') {
          message = (data as Record<string, unknown>).message as string;
        } else if ('title' in data && typeof (data as Record<string, unknown>).title === 'string') {
          message = (data as Record<string, unknown>).title as string;
        } else if ('detail' in data && typeof (data as Record<string, unknown>).detail === 'string') {
          message = (data as Record<string, unknown>).detail as string;
        }
      }
    }
  } catch {
    // Failed to parse error response
  }

  return { message, data };
};

/**
 * Parse success response
 */
const parseSuccessResponse = async <T>(response: Response): Promise<T> => {
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Check content type
  const contentType = response.headers.get('content-type');

  // Handle JSON responses
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  // Handle text responses
  if (contentType?.includes('text/')) {
    return response.text() as Promise<T>;
  }

  // Handle blob responses (files, images)
  if (contentType?.includes('application/octet-stream') ||
      contentType?.includes('image/') ||
      contentType?.includes('application/pdf')) {
    return response.blob() as Promise<T>;
  }

  // Default: try JSON, fallback to undefined
  try {
    return await response.json();
  } catch {
    return undefined as T;
  }
};

/**
 * Extended request options with encryption support
 */
export interface CustomRequestInit extends RequestInit {
  /** Encryption options for this request */
  encryption?: EncryptionOptions;
}

/**
 * Custom fetch instance for orval-generated API calls
 *
 * @param url - The API endpoint (without base URL)
 * @param options - Fetch options (method, body, headers, encryption config)
 * @returns Promise with the response data
 * @throws ApiError on non-2xx responses
 *
 * @example
 * // Used automatically by orval-generated functions:
 * const patient = await getApiPatientsMe();
 *
 * // Can also be used directly:
 * const data = await customInstance<MyType>('/api/endpoint', {
 *   method: 'POST',
 *   body: JSON.stringify(payload),
 * });
 *
 * // With encryption:
 * const data = await customInstance<MyType>('/api/endpoint', {
 *   method: 'POST',
 *   body: JSON.stringify(payload),
 *   encryption: { section: 'health', encrypt: true },
 * });
 */
export const customInstance = async <T>(
  url: string,
  options?: CustomRequestInit
): Promise<T> => {
  const fullUrl = `${env.api.baseUrl}${url}`;

  // Extract encryption options
  const { encryption, ...fetchOptions } = options ?? {};

  // Process request body through encryption middleware if applicable
  let processedBody = fetchOptions.body;
  let encryptionHeaders: Record<string, string> = {};

  if (fetchOptions.body) {
    const bodyData = typeof fetchOptions.body === 'string'
      ? fetchOptions.body
      : fetchOptions.body;

    const processed = await processRequestBody(bodyData, encryption);
    processedBody = processed.body;
    encryptionHeaders = processed.headers;
  }

  // Determine content type
  const hasBody = processedBody !== undefined && processedBody !== null;
  const isEncrypted = encryptionHeaders[ENCRYPTION_HEADERS.ENCRYPTED] === 'true';

  // Generate security headers (timestamp, nonce, signature) for integrity
  const method = fetchOptions.method?.toUpperCase() || 'GET';
  const bodyString = typeof processedBody === 'string' ? processedBody : '';
  const securityHeaders = await generateSecurityHeaders(method, url, bodyString);

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    body: processedBody as BodyInit,
    credentials: 'include',
    headers: buildHeaders(
      {
        ...(hasBody && { 'Content-Type': 'application/json' }),
        ...fetchOptions.headers,
        ...encryptionHeaders,
        ...securityHeaders,
      }
    ),
    signal: fetchOptions.signal || AbortSignal.timeout(env.api.timeout),
  });

  // Handle error responses
  if (!response.ok) {
    const { message, data } = await parseErrorResponse(response);
    throw new ApiError(response.status, response.statusText, message, data);
  }

  // Parse success response
  const rawData = await parseSuccessResponse<unknown>(response);

  // Process response through decryption middleware if applicable
  // Check if response indicates it's encrypted via header or payload structure
  const responseEncrypted = response.headers.get(ENCRYPTION_HEADERS.ENCRYPTED) === 'true';

  if (isEncrypted || responseEncrypted) {
    return processResponseData<T>(rawData, encryption);
  }

  return rawData as T;
};

/**
 * Custom instance with explicit token
 * Used for special cases like email verification links where cookie-based auth isn't applicable
 */
export const customInstanceWithToken = async <T>(
  url: string,
  token: string,
  options?: CustomRequestInit
): Promise<T> => {
  const fullUrl = `${env.api.baseUrl}${url}`;

  // Extract encryption options
  const { encryption, ...fetchOptions } = options ?? {};

  // Process request body through encryption middleware if applicable
  let processedBody = fetchOptions.body;
  let encryptionHeaders: Record<string, string> = {};

  if (fetchOptions.body) {
    const bodyData = typeof fetchOptions.body === 'string'
      ? fetchOptions.body
      : fetchOptions.body;

    const processed = await processRequestBody(bodyData, encryption);
    processedBody = processed.body;
    encryptionHeaders = processed.headers;
  }

  const hasBody = processedBody !== undefined && processedBody !== null;
  const isEncrypted = encryptionHeaders[ENCRYPTION_HEADERS.ENCRYPTED] === 'true';

  // Generate security headers (timestamp, nonce, signature) for integrity
  const methodWithToken = fetchOptions.method?.toUpperCase() || 'GET';
  const bodyStringWithToken = typeof processedBody === 'string' ? processedBody : '';
  const securityHeaders = await generateSecurityHeaders(methodWithToken, url, bodyStringWithToken);

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    body: processedBody as BodyInit,
    credentials: 'include',
    headers: buildHeaders(
      {
        ...(hasBody && { 'Content-Type': 'application/json' }),
        ...fetchOptions.headers,
        ...encryptionHeaders,
        ...securityHeaders,
      },
      token
    ),
    signal: fetchOptions.signal || AbortSignal.timeout(env.api.timeout),
  });

  if (!response.ok) {
    const { message, data } = await parseErrorResponse(response);
    throw new ApiError(response.status, response.statusText, message, data);
  }

  // Parse success response
  const rawData = await parseSuccessResponse<unknown>(response);

  // Process response through decryption middleware if applicable
  const responseEncrypted = response.headers.get(ENCRYPTION_HEADERS.ENCRYPTED) === 'true';

  if (isEncrypted || responseEncrypted) {
    return processResponseData<T>(rawData, encryption);
  }

  return rawData as T;
};

/**
 * Convenience wrapper for field-level encrypted requests.
 * Use this when you want to encrypt specific fields defined in a schema.
 *
 * @example
 * // Register your schema first:
 * registerEncryptedFields('patient-update', {
 *   fields: ['ssn', 'medicalHistory', 'allergies'],
 *   section: 'health',
 * });
 *
 * // Then use with schema ID:
 * const data = await encryptedFieldRequest<MyType>('/api/patients/me', 'patient-update', {
 *   method: 'PUT',
 *   body: JSON.stringify(payload),
 * });
 */
export const encryptedFieldRequest = async <T>(
  url: string,
  schemaId: string,
  options?: Omit<CustomRequestInit, 'encryption'>
): Promise<T> => {
  return customInstance<T>(url, {
    ...options,
    encryption: { schemaId },
  });
};

/**
 * Convenience wrapper for full payload encrypted requests.
 * Forces full payload encryption regardless of global setting.
 *
 * @example
 * const data = await encryptedFullRequest<MyType>('/api/health/records', {
 *   method: 'POST',
 *   body: JSON.stringify(payload),
 * }, 'health');
 */
export const encryptedFullRequest = async <T>(
  url: string,
  options?: Omit<CustomRequestInit, 'encryption'>,
  section: EncryptionOptions['section'] = 'health'
): Promise<T> => {
  return customInstance<T>(url, {
    ...options,
    encryption: { encryptFullPayload: true, section },
  });
};

export default customInstance;
