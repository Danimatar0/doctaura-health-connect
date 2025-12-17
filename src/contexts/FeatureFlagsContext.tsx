import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { featureFlagsCache, FeatureFlags, ApiFeatureFlags } from '@/services/featureFlagsService';

interface FeatureFlagsContextType {
  featureFlags: FeatureFlags;
  isLoaded: boolean;
  updateFeatureFlags: (flags: ApiFeatureFlags | undefined | null) => void;
  invalidateCache: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

interface FeatureFlagsProviderProps {
  children: ReactNode;
}

export const FeatureFlagsProvider = ({ children }: FeatureFlagsProviderProps) => {
  // Initialize from cache if available, otherwise use defaults
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(() => {
    const cached = featureFlagsCache.get();
    return cached || featureFlagsCache.getDefaults();
  });
  const [isLoaded, setIsLoaded] = useState(() => featureFlagsCache.isValid());

  /**
   * Update feature flags from API response.
   * Called by components that fetch data containing feature flags (e.g., PatientDashboard)
   */
  const updateFeatureFlags = useCallback((apiFlags: ApiFeatureFlags | undefined | null) => {
    const mergedFlags = featureFlagsCache.mergeWithDefaults(apiFlags);

    // Update cache
    featureFlagsCache.set(mergedFlags);

    // Update state
    setFeatureFlags(mergedFlags);
    setIsLoaded(true);

    console.log('[FeatureFlags] Updated:', mergedFlags);
  }, []);

  const invalidateCache = useCallback(() => {
    featureFlagsCache.invalidate();
    setFeatureFlags(featureFlagsCache.getDefaults());
    setIsLoaded(false);
  }, []);

  return (
    <FeatureFlagsContext.Provider
      value={{
        featureFlags,
        isLoaded,
        updateFeatureFlags,
        invalidateCache,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
};

/**
 * Hook to access feature flags
 */
export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

/**
 * Hook to check a specific feature flag
 */
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const { featureFlags } = useFeatureFlags();
  return featureFlags[flag];
};

export default FeatureFlagsContext;
