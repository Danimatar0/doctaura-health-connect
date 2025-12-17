/**
 * HTTP Client
 *
 * A centralized HTTP client for making API requests with common configurations.
 * Handles authentication, error handling, and request/response transformations.
 */

import { env } from "@/config/env";
import { keycloakService } from "@/services/keycloakService";

/**
 * HTTP request options
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Request body (will be JSON stringified) */
  body?: unknown;
  /** Custom timeout in milliseconds */
  timeout?: number;
  /** Skip authentication header */
  skipAuth?: boolean;
}

/**
 * API Error class for handling HTTP errors
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly statusText: string,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get authentication headers
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = keycloakService.getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

/**
 * Process response and handle errors
 */
const processResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: unknown;
    let errorMessage = response.statusText;

    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
        errorMessage = (errorData as { message: string }).message;
      }
    } catch {
      // Response is not JSON
    }

    throw new ApiError(
      response.status,
      response.statusText,
      errorMessage,
      errorData
    );
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
};

/**
 * HTTP Client with common configurations
 */
export const httpClient = {
  /**
   * Make a GET request
   */
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { timeout = env.api.timeout, skipAuth = false, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(skipAuth ? {} : getAuthHeaders()),
        ...fetchOptions.headers,
      },
      signal: AbortSignal.timeout(timeout),
    });

    return processResponse<T>(response);
  },

  /**
   * Make a POST request
   */
  async post<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { body, timeout = env.api.timeout, skipAuth = false, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(skipAuth ? {} : getAuthHeaders()),
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });

    return processResponse<T>(response);
  },

  /**
   * Make a PUT request
   */
  async put<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { body, timeout = env.api.timeout, skipAuth = false, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(skipAuth ? {} : getAuthHeaders()),
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });

    return processResponse<T>(response);
  },

  /**
   * Make a PATCH request
   */
  async patch<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { body, timeout = env.api.timeout, skipAuth = false, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(skipAuth ? {} : getAuthHeaders()),
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });

    return processResponse<T>(response);
  },

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { timeout = env.api.timeout, skipAuth = false, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(skipAuth ? {} : getAuthHeaders()),
        ...fetchOptions.headers,
      },
      signal: AbortSignal.timeout(timeout),
    });

    return processResponse<T>(response);
  },

  /**
   * Make a request with custom token (useful for registration callbacks)
   */
  async withToken<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    token: string,
    options: Omit<RequestOptions, 'skipAuth'> = {}
  ): Promise<T> {
    const { body, timeout = env.api.timeout, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });

    return processResponse<T>(response);
  },
};
