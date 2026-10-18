import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { offlineDB } from './utils/indexedDB';
import { ensureCleanProductionState } from './utils/cleanDataService';
import { checkAndRecoverAbruptInterruption } from './services/backupService';

// Enforce HTTPS on client side for enhanced security against MITM / interception
if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'http:' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.endsWith('.local')
) {
  window.location.href = window.location.href.replace(/^http:/, 'https:');
}

// Fix leaflet-draw strict mode ReferenceError bug (issue where the library references undeclared global 'type')
if (typeof window !== 'undefined') {
  (window as any).type = undefined;
}

// Register Service Worker for offline support & automatic background sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[Service Worker] Registered successfully with scope:', registration.scope);
        
        // Setup background sync if supported
        if ('sync' in registration) {
          // Listen to connection restoration
          window.addEventListener('online', () => {
            console.log('[Network] Back online! Requesting background sync...');
            (registration as any).sync.register('geaagro-sync').catch((err: any) => {
              console.warn('[Sync] Failed to register background sync:', err);
            });
          });
        }
      })
      .catch((err) => {
        console.warn('[Service Worker] Registration failed:', err);
      });
  });
}

// Inicialização orquestrada da aplicação com recuperação de interrupções abruptas
async function startApplication() {
  // 1. Recuperação imediata pós-interrupção abrupta (queda de energia / kill do navegador)
  // DEVE rodar e concluir antes de qualquer módulo carregar ou modificar dados persistidos
  try {
    const recoveryResult = await checkAndRecoverAbruptInterruption();
    if (recoveryResult.recovered) {
      console.warn('[GeaAgro Startup] ' + recoveryResult.message);
    }
  } catch (recoveryErr) {
    console.error('[GeaAgro Startup] Erro na verificação preventiva de interrupção abrupta:', recoveryErr);
  }

  // 2. Ensure clean initial state for professional field operations
  ensureCleanProductionState();

  // 3. Initialize offline DB without demo data
  try {
    await offlineDB.initializeDefaultData();
    console.log('[App] Offline IndexedDB Initialized successfully');
  } catch (err) {
    console.error('[App] Failed to initialize Offline IndexedDB:', err);
  }

  // 4. Montar a árvore React com os dados já íntegros e auditados
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

startApplication();
