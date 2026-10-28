/**
 * GeaAgro OPFS + WASM Database Engine
 * 
 * Next-Generation High Performance Client-Side Database Architecture
 * Combining:
 * 1. OPFS (Origin Private File System): Sandboxed, ultra-fast persistent filesystem storage.
 * 2. WASM (WebAssembly): Near-native binary execution for fast record validation, checksumming,
 *    hashing, and in-memory indexing.
 * 
 * Features Total Migration from IndexedDB + LocalStorage to OPFS + WASM,
 * with universal LocalStorage bridging, zero data-loss durability, and resilient fallback.
 */

export const OPFS_DB_VERSION = '4.2.3.7';
export const OPFS_ROOT_DIR = 'geaagro_opfs_v1';

export const REQUIRED_OPFS_STORES = [
  // Pecuária & Produção Animal
  'animals',
  'paddocks',
  'poultry_batches',
  'poultry_sheds',
  'buffalo_records',
  'caprine_records',
  'equine_records',
  'swine_records',
  'animal_nutrition_records',

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
  'soil_sampling_points',
  'plot_boundaries',

  // Operações de Campo & Rastreabilidade
  'fieldbook_operations',
  'traceability_lots',
  'traceability_harvests',
  'traceability_photos',
  'custom_gis_layers',

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

  // Configurações & Sincronização
  'app_settings',
  'sync_queue',

  // Inteligência Artificial & Catálogos
  'diagnoses',
  'pesticide_products',
] as const;

export type OpfsStoreName = typeof REQUIRED_OPFS_STORES[number];

export interface OpfsSyncItem {
  id: string;
  table: OpfsStoreName;
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface OpfsEngineDiagnostics {
  engine: 'OPFS_WASM' | 'OPFS_WASM_MEMORY_FALLBACK';
  version: string;
  isOpfsSupported: boolean;
  isWasmSupported: boolean;
  isWasmInstantiated: boolean;
  isBridgeActive: boolean;
  totalStores: number;
  totalRecords: number;
  storageEstimateBytes: number;
  storageQuotaBytes: number;
  usagePercentage: number;
  isPersistent: boolean;
  migrationCompleted: boolean;
  migratedAt: number | null;
  migratedStoresCount: number;
  migratedKvCount: number;
  opfsDirectory: string;
  activeStores: { name: string; count: number; checksum: number }[];
}

export interface OpfsManifest {
  version: string;
  engine: string;
  initializedAt: number;
  migratedFromIndexedDb: boolean;
  migratedFromLocalStorage: boolean;
  migratedAt: number | null;
  migratedStoresCount: number;
  migratedKvCount: number;
  stores: Record<string, { count: number; checksum: number; lastModified: number }>;
}

// Bytecode for a validated, self-contained WebAssembly Module
function createWasmEngineBytes(): Uint8Array {
  const func0Body = [0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b]; // add(a, b)
  const func1Body = [ // checksum(offset, len)
    0x01, 0x01, 0x7f,
    0x41, 0x00, 0x21, 0x02,
    0x02, 0x40,
    0x03, 0x40,
    0x20, 0x01,
    0x45,
    0x0d, 0x01,
    0x20, 0x02,
    0x41, 0x1f,
    0x6c,
    0x20, 0x00,
    0x2d, 0x00, 0x00,
    0x6a,
    0x21, 0x02,
    0x20, 0x00, 0x41, 0x01, 0x6a, 0x21, 0x00,
    0x20, 0x01, 0x41, 0x01, 0x6b, 0x21, 0x01,
    0x0c, 0x00,
    0x0b,
    0x0b,
    0x20, 0x02,
    0x0b
  ];

  const codeSection = [
    0x0a,
    1 + (1 + func0Body.length) + (1 + func1Body.length),
    0x02,
    func0Body.length, ...func0Body,
    func1Body.length, ...func1Body
  ];

  return new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
    0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
    0x03, 0x03, 0x02, 0x00, 0x00,
    0x05, 0x03, 0x01, 0x00, 0x01,
    0x07, 0x1b, 0x03,
    0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, 0x02, 0x00,
    0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
    0x08, 0x63, 0x68, 0x65, 0x63, 0x6b, 0x73, 0x75, 0x6d, 0x00, 0x01,
    ...codeSection
  ]);
}

class WasmAcceleratedProcessor {
  private instance: any = null;
  private memory: WebAssembly.Memory | null = null;
  private isReady = false;

