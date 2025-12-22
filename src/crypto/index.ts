/**
 * Crypto Module Barrel Export
 */

// Session Management
export { EncryptionSessionManager } from './managers/encryption-session-manager';

// Encryption Middleware
export {
  initializeEncryptionMiddleware,
  shouldEncrypt,
  isEncryptionReady,
  encryptRequest,
  decryptResponse,
  processRequestBody,
  processResponseData,
  isEncryptedPayload,
  isEncryptedFieldValue,
  ENCRYPTION_HEADERS,
  type EncryptionOptions,
  type EncryptedRequestResult,
  type ProcessedResponse,
} from './middleware/encryption-middleware';

// Payload Encryption Utilities (Full Payload)
export {
  encryptPayload,
  decryptPayload,
  signPayload,
  verifyPayload,
  createEncryptedRequestBody,
  type EncryptedPayload,
  type DecryptedPayload,
} from './utils/payload-encryption';

// Field-Level Encryption Utilities
export {
  encryptFieldValue,
  decryptFieldValue,
  encryptFields,
  decryptFields,
  autoDecryptFields,
  type EncryptedFieldValue,
  type FieldEncryptionResult,
  type FieldOperationOptions,
} from './utils/field-encryption';

// Encrypted Fields Schema/Registry
export {
  ENCRYPTED_FIELD_SCHEMAS,
  registerEncryptedFields,
  getEncryptedFieldConfig,
  hasEncryptedFields,
  hasEncryptedRequestFields,
  hasEncryptedResponseFields,
  getRegisteredSchemas,
  getFieldValue,
  setFieldValue,
  hasField,
  type EncryptedFieldConfig,
  type EncryptedFieldSchemas,
} from './schemas/encrypted-fields';

// Types
export type {
  EncryptionSession,
  EncryptionSection,
  SessionEstablishmentResponse,
  SessionMetadata,
} from './types';
