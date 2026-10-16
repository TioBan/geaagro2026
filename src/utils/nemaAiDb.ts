const NEMA_DB_NAME = 'NemaAIChatsDB';
const NEMA_DB_VERSION = 1;
const STORE_NAME = 'diagnoses';

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

class NemaAIDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(NEMA_DB_NAME, NEMA_DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('[NemaAIDB] Failed to open database', event);
        reject((event.target as IDBOpenDBRequest).error);
      };
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
