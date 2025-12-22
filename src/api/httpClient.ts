/**
 * HTTP Client
 *
 * A centralized HTTP client for making API requests with common configurations.
 * Handles authentication, error handling, and request/response transformations.
 */

import { env } from "@/config/env";

/**
 * HTTP request options
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Request body (will be JSON stringified) */
  body?: unknown;
  /** Custom timeout in milliseconds */
  timeout?: number;
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
 * Check if error is a timeout/abort error
 */
const isTimeoutError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.name === 'TimeoutError' ||
      error.name === 'AbortError' ||
      error.message.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('aborted'))
  );
};

/**
 * Check if error is a network error
 */
const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') || error.message.includes('network'))
  );
};

/**
 * Wrap fetch with better error handling
 */
const fetchWithErrorHandling = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new ApiError(408, 'Request Timeout', 'The request took too long. Please check your connection and try again.');
    }
    if (isNetworkError(error)) {
      throw new ApiError(0, 'Network Error', 'Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
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
    const { timeout = env.api.timeout, ...fetchOptions } = options;

    const response = await fetchWithErrorHandling(url, {
      ...fetchOptions,
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
    const { body, timeout = env.api.timeout, ...fetchOptions } = options;

    const response = await fetchWithErrorHandling(url, {
      ...fetchOptions,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
    const { body, timeout = env.api.timeout, ...fetchOptions } = options;

    const response = await fetchWithErrorHandling(url, {
      ...fetchOptions,
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
    const { body, timeout = env.api.timeout, ...fetchOptions } = options;

    const response = await fetchWithErrorHandling(url, {
      ...fetchOptions,
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
    const { timeout = env.api.timeout, ...fetchOptions } = options;

    const response = await fetchWithErrorHandling(url, {
      ...fetchOptions,
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      signal: AbortSignal.timeout(timeout),
    });

    return processResponse<T>(response);
  },

  /**
   * Make a request with custom token (useful for registration callbacks)
   * Note: This method still accepts a token for special cases where
   * cookie-based auth is not applicable (e.g., email verification links)
   */
  async withToken<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    token: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { body, timeout = env.api.timeout, ...fetchOptions } = options;

    const response = await fetchWithErrorHandling(url, {
      ...fetchOptions,
      method,
      credentials: 'include',
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
