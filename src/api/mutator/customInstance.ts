/**
 * Custom Fetch Instance for Orval
 *
 * Unified HTTP client used by all orval-generated API calls.
 * Handles authentication, language headers, and error handling consistently.
 *
 * Headers sent with every request:
 * - Authorization: Bearer <token>
 * - Accept-Language: <user preferred language>
 */

import { env } from '@/config/env';
import { keycloakService } from '@/services/keycloakService';

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

/**
 * Build request headers
 */
const buildHeaders = (customHeaders?: HeadersInit, token?: string): HeadersInit => {
  const authToken = token || keycloakService.getAccessToken();

  return {
    'Accept-Language': getPreferredLanguage(),
    'X-Session-ID': getSessionId(),
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...customHeaders,
  };
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
 * Custom fetch instance for orval-generated API calls
 *
 * @param url - The API endpoint (without base URL)
 * @param options - Fetch options (method, body, headers, etc.)
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
 */
export const customInstance = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = `${env.api.baseUrl}${url}`;

  // Determine if body is JSON
  const isJsonBody = options?.body && typeof options.body === 'string';

  const response = await fetch(fullUrl, {
    ...options,
    headers: buildHeaders(
      {
        ...(isJsonBody && { 'Content-Type': 'application/json' }),
        ...options?.headers,
      }
    ),
    signal: options?.signal || AbortSignal.timeout(env.api.timeout),
  });

  // Handle error responses
  if (!response.ok) {
    const { message, data } = await parseErrorResponse(response);
    throw new ApiError(response.status, response.statusText, message, data);
  }

  // Parse and return success response
  return parseSuccessResponse<T>(response);
};

/**
 * Custom instance with explicit token
 * Used during auth flow when token isn't stored in keycloakService yet
 */
export const customInstanceWithToken = async <T>(
  url: string,
  token: string,
  options?: RequestInit
): Promise<T> => {
  const fullUrl = `${env.api.baseUrl}${url}`;

  const isJsonBody = options?.body && typeof options.body === 'string';

  const response = await fetch(fullUrl, {
    ...options,
    headers: buildHeaders(
      {
        ...(isJsonBody && { 'Content-Type': 'application/json' }),
        ...options?.headers,
      },
      token
    ),
    signal: options?.signal || AbortSignal.timeout(env.api.timeout),
  });

  if (!response.ok) {
    const { message, data } = await parseErrorResponse(response);
    throw new ApiError(response.status, response.statusText, message, data);
  }

  return parseSuccessResponse<T>(response);
};

export default customInstance;
