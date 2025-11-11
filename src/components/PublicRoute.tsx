import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { keycloakService } from "@/services/keycloakService";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
}

/**
 * PublicRoute Component
 * For pages like login/register that should redirect authenticated users
 */
const PublicRoute = ({ children, redirectIfAuthenticated = true }: PublicRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = keycloakService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated and should redirect, go to appropriate dashboard
  if (isAuthenticated && redirectIfAuthenticated) {
    const userRole = keycloakService.getUserRole();
    if (userRole) {
      const dashboardUrl = keycloakService.getDashboardUrl(userRole);
      return <Navigate to={dashboardUrl} replace />;
    }
  }

  // Not authenticated or allowed to view - show the page
  return <>{children}</>;
};

export default PublicRoute;
