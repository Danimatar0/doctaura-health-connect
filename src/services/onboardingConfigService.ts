/**
 * Onboarding Configuration Service
 *
 * Handles fetching and caching of onboarding configuration with ETag-based revalidation.
 *
 * Cache strategy:
 * 1. Load immediately from IndexedDB (offline-first)
 * 2. Revalidate in background using ETag
 * 3. Update cache only when server returns new data (200)
 * 4. Keep existing data on 304 Not Modified
 *
 * This service is framework-agnostic and can be used with React, Vue, or vanilla JS.
 */

import { API } from '@/api/endpoints';
import { configDB } from '@/lib/indexedDB';
import { configMetadata } from '@/lib/configMetadata';
import type {
  OnboardingConfigPayload,
  ConfigCacheEntry,
  RevalidationResult,
  RevalidationStatus,
} from '@/types/onboardingConfig';

// Configuration constants
const CONFIG_KEY = 'onboarding';
const API_ENDPOINT = API.Config.Onboarding;
const REQUEST_TIMEOUT = 10000; // 10 seconds for config requests

// Minimum interval between revalidation attempts (prevents request spam)
const MIN_REVALIDATION_INTERVAL = 60000; // 1 minute

/**
 * In-flight request tracker to prevent duplicate concurrent requests
 */
let pendingRevalidation: Promise<RevalidationResult> | null = null;

/**
 * Fetches configuration from the server with optional ETag for revalidation.
 *
 * @param etag - Optional ETag for conditional request
 * @returns Raw fetch Response for status code handling
 */
async function fetchConfig(etag?: string): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add If-None-Match header for conditional request
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Loads configuration from IndexedDB cache.
 * This is the primary data source for instant rendering.
 *
 * @returns Cached config or null if not cached
 *
 * @example
 * const cached = await onboardingConfigService.getCached();
 * if (cached) {
 *   renderOnboarding(cached.payload);
 * }
 */
async function getCached(): Promise<ConfigCacheEntry<OnboardingConfigPayload> | null> {
  try {
    return await configDB.getConfig<OnboardingConfigPayload>(CONFIG_KEY);
  } catch (error) {
    console.error('[onboardingConfigService] Failed to read from IndexedDB:', error);
    return null;
  }
}

/**
 * Updates both IndexedDB and localStorage with new configuration.
 *
 * @param payload - The configuration payload
 * @param version - Server version string
 * @param etag - Server ETag for future revalidation
 */
async function updateCache(
  payload: OnboardingConfigPayload,
  version: string,
  etag: string
): Promise<void> {
  const now = Date.now();

  // Update IndexedDB (primary storage)
  await configDB.setConfig<OnboardingConfigPayload>(CONFIG_KEY, {
    version,
    etag,
    payload,
    updatedAt: now,
  });

  // Update localStorage metadata (for quick checks)
  configMetadata.set(CONFIG_KEY, {
    version,
    lastChecked: now,
  });
}

/**
 * Revalidates the configuration with the server using ETag.
 *
 * This is the core revalidation logic:
 * - Sends If-None-Match header with cached ETag
 * - On 304: Keeps cached data, updates lastChecked
 * - On 200: Replaces cache with new data
 * - On error: Returns existing cache (offline-first)
 *
 * @param cachedEtag - The cached ETag for conditional request
 * @returns Revalidation result with status and optional new data
 *
 * @example
 * const cached = await getCached();
 * const result = await revalidate(cached?.etag);
 *
 * if (result.status === 'updated') {
 *   updateUI(result.data);
 * }
 */
