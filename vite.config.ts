import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { defineConfig, Plugin } from 'vite';

/**
 * Vite plugin to automatically collect ALL generated JS chunks, CSS, HTML, and assets
 * and inject them into the production Service Worker precache manifest (dist/sw.js).
 * This eliminates the root cause of 'Failed to fetch dynamically imported module' offline.
 */
function geaAgroPwaPrecachePlugin(): Plugin {
  return {
    name: 'geaagro-pwa-precache-plugin',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const swDest = path.join(distDir, 'sw.js');
      const swSrcPath = path.resolve(process.cwd(), 'public/sw.js');

      if (!fs.existsSync(distDir) || !fs.existsSync(swSrcPath)) {
        return;
      }

      // 1. Collect all compiled hashed assets (JS chunks, CSS, etc.) from dist/assets
      const assetsDir = path.join(distDir, 'assets');
      const distAssets: string[] = [];
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        for (const file of files) {
          if (!file.endsWith('.map')) {
            distAssets.push(`/assets/${file}`);
          }
        }
      }

      // 2. Collect all static public assets from dist root
      const rootFiles = fs.readdirSync(distDir);
      const rootAssets: string[] = ['/', '/index.html'];
      for (const file of rootFiles) {
        const fullPath = path.join(distDir, file);
        if (
          file === 'assets' ||
          file === 'sw.js' ||
          file === 'server.js' ||
          file.endsWith('.map') ||
          fs.statSync(fullPath).isDirectory()
        ) {
          continue;
        }
        rootAssets.push(`/${file}`);
      }

      // 3. Combine, deduplicate and sort
      const allAssets = Array.from(new Set([...rootAssets, ...distAssets])).sort();

      // 4. Compute unique deterministic cache version
      const manifestDigest = crypto
        .createHash('sha256')
        .update(allAssets.join('\n'))
        .digest('hex')
        .slice(0, 12);
      const cacheVersion = `geaagro-cache-v${manifestDigest}`;

      // 5. Read sw.js template and inject manifest + cache name
      let swContent = fs.readFileSync(swSrcPath, 'utf-8');

      swContent = swContent.replace(
        /const CACHE_NAME = ['"][^'"]+['"];/,
        `const CACHE_NAME = '${cacheVersion}';`
      );

      const jsonList = JSON.stringify(allAssets, null, 2);
      swContent = swContent.replace(
        /const ESSENTIAL_ASSETS = \[[^\]]*\];/s,
        `const ESSENTIAL_ASSETS = ${jsonList};`
      );
      swContent = swContent.replace(
        /const ASSETS_TO_CACHE = \[[^\]]*\];/s,
        `const ASSETS_TO_CACHE = ${jsonList};`
      );

      fs.writeFileSync(swDest, swContent, 'utf-8');
      console.log(
        `\n[GeaAgro PWA Precache] dist/sw.js generated successfully:\n` +
        `  - Total precached assets: ${allAssets.length}\n` +
        `  - Modules & Chunks in /assets: ${distAssets.length}\n` +
        `  - Cache Version: ${cacheVersion}\n`
      );
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      geaAgroPwaPrecachePlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'motion/react',
        'lucide-react',
      ],
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'esnext',
      sourcemap: false,
      chunkSizeWarningLimit: 3000,
      reportCompressedSize: false,
      rollupOptions: {
        treeshake: true,
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('leaflet')) {
                return 'vendor-map';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('tesseract.js')) {
                return 'vendor-ocr';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
