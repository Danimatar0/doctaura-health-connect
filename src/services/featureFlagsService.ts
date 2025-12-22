/**
 * Feature Flags Service with Caching
 *
 * Provides global caching for feature flags with:
 * - In-memory cache with TTL
 * - Automatic cache invalidation
 * - Error handling with fallback to cached values
 * - Support for multiple cache keys (extensible for future caching needs)
 */

import { useState, useEffect, useCallback } from 'react';

// Internal feature flags (used throughout the app)
export interface FeatureFlags {
  // Core features
  prescriptions: boolean;
  medicalRecords: boolean;
  telemedicine: boolean;
  pharmacyFinder: boolean;
  medicineFinder: boolean;
  appointmentReminders: boolean;

  // Medical Records Sub-Features (Health Profile)
  healthProfileSection: boolean;
  allergiesSection: boolean;
  chronicConditionsSection: boolean;
  medicationsSection: boolean;

  // Health Tracking
  healthTrackingSection: boolean;
  heightWeightTracking: boolean;
  bloodPressureTracking: boolean;
  bloodSugarTracking: boolean;

  // Medical History
  medicalHistorySection: boolean;
  familyHistorySection: boolean;
  vaccinationRecords: boolean;

  // Actions
  recordsExportPdf: boolean;
  recordsSharing: boolean;
}

// API response format (from backend)
export interface ApiFeatureFlags {
  // Core features
  prescriptionsEnabled?: boolean;
  medicalRecordsEnabled?: boolean;
  telemedicineEnabled?: boolean;
  pharmacyFinderEnabled?: boolean;
  medicineFinderEnabled?: boolean;
  appointmentRemindersEnabled?: boolean;

  // Medical Records Sub-Features (Health Profile)
  healthProfileSectionEnabled?: boolean;
  allergiesSectionEnabled?: boolean;
  chronicConditionsSectionEnabled?: boolean;
  medicationsSectionEnabled?: boolean;

  // Health Tracking
  healthTrackingSectionEnabled?: boolean;
  heightWeightTrackingEnabled?: boolean;
  bloodPressureTrackingEnabled?: boolean;
  bloodSugarTrackingEnabled?: boolean;

  // Medical History
  medicalHistorySectionEnabled?: boolean;
  familyHistorySectionEnabled?: boolean;
  vaccinationRecordsEnabled?: boolean;

  // Actions
  recordsExportPdfEnabled?: boolean;
  recordsSharingEnabled?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate: boolean; // Return stale data while fetching fresh data
}

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true,
};

// Default feature flags (all enabled by default)
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Core features
  prescriptions: true,
  medicalRecords: true,
  telemedicine: true,
  pharmacyFinder: true,
  medicineFinder: true,
  appointmentReminders: true,

  // Medical Records Sub-Features (Health Profile)
  healthProfileSection: true,
  allergiesSection: true,
  chronicConditionsSection: true,
  medicationsSection: true,

  // Health Tracking
  healthTrackingSection: true,
  heightWeightTracking: true,
  bloodPressureTracking: true,
  bloodSugarTracking: true,

  // Medical History
  medicalHistorySection: true,
  familyHistorySection: true,
  vaccinationRecords: true,

  // Actions
  recordsExportPdf: true,
  recordsSharing: true,
};

class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  /**
   * Get item from cache
   */
  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    return entry;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  isValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }

  /**
   * Check if cache entry exists (even if expired)
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set pending request to prevent duplicate fetches
   */
  getPendingRequest<T>(key: string): Promise<T> | null {
    return this.pendingRequests.get(key) as Promise<T> | null;
  }

  setPendingRequest<T>(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, promise);
  }

  clearPendingRequest(key: string): void {
    this.pendingRequests.delete(key);
  }
}

// Global cache instance
const cacheService = new CacheService();

// Cache keys
export const CACHE_KEYS = {
  FEATURE_FLAGS: 'feature_flags',
} as const;

/**
 * Feature Flags specific functions
 */
