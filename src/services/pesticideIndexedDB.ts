import { PesticideProduct } from '../types/pesticideLeaflet';
import { INITIAL_PESTICIDES_CATALOG } from '../data/pesticidesData';

const DB_NAME = 'AgroNutriBularioDB_v11';
const DB_VERSION = 11;
const PRODUCTS_STORE = 'pesticide_products';
const SEARCH_INDEX_STORE = 'search_index_cache';
const META_STORE = 'app_metadata';

export interface StorageDiagnostics {
  isIndexedDBSupported: boolean;
  dbName: string;
  dbVersion: number;
  totalProductsCount: number;
  estimatedStorageBytes: number;
  storageQuotaBytes: number;
  usagePercentage: number;
  lastSyncTimestamp: number;
  isReady: boolean;
  engine: 'IndexedDB' | 'MemoryFallback';
}

export interface SerializedIndexCache {
  version: string;
  timestamp: number;
  totalItems: number;
  tokenCount: number;
  tokens: Record<string, string[]>; // Token -> Product ID list
}

class PesticideIndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallbackStore: Map<string, PesticideProduct> = new Map();
  private isMemoryMode: boolean = false;

  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.isSupported()) {
      this.isMemoryMode = true;
      throw new Error('IndexedDB not supported in this browser environment.');
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Products store with indices for high speed queries
          if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
            const productStore = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
            productStore.createIndex('productName', 'productName', { unique: false });
            productStore.createIndex('registrationNumber', 'registrationNumber', { unique: false });
            productStore.createIndex('agrochemicalClass', 'agrochemicalClass', { unique: false });
            productStore.createIndex('manufacturer', 'manufacturer', { unique: false });
          }

          // Search index precomputed cache store
          if (!db.objectStoreNames.contains(SEARCH_INDEX_STORE)) {
            db.createObjectStore(SEARCH_INDEX_STORE, { keyPath: 'key' });
          }

          // Metadata store
          if (!db.objectStoreNames.contains(META_STORE)) {
            db.createObjectStore(META_STORE, { keyPath: 'key' });
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          resolve(db);
        };

        request.onerror = (event) => {
          console.warn('[PesticideIndexedDB] Open error, falling back to memory:', (event.target as IDBOpenDBRequest).error);
          this.isMemoryMode = true;
          reject((event.target as IDBOpenDBRequest).error);
        };

        request.onblocked = () => {
          console.warn('[PesticideIndexedDB] Database open blocked by another tab.');
        };
      } catch (err) {
        console.warn('[PesticideIndexedDB] Exception opening IndexedDB:', err);
        this.isMemoryMode = true;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  /**
   * Initializes the database.
   * If empty or schema version mismatch, populates with 1,800 official products in one high-performance transaction.
   */
  public async initialize(defaultCatalog: PesticideProduct[] = INITIAL_PESTICIDES_CATALOG): Promise<PesticideProduct[]> {
    try {
      const db = await this.getDB();
      const count = await this.countProducts(db);

      // If already initialized with valid records without stale series suffixes, load them
      const stored = await this.getAllProducts();
      const hasStaleSyntheticNames = stored.some(p => p.productName.includes('Série-') || p.productName.includes('Série'));
      if (stored.length > 0 && !hasStaleSyntheticNames && stored.length === defaultCatalog.length) {
        return stored;
      }

      // Populate or reseed default catalog in bulk
      console.log(`[PesticideIndexedDB] Seeding ${defaultCatalog.length} official authentic pesticides into IndexedDB...`);
      await this.saveAllProducts(defaultCatalog);
      return defaultCatalog;
    } catch (err) {
      console.warn('[PesticideIndexedDB] Memory fallback mode active:', err);
      this.isMemoryMode = true;
      if (this.memoryFallbackStore.size === 0) {
        defaultCatalog.forEach(p => this.memoryFallbackStore.set(p.id, p));
      }
      return Array.from(this.memoryFallbackStore.values());
    }
  }

  /**
   * Count products in the store
   */
  private async countProducts(db: IDBDatabase): Promise<number> {
    return new Promise<number>((resolve) => {
      try {
        const tx = db.transaction(PRODUCTS_STORE, 'readonly');
        const store = tx.objectStore(PRODUCTS_STORE);
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  }

  /**
   * Fast asynchronous retrieval of all products
   */
  public async getAllProducts(): Promise<PesticideProduct[]> {
    if (this.isMemoryMode) {
      return Array.from(this.memoryFallbackStore.values());
    }

    try {
      const db = await this.getDB();
      return new Promise<PesticideProduct[]>((resolve, reject) => {
        const tx = db.transaction(PRODUCTS_STORE, 'readonly');
        const store = tx.objectStore(PRODUCTS_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          resolve(req.result || []);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn('[PesticideIndexedDB] getAllProducts fallback:', err);
      return Array.from(this.memoryFallbackStore.values());
    }
  }

  /**
   * Bulk save products using a single high-efficiency readwrite transaction
   */
  public async saveAllProducts(products: PesticideProduct[]): Promise<void> {
    if (this.isMemoryMode) {
      this.memoryFallbackStore.clear();
      products.forEach(p => this.memoryFallbackStore.set(p.id, p));
      return;
    }

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction([PRODUCTS_STORE, META_STORE], 'readwrite');
        const productStore = tx.objectStore(PRODUCTS_STORE);
        const metaStore = tx.objectStore(META_STORE);

        // Clear existing to avoid obsolete stale keys
        productStore.clear();

        for (let i = 0; i < products.length; i++) {
          productStore.put(products[i]);
        }

        metaStore.put({
          key: 'catalog_info',
          version: '1.800-v7',
          totalCount: products.length,
          lastUpdated: Date.now(),
        });

        tx.oncomplete = () => {
          resolve();
        };

        tx.onerror = () => {
          reject(tx.error);
        };
      });
    } catch (err) {
      console.warn('[PesticideIndexedDB] saveAllProducts fallback:', err);
      this.memoryFallbackStore.clear();
      products.forEach(p => this.memoryFallbackStore.set(p.id, p));
    }
  }

  /**
   * Save or update a single product
   */
  public async saveProduct(product: PesticideProduct): Promise<void> {
    if (this.isMemoryMode) {
      this.memoryFallbackStore.set(product.id, product);
      return;
    }

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
        const store = tx.objectStore(PRODUCTS_STORE);
        store.put(product);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      this.memoryFallbackStore.set(product.id, product);
    }
  }

  /**
   * Delete a single product
   */
  public async deleteProduct(productId: string): Promise<void> {
    if (this.isMemoryMode) {
      this.memoryFallbackStore.delete(productId);
      return;
    }

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
        const store = tx.objectStore(PRODUCTS_STORE);
        store.delete(productId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      this.memoryFallbackStore.delete(productId);
    }
  }

  /**
   * Reset database back to default seed catalog
   */
  public async resetToDefault(defaultCatalog: PesticideProduct[] = INITIAL_PESTICIDES_CATALOG): Promise<PesticideProduct[]> {
    await this.saveAllProducts(defaultCatalog);
    return defaultCatalog;
  }

  /**
   * Save precomputed inverted search index cache into IndexedDB
   */
  public async saveIndexCache(cache: SerializedIndexCache): Promise<void> {
    if (this.isMemoryMode) return;
    try {
      const db = await this.getDB();
      const tx = db.transaction(SEARCH_INDEX_STORE, 'readwrite');
      const store = tx.objectStore(SEARCH_INDEX_STORE);
      store.put({ key: 'inverted_index', data: cache });
    } catch (err) {
      console.warn('[PesticideIndexedDB] Could not save search index cache:', err);
    }
  }

  /**
   * Retrieve precomputed inverted search index cache from IndexedDB
   */
  public async getIndexCache(): Promise<SerializedIndexCache | null> {
    if (this.isMemoryMode) return null;
    try {
      const db = await this.getDB();
      return new Promise<SerializedIndexCache | null>((resolve) => {
        const tx = db.transaction(SEARCH_INDEX_STORE, 'readonly');
        const store = tx.objectStore(SEARCH_INDEX_STORE);
        const req = store.get('inverted_index');
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data as SerializedIndexCache);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Retrieves comprehensive storage diagnostics
   */
  public async getDiagnostics(): Promise<StorageDiagnostics> {
    let quota = 0;
    let usage = 0;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || 0;
        usage = estimate.usage || 0;
      } catch {
        // ignore
      }
    }

    let count = 0;
    try {
      const prods = await this.getAllProducts();
      count = prods.length;
    } catch {
      count = this.memoryFallbackStore.size;
    }

    return {
      isIndexedDBSupported: this.isSupported(),
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      totalProductsCount: count,
      estimatedStorageBytes: usage,
      storageQuotaBytes: quota,
      usagePercentage: quota > 0 ? Number(((usage / quota) * 100).toFixed(2)) : 0,
      lastSyncTimestamp: Date.now(),
      isReady: true,
      engine: this.isMemoryMode ? 'MemoryFallback' : 'IndexedDB',
    };
  }
}

export const pesticideIndexedDB = new PesticideIndexedDBService();
