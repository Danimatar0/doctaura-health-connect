import { ReactNode } from "react";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { FeatureFlags } from "@/services/featureFlagsService";
import ComingSoon from "@/components/ComingSoon";

interface FeatureRouteProps {
  children: ReactNode;
  featureFlag: keyof FeatureFlags;
  featureTitle?: string;
  featureDescription?: string;
}

/**
 * Wrapper component that checks if a feature is enabled before rendering the route.
 * Shows a "Coming Soon" page if the feature is disabled.
 */
const FeatureRoute = ({
  children,
  featureFlag,
  featureTitle,
  featureDescription,
}: FeatureRouteProps) => {
  const { featureFlags, isLoaded } = useFeatureFlags();

  // Check if feature is enabled
  const isEnabled = featureFlags[featureFlag];

  // If flags are loaded and feature is disabled, show Coming Soon
  // If not loaded yet, show children (optimistic rendering - defaults are all true)
  if (isLoaded && !isEnabled) {
    return (
      <ComingSoon
        title={featureTitle || "Coming Soon"}
        description={
          featureDescription ||
          "This feature is not available at the moment. Please check back later."
        }
      />
    );
  }

  return <>{children}</>;
};

export default FeatureRoute;
