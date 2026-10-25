export const DB_NAME = 'GeaAgroOfflineDB';
export const DB_VERSION = 5;

export const REQUIRED_OBJECT_STORES = [
  // Pecuária & Produção Animal
  'animals',
  'paddocks',
  'poultry_batches',
  'poultry_sheds',
  'buffalo_records',
  'caprine_records',
  'equine_records',
  'swine_records',
  // Cadastros Mestres & Estrutura
  'companies',
  'agronomists',
  'producers',
  'farms',
  // Solos, Diagnose Foliar & Nutrição
  'soil_samples',
  'leaf_samples',
  'recommendations',
  'water_analysis',
  // Operações de Campo & Rastreabilidade
  'fieldbook_operations',
  'traceability_lots',
  'traceability_harvests',
  'traceability_photos',
  // Gestão Rural, Custos & Engenharia
  'gestao_rural',
  'costs_records',
  'plantability_records',
  'irrigation_records',
  // Fitossanidade, Viveiro & Diagnósticos
  'pests_records',
  'nursery_records',
  'offline_diagnostics',
  // Configurações & Sincronização Offline-First
  'app_settings',
  'sync_queue',
] as const;

export type OfflineStoreName = typeof REQUIRED_OBJECT_STORES[number];

export interface SyncItem {
  id: string;
  table: OfflineStoreName;
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

  // Initialize Database and request persistent browser storage
  public async initializeDefaultData(): Promise<void> {
    try {
      await this.getDB();
      await this.requestPersistentStorage();
      await this.persistAllEntitiesToIndexedDB();
    } catch (err) {
      console.warn('[IndexedDB] initializeDefaultData warning:', err);
    }
  }

