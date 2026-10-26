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
  const registerSW = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[Service Worker] Registrado com sucesso:', registration.scope);

        // Setup background sync if supported
        if ('sync' in registration) {
          window.addEventListener('online', () => {
            console.log('[Network] Conexão restabelecida! Disparando sincronização...');
            (registration as any).sync.register('geaagro-sync').catch((err: any) => {
              console.warn('[Sync] Falha ao registrar background sync:', err);
            });
          });
        }
      })
      .catch((err) => {
        console.warn('[Service Worker] Registro falhou:', err);
      });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

// Preload all dynamic modules into browser cache during idle time so every single module opens instantly offline
function scheduleModulePreloading() {
  const moduleLoaders = [
    () => import('./components/DashboardModule'),
    () => import('./components/RegistrationModule'),
    () => import('./components/SoilAnalysisModule'),
    () => import('./components/RecommendationModule'),
    () => import('./components/LeafAnalysisModule'),
    () => import('./components/HistoricalComparativeModule'),
    () => import('./components/TechnicalReportModule'),
    () => import('./components/NurseryModule'),
    () => import('./components/HydroponicsModule'),
    () => import('./components/WeatherModule'),
    () => import('./components/RainGaugeModule'),
    () => import('./components/PhenologyModule'),
    () => import('./components/FertigationModule'),
    () => import('./components/TankMixModule'),
    () => import('./components/WaterAnalysisModule'),
    () => import('./components/BrixModule'),
    () => import('./components/AgronomicCalculationsModule'),
    () => import('./components/SeedAnalysisModule'),
    () => import('./components/PlantabilityModule'),
    () => import('./components/NematologyModule'),
    () => import('./components/SoilDiseasesModule'),
    () => import('./components/PestMonitoringModule'),
    () => import('./components/PesticideBularioModule'),
    () => import('./components/VeterinaryBularioModule'),
    () => import('./components/LivestockModule'),
    () => import('./components/BuffaloModule'),
    () => import('./components/CaprineModule'),
    () => import('./components/EquineModule'),
    () => import('./components/SwineModule'),
    () => import('./components/PoultryModule'),
    () => import('./components/nutrition/AnimalNutritionModule'),
    () => import('./components/FieldBookModule'),
    () => import('./components/NemaAIConsole'),
    () => import('./components/AboutModule'),
    () => import('./components/BackupModule'),
    () => import('./components/costs/CostManagementModule'),
    () => import('./components/irrigation/IrrigationModule'),
    () => import('./components/TraceabilityModule'),
    () => import('./components/pericia/PericiaModule'),
    () => import('./components/GeoprocessamentoModule'),
    () => import('./components/ZarcRiscoModule'),
    () => import('./components/GestaoRuralModule'),
    () => import('./components/ForageCatalogModule'),
    () => import('./components/GeaAgroEduModule'),
  ];

  let index = 0;
  const loadNext = () => {
    if (index < moduleLoaders.length) {
      moduleLoaders[index++]()
        .catch(() => {})
        .finally(() => {
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(loadNext, { timeout: 1500 });
          } else {
            setTimeout(loadNext, 80);
          }
        });
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(loadNext, { timeout: 2500 });
  } else {
    setTimeout(loadNext, 1200);
  }
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

    // 5. Pre-warm all application modules in background for instant offline navigation
    scheduleModulePreloading();
  }
}

startApplication();
