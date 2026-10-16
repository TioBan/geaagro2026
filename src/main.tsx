import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { offlineDB } from './utils/indexedDB';
import { ensureCleanProductionState } from './utils/cleanDataService';

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

// Ensure clean initial state for professional field operations
ensureCleanProductionState();

// Fix leaflet-draw strict mode ReferenceError bug (issue where the library references undeclared global 'type')
if (typeof window !== 'undefined') {
  (window as any).type = undefined;
}

// Initialize offline DB without demo data
offlineDB.initializeDefaultData().then(() => {
  console.log('[App] Offline IndexedDB Initialized successfully');
}).catch((err) => {
  console.error('[App] Failed to initialize Offline IndexedDB:', err);
});

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
