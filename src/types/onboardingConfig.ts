/**
 * Onboarding Configuration Types
 *
 * Types for the versioned caching system with IndexedDB + localStorage hybrid strategy.
 * Matches the backend response from GET /v1/config/onboarding
 */

/**
 * Country configuration for onboarding
 */
export interface CountryConfig {
  id: number;
  code: string;
  name: string;
  dialCode: string;
  flag?: string;
}

/**
 * Gender option for forms
 */
export interface GenderOption {
  id: number;
  code: string;
  name: string;
}

/**
 * Notification channel option
 */
export interface NotificationChannel {
  id: number;
  code: string;
  name: string;
}

/**
 * Blood type option
 */
export interface BloodType {
  id: number;
  code: string;
  name: string;
}

/**
 * Medical specialty for doctor registration
 */
export interface Specialty {
  id: number;
  code: string;
  name: string;
  description?: string;
}

/**
 * Language option for doctor registration
 */
export interface Language {
  id: number;
  code: string;
  name: string;
}

/**
 * Governorate (administrative region)
 */
export interface Governorate {
  id: number;
  code: string;
  name: string;
  countryId?: number;
}

/**
 * Reference data (static lookup tables)
 * Field names match backend GET /v1/config/onboarding response
 */
export interface OnboardingReferenceData {
  countries: CountryConfig[];
  gender: GenderOption[];
  notificationChannels: NotificationChannel[];
  bloodTypes: BloodType[];
  specialties: Specialty[];
  supportedLanguages: Language[];
  governorates: Governorate[];
}

/**
 * Validation rules for onboarding fields
 */
export interface OnboardingRules {
  minAge: number;
  maxAge: number;
  phoneMinLength: number;
  phoneMaxLength: number;
  requireEmail: boolean;
  requirePhone: boolean;
  requireEmergencyContact: boolean;
}

/**
 * Full onboarding configuration payload
 * This is what gets stored in IndexedDB (the inner "data" object)
 */
export interface OnboardingConfigPayload {
  reference: OnboardingReferenceData;
  rules: OnboardingRules;
}

/**
 * IndexedDB cache entry structure
 * Stored in the 'configs' object store with key as primary key
 */
export interface ConfigCacheEntry<T = OnboardingConfigPayload> {
  /** Primary key for the config (e.g., "onboarding") */
  key: string;
  /** Semantic version from the server */
  version: string;
  /** ETag for HTTP 304 revalidation */
  etag: string;
  /** Full configuration payload */
  payload: T;
  /** Unix timestamp (ms) of last successful update */
  updatedAt: number;
}

/**
 * localStorage metadata structure
 * Used for quick synchronous checks without hitting IndexedDB
 */
export interface ConfigMetadata {
  /** Current cached version */
  version: string;
  /** Unix timestamp (ms) of last revalidation check */
  lastChecked: number;
}

/**
 * Full API response from GET /v1/config/onboarding
 * Note: ETag comes from response headers, not body
 */
export interface OnboardingConfigResponse {
  /** Semantic version (e.g., "v1a2b3c4") */
  version: string;
  /** Server timestamp */
  serverTime: string;
  /** The actual configuration data */
  data: OnboardingConfigPayload;
}

/**
 * Hook return type for useOnboardingConfig
 */
export interface UseOnboardingConfigResult {
  /** The configuration data, or null if not loaded */
  data: OnboardingConfigPayload | null;
  /** True while loading from IndexedDB (initial load) */
  loading: boolean;
  /** True while revalidating with the server */
  isRevalidating: boolean;
  /** Error if loading or revalidation failed */
  error: Error | null;
  /** Current cached version */
  version: string | null;
  /** Manually trigger revalidation */
  revalidate: () => Promise<void>;
  /** Clear cache and refetch */
  invalidate: () => Promise<void>;
}

/**
 * Revalidation result types
 */
export type RevalidationStatus =
  | 'not_modified'      // Server returned 304
  | 'updated'           // Server returned new data
  | 'error'             // Network or server error
  | 'offline';          // No network connection

export interface RevalidationResult {
  status: RevalidationStatus;
  data?: OnboardingConfigPayload;
  version?: string;
  error?: Error;
}
