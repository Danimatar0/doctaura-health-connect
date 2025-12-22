import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";
import { UserRole } from "@/types/auth.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute Component
 * Protects routes by checking if user is authenticated
 * Optionally checks if user has the required role
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasValidRole, setHasValidRole] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated && allowedRoles) {
          // Check if user has one of the allowed roles
          const userRole = authService.getUserRole();
          setHasValidRole(userRole ? allowedRoles.includes(userRole) : false);
        } else if (authenticated) {
          // No role restriction, just authenticated
          setHasValidRole(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setHasValidRole(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Set up an interval to periodically check authentication
    const interval = setInterval(() => {
      const authenticated = authService.isAuthenticated();
      if (!authenticated) {
        setIsAuthenticated(false);
        setIsChecking(false);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [allowedRoles]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but doesn't have required role - redirect to appropriate dashboard
  if (allowedRoles && !hasValidRole) {
    const userRole = authService.getUserRole();
    if (userRole) {
      const dashboardUrl = authService.getDashboardUrl(userRole);
      return <Navigate to={dashboardUrl} replace />;
    }
    // Fallback to login if role is somehow missing
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated and has valid role (or no role restriction)
  return <>{children}</>;
};

export default ProtectedRoute;
