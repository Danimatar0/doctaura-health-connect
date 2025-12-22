/**
 * useEncryptionSession Hook
 *
 * Manages the encryption session lifecycle.
 * Establishes encryption session on app load (anonymous) for login encryption,
 * then optionally binds to user after authentication.
 *
 * Flow:
 * 1. App loads → Establish anonymous session
 * 2. Login → Use encrypted payload
 * 3. After login → Optionally bind session to user
 * 4. Session expires → Auto-refresh
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { EncryptionSessionManager } from '../crypto/managers/encryption-session-manager';
import { env } from '@/config/env';

const REFRESH_THRESHOLD_MINUTES = 30;

export function useEncryptionSession() {
  const { isAuthenticated } = useAuth();
  const refreshTimerRef = useRef<number>();
  const [isEstablishing, setIsEstablishing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasInitializedRef = useRef(false);

  const manager = EncryptionSessionManager.getInstance(env.api.baseUrl);

  /**
   * Establish or refresh encryption session.
   * Works for both anonymous (pre-login) and authenticated users.
   */
  const establishSession = useCallback(async () => {
    // Skip if already establishing
    if (isEstablishing) return;

    // Check if we need a new session
    if (manager.hasValidSession() && !manager.expiresWithin(REFRESH_THRESHOLD_MINUTES)) {
      setIsReady(true);
      return;
    }

    setIsEstablishing(true);
    setError(null);

    try {
      const { sessionId, expiresAt } = await manager.establish();
      // console.log('[EncryptionSession] Session established:', sessionId);
      setIsReady(true);

      // Schedule refresh before expiry
      const refreshIn =
        expiresAt.getTime() - Date.now() - REFRESH_THRESHOLD_MINUTES * 60 * 1000;

      if (refreshIn > 0) {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
        refreshTimerRef.current = window.setTimeout(establishSession, refreshIn);
      }
    } catch (err) {
      console.error('[EncryptionSession] Failed to establish session:', err);
      setError(err instanceof Error ? err : new Error('Failed to establish encryption session'));
      setIsReady(false);
    } finally {
      setIsEstablishing(false);
    }
  }, [manager, isEstablishing]);

  /**
   * Bind the current session to the authenticated user.
   * Called after successful login.
   */
  const bindSession = useCallback(async () => {
    const sessionId = manager.getSessionId();
    if (!sessionId) {
      console.warn('[EncryptionSession] No session to bind');
      return;
    }

    try {
      await fetch(`${env.api.baseUrl}/crypto/bind-session`, {
        method: 'POST',
        credentials: 'include', // Send auth cookies
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
      });
      // console.log('[EncryptionSession] Session bound to user');
    } catch (err) {
      // Binding is optional, log but don't fail
      console.warn('[EncryptionSession] Failed to bind session (optional):', err);
    }
  }, [manager]);

  // Establish session on app load (anonymous)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // console.log('[EncryptionSession] Initializing anonymous session...');
    establishSession();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [establishSession]);

  // Bind session after authentication
  useEffect(() => {
    if (isAuthenticated && isReady) {
      bindSession();
    }
  }, [isAuthenticated, isReady, bindSession]);

  // Invalidate session on logout
  useEffect(() => {
    if (!isAuthenticated && isReady) {
      // User logged out, but keep the session for next login
      // The session will be re-bound after next login
      // console.log('[EncryptionSession] User logged out, session remains for next login');
    }
  }, [isAuthenticated, isReady]);

  return {
    /** Current encryption session ID */
    sessionId: manager.getSessionId(),
    /** Whether there's a valid encryption session */
    hasValidSession: manager.hasValidSession(),
    /** Whether session is ready for use (established) */
    isReady,
    /** When the session expires */
    expiresAt: manager.getExpiresAt(),
    /** Whether session is being established */
    isEstablishing,
    /** Any error that occurred */
    error,
    /** Manually refresh/establish the session */
    refresh: establishSession,
    /** Bind session to authenticated user */
    bindSession,
    /** Get the session manager instance */
    getManager: () => manager,
  };
}

export default useEncryptionSession;
