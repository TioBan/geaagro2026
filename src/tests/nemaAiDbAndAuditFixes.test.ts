import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  NemaAIDBService,
  NEMA_DB_NAME,
  STORE_NAME,
  NemaAIDiagnosisLog
} from '../utils/nemaAiDb';
import {
  validateAndInspectBackup,
  createFullBackup,
  BACKUP_FORMAT_MAGIC
} from '../services/backupService';
import { TraceabilityPlot } from '../types/traceability';

describe('GeaAgro — Auditoria e Correções da Etapa 1', () => {
  let nemaService: NemaAIDBService;

  beforeEach(async () => {
    nemaService = new NemaAIDBService();
  });

  afterEach(async () => {
    nemaService.close();
    // Cleanup fake-indexeddb
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(NEMA_DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });

  describe('1. NemaAIDBService — Resiliência, Self-Healing e Preservação de Dados', () => {
    it('deve inicializar o banco e realizar operações de escrita e leitura de diagnósticos', async () => {
      const sampleLog: NemaAIDiagnosisLog = {
        id: 'diag-001',
        timestamp: Date.now(),
        domain: 'nematologia',
        prompt: 'Análise de Pratylenchus brachyurus na soja',
        farmName: 'Fazenda Santa Maria',
        producerName: 'João da Silva',
        fieldName: 'Talhão 04',
        areaHa: 45.5,
        cropOrPasture: 'Soja',
        cultivarOrForage: 'TMG 7062',
        soilType: 'Argiloso',
        result: { diagnosis: 'Alerta Alto de Pratylenchus' },
        uploadedFileName: null,
      };

      await nemaService.saveDiagnosis(sampleLog);
      const all = await nemaService.getAllDiagnoses();

      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('diag-001');
      expect(all[0].farmName).toBe('Fazenda Santa Maria');
      expect(all[0].domain).toBe('nematologia');
    });

    it('deve auto-recuperar sem lançar NotFoundError quando o banco já existe na versão 1 SEM a store diagnoses', async () => {
      // 1. Simular o cenário exato da falha do usuário:
      // Um banco NemaAIChatsDB foi criado anteriormente na versão 1 sem nenhuma store
      await new Promise<void>((resolve, reject) => {
        const createBrokenReq = indexedDB.open(NEMA_DB_NAME, 1);
        createBrokenReq.onupgradeneeded = () => {
          // Intencionalmente NÃO cria a store 'diagnoses'
        };
        createBrokenReq.onsuccess = (e: any) => {
          const db = e.target.result;
          expect(db.objectStoreNames.contains(STORE_NAME)).toBe(false);
          db.close();
          resolve();
        };
        createBrokenReq.onerror = () => reject(createBrokenReq.error);
      });

      // 2. Agora o NemaAIDBService entra em ação:
      // Deve detectar que a store 'diagnoses' está ausente na versão 1 e executar
      // a auto-recuperação segura de versão (self-healing)
      const allBefore = await nemaService.getAllDiagnoses();
      expect(allBefore).toEqual([]);

      // 3. Deve permitir gravar e ler dados normalmente no banco recuperado
      const newLog: NemaAIDiagnosisLog = {
        id: 'diag-recovered-01',
        timestamp: Date.now(),
        domain: 'fertilidade',
        prompt: 'Interpretação de CTC e saturação por bases',
        farmName: 'Fazenda Boa Esperança',
        producerName: 'Carlos Miranda',
        fieldName: 'Pivô 01',
        areaHa: 100,
        cropOrPasture: 'Milho Safrinha',
        cultivarOrForage: 'DKB 390',
        soilType: 'Misto',
        result: { status: 'OK' },
        uploadedFileName: null,
      };

      await nemaService.saveDiagnosis(newLog);
      const allAfter = await nemaService.getAllDiagnoses();

      expect(allAfter).toHaveLength(1);
      expect(allAfter[0].id).toBe('diag-recovered-01');
      expect(allAfter[0].prompt).toBe('Interpretação de CTC e saturação por bases');
    });

    it('deve preservar dados de outras stores existentes ao realizar a migração segura', async () => {
      const OTHER_STORE = 'auditoria_preexistente';
      const OTHER_RECORD = { id: 'reg-999', valor: 'dados do produtor intocados', data: '2026-10-19' };

      // 1. Criar banco com outra store e registros pré-existentes na versão 1
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(NEMA_DB_NAME, 1);
        req.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          db.createObjectStore(OTHER_STORE, { keyPath: 'id' });
        };
        req.onsuccess = (e: any) => {
          const db = e.target.result;
          const tx = db.transaction(OTHER_STORE, 'readwrite');
          tx.objectStore(OTHER_STORE).put(OTHER_RECORD);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
        req.onerror = () => reject(req.error);
      });

      // 2. Acionar o nemaService para criar a store 'diagnoses'
      await nemaService.saveDiagnosis({
        id: 'diag-preserve-01',
        timestamp: Date.now(),
        domain: 'geral',
        prompt: 'Teste de coexistência de stores',
        farmName: 'Fazenda Integração',
        producerName: 'Lucas Mendes',
        fieldName: 'Talhão 01',
        areaHa: 20,
        cropOrPasture: 'Algodão',
        cultivarOrForage: 'FM 985',
        soilType: 'Argiloso',
        result: { valid: true },
        uploadedFileName: null
      });

      // 3. Abrir o banco e verificar que AMBAS as stores existem e os dados prévios continuam 100% íntegros
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(NEMA_DB_NAME);
        req.onsuccess = (e: any) => {
          const db = e.target.result;
          expect(db.objectStoreNames.contains(OTHER_STORE)).toBe(true);
          expect(db.objectStoreNames.contains(STORE_NAME)).toBe(true);

          const tx = db.transaction(OTHER_STORE, 'readonly');
          const store = tx.objectStore(OTHER_STORE);
          const getReq = store.get('reg-999');
          getReq.onsuccess = () => {
            expect(getReq.result).toEqual(OTHER_RECORD);
            db.close();
            resolve();
          };
          getReq.onerror = () => reject(getReq.error);
        };
        req.onerror = () => reject(req.error);
      });
    });

    it('deve realizar exclusão pontual e limpeza de histórico de diagnósticos com sucesso', async () => {
      const log1: NemaAIDiagnosisLog = {
        id: 'del-01',
        timestamp: 1000,
        domain: 'pecuaria',
        prompt: 'Avaliação de pastagem',
        farmName: 'Fazenda Modelo',
        producerName: 'José',
        fieldName: 'Piquete 1',
        areaHa: 10,
        cropOrPasture: 'Brachiaria',
        cultivarOrForage: 'Marandu',
        soilType: 'Arenoso',
        result: {},
        uploadedFileName: null
      };

      const log2: NemaAIDiagnosisLog = {
        id: 'del-02',
        timestamp: 2000,
        domain: 'avicultura',
        prompt: 'Taxa de conversão alimentar',
        farmName: 'Granja Esperança',
        producerName: 'Maria',
        fieldName: 'Galpão 01',
        areaHa: 1,
        cropOrPasture: 'N/A',
        cultivarOrForage: 'Cobb 500',
        soilType: 'N/A',
        result: {},
        uploadedFileName: null
      };

      await nemaService.saveDiagnosis(log1);
      await nemaService.saveDiagnosis(log2);

      let all = await nemaService.getAllDiagnoses();
      expect(all).toHaveLength(2);

      // Exclusão pontual
      await nemaService.deleteDiagnosis('del-01');
      all = await nemaService.getAllDiagnoses();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('del-02');

      // Limpeza completa
      await nemaService.clearHistory();
      all = await nemaService.getAllDiagnoses();
      expect(all).toHaveLength(0);
    });
  });

  describe('2. TraceabilityPlot — Validação do Modelo de Dados', () => {
    it('deve validar que um talhão criado possui os campos obrigatórios da entidade e omite plantingDate', () => {
      const validPlot: TraceabilityPlot = {
        id: 'plot-123',
        code: 'TAL-01',
        name: 'Talhão Teste',
        farmId: 'farm-01',
        areaHa: 15.5,
        structureType: 'campo_aberto',
        currentCrop: 'Tomate',
        currentCultivar: 'Carmen',
        irrigationSystem: 'gotejamento',
        soilType: 'Latossolo Vermelho',
        soilTexture: 'medio',
        latitude: -15.789,
        longitude: -47.925,
        croquiData: JSON.stringify([{ lat: -15.789, lng: -47.925 }]),
        active: true
      };

      expect(validPlot.id).toBeDefined();
      expect(validPlot.farmId).toBe('farm-01');
      expect(validPlot.structureType).toBe('campo_aberto');
      expect(validPlot.active).toBe(true);
      // Garantir que plantingDate não faz parte do tipo de talhão
      expect((validPlot as any).plantingDate).toBeUndefined();
    });
  });

  describe('3. BackupService — Validação Segura de Tipos e Compatibilidade de Backups Legados', () => {
    it('deve rejeitar arquivo com formato inválido ou magic incorreto', async () => {
      const invalidBackup = JSON.stringify({
        magic: 'OUTRO_FORMATO_DESCONHECIDO',
        formatVersion: 1
      });

      const result = await validateAndInspectBackup(invalidBackup);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Formato de backup inválido');
    });

    it('deve inspecionar e aceitar backup legítimo sem criptografia', async () => {
      // Mock de LocalStorage
      const mockStorage = new Map<string, string>();
      mockStorage.set('agronutri_producers', JSON.stringify([{ id: 'p1', name: 'Produtor Teste' }]));

      const backup = await createFullBackup({
        encryption: { mode: 'none' },
        userResponsible: 'Auditor Técnico'
      });

      expect(backup.backupFile.magic).toBe(BACKUP_FORMAT_MAGIC);
      expect(backup.backupFile.encryption.mode).toBe('none');

      const inspection = await validateAndInspectBackup(backup.jsonString);
      expect(inspection.isValid).toBe(true);
      expect(inspection.payload).toBeDefined();
      expect(inspection.payload?.system).toBe('GeaAgro Suite');
    });

    it('deve tratar com segurança snapshots e backups legados via compatibilidade', async () => {
      const legacyBackupObj = {
        system: 'GeaAgro Suite',
        appVersion: '4.2.2',
        createdAt: '2026-10-15T12:00:00.000Z',
        localStorageData: {
          agronutri_producers: JSON.stringify([{ id: 'prod-legado', name: 'Produtor Antigo' }]),
          agronutri_farms: JSON.stringify([{ id: 'farm-legado', name: 'Fazenda Antiga' }])
        },
        indexedDBData: []
      };

      const inspection = await validateAndInspectBackup(JSON.stringify(legacyBackupObj));
      expect(inspection.isValid).toBe(true);
      expect(inspection.payload?.system).toBe('GeaAgro Suite');
      expect(inspection.payload?.localStorageData.agronutri_producers).toContain('Produtor Antigo');
    });
  });
});
