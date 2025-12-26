/**
 * localStorage Metadata Utilities for Configuration Caching
 *
 * Stores ONLY lightweight metadata for quick synchronous checks.
 * The actual config payload lives in IndexedDB.
 *
 * Key design decisions:
 * - Synchronous access for immediate UI decisions
 * - Minimal footprint (no large payloads)
 * - Used to avoid unnecessary IndexedDB reads
 * - Framework-agnostic (works with React, Vue, or vanilla JS)
 */

import type { ConfigMetadata } from '@/types/onboardingConfig';

// localStorage key prefixes
const PREFIX = 'doctora_config_';
const VERSION_SUFFIX = '_version';
const LAST_CHECKED_SUFFIX = '_last_checked';

/**
 * Builds the localStorage key for a config's version
 */
function getVersionKey(configKey: string): string {
  return `${PREFIX}${configKey}${VERSION_SUFFIX}`;
}

/**
 * Builds the localStorage key for a config's last checked timestamp
 */
function getLastCheckedKey(configKey: string): string {
  return `${PREFIX}${configKey}${LAST_CHECKED_SUFFIX}`;
}

/**
 * Retrieves metadata for a config from localStorage.
 * Returns null if no metadata exists.
 *
 * This is a SYNCHRONOUS operation for fast initial checks.
 *
 * @param configKey - The configuration key (e.g., "onboarding")
 * @returns Metadata object or null
 *
 * @example
 * const meta = configMetadata.get('onboarding');
 * if (meta) {
 *   console.log('Cached version:', meta.version);
 *   console.log('Last checked:', new Date(meta.lastChecked));
 * }
 */
function get(configKey: string): ConfigMetadata | null {
  try {
    const version = localStorage.getItem(getVersionKey(configKey));
    const lastChecked = localStorage.getItem(getLastCheckedKey(configKey));

    if (!version) {
      return null;
    }

    return {
      version,
      lastChecked: lastChecked ? parseInt(lastChecked, 10) : 0,
    };
  } catch {
    // localStorage might be unavailable (private browsing, quota exceeded)
    return null;
  }
}

/**
 * Stores metadata for a config in localStorage.
 *
 * @param configKey - The configuration key
 * @param metadata - Version and lastChecked timestamp
 *
 * @example
 * configMetadata.set('onboarding', {
 *   version: 'v12',
 *   lastChecked: Date.now()
 * });
 */
function set(configKey: string, metadata: ConfigMetadata): void {
  try {
    localStorage.setItem(getVersionKey(configKey), metadata.version);
    localStorage.setItem(getLastCheckedKey(configKey), metadata.lastChecked.toString());
  } catch {
    // Silently fail - localStorage might be full or unavailable
    // The system still works via IndexedDB
    console.warn(`[configMetadata] Failed to save metadata for '${configKey}'`);
  }
}

/**
 * Updates only the lastChecked timestamp.
 * Useful when server returns 304 Not Modified.
 *
 * @param configKey - The configuration key
 * @param timestamp - Unix timestamp in milliseconds (defaults to now)
 *
 * @example
 * // After receiving 304 Not Modified
 * configMetadata.updateLastChecked('onboarding');
 */
function updateLastChecked(configKey: string, timestamp: number = Date.now()): void {
  try {
    localStorage.setItem(getLastCheckedKey(configKey), timestamp.toString());
  } catch {
    // Silently fail
  }
}

/**
 * Retrieves only the cached version string.
 * Faster than get() when you don't need lastChecked.
 *
 * @param configKey - The configuration key
 * @returns Version string or null
 */
function getVersion(configKey: string): string | null {
  try {
    return localStorage.getItem(getVersionKey(configKey));
  } catch {
    return null;
  }
}

/**
 * Removes all metadata for a config from localStorage.
 *
 * @param configKey - The configuration key
 */
function remove(configKey: string): void {
  try {
    localStorage.removeItem(getVersionKey(configKey));
    localStorage.removeItem(getLastCheckedKey(configKey));
  } catch {
    // Silently fail
  }
}

/**
 * Clears all doctora config metadata from localStorage.
 * Use with caution.
 */
function clearAll(): void {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Silently fail
  }
}

/**
 * Checks if we should skip revalidation based on a minimum interval.
 * Useful to prevent excessive network requests.
 *
 * @param configKey - The configuration key
 * @param minInterval - Minimum time between checks in milliseconds (default: 60 seconds)
 * @returns True if we checked recently and should skip
 *
 * @example
 * if (configMetadata.shouldSkipRevalidation('onboarding', 60000)) {
 *   // Skip network request, use cached data
 *   return;
 * }
 */
function shouldSkipRevalidation(configKey: string, minInterval: number = 60000): boolean {
  const meta = get(configKey);
  if (!meta || !meta.lastChecked) {
    return false;
  }

  const timeSinceLastCheck = Date.now() - meta.lastChecked;
  return timeSinceLastCheck < minInterval;
}

/**
 * Configuration Metadata API
 *
 * Provides synchronous localStorage operations for quick metadata checks.
 *
 * @example
 * import { configMetadata } from '@/lib/configMetadata';
 *
 * // Quick check if we have a cached version
 * const version = configMetadata.getVersion('onboarding');
 *
 * // Full metadata
 * const meta = configMetadata.get('onboarding');
 *
 * // Update after successful revalidation
 * configMetadata.set('onboarding', { version: 'v13', lastChecked: Date.now() });
 */
export const configMetadata = {
  get,
  set,
  getVersion,
  updateLastChecked,
  remove,
  clearAll,
  shouldSkipRevalidation,
} as const;
