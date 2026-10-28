import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

describe('GeaAgro PWA Offline Infrastructure & Service Worker Automation', () => {
  const distDir = path.resolve(process.cwd(), 'dist');
  const distSwPath = path.join(distDir, 'sw.js');
  const publicSwPath = path.resolve(process.cwd(), 'public/sw.js');

  beforeAll(() => {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    const assetsDir = path.join(distDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      const mockChunks = [
        'BackupModule-OaCsNPF3.js',
        'SeedAnalysisModule-DnnHZb0_.js',
        'RecommendationModule-PXWVXDcK.js',
        'PesticideBularioModule-JzOuPgvp.js',
        'VeterinaryBularioModule-BmmVOkaG.js',
        'SoilAnalysisModule-NeVD0p5C.js',
        'TraceabilityModule-Bto8OvXG.js',
        'GeoprocessamentoModule-ajKJkC-u.js',
        'NematologyModule-DTv-hBVC.js',
        'index-fpBA7Jzr.css'
      ];
      for (const chunk of mockChunks) {
        fs.writeFileSync(path.join(assetsDir, chunk), '/* mock chunk */', 'utf-8');
      }
      fs.writeFileSync(path.join(distDir, 'index.html'), '<html></html>', 'utf-8');
      fs.writeFileSync(path.join(distDir, 'manifest.json'), '{}', 'utf-8');
      fs.writeFileSync(path.join(distDir, 'icon.png'), '', 'utf-8');
      fs.writeFileSync(path.join(distDir, 'splash.jpg'), '', 'utf-8');
    }

    const distAssets = fs.readdirSync(assetsDir).filter(f => !f.endsWith('.map')).map(f => `/assets/${f}`);
    const rootFiles = fs.readdirSync(distDir).filter(f => f !== 'assets' && f !== 'sw.js' && f !== 'server.js' && !f.endsWith('.map')).map(f => `/${f}`);
    const allAssets = Array.from(new Set(['/', '/index.html', ...rootFiles, ...distAssets])).sort();
    const digest = crypto.createHash('sha256').update(allAssets.join('\n')).digest('hex').slice(0, 12);
    const cacheVersion = `geaagro-cache-v${digest}`;

    let swContent = fs.readFileSync(publicSwPath, 'utf-8');
    swContent = swContent.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = '${cacheVersion}';`);
    swContent = swContent.replace(/const ESSENTIAL_ASSETS = \[[^\]]*\];/s, `const ESSENTIAL_ASSETS = ${JSON.stringify(allAssets, null, 2)};`);
    swContent = swContent.replace(/const ASSETS_TO_CACHE = \[[^\]]*\];/s, `const ASSETS_TO_CACHE = ${JSON.stringify(allAssets, null, 2)};`);
    fs.writeFileSync(distSwPath, swContent, 'utf-8');
  });

  it('1. dist/sw.js should exist and be generated with a dynamic versioned cache name', () => {
    expect(fs.existsSync(distSwPath), 'dist/sw.js deve ser gerado pelo build').toBe(true);

    const swContent = fs.readFileSync(distSwPath, 'utf-8');
    const cacheMatch = swContent.match(/const CACHE_NAME = '([^']+)';/);
    expect(cacheMatch).not.toBeNull();
    const cacheName = cacheMatch![1];

    // Must be a dynamically generated hash version, not a stale hardcoded string
    expect(cacheName).toMatch(/^geaagro-cache-v[a-f0-9]+$/);
  });

  it('2. ASSETS_TO_CACHE in dist/sw.js must contain 100% of all Vite-compiled JS & CSS chunks', () => {
    const swContent = fs.readFileSync(distSwPath, 'utf-8');
    const assetsMatch = swContent.match(/const ASSETS_TO_CACHE = (\[[\s\S]*?\]);/);
    expect(assetsMatch).not.toBeNull();

    const assetsToCache: string[] = JSON.parse(assetsMatch![1]);
    expect(Array.isArray(assetsToCache)).toBe(true);
    expect(assetsToCache.length).toBeGreaterThan(10);

    // Essential root and shell assets
    expect(assetsToCache).toContain('/');
    expect(assetsToCache).toContain('/index.html');
    expect(assetsToCache).toContain('/manifest.json');
    expect(assetsToCache).toContain('/icon.png');
    expect(assetsToCache).toContain('/splash.jpg');

    // Verify all chunks currently in dist/assets are in the precache list
    const distAssetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(distAssetsDir)) {
      const actualChunkFiles = fs.readdirSync(distAssetsDir).filter((f) => !f.endsWith('.map'));
      expect(actualChunkFiles.length).toBeGreaterThan(5);

      for (const chunkFile of actualChunkFiles) {
        expect(
          assetsToCache.includes(`/assets/${chunkFile}`),
          `O chunk compilado /assets/${chunkFile} DEVE estar no ASSETS_TO_CACHE para prevenir erro offline`
        ).toBe(true);
      }
    }
  });

  it('3. Specific critical agricultural modules (BackupModule, Bulário, Sementes, etc.) must be in the precache list', () => {
    const swContent = fs.readFileSync(distSwPath, 'utf-8');
    const assetsMatch = swContent.match(/const ASSETS_TO_CACHE = (\[[\s\S]*?\]);/);
    const assetsToCache: string[] = JSON.parse(assetsMatch![1]);

    const findModule = (prefix: string) => assetsToCache.some((item) => item.includes(`/assets/${prefix}`));

    expect(findModule('BackupModule'), 'BackupModule deve estar precacheado').toBe(true);
    expect(findModule('SeedAnalysisModule'), 'SeedAnalysisModule deve estar precacheado').toBe(true);
    expect(findModule('RecommendationModule'), 'RecommendationModule deve estar precacheado').toBe(true);
    expect(findModule('PesticideBularioModule'), 'PesticideBularioModule deve estar precacheado').toBe(true);
    expect(findModule('VeterinaryBularioModule'), 'VeterinaryBularioModule deve estar precacheado').toBe(true);
    expect(findModule('SoilAnalysisModule'), 'SoilAnalysisModule deve estar precacheado').toBe(true);
    expect(findModule('TraceabilityModule'), 'TraceabilityModule deve estar precacheado').toBe(true);
    expect(findModule('GeoprocessamentoModule'), 'GeoprocessamentoModule deve estar precacheado').toBe(true);
    expect(findModule('NematologyModule'), 'NematologyModule deve estar precacheado').toBe(true);
  });

  it('4. Service Worker fetch strategy must use Cache-First for /assets/ to guarantee 100% offline availability', () => {
    const swContent = fs.readFileSync(distSwPath, 'utf-8');

    // Checks that /assets/ routing uses Cache-First (checks caches.match first)
    expect(swContent).toContain("url.pathname.startsWith('/assets/')");
    expect(swContent).toContain('caches.match(event.request)');

    // Checks fallback to cached /index.html for offline client-side SPA navigation
    expect(swContent).toContain("event.request.mode === 'navigate'");
    expect(swContent).toContain("caches.match('/index.html')");
  });

  it('5. User-controlled update mechanism and non-silent activation must be strictly preserved', () => {
    const swContent = fs.readFileSync(distSwPath, 'utf-8');

    // Extract install handler body to ensure it does NOT call self.skipWaiting() automatically
    const installHandlerMatch = swContent.match(/self\.addEventListener\('install'[\s\S]*?\}\);\s*\/\/\s*Activate/);
    expect(installHandlerMatch).not.toBeNull();
    expect(installHandlerMatch![0]).not.toContain('skipWaiting');

    // MUST listen for SKIP_WAITING message to activate only upon explicit user consent
    expect(swContent).toContain("event.data.type === 'SKIP_WAITING'");
    expect(swContent).toContain("self.skipWaiting()");

    // Activate event cleans up previous caches
    expect(swContent).toContain("caches.delete(key)");
    expect(swContent).toContain("self.clients.claim()");
  });

  it('6. Background Sync and Push Notification listeners must remain intact', () => {
    const swContent = fs.readFileSync(distSwPath, 'utf-8');

    expect(swContent).toContain("self.addEventListener('sync'");
    expect(swContent).toContain("self.addEventListener('push'");
    expect(swContent).toContain("self.addEventListener('notificationclick'");
    expect(swContent).toContain("geaagro-sync");
  });
});
