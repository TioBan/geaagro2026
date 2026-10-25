import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { offlineDB, DB_NAME, DB_VERSION, REQUIRED_OBJECT_STORES } from '../utils/indexedDB';
import fs from 'fs';
import path from 'path';

describe('GeaAgro Cache-First & IndexedDB Offline Persistence', () => {
  const publicSwPath = path.resolve(process.cwd(), 'public/sw.js');
  const distSwPath = path.resolve(process.cwd(), 'dist/sw.js');

  describe('1. Service Worker Cache-First Implementation', () => {
    it('public/sw.js must intercept all static assets with a Cache-First strategy', () => {
      expect(fs.existsSync(publicSwPath)).toBe(true);
      const content = fs.readFileSync(publicSwPath, 'utf-8');

      // Static assets classification
      expect(content).toContain('isStaticAsset');
      expect(content).toContain("url.pathname.startsWith('/assets/')");
      expect(content).toContain('caches.match(event.request)');

      // Fetch on miss with response cloning and caching
      expect(content).toContain('currentCache.put(event.request, responseClone)');

      // Fallback offline handling
      expect(content).toContain('OfflineModuleFallback');
      expect(content).toContain('OfflineModuleNotCachedError');
      expect(content).toContain('__offlineUnavailable = true');
    });

    it('dist/sw.js must contain Cache-First logic and precached hashed assets', () => {
      expect(fs.existsSync(distSwPath)).toBe(true);
      const content = fs.readFileSync(distSwPath, 'utf-8');

      expect(content).toContain('caches.match(event.request)');
      expect(content).toContain('OfflineModuleFallback');
      expect(content).toContain('isStaticAsset');
    });

    it('document navigation must provide immediate offline SPA fallback', () => {
      const content = fs.readFileSync(publicSwPath, 'utf-8');
      expect(content).toContain("event.request.mode === 'navigate'");
      expect(content).toContain("caches.match('/index.html')");
    });
  });

  describe('2. IndexedDB Database Architecture & Store Completeness', () => {
    it('GeaAgroOfflineDB must be version 5 with comprehensive store definitions', () => {
      expect(DB_NAME).toBe('GeaAgroOfflineDB');
      expect(DB_VERSION).toBe(5);

      // Verify essential business domains are present in stores
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

    it('should perform CRUD operations and bulk writes into IndexedDB', async () => {
      await offlineDB.initializeDefaultData();

      // Test put and get on 'farms'
      const testFarm = {
        id: 'farm-test-indexeddb-01',
        name: 'Fazenda Santa Helena Offline',
        city: 'Rio Verde',
        state: 'GO',
        totalArea: 1200,
        talhoes: []
      };

      await offlineDB.put('farms', testFarm as any);
      const retrieved = await offlineDB.get<any>('farms', 'farm-test-indexeddb-01');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Fazenda Santa Helena Offline');

      // Test putMany on 'soil_samples'
      const testSamples = [
        { id: 'soil-idb-01', labNumber: 'LAB-01', farmId: 'farm-test-indexeddb-01', ph: 6.2 },
        { id: 'soil-idb-02', labNumber: 'LAB-02', farmId: 'farm-test-indexeddb-01', ph: 5.8 }
      ];

      await offlineDB.putMany('soil_samples', testSamples as any, true);
      const allSamples = await offlineDB.getAll<any>('soil_samples');
      expect(allSamples.some(s => s.id === 'soil-idb-01')).toBe(true);
      expect(allSamples.some(s => s.id === 'soil-idb-02')).toBe(true);

      // Test delete
      await offlineDB.delete('farms', 'farm-test-indexeddb-01', true);
      const deletedFarm = await offlineDB.get<any>('farms', 'farm-test-indexeddb-01');
      expect(deletedFarm).toBeNull();
    });

    it('should support key-value app settings persistence', async () => {
      await offlineDB.setSetting('offline_last_sync_timestamp', 1700000000000);
      const val = await offlineDB.getSetting<number>('offline_last_sync_timestamp');
      expect(val).toBe(1700000000000);
    });

    it('should manage offline sync queue seamlessly', async () => {
      await offlineDB.addToSyncQueue('soil_samples', 'insert', { id: 'sample-sync-test', ph: 6.5 });
      const queue = await offlineDB.getSyncQueue();
      expect(queue.length).toBeGreaterThan(0);

      const target = queue.find(q => q.table === 'soil_samples' && q.data.id === 'sample-sync-test');
      expect(target).toBeDefined();
      expect(target?.status).toBe('pending');

      await offlineDB.updateSyncStatus(target!.id, 'completed');
      const updatedQueue = await offlineDB.getSyncQueue();
      const updated = updatedQueue.find(q => q.id === target!.id);
      expect(updated?.status).toBe('completed');

      await offlineDB.removeSyncItem(target!.id);
      const finalQueue = await offlineDB.getSyncQueue();
      expect(finalQueue.some(q => q.id === target!.id)).toBe(false);
    });
  });
});