export const featureFlagsCache = {
  /**
   * Get cached feature flags
   */
  get(): FeatureFlags | null {
    const entry = cacheService.get<FeatureFlags>(CACHE_KEYS.FEATURE_FLAGS);
    if (!entry) return null;
    return entry.data;
  },

  /**
   * Get cached feature flags even if stale
   */
  getStale(): FeatureFlags | null {
    const entry = cacheService.get<FeatureFlags>(CACHE_KEYS.FEATURE_FLAGS);
    return entry?.data ?? null;
  },

  /**
   * Check if feature flags cache is valid
   */
  isValid(): boolean {
    return cacheService.isValid(CACHE_KEYS.FEATURE_FLAGS);
  },

  /**
   * Set feature flags in cache
   */
  set(flags: FeatureFlags, config: Partial<CacheConfig> = {}): void {
    const { ttl } = { ...DEFAULT_CACHE_CONFIG, ...config };
    cacheService.set(CACHE_KEYS.FEATURE_FLAGS, flags, ttl);
  },

  /**
   * Invalidate feature flags cache
   */
  invalidate(): void {
    cacheService.invalidate(CACHE_KEYS.FEATURE_FLAGS);
  },

  /**
   * Get default feature flags
   */
  getDefaults(): FeatureFlags {
    return { ...DEFAULT_FEATURE_FLAGS };
  },

  /**
   * Merge API flags with defaults, mapping from API format to internal format
   */
  mergeWithDefaults(apiFlags: ApiFeatureFlags | undefined | null): FeatureFlags {
    // console.log('[FeatureFlagsCache] mergeWithDefaults input:', JSON.stringify(apiFlags));

    if (!apiFlags) {
      console.log('[FeatureFlagsCache] No API flags, returning defaults');
      return { ...DEFAULT_FEATURE_FLAGS };
    }

    // Map from API property names (xxxEnabled) to internal names (xxx)
    const result: FeatureFlags = {
      // Core features
      prescriptions: apiFlags.prescriptionsEnabled ?? DEFAULT_FEATURE_FLAGS.prescriptions,
      medicalRecords: apiFlags.medicalRecordsEnabled ?? DEFAULT_FEATURE_FLAGS.medicalRecords,
      telemedicine: apiFlags.telemedicineEnabled ?? DEFAULT_FEATURE_FLAGS.telemedicine,
      pharmacyFinder: apiFlags.pharmacyFinderEnabled ?? DEFAULT_FEATURE_FLAGS.pharmacyFinder,
      medicineFinder: apiFlags.medicineFinderEnabled ?? DEFAULT_FEATURE_FLAGS.medicineFinder,
      appointmentReminders: apiFlags.appointmentRemindersEnabled ?? DEFAULT_FEATURE_FLAGS.appointmentReminders,

      // Medical Records Sub-Features (Health Profile)
      healthProfileSection: apiFlags.healthProfileSectionEnabled ?? DEFAULT_FEATURE_FLAGS.healthProfileSection,
      allergiesSection: apiFlags.allergiesSectionEnabled ?? DEFAULT_FEATURE_FLAGS.allergiesSection,
      chronicConditionsSection: apiFlags.chronicConditionsSectionEnabled ?? DEFAULT_FEATURE_FLAGS.chronicConditionsSection,
      medicationsSection: apiFlags.medicationsSectionEnabled ?? DEFAULT_FEATURE_FLAGS.medicationsSection,

      // Health Tracking
      healthTrackingSection: apiFlags.healthTrackingSectionEnabled ?? DEFAULT_FEATURE_FLAGS.healthTrackingSection,
      heightWeightTracking: apiFlags.heightWeightTrackingEnabled ?? DEFAULT_FEATURE_FLAGS.heightWeightTracking,
      bloodPressureTracking: apiFlags.bloodPressureTrackingEnabled ?? DEFAULT_FEATURE_FLAGS.bloodPressureTracking,
      bloodSugarTracking: apiFlags.bloodSugarTrackingEnabled ?? DEFAULT_FEATURE_FLAGS.bloodSugarTracking,

      // Medical History
      medicalHistorySection: apiFlags.medicalHistorySectionEnabled ?? DEFAULT_FEATURE_FLAGS.medicalHistorySection,
      familyHistorySection: apiFlags.familyHistorySectionEnabled ?? DEFAULT_FEATURE_FLAGS.familyHistorySection,
      vaccinationRecords: apiFlags.vaccinationRecordsEnabled ?? DEFAULT_FEATURE_FLAGS.vaccinationRecords,

      // Actions
      recordsExportPdf: apiFlags.recordsExportPdfEnabled ?? DEFAULT_FEATURE_FLAGS.recordsExportPdf,
      recordsSharing: apiFlags.recordsSharingEnabled ?? DEFAULT_FEATURE_FLAGS.recordsSharing,
    };

    // console.log('[FeatureFlagsCache] Merged result:', JSON.stringify(result));
    return result;
  },

  /**
   * Check pending request
   */
  getPendingRequest(): Promise<FeatureFlags> | null {
    return cacheService.getPendingRequest<FeatureFlags>(CACHE_KEYS.FEATURE_FLAGS);
  },

  setPendingRequest(promise: Promise<FeatureFlags>): void {
    cacheService.setPendingRequest(CACHE_KEYS.FEATURE_FLAGS, promise);
  },

  clearPendingRequest(): void {
    cacheService.clearPendingRequest(CACHE_KEYS.FEATURE_FLAGS);
  },
};

/**
 * Generic cache utilities for future extensibility
 */
export const globalCache = {
  get: <T>(key: string) => cacheService.get<T>(key),
  set: <T>(key: string, data: T, ttl: number = DEFAULT_CACHE_CONFIG.ttl) =>
    cacheService.set(key, data, ttl),
  isValid: (key: string) => cacheService.isValid(key),
  has: (key: string) => cacheService.has(key),
  invalidate: (key: string) => cacheService.invalidate(key),
  clear: () => cacheService.clear(),
};

export default featureFlagsCache;

// ============================================================================
// React Hook for Feature Flags
// ============================================================================

interface UseFeatureFlagsReturn {
  flags: FeatureFlags;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * React hook for accessing feature flags with automatic caching.
 * Returns default flags immediately while loading from cache/API.
 */
export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    // Try to get cached flags first, fallback to defaults
    return featureFlagsCache.get() ?? featureFlagsCache.getDefaults();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have valid cached flags
      if (featureFlagsCache.isValid()) {
        const cachedFlags = featureFlagsCache.get();
        if (cachedFlags) {
          setFlags(cachedFlags);
          setIsLoading(false);
          return;
        }
      }

      // Return stale data while loading if available
      const staleFlags = featureFlagsCache.getStale();
      if (staleFlags) {
        setFlags(staleFlags);
      }

      // For now, just use defaults since API endpoint may not exist yet
      // In production, this would fetch from API
      const newFlags = featureFlagsCache.getDefaults();
      featureFlagsCache.set(newFlags);
      setFlags(newFlags);
    } catch (err) {
      console.error('[useFeatureFlags] Error fetching flags:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch feature flags'));
      // Keep using cached/default flags on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only refresh if cache is not valid
    if (!featureFlagsCache.isValid()) {
      refresh();
    }
  }, [refresh]);

  return { flags, isLoading, error, refresh };
}
