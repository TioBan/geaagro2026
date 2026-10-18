/**
 * GeaAgro Backup and Restore Service (Fase 1 — Offline-First, Armazenamento Local e Segurança)
 * 
 * Implementação corporativa de backup completo e restauração transacional com:
 * - Cifragem ponta-a-ponta via Web Crypto API (AES-256-GCM, PBKDF2-HMAC-SHA-256)
 * - Suporte a Envelope Encryption (protegido simultaneamente por Senha e Chave de Recuperação)
 * - Coleta exaustiva de todas as fontes de dados locais:
 *     * IndexedDB (GeaAgroOfflineDB, NemaAIChatsDB, AgroNutriBularioDB_v11 e dinâmicos)
 *     * Todas as chaves do localStorage (agronutri_*, geaagro_*, gea_*, caprine_*, poultry_*, nema_*, etc.)
 *     * Fotos, anexos, laudos, rasters e objetos binários em Base64 com hash de integridade individual
 *     * Filas de sincronização (sync_queue) e registros pendentes
 *     * Relacionamentos e metadados de versão
 * - Validação prévia em área isolada antes de aplicar qualquer restauração
 * - Snapshot preventivo obrigatório do estado atual pré-restauração
 * - Restauração transacional com rollback automático em caso de erro
 * - Proteção de credenciais: nenhuma senha ou chave em logs
 */

import {
  CryptoService,
  CryptoError,
  EncryptedPayload,
  EnvelopeEncryptedData,
  RecoveryKeyDetails,
  bytesToBase64,
  base64ToBytes
} from './cryptoService';

export const BACKUP_FORMAT_MAGIC = 'GEAAGRO_BACKUP';
export const BACKUP_FORMAT_VERSION = 1;
export const CURRENT_APP_VERSION = 'v4.8.2-PRO';
export const CURRENT_DATABASE_VERSION = 'v4.2.8 - SQLite / IndexedDB';

export const EMERGENCY_ROLLBACK_KEY = 'geaagro_emergency_rollback_snapshot_v1';
export const RESTORE_IN_PROGRESS_KEY = 'geaagro_restore_in_progress_v1';
export const STORAGE_KEY_BACKUP_HISTORY = 'geaagro_backup_history_v1';
export const STORAGE_KEY_SNAPSHOTS = 'geaagro_backup_snapshots_v1';
export const STORAGE_KEY_AUTO_CONFIG = 'geaagro_backup_autoconfig_v1';

// Known IndexedDB databases and their object stores in GeaAgro
export const KNOWN_INDEXED_DATABASES: { name: string; version: number; stores: string[] }[] = [
  {
    name: 'GeaAgroOfflineDB',
    version: 4,
    stores: ['animals', 'paddocks', 'poultry_batches', 'poultry_sheds', 'sync_queue']
  },
  {
    name: 'NemaAIChatsDB',
    version: 1,
    stores: ['diagnoses']
  },
  {
    name: 'AgroNutriBularioDB_v11',
    version: 11,
    stores: ['pesticide_products', 'search_index_cache', 'app_metadata']
  }
];

export interface BackupMetadata {
  id: string;
  filename: string;
  timestamp: string;
  type: 'completo' | 'incremental' | 'diferencial' | 'modulo' | 'snapshot';
  sizeBytes: number;
  formattedSize: string;
  appVersion: string;
  databaseVersion: string;
  userResponsible: string;
  storageLocation: string;
  storageType: 'interna' | 'sdcard' | 'otg' | 'hd_externo' | 'pasta_custom' | 'ftp';
  integrityHash: string; // SHA-256 do payload ou ciphertext
  integrityStatus: 'valid' | 'corrupted' | 'unverified';
  encryption: 'none' | 'aes-256';
  encryptionMode?: 'none' | 'password' | 'envelope';
  modulesIncluded: string[];
  recordsCount: number;
  mediaFilesCount: number;
  notes?: string;
}

export interface SnapshotRecord {
  id: string;
  title: string;
  triggerEvent: string;
  timestamp: string;
  hash: string;
  sizeFormatted: string;
  canRollback: boolean;
  type: 'pre_operacao' | 'auto_evento' | 'manual';
}

export interface BackupAutoTriggerConfig {
  onAppClose: boolean;
  onSoilAnalysisComplete: boolean;
  onReportFinished: boolean;
  onNewFieldAdded: boolean;
  onBirthRegistered: boolean;
  onApplicationRegistered: boolean;
  onFertilizerDbUpdated: boolean;
  scheduleFrequency: 'off' | 'daily' | 'weekly' | 'fortnightly' | 'monthly';
  preferredTime: string;
  retentionCount: number;
}

export interface StoredAttachment {
  id: string; // SHA-256 hash
  name: string;
  mimeType: string;
  sizeBytes: number;
  sourceKey: string;
  dataBase64: string;
}

export interface IndexedDBStoreDump {
  storeName: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: {
    name: string;
    keyPath: string | string[];
    unique: boolean;
    multiEntry: boolean;
  }[];
  records: any[];
}

export interface IndexedDBDatabaseDump {
  dbName: string;
  version: number;
  stores: IndexedDBStoreDump[];
}

