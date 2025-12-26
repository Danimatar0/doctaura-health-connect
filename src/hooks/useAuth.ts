/**
 * useAuth Hook
 *
 * React hook for authentication state management.
 * Wraps the authService to provide reactive authentication state.
 *
 * Token validation strategy:
 * - On init: Only validate if token expires within threshold
 * - On window focus: Validate if user was away for a period
 * - Never validate on every page load (reduces API calls)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { authService } from '@/services/authService';
import type { AuthUser, UserRole } from '@/types/auth.types';

/** Validate token if it expires within this many minutes */
const TOKEN_EXPIRY_THRESHOLD_MINUTES = 5;
/** Validate on focus if user was away for this many minutes */
const AWAY_THRESHOLD_MINUTES = 10;

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
  const lastActiveRef = useRef<number>(Date.now());
  const validationInProgressRef = useRef<boolean>(false);

  /**
   * Check if token expires within threshold (client-side check)
   */
  const isTokenNearExpiry = useCallback((expiresAt: number): boolean => {
    const thresholdMs = TOKEN_EXPIRY_THRESHOLD_MINUTES * 60 * 1000;
    return expiresAt - Date.now() < thresholdMs;
  }, []);

  /**
   * Validate and refresh token if needed
   */
  const validateAndRefreshIfNeeded = useCallback(async (currentUser: AuthUser): Promise<AuthUser | null> => {
    // Prevent concurrent validations
    if (validationInProgressRef.current) return currentUser;
    validationInProgressRef.current = true;

    try {
      const validation = await authService.validateToken();
      if (!validation?.valid) {
        // Token invalid, try to refresh
        const refreshedUser = await authService.refreshToken();
        return refreshedUser;
      }
      return currentUser;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    } finally {
      validationInProgressRef.current = false;
    }
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);

          // Only validate if token is near expiry (client-side check first)
          if (isTokenNearExpiry(currentUser.expiresAt)) {
            const validatedUser = await validateAndRefreshIfNeeded(currentUser);
            setUser(validatedUser);
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
  }, [isTokenNearExpiry, validateAndRefreshIfNeeded]);

  // Validate on window focus if user was away for a period
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;

        const awayTime = Date.now() - lastActiveRef.current;
        const awayThresholdMs = AWAY_THRESHOLD_MINUTES * 60 * 1000;

        // Only validate if user was away for longer than threshold
        // OR if token is near expiry
        if (awayTime > awayThresholdMs || isTokenNearExpiry(currentUser.expiresAt)) {
          const validatedUser = await validateAndRefreshIfNeeded(currentUser);
          if (validatedUser) {
            setUser(validatedUser);
          } else {
            // Token invalid and refresh failed - log out
            setUser(null);
            authService.clearSession();
          }
        }
      } else {
        // User is leaving, record the time
        lastActiveRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTokenNearExpiry, validateAndRefreshIfNeeded]);

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