async function revalidate(cachedEtag?: string): Promise<RevalidationResult> {
  // Deduplicate concurrent revalidation requests
  if (pendingRevalidation) {
    return pendingRevalidation;
  }

  // Check if we should skip based on recent revalidation
  if (configMetadata.shouldSkipRevalidation(CONFIG_KEY, MIN_REVALIDATION_INTERVAL)) {
    return { status: 'not_modified' };
  }

  pendingRevalidation = (async (): Promise<RevalidationResult> => {
    try {
      // Check network connectivity
      if (!navigator.onLine) {
        return { status: 'offline' };
      }

      const response = await fetchConfig(cachedEtag);

      // 304 Not Modified - cache is still valid
      if (response.status === 304) {
        configMetadata.updateLastChecked(CONFIG_KEY);
        return { status: 'not_modified' };
      }

      // Handle non-success responses
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      // 200 OK - parse and cache new data
      const data = await response.json();

      // Extract version and etag from response
      // Server can provide these in headers or body
      const newVersion = response.headers.get('X-Config-Version') || data.version || 'v1';
      const newEtag = response.headers.get('ETag') || data.etag || `${CONFIG_KEY}-${newVersion}`;

      // The payload might be in data.data or directly in data
      const payload: OnboardingConfigPayload = data.data || data;

      // Update cache
      await updateCache(payload, newVersion, newEtag);

      return {
        status: 'updated',
        data: payload,
        version: newVersion,
      };
    } catch (error) {
      // Network error or timeout - return error status
      // Existing cached data will still be used (offline-first)
      const err = error instanceof Error ? error : new Error('Unknown error');

      // Only log non-abort errors
      if (err.name !== 'AbortError') {
        console.warn('[onboardingConfigService] Revalidation failed:', err.message);
      }

      return {
        status: 'error',
        error: err,
      };
    } finally {
      pendingRevalidation = null;
    }
  })();

  return pendingRevalidation;
}

/**
 * Loads configuration with automatic cache-first + revalidation strategy.
 *
 * This is the main entry point for getting config:
 * 1. Returns cached data immediately (if available)
 * 2. Triggers background revalidation
 * 3. Calls onUpdate callback if data changes
 *
 * @param onUpdate - Optional callback when data is updated from server
 * @returns Cached config payload or null
 *
 * @example
 * // Simple usage
 * const config = await onboardingConfigService.load();
 *
 * // With update callback
 * const config = await onboardingConfigService.load((newConfig) => {
 *   console.log('Config updated:', newConfig);
 *   updateUI(newConfig);
 * });
 */
async function load(
  onUpdate?: (data: OnboardingConfigPayload, version: string) => void
): Promise<OnboardingConfigPayload | null> {
  // Step 1: Load from cache immediately
  const cached = await getCached();

  // Step 2: Trigger background revalidation (non-blocking)
  revalidate(cached?.etag).then((result) => {
    if (result.status === 'updated' && result.data && onUpdate) {
      onUpdate(result.data, result.version!);
    }
  });

  // Step 3: Return cached data immediately
  return cached?.payload || null;
}

/**
 * Forces a fresh fetch, ignoring the cache.
 * Useful after user actions that might have changed server config.
 *
 * @returns Fresh config from server
 */
async function forceRefresh(): Promise<OnboardingConfigPayload | null> {
  try {
    const response = await fetchConfig(); // No ETag = unconditional request

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    const newVersion = response.headers.get('X-Config-Version') || data.version || 'v1';
    const newEtag = response.headers.get('ETag') || data.etag || `${CONFIG_KEY}-${newVersion}`;
    const payload: OnboardingConfigPayload = data.data || data;

    await updateCache(payload, newVersion, newEtag);

    return payload;
  } catch (error) {
    console.error('[onboardingConfigService] Force refresh failed:', error);
    throw error;
  }
}

/**
 * Clears the configuration cache completely.
 * Forces a fresh fetch on next load.
 */
async function invalidate(): Promise<void> {
  try {
    await configDB.deleteConfig(CONFIG_KEY);
    configMetadata.remove(CONFIG_KEY);
  } catch (error) {
    console.error('[onboardingConfigService] Failed to invalidate cache:', error);
  }
}

/**
 * Gets the current cached version string.
 * Synchronous check via localStorage.
 *
 * @returns Version string or null
 */
function getCachedVersion(): string | null {
  return configMetadata.getVersion(CONFIG_KEY);
}

/**
 * Checks if IndexedDB caching is available.
 *
 * @returns True if IndexedDB is functional
 */
async function isCacheAvailable(): Promise<boolean> {
  return configDB.isAvailable();
}

/**
 * Onboarding Configuration Service API
 *
 * @example
 * import { onboardingConfigService } from '@/services/onboardingConfigService';
 *
 * // Load with cache-first strategy
 * const config = await onboardingConfigService.load((updated) => {
 *   // Handle background update
 * });
 *
 * // Get cached only (no network)
 * const cached = await onboardingConfigService.getCached();
 *
 * // Force refresh
 * await onboardingConfigService.forceRefresh();
 *
 * // Clear cache
 * await onboardingConfigService.invalidate();
 */
export const onboardingConfigService = {
  load,
  getCached,
  revalidate,
  forceRefresh,
  invalidate,
  getCachedVersion,
  isCacheAvailable,
} as const;

// Export types for consumers
export type { OnboardingConfigPayload, RevalidationResult, RevalidationStatus };
