import React, { useState, useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import {
  INITIAL_TRACEABILITY_PROPERTY,
  INITIAL_TRACEABILITY_PLOTS,
  NATIONAL_CROPS_DATABASE,
  INITIAL_TRACEABILITY_LOTS,
  INITIAL_TRACEABILITY_OPERATIONS,
  INITIAL_TRACEABILITY_HARVESTS,
  INITIAL_TRACEABILITY_PALLETS,
  INITIAL_TRACEABILITY_EXPEDITIONS,
  INITIAL_TRACEABILITY_MONITORING,
  INITIAL_TRACEABILITY_PHOTO_DIARY,
  DEFAULT_TRACEABILITY_LABEL_SETTINGS,
} from '../data/traceabilityData';
import {
  TraceabilityProperty,
  TraceabilityPlot,
  TraceabilityCrop,
  TraceabilityLot,
  TraceabilityOperation,
  TraceabilityHarvestItem,
  TraceabilityPallet,
  TraceabilityExpedition,
  TraceabilityPestMonitoring,
  TraceabilityPhotoDiaryItem,
  TraceabilityLabelSettings,
} from '../types/traceability';
import { Farm, RuralProducer, Agronomist } from '../types/agronomy';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { TraceabilityQuickPrintConfigPanel } from './traceability/TraceabilityQuickPrintConfigPanel';

const TraceabilityDashboard = lazyWithRetry(() =>
  import('./traceability/TraceabilityDashboard').then(m => ({ default: m.TraceabilityDashboard }))
);
const TraceabilityLotsManager = lazyWithRetry(() =>
  import('./traceability/TraceabilityLotsManager').then(m => ({ default: m.TraceabilityLotsManager }))
);
const TraceabilityLabelsQRCodes = lazyWithRetry(() =>
  import('./traceability/TraceabilityLabelsQRCodes').then(m => ({ default: m.TraceabilityLabelsQRCodes }))
);
const TraceabilityOperationsBook = lazyWithRetry(() =>
  import('./traceability/TraceabilityOperationsBook').then(m => ({ default: m.TraceabilityOperationsBook }))
);
const TraceabilityHarvestPacking = lazyWithRetry(() =>
  import('./traceability/TraceabilityHarvestPacking').then(m => ({ default: m.TraceabilityHarvestPacking }))
);
const TraceabilityExpeditionManager = lazyWithRetry(() =>
  import('./traceability/TraceabilityExpeditionManager').then(m => ({ default: m.TraceabilityExpeditionManager }))
);
const TraceabilityMonitoringDiary = lazyWithRetry(() =>
  import('./traceability/TraceabilityMonitoringDiary').then(m => ({ default: m.TraceabilityMonitoringDiary }))
);
const TraceabilityMapOffline = lazyWithRetry(() =>
  import('./traceability/TraceabilityMapOffline').then(m => ({ default: m.TraceabilityMapOffline }))
);
const TraceabilityLeafletMap = lazyWithRetry(() =>
  import('./traceability/TraceabilityLeafletMap').then(m => ({ default: m.TraceabilityLeafletMap }))
);
const TraceabilityComplianceReports = lazyWithRetry(() =>
  import('./traceability/TraceabilityComplianceReports').then(m => ({ default: m.TraceabilityComplianceReports }))
);
const TraceabilityCropsCatalog = lazyWithRetry(() =>
  import('./traceability/TraceabilityCropsCatalog').then(m => ({ default: m.TraceabilityCropsCatalog }))
);
const TraceabilitySettingsConfig = lazyWithRetry(() =>
  import('./traceability/TraceabilitySettingsConfig').then(m => ({ default: m.TraceabilitySettingsConfig }))
);
const DigitalFoodPassportModal = lazyWithRetry(() =>
  import('./traceability/DigitalFoodPassportModal').then(m => ({ default: m.DigitalFoodPassportModal }))
);

const SubviewFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-8 flex items-center justify-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
    <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
    <span>Carregando módulo de rastreabilidade...</span>
  </div>
);

interface TraceabilityModuleProps {
  farms?: Farm[];
  currentFarm?: Farm;
  producers?: RuralProducer[];
  agronomists?: Agronomist[];
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
}

