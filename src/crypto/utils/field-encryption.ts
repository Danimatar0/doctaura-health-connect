/**
 * Field-Level Encryption Utilities
 *
 * Encrypts/decrypts individual fields within an object based on field list.
 * Only specified fields are encrypted - the rest remain in plaintext.
 */

import type { EncryptionSection } from '../types';
import {
  getFieldValue,
  setFieldValue,
  hasField,
} from '../schemas/encrypted-fields';

// ============================================================================
// Types
// ============================================================================

/**
 * Encrypted field value inner structure
 */
export interface EncryptedFieldInner {
  /** Base64-encoded ciphertext (without auth tag) */
  c: string;
  /** Base64-encoded IV (12 bytes) */
  iv: string;
  /** Base64-encoded auth tag (16 bytes) */
  t: string;
}

/**
 * Encrypted field value wrapper - backend-compatible format
 */
export interface EncryptedFieldValue {
  /** Encryption marker containing encrypted data */
  $enc: EncryptedFieldInner;
}

/**
 * Result of field encryption
 */
export interface FieldEncryptionResult<T> {
  /** The data with encrypted fields */
  data: T;
  /** List of fields that were encrypted */
  encryptedFields: string[];
  /** The section used for encryption */
  section: EncryptionSection;
}

// ============================================================================
// Constants
// ============================================================================

const IV_LENGTH = 12;      // 12 bytes for AES-GCM IV
const TAG_LENGTH = 128;    // 128 bits for auth tag
const TAG_BYTES = 16;      // 16 bytes = 128 bits

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
// Core Field Encryption Functions
// ============================================================================

/**
 * Encrypt a single field value.
 *
 * @param value - The value to encrypt
 * @param key - The AES-GCM CryptoKey
 * @returns Encrypted field value wrapper in backend-compatible format
 */
export async function encryptFieldValue(
  value: unknown,
  key: CryptoKey
): Promise<EncryptedFieldValue> {
  // Serialize value to JSON
  const plaintext = JSON.stringify(value);
  const plaintextBytes = new TextEncoder().encode(plaintext);

  // Generate random IV (12 bytes)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt with AES-GCM (produces ciphertext + 16-byte tag appended)
  const ciphertextWithTag = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: TAG_LENGTH },
    key,
    plaintextBytes
  );

  // Split ciphertext and auth tag (tag is last 16 bytes)
  const data = new Uint8Array(ciphertextWithTag);
  const ciphertext = data.slice(0, -TAG_BYTES);
  const tag = data.slice(-TAG_BYTES);

  // Return in backend-expected format
  return {
    $enc: {
      c: arrayBufferToBase64(ciphertext.buffer),
      iv: arrayBufferToBase64(iv.buffer),
      t: arrayBufferToBase64(tag.buffer),
    },
  };
}

/**
 * Decrypt a single field value.
 *
 * @param encrypted - The encrypted field value wrapper
 * @param key - The AES-GCM CryptoKey
 * @returns The decrypted value
 */
export async function decryptFieldValue<T = unknown>(
  encrypted: EncryptedFieldValue,
  key: CryptoKey
): Promise<T> {
  const { c, iv, t } = encrypted.$enc;

  // Decode base64 values
  const ivBytes = new Uint8Array(base64ToArrayBuffer(iv));
  const ciphertextBytes = new Uint8Array(base64ToArrayBuffer(c));
  const tagBytes = new Uint8Array(base64ToArrayBuffer(t));

  // Reconstruct ciphertext with tag appended (as expected by Web Crypto)
  const ciphertextWithTag = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  ciphertextWithTag.set(ciphertextBytes, 0);
  ciphertextWithTag.set(tagBytes, ciphertextBytes.length);

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes, tagLength: TAG_LENGTH },
    key,
    ciphertextWithTag
  );

  const plaintext = new TextDecoder().decode(plaintextBuffer);
  return JSON.parse(plaintext) as T;
}

/**
 * Check if a value is an encrypted field wrapper.
 */