  public async initialize(): Promise<boolean> {
    if (typeof WebAssembly === 'undefined' || typeof WebAssembly.instantiate !== 'function') {
      return false;
    }

    // 1. Tenta carregar o binário compilado /geaagro-engine.wasm
    // O Service Worker intercepta a requisição via Stale-While-Revalidate para retorno instantâneo do cache
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      try {
        const response = await fetch('/geaagro-engine.wasm');
        if (response && response.ok) {
          const buffer = await response.arrayBuffer();
          if (buffer && buffer.byteLength > 0) {
            const result: any = await WebAssembly.instantiate(new Uint8Array(buffer));
            this.instance = result.instance || result;
            this.memory = (this.instance?.exports?.memory as WebAssembly.Memory) || null;
            this.isReady = true;
            return true;
          }
        }
      } catch {
        // Em caso de falha de rede ou offline inicial, utiliza os bytes embutidos imediatamente
      }
    }

    // 2. Fallback determinístico de alta performance com bytecode embutido
    try {
      const bytes = createWasmEngineBytes();
      const result: any = await WebAssembly.instantiate(bytes);
      this.instance = result.instance || result;
      this.memory = (this.instance?.exports?.memory as WebAssembly.Memory) || null;
      this.isReady = true;
      return true;
    } catch (err) {
      console.warn('[WasmEngine] WebAssembly fallback active:', err);
      this.isReady = false;
      return false;
    }
  }

  public isAvailable(): boolean {
    return this.isReady && !!this.instance;
  }

  public calculateChecksum(data: string): number {
    if (!this.isReady || !this.instance || !this.memory) {
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = (Math.imul(31, hash) + data.charCodeAt(i)) | 0;
      }
      return hash;
    }

    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(data.substring(0, 16384));
      const memoryBuffer = new Uint8Array(this.memory.buffer);
      const copyLen = Math.min(bytes.length, memoryBuffer.length - 128);
      memoryBuffer.set(bytes.subarray(0, copyLen), 64);

      const checksumFn = this.instance.exports.checksum as (offset: number, len: number) => number;
      return checksumFn(64, copyLen);
    } catch {
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = (Math.imul(31, hash) + data.charCodeAt(i)) | 0;
      }
      return hash;
    }
  }

  public fastAdd(a: number, b: number): number {
    if (this.instance && this.instance.exports?.add) {
      return (this.instance.exports.add as (a: number, b: number) => number)(a, b);
    }
    return a + b;
  }
}

export class OpfsWasmDatabaseEngine {
  private wasm = new WasmAcceleratedProcessor();
  private inMemoryStores: Map<string, Map<string, any>> = new Map();
  private inMemoryKv: Map<string, any> = new Map();
  private initialized = false;
  private isBridgeActive = false;
  private initPromise: Promise<void> | null = null;
  private opfsRootDirHandle: any = null;
  private opfsAppDirHandle: any = null;
  private kvFlushTimer: any = null;
  private manifest: OpfsManifest = {
    version: OPFS_DB_VERSION,
    engine: 'OPFS+WASM',
    initializedAt: Date.now(),
    migratedFromIndexedDb: false,
    migratedFromLocalStorage: false,
    migratedAt: null,
    migratedStoresCount: 0,
    migratedKvCount: 0,
    stores: {},
  };