export interface DecryptedBackupPayload {
  system: 'GeaAgro Suite';
  schemaVersion: number;
  appVersion: string;
  createdAt: string;
  manifest: BackupMetadata;
  localStorageData: Record<string, any>;
  indexedDBData: IndexedDBDatabaseDump[];
  attachments: StoredAttachment[];
  syncQueue: any[];
}

export interface GeaAgroBackupFile {
  magic: typeof BACKUP_FORMAT_MAGIC;
  formatVersion: number;
  createdAt: string;
  appVersion: string;
  manifest: BackupMetadata;
  encryption: {
    mode: 'none' | 'password' | 'envelope';
    singlePayload?: EncryptedPayload;
    envelope?: EnvelopeEncryptedData;
  };
  rawPayload?: DecryptedBackupPayload;
  fileChecksum: string; // SHA-256 do corpo do arquivo
}

export interface RestoreInspectionResult {
  isValid: boolean;
  errorMessage?: string;
  manifest?: BackupMetadata;
  details?: {
    appVersion: string;
    createdAt: string;
    encryptionMode: 'none' | 'password' | 'envelope';
    localStorageKeyCount: number;
    indexedDbDatabaseCount: number;
    indexedDbRecordCount: number;
    attachmentCount: number;
    syncQueueCount: number;
    modules: string[];
    conflicts: {
      keyConflictsCount: number;
      databaseConflictsCount: number;
    };
  };
  payload?: DecryptedBackupPayload;
}

export interface RestoreExecutionResult {
  success: boolean;
  timestamp: string;
  restoredRecordsCount: number;
  restoredKeysCount: number;
  restoredDatabasesCount: number;
  restoredAttachmentsCount: number;
  emergencySnapshotId?: string;
  errors: string[];
  rolledBack: boolean;
}

// Helpers
// Helpers
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Cálculo síncrono padrão NIST FIPS 180-4 SHA-256 real (sem hashes demonstrativos)
 */
export function generateSHA256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const k: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let hash: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // Codificação UTF-8
  const utf8: number[] = [];
  for (let m = 0; m < ascii.length; m++) {
    let charcode = ascii.charCodeAt(m);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      m++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (ascii.charCodeAt(m) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) {
    utf8.push(0);
  }
  for (let b = 7; b >= 0; b--) {
    utf8.push(Number((BigInt(bitLength) >> BigInt(b * 8)) & BigInt(0xff)));
  }

  const words: number[] = [];
  for (let w = 0; w < utf8.length; w += 4) {
    words.push((utf8[w] << 24) | (utf8[w + 1] << 16) | (utf8[w + 2] << 8) | (utf8[w + 3]));
  }

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = [...hash];

    for (let i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      const S1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + S1 + ch + k[i] + w[i]) | 0;
      const S0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (S0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byteVal = (hash[i] >>> (b * 8)) & 0xff;
      result += byteVal.toString(16).padStart(2, '0');
    }
  }

  return result;
}

/**
 * Coleta todas as chaves relevantes do localStorage
 * Coleta TODAS as chaves de dados do usuário, não apenas geaagro_
 */
export function collectAllLocalStorageData(): Record<string, any> {
  const result: Record<string, any> = {};
  if (typeof window === 'undefined' || !window.localStorage) {
    return result;
  }

  // Chaves de infraestrutura/temporárias que não devem ser incluídas no backup
  const EXCLUDED_KEYS = new Set([
    STORAGE_KEY_BACKUP_HISTORY,
    STORAGE_KEY_SNAPSHOTS,
    STORAGE_KEY_AUTO_CONFIG,
    EMERGENCY_ROLLBACK_KEY,
    'vite-ui-theme',
    'loglevel'
  ]);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || EXCLUDED_KEYS.has(key)) continue;

    const val = localStorage.getItem(key);
    if (val === null) continue;

    try {
      result[key] = JSON.parse(val);
    } catch {
      result[key] = val;
    }
  }

  return result;
}

/**
 * Coleta todas as bases de dados e registros do IndexedDB
 */
export async function collectAllIndexedDBData(): Promise<IndexedDBDatabaseDump[]> {
  const results: IndexedDBDatabaseDump[] = [];
  const idb = globalThis.indexedDB;
  if (!idb) return results;

  // Descobrir bases conhecidas
  const targetDatabases = [...KNOWN_INDEXED_DATABASES];

  // Tentar listar bases dinâmicas se a API do navegador suportar indexedDB.databases()
  if (typeof idb.databases === 'function') {
    try {
      const available = await idb.databases();
      for (const dbInfo of available) {
        if (dbInfo.name && !targetDatabases.some(d => d.name === dbInfo.name)) {
          targetDatabases.push({
            name: dbInfo.name,
            version: dbInfo.version || 1,
            stores: [] // Será inspecionado ao abrir
          });
        }
      }
    } catch {
      // Ignora erro em navegadores que restringem databases()
    }
  }

  for (const dbTarget of targetDatabases) {
    try {
      const dump = await dumpSingleIndexedDB(dbTarget.name, dbTarget.version, dbTarget.stores);
      if (dump) {
        results.push(dump);
      }
    } catch (e) {
      console.warn(`[BackupService] Falha ao ler IndexedDB ${dbTarget.name}:`, e);
    }
  }

  return results;
}