  // Request Persistent Storage from the browser to prevent eviction
  public async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persisted();
        if (isPersisted) {
          return true;
        }
        const granted = await navigator.storage.persist();
        console.log(`[IndexedDB] Persistent storage request: ${granted ? 'GRANTED' : 'DENIED'}`);
        return granted;
      } catch (err) {
        console.warn('[IndexedDB] Could not request persistent storage:', err);
        return false;
      }
    }
    return false;
  }

  // Get storage usage estimate
  public async getStorageEstimate(): Promise<{
    quota: number;
    usage: number;
    percentage: number;
    isPersistent: boolean;
  }> {
    let quota = 0;
    let usage = 0;
    let percentage = 0;
    let isPersistent = false;

    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          quota = estimate.quota || 0;
          usage = estimate.usage || 0;
          if (quota > 0) {
            percentage = parseFloat(((usage / quota) * 100).toFixed(2));
          }
        } catch {}
      }
      if (navigator.storage.persisted) {
        try {
          isPersistent = await navigator.storage.persisted();
        } catch {}
      }
    }

    return { quota, usage, percentage, isPersistent };
  }

  // Safely close connection before restorations or upgrades
  public async close(): Promise<void> {
    if (this.dbPromise) {
      try {
        const db = await this.dbPromise;
        db.close();
      } catch {
        // Ignora erro no fechamento
      }
      this.dbPromise = null;
    }
  }

  // Get Single Record from a Store by ID
  public async get<T>(storeName: OfflineStoreName, id: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains(storeName)) {
        return null;
      }

      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve((request.result as T) || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn(`[IndexedDB] get error on store '${storeName}':`, error);
      return null;
    }
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

  // Count records in a store
  public async count(storeName: OfflineStoreName): Promise<number> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains(storeName)) {
        return 0;
      }
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result || 0);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return 0;
    }
  }

  // Save/Update a Record in a Store
  public async put<T extends { id: string }>(
    storeName: OfflineStoreName,
    value: T,
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

    if (!skipSync && storeName !== 'sync_queue' && storeName !== 'app_settings') {
      await this.addToSyncQueue(storeName, 'update', value);
    }
  }

  // Bulk Put Many Records in a Single Transaction (High Performance)
  public async putMany<T extends { id: string }>(
    storeName: OfflineStoreName,
    items: T[],
    skipSync = false
  ): Promise<void> {
    if (!items || items.length === 0) return;
    const db = await this.getDB();
    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store '${storeName}' not found in database.`);
    }

    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));

      for (const item of items) {
        if (item && item.id) {
          store.put(item);
        }
      }
    });

    if (!skipSync && storeName !== 'sync_queue' && storeName !== 'app_settings') {
      for (const item of items) {
        await this.addToSyncQueue(storeName, 'update', item);
      }
    }
  }

  // Add a Record to Store (New)
  public async add<T extends { id: string }>(
    storeName: OfflineStoreName,
    value: T,
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

    if (!skipSync && storeName !== 'sync_queue' && storeName !== 'app_settings') {
      await this.addToSyncQueue(storeName, 'insert', value);
    }
  }

  // Delete a Record from a Store
  public async delete(
    storeName: OfflineStoreName,
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

    if (!skipSync && storeName !== 'sync_queue' && storeName !== 'app_settings') {
      await this.addToSyncQueue(storeName, 'delete', { id });
    }
  }

  // Clear all records in a store
  public async clear(storeName: OfflineStoreName): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains(storeName)) return;

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] clear error on store '${storeName}':`, err);
    }
  }

  // Key-Value App Settings Store
  public async setSetting<T>(key: string, value: T): Promise<void> {
    const item = { id: key, value, updatedAt: Date.now() };
    await this.put('app_settings', item, true);
  }

  public async getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const record = await this.get<{ id: string; value: T }>('app_settings', key);
    return record ? record.value : defaultValue;
  }

  // Bridge utility: Synchronize a memory or LocalStorage dataset into IndexedDB
  public async syncEntityToIndexedDB<T extends { id: string }>(
    storeName: OfflineStoreName,
    items: T[]
  ): Promise<void> {
    try {
      if (!Array.isArray(items)) return;
      await this.putMany(storeName, items, true);
    } catch (err) {
      console.warn(`[IndexedDB] Error syncing ${storeName} to IndexedDB:`, err);
    }
  }

  // Hydrate an entity from IndexedDB with fallback
  public async hydrateEntityFromIndexedDB<T extends { id: string }>(
    storeName: OfflineStoreName,
    fallback: T[]
  ): Promise<T[]> {
    try {
      const items = await this.getAll<T>(storeName);
      if (items && items.length > 0) {
        return items;
      }
      if (fallback && fallback.length > 0) {
        await this.syncEntityToIndexedDB(storeName, fallback);
        return fallback;
      }
      return [];
    } catch (err) {
      console.warn(`[IndexedDB] Error hydrating ${storeName} from IndexedDB:`, err);
      return fallback || [];
    }
  }

  // Auto-persist all known localStorage datasets to IndexedDB for complete offline resilience
  public async persistAllEntitiesToIndexedDB(): Promise<void> {
    if (typeof window === 'undefined') return;

    const MAPPINGS: { localKey: string; store: OfflineStoreName }[] = [
      { localKey: 'agronutri_companies', store: 'companies' },
      { localKey: 'agronutri_agronomists', store: 'agronomists' },
      { localKey: 'agronutri_producers', store: 'producers' },
      { localKey: 'agronutri_farms', store: 'farms' },
      { localKey: 'agronutri_soil_samples', store: 'soil_samples' },
      { localKey: 'agronutri_leaf_samples', store: 'leaf_samples' },
      { localKey: 'agronutri_water_analysis_v2', store: 'water_analysis' },
      { localKey: 'agronutri_fieldbook_operations', store: 'fieldbook_operations' },
      { localKey: 'agronutri_traceability_lots', store: 'traceability_lots' },
    ];

    for (const mapping of MAPPINGS) {
      try {
        const raw = localStorage.getItem(mapping.localKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await this.putMany(mapping.store, parsed, true);
          }
        }
      } catch (err) {
        console.warn(`[IndexedDB] persistAllEntities error for ${mapping.localKey}:`, err);
      }
    }
  }

  // Sync Queue Helpers
  public async addToSyncQueue(
    table: OfflineStoreName,
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
