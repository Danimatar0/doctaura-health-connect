/**
 * Encryption Session Types
 *
 * Type definitions for the encryption session management system.
 */

export interface SessionEstablishmentResponse {
  sessionId: string;
  serverPublicKey: string;
  expiresAt: string;
}

export interface EncryptionSession {
  sessionId: string;
  masterKey: CryptoKey;
  expiresAt: Date;
}

export type EncryptionSection =
  | 'health'
  | 'financial'
  | 'identity'
  | 'authentication'
  | 'administrative';

export interface SessionMetadata {
  sessionId: string;
  expiresAt: string;
}