export function isEncryptedFieldValue(value: unknown): value is EncryptedFieldValue {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;

  // Check for $enc format
  if ('$enc' in obj && obj.$enc && typeof obj.$enc === 'object') {
    const enc = obj.$enc as Record<string, unknown>;
    return (
      typeof enc.c === 'string' &&
      typeof enc.iv === 'string' &&
      typeof enc.t === 'string'
    );
  }

  return false;
}

// ============================================================================
// Object-Level Field Encryption
// ============================================================================

/**
 * Options for field encryption/decryption
 */
export interface FieldOperationOptions {
  /** Optional conditions to check before encrypting a field */
  conditions?: Record<string, (value: unknown) => boolean>;
}

/**
 * Encrypt specified fields in an object.
 *
 * @param data - The object containing fields to encrypt
 * @param fields - List of field paths to encrypt (e.g., ['ssn', 'address.street'])
 * @param key - The AES-GCM CryptoKey
 * @param section - The encryption section (for metadata)
 * @param options - Optional conditions
 * @returns Object with encrypted fields and metadata
 */
export async function encryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
  key: CryptoKey,
  section: EncryptionSection,
  options?: FieldOperationOptions
): Promise<FieldEncryptionResult<T>> {
  // Deep clone to avoid mutating original
  const result = JSON.parse(JSON.stringify(data)) as T;
  const encryptedFields: string[] = [];

  for (const fieldPath of fields) {
    // Check if field exists
    if (!hasField(data, fieldPath)) {
      continue;
    }

    // Get field value
    const value = getFieldValue(data, fieldPath);

    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }

    // Check conditions if specified
    if (options?.conditions?.[fieldPath]) {
      if (!options.conditions[fieldPath](value)) {
        continue;
      }
    }

    // Encrypt the field
    const encrypted = await encryptFieldValue(value, key);
    setFieldValue(result as Record<string, unknown>, fieldPath, encrypted);
    encryptedFields.push(fieldPath);
  }

  return {
    data: result,
    encryptedFields,
    section,
  };
}

/**
 * Decrypt specified fields in an object.
 *
 * @param data - The object containing encrypted fields
 * @param fields - List of field paths to decrypt
 * @param key - The AES-GCM CryptoKey
 * @returns Object with decrypted fields
 */
export async function decryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
  key: CryptoKey
): Promise<T> {
  // Deep clone to avoid mutating original
  const result = JSON.parse(JSON.stringify(data)) as T;

  for (const fieldPath of fields) {
    // Get field value
    const value = getFieldValue(data, fieldPath);

    // Check if field is encrypted
    if (!isEncryptedFieldValue(value)) {
      continue;
    }

    // Decrypt the field
    const decrypted = await decryptFieldValue(value, key);
    setFieldValue(result as Record<string, unknown>, fieldPath, decrypted);
  }

  return result;
}

/**
 * Auto-detect and decrypt any encrypted fields in an object.
 * Useful when you don't know the schema in advance.
 *
 * @param data - The object to scan for encrypted fields
 * @param cryptoKey - The AES-GCM CryptoKey
 * @returns Object with all encrypted fields decrypted
 */
export async function autoDecryptFields<T>(
  data: T,
  cryptoKey: CryptoKey
): Promise<T> {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Deep clone
  const result = JSON.parse(JSON.stringify(data));

  // Recursively find and decrypt encrypted fields
  async function processObject(obj: Record<string, unknown>, path: string = ''): Promise<void> {
    for (const [propName, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${propName}` : propName;

      if (isEncryptedFieldValue(value)) {
        // Decrypt this field
        const decrypted = await decryptFieldValue(value, cryptoKey);
        obj[propName] = decrypted;
      } else if (value && typeof value !== 'object') {
        // Skip primitives
      } else if (value && !Array.isArray(value)) {
        // Recurse into nested objects
        await processObject(value as Record<string, unknown>, currentPath);
      } else if (Array.isArray(value)) {
        // Handle arrays
        for (let i = 0; i < value.length; i++) {
          if (isEncryptedFieldValue(value[i])) {
            value[i] = await decryptFieldValue(value[i], cryptoKey);
          } else if (value[i] && typeof value[i] === 'object') {
            await processObject(value[i] as Record<string, unknown>, `${currentPath}[${i}]`);
          }
        }
      }
    }
  }

  await processObject(result as Record<string, unknown>);
  return result as T;
}
