import { opfsWasmDB, OpfsEngineDiagnostics } from '../services/opfsWasmDatabase';

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

  // Fitossanidade, Viveiro, Perícias & Diagnósticos
  'pests_records',
  'nursery_records',
  'offline_diagnostics',
  'pericias_records',
  'seed_analysis_records',

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

  // Initialize Database with OPFS + WASM engine and request persistent browser storage
  public async initializeDefaultData(): Promise<void> {
    try {
      // 1. Initialize next-generation OPFS + WASM Engine with automatic migration
      await opfsWasmDB.initialize();

      // 2. Purga total e segura do IndexedDB legado (GeaAgroOfflineDB, NemaAIChatsDB, AgroNutriBularioDB_v11)
      await opfsWasmDB.purgeLegacyIndexedDb();

      await this.requestPersistentStorage();
      await this.persistAllEntitiesToIndexedDB();
    } catch (err) {
      console.warn('[Storage] initializeDefaultData warning:', err);
    }
  }

  // Request Persistent Storage from the browser to prevent eviction
  public async requestPersistentStorage(): Promise<boolean> {
    return opfsWasmDB.requestPersistentStorage();
  }

  // Get storage usage estimate
  public async getStorageEstimate(): Promise<{
    quota: number;
    usage: number;
    percentage: number;
    isPersistent: boolean;
  }> {
    return opfsWasmDB.getStorageEstimate();
  }

  // Get diagnostic information about the active OPFS + WASM engine
  public async getEngineDiagnostics(): Promise<OpfsEngineDiagnostics> {
    return opfsWasmDB.getEngineDiagnostics();
  }

  // Safely close connection before restorations or upgrades
  public async close(): Promise<void> {
    if (this.dbPromise) {
      try {
        const db = await this.dbPromise;
        db.close();
      } catch {}
      this.dbPromise = null;
    }
    await opfsWasmDB.close();
  }

  // Get Single Record from a Store by ID (Puramente OPFS + WASM)
  public async get<T>(storeName: OfflineStoreName, id: string): Promise<T | null> {
    return opfsWasmDB.get<T>(storeName as any, id);
  }

  // Get All Records from a Store (Puramente OPFS + WASM)
  public async getAll<T>(storeName: OfflineStoreName): Promise<T[]> {
    return opfsWasmDB.getAll<T>(storeName as any);
  }

  // Count records in a store (Puramente OPFS + WASM)
  public async count(storeName: OfflineStoreName): Promise<number> {
    return opfsWasmDB.count(storeName as any);
  }

  // Save/Update a Record in a Store (Puramente OPFS + WASM)
  public async put<T extends { id: string }>(
    storeName: OfflineStoreName,
    value: T,
    skipSync = false
  ): Promise<void> {
    await opfsWasmDB.put(storeName as any, value, skipSync);
  }

  // Bulk Put Many Records in a Single Transaction (High Performance OPFS + WASM)
  public async putMany<T extends { id: string }>(
    storeName: OfflineStoreName,
    items: T[],
    skipSync = false
  ): Promise<void> {
    if (!items || items.length === 0) return;
    await opfsWasmDB.putMany(storeName as any, items, skipSync);
  }

  // Add a Record to Store (New)
  public async add<T extends { id: string }>(
    storeName: OfflineStoreName,
    value: T,
    skipSync = false
  ): Promise<void> {
    await this.put(storeName, value, skipSync);
  }

  // Delete a Record from a Store (Puramente OPFS + WASM)
  public async delete(
    storeName: OfflineStoreName,
    id: string,
    skipSync = false
  ): Promise<void> {
    await opfsWasmDB.delete(storeName as any, id, skipSync);
  }

  // Clear all records in a store (Puramente OPFS + WASM)
  public async clear(storeName: OfflineStoreName): Promise<void> {
    await opfsWasmDB.clear(storeName as any);
  }

  // Key-Value App Settings Store (Puramente OPFS + WASM)
  public async setSetting<T>(key: string, value: T): Promise<void> {
    await opfsWasmDB.setSetting(key, value);
  }

  public async getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    return opfsWasmDB.getSetting<T>(key, defaultValue);
  }

  // Bridge utility: Synchronize a memory or LocalStorage dataset into OPFS + IndexedDB
  public async syncEntityToIndexedDB<T extends { id: string }>(
    storeName: OfflineStoreName,
    items: T[]
  ): Promise<void> {
    try {
      if (!Array.isArray(items)) return;
      await this.putMany(storeName, items, true);
    } catch (err) {
      console.warn(`[Storage] Error syncing ${storeName}:`, err);
    }
  }

  // Hydrate an entity with fallback
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
      console.warn(`[Storage] Error hydrating ${storeName}:`, err);
      return fallback || [];
    }
  }

  // Auto-persist all known localStorage datasets to OPFS and IndexedDB
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
        console.warn(`[Storage] persistAllEntities error for ${mapping.localKey}:`, err);
      }
    }
  }

  // Sync Queue Helpers (Puramente OPFS + WASM)
  public async addToSyncQueue(
    table: OfflineStoreName,
    action: 'insert' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    await opfsWasmDB.addToSyncQueue(table as any, action, data);
  }

  public async getSyncQueue(): Promise<SyncItem[]> {
    const queue = await opfsWasmDB.getSyncQueue();
    return (queue || []) as unknown as SyncItem[];
  }

  public async updateSyncStatus(id: string, status: SyncItem['status']): Promise<void> {
    await opfsWasmDB.updateSyncStatus(id, status);
  }

  public async removeSyncItem(id: string): Promise<void> {
    await opfsWasmDB.removeSyncItem(id);
  }

  public async clearSyncQueue(): Promise<void> {
    await opfsWasmDB.clearSyncQueue();
  }
}

export const offlineDB = new IndexedDBService();
