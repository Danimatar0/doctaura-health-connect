/**
 * Encryption Context Provider
 *
 * Initializes the encryption session on app load.
 * The session is established anonymously for login encryption,
 * then bound to the user after authentication.
 *
 * Usage:
 * Wrap your app with <EncryptionProvider> to enable encrypted API calls.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useEncryptionSession } from '@/hooks/useEncryptionSession';

interface EncryptionContextValue {
  /** Current encryption session ID */
  sessionId: string | null;
  /** Whether there's a valid encryption session */
  hasValidSession: boolean;
  /** Whether session is ready for use (established) */
  isReady: boolean;
  /** When the session expires */
  expiresAt: Date | null;
  /** Whether session is being established */
  isEstablishing: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Manually refresh/establish the session */
  refresh: () => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextValue | null>(null);

interface EncryptionProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes and manages the encryption session.
 * Should be placed high in the component tree (in App.tsx).
 */
export function EncryptionProvider({ children }: EncryptionProviderProps) {
  const encryptionSession = useEncryptionSession();

  const value: EncryptionContextValue = {
    sessionId: encryptionSession.sessionId,
    hasValidSession: encryptionSession.hasValidSession,
    isReady: encryptionSession.isReady,
    expiresAt: encryptionSession.expiresAt,
    isEstablishing: encryptionSession.isEstablishing,
    error: encryptionSession.error,
    refresh: encryptionSession.refresh,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
}

/**
 * Hook to access the encryption context.
 * Provides access to encryption session state.
 */
export function useEncryption(): EncryptionContextValue {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}

export default EncryptionProvider;