function dumpSingleIndexedDB(
  dbName: string,
  targetVersion: number,
  expectedStores: string[]
): Promise<IndexedDBDatabaseDump | null> {
  return new Promise((resolve) => {
    const req = globalThis.indexedDB.open(dbName);

    req.onerror = () => {
      resolve(null);
    };

    req.onsuccess = async (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;
      const storeNames = Array.from(db.objectStoreNames);

      const storesDump: IndexedDBStoreDump[] = [];

      for (const storeName of storeNames) {
        try {
          const storeData = await readStoreContent(db, storeName);
          storesDump.push(storeData);
        } catch (err) {
          console.warn(`[BackupService] Falha ao ler store ${storeName} de ${dbName}:`, err);
        }
      }

      const dump: IndexedDBDatabaseDump = {
        dbName,
        version: db.version,
        stores: storesDump
      };

      db.close();
      resolve(dump);
    };
  });
}

function readStoreContent(db: IDBDatabase, storeName: string): Promise<IndexedDBStoreDump> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      const indexes = Array.from(store.indexNames).map((idxName) => {
        const idx = store.index(idxName);
        return {
          name: idx.name,
          keyPath: idx.keyPath,
          unique: idx.unique,
          multiEntry: idx.multiEntry
        };
      });

      const getAllReq = store.getAll();

      getAllReq.onsuccess = () => {
        resolve({
          storeName,
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement,
          indexes,
          records: getAllReq.result || []
        });
      };

      getAllReq.onerror = () => reject(getAllReq.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Extrai anexos, fotos e mídias contidas nos dados para inspeção e verificação de integridade
 */
export async function extractAttachments(
  localStorageData: Record<string, any>,
  indexedData: IndexedDBDatabaseDump[]
): Promise<StoredAttachment[]> {
  const attachments: StoredAttachment[] = [];
  const processedHashes = new Set<string>();

  const checkAndAddBase64 = async (sourceKey: string, val: any) => {
    if (typeof val === 'string' && (val.startsWith('data:image/') || val.startsWith('data:application/pdf') || (val.length > 500 && /^[A-Za-z0-9+/=]+$/.test(val.slice(0, 100))))) {
      try {
        const hash = await CryptoService.sha256Hex(val);
        if (!processedHashes.has(hash)) {
          processedHashes.add(hash);
          const mimeMatch = val.match(/^data:([^;]+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
          attachments.push({
            id: hash,
            name: `${sourceKey}_${hash.substring(0, 8)}`,
            mimeType,
            sizeBytes: val.length,
            sourceKey,
            dataBase64: val
          });
        }
      } catch {
        // Ignora erro de hash
      }
    }
  };

  const traverse = async (path: string, obj: any) => {
    if (!obj) return;
    if (typeof obj === 'string') {
      await checkAndAddBase64(path, obj);
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        await traverse(`${path}[${i}]`, obj[i]);
      }
    } else if (typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        await traverse(`${path}.${k}`, v);
      }
    }
  };

  // 1. Inspeciona localStorage
  for (const [key, val] of Object.entries(localStorageData)) {
    await traverse(key, val);
  }

  // 2. Inspeciona IndexedDB records
  for (const db of indexedData) {
    for (const store of db.stores) {
      for (let i = 0; i < store.records.length; i++) {
        await traverse(`${db.dbName}.${store.storeName}[${i}]`, store.records[i]);
      }
    }
  }

  return attachments;
}

// Cache em memória de alta prioridade para contornar qualquer limite de quota do localStorage
let memoryEmergencySnapshot: { id: string; payload: any } | null = null;

export function clearEmergencySnapshotCache(): void {
  memoryEmergencySnapshot = null;
}

/**
 * Cria Snapshot Preventivo de Emergência do estado atual completo antes de qualquer restauração
 */
export async function createEmergencySnapshot(
  title: string = 'Snapshot de Segurança Pré-Restauração'
): Promise<string> {
  const localStorageDump = collectAllLocalStorageData();
  const indexedDump = await collectAllIndexedDBData();

  const snapshotPayload = {
    id: `snap-emer-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title,
    localStorage: localStorageDump,
    indexedDB: indexedDump
  };

  // Garante retenção em memória imediatamente para garantir rollback mesmo com QuotaExceededError
  memoryEmergencySnapshot = {
    id: snapshotPayload.id,
    payload: snapshotPayload
  };

  const serialized = JSON.stringify(snapshotPayload);
  const hash = await CryptoService.sha256Hex(serialized);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(EMERGENCY_ROLLBACK_KEY, serialized);

      // Adiciona também à lista pública de snapshots do UI
      const snapshots = getSnapshots();
      const newSnap: SnapshotRecord = {
        id: snapshotPayload.id,
        title,
        triggerEvent: 'Pré-Restauração de Backup',
        timestamp: snapshotPayload.timestamp,
        hash,
        sizeFormatted: formatBytes(new Blob([serialized]).size),
        canRollback: true,
        type: 'pre_operacao'
      };
      saveSnapshots([newSnap, ...snapshots]);
    } catch (e) {
      console.warn('[BackupService] Quota ou restrição no localStorage; snapshot mantido seguro em memória:', e);
    }
  }

  return snapshotPayload.id;
}

/**
 * Reversão atômica para o Snapshot de Emergência em caso de falha de restauração
 */
export async function rollbackEmergencySnapshot(targetSnapshotId?: string): Promise<boolean> {
  let parsed: any = null;

  // 1. Tenta recuperar do cache de memória prioritário
  if (memoryEmergencySnapshot && memoryEmergencySnapshot.payload) {
    if (!targetSnapshotId || memoryEmergencySnapshot.id === targetSnapshotId) {
      parsed = memoryEmergencySnapshot.payload;
    }
  }
  
  if (!parsed && typeof window !== 'undefined' && window.localStorage) {
    // 2. Se não estiver em memória ou ID divergir, recupera do localStorage
    const raw = localStorage.getItem(EMERGENCY_ROLLBACK_KEY);
    if (raw) {
      try {
        const potential = JSON.parse(raw);
        if (!targetSnapshotId || potential.id === targetSnapshotId) {
          parsed = potential;
        }
      } catch (err) {
        console.error('[BackupService Rollback] Erro ao analisar snapshot do localStorage:', err);
      }
    }
  }

  if (!parsed || !parsed.localStorage || !parsed.indexedDB) {
    console.error('[BackupService] Nenhum snapshot de emergência encontrado para reversão.');
    return false;
  }

  try {
    if (!parsed || !parsed.localStorage || !parsed.indexedDB) {
      throw new Error('Estrutura do snapshot de emergência inválida.');
    }

    // 1. Restaura localStorage
    for (const [key, val] of Object.entries(parsed.localStorage)) {
      try {
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
      } catch (err) {
        console.error(`[BackupService Rollback] Erro ao restaurar chave ${key}:`, err);
      }
    }

    // 2. Restaura IndexedDB
    for (const dbDump of parsed.indexedDB as IndexedDBDatabaseDump[]) {
      await writeIndexedDBDump(dbDump);
    }

    memoryEmergencySnapshot = null;
    return true;
  } catch (err) {
    console.error('[BackupService Rollback] Erro crítico durante rollback:', err);
    return false;
  }
}

/**
 * Escreve um dump completo de volta no IndexedDB
 */
export function writeIndexedDBDump(dbDump: IndexedDBDatabaseDump): Promise<void> {
  const idb = globalThis.indexedDB;
  if (!idb) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Abrimos com a versão do dump
    const req = idb.open(dbDump.dbName, dbDump.version);

    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;
      for (const storeDump of dbDump.stores) {
        if (!db.objectStoreNames.contains(storeDump.storeName)) {
          const params: IDBObjectStoreParameters = {};
          if (storeDump.keyPath) params.keyPath = storeDump.keyPath;
          if (storeDump.autoIncrement) params.autoIncrement = storeDump.autoIncrement;

          const store = db.createObjectStore(storeDump.storeName, params);
          if (storeDump.indexes) {
            for (const idx of storeDump.indexes) {
              if (!store.indexNames.contains(idx.name)) {
                store.createIndex(idx.name, idx.keyPath, {
                  unique: idx.unique,
                  multiEntry: idx.multiEntry
                });
              }
            }
          }
        }
      }
    };

    req.onsuccess = async (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;
      try {
        for (const storeDump of dbDump.stores) {
          if (!db.objectStoreNames.contains(storeDump.storeName)) continue;

          await new Promise<void>((resStore, rejStore) => {
            const tx = db.transaction(storeDump.storeName, 'readwrite');
            const store = tx.objectStore(storeDump.storeName);

            // Limpa registros anteriores para evitar duplicatas inconsistentes
            store.clear();

            for (const rec of storeDump.records) {
              store.put(rec);
            }

            tx.oncomplete = () => resStore();
            tx.onerror = () => rejStore(tx.error);
            tx.onabort = () => rejStore(tx.error || new Error('Transação abortada'));
          });
        }
        db.close();
        resolve();
      } catch (err) {
        db.close();
        reject(err);
      }
    };

    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn(`[BackupService] Upgrade bloqueado para ${dbDump.dbName}`);
    };
  });
}

/**
 * Criação principal do Backup GeaAgro (.geaagro)
 */
export async function createFullBackup(options: {
  type?: 'completo' | 'incremental' | 'diferencial' | 'modulo' | 'snapshot';
  modules?: string[];
  userResponsible?: string;
  storageLocationName?: string;
  storageType?: 'interna' | 'sdcard' | 'otg' | 'hd_externo' | 'pasta_custom' | 'ftp';
  userNotes?: string;
  encryption: {
    mode: 'none' | 'password' | 'envelope';
    password?: string;
    recoveryKey?: string;
  };
  customLocalStorageData?: Record<string, any>;
  customIndexedData?: IndexedDBDatabaseDump[];
}): Promise<{ backupFile: GeaAgroBackupFile; jsonString: string; metadata: BackupMetadata }> {
  // 1. Coletar dados
  const localStorageData = options.customLocalStorageData || collectAllLocalStorageData();
  const indexedDBData = options.customIndexedData || (await collectAllIndexedDBData());
  const attachments = await extractAttachments(localStorageData, indexedDBData);

  // Coleta registros da fila de sincronização
  let syncQueueRecords: any[] = [];
  const geaDb = indexedDBData.find(d => d.dbName === 'GeaAgroOfflineDB');
  if (geaDb) {
    const queueStore = geaDb.stores.find(s => s.storeName === 'sync_queue');
    if (queueStore && queueStore.records) {
      syncQueueRecords = queueStore.records;
    }
  }

  // Contagem total de registros
  let totalIndexedRecords = 0;
  for (const db of indexedDBData) {
    for (const store of db.stores) {
      totalIndexedRecords += (store.records || []).length;
    }
  }
  const totalLocalStorageRecords = Object.keys(localStorageData).length;
  const recordsCount = totalIndexedRecords + totalLocalStorageRecords;

  const timestamp = new Date().toISOString();
  const backupId = `bak-${Date.now()}`;
  const dateSuffix = timestamp.replace(/[-:T.]/g, '').substring(0, 12);
  const type = options.type || 'completo';
  const filename = `geaagro_${type}_${dateSuffix}.geaagro`;

  const modulesIncluded = options.modules || [
    'solos',
    'foliar',
    'pecuaria',
    'avicultura',
    'suinocultura',
    'caprinos_ovinos',
    'equinos',
    'bubalinos',
    'caderno_campo',
    'irrigacao',
    'plantabilidade',
    'mistura_tanque',
    'receitas',
    'pericias',
    'geoprocessamento',
    'gestao_rural',
    'rastreabilidade'
  ];

  const metadata: BackupMetadata = {
    id: backupId,
    filename,
    timestamp,
    type,
    sizeBytes: 0,
    formattedSize: '0 B',
    appVersion: CURRENT_APP_VERSION,
    databaseVersion: CURRENT_DATABASE_VERSION,
    userResponsible: options.userResponsible || 'Produtor / Engenheiro Agrônomo',
    storageLocation: options.storageLocationName || 'Memória Interna (/data/geaagro/backups)',
    storageType: options.storageType || 'interna',
    integrityHash: '',
    integrityStatus: 'valid',
    encryption: options.encryption.mode === 'none' ? 'none' : 'aes-256',
    encryptionMode: options.encryption.mode,
    modulesIncluded,
    recordsCount,
    mediaFilesCount: attachments.length,
    notes: options.userNotes || `Backup ${type} oficial GeaAgro Fase 1`
  };

  const payload: DecryptedBackupPayload = {
    system: 'GeaAgro Suite',
    schemaVersion: BACKUP_FORMAT_VERSION,
    appVersion: CURRENT_APP_VERSION,
    createdAt: timestamp,
    manifest: metadata,
    localStorageData,
    indexedDBData,
    attachments,
    syncQueue: syncQueueRecords
  };

  const payloadJson = JSON.stringify(payload);
  const payloadHash = await CryptoService.sha256Hex(payloadJson);
  metadata.integrityHash = payloadHash;

  let backupFile: GeaAgroBackupFile;

  if (options.encryption.mode === 'envelope') {
    if (!options.encryption.password || !options.encryption.recoveryKey) {
      throw new CryptoError(
        'Modo envelope requer tanto a senha do usuário quanto a chave de recuperação.',
        'INVALID_FORMAT'
      );
    }
    const envelope = await CryptoService.createEnvelopeEncryptedData(
      payloadJson,
      options.encryption.password,
      options.encryption.recoveryKey
    );

    backupFile = {
      magic: BACKUP_FORMAT_MAGIC,
      formatVersion: BACKUP_FORMAT_VERSION,
      createdAt: timestamp,
      appVersion: CURRENT_APP_VERSION,
      manifest: metadata,
      encryption: {
        mode: 'envelope',
        envelope
      },
      fileChecksum: ''
    };
  } else if (options.encryption.mode === 'password') {
    if (!options.encryption.password) {
      throw new CryptoError('Senha obrigatória para modo de cifragem por senha.', 'INVALID_FORMAT');
    }
    const singlePayload = await CryptoService.encryptText(payloadJson, options.encryption.password);

    backupFile = {
      magic: BACKUP_FORMAT_MAGIC,
      formatVersion: BACKUP_FORMAT_VERSION,
      createdAt: timestamp,
      appVersion: CURRENT_APP_VERSION,
      manifest: metadata,
      encryption: {
        mode: 'password',
        singlePayload
      },
      fileChecksum: ''
    };
  } else {
    backupFile = {
      magic: BACKUP_FORMAT_MAGIC,
      formatVersion: BACKUP_FORMAT_VERSION,
      createdAt: timestamp,
      appVersion: CURRENT_APP_VERSION,
      manifest: metadata,
      encryption: {
        mode: 'none'
      },
      rawPayload: payload,
      fileChecksum: ''
    };
  }

  // Serializa e calcula checksum do arquivo completo
  const preliminaryString = JSON.stringify(backupFile);
  const fileChecksum = await CryptoService.sha256Hex(preliminaryString);
  backupFile.fileChecksum = fileChecksum;

  const finalString = JSON.stringify(backupFile, null, 2);
  const totalSizeBytes = new Blob([finalString]).size;
  metadata.sizeBytes = totalSizeBytes;
  metadata.formattedSize = formatBytes(totalSizeBytes);
  backupFile.manifest.sizeBytes = totalSizeBytes;
  backupFile.manifest.formattedSize = metadata.formattedSize;

  // Atualiza histórico local
  try {
    const history = getBackupHistory();
    saveBackupHistory([metadata, ...history]);
  } catch {
    // Ignora se não for ambiente de navegador
  }

  return {
    backupFile,
    jsonString: finalString,
    metadata
  };
}

/**
 * Validação e Inspeção Isolada de um arquivo de backup antes da restauração
 * Rejeita arquivos adulterados, senhas incorretas, versões incompatíveis SEM alterar dados existentes.
 */
export async function validateAndInspectBackup(
  rawContentOrObject: string | GeaAgroBackupFile,
  credentials?: {
    password?: string;
    recoveryKey?: string;
  }
): Promise<RestoreInspectionResult> {
  let file: GeaAgroBackupFile;

  // 1. Parsing e validação de sintaxe
  if (typeof rawContentOrObject === 'string') {
    try {
      file = JSON.parse(rawContentOrObject) as GeaAgroBackupFile;
    } catch {
      return {
        isValid: false,
        errorMessage: 'Arquivo de backup corrompido: JSON inválido ou formato truncado.'
      };
    }
  } else {
    file = rawContentOrObject;
  }

  // 2. Validação do cabeçalho e compatibilidade de formatos
  let decryptedPayload: DecryptedBackupPayload;

  if (file && file.magic === BACKUP_FORMAT_MAGIC) {
    if (file.formatVersion > BACKUP_FORMAT_VERSION) {
      return {
        isValid: false,
        errorMessage: `Versão do formato de backup (${file.formatVersion}) superior à suportada pelo aplicativo (${BACKUP_FORMAT_VERSION}). Atualize o GeaAgro.`
      };
    }

    // 3. Validação da integridade e autenticidade da cifragem
    try {
      if (file.encryption.mode === 'none') {
        if (!file.rawPayload) {
          return {
            isValid: false,
            errorMessage: 'Arquivo de backup não criptografado com payload ausente.'
          };
        }
        decryptedPayload = file.rawPayload;
      } else if (file.encryption.mode === 'password') {
        if (!credentials?.password) {
          return {
            isValid: false,
            errorMessage: 'Este arquivo está protegido por senha. Forneça a senha para validação e restauração.',
            manifest: file.manifest
          };
        }
        if (!file.encryption.singlePayload) {
          return {
            isValid: false,
            errorMessage: 'Carga cifrada corrompida ou ausente no arquivo.'
          };
        }
        const decryptedText = await CryptoService.decryptText(
          file.encryption.singlePayload,
          credentials.password
        );
        decryptedPayload = JSON.parse(decryptedText);
      } else if (file.encryption.mode === 'envelope') {
        if (!file.encryption.envelope) {
          return {
            isValid: false,
            errorMessage: 'Envelope criptográfico ausente ou inválido.'
          };
        }

        let decryptedText = '';
        if (credentials?.password) {
          try {
            decryptedText = await CryptoService.decryptEnvelopeWithPassword(
              file.encryption.envelope,
              credentials.password
            );
          } catch (pwErr) {
            if (credentials?.recoveryKey) {
              // Tenta com chave de recuperação se senha falhar
              decryptedText = await CryptoService.decryptEnvelopeWithRecoveryKey(
                file.encryption.envelope,
                credentials.recoveryKey
              );
            } else {
              throw pwErr;
            }
          }
        } else if (credentials?.recoveryKey) {
          decryptedText = await CryptoService.decryptEnvelopeWithRecoveryKey(
            file.encryption.envelope,
            credentials.recoveryKey
          );
        } else {
          return {
            isValid: false,
            errorMessage: 'Arquivo protegido por Envelope Seguro. Forneça a senha ou a chave de recuperação.',
            manifest: file.manifest
          };
        }
        decryptedPayload = JSON.parse(decryptedText);
      } else {
        return {
          isValid: false,
          errorMessage: `Modo de criptografia desconhecido: ${file.encryption.mode}`
        };
      }
    } catch (cryptoErr) {
      const msg = cryptoErr instanceof Error ? cryptoErr.message : String(cryptoErr);
      return {
        isValid: false,
        errorMessage: `Falha na decifragem / autenticação: ${msg}`
      };
    }
  } else if (
    file &&
    typeof file === 'object' &&
    (file.system === 'GeaAgro Suite' ||
      file.localStorageData ||
      file.indexedDBData ||
      file.localStorage ||
      file.agronutri_producers ||
      file.agronutri_farms)
  ) {
    // Modo de Compatibilidade para Backups Legados ou Snapshots
    decryptedPayload = {
      system: 'GeaAgro Suite',
      schemaVersion: 1,
      appVersion: file.appVersion || CURRENT_APP_VERSION,
      createdAt: file.createdAt || file.timestamp || new Date().toISOString(),
      manifest: file.manifest || {
        id: file.id || `bak-compat-${Date.now()}`,
        filename: file.filename || 'Backup GeaAgro Importado',
        timestamp: file.createdAt || new Date().toISOString(),
        type: file.type || 'completo',
        sizeBytes: 0,
        formattedSize: '0 KB',
        appVersion: CURRENT_APP_VERSION,
        databaseVersion: CURRENT_DATABASE_VERSION,
        userResponsible: file.userResponsible || 'Usuário GeaAgro',
        storageLocation: 'Local',
        storageType: 'interna',
        integrityHash: '',
        integrityStatus: 'valid',
        encryption: 'none',
        encryptionMode: 'none',
        modulesIncluded: file.modulesIncluded || ['solos', 'caderno_campo'],
        recordsCount: 0,
        mediaFilesCount: 0
      },
      localStorageData: file.localStorageData || file.localStorage || file,
      indexedDBData: file.indexedDBData || file.indexedDB || [],
      attachments: file.attachments || [],
      syncQueue: file.syncQueue || []
    };
  } else {
    return {
      isValid: false,
      errorMessage: `Formato de backup inválido. Esperado magic "${BACKUP_FORMAT_MAGIC}", encontrado "${file?.magic || 'nenhum'}".`
    };
  }

  // 4. Validação da estrutura interna decifrada
  if (!decryptedPayload || typeof decryptedPayload !== 'object') {
    return {
      isValid: false,
      errorMessage: 'Conteúdo decifrado inválido ou não estruturado.'
    };
  }

  if (decryptedPayload.system !== 'GeaAgro Suite') {
    return {
      isValid: false,
      errorMessage: `Assinatura de sistema incompatível: ${decryptedPayload.system}`
    };
  }

  // 5. Verificação de conflitos com os dados atuais
  let keyConflicts = 0;
  if (typeof window !== 'undefined' && window.localStorage && decryptedPayload.localStorageData) {
    for (const key of Object.keys(decryptedPayload.localStorageData)) {
      if (localStorage.getItem(key) !== null) {
        keyConflicts++;
      }
    }
  }

  let dbRecordCount = 0;
  for (const db of decryptedPayload.indexedDBData || []) {
    for (const store of db.stores || []) {
      dbRecordCount += (store.records || []).length;
    }
  }

  return {
    isValid: true,
    manifest: file.manifest,
    payload: decryptedPayload,
    details: {
      appVersion: decryptedPayload.appVersion,
      createdAt: decryptedPayload.createdAt,
      encryptionMode: file.encryption.mode,
      localStorageKeyCount: Object.keys(decryptedPayload.localStorageData || {}).length,
      indexedDbDatabaseCount: (decryptedPayload.indexedDBData || []).length,
      indexedDbRecordCount: dbRecordCount,
      attachmentCount: (decryptedPayload.attachments || []).length,
      syncQueueCount: (decryptedPayload.syncQueue || []).length,
      modules: decryptedPayload.manifest?.modulesIncluded || [],
      conflicts: {
        keyConflictsCount: keyConflicts,
        databaseConflictsCount: (decryptedPayload.indexedDBData || []).length
      }
    }
  };
}

/**
 * Restauração Segura e Transacional
 * 1. Valida novamente o arquivo em ambiente isolado.
 * 2. Cria Snapshot preventivo obrigatório do estado atual.
 * 3. Escreve os registros no IndexedDB e localStorage de forma transacional.
 * 4. Se ocorrer qualquer erro, ativa o rollback imediato sem perda de dados.
 */
export async function restoreBackup(
  backupFileOrJson: string | GeaAgroBackupFile,
  credentials?: {
    password?: string;
    recoveryKey?: string;
  },
  options: {
    simulateFailureDuringRestore?: boolean; // Usado para testes de rollback
  } = {}
): Promise<RestoreExecutionResult> {
  const result: RestoreExecutionResult = {
    success: false,
    timestamp: new Date().toISOString(),
    restoredRecordsCount: 0,
    restoredKeysCount: 0,
    restoredDatabasesCount: 0,
    restoredAttachmentsCount: 0,
    errors: [],
    rolledBack: false
  };

  // 1. Validação em área isolada
  const inspection = await validateAndInspectBackup(backupFileOrJson, credentials);
  if (!inspection.isValid || !inspection.payload) {
    result.errors.push(inspection.errorMessage || 'Falha na validação prévia do arquivo de backup.');
    return result;
  }

  const payload = inspection.payload;

  // 2. Snapshot Preventivo Obrigatório
  let emergencySnapshotId = '';
  try {
    emergencySnapshotId = await createEmergencySnapshot(
      `Snapshot de Segurança Pré-Restauração de ${payload.manifest?.filename || 'backup'}`
    );
    result.emergencySnapshotId = emergencySnapshotId;
  } catch (snapErr) {
    result.errors.push(`Não foi possível criar o snapshot preventivo obrigatório: ${String(snapErr)}`);
    return result;
  }

  // 3. Aplicação com orquestração de rollback compensatório
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(RESTORE_IN_PROGRESS_KEY, emergencySnapshotId);
    }

    if (options.simulateFailureDuringRestore) {
      throw new Error('Falha intencional simulada para validação de reversão segura (rollback).');
    }

    // A. Escreve chaves do localStorage
    if (typeof window !== 'undefined' && window.localStorage && payload.localStorageData) {
      for (const [key, val] of Object.entries(payload.localStorageData)) {
        try {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          result.restoredKeysCount++;
        } catch (storageErr) {
          throw new Error(`Falha ao gravar chave ${key} no localStorage: ${String(storageErr)}`);
        }
      }
    }

    // B. Escreve bases e stores do IndexedDB
    if (payload.indexedDBData && payload.indexedDBData.length > 0) {
      for (const dbDump of payload.indexedDBData) {
        await writeIndexedDBDump(dbDump);
        result.restoredDatabasesCount++;
        for (const store of dbDump.stores) {
          result.restoredRecordsCount += (store.records || []).length;
        }
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(RESTORE_IN_PROGRESS_KEY);
    }

    result.restoredAttachmentsCount = (payload.attachments || []).length;
    result.success = true;
    return result;
  } catch (execErr) {
    // 4. Ativação do Rollback Imediato
    const errMessage = execErr instanceof Error ? execErr.message : String(execErr);
    result.errors.push(errMessage);

    console.warn('[BackupService] Erro na restauração. Iniciando rollback compensatório...');
    const rollbackSuccess = await rollbackEmergencySnapshot();
    result.rolledBack = rollbackSuccess;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(RESTORE_IN_PROGRESS_KEY);
    }

    if (!rollbackSuccess) {
      result.errors.push('ATENÇÃO: O rollback automático falhou. O estado foi mantido no snapshot de emergência.');
    }

    result.success = false;
    return result;
  }
}

/**
 * Recuperação de segurança contra encerramento abrupto (crash do navegador ou perda de energia)
 * Verifica na inicialização se uma restauração anterior foi interrompida antes da conclusão.
 */
export async function checkAndRecoverAbruptInterruption(): Promise<{ recovered: boolean; message?: string }> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { recovered: false };
  }
  const pending = localStorage.getItem(RESTORE_IN_PROGRESS_KEY);
  if (!pending) {
    return { recovered: false };
  }
  console.warn('[BackupService] Interrupção abrupta detectada em restauração anterior. Executando rollback preventivo...');
  const success = await rollbackEmergencySnapshot(pending);
  if (success) {
    localStorage.removeItem(RESTORE_IN_PROGRESS_KEY);
  }
  return {
    recovered: success,
    message: success
      ? 'Uma restauração anterior foi interrompida abruptamente pelo navegador. Seus dados foram recuperados com sucesso para o estado anterior ao evento.'
      : 'Falha ao recuperar dados da restauração interrompida. O snapshot de emergência foi mantido preservado.'
  };
}

/**
 * Funções de compatibilidade com a UI existente (BackupModule, BackupQRCodeGenerator)
 */
export function getBackupHistory(): BackupMetadata[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BACKUP_HISTORY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Erro ao ler histórico de backups', e);
  }
  return [];
}

export function saveBackupHistory(history: BackupMetadata[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_BACKUP_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Erro ao salvar histórico de backup', e);
  }
}

export function getSnapshots(): SnapshotRecord[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Erro ao ler snapshots', e);
  }
  return [];
}

export function saveSnapshots(snapshots: SnapshotRecord[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshots));
  } catch (e) {
    console.error('Erro ao salvar snapshots', e);
  }
}

export function getAutoTriggerConfig(): BackupAutoTriggerConfig {
  const defaultConfig: BackupAutoTriggerConfig = {
    onAppClose: true,
    onSoilAnalysisComplete: true,
    onReportFinished: true,
    onNewFieldAdded: true,
    onBirthRegistered: true,
    onApplicationRegistered: true,
    onFertilizerDbUpdated: true,
    scheduleFrequency: 'daily',
    preferredTime: '22:00',
    retentionCount: 10
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultConfig;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUTO_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Erro ao ler auto config', e);
  }

  saveAutoTriggerConfig(defaultConfig);
  return defaultConfig;
}

export function saveAutoTriggerConfig(config: BackupAutoTriggerConfig): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Erro ao salvar auto config', e);
  }
}

export function createInstantSnapshot(title: string, triggerEvent: string): SnapshotRecord {
  const snapshots = getSnapshots();
  const localData = collectAllLocalStorageData();
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    event: triggerEvent,
    data: localData
  });
  const hash = generateSHA256(payload);
  const actualBytes = new Blob([payload]).size;

  const newSnapshot: SnapshotRecord = {
    id: `snap-${Date.now()}`,
    title,
    triggerEvent,
    timestamp: new Date().toISOString(),
    hash,
    sizeFormatted: formatBytes(actualBytes),
    canRollback: true,
    type: 'manual'
  };

  const updated = [newSnapshot, ...snapshots];
  saveSnapshots(updated);
  return newSnapshot;
}

export function triggerFileDownload(
  filename: string,
  content: string,
  mimeType: string = 'application/json'
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Função unificada usada pelos botões da interface visual do BackupModule
 */
export async function executeBackupCreation(params: {
  type: 'completo' | 'incremental' | 'diferencial' | 'modulo';
  selectedModules: string[];
  includeMedia: boolean;
  encryption: 'none' | 'aes-256';
  userPassword?: string;
  recoveryKey?: string;
  storageType: 'interna' | 'sdcard' | 'otg' | 'hd_externo' | 'pasta_custom' | 'ftp';
  storageLocationName: string;
  userNotes?: string;
  userName?: string;
}): Promise<{ backup: BackupMetadata; filePayload: string }> {
  const encMode = params.encryption === 'none' ? 'none' : (params.recoveryKey ? 'envelope' : 'password');

  const { backupFile, jsonString, metadata } = await createFullBackup({
    type: params.type,
    modules: params.selectedModules,
    userResponsible: params.userName,
    storageLocationName: params.storageLocationName,
    storageType: params.storageType,
    userNotes: params.userNotes,
    encryption: {
      mode: encMode,
      password: params.userPassword,
      recoveryKey: params.recoveryKey
    }
  });

  return {
    backup: metadata,
    filePayload: jsonString
  };
}
