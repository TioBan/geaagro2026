import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { offlineDB, DB_NAME, DB_VERSION, REQUIRED_OBJECT_STORES } from '../utils/indexedDB';
import fs from 'fs';
import path from 'path';

describe('GeaAgro Cache-First & IndexedDB Offline Persistence Verification', () => {
  const publicSwPath = path.resolve(process.cwd(), 'public/sw.js');
  const distDir = path.resolve(process.cwd(), 'dist');
  const swPath = path.join(distDir, 'sw.js');

  it('1. public/sw.js must implement Cache-First strategy for all static assets', () => {
    expect(fs.existsSync(publicSwPath)).toBe(true);
    const swContent = fs.readFileSync(publicSwPath, 'utf-8');

    // Classification of static assets
    expect(swContent).toContain('isStaticAsset');
    expect(swContent).toContain("url.pathname.startsWith('/assets/')");

    // Cache-First lookup and clone on miss
    expect(swContent).toContain('caches.match(event.request)');
    expect(swContent).toContain('currentCache.put(event.request, responseClone)');

    // Fallbacks
    expect(swContent).toContain('OfflineModuleFallback');
    expect(swContent).toContain('OfflineModuleNotCachedError');
    expect(swContent).toContain('__offlineUnavailable = true');
    expect(swContent).toContain("event.request.mode === 'navigate'");
    expect(swContent).toContain("caches.match('/index.html')");
  });

  it('2. GeaAgroOfflineDB must be upgraded to version 5 with comprehensive store definitions', () => {
    expect(DB_NAME).toBe('GeaAgroOfflineDB');
    expect(DB_VERSION).toBe(5);

    // Verify all key agricultural stores exist
    expect(REQUIRED_OBJECT_STORES).toContain('animals');
    expect(REQUIRED_OBJECT_STORES).toContain('paddocks');
    expect(REQUIRED_OBJECT_STORES).toContain('companies');
    expect(REQUIRED_OBJECT_STORES).toContain('agronomists');
    expect(REQUIRED_OBJECT_STORES).toContain('producers');
    expect(REQUIRED_OBJECT_STORES).toContain('farms');
    expect(REQUIRED_OBJECT_STORES).toContain('soil_samples');
    expect(REQUIRED_OBJECT_STORES).toContain('leaf_samples');
    expect(REQUIRED_OBJECT_STORES).toContain('recommendations');
    expect(REQUIRED_OBJECT_STORES).toContain('water_analysis');
    expect(REQUIRED_OBJECT_STORES).toContain('fieldbook_operations');
    expect(REQUIRED_OBJECT_STORES).toContain('traceability_lots');
    expect(REQUIRED_OBJECT_STORES).toContain('gestao_rural');
    expect(REQUIRED_OBJECT_STORES).toContain('costs_records');
    expect(REQUIRED_OBJECT_STORES).toContain('plantability_records');
    expect(REQUIRED_OBJECT_STORES).toContain('irrigation_records');
    expect(REQUIRED_OBJECT_STORES).toContain('sync_queue');
    expect(REQUIRED_OBJECT_STORES).toContain('app_settings');
  });

  it('3. IndexedDBService must support persistent storage methods and CRUD operations', async () => {
    await offlineDB.initializeDefaultData();

    // Verify put and get
    const testFarm = {
      id: 'farm-offline-idb-001',
      name: 'Fazenda Modelo Offline',
      city: 'Jataí',
      state: 'GO'
    };
    await offlineDB.put('farms', testFarm as any, true);
    const retrieved = await offlineDB.get<any>('farms', 'farm-offline-idb-001');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Fazenda Modelo Offline');

    // Verify count and getAll
    const farmCount = await offlineDB.count('farms');
    expect(farmCount).toBeGreaterThanOrEqual(1);

    const allFarms = await offlineDB.getAll<any>('farms');
    expect(allFarms.some(f => f.id === 'farm-offline-idb-001')).toBe(true);

    // Verify settings store
    await offlineDB.setSetting('offline_mode_active', true);
    const settingVal = await offlineDB.getSetting<boolean>('offline_mode_active');
    expect(settingVal).toBe(true);

    // Verify sync queue addition
    await offlineDB.addToSyncQueue('farms', 'update', testFarm);
    const syncQueue = await offlineDB.getSyncQueue();
    expect(syncQueue.some(item => item.table === 'farms')).toBe(true);
  });
});
