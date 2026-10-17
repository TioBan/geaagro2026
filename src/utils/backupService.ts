/**
 * GeaAgro Backup Service (Compatibilidade com UI e Reexportação da Engine Segura da Fase 1)
 * 
 * Reexporta todas as interfaces, utilitários e métodos da engine corporativa em src/services/backupService.ts
 * e mantém total compatibilidade com BackupModule e BackupQRCodeGenerator.
 */

export * from '../services/backupService';

import {
  BackupMetadata,
  collectAllLocalStorageData,
  formatBytes,
  generateSHA256,
  getBackupHistory,
  saveBackupHistory,
  CURRENT_APP_VERSION,
  CURRENT_DATABASE_VERSION,
  BACKUP_FORMAT_MAGIC,
  BACKUP_FORMAT_VERSION
} from '../services/backupService';

/**
 * Função síncrona mantida para compatibilidade direta com a UI síncrona do BackupModule
 * Agora corrigida para incluir TODAS as chaves de dados do usuário (agronutri_*, geaagro_*, gea_*, caprine_*, poultry_*, nema_*, etc.),
 * e não apenas as que começavam com "geaagro_".
 */
export function executeBackupCreation(params: {
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
}): { backup: BackupMetadata; filePayload: string } {
  // Coletar exaustivamente todas as chaves de dados do usuário (sem se limitar a geaagro_)
  const appDataDump = collectAllLocalStorageData();

  // Contagem real de anexos / base64 nos dados do usuário
  let realMediaCount = 0;
  for (const val of Object.values(appDataDump)) {
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    if (str.includes('data:image/') || str.includes('data:application/pdf') || str.includes('base64,')) {
      realMediaCount++;
    }
  }

  const payloadObject = {
    magic: BACKUP_FORMAT_MAGIC,
    version: BACKUP_FORMAT_VERSION,
    system: 'GeaAgro Suite',
    appVersion: CURRENT_APP_VERSION,
    dbVersion: CURRENT_DATABASE_VERSION,
    createdAt: new Date().toISOString(),
    backupType: params.type,
    modules: params.selectedModules,
    mediaIncluded: params.includeMedia,
    encryption: params.encryption,
    recoveryKeyIncluded: Boolean(params.recoveryKey),
    data: appDataDump
  };

  const payloadString = JSON.stringify(payloadObject, null, 2);
  const sha256Hash = generateSHA256(payloadString + (params.userPassword || '') + (params.recoveryKey || ''));
  const sizeBytes = new Blob([payloadString]).size;
  const formattedSize = formatBytes(sizeBytes);
  const timestamp = new Date().toISOString();
  const dateSuffix = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 12);
  const filename = `geaagro_${params.type}_${dateSuffix}.geaagro`;

  const newBackup: BackupMetadata = {
    id: `bak-${Date.now()}`,
    filename,
    timestamp,
    type: params.type,
    sizeBytes,
    formattedSize,
    appVersion: CURRENT_APP_VERSION,
    databaseVersion: CURRENT_DATABASE_VERSION,
    userResponsible: params.userName || 'Produtor / Engenheiro Agrônomo',
    storageLocation: params.storageLocationName,
    storageType: params.storageType,
    integrityHash: sha256Hash,
    integrityStatus: 'valid',
    encryption: params.encryption,
    encryptionMode: params.encryption === 'none' ? 'none' : (params.recoveryKey ? 'envelope' : 'password'),
    modulesIncluded: params.selectedModules,
    recordsCount: Object.keys(appDataDump).length,
    mediaFilesCount: realMediaCount,
    notes: params.userNotes || `Backup ${params.type} realizado via interface do sistema`
  };

  const history = getBackupHistory();
  saveBackupHistory([newBackup, ...history]);

  return {
    backup: newBackup,
    filePayload: payloadString
  };
}