export const TraceabilityModule: React.FC<TraceabilityModuleProps> = ({
  farms = [],
  activeSubTab,
  setActiveSubTab,
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<string>('dashboard');
  const activeTab = activeSubTab || localActiveTab;

  const handleTabChange = (tabId: string) => {
    setLocalActiveTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  // Offline-First Persistent States
  const [property, setProperty] = useState<TraceabilityProperty>(() => {
    const saved = localStorage.getItem('geaagro_traceability_property');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.farmName === 'Fazenda Santa Helena HF & Hortifruti') {
          return INITIAL_TRACEABILITY_PROPERTY;
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRACEABILITY_PROPERTY;
  });

  const [settings, setSettings] = useState<TraceabilityLabelSettings>(() => {
    const saved = localStorage.getItem('geaagro_traceability_label_settings');
    if (saved) {
      try {
        return { ...DEFAULT_TRACEABILITY_LABEL_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TRACEABILITY_LABEL_SETTINGS;
  });

  const [plots, setPlots] = useState<TraceabilityPlot[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_plots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && p.id && !p.id.startsWith('plot-'));
        }
      } catch {
        // fallback to initial state
      }
    }
    return INITIAL_TRACEABILITY_PLOTS;
  });

  const [crops] = useState<TraceabilityCrop[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_crops');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback to default catalog
      }
    }
    return NATIONAL_CROPS_DATABASE;
  });

  const [lots, setLots] = useState<TraceabilityLot[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_lots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(l => l && l.id && !l.id.startsWith('lot-'));
        }
      } catch {
        // fallback to initial state
      }
    }
    return INITIAL_TRACEABILITY_LOTS;
  });

  const [operations, setOperations] = useState<TraceabilityOperation[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_operations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_TRACEABILITY_OPERATIONS;
  });

  const [harvests, setHarvests] = useState<TraceabilityHarvestItem[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_harvests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(h => h && h.id && !h.id.startsWith('harv-'));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_TRACEABILITY_HARVESTS;
  });

  const [pallets, setPallets] = useState<TraceabilityPallet[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_pallets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && p.id && !p.id.startsWith('pal-') && !p.id.startsWith('PLT-'));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_TRACEABILITY_PALLETS;
  });

  const [expeditions, setExpeditions] = useState<TraceabilityExpedition[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_expeditions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(x => x && x.id && !x.id.startsWith('exp-'));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_TRACEABILITY_EXPEDITIONS;
  });

  const [monitoring, setMonitoring] = useState<TraceabilityPestMonitoring[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_monitoring');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(m => m && m.id && !m.id.startsWith('mon-'));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_TRACEABILITY_MONITORING;
  });

  const [photoDiary, setPhotoDiary] = useState<TraceabilityPhotoDiaryItem[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_photos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && p.id && !p.id.startsWith('photo-'));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_TRACEABILITY_PHOTO_DIARY;
  });

  const [selectedLot, setSelectedLot] = useState<TraceabilityLot | null>(lots[0] || null);
  const [passportModalLot, setPassportModalLot] = useState<TraceabilityLot | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'interactive' | 'schematic'>('interactive');

  // Auto-detect and open passport modal when URL contains ?lote=... or ?passaporte=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const queryLotCode =
          searchParams.get('lote') ||
          searchParams.get('lot') ||
          searchParams.get('lotCode') ||
          searchParams.get('passaporte');
        if (queryLotCode && lots.length > 0) {
          const found = lots.find(
            l =>
              l.lotCode.toLowerCase() === queryLotCode.toLowerCase() ||
              l.id.toLowerCase() === queryLotCode.toLowerCase()
          );
          if (found) {
            setSelectedLot(found);
            setPassportModalLot(found);
          }
        }
      } catch (e) {
        console.warn('Erro ao processar parâmetro de lote da URL:', e);
      }
    }
  }, [lots]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('geaagro_traceability_property', JSON.stringify(property));
  }, [property]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_label_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_plots', JSON.stringify(plots));
  }, [plots]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_crops', JSON.stringify(crops));
  }, [crops]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_lots', JSON.stringify(lots));
  }, [lots]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_operations', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_harvests', JSON.stringify(harvests));
  }, [harvests]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_pallets', JSON.stringify(pallets));
  }, [pallets]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_expeditions', JSON.stringify(expeditions));
  }, [expeditions]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_monitoring', JSON.stringify(monitoring));
  }, [monitoring]);

  useEffect(() => {
    localStorage.setItem('geaagro_traceability_photos', JSON.stringify(photoDiary));
  }, [photoDiary]);

  // Handlers
  const handleSaveLot = (newLot: TraceabilityLot) => {
    setLots(prev => {
      const exists = prev.some(l => l.id === newLot.id);
      if (exists) {
        return prev.map(l => (l.id === newLot.id ? newLot : l));
      }
      return [newLot, ...prev];
    });
    setSelectedLot(newLot);
  };

  const handleDeleteLot = (lotId: string) => {
    setLots(prev => {
      const next = prev.filter(l => l.id !== lotId);
      if (selectedLot?.id === lotId) {
        setSelectedLot(next[0] || null);
      }
      return next;
    });
  };

  const handleSaveOperation = (op: TraceabilityOperation) => {
    setOperations(prev => {
      const exists = prev.some(o => o.id === op.id);
      if (exists) {
        return prev.map(o => (o.id === op.id ? op : o));
      }
      return [op, ...prev];
    });
  };

  const handleDeleteOperation = (opId: string) => {
    setOperations(prev => prev.filter(o => o.id !== opId));
  };

  const handleSaveHarvest = (harvest: TraceabilityHarvestItem) => {
    setHarvests(prev => [harvest, ...prev]);
    setLots(prev =>
      prev.map(l => {
        if (l.id === harvest.lotId || l.lotCode === harvest.lotCode) {
          return {
            ...l,
            totalHarvestedKg: (l.totalHarvestedKg || 0) + harvest.netWeightKg,
            totalHarvestedBoxes: (l.totalHarvestedBoxes || 0) + harvest.boxesCount,
            status: l.status === 'semeadura' || l.status === 'desenvolvimento' ? 'colheita' : l.status,
          };
        }
        return l;
      })
    );
  };

  const handleDeleteHarvest = (id: string) => {
    setHarvests(prev => prev.filter(h => h.id !== id));
  };

  const handleSavePallet = (pallet: TraceabilityPallet) => {
    setPallets(prev => [pallet, ...prev]);
  };

  const handleDeletePallet = (id: string) => {
    setPallets(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveExpedition = (exp: TraceabilityExpedition) => {
    setExpeditions(prev => [exp, ...prev]);
    const contained = exp.lotsContained || [];
    if (contained.length > 0) {
      setLots(prev =>
        prev.map(l => {
          const foundContained = contained.find(c => c.lotCode === l.lotCode || c.lotId === l.id);
          if (foundContained) {
            return {
              ...l,
              totalExpeditedBoxes: (l.totalExpeditedBoxes || 0) + (foundContained.boxesCount || 0),
            };
          }
          return l;
        })
      );
    }
  };

  const handleDeleteExpedition = (id: string) => {
    setExpeditions(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveMonitoring = (item: TraceabilityPestMonitoring) => {
    setMonitoring(prev => [item, ...prev]);
  };

  const handleDeleteMonitoring = (id: string) => {
    setMonitoring(prev => prev.filter(m => m.id !== id));
  };

  const handleSavePhoto = (photo: TraceabilityPhotoDiaryItem) => {
    setPhotoDiary(prev => [photo, ...prev]);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotoDiary(prev => prev.filter(p => p.id !== id));
  };

  const handleOpenLabelsForLot = (lot: TraceabilityLot) => {
    setSelectedLot(lot);
    handleTabChange('etiquetas');
  };

  const handleImportFarmToProperty = (farm: Farm) => {
    if (farm.plots && farm.plots.length > 0) {
      const convertedPlots: TraceabilityPlot[] = farm.plots.map((p, index) => ({
        id: p.id || `plot-sync-${index}`,
        code: `TAL-${String(index + 1).padStart(2, '0')}`,
        name: p.name,
        farmId: property.id,
        areaHa: p.areaHa,
        structureType: 'campo_aberto',
        currentCrop: p.currentCrop || 'Hortaliça Diversa',
        currentCultivar: 'Padrão',
        currentLotCode: `GA-${(p.currentCrop || 'HF').slice(0, 3).toUpperCase()}-2027-TAL${index + 1}-0001`,
        irrigationSystem:
          p.irrigationType === 'gotejamento'
            ? 'gotejamento'
            : p.irrigationType === 'pivo_central'
            ? 'pivo_central'
            : 'aspersao',
        soilType: p.texture,
        soilTexture: p.texture,
        active: true,
      }));
      setPlots(convertedPlots);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Painel de Configuração Rápida de Impressão e Etiquetas */}
      <TraceabilityQuickPrintConfigPanel
        settings={settings}
        onUpdateSettings={setSettings}
        isOpenDefault={activeTab === 'configuracoes' || activeTab === 'etiquetas'}
      />

      {/* Tab Render Switcher */}
      <Suspense fallback={<SubviewFallback />}>
        {activeTab === 'dashboard' && (
          <TraceabilityDashboard
            property={property}
            lots={lots}
            harvests={harvests}
            expeditions={expeditions}
            monitoring={monitoring}
            onSelectLot={lot => {
              setSelectedLot(lot);
              handleTabChange('lotes');
            }}
            onNavigateTab={handleTabChange}
            onOpenPassport={setPassportModalLot}
          />
        )}

        {activeTab === 'lotes' && (
          <TraceabilityLotsManager
            property={property}
            lots={lots}
            plots={plots}
            crops={crops}
            operations={operations}
            harvests={harvests}
            monitoring={monitoring}
            selectedLot={selectedLot}
            onSelectLot={setSelectedLot}
            onSaveLot={handleSaveLot}
            onDeleteLot={handleDeleteLot}
            onOpenPassport={setPassportModalLot}
            onOpenLabels={handleOpenLabelsForLot}
          />
        )}

        {activeTab === 'etiquetas' && (
          <TraceabilityLabelsQRCodes
            property={property}
            lots={lots}
            selectedLot={selectedLot}
            settings={settings}
            onSelectLot={setSelectedLot}
            onOpenPassport={setPassportModalLot}
            onOpenSettings={() => handleTabChange('configuracoes')}
          />
        )}

        {activeTab === 'operacoes' && (
          <TraceabilityOperationsBook
            property={property}
            lots={lots}
            operations={operations}
            onSaveOperation={handleSaveOperation}
            onDeleteOperation={handleDeleteOperation}
          />
        )}

        {activeTab === 'colheita' && (
          <TraceabilityHarvestPacking
            lots={lots}
            harvests={harvests}
            pallets={pallets}
            onSaveHarvest={handleSaveHarvest}
            onSavePallet={handleSavePallet}
            onDeleteHarvest={handleDeleteHarvest}
            onDeletePallet={handleDeletePallet}
            onOpenLabels={handleOpenLabelsForLot}
          />
        )}

        {activeTab === 'expedicao' && (
          <TraceabilityExpeditionManager
            property={property}
            lots={lots}
            pallets={pallets}
            expeditions={expeditions}
            onSaveExpedition={handleSaveExpedition}
            onDeleteExpedition={handleDeleteExpedition}
          />
        )}

        {activeTab === 'monitoramento' && (
          <TraceabilityMonitoringDiary
            lots={lots}
            monitoring={monitoring}
            photoDiary={photoDiary}
            onSaveMonitoring={handleSaveMonitoring}
            onSavePhoto={handleSavePhoto}
            onDeleteMonitoring={handleDeleteMonitoring}
            onDeletePhoto={handleDeletePhoto}
          />
        )}

        {activeTab === 'mapa' && (
          <div className="space-y-3">
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMapViewMode('interactive')}
                  className={`h-8 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    mapViewMode === 'interactive'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Mapa Satélite GIS (Leaflet)
                </button>
                <button
                  type="button"
                  onClick={() => setMapViewMode('schematic')}
                  className={`h-8 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    mapViewMode === 'schematic'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Croqui Esquemático
                </button>
              </div>
            </div>

            {mapViewMode === 'interactive' ? (
              <TraceabilityLeafletMap
                property={property}
                plots={plots}
                lots={lots}
                onSavePlots={setPlots}
                onSelectLot={lot => {
                  setSelectedLot(lot);
                  handleTabChange('lotes');
                }}
                onOpenPassport={setPassportModalLot}
              />
            ) : (
              <TraceabilityMapOffline
                property={property}
                plots={plots}
                lots={lots}
                onSelectLot={lot => {
                  setSelectedLot(lot);
                  handleTabChange('lotes');
                }}
                onOpenPassport={setPassportModalLot}
              />
            )}
          </div>
        )}

        {activeTab === 'culturas' && <TraceabilityCropsCatalog crops={crops} />}

        {activeTab === 'relatorios' && (
          <TraceabilityComplianceReports
            property={property}
            lots={lots}
            operations={operations}
            harvests={harvests}
            expeditions={expeditions}
          />
        )}

        {activeTab === 'configuracoes' && (
          <TraceabilitySettingsConfig
            property={property}
            plots={plots}
            settings={settings}
            farms={farms}
            onUpdateProperty={setProperty}
            onUpdateSettings={setSettings}
            onImportFarmToProperty={handleImportFarmToProperty}
          />
        )}

        {passportModalLot && (
          <DigitalFoodPassportModal
            lot={passportModalLot}
            property={property}
            operations={operations}
            harvests={harvests}
            photos={photoDiary}
            onClose={() => setPassportModalLot(null)}
          />
        )}
      </Suspense>
    </div>
  );
};
