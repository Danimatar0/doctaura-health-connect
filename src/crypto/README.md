# Encryption System Documentation

This document describes the client-side encryption system for securing sensitive data in HTTP requests and responses.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Encryption Modes](#encryption-modes)
- [Configuration](#configuration)
- [Usage](#usage)
- [Schema Definition](#schema-definition)
- [Debugging](#debugging)
- [API Reference](#api-reference)

---

## Overview

The encryption system provides end-to-end encryption for sensitive data using:

- **ECDH (P-256)** for key exchange
- **AES-256-GCM** for symmetric encryption
- **HKDF-SHA256** for key derivation
- **HMAC-SHA256** for request signing

### Security Flow

```
┌─────────────┐                              ┌─────────────┐
│   Client    │                              │   Backend   │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. Generate ECDH keypair                  │
       │  2. POST /api/crypto/establish-session     │
       │     { clientPublicKey, deviceId }          │
       │ ─────────────────────────────────────────> │
       │                                            │
       │  3. { sessionId, serverPublicKey,          │
       │       expiresAt }                          │
       │ <───────────────────────────────────────── │
       │                                            │
       │  4. Derive shared secret (ECDH)            │
       │  5. Derive section keys (HKDF)             │
       │                                            │
       │  6. Encrypted requests/responses           │
       │ <──────────────────────────────────────>   │
       │                                            │
```

---

## Architecture

```
src/crypto/
├── managers/
│   └── encryption-session-manager.ts   # Session lifecycle & key derivation
├── middleware/
│   └── encryption-middleware.ts        # HTTP request/response processing
├── schemas/
│   └── encrypted-fields.ts             # Field encryption registry
├── utils/
│   ├── payload-encryption.ts           # Full payload encryption
│   └── field-encryption.ts             # Field-level encryption
├── types.ts                            # Type definitions
├── index.ts                            # Barrel exports
└── README.md                           # This file
```

---

## Encryption Modes

### 1. Field-Level Encryption (Recommended)

Encrypts only specific fields marked in the schema. The rest of the payload remains in plaintext.

**Pros:**
- Backend can read non-sensitive fields without decryption
- Smaller encrypted payload size
- Easier debugging (can see structure)
- Selective encryption per field

**Example:**
```json
// Original
{ "name": "John", "ssn": "123-45-6789", "email": "john@example.com" }

// Encrypted (only ssn)
{
  "name": "John",
  "ssn": { "__encrypted": true, "iv": "...", "ct": "..." },
  "email": "john@example.com"
}
```

### 2. Full Payload Encryption

Encrypts the entire request/response body. Disabled by default.

**Pros:**
- Maximum security (hides all data structure)
- Simpler schema (no field lists needed)

**Example:**
```json
// Original
{ "name": "John", "ssn": "123-45-6789" }

// Encrypted (entire payload)
{ "iv": "...", "ciphertext": "...", "section": "health" }
```

---

## Configuration

### Environment Variables

```env
# .env

# Enable FULL payload encryption for ALL requests (disabled by default)
# When false: only fields marked in schema are encrypted
# When true: entire payload is encrypted
VITE_ENABLE_PAYLOAD_ENCRYPTION=false
```

### Encryption Sections

Keys are derived per-section for data isolation:

| Section | Context | Use Case |
|---------|---------|----------|
| `health` | PHI data | Medical records, diagnoses, prescriptions |
| `financial` | PCI data | Payment info, bank accounts |
| `identity` | PII data | SSN, passport, national ID |
| `authentication` | Credentials | Passwords, tokens |
| `administrative` | Admin data | Internal records |

---

## Usage

### Basic Usage with Schema

```typescript
import { customInstance } from '@/api/mutator/customInstance';
import { registerEncryptedFields } from '@/crypto';

// 1. Register schema (once, at app initialization)
registerEncryptedFields('patient-update', {
  requestFields: ['password', 'ssn'],           // Encrypt in request
  responseFields: ['ssn', 'diagnosis', 'notes'], // Decrypt in response
  section: 'health',
});

// 2. Use in API call
const response = await customInstance<PatientDTO>('/api/patients/me', {
  method: 'PUT',
  body: JSON.stringify({
    name: 'John Doe',        // Stays plaintext
    ssn: '123-45-6789',      // Gets encrypted
    password: 'newpass123',  // Gets encrypted
  }),
  encryption: { schemaId: 'patient-update' },
});

// Response fields (ssn, diagnosis, notes) are automatically decrypted
console.log(response.ssn);       // "123-45-6789" (decrypted)
console.log(response.diagnosis); // "Healthy" (decrypted)
```

### Convenience Functions

```typescript
import { encryptedFieldRequest, encryptedFullRequest } from '@/api/mutator/customInstance';

// Field-level encryption
await encryptedFieldRequest('/api/patients/me', {
  method: 'PUT',
  body: JSON.stringify(data),
}, 'patient-update');

// Full payload encryption (forces encryption regardless of .env)
await encryptedFullRequest('/api/sensitive/data', {
  method: 'POST',
  body: JSON.stringify(data),
}, 'health');
```

### Disable Encryption for Specific Request

```typescript
await customInstance('/api/public/data', {
  method: 'GET',
  encryption: { disabled: true }, // Skip encryption even if globally enabled
});
```

---

## Schema Definition

### Location

Define schemas in `src/crypto/schemas/encrypted-fields.ts`:

```typescript
export const ENCRYPTED_FIELD_SCHEMAS: EncryptedFieldSchemas = {
  // Schema ID → Configuration
  'patient-update': {
    requestFields: ['ssn', 'password'],
    responseFields: ['ssn', 'diagnosis', 'medicalHistory'],
    section: 'health',
  },
};
```

### Schema Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `requestFields` | `string[]` | No | Fields to encrypt in outgoing requests |
| `responseFields` | `string[]` | No | Fields to decrypt in incoming responses |
| `section` | `EncryptionSection` | Yes | Key derivation section |
| `conditions` | `Record<string, Function>` | No | Conditional encryption |

### Nested Field Paths

Use dot notation for nested fields:

```typescript
registerEncryptedFields('patient-full', {
  requestFields: [
    'ssn',
    'address.street',        // Nested field
    'contacts[0].phone',     // Array element (not yet supported)
  ],
  responseFields: [
    'medicalHistory.diagnoses',
    'medicalHistory.medications',
  ],
  section: 'health',
});
```

### Dynamic Registration

```typescript
import { registerEncryptedFields } from '@/crypto';

// Register at runtime
registerEncryptedFields('custom-schema', {
  requestFields: ['secretField'],
  section: 'authentication',
});
```

---

## Debugging

### 1. Check Encryption Headers

Encrypted requests include these headers:

| Header | Value | Description |
|--------|-------|-------------|
| `X-Encrypted` | `true` | Indicates payload is encrypted |
| `X-Encryption-Type` | `field` or `full` | Encryption mode used |
| `X-Encryption-Session-Id` | UUID | Session ID for key lookup |
| `X-Encryption-Section` | `health`, etc. | Section used for key |
| `X-Encryption-Schema` | Schema ID | Schema used (field mode) |
| `X-Encrypted-Fields` | `ssn,password` | List of encrypted fields |
| `X-Request-Signature` | Base64 | HMAC signature |

### 2. Identify Encrypted Fields

Encrypted field values have this structure:

```json
{
  "__encrypted": true,
  "iv": "base64-encoded-iv",
  "ct": "base64-encoded-ciphertext"
}
```

### 3. Console Logging

The middleware logs warnings/errors to console:

```javascript
// Enable verbose logging in development
// Look for these prefixes:
[EncryptionMiddleware] No valid session, skipping encryption
[EncryptionMiddleware] Encryption requested but session not ready
[EncryptionMiddleware] Encryption failed: <error>
[EncryptionMiddleware] Decryption failed: <error>
[EncryptionSession] Session established: <sessionId>
```

### 4. Check Session Status

```typescript
import { useEncryptionSession } from '@/hooks';

function DebugComponent() {
  const { sessionId, hasValidSession, expiresAt, isEstablishing, error } = useEncryptionSession();

  console.log({
    sessionId,
    hasValidSession,
    expiresAt,
    isEstablishing,
    error,
  });
}
```

### 5. Verify Schema Registration

```typescript
import {
  getEncryptedFieldConfig,
  hasEncryptedRequestFields,
  hasEncryptedResponseFields,
  getRegisteredSchemas
} from '@/crypto';

// Check all registered schemas
console.log('Registered schemas:', getRegisteredSchemas());

// Check specific schema
const config = getEncryptedFieldConfig('patient-update');
console.log('Schema config:', config);

// Check if schema has fields
console.log('Has request fields:', hasEncryptedRequestFields('patient-update'));
console.log('Has response fields:', hasEncryptedResponseFields('patient-update'));
```

### 6. Common Issues

#### Issue: Fields not being encrypted

**Possible causes:**
- Schema not registered
- `requestFields` array is empty or missing
- Field path doesn't match (check spelling, nesting)
- No valid encryption session

**Debug:**
```typescript
const config = getEncryptedFieldConfig('your-schema');
console.log('Request fields:', config?.requestFields);
```

#### Issue: Fields not being decrypted

**Possible causes:**
- `responseFields` array is empty or missing
- Response doesn't contain encrypted markers
- Different schema used for request vs response

**Debug:**
```typescript
// Log raw response before decryption
const rawResponse = await fetch(url);
const data = await rawResponse.json();
console.log('Raw response:', JSON.stringify(data, null, 2));
// Look for { __encrypted: true, iv: ..., ct: ... }
```

#### Issue: Session not established

**Possible causes:**
- User not authenticated (HTTP-only cookie missing)
- Backend `/api/crypto/establish-session` endpoint unavailable
- Network error during key exchange

**Debug:**
```typescript
import { EncryptionSessionManager } from '@/crypto';

const manager = EncryptionSessionManager.getInstance();
console.log('Has valid session:', manager.hasValidSession());
console.log('Session ID:', manager.getSessionId());
console.log('Expires at:', manager.getExpiresAt());
```

#### Issue: Decryption fails with wrong key

**Possible causes:**
- Session expired and re-established (new keys)
- Different section used for encryption vs decryption
- Backend and frontend derived different keys

**Debug:**
```typescript
// Check section in encrypted payload
const encryptedField = response.ssn;
console.log('Encrypted with section:', encryptedField.section);

// Ensure same section used
encryption: { schemaId: 'your-schema', section: 'health' }
```

---

## API Reference

### EncryptionOptions

```typescript
interface EncryptionOptions {
  /** Schema ID for field-level encryption */
  schemaId?: string;

  /** Force full payload encryption */
  encryptFullPayload?: boolean;

  /** Override section for key derivation */
  section?: EncryptionSection;

  /** Sign request with HMAC (default: true) */
  sign?: boolean;

  /** Disable encryption for this request */
  disabled?: boolean;
}
```

### EncryptedFieldConfig

```typescript
interface EncryptedFieldConfig {
  /** Fields to encrypt in requests */
  requestFields?: string[];

  /** Fields to decrypt in responses */
  responseFields?: string[];

  /** Section for key derivation */
  section: EncryptionSection;

  /** Conditional encryption */
  conditions?: Record<string, (value: unknown) => boolean>;
}
```

### Helper Functions

```typescript
// Schema management
registerEncryptedFields(schemaId: string, config: EncryptedFieldConfig): void
getEncryptedFieldConfig(schemaId: string): EncryptedFieldConfig | undefined
hasEncryptedFields(schemaId: string): boolean
hasEncryptedRequestFields(schemaId: string): boolean
hasEncryptedResponseFields(schemaId: string): boolean
getRegisteredSchemas(): string[]

// Session management
EncryptionSessionManager.getInstance(apiBaseUrl?: string): EncryptionSessionManager
manager.establish(deviceId?: string): Promise<{ sessionId, expiresAt }>
manager.invalidate(): Promise<void>
manager.hasValidSession(): boolean
manager.getSessionId(): string | null
manager.getExpiresAt(): Date | null
manager.getSectionKey(section: EncryptionSection): Promise<CryptoKey>
manager.getSigningKey(): Promise<CryptoKey>

// Middleware
processRequestBody(body: unknown, options?: EncryptionOptions): Promise<EncryptedRequestResult>
processResponseData<T>(responseData: unknown, options?: EncryptionOptions): Promise<T>
isEncryptionReady(): boolean
```

---

## Best Practices

1. **Use field-level encryption** for most cases - it's more debuggable and efficient

2. **Register schemas at app initialization** - before any API calls

3. **Use meaningful schema IDs** - match endpoint or action names (e.g., `patient-update`, `payment-create`)

4. **Keep sections consistent** - use the same section for related data (all health data → `health` section)

5. **Handle session expiry** - the `useEncryptionSession` hook auto-refreshes, but handle errors gracefully

6. **Don't encrypt everything** - only encrypt sensitive fields (PHI, PII, PCI)

7. **Test decryption** - ensure backend encrypts response fields the same way

8. **Log during development** - enable console logging to trace encryption flow
