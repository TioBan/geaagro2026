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
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const results = (request.result as NemaAIDiagnosisLog[]) || [];
          // Sort descending by timestamp
          results.sort((a, b) => b.timestamp - a.timestamp);
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[NemaAIDB] Error getting all diagnoses', err);
      return [];
    }
  }

  // Save or update a diagnosis
  public async saveDiagnosis(log: NemaAIDiagnosisLog): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      return new Promise<void>((resolve, reject) => {
        const request = store.put(log);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[NemaAIDB] Error saving diagnosis', err);
      throw err;
    }
  }

  // Delete a single diagnosis
  public async deleteDiagnosis(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[NemaAIDB] Error deleting diagnosis', err);
      throw err;
    }
  }

  // Clear all history
  public async clearHistory(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('[NemaAIDB] Error clearing diagnoses history', err);
      throw err;
    }
  }
}

export const nemaAIDB = new NemaAIDBService();
