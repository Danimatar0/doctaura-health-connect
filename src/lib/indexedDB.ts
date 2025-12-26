/**
 * IndexedDB Wrapper for Configuration Caching
 *
 * A lightweight, promise-based wrapper around the native IndexedDB API.
 * Designed for offline-first caching of configuration data.
 *
 * Key design decisions:
 * - Uses native IndexedDB API (no heavy libraries)
 * - All operations are async/await
 * - Handles version upgrades safely
 * - Never blocks the main thread
 * - Framework-agnostic (works with React, Vue, or vanilla JS)
 */

import type { ConfigCacheEntry } from '@/types/onboardingConfig';

// Database configuration
const DB_NAME = 'doctora-config';
const DB_VERSION = 1;
const STORE_NAME = 'configs';

/**
 * Database connection singleton
 * Reused across all operations to avoid opening multiple connections
 */
let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens the IndexedDB database, creating object stores if needed.
 * Uses a singleton pattern to reuse the connection.
 *
 * @returns Promise resolving to the database instance
 */
function openDatabase(): Promise<IDBDatabase> {
  // Return existing connection if available
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  // Return pending initialization if in progress
  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve, reject) => {
    // Check for IndexedDB support
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database version upgrade
    // This is called when DB is created or version increases
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create the configs object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Using 'key' as the keyPath (primary key)
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });

        // Create index on version for potential queries
        store.createIndex('version', 'version', { unique: false });

        // Create index on updatedAt for cleanup operations
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;

      // Handle connection close (browser cleanup)
      dbInstance.onclose = () => {
        dbInstance = null;
        dbInitPromise = null;
      };

      // Handle version change (another tab upgraded DB)
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbInitPromise = null;
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      dbInitPromise = null;
      reject(
        new Error(
          `Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error?.message}`
        )
      );
    };

    request.onblocked = () => {
      dbInitPromise = null;
      reject(
        new Error(
          'Database access blocked. Please close other tabs using this application.'
        )
      );
    };
  });

  return dbInitPromise;
}

/**
 * Retrieves a configuration entry from IndexedDB.
 *
 * @param key - The configuration key (e.g., "onboarding")
 * @returns Promise resolving to the cache entry or null if not found
 *
 * @example
 * const entry = await configDB.getConfig('onboarding');
 * if (entry) {
 *   console.log('Cached version:', entry.version);
 *   console.log('Config data:', entry.payload);
 * }
 */
async function getConfig<T>(key: string): Promise<ConfigCacheEntry<T> | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get config '${key}': ${request.error?.message}`));
    };
  });
}

/**
 * Stores a configuration entry in IndexedDB.
 * Uses put() which will update if exists or insert if new.
 *
 * @param key - The configuration key
 * @param entry - The cache entry to store (must include all required fields)
 *
 * @example
 * await configDB.setConfig('onboarding', {
 *   key: 'onboarding',
 *   version: 'v12',
 *   etag: 'onboarding-v12',
 *   payload: { countries: [...], genders: [...] },
 *   updatedAt: Date.now()
 * });
 */
async function setConfig<T>(
  key: string,
  entry: Omit<ConfigCacheEntry<T>, 'key'>
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Ensure key is set in the entry
    const fullEntry: ConfigCacheEntry<T> = {
      ...entry,
      key,
    };

    const request = store.put(fullEntry);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to set config '${key}': ${request.error?.message}`));
    };
  });
}

/**
 * Deletes a configuration entry from IndexedDB.
 *
 * @param key - The configuration key to delete
 *
 * @example
 * await configDB.deleteConfig('onboarding');
 */
async function deleteConfig(key: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete config '${key}': ${request.error?.message}`));
    };
  });
}

/**
 * Clears all configuration entries from IndexedDB.
 * Use with caution - this removes all cached configs.
 *
 * @example
 * await configDB.clearAll();
 */
async function clearAll(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to clear configs: ${request.error?.message}`));
    };
  });
}

/**
 * Retrieves all configuration keys stored in IndexedDB.
 * Useful for debugging or admin purposes.
 *
 * @returns Promise resolving to array of config keys
 */
async function getAllKeys(): Promise<string[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      resolve(request.result as string[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get keys: ${request.error?.message}`));
    };
  });
}

/**
 * Checks if IndexedDB is available and functional.
 * Useful for feature detection and fallback handling.
 *
 * @returns Promise resolving to true if IndexedDB works
 */
async function isAvailable(): Promise<boolean> {
  try {
    await openDatabase();
    return true;
  } catch {
    return false;
  }
}

/**
 * Closes the database connection.
 * Usually not needed, but useful for testing or cleanup.
 */
function closeConnection(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbInitPromise = null;
  }
}

/**
 * Configuration Database API
 *
 * Exported as a namespace object for clean imports.
 *
 * @example
 * import { configDB } from '@/lib/indexedDB';
 *
 * // Get cached config
 * const cached = await configDB.getConfig('onboarding');
 *
 * // Store new config
 * await configDB.setConfig('onboarding', {
 *   version: 'v12',
 *   etag: 'onboarding-v12',
 *   payload: config,
 *   updatedAt: Date.now()
 * });
 */
export const configDB = {
  getConfig,
  setConfig,
  deleteConfig,
  clearAll,
  getAllKeys,
  isAvailable,
  closeConnection,
} as const;

// Export types for external use
export type { ConfigCacheEntry };
