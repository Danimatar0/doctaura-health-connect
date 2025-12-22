/**
 * Payload Encryption Utilities
 *
 * Provides AES-GCM encryption/decryption for HTTP payloads.
 * Uses section-specific keys derived from the ECDH shared secret.
 */

import type { EncryptionSection } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface EncryptedPayload {
  /** Base64-encoded IV (12 bytes for AES-GCM) */
  iv: string;
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded authentication tag (included in ciphertext for Web Crypto) */
  tag?: string;
  /** Section used for key derivation */
  section: EncryptionSection;
}

export interface DecryptedPayload<T = unknown> {
  data: T;
  section: EncryptionSection;
}

// ============================================================================
// Constants
// ============================================================================

const IV_LENGTH = 12; // 96 bits for AES-GCM
const TAG_LENGTH = 128; // 128-bit authentication tag

// ============================================================================
// Encoding Utilities
// ============================================================================

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================================================
// Core Encryption Functions
// ============================================================================

/**
 * Encrypts a payload using AES-GCM with a section-specific key.
 *
 * @param data - The data to encrypt (will be JSON-stringified)
 * @param key - The AES-GCM CryptoKey for encryption
 * @param section - The encryption section (for metadata)
 * @returns Encrypted payload with IV and ciphertext
 */
export async function encryptPayload<T>(
  data: T,
  key: CryptoKey,
  section: EncryptionSection
): Promise<EncryptedPayload> {
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Serialize data to JSON
  const plaintext = JSON.stringify(data);
  const plaintextBytes = new TextEncoder().encode(plaintext);

  // Encrypt with AES-GCM
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    plaintextBytes
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    section,
  };
}

/**
 * Decrypts a payload using AES-GCM with a section-specific key.
 *
 * @param encrypted - The encrypted payload
 * @param key - The AES-GCM CryptoKey for decryption
 * @returns Decrypted and parsed data
 */
export async function decryptPayload<T>(
  encrypted: EncryptedPayload,
  key: CryptoKey
): Promise<DecryptedPayload<T>> {
  // Decode IV and ciphertext
  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const ciphertext = new Uint8Array(base64ToArrayBuffer(encrypted.ciphertext));

  // Decrypt with AES-GCM
  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    ciphertext
  );

  // Parse JSON
  const plaintext = new TextDecoder().decode(plaintextBuffer);
  const data = JSON.parse(plaintext) as T;

  return {
    data,
    section: encrypted.section,
  };
}

/**
 * Signs a payload using HMAC-SHA256.
 * Used for request integrity verification.
 *
 * @param payload - The payload to sign (stringified)
 * @param key - The HMAC signing key
 * @returns Base64-encoded signature
 */
export async function signPayload(payload: string, key: CryptoKey): Promise<string> {
  const payloadBytes = new TextEncoder().encode(payload);
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes);
  return arrayBufferToBase64(signature);
}

/**
 * Verifies a payload signature using HMAC-SHA256.
 *
 * @param payload - The payload that was signed
 * @param signature - The Base64-encoded signature to verify
 * @param key - The HMAC signing key
 * @returns True if signature is valid
 */
export async function verifyPayload(
  payload: string,
  signature: string,
  key: CryptoKey
): Promise<boolean> {
  const payloadBytes = new TextEncoder().encode(payload);
  const signatureBytes = new Uint8Array(base64ToArrayBuffer(signature));
  return crypto.subtle.verify('HMAC', key, signatureBytes, payloadBytes);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a response contains an encrypted payload.
 */
export function isEncryptedPayload(data: unknown): data is EncryptedPayload {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.iv === 'string' &&
    typeof obj.ciphertext === 'string' &&
    typeof obj.section === 'string'
  );
}

/**
 * Creates an encrypted request body ready to send.
 */
export function createEncryptedRequestBody(encrypted: EncryptedPayload): string {
  return JSON.stringify(encrypted);
}
