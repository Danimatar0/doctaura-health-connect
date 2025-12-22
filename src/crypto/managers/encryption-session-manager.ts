/**
 * Encryption Session Manager
 *
 * Manages client-side encryption sessions for secure data transmission.
 * Uses ECDH key exchange to establish a shared secret with the backend,
 * then derives section-specific encryption keys using HKDF.
 *
 * Authentication is handled via HTTP-only cookies (credentials: include).
 */

import { env } from '@/config/env';
import type {
  EncryptionSession,
  EncryptionSection,
  SessionEstablishmentResponse,
  SessionMetadata,
} from '../types';

export class EncryptionSessionManager {
  private static instance: EncryptionSessionManager | null = null;

  private readonly apiBaseUrl: string;
  private readonly storageKey = 'encryption_session_meta';
  private readonly deviceIdKey = 'device_id';

  private currentSession: EncryptionSession | null = null;
  private sectionKeyCache = new Map<EncryptionSection, CryptoKey>();
  private signingKeyCache: CryptoKey | null = null;

  private static readonly SECTION_CONTEXTS: Record<EncryptionSection, string> = {
    health: 'doctaura:v1:section:health',
    financial: 'doctaura:v1:section:financial',
    identity: 'doctaura:v1:section:identity',
    authentication: 'doctaura:v1:section:auth',
    administrative: 'doctaura:v1:section:admin',
  };

  private static readonly SIGNING_CONTEXT = 'doctaura:v1:signing';
  private readonly keyDerivationSalt: Uint8Array;

  private constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;