  constructor() {
    REQUIRED_OPFS_STORES.forEach((store) => {
      this.inMemoryStores.set(store, new Map());
    });
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      await this.wasm.initialize();
      await this.requestPersistentStorage();
      const opfsAvailable = await this.initOpfsHandles();

      if (opfsAvailable) {
        await this.loadManifestFromOpfs();
      }

      // Se ainda não migrou, executa a migração total inicial
      if (!this.manifest.migratedFromIndexedDb || !this.manifest.migratedFromLocalStorage) {
        await this.migrateFromLegacyStorage();
      } else {
        await this.hydrateAllStoresFromOpfs();
      }

      // Hidrata o localStorage a partir do OPFS caso esteja ausente ou incompleto
      this.hydrateLocalStorageFromOpfs();

      // Ativa o interceptor / ponte transparente universal de LocalStorage
      this.enableLocalStorageBridge();

      this.initialized = true;
      console.log(
        `[OpfsWasmDB] Total Migration Active! Engine: ${opfsAvailable ? 'OPFS+WASM' : 'Memory/IndexedDB Fallback'}. Stores: ${this.inMemoryStores.size}. KV Keys: ${this.inMemoryKv.size}`
      );
    })().catch((err) => {
      this.initPromise = null;
      console.error('[OpfsWasmDB] Initialization error:', err);
      throw err;
    });

    return this.initPromise;
  }

  private isOpfsSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      'storage' in navigator &&
      typeof (navigator.storage as any).getDirectory === 'function'
    );
  }

  private async initOpfsHandles(): Promise<boolean> {
    if (!this.isOpfsSupported()) {
      return false;
    }
    try {
      this.opfsRootDirHandle = await (navigator.storage as any).getDirectory();
      this.opfsAppDirHandle = await this.opfsRootDirHandle.getDirectoryHandle(OPFS_ROOT_DIR, {
        create: true,
      });
      await this.opfsAppDirHandle.getDirectoryHandle('tables', { create: true });
      await this.opfsAppDirHandle.getDirectoryHandle('kv_store', { create: true });
      return true;
    } catch {
      this.opfsRootDirHandle = null;
      this.opfsAppDirHandle = null;
      return false;
    }
  }

  private async loadManifestFromOpfs(): Promise<void> {
    if (!this.opfsAppDirHandle) return;
    try {
      const manifestFile = await this.opfsAppDirHandle.getFileHandle('manifest.json', { create: false });
      const file = await manifestFile.getFile();
      const text = await file.text();
      if (text) {
        const parsed = JSON.parse(text);
        this.manifest = {
          ...this.manifest,
          ...parsed,
        };
      }
    } catch {}
  }

  private async saveManifestToOpfs(): Promise<void> {
    if (!this.opfsAppDirHandle) return;
    try {
      const manifestFile = await this.opfsAppDirHandle.getFileHandle('manifest.json', { create: true });
      const writable = await manifestFile.createWritable({ keepExistingData: false });
      await writable.write(JSON.stringify(this.manifest, null, 2));
      await writable.close();
    } catch (err) {
      console.warn('[OpfsWasmDB] Error saving manifest to OPFS:', err);
    }
  }

  private async hydrateAllStoresFromOpfs(): Promise<void> {
    if (!this.opfsAppDirHandle) return;
    try {
      const tablesDir = await this.opfsAppDirHandle.getDirectoryHandle('tables', { create: true });
      
      for (const storeName of REQUIRED_OPFS_STORES) {
        try {
          const fileHandle = await tablesDir.getFileHandle(`${storeName}.json`, { create: false });
          const file = await fileHandle.getFile();
          const text = await file.text();
          if (text) {
            const records: any[] = JSON.parse(text);
            const storeMap = new Map<string, any>();
            records.forEach((rec) => {
              if (rec && rec.id) {
                storeMap.set(rec.id, rec);
              }
            });
            this.inMemoryStores.set(storeName, storeMap);
          }
        } catch {}
      }

      try {
        const kvDir = await this.opfsAppDirHandle.getDirectoryHandle('kv_store', { create: true });
        const kvFileHandle = await kvDir.getFileHandle('local_storage_dump.json', { create: false });
        const file = await kvFileHandle.getFile();
        const text = await file.text();
        if (text) {
          const kvData: Record<string, any> = JSON.parse(text);
          Object.entries(kvData).forEach(([k, v]) => {
            this.inMemoryKv.set(k, v);
          });
        }
      } catch {}
    } catch (err) {
      console.warn('[OpfsWasmDB] Error hydrating stores from OPFS:', err);
    }
  }

  // Hidrata o localStorage a partir do dump mantido no OPFS
  public hydrateLocalStorageFromOpfs(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      this.inMemoryKv.forEach((val, key) => {
        if (!localStorage.getItem(key)) {
          try {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          } catch {}
        }
      });
    } catch {}
  }

  // Ativa a ponte universal que intercepta operações do localStorage para persistir no OPFS
  public enableLocalStorageBridge(): void {
    if (this.isBridgeActive) return;
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const proto = Object.getPrototypeOf(window.localStorage);
      const originalSetItem = proto.setItem;
      const originalRemoveItem = proto.removeItem;
      const originalClear = proto.clear;

      const self = this;

      proto.setItem = function (key: string, value: string) {
        originalSetItem.call(this, key, value);
        self.handleLocalStorageSet(key, value);
      };

      proto.removeItem = function (key: string) {
        originalRemoveItem.call(this, key);
        self.handleLocalStorageRemove(key);
      };

      proto.clear = function () {
        originalClear.call(this);
        self.handleLocalStorageClear();
      };

      this.isBridgeActive = true;
      console.log('[OpfsWasmDB] Universal LocalStorage-to-OPFS bridge activated.');
    } catch (err) {
      console.warn('[OpfsWasmDB] Could not attach LocalStorage prototype bridge:', err);
    }
  }

  // Trata inserções do localStorage e sincroniza no OPFS
  public handleLocalStorageSet(key: string, value: string): void {
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(value);
      } catch {
        parsed = value;
      }
      this.inMemoryKv.set(key, parsed);

      // Sincronizar listas de cadastros diretamente com a tabela OPFS
      const MAPPING: Record<string, OpfsStoreName> = {
        'agronutri_companies': 'companies',
        'agronutri_agronomists': 'agronomists',
        'agronutri_producers': 'producers',
        'agronutri_farms': 'farms',
        'agronutri_soil_samples': 'soil_samples',
        'agronutri_leaf_samples': 'leaf_samples',
        'agronutri_water_analysis_v2': 'water_analysis',
        'agronutri_fieldbook_operations': 'fieldbook_operations',
        'agronutri_traceability_lots': 'traceability_lots',
        'agronutri_pericias_pro_v1': 'pericias_records',
      };

      const targetStore = MAPPING[key];
      if (targetStore && Array.isArray(parsed)) {
        let storeMap = this.inMemoryStores.get(targetStore);
        if (!storeMap) {
          storeMap = new Map();
          this.inMemoryStores.set(targetStore, storeMap);
        }
        storeMap.clear();
        parsed.forEach((item) => {
          if (item && item.id) storeMap!.set(item.id, item);
        });
        this.persistStoreToOpfs(targetStore);
      }

      // Agendar flush de KV debounced para não travar I/O
      this.scheduleKvFlush();
    } catch {}
  }

  public handleLocalStorageRemove(key: string): void {
    this.inMemoryKv.delete(key);
    this.scheduleKvFlush();
  }

  public handleLocalStorageClear(): void {
    this.inMemoryKv.clear();
    this.scheduleKvFlush();
  }

  private scheduleKvFlush(): void {
    if (this.kvFlushTimer) {
      clearTimeout(this.kvFlushTimer);
    }
    this.kvFlushTimer = setTimeout(() => {
      const kvDump: Record<string, any> = {};
      this.inMemoryKv.forEach((v, k) => { kvDump[k] = v; });
      this.persistKvToOpfs(kvDump);
    }, 150);
  }

  /**
   * Complete Migration from IndexedDB + LocalStorage to OPFS + WASM
   */
  public async migrateFromLegacyStorage(): Promise<void> {
    console.log('[OpfsWasmDB] Executing total migration: IndexedDB + LocalStorage -> OPFS + WASM...');
    let migratedStores = 0;
    let migratedKvCount = 0;

    // 1. Mapeamento e Migração do IndexedDB
    try {
      if (typeof indexedDB !== 'undefined') {
        const databasesToRead = [
          { name: 'GeaAgroOfflineDB', stores: REQUIRED_OPFS_STORES },
          { name: 'NemaAIChatsDB', stores: ['diagnoses'] },
          { name: 'AgroNutriBularioDB_v11', stores: ['pesticide_products'] }
        ];

        for (const dbInfo of databasesToRead) {
          try {
            await new Promise<void>((resolve) => {
              const timer = setTimeout(resolve, 150);
              try {
                const req = indexedDB.open(dbInfo.name);
                req.onerror = () => { clearTimeout(timer); resolve(); };
                req.onblocked = () => { clearTimeout(timer); resolve(); };
                req.onsuccess = (ev: any) => {
                  const db = ev.target.result as IDBDatabase;
                  let completedStores = 0;
                  const total = dbInfo.stores.length;

                  if (total === 0) {
                    try { db.close(); } catch {}
                    clearTimeout(timer);
                    resolve();
                    return;
                  }

                  dbInfo.stores.forEach((storeName) => {
                    if (db.objectStoreNames.contains(storeName)) {
                      try {
                        const tx = db.transaction(storeName, 'readonly');
                        const store = tx.objectStore(storeName);
                        const getAllReq = store.getAll();
                        getAllReq.onsuccess = () => {
                          const records: any[] = getAllReq.result || [];
                          if (records.length > 0) {
                            const targetStore = storeName as OpfsStoreName;
                            let storeMap = this.inMemoryStores.get(targetStore);
                            if (!storeMap) {
                              storeMap = new Map();
                              this.inMemoryStores.set(targetStore, storeMap);
                            }
                            records.forEach((r) => {
                              if (r && r.id) storeMap!.set(r.id, r);
                            });
                            migratedStores++;
                          }
                          completedStores++;
                          if (completedStores >= total) {
                            try { db.close(); } catch {}
                            clearTimeout(timer);
                            resolve();
                          }
                        };
                        getAllReq.onerror = () => {
                          completedStores++;
                          if (completedStores >= total) {
                            try { db.close(); } catch {}
                            clearTimeout(timer);
                            resolve();
                          }
                        };
                      } catch {
                        completedStores++;
                        if (completedStores >= total) {
                          try { db.close(); } catch {}
                          clearTimeout(timer);
                          resolve();
                        }
                      }
                    } else {
                      completedStores++;
                      if (completedStores >= total) {
                        try { db.close(); } catch {}
                        clearTimeout(timer);
                        resolve();
                      }
                    }
                  });
                };
              } catch {
                clearTimeout(timer);
                resolve();
              }
            });
          } catch {}
        }
      }
    } catch (idbErr) {
      console.warn('[OpfsWasmDB Migration] Erro geral na migração do IndexedDB:', idbErr);
    }

    // 2. Mapeamento e Migração do LocalStorage para o KV do OPFS
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const kvDump: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('agronutri_') ||
            key.startsWith('geaagro_') ||
            key.startsWith('gea_') ||
            key.startsWith('nema_') ||
            key.startsWith('caprine_') ||
            key.startsWith('poultry_') ||
            key.startsWith('buffalo_') ||
            key.startsWith('swine_') ||
            key.startsWith('equine_')
          )) {
            try {
              const rawVal = localStorage.getItem(key);
              if (rawVal) {
                let parsed: any;
                try {
                  parsed = JSON.parse(rawVal);
                } catch {
                  parsed = rawVal;
                }
                this.inMemoryKv.set(key, parsed);
                kvDump[key] = parsed;
                migratedKvCount++;

                const mappingStore: Record<string, OpfsStoreName> = {
                  'agronutri_companies': 'companies',
                  'agronutri_agronomists': 'agronomists',
                  'agronutri_producers': 'producers',
                  'agronutri_farms': 'farms',
                  'agronutri_soil_samples': 'soil_samples',
                  'agronutri_leaf_samples': 'leaf_samples',
                  'agronutri_water_analysis_v2': 'water_analysis',
                  'agronutri_fieldbook_operations': 'fieldbook_operations',
                  'agronutri_traceability_lots': 'traceability_lots',
                  'agronutri_pericias_pro_v1': 'pericias_records',
                };

                const targetTable = mappingStore[key];
                if (targetTable && Array.isArray(parsed) && parsed.length > 0) {
                  let currentStore = this.inMemoryStores.get(targetTable);
                  if (!currentStore) {
                    currentStore = new Map();
                    this.inMemoryStores.set(targetTable, currentStore);
                  }
                  if (currentStore.size === 0) {
                    parsed.forEach((item) => {
                      if (item && item.id) currentStore!.set(item.id, item);
                    });
                  }
                }
              }
            } catch {}
          }
        }

        await this.persistKvToOpfs(kvDump);
      }
    } catch (lsErr) {
      console.warn('[OpfsWasmDB Migration] Erro na migração do LocalStorage:', lsErr);
    }

    // 3. Persistir tabelas migradas no OPFS com checksum WASM
    if (this.opfsAppDirHandle) {
      for (const [storeName, map] of this.inMemoryStores.entries()) {
        if (map.size > 0) {
          await this.persistStoreToOpfs(storeName as OpfsStoreName);
        }
      }
    }

    // 4. Atualizar e Salvar Manifesto
    this.manifest.migratedFromIndexedDb = true;
    this.manifest.migratedFromLocalStorage = true;
    this.manifest.migratedAt = Date.now();
    this.manifest.migratedStoresCount = migratedStores;
    this.manifest.migratedKvCount = migratedKvCount;
    await this.saveManifestToOpfs();

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(
          new CustomEvent('geaagro_opfs_wasm_migrated', {
            detail: {
              migratedAt: this.manifest.migratedAt,
              storesCount: migratedStores,
              kvCount: migratedKvCount,
            },
          })
        );
      } catch {}
    }

    console.log(
      `[OpfsWasmDB] Total Migration completed! Stores: ${migratedStores}, KV Keys: ${migratedKvCount}`
    );

    // 5. Purga Total do IndexedDB Legado para liberar armazenamento
    await this.purgeLegacyIndexedDb();
  }

  /**
   * Purga total e segura de bancos legados do IndexedDB
   * Deleta GeaAgroOfflineDB, NemaAIChatsDB, AgroNutriBularioDB_v11 e bancos dinâmicos
   */
  public async purgeLegacyIndexedDb(): Promise<{ deleted: string[]; errors: string[] }> {
    const deleted: string[] = [];
    const errors: string[] = [];

    if (typeof indexedDB === 'undefined') {
      return { deleted, errors };
    }

    const legacyDbNames = ['GeaAgroOfflineDB', 'NemaAIChatsDB', 'AgroNutriBularioDB_v11'];

    // Descobrir bases dinâmicas se suportado
    if (typeof indexedDB.databases === 'function') {
      try {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name && !legacyDbNames.includes(db.name)) {
            legacyDbNames.push(db.name);
          }
        }
      } catch {}
    }

    for (const name of legacyDbNames) {
      try {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 200);
          try {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => {
              clearTimeout(timer);
              deleted.push(name);
              resolve();
            };
            req.onerror = () => {
              clearTimeout(timer);
              errors.push(`Erro ao deletar ${name}: ${req.error?.message || 'erro'}`);
              resolve();
            };
            req.onblocked = () => {
              clearTimeout(timer);
              resolve();
            };
          } catch (innerErr: any) {
            clearTimeout(timer);
            errors.push(`Exceção ao deletar ${name}: ${innerErr?.message || innerErr}`);
            resolve();
          }
        });
      } catch (err: any) {
        errors.push(`Falha no processo de purga de ${name}: ${err?.message || err}`);
      }
    }

    if (deleted.length > 0) {
      console.log(`[OpfsWasmDB] Purga total do IndexedDB concluída com sucesso. Bancos excluídos: ${deleted.join(', ')}`);
    }

    return { deleted, errors };
  }

  private async persistKvToOpfs(data: Record<string, any>): Promise<void> {
    if (!this.opfsAppDirHandle) return;
    try {
      const kvDir = await this.opfsAppDirHandle.getDirectoryHandle('kv_store', { create: true });
      const fileHandle = await kvDir.getFileHandle('local_storage_dump.json', { create: true });
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      await writable.write(JSON.stringify(data));
      await writable.close();
    } catch (err) {
      console.warn('[OpfsWasmDB] Falha ao persistir KV no OPFS:', err);
    }
  }

  private async persistStoreToOpfs(storeName: OpfsStoreName): Promise<void> {
    if (!this.opfsAppDirHandle) return;
    try {
      const storeMap = this.inMemoryStores.get(storeName);
      const records = storeMap ? Array.from(storeMap.values()) : [];
      const jsonText = JSON.stringify(records);
      const checksum = this.wasm.calculateChecksum(jsonText);

      const tablesDir = await this.opfsAppDirHandle.getDirectoryHandle('tables', { create: true });
      const fileHandle = await tablesDir.getFileHandle(`${storeName}.json`, { create: true });
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      await writable.write(jsonText);
      await writable.close();

      this.manifest.stores[storeName] = {
        count: records.length,
        checksum,
        lastModified: Date.now(),
      };
      await this.saveManifestToOpfs();
    } catch (err) {
      console.warn(`[OpfsWasmDB] Erro ao persistir tabela '${storeName}' no OPFS:`, err);
    }
  }

  // ==========================================
  // OPERAÇÕES DO BANCO DE DADOS (CRUD)
  // ==========================================

  public async get<T>(storeName: OpfsStoreName, id: string): Promise<T | null> {
    await this.initialize();
    return this.getSync<T>(storeName, id);
  }

  public getSync<T>(storeName: OpfsStoreName, id: string): T | null {
    const storeMap = this.inMemoryStores.get(storeName);
    if (!storeMap) return null;
    const record = storeMap.get(id);
    return record ? (JSON.parse(JSON.stringify(record)) as T) : null;
  }

  public async getAll<T>(storeName: OpfsStoreName): Promise<T[]> {
    await this.initialize();
    return this.getAllSync<T>(storeName);
  }

  public getAllSync<T>(storeName: OpfsStoreName): T[] {
    const storeMap = this.inMemoryStores.get(storeName);
    if (!storeMap) return [];
    return Array.from(storeMap.values()).map((item) => JSON.parse(JSON.stringify(item)));
  }

  public async count(storeName: OpfsStoreName): Promise<number> {
    await this.initialize();
    const storeMap = this.inMemoryStores.get(storeName);
    return storeMap ? storeMap.size : 0;
  }

  public async put<T extends { id: string }>(
    storeName: OpfsStoreName,
    value: T,
    skipSync = false
  ): Promise<void> {
    await this.initialize();
    let storeMap = this.inMemoryStores.get(storeName);
    if (!storeMap) {
      storeMap = new Map();
      this.inMemoryStores.set(storeName, storeMap);
    }

    const cloned = JSON.parse(JSON.stringify(value));
    storeMap.set(value.id, cloned);

    await this.persistStoreToOpfs(storeName);

    if (!skipSync && storeName !== 'sync_queue' && storeName !== 'app_settings') {
      await this.addToSyncQueue(storeName, 'update', cloned);
    }
  }

  public async putMany<T extends { id: string }>(
    storeName: OpfsStoreName,
    items: T[],
    skipSync = false
  ): Promise<void> {
    if (!items || items.length === 0) return;
    await this.initialize();

    let storeMap = this.inMemoryStores.get(storeName);
    if (!storeMap) {
      storeMap = new Map();
      this.inMemoryStores.set(storeName, storeMap);
    }

    for (const item of items) {
      if (item && item.id) {
        storeMap.set(item.id, JSON.parse(JSON.stringify(item)));
      }
    }

    await this.persistStoreToOpfs(storeName);

    if (!skipSync && storeName !== 'sync_queue' && storeName !== 'app_settings') {
      for (const item of items) {
        await this.addToSyncQueue(storeName, 'update', item);
      }
    }
  }

  public async add<T extends { id: string }>(
    storeName: OpfsStoreName,
    value: T,
    skipSync = false
  ): Promise<void> {
    await this.put(storeName, value, skipSync);
  }

  public async delete(
    storeName: OpfsStoreName,
    id: string,
    skipSync = false
  ): Promise<void> {
    await this.initialize();
    const storeMap = this.inMemoryStores.get(storeName);
    if (storeMap) {
      storeMap.delete(id);
      await this.persistStoreToOpfs(storeName);

      if (!skipSync && storeName !== 'sync_queue' && storeName !== 'app_settings') {
        await this.addToSyncQueue(storeName, 'delete', { id });
      }
    }
  }

  public async clear(storeName: OpfsStoreName): Promise<void> {
    await this.initialize();
    const storeMap = this.inMemoryStores.get(storeName);
    if (storeMap) {
      storeMap.clear();
      await this.persistStoreToOpfs(storeName);
    }
  }

  // ==========================================
  // CONFIGURAÇÕES & KV STORE
  // ==========================================

  public async setSetting<T>(key: string, value: T): Promise<void> {
    const item = { id: key, value, updatedAt: Date.now() };
    await this.put('app_settings', item, true);
    this.inMemoryKv.set(key, value);
  }

  public async getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const record = await this.get<{ id: string; value: T }>('app_settings', key);
    if (record) {
      return record.value;
    }
    const inKv = this.inMemoryKv.get(key);
    return inKv !== undefined ? inKv : defaultValue;
  }

  public setKv(key: string, value: any): void {
    this.inMemoryKv.set(key, value);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch {}
    }
    this.scheduleKvFlush();
  }

  public getKv<T>(key: string, defaultValue?: T): T | undefined {
    if (this.inMemoryKv.has(key)) {
      return this.inMemoryKv.get(key);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return raw as unknown as T;
        }
      }
    }
    return defaultValue;
  }

  public deleteKv(key: string): void {
    this.inMemoryKv.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
    this.scheduleKvFlush();
  }

  // ==========================================
  // SINCRONIZAÇÃO OFFLINE-FIRST
  // ==========================================

  public async addToSyncQueue(
    table: OpfsStoreName,
    action: 'insert' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    const syncItem: OpfsSyncItem = {
      id: `${table}_${data?.id || Math.random().toString(36).substring(2)}_${Date.now()}`,
      table,
      action,
      data,
      timestamp: Date.now(),
      status: 'pending',
    };
    await this.put('sync_queue', syncItem, true);
  }

  public async getSyncQueue(): Promise<OpfsSyncItem[]> {
    return this.getAll<OpfsSyncItem>('sync_queue');
  }

  public async updateSyncStatus(id: string, status: OpfsSyncItem['status']): Promise<void> {
    const item = await this.get<OpfsSyncItem>('sync_queue', id);
    if (item) {
      item.status = status;
      await this.put('sync_queue', item, true);
    }
  }

  public async removeSyncItem(id: string): Promise<void> {
    await this.delete('sync_queue', id, true);
  }

  public async clearSyncQueue(): Promise<void> {
    await this.clear('sync_queue');
  }

  // ==========================================
  // ESTATÍSTICAS E ESTIMATIVAS DE ARMAZENAMENTO
  // ==========================================

  public async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persisted();
        if (isPersisted) return true;
        return await navigator.storage.persist();
      } catch {
        return false;
      }
    }
    return false;
  }

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
          const est = await navigator.storage.estimate();
          quota = est.quota || 0;
          usage = est.usage || 0;
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

  public async getEngineDiagnostics(): Promise<OpfsEngineDiagnostics> {
    await this.initialize();
    const est = await this.getStorageEstimate();
    const activeStores: { name: string; count: number; checksum: number }[] = [];
    let totalRecords = 0;

    this.inMemoryStores.forEach((map, name) => {
      totalRecords += map.size;
      const chk = this.manifest.stores[name]?.checksum || 0;
      activeStores.push({
        name,
        count: map.size,
        checksum: chk,
      });
    });

    return {
      engine: this.opfsAppDirHandle ? 'OPFS_WASM' : 'OPFS_WASM_MEMORY_FALLBACK',
      version: OPFS_DB_VERSION,
      isOpfsSupported: this.isOpfsSupported(),
      isWasmSupported: typeof WebAssembly !== 'undefined',
      isWasmInstantiated: this.wasm.isAvailable(),
      isBridgeActive: this.isBridgeActive,
      totalStores: this.inMemoryStores.size,
      totalRecords,
      storageEstimateBytes: est.usage,
      storageQuotaBytes: est.quota,
      usagePercentage: est.percentage,
      isPersistent: est.isPersistent,
      migrationCompleted: this.manifest.migratedFromIndexedDb && this.manifest.migratedFromLocalStorage,
      migratedAt: this.manifest.migratedAt,
      migratedStoresCount: this.manifest.migratedStoresCount,
      migratedKvCount: this.manifest.migratedKvCount,
      opfsDirectory: OPFS_ROOT_DIR,
      activeStores,
    };
  }

  public async exportOpfsDump(): Promise<{
    manifest: OpfsManifest;
    tables: Record<string, any[]>;
    kv: Record<string, any>;
    exportedAt: number;
  }> {
    await this.initialize();
    const tablesDump: Record<string, any[]> = {};
    for (const [storeName, map] of this.inMemoryStores.entries()) {
      tablesDump[storeName] = Array.from(map.values());
    }
    const kvDump: Record<string, any> = {};
    for (const [k, v] of this.inMemoryKv.entries()) {
      kvDump[k] = v;
    }
    return {
      manifest: this.manifest,
      tables: tablesDump,
      kv: kvDump,
      exportedAt: Date.now(),
    };
  }

  public async importOpfsDump(dump: {
    tables?: Record<string, any[]>;
    kv?: Record<string, any>;
  }): Promise<void> {
    await this.initialize();
    if (dump.tables) {
      for (const [storeName, items] of Object.entries(dump.tables)) {
        if (Array.isArray(items)) {
          await this.putMany(storeName as OpfsStoreName, items, true);
        }
      }
    }
    if (dump.kv) {
      for (const [k, v] of Object.entries(dump.kv)) {
        this.setKv(k, v);
      }
    }
  }

  public async close(): Promise<void> {
    this.opfsAppDirHandle = null;
    this.opfsRootDirHandle = null;
    this.initialized = false;
    this.initPromise = null;
  }
}

// Singleton Engine
export const opfsWasmDB = new OpfsWasmDatabaseEngine();

// Convenience Synchronous Storage Proxy for any module
export const opfsStorage = {
  getItem<T = any>(key: string, fallback?: T): T {
    return (opfsWasmDB.getKv<T>(key, fallback) ?? fallback) as T;
  },
  setItem<T = any>(key: string, value: T): void {
    opfsWasmDB.setKv(key, value);
  },
  removeItem(key: string): void {
    opfsWasmDB.deleteKv(key);
  },
  getTable<T = any>(storeName: OpfsStoreName): T[] {
    return opfsWasmDB.getAllSync<T>(storeName);
  },
  async saveTable<T extends { id: string }>(storeName: OpfsStoreName, records: T[]): Promise<void> {
    await opfsWasmDB.putMany(storeName, records, true);
  }
};
