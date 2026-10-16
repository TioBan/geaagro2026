import { Animal, Paddock } from '../types/livestock';
import { PoultryBatch, PoultryShed } from '../types/poultry';
import { INITIAL_ANIMALS, INITIAL_PADDOCKS } from '../data/livestockData';
import { INITIAL_POULTRY_BATCHES, INITIAL_POULTRY_SHEDS } from '../data/poultryData';

export const DB_NAME = 'GeaAgroOfflineDB';
export const DB_VERSION = 4;

export const REQUIRED_OBJECT_STORES = [
  'animals',
  'paddocks',
  'poultry_batches',
  'poultry_sheds',
  'sync_queue',
] as const;

export type OfflineStoreName = typeof REQUIRED_OBJECT_STORES[number];

export interface SyncItem {
  id: string;
  table: 'animals' | 'paddocks' | 'poultry_batches' | 'poultry_sheds';
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDatabase(version?: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const targetVersion = version || DB_VERSION;
      const request = indexedDB.open(DB_NAME, targetVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Ensure all required object stores exist
        REQUIRED_OBJECT_STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Self-healing check: verify that all expected object stores actually exist
        const missingStores = REQUIRED_OBJECT_STORES.filter(
          (store) => !db.objectStoreNames.contains(store)
        );

        if (missingStores.length > 0) {
          console.warn(
            `[IndexedDB] Missing stores detected: ${missingStores.join(', ')}. Upgrading database version...`
          );
          const nextVersion = Math.max(db.version + 1, DB_VERSION + 1);
          db.close();
          try {
            const upgradedDb = await this.openDatabase(nextVersion);
            resolve(upgradedDb);
          } catch (upgradeErr) {
            reject(upgradeErr);
          }
          return;
        }

        resolve(db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = () => {
        console.warn('[IndexedDB] Database upgrade blocked by open connection in another tab/worker.');
      };
    });
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = this.openDatabase().catch((err) => {
      this.dbPromise = null;
      throw err;
    });

    return this.dbPromise;
  }

  // Initialize Database
  public async initializeDefaultData(): Promise<void> {
    await this.getDB();
  }

  // Get All Records from a Store
  public async getAll<T>(storeName: OfflineStoreName): Promise<T[]> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`[IndexedDB] Store '${storeName}' not found in current schema, returning empty.`);
        return [];
      }

      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve((request.result || []) as T[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn(`[IndexedDB] getAll error on store '${storeName}':`, error);
      return [];
    }
  }

  // Save/Update a Record in a Store
  public async put<T>(
    storeName: 'animals' | 'paddocks' | 'poultry_batches' | 'poultry_sheds',
    value: T & { id: string },
    skipSync = false
  ): Promise<void> {
    const db = await this.getDB();
    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store '${storeName}' not found in database.`);
    }

    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(value);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (!skipSync) {
      await this.addToSyncQueue(storeName, 'update', value);
    }
  }

  // Add a Record to Store (New)
  public async add<T>(
    storeName: 'animals' | 'paddocks' | 'poultry_batches' | 'poultry_sheds',
    value: T & { id: string },
    skipSync = false
  ): Promise<void> {
    const db = await this.getDB();
    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store '${storeName}' not found in database.`);
    }

    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    await new Promise<void>((resolve, reject) => {
      const request = store.add(value);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (!skipSync) {
      await this.addToSyncQueue(storeName, 'insert', value);
    }
  }

  // Delete a Record from a Store
  public async delete(
    storeName: 'animals' | 'paddocks' | 'poultry_batches' | 'poultry_sheds',
    id: string,
    skipSync = false
  ): Promise<void> {
    const db = await this.getDB();
    if (!db.objectStoreNames.contains(storeName)) {
      return;
    }

    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    if (!skipSync) {
      await this.addToSyncQueue(storeName, 'delete', { id });
    }
  }

  // Sync Queue Helpers
  private async addToSyncQueue(
    table: 'animals' | 'paddocks' | 'poultry_batches' | 'poultry_sheds',
    action: 'insert' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains('sync_queue')) return;

      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');

      const syncItem: SyncItem = {
        id: `${table}_${data.id || Math.random().toString(36).substring(2)}_${Date.now()}`,
        table,
        action,
        data,
        timestamp: Date.now(),
        status: 'pending',
      };

      return new Promise((resolve, reject) => {
        const request = store.put(syncItem);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] addToSyncQueue error:', err);
    }
  }

  public async getSyncQueue(): Promise<SyncItem[]> {
    return this.getAll<SyncItem>('sync_queue');
  }

  public async updateSyncStatus(id: string, status: SyncItem['status']): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains('sync_queue')) return;

      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');

      return new Promise((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const item = getRequest.result as SyncItem;
          if (item) {
            item.status = status;
            const putRequest = store.put(item);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] updateSyncStatus error:', err);
    }
  }

  public async removeSyncItem(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains('sync_queue')) return;

      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] removeSyncItem error:', err);
    }
  }

  public async clearSyncQueue(): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains('sync_queue')) return;

      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] clearSyncQueue error:', err);
    }
  }
}

export const offlineDB = new IndexedDBService();