    const saltB64 = env.security.derivationSalt;
    if (!saltB64) {
      throw new Error('VITE_KEY_DERIVATION_SALT environment variable is required');
    }
    this.keyDerivationSalt = this.base64ToUint8Array(saltB64);
  }

  /**
   * Gets the singleton instance.
   */
  public static getInstance(apiBaseUrl?: string): EncryptionSessionManager {
    if (!EncryptionSessionManager.instance) {
      if (!apiBaseUrl) {
        throw new Error('apiBaseUrl required for initial instantiation');
      }
      EncryptionSessionManager.instance = new EncryptionSessionManager(apiBaseUrl);
    }
    return EncryptionSessionManager.instance;
  }

  /**
   * Resets singleton instance (useful for testing).
   */
  public static resetInstance(): void {
    EncryptionSessionManager.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────

  /**
   * Establishes an encryption session with the backend.
   * Authentication is handled via HTTP-only cookies (credentials: include).
   */
  public async establish(deviceId?: string): Promise<{
    sessionId: string;
    expiresAt: Date;
  }> {
    // 1. Generate ephemeral ECDH keypair
    const clientKeyPair = await this.generateKeyPair();

    // 2. Export public key for server
    const clientPublicKeyB64 = await this.exportPublicKey(clientKeyPair.publicKey);

    // 3. Exchange with server (auth via HTTP-only cookies)
    const response = await this.exchangeWithServer(
      clientPublicKeyB64,
      deviceId ?? this.getDeviceId()
    );

    // 4. Derive shared secret
    const masterKey = await this.deriveSharedSecret(
      clientKeyPair.privateKey,
      response.serverPublicKey
    );

    const expiresAt = new Date(response.expiresAt);

    // 5. Store session
    this.currentSession = {
      sessionId: response.sessionId,
      masterKey,
      expiresAt,
    };

    this.clearKeyCache();
    this.persistMetadata(response.sessionId, expiresAt);

    return { sessionId: response.sessionId, expiresAt };
  }

  /**
   * Invalidates the current session on server and locally.
   * Authentication is handled via HTTP-only cookies (credentials: include).
   */
  public async invalidate(): Promise<void> {
    if (!this.currentSession) return;

    const sessionId = this.currentSession.sessionId;

    try {
      await fetch(`${this.apiBaseUrl}/crypto/invalidate-session`, {
        method: 'POST',
        credentials: 'include', // Send HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
      });
    } finally {
      this.clearSession();
    }
  }

  /**
   * Gets current session ID if valid.
   */
  public getSessionId(): string | null {
    if (!this.currentSession) return null;

    if (this.isExpired()) {
      this.clearSession();
      return null;
    }

    return this.currentSession.sessionId;
  }

  /**
   * Checks if there's a valid (non-expired) session.
   */
  public hasValidSession(): boolean {
    return this.getSessionId() !== null;
  }

  /**
   * Checks if session expires within given minutes.
   */
  public expiresWithin(minutes: number): boolean {
    if (!this.currentSession) return true;

    const threshold = new Date(Date.now() + minutes * 60 * 1000);
    return this.currentSession.expiresAt <= threshold;
  }

  /**
   * Gets expiration date of current session.
   */
  public getExpiresAt(): Date | null {
    return this.currentSession?.expiresAt ?? null;
  }

  /**
   * Derives section-specific encryption key.
   */
  public async getSectionKey(section: EncryptionSection): Promise<CryptoKey> {
    // Validate session exists
    this.getValidSession();

    // Return cached if available
    const cached = this.sectionKeyCache.get(section);
    if (cached) return cached;

    const context = EncryptionSessionManager.SECTION_CONTEXTS[section];
    const key = await this.deriveKey(context, ['encrypt', 'decrypt'], {
      name: 'AES-GCM',
      length: 256,
    });

    this.sectionKeyCache.set(section, key);
    return key;
  }

  /**
   * Derives signing key for request integrity.
   */
  public async getSigningKey(): Promise<CryptoKey> {
    // Validate session exists
    this.getValidSession();

    if (this.signingKeyCache) return this.signingKeyCache;

    this.signingKeyCache = await this.deriveKey(
      EncryptionSessionManager.SIGNING_CONTEXT,
      ['sign'],
      { name: 'HMAC', hash: 'SHA-256', length: 256 }
    );

    return this.signingKeyCache;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private: Cryptographic Operations
  // ─────────────────────────────────────────────────────────────────

  private async generateKeyPair(): Promise<CryptoKeyPair> {
    return crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits']
    );
  }

  private async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const raw = await crypto.subtle.exportKey('spki', publicKey);
    return this.arrayBufferToBase64(raw);
  }

  private async deriveSharedSecret(
    clientPrivateKey: CryptoKey,
    serverPublicKeyB64: string
  ): Promise<CryptoKey> {
    const serverPublicKeyBuffer = this.base64ToArrayBuffer(serverPublicKeyB64);

    const serverPublicKey = await crypto.subtle.importKey(
      'spki',
      serverPublicKeyBuffer,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      []
    );

    const sharedSecretBits = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: serverPublicKey },
      clientPrivateKey,
      256
    );

    return crypto.subtle.importKey(
      'raw',
      sharedSecretBits,
      'HKDF',
      false,
      ['deriveKey', 'deriveBits']
    );
  }

  private async deriveKey(
    context: string,
    usages: KeyUsage[],
    algorithm: AesKeyGenParams | HmacKeyGenParams
  ): Promise<CryptoKey> {
    const session = this.getValidSession();

    if (!this.keyDerivationSalt) {
      throw new Error('Key derivation salt not available');
    }


    // Use the salt directly - don't access .buffer as it may have wrong byteOffset
    const info = new TextEncoder().encode(context);

    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        salt: this.keyDerivationSalt,
        info,
        hash: 'SHA-256',
      },
      session.masterKey,
      algorithm,
      true,
      usages
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Private: Server Communication
  // ─────────────────────────────────────────────────────────────────

  private async exchangeWithServer(
    clientPublicKeyB64: string,
    deviceId: string
  ): Promise<SessionEstablishmentResponse> {
    const response = await fetch(`${this.apiBaseUrl}/crypto/establish-session`, {
      method: 'POST',
      credentials: 'include', // Send HTTP-only cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientPublicKey: clientPublicKeyB64,
        deviceId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Session establishment failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // ─────────────────────────────────────────────────────────────────
  // Private: Session State Management
  // ─────────────────────────────────────────────────────────────────

  private isExpired(): boolean {
    return this.currentSession !== null && new Date() >= this.currentSession.expiresAt;
  }

  private clearSession(): void {
    this.currentSession = null;
    this.clearKeyCache();
    sessionStorage.removeItem(this.storageKey);
  }

  private clearKeyCache(): void {
    this.sectionKeyCache.clear();
    this.signingKeyCache = null;
  }

  /**
   * Validates and returns the current session.
   * Throws if no valid session exists.
   */
  private getValidSession(): EncryptionSession {
    if (!this.currentSession) {
      throw new Error('No active encryption session');
    }
    if (this.isExpired()) {
      this.clearSession();
      throw new Error('Encryption session expired');
    }
    return this.currentSession;
  }

  private persistMetadata(sessionId: string, expiresAt: Date): void {
    const metadata: SessionMetadata = {
      sessionId,
      expiresAt: expiresAt.toISOString(),
    };
    sessionStorage.setItem(this.storageKey, JSON.stringify(metadata));
  }

  // ─────────────────────────────────────────────────────────────────
  // Device ID
  // ─────────────────────────────────────────────────────────────────

  /**
   * Gets or generates a persistent device ID.
   * Stored in localStorage for persistence across sessions.
   */
  public getDeviceId(): string {
    let deviceId = localStorage.getItem(this.deviceIdKey);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(this.deviceIdKey, deviceId);
    }
    return deviceId;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private: Encoding Utilities
  // ─────────────────────────────────────────────────────────────────

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes as Uint8Array;
  }
}