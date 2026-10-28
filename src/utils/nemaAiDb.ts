import { opfsWasmDB } from '../services/opfsWasmDatabase';

export const NEMA_DB_NAME = 'NemaAIChatsDB';
export const NEMA_DB_VERSION = 2;
export const STORE_NAME = 'diagnoses';

export interface NemaAIDiagnosisLog {
  id: string;
  timestamp: number;
  domain: 'geral' | 'fertilidade' | 'nematologia' | 'pecuaria' | 'avicultura';
  prompt: string;
  farmName: string;
  producerName: string;
  fieldName: string;
  areaHa: number;
  cropOrPasture: string;
  cultivarOrForage: string;
  soilType: string;
  result: any; // CentralAIAnalysisResult
  uploadedFileName: string | null;
  messages?: any[];
}

export class NemaAIDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private currentDb: IDBDatabase | null = null;

  public close(): void {
    if (this.currentDb) {
      try {
        this.currentDb.close();
      } catch {}
      this.currentDb = null;
    }
    this.dbPromise = null;
  }

  private openDatabase(version?: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const targetVersion = version || NEMA_DB_VERSION;
      const request = indexedDB.open(NEMA_DB_NAME, targetVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Cria a store diagnoses de forma idempotente sem apagar stores existentes
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          console.log(`[NemaAIDB] Object store '${STORE_NAME}' criada com sucesso na versão ${db.version}.`);
        }
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.currentDb = db;

        // Auto-recuperação (Self-healing): se o banco já existia de versões anteriores
        // sem a store 'diagnoses', fechamos e executamos uma migração segura de versão
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          console.warn(
            `[NemaAIDB] Store '${STORE_NAME}' ausente na versão atual (${db.version}). Iniciando migração segura de versão...`
          );
          const nextVersion = Math.max(db.version + 1, NEMA_DB_VERSION);
          db.close();
          this.currentDb = null;
          try {
            const upgradedDb = await this.openDatabase(nextVersion);
            resolve(upgradedDb);
          } catch (upgradeErr) {
            console.error('[NemaAIDB] Falha na migração segura de versão do banco:', upgradeErr);
            reject(upgradeErr);
          }
          return;
        }

        resolve(db);
      };

      request.onerror = (event) => {
        console.error('[NemaAIDB] Falha ao abrir o banco de dados:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = () => {
        console.warn('[NemaAIDB] Migração de banco bloqueada por outra conexão aberta nesta ou em outra aba.');
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

  // Get all diagnoses sorted by timestamp descending
  public async getAllDiagnoses(): Promise<NemaAIDiagnosisLog[]> {
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const results = await new Promise<NemaAIDiagnosisLog[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve((request.result as NemaAIDiagnosisLog[]) || []);
          request.onerror = () => reject(request.error);
        });
        results.sort((a, b) => b.timestamp - a.timestamp);
        return results;
      } catch (err) {
        console.warn('[NemaAIDB] Warning reading diagnoses from IndexedDB:', err);
      }
    }

    try {
      const opfsRecords = await opfsWasmDB.getAll<NemaAIDiagnosisLog>('diagnoses' as any);
      if (opfsRecords && opfsRecords.length > 0) {
        opfsRecords.sort((a, b) => b.timestamp - a.timestamp);
        return opfsRecords;
      }
    } catch {}

    return [];
  }

  // Save or update a diagnosis
  public async saveDiagnosis(log: NemaAIDiagnosisLog): Promise<void> {
    // 1. Mirror to OPFS + WASM engine
    await opfsWasmDB.put('diagnoses' as any, log, true).catch(() => {});

    // 2. Save in IndexedDB if available
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        await new Promise<void>((resolve, reject) => {
          const request = store.put(log);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (err) {
        console.warn('[NemaAIDB] Warning saving diagnosis to IndexedDB:', err);
      }
    }
  }

  // Delete a single diagnosis
  public async deleteDiagnosis(id: string): Promise<void> {
    // 1. Delete from OPFS + WASM engine
    await opfsWasmDB.delete('diagnoses' as any, id, true).catch(() => {});

    // 2. Delete from IndexedDB if available
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (err) {
        console.warn('[NemaAIDB] Warning deleting diagnosis from IndexedDB:', err);
      }
    }
  }

  // Clear all history
  public async clearHistory(): Promise<void> {
    // 1. Clear OPFS + WASM engine
    await opfsWasmDB.clear('diagnoses' as any).catch(() => {});

    // 2. Clear IndexedDB if available
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (err) {
        console.warn('[NemaAIDB] Warning clearing diagnoses history from IndexedDB:', err);
      }
    }
  }
}

export const nemaAIDB = new NemaAIDBService();
