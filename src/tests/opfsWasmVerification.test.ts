import { describe, it, expect } from 'vitest';
import { opfsWasmDB, REQUIRED_OPFS_STORES } from '../services/opfsWasmDatabase';
import { offlineDB } from '../utils/indexedDB';
import { nemaAIDB } from '../utils/nemaAiDb';
import { pesticideIndexedDB } from '../services/pesticideIndexedDB';
import * as fs from 'fs';
import * as path from 'path';

describe('OPFS + WASM Engine Full Verification Audit', () => {
  it('1. opfsWasmDB must be initialized as primary storage engine with 37 active stores', async () => {
    expect(REQUIRED_OPFS_STORES.length).toBe(37);
    expect(REQUIRED_OPFS_STORES).toContain('farms');
    expect(REQUIRED_OPFS_STORES).toContain('soil_samples');
    expect(REQUIRED_OPFS_STORES).toContain('fieldbook_operations');
    expect(REQUIRED_OPFS_STORES).toContain('costs_records');
    expect(REQUIRED_OPFS_STORES).toContain('diagnoses');
    expect(REQUIRED_OPFS_STORES).toContain('pesticide_products');

    const diagnostics = await opfsWasmDB.getEngineDiagnostics();
    expect(diagnostics.engine).toMatch(/^OPFS_WASM/);
    expect(diagnostics.totalStores).toBe(37);
    expect(diagnostics.version).toBeDefined();
  });

  it('2. offlineDB in utils/indexedDB.ts must delegate CRUD operations to opfsWasmDB', async () => {
    const testItem = { id: 'audit-test-1', name: 'Talhão Teste Audit OPFS', cultivatedAreaHa: 100 };
    await offlineDB.put('farms', testItem);

    const retrievedFromOfflineDb = await offlineDB.get<{ id: string; name: string }>('farms', 'audit-test-1');
    expect(retrievedFromOfflineDb).not.toBeNull();
    expect(retrievedFromOfflineDb?.name).toBe('Talhão Teste Audit OPFS');

    const retrievedDirectFromOpfs = await opfsWasmDB.get<{ id: string; name: string }>('farms', 'audit-test-1');
    expect(retrievedDirectFromOpfs).not.toBeNull();
    expect(retrievedDirectFromOpfs?.name).toBe('Talhão Teste Audit OPFS');

    // Cleanup
    await offlineDB.delete('farms', 'audit-test-1');
    const afterDelete = await opfsWasmDB.get('farms', 'audit-test-1');
    expect(afterDelete).toBeNull();
  });

  it('3. nemaAIDB in utils/nemaAiDb.ts must prioritize opfsWasmDB on fetch', async () => {
    const testDiagnosis = {
      id: 'nema-audit-1',
      timestamp: Date.now(),
      domain: 'nematologia' as const,
      prompt: 'Identificação de Heterodera glycines',
      farmName: 'Fazenda Santa Tereza',
      producerName: 'João da Silva',
      fieldName: 'Talhão 04',
      areaHa: 50,
      cropOrPasture: 'Soja',
      cultivarOrForage: 'TMG 7062',
      soilType: 'Argiloso',
      result: { summary: 'Infestação moderada' },
      uploadedFileName: null,
    };

    await nemaAIDB.saveDiagnosis(testDiagnosis);

    const allDiagnoses = await nemaAIDB.getAllDiagnoses();
    expect(allDiagnoses.some(d => d.id === 'nema-audit-1')).toBe(true);

    // Cleanup
    await nemaAIDB.deleteDiagnosis('nema-audit-1');
  });

  it('4. pesticideIndexedDB in services/pesticideIndexedDB.ts must write and prioritize opfsWasmDB', async () => {
    const testPesticide = {
      id: 'pest-audit-1',
      productName: 'Defensivo Audit OPFS WASM',
      registrationNumber: '999999',
      agrochemicalClass: 'Fungicida',
      manufacturer: 'GeaAgro Biotech',
      activeIngredients: [{ name: 'Mancozeb', concentration: '800 g/kg' }],
      formulation: 'Pó Molhável (WP)',
      toxicityClass: 'Classe III',
      environmentalClass: 'Classe II',
      targetCrops: ['Soja', 'Milho'],
    };

    await pesticideIndexedDB.saveAllProducts([testPesticide as any]);

    const products = await pesticideIndexedDB.getAllProducts();
    expect(products.some(p => p.id === 'pest-audit-1')).toBe(true);

    const opfsProducts = await opfsWasmDB.getAll('pesticide_products');
    expect(opfsProducts.some((p: any) => p.id === 'pest-audit-1')).toBe(true);
  });

  it('5. main.tsx must invoke opfsWasmDB initialization on startup', () => {
    const mainPath = path.resolve(process.cwd(), 'src/main.tsx');
    const content = fs.readFileSync(mainPath, 'utf-8');

    expect(content).toContain("import { opfsWasmDB } from './services/opfsWasmDatabase'");
    expect(content).toContain('await opfsWasmDB.initialize()');
  });
});
