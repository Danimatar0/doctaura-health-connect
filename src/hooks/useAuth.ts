/**
 * useAuth Hook
 *
 * React hook for authentication state management.
 * Wraps the authService to provide reactive authentication state.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '@/services/authService';
import type { AuthUser, UserRole } from '@/types/auth.types';

interface UseAuthReturn {
  /** Current authenticated user or null */
  user: AuthUser | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication state is being loaded */
  isLoading: boolean;
  /** User's role */
  role: UserRole | null;
  /** Login function */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  /** Logout function */
  logout: () => Promise<void>;
  /** Refresh user data from API */
  refreshUser: () => Promise<AuthUser | null>;
  /** Validate current session with backend */
  validateSession: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Optionally validate token with backend
          const validation = await authService.validateToken();
          if (!validation?.valid) {
            // Try to refresh token
            const refreshedUser = await authService.refreshToken();
            setUser(refreshedUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login handler
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const loggedInUser = await authService.login(email, password, rememberMe);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const updatedUser = await authService.fetchCurrentUser();
    setUser(updatedUser);
    return updatedUser;
  }, []);

  // Validate session
  const validateSession = useCallback(async () => {
    const validation = await authService.validateToken();
    if (!validation?.valid) {
      // Try refresh
      const refreshedUser = await authService.refreshToken();
      if (!refreshedUser) {
        setUser(null);
        return false;
      }
      setUser(refreshedUser);
    }
    return true;
  }, []);

  // Computed values
  const isAuthenticated = useMemo(() => {
    return user !== null && user.expiresAt > Date.now();
  }, [user]);

  const role = useMemo(() => {
    return user?.role || null;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    role,
    login,
    logout,
    refreshUser,
    validateSession,
  };
}

export default useAuth;
