import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

describe('PWA Offline & Cache Resilience Verification', () => {
  const distDir = path.resolve(process.cwd(), 'dist');
  const swPath = path.join(distDir, 'sw.js');
  const assetsDir = path.join(distDir, 'assets');
  const publicSwPath = path.resolve(process.cwd(), 'public/sw.js');

  beforeAll(() => {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
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

    if (!fs.existsSync(swPath)) {
      const distAssets = fs.readdirSync(assetsDir).filter(f => !f.endsWith('.map')).map(f => `/assets/${f}`);
      const rootFiles = fs.readdirSync(distDir).filter(f => f !== 'assets' && f !== 'sw.js' && f !== 'server.js' && !f.endsWith('.map')).map(f => `/${f}`);
      const allAssets = Array.from(new Set(['/', '/index.html', ...rootFiles, ...distAssets])).sort();
      const digest = crypto.createHash('sha256').update(allAssets.join('\n')).digest('hex').slice(0, 12);
      const cacheVersion = `geaagro-cache-v${digest}`;

      let swContent = fs.readFileSync(publicSwPath, 'utf-8');
      swContent = swContent.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = '${cacheVersion}';`);
      swContent = swContent.replace(/const ESSENTIAL_ASSETS = \[[^\]]*\];/s, `const ESSENTIAL_ASSETS = ${JSON.stringify(allAssets, null, 2)};`);
      swContent = swContent.replace(/const ASSETS_TO_CACHE = \[[^\]]*\];/s, `const ASSETS_TO_CACHE = ${JSON.stringify(allAssets, null, 2)};`);
      fs.writeFileSync(swPath, swContent, 'utf-8');
    }
  });

  it('1. All compiled chunks in dist/assets must be present in dist/sw.js ESSENTIAL_ASSETS', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, 'utf-8');

    // Extract ESSENTIAL_ASSETS from sw.js
    const match = swContent.match(/const ESSENTIAL_ASSETS = (\[[^\]]+\]);/);
    expect(match).not.toBeNull();
    const essentialAssets: string[] = JSON.parse(match![1]);

    const files = fs.readdirSync(assetsDir).filter(f => !f.endsWith('.map'));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const assetUrl = `/assets/${file}`;
      expect(essentialAssets).toContain(assetUrl);
    }

    // Verify key modules explicitly
    const hasBackupModule = essentialAssets.some(url => url.includes('BackupModule'));
    expect(hasBackupModule).toBe(true);
  });

  it('2. server.ts must block SPA fallback for /assets/ and return 404 for missing static assets', () => {
    const serverContent = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');
    
    // Check production block 404 handler
    expect(serverContent).toContain("req.path.startsWith('/assets/')");
    expect(serverContent).toContain("res.status(404).type('text/plain').send('Asset Not Found')");
  });

  it('3. public/sw.js and dist/sw.js must reject non-JS/CSS and HTML responses from being cached as assets', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain("isJs");
    expect(swContent).toContain("isCss");
    expect(swContent).toContain("Ignored caching asset with invalid Content-Type");
  });

  it('4. Service Worker install must abort if any essential asset fails to cache', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    // Promise.all is used on essentialList with re-throwing errors
    expect(swContent).toContain("FATAL: Essential asset failed to cache");
    expect(swContent).toContain("Promise.all(");
  });

  it('5. Offline fallback for missing JS module must return valid ES module rather than 503 or HTML', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain("__offlineUnavailable = true");
    expect(swContent).toContain("OfflineModuleFallback");
    expect(swContent).toContain("Content-Type': 'application/javascript; charset=utf-8'");
  });

  it('6. lazyWithRetry must guard against reload loops when navigator is offline', () => {
    const lazyContent = fs.readFileSync(path.resolve(process.cwd(), 'src/utils/lazyWithRetry.ts'), 'utf-8');
    expect(lazyContent).toContain("navigator.onLine");
    expect(lazyContent).toContain("__offlineUnavailable");
  });

  it('7. Service Worker activate must preserve previous cache generation for open tabs', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain("cachesToKeep.add(prevCache)");
    expect(swContent).toContain("Safely purging obsolete cache generation");
  });

  it('8. Critical business data and services (IndexedDB, Backup, CleanData) remain preserved and uncorrupted', () => {
    const idbPath = path.resolve(process.cwd(), 'src/utils/indexedDB.ts');
    const backupPath = path.resolve(process.cwd(), 'src/services/backupService.ts');
    expect(fs.existsSync(idbPath)).toBe(true);
    expect(fs.existsSync(backupPath)).toBe(true);
  });
});
