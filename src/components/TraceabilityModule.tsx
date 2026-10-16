import React, { useState, useEffect } from 'react';
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
import { TraceabilityDashboard } from './traceability/TraceabilityDashboard';
import { TraceabilityLotsManager } from './traceability/TraceabilityLotsManager';
import { TraceabilityLabelsQRCodes } from './traceability/TraceabilityLabelsQRCodes';
import { TraceabilityOperationsBook } from './traceability/TraceabilityOperationsBook';
import { TraceabilityHarvestPacking } from './traceability/TraceabilityHarvestPacking';
import { TraceabilityExpeditionManager } from './traceability/TraceabilityExpeditionManager';
import { TraceabilityMonitoringDiary } from './traceability/TraceabilityMonitoringDiary';
import { TraceabilityMapOffline } from './traceability/TraceabilityMapOffline';
import { TraceabilityLeafletMap } from './traceability/TraceabilityLeafletMap';
import { TraceabilityComplianceReports } from './traceability/TraceabilityComplianceReports';
import { TraceabilityCropsCatalog } from './traceability/TraceabilityCropsCatalog';
import { TraceabilitySettingsConfig } from './traceability/TraceabilitySettingsConfig';
import { TraceabilityQuickPrintConfigPanel } from './traceability/TraceabilityQuickPrintConfigPanel';
import { DigitalFoodPassportModal } from './traceability/DigitalFoodPassportModal';

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
  currentFarm,
  producers = [],
  agronomists = [],
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
      } catch (e) {}
    }
    return INITIAL_TRACEABILITY_PLOTS;
  });

  const [crops, setCrops] = useState<TraceabilityCrop[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_crops');
    return saved ? JSON.parse(saved) : NATIONAL_CROPS_DATABASE;
  });

  const [lots, setLots] = useState<TraceabilityLot[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_lots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(l => l && l.id && !l.id.startsWith('lot-'));
        }
      } catch (e) {}
    }
    return INITIAL_TRACEABILITY_LOTS;
  });

  const [operations, setOperations] = useState<TraceabilityOperation[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_operations');
    return saved ? JSON.parse(saved) : INITIAL_TRACEABILITY_OPERATIONS;
  });

  const [harvests, setHarvests] = useState<TraceabilityHarvestItem[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_harvests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(h => h && h.id && !h.id.startsWith('harv-'));
        }
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
    }
    return INITIAL_TRACEABILITY_PHOTO_DIARY;
  });

  // Selected Lot for 360 view or passport modal
  const [selectedLot, setSelectedLot] = useState<TraceabilityLot | null>(lots[0] || null);
  const [passportModalLot, setPassportModalLot] = useState<TraceabilityLot | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'interactive' | 'schematic'>('interactive');

  // Auto-detect and open passport modal when URL contains ?lote=... or ?passaporte=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const queryLotCode = searchParams.get('lote') || searchParams.get('lot') || searchParams.get('lotCode') || searchParams.get('passaporte');
        if (queryLotCode && lots.length > 0) {
          const found = lots.find(
            l => l.lotCode.toLowerCase() === queryLotCode.toLowerCase() || l.id.toLowerCase() === queryLotCode.toLowerCase()
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

  // Sync to local storage
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
    setLots(prev => prev.filter(l => l.id !== lotId));
    if (selectedLot?.id === lotId) {
      setSelectedLot(lots.find(l => l.id !== lotId) || null);
    }
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
    // update lot total harvested
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
    // update lot expedited boxes
    setLots(prev =>
      prev.map(l => {
        const foundContained = exp.lotsContained.find(c => c.lotCode === l.lotCode || c.lotId === l.id);
        if (foundContained) {
          return {
            ...l,
            totalExpeditedBoxes: (l.totalExpeditedBoxes || 0) + foundContained.boxesCount,
          };
        }
        return l;
      })
    );
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
    // If farm has plots, also sync plots to traceability
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
        irrigationSystem: p.irrigationType === 'gotejamento' ? 'gotejamento' : p.irrigationType === 'pivo_central' ? 'pivo_central' : 'aspersao',
        soilType: p.texture,
        soilTexture: p.texture,
        active: true,
      }));
      setPlots(convertedPlots);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Painel de Configuração Rápida de Impressão e Etiquetas */}
      <TraceabilityQuickPrintConfigPanel
        settings={settings}
        onUpdateSettings={setSettings}
        isOpenDefault={activeTab === 'configuracoes' || activeTab === 'etiquetas'}
      />

      {/* Tab Render Switcher */}
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
        <div className="space-y-4">
          <div className="flex items-center justify-end bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl w-fit ml-auto shadow-2xs">
            <button
              onClick={() => setMapViewMode('interactive')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mapViewMode === 'interactive' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Mapa Satélite GIS (Leaflet)
            </button>
            <button
              onClick={() => setMapViewMode('schematic')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mapViewMode === 'schematic' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              Croqui Esquemático
            </button>
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

      {activeTab === 'culturas' && (
        <TraceabilityCropsCatalog
          crops={crops}
        />
      )}

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

      {/* Digital Food Passport Modal */}
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
    </div>
  );
};
