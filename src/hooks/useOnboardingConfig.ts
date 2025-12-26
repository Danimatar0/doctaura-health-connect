/**
 * useOnboardingConfig Hook
 *
 * Production-ready React hook for onboarding configuration with:
 * - Instant loading from IndexedDB cache
 * - Background ETag-based revalidation
 * - Never blocks rendering
 * - Safe for app boot and registration screens
 *
 * Vue Compatibility Note:
 * The underlying service (onboardingConfigService) is framework-agnostic.
 * For Vue 3, create a composable that wraps the service with ref() and onMounted().
 * See the Vue composable example at the bottom of this file.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  onboardingConfigService,
  type OnboardingConfigPayload,
} from '@/services/onboardingConfigService';
import type { UseOnboardingConfigResult } from '@/types/onboardingConfig';

/**
 * Hook options for customizing behavior
 */
interface UseOnboardingConfigOptions {
  /**
   * Whether to automatically revalidate on mount.
   * Default: true
   */
  revalidateOnMount?: boolean;

  /**
   * Whether to revalidate when window regains focus.
   * Default: true
   */
  revalidateOnFocus?: boolean;

  /**
   * Whether to revalidate when network comes back online.
   * Default: true
   */
  revalidateOnReconnect?: boolean;
}

const defaultOptions: UseOnboardingConfigOptions = {
  revalidateOnMount: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

/**
 * React hook for accessing onboarding configuration.
 *
 * Features:
 * - Loads cached data immediately (no loading flash)
 * - Revalidates in background without blocking UI
 * - Handles offline scenarios gracefully
 * - Deduplicates concurrent requests
 *
 * @param options - Optional configuration for revalidation behavior
 * @returns Object with data, loading state, error, version, and control functions
 *
 * @example
 * // Basic usage
 * function RegistrationForm() {
 *   const { data, loading, error } = useOnboardingConfig();
 *
 *   if (loading && !data) {
 *     return <Skeleton />;
 *   }
 *
 *   return (
 *     <form>
 *       <CountrySelect countries={data?.countries} />
 *       <GenderSelect genders={data?.genders} />
 *     </form>
 *   );
 * }
 *
 * @example
 * // With manual revalidation
 * function ConfigPanel() {
 *   const { data, version, revalidate, invalidate } = useOnboardingConfig();
 *
 *   return (
 *     <div>
 *       <p>Config version: {version}</p>
 *       <button onClick={revalidate}>Check for updates</button>
 *       <button onClick={invalidate}>Clear cache</button>
 *     </div>
 *   );
 * }
 */
export function useOnboardingConfig(
  options: UseOnboardingConfigOptions = {}
): UseOnboardingConfigResult {
  const opts = { ...defaultOptions, ...options };

  // State
  const [data, setData] = useState<OnboardingConfigPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  // Track if initial load is complete
  const initialLoadComplete = useRef(false);

  /**
   * Safely update state only if component is still mounted
   */
  const safeSetState = useCallback(
    <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
      if (isMounted.current) {
        setter(value);
      }
    },
    []
  );

  /**
   * Load configuration from cache and trigger revalidation
   */
  const loadConfig = useCallback(async () => {
    try {
      // Get cached version synchronously for immediate display
      const cachedVersion = onboardingConfigService.getCachedVersion();
      if (cachedVersion) {
        safeSetState(setVersion, cachedVersion);
      }

      // Load from IndexedDB (async but fast)
      const cached = await onboardingConfigService.getCached();

      if (cached?.payload) {
        safeSetState(setData, cached.payload);
        safeSetState(setVersion, cached.version);
        safeSetState(setLoading, false);
        initialLoadComplete.current = true;
      }

      // Trigger background revalidation
      if (opts.revalidateOnMount) {
        safeSetState(setIsRevalidating, true);

        const result = await onboardingConfigService.revalidate(cached?.etag);

        if (result.status === 'updated' && result.data) {
          safeSetState(setData, result.data);
          safeSetState(setVersion, result.version!);
        } else if (result.status === 'error' && !cached?.payload) {
          // Only set error if we don't have cached data
          safeSetState(setError, result.error!);
        }

        safeSetState(setIsRevalidating, false);
      }

      // If no cached data and no revalidation, try to fetch
      if (!cached?.payload && !opts.revalidateOnMount) {
        const freshData = await onboardingConfigService.forceRefresh();
        if (freshData) {
          safeSetState(setData, freshData);
          safeSetState(setVersion, onboardingConfigService.getCachedVersion());
        }
      }

      safeSetState(setLoading, false);
      initialLoadComplete.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load config');
      safeSetState(setError, error);
      safeSetState(setLoading, false);
      initialLoadComplete.current = true;
    }
  }, [opts.revalidateOnMount, safeSetState]);

  /**
   * Manual revalidation function
   */
  const revalidate = useCallback(async () => {
    safeSetState(setIsRevalidating, true);
    safeSetState(setError, null);

    try {
      const cached = await onboardingConfigService.getCached();
      const result = await onboardingConfigService.revalidate(cached?.etag);

      if (result.status === 'updated' && result.data) {
        safeSetState(setData, result.data);
        safeSetState(setVersion, result.version!);
      } else if (result.status === 'error') {
        safeSetState(setError, result.error!);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Revalidation failed');
      safeSetState(setError, error);
    } finally {
      safeSetState(setIsRevalidating, false);
    }
  }, [safeSetState]);

  /**
   * Clear cache and refetch
   */
  const invalidate = useCallback(async () => {
    safeSetState(setLoading, true);
    safeSetState(setError, null);

    try {
      await onboardingConfigService.invalidate();

      const freshData = await onboardingConfigService.forceRefresh();
      if (freshData) {
        safeSetState(setData, freshData);
        safeSetState(setVersion, onboardingConfigService.getCachedVersion());
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh config');
      safeSetState(setError, error);
    } finally {
      safeSetState(setLoading, false);
    }
  }, [safeSetState]);

  // Initial load on mount
  useEffect(() => {
    loadConfig();

    return () => {
      isMounted.current = false;
    };
  }, [loadConfig]);

  // Revalidate on window focus
  useEffect(() => {
    if (!opts.revalidateOnFocus) return;

    const handleFocus = () => {
      if (initialLoadComplete.current && document.visibilityState === 'visible') {
        revalidate();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [opts.revalidateOnFocus, revalidate]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!opts.revalidateOnReconnect) return;

    const handleOnline = () => {
      if (initialLoadComplete.current) {
        revalidate();
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [opts.revalidateOnReconnect, revalidate]);

  return {
    data,
    loading,
    isRevalidating,
    error,
    version,
    revalidate,
    invalidate,
  };
}

/**
 * Vue 3 Composable Example
 * ========================
 *
 * The onboardingConfigService is framework-agnostic.
 * Here's how to create an equivalent Vue 3 composable:
 *
 * ```typescript
 * // useOnboardingConfig.ts (Vue 3)
 * import { ref, onMounted, onUnmounted } from 'vue';
 * import { onboardingConfigService } from '@/services/onboardingConfigService';
 * import type { OnboardingConfigPayload } from '@/types/onboardingConfig';
 *
 * export function useOnboardingConfig() {
 *   const data = ref<OnboardingConfigPayload | null>(null);
 *   const loading = ref(true);
 *   const isRevalidating = ref(false);
 *   const error = ref<Error | null>(null);
 *   const version = ref<string | null>(null);
 *
 *   async function loadConfig() {
 *     try {
 *       version.value = onboardingConfigService.getCachedVersion();
 *       const cached = await onboardingConfigService.getCached();
 *
 *       if (cached?.payload) {
 *         data.value = cached.payload;
 *         version.value = cached.version;
 *         loading.value = false;
 *       }
 *
 *       isRevalidating.value = true;
 *       const result = await onboardingConfigService.revalidate(cached?.etag);
 *
 *       if (result.status === 'updated' && result.data) {
 *         data.value = result.data;
 *         version.value = result.version!;
 *       }
 *
 *       isRevalidating.value = false;
 *       loading.value = false;
 *     } catch (err) {
 *       error.value = err instanceof Error ? err : new Error('Failed to load');
 *       loading.value = false;
 *     }
 *   }
 *
 *   async function revalidate() {
 *     isRevalidating.value = true;
 *     const cached = await onboardingConfigService.getCached();
 *     const result = await onboardingConfigService.revalidate(cached?.etag);
 *     if (result.status === 'updated' && result.data) {
 *       data.value = result.data;
 *       version.value = result.version!;
 *     }
 *     isRevalidating.value = false;
 *   }
 *
 *   async function invalidate() {
 *     loading.value = true;
 *     await onboardingConfigService.invalidate();
 *     const freshData = await onboardingConfigService.forceRefresh();
 *     if (freshData) {
 *       data.value = freshData;
 *       version.value = onboardingConfigService.getCachedVersion();
 *     }
 *     loading.value = false;
 *   }
 *
 *   onMounted(() => {
 *     loadConfig();
 *
 *     // Revalidate on visibility change
 *     document.addEventListener('visibilitychange', () => {
 *       if (document.visibilityState === 'visible') revalidate();
 *     });
 *
 *     // Revalidate on reconnect
 *     window.addEventListener('online', revalidate);
 *   });
 *
 *   return { data, loading, isRevalidating, error, version, revalidate, invalidate };
 * }
 * ```
 */

export default useOnboardingConfig;
