import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  createFullBackup,
  validateAndInspectBackup,
  restoreBackup,
  createEmergencySnapshot,
  rollbackEmergencySnapshot,
  collectAllLocalStorageData,
  collectAllIndexedDBData,
  writeIndexedDBDump,
  GeaAgroBackupFile,
  BACKUP_FORMAT_MAGIC,
  BACKUP_FORMAT_VERSION,
  EMERGENCY_ROLLBACK_KEY
} from '../services/backupService';
import { CryptoService, CryptoError } from '../services/cryptoService';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  const memStore = new MemoryStorage();
  (globalThis as any).localStorage = memStore;
  if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = globalThis;
  }
  (globalThis as any).window.localStorage = memStore;
}

describe('GeaAgro Backup and Restore Service — Fase 1 (Etapa B)', () => {
  // Helper para simular dados sintéticos representativos do GeaAgro
  const syntheticLocalStorageData = {
    agronutri_farms: [
      { id: 'farm-001', name: 'Fazenda Santa Tereza', totalArea: 1250, city: 'Rio Verde - GO' },
      { id: 'farm-002', name: 'Fazenda Boa Esperança', totalArea: 840, city: 'Jataí - GO' }
    ],
    agronutri_producers: [
      { id: 'prod-001', name: 'Dr. Lucas Mendes', cpfCnpj: '123.456.789-00', farmId: 'farm-001' }
    ],
    agronutri_soil_samples: [
      {
        id: 'sample-soil-01',
        farmId: 'farm-001',
        field: 'Talhão 04 - Sede',
        ph: 6.2,
        mo: 3.4,
        p: 18.5,
        k: 145,
        ca: 4.2,
        mg: 1.8,
        al: 0.0,
        hAl: 2.4,
        vPercent: 71.4,
        date: '2026-09-15'
      }
    ],
    geaagro_traceability_photos: [
      {
        id: 'photo-001',
        lotId: 'lot-soja-2026-a',
        dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
      }
    ],
    gea_nutrition_animal_profiles: [
      { id: 'profile-01', category: 'Novilhos Nelore Confinados', targetGainKgDay: 1.45 }
    ]
  };

  const syntheticIndexedDBData = [
    {
      dbName: 'GeaAgroOfflineDB',
      version: 4,
      stores: [
        {
          storeName: 'animals',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [],
          records: [
            { id: 'anim-101', earTag: 'BR-8921', breed: 'Nelore', weightKg: 460, status: 'Ativo' },
            { id: 'anim-102', earTag: 'BR-8922', breed: 'Angus', weightKg: 510, status: 'Ativo' }
          ]
        },
        {
          storeName: 'paddocks',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [],
          records: [
            { id: 'pad-01', name: 'Pasto da Represa', areaHa: 45, forageSpecies: 'Brachiaria brizantha' }
          ]
        },
        {
          storeName: 'sync_queue',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [],
          records: [
            {
              id: 'sync-001',
              table: 'animals',
              action: 'insert',
              data: { id: 'anim-101' },
              timestamp: Date.now(),
              status: 'pending'
            }
          ]
        }
      ]
    }
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('1. Geração de backup completo com dados sintéticos representativos (IndexedDB, localStorage, anexos e relacionamentos)', async () => {
    const password = 'SenhaSuperSeguraAgro2026!';
    const recovery = CryptoService.generateRecoveryKey();

    const { backupFile, jsonString, metadata } = await createFullBackup({
      type: 'completo',
      userResponsible: 'Lucas Mendes',
      customLocalStorageData: syntheticLocalStorageData,
      customIndexedData: syntheticIndexedDBData,
      encryption: {
        mode: 'envelope',
        password,
        recoveryKey: recovery.formattedKey
      }
    });

    expect(backupFile.magic).toBe(BACKUP_FORMAT_MAGIC);
    expect(backupFile.formatVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(backupFile.encryption.mode).toBe('envelope');
    expect(backupFile.encryption.envelope).toBeDefined();
    expect(backupFile.manifest.recordsCount).toBeGreaterThan(0);
    expect(backupFile.manifest.mediaFilesCount).toBe(1); // 1 anexo identificado na imagem
    expect(backupFile.fileChecksum).toBeDefined();
    expect(jsonString.length).toBeGreaterThan(500);
    expect(metadata.integrityStatus).toBe('valid');
  });

  it('2. Decifração e restauração completa usando a senha correta', async () => {
    const password = 'SenhaCorreta123#';
    const recovery = CryptoService.generateRecoveryKey();

    // 1. Cria o backup
    const { jsonString } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: syntheticLocalStorageData,
      customIndexedData: syntheticIndexedDBData,
      encryption: {
        mode: 'envelope',
        password,
        recoveryKey: recovery.formattedKey
      }
    });

    // 2. Valida e inspeciona em área isolada
    const inspection = await validateAndInspectBackup(jsonString, { password });
    expect(inspection.isValid).toBe(true);
    expect(inspection.details).toBeDefined();
    expect(inspection.details?.localStorageKeyCount).toBe(Object.keys(syntheticLocalStorageData).length);
    expect(inspection.details?.indexedDbDatabaseCount).toBe(1);
    expect(inspection.details?.indexedDbRecordCount).toBe(4); // 2 animals + 1 paddock + 1 sync_queue record

    // 3. Executa a restauração completa
    const restoreResult = await restoreBackup(jsonString, { password });
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.rolledBack).toBe(false);
    expect(restoreResult.errors.length).toBe(0);

    // 4. Verifica se os dados foram persistidos no localStorage
    const savedFarms = JSON.parse(localStorage.getItem('agronutri_farms') || '[]');
    expect(savedFarms.length).toBe(2);
    expect(savedFarms[0].name).toBe('Fazenda Santa Tereza');

    const savedSoil = JSON.parse(localStorage.getItem('agronutri_soil_samples') || '[]');
    expect(savedSoil[0].ph).toBe(6.2);
  });

  it('3. Decifração e restauração completa usando a chave de recuperação (Recovery Key)', async () => {
    const password = 'SenhaQueOProdutorEsqueceu!';
    const recovery = CryptoService.generateRecoveryKey();

    const { jsonString } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: syntheticLocalStorageData,
      customIndexedData: syntheticIndexedDBData,
      encryption: {
        mode: 'envelope',
        password,
        recoveryKey: recovery.formattedKey
      }
    });

    // Usuário fornece chave de recuperação em vez de senha
    const inspection = await validateAndInspectBackup(jsonString, {
      recoveryKey: recovery.formattedKey
    });
    expect(inspection.isValid).toBe(true);
    expect(inspection.details?.attachmentCount).toBe(1);

    const restoreResult = await restoreBackup(jsonString, {
      recoveryKey: recovery.formattedKey
    });
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.restoredKeysCount).toBeGreaterThan(0);

    const savedProducers = JSON.parse(localStorage.getItem('agronutri_producers') || '[]');
    expect(savedProducers[0].name).toBe('Dr. Lucas Mendes');
  });

  it('4. Rejeição de arquivo adulterado ou corrompido sem tocar nos dados existentes', async () => {
    // Popula estado pré-existente
    localStorage.setItem('agronutri_pre_existing', JSON.stringify({ safe: true, value: 999 }));

    const password = 'SenhaValidaSegura1!';
    const { jsonString } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: syntheticLocalStorageData,
      customIndexedData: syntheticIndexedDBData,
      encryption: {
        mode: 'password',
        password
      }
    });

    const parsed: GeaAgroBackupFile = JSON.parse(jsonString);

    // Adulteração 1: Modifica 1 caractere no meio do ciphertext AES-GCM
    const originalCiphertext = parsed.encryption.singlePayload!.ciphertext;
    const tamperedCiphertext = originalCiphertext.substring(0, 10) + (originalCiphertext[10] === 'A' ? 'B' : 'A') + originalCiphertext.substring(11);
    parsed.encryption.singlePayload!.ciphertext = tamperedCiphertext;

    // Tentativa de inspeção do arquivo adulterado
    const inspection = await validateAndInspectBackup(parsed, { password });
    expect(inspection.isValid).toBe(false);
    expect(inspection.errorMessage).toContain('Falha');

    // Tentativa de restauração
    const restoreResult = await restoreBackup(parsed, { password });
    expect(restoreResult.success).toBe(false);
    expect(restoreResult.errors.length).toBeGreaterThan(0);

    // Comprova que os dados existentes NÃO foram apagados nem modificados
    const currentData = JSON.parse(localStorage.getItem('agronutri_pre_existing') || '{}');
    expect(currentData.safe).toBe(true);
    expect(currentData.value).toBe(999);
    expect(localStorage.getItem('agronutri_farms')).toBeNull(); // Não gravou o backup adulterado
  });

  it('5. Rejeição de senha incorreta sem perda ou substituição de dados', async () => {
    localStorage.setItem('agronutri_critical_key', 'dados_originais_intactos');

    const password = 'SenhaCorretaOriginal';
    const { jsonString } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: syntheticLocalStorageData,
      customIndexedData: syntheticIndexedDBData,
      encryption: {
        mode: 'password',
        password
      }
    });

    // Tentativa com senha errada
    const inspection = await validateAndInspectBackup(jsonString, { password: 'SenhaTotalmenteErrada!' });
    expect(inspection.isValid).toBe(false);
    expect(inspection.errorMessage).toContain('Falha na decifragem');

    const restoreResult = await restoreBackup(jsonString, { password: 'SenhaTotalmenteErrada!' });
    expect(restoreResult.success).toBe(false);

    // Verifica que os dados originais permanecem intactos
    expect(localStorage.getItem('agronutri_critical_key')).toBe('dados_originais_intactos');
    expect(localStorage.getItem('agronutri_soil_samples')).toBeNull();
  });

  it('6. Simulação de erro durante a restauração para comprovar o cancelamento seguro e rollback', async () => {
    // Estado inicial antes da tentativa
    localStorage.setItem('agronutri_before_restore', 'estado_anterior_protegido');

    const password = 'SenhaParaRollbackTest';
    const { jsonString } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: syntheticLocalStorageData,
      customIndexedData: syntheticIndexedDBData,
      encryption: {
        mode: 'password',
        password
      }
    });

    // Executa restauração com falha simulada no meio do processo
    const restoreResult = await restoreBackup(jsonString, { password }, {
      simulateFailureDuringRestore: true
    });

    expect(restoreResult.success).toBe(false);
    expect(restoreResult.rolledBack).toBe(true);
    expect(restoreResult.errors[0]).toContain('Falha intencional simulada');

    // Confirma que o rollback restaurou o estado inicial
    expect(localStorage.getItem('agronutri_before_restore')).toBe('estado_anterior_protegido');
  });

  it('7. Verificação de preservação dos dados existentes por Snapshot Preventivo pré-restauração', async () => {
    localStorage.setItem('agronutri_farm_pre', 'Fazenda Anterior');

    const snapId = await createEmergencySnapshot('Snapshot de Teste Unitário');
    expect(snapId).toBeDefined();

    const storedSnap = localStorage.getItem(EMERGENCY_ROLLBACK_KEY);
    expect(storedSnap).not.toBeNull();

    const parsedSnap = JSON.parse(storedSnap!);
    expect(parsedSnap.localStorage.agronutri_farm_pre).toBe('Fazenda Anterior');

    // Modifica o estado
    localStorage.setItem('agronutri_farm_pre', 'Fazenda Alterada');
    expect(localStorage.getItem('agronutri_farm_pre')).toBe('Fazenda Alterada');

    // Executa rollback
    const rollbackSuccess = await rollbackEmergencySnapshot();
    expect(rollbackSuccess).toBe(true);

    // O estado anterior foi restaurado
    expect(localStorage.getItem('agronutri_farm_pre')).toBe('Fazenda Anterior');
  });

  it('8. Rejeição de arquivo com formato/magic corrompido, truncado ou versão incompatível', async () => {
    // Caso A: Arquivo JSON truncado
    const truncatedContent = '{"magic":"GEAAGRO_BACKUP","version":1,"appVersion":';
    const resA = await validateAndInspectBackup(truncatedContent);
    expect(resA.isValid).toBe(false);
    expect(resA.errorMessage).toContain('corrompido');

    // Caso B: Magic inválido
    const invalidMagic = JSON.stringify({ magic: 'OUTRO_SISTEMA_XYZ', formatVersion: 1 });
    const resB = await validateAndInspectBackup(invalidMagic);
    expect(resB.isValid).toBe(false);
    expect(resB.errorMessage).toContain('Formato de backup inválido');

    // Caso C: Versão de formato futura incompatível
    const futureVersion = JSON.stringify({ magic: BACKUP_FORMAT_MAGIC, formatVersion: 999 });
    const resC = await validateAndInspectBackup(futureVersion);
    expect(resC.isValid).toBe(false);
    expect(resC.errorMessage).toContain('superior à suportada');
  });

  it('9. Tratamento seguro de grandes anexos fotográficos e laudos laboratoriais', async () => {
    // Simula múltiplos anexos pesados de imagens/laudos
    const largeAttachmentsData: Record<string, any> = {
      agronutri_pericias_pro_v1: [
        {
          id: 'pericia-01',
          name: 'Laudo Pericial Seca Safra 2026',
          pdfBase64: 'data:application/pdf;base64,' + 'A'.repeat(50000), // ~50KB simulado
          photos: [
            'data:image/jpeg;base64,' + 'B'.repeat(40000),
            'data:image/jpeg;base64,' + 'C'.repeat(40000)
          ]
        }
      ]
    };

    const password = 'SenhaAnexosGrandes123!';
    const { backupFile, jsonString, metadata } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: largeAttachmentsData,
      customIndexedData: [],
      encryption: {
        mode: 'password',
        password
      }
    });

    expect(metadata.mediaFilesCount).toBe(3); // 1 PDF + 2 fotos
    expect(metadata.sizeBytes).toBeGreaterThan(130000);

    const inspection = await validateAndInspectBackup(jsonString, { password });
    expect(inspection.isValid).toBe(true);
    expect(inspection.details?.attachmentCount).toBe(3);

    const restoreResult = await restoreBackup(jsonString, { password });
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.restoredAttachmentsCount).toBe(3);

    const restoredPericia = JSON.parse(localStorage.getItem('agronutri_pericias_pro_v1') || '[]');
    expect(restoredPericia[0].name).toBe('Laudo Pericial Seca Safra 2026');
  });

  it('10. Backup e restauração com dados vazios (zero registros, zero chaves)', async () => {
    const password = 'SenhaVazia123!';
    const { backupFile, jsonString, metadata } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: {},
      customIndexedData: [],
      encryption: {
        mode: 'password',
        password
      }
    });

    expect(metadata.recordsCount).toBe(0);
    expect(metadata.mediaFilesCount).toBe(0);

    const inspection = await validateAndInspectBackup(jsonString, { password });
    expect(inspection.isValid).toBe(true);
    expect(inspection.details?.localStorageKeyCount).toBe(0);
    expect(inspection.details?.indexedDbRecordCount).toBe(0);

    const restoreResult = await restoreBackup(jsonString, { password });
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.restoredKeysCount).toBe(0);
    expect(restoreResult.restoredRecordsCount).toBe(0);
  });

  it('11. Idempotência e integridade em restauração repetida (sem duplicações)', async () => {
    const password = 'SenhaIdempotencia123!';
    const testData = {
      geaagro_farms_v1: [
        { id: 'faz-01', nome: 'Fazenda Santa Maria', areaTotalHa: 1200 },
        { id: 'faz-02', nome: 'Fazenda Esperança', areaTotalHa: 850 }
      ]
    };

    const { jsonString } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: testData,
      customIndexedData: [],
      encryption: {
        mode: 'password',
        password
      }
    });

    // Primeira restauração
    const firstRestore = await restoreBackup(jsonString, { password });
    expect(firstRestore.success).toBe(true);
    const farmsFirst = JSON.parse(localStorage.getItem('geaagro_farms_v1') || '[]');
    expect(farmsFirst).toHaveLength(2);

    // Segunda restauração imediata (deve ser idempotente, sem duplicar registros)
    const secondRestore = await restoreBackup(jsonString, { password });
    expect(secondRestore.success).toBe(true);
    const farmsSecond = JSON.parse(localStorage.getItem('geaagro_farms_v1') || '[]');
    expect(farmsSecond).toHaveLength(2);
    expect(farmsSecond).toEqual(farmsFirst);
  });

  it('12. Comparação exata e integridade relacional entre entidades e anexos', async () => {
    const originalFarms = [
      { id: 'faz-rel-01', name: 'Estância Bela Vista', manager: 'Carlos Eduardo' }
    ];
    const originalPlots = [
      { id: 'tal-01', farmId: 'faz-rel-01', name: 'Talhão 04 - Soja Safra', soilType: 'Latossolo Vermelho' }
    ];
    const originalApplications = [
      {
        id: 'app-01',
        plotId: 'tal-01',
        product: 'Fungicida Triazol + Estrobirulina',
        date: '2026-10-15',
        dosagePerHa: 0.5,
        signaturePng: 'data:image/png;base64,' + 'Z'.repeat(1024)
      }
    ];

    const compositeData = {
      geaagro_farms: originalFarms,
      agronutri_plots: originalPlots,
      geaagro_field_applications: originalApplications
    };

    const password = 'SenhaRelacionamentos123!';
    const { jsonString } = await createFullBackup({
      type: 'completo',
      customLocalStorageData: compositeData,
      customIndexedData: [],
      encryption: {
        mode: 'password',
        password
      }
    });

    // Limpa o ambiente antes de restaurar
    localStorage.clear();

    const restoreResult = await restoreBackup(jsonString, { password });
    expect(restoreResult.success).toBe(true);

    const restoredFarms = JSON.parse(localStorage.getItem('geaagro_farms') || '[]');
    const restoredPlots = JSON.parse(localStorage.getItem('agronutri_plots') || '[]');
    const restoredApps = JSON.parse(localStorage.getItem('geaagro_field_applications') || '[]');

    // Comparação exata de todos os campos e relações
    expect(restoredFarms).toEqual(originalFarms);
    expect(restoredPlots).toEqual(originalPlots);
    expect(restoredApps).toEqual(originalApplications);

    // Valida relação funcional: a aplicação aponta para o talhão, que aponta para a fazenda
    expect(restoredApps[0].plotId).toBe(restoredPlots[0].id);
    expect(restoredPlots[0].farmId).toBe(restoredFarms[0].id);
    expect(restoredApps[0].signaturePng).toBe(originalApplications[0].signaturePng);
  });
});
