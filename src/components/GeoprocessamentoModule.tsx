import React, { useState, useEffect } from 'react';
import { TraceabilityLeafletMap } from './traceability/TraceabilityLeafletMap';
import { DigitalFoodPassportModal } from './traceability/DigitalFoodPassportModal';
import { GeoprocessamentoDashboard } from './geoprocessamento/GeoprocessamentoDashboard';
import { RasterImportModal } from './geoprocessamento/RasterImportModal';
import { InspectionModal } from './geoprocessamento/InspectionModal';
import { ReportExportModal } from './geoprocessamento/ReportExportModal';
import {
  INITIAL_TRACEABILITY_PROPERTY,
  INITIAL_TRACEABILITY_LOTS,
  INITIAL_TRACEABILITY_PLOTS,
  INITIAL_TRACEABILITY_OPERATIONS,
  INITIAL_TRACEABILITY_HARVESTS,
  INITIAL_TRACEABILITY_PHOTO_DIARY
} from '../data/traceabilityData';
import {
  TraceabilityPlot,
  TraceabilityLot,
  TraceabilityProperty,
  TraceabilityOperation,
  TraceabilityHarvestItem,
  TraceabilityPhotoDiaryItem
} from '../types/traceability';
import {
  GeoprocessamentoPlotState,
  GeoprocessamentoAlert,
  GeoprocessamentoInspectionPoint,
  GeoprocessamentoRasterUpload,
  INITIAL_GEO_PLOTS,
  INITIAL_GEO_ALERTS,
  INITIAL_GEO_INSPECTIONS,
  INITIAL_GEO_RASTERS
} from '../data/geoprocessamentoData';
import {
  Compass,
  Layers,
  BarChart3,
  MapPin,
  Leaf,
  Upload,
  Download,
  AlertTriangle,
  Sparkles,
  Camera,
  HardDrive,
  RefreshCw
} from 'lucide-react';

import { Company, Agronomist, RuralProducer, Farm } from '../types/agronomy';

interface GeoprocessamentoModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  currentCompany?: Company;
  currentAgronomist?: Agronomist;
  currentProducer?: RuralProducer;
  currentFarm?: Farm;
  companies?: Company[];
  agronomists?: Agronomist[];
  producers?: RuralProducer[];
  farms?: Farm[];
}

export const GeoprocessamentoModule: React.FC<GeoprocessamentoModuleProps> = ({
  activeSubTab,
  setActiveSubTab,
  currentCompany,
  currentAgronomist,
  currentProducer,
  currentFarm,
  companies,
  agronomists,
  producers,
  farms,
}) => {
  // Navigation view mode: 'dashboard' (Smart Dashboard) | 'map' (Interactive GIS Multilayer Map)
  const [viewMode, setViewMode] = useState<'dashboard' | 'map'>(() => {
    if (activeSubTab === 'draw' || activeSubTab === 'ndvi' || activeSubTab === 'pois' || activeSubTab === 'layers' || activeSubTab === 'list') {
      return 'map';
    }
    return 'dashboard';
  });

  // Base traceability & agronomic technical registration state
  const [property] = useState<TraceabilityProperty>(() => {
    const saved = localStorage.getItem('geaagro_traceability_property');
    return saved ? JSON.parse(saved) : INITIAL_TRACEABILITY_PROPERTY;
  });

  const [plots, setPlots] = useState<TraceabilityPlot[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_plots');
    return saved ? JSON.parse(saved) : INITIAL_TRACEABILITY_PLOTS;
  });

  const [lots] = useState<TraceabilityLot[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_lots');
    return saved ? JSON.parse(saved) : INITIAL_TRACEABILITY_LOTS;
  });

  const [operations] = useState<TraceabilityOperation[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_operations');
    return saved ? JSON.parse(saved) : INITIAL_TRACEABILITY_OPERATIONS;
  });

  const [harvests] = useState<TraceabilityHarvestItem[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_harvests');
    return saved ? JSON.parse(saved) : INITIAL_TRACEABILITY_HARVESTS;
  });

  const [photoDiary] = useState<TraceabilityPhotoDiaryItem[]>(() => {
    const saved = localStorage.getItem('geaagro_traceability_photos');
    return saved ? JSON.parse(saved) : INITIAL_TRACEABILITY_PHOTO_DIARY;
  });

  // Remote Sensing & Intelligent Geoprocessing States
  const [geoPlots, setGeoPlots] = useState<GeoprocessamentoPlotState[]>(() => {
    const saved = localStorage.getItem('geaagro_geoprocessamento_plots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(p => p && p.id);
        }
      } catch (e) {}
    }
    return INITIAL_GEO_PLOTS;
  });

  const [alerts, setAlerts] = useState<GeoprocessamentoAlert[]>(() => {
    const saved = localStorage.getItem('geaagro_geoprocessamento_alerts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(a => a && a.id);
        }
      } catch (e) {}
    }
    return INITIAL_GEO_ALERTS;
  });

  const [inspections, setInspections] = useState<GeoprocessamentoInspectionPoint[]>(() => {
    const saved = localStorage.getItem('geaagro_geoprocessamento_inspections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(i => i && i.id);
        }
      } catch (e) {}
    }
    return INITIAL_GEO_INSPECTIONS;
  });

  const [rasters, setRasters] = useState<GeoprocessamentoRasterUpload[]>(() => {
    const saved = localStorage.getItem('geaagro_geoprocessamento_rasters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(r => r && r.id);
        }
      } catch (e) {}
    }
    return INITIAL_GEO_RASTERS;
  });

  const [selectedGeoPlot, setSelectedGeoPlot] = useState<GeoprocessamentoPlotState | undefined>(
    () => geoPlots[0] || INITIAL_GEO_PLOTS[0]
  );

  useEffect(() => {
    if (!selectedGeoPlot && geoPlots.length > 0) {
      setSelectedGeoPlot(geoPlots[0]);
    } else if (!selectedGeoPlot && INITIAL_GEO_PLOTS.length > 0) {
      setSelectedGeoPlot(INITIAL_GEO_PLOTS[0]);
    }
  }, [geoPlots, selectedGeoPlot]);

  // Modals state
  const [isRasterModalOpen, setIsRasterModalOpen] = useState<boolean>(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState<boolean>(false);
  const [editingInspection, setEditingInspection] = useState<GeoprocessamentoInspectionPoint | null>(null);
  const [targetInspectionPlotId, setTargetInspectionPlotId] = useState<string | undefined>();
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [passportModalLot, setPassportModalLot] = useState<TraceabilityLot | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleSyncSatellite = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Conectando ao catálogo Copernicus Sentinel-2 L2A (10m)...');
    setTimeout(() => {
      setSyncStatusMsg('Verificando cobertura de nuvens recente (Passagem recente: 0.0% nuvens)...');
    }, 1200);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Sincronização concluída com sucesso! Cenas multiespectrais atualizadas.');
      setTimeout(() => setSyncStatusMsg(null), 3500);
    }, 2500);
  };

  // Sync activeSubTab from parent Navbar
  useEffect(() => {
    if (activeSubTab) {
      if (activeSubTab === 'dashboard') {
        setViewMode('dashboard');
      } else if (activeSubTab === 'draw' || activeSubTab === 'ndvi' || activeSubTab === 'pois' || activeSubTab === 'list' || activeSubTab === 'layers') {
        setViewMode('map');
      }
    }
  }, [activeSubTab]);

  // Synchronize plot changes
  const handleSavePlots = (updatedPlots: TraceabilityPlot[]) => {
    setPlots(updatedPlots);
    localStorage.setItem('geaagro_traceability_plots', JSON.stringify(updatedPlots));

    // Also update geoPlots to reflect new boundaries or new plots
    const updatedGeoPlots = updatedPlots.map((tp, idx) => {
      const existing = geoPlots.find(gp => gp.id === tp.id);
      if (existing) {
        return {
          ...existing,
          name: tp.name,
          crop: tp.currentCrop || existing.crop,
          cultivar: tp.currentCultivar || existing.cultivar,
          areaHa: tp.areaHa,
        };
      }
      return {
        id: tp.id,
        code: tp.code || `TAL-0${idx + 1}`,
        name: tp.name,
        farmName: property.farmName,
        areaHa: tp.areaHa,
        crop: tp.currentCrop || 'Hortifruti',
        cultivar: tp.currentCultivar || 'Padrão',
        season: 'Safra 2026/2027',
        plantingDate: '2026-08-01',
        estimatedHarvestDate: '2026-11-20',
        irrigationType: tp.irrigationSystem || 'Gotejamento',
        soilTexture: tp.soilTexture || 'Médio',
        coordinates: { lat: tp.latitude || -22.3712, lng: tp.longitude || -46.9419 },
        photos: [],
        currentNdvi: 0.75,
        currentNdre: 0.68,
        currentGndvi: 0.72,
        currentSavi: 0.70,
        currentMsavi: 0.71,
        currentEvi: 0.74,
        currentVari: 0.42,
        currentNdwi: 0.60,
        currentChlorophyll: 55.0,
        currentBiomassTonHa: 16.0,
        currentCanopyCoverPct: 85,
        igvvScore: 80,
        vigorClassification: 'Alto Vigor' as const,
        highVigorPct: 75,
        mediumVigorPct: 20,
        lowVigorPct: 5,
        criticalAreaHa: 0.05,
        estimatedYieldKgHa: 45000,
        yieldPotentialPct: 88,
        phenologyStage: 'Desenvolvimento Vegetativo' as const,
        gddAccumulated: 650,
        irrigationDeficitMm: 2.0,
        soilMoisturePct: 75,
        fertilityStatus: 'Adequado' as const,
        lastSatelliteDate: '2026-09-20',
        cloudCoverPct: 0.0,
      };
    });

    setGeoPlots(updatedGeoPlots);
    localStorage.setItem('geaagro_geoprocessamento_plots', JSON.stringify(updatedGeoPlots));
  };

  const handleUploadRaster = (newRaster: GeoprocessamentoRasterUpload) => {
    const updated = [newRaster, ...rasters];
    setRasters(updated);
    localStorage.setItem('geaagro_geoprocessamento_rasters', JSON.stringify(updated));
  };

  const handleOpenNewInspection = (plotId?: string) => {
    setEditingInspection(null);
    setTargetInspectionPlotId(plotId || selectedGeoPlot?.id);
    setIsInspectionModalOpen(true);
  };

  const handleEditInspection = (inspection: GeoprocessamentoInspectionPoint) => {
    setEditingInspection(inspection);
    setTargetInspectionPlotId(inspection.plotId);
    setIsInspectionModalOpen(true);
  };

  const handleDeleteInspection = (id: string) => {
    const updated = inspections.filter(i => i.id !== id);
    setInspections(updated);
    localStorage.setItem('geaagro_geoprocessamento_inspections', JSON.stringify(updated));
    setEditingInspection(null);
  };

  const handleSaveInspection = (newInspection: GeoprocessamentoInspectionPoint) => {
    let updated: GeoprocessamentoInspectionPoint[];
    const exists = inspections.some(i => i.id === newInspection.id);
    if (exists) {
      updated = inspections.map(i => i.id === newInspection.id ? newInspection : i);
    } else {
      updated = [newInspection, ...inspections];
    }
    setInspections(updated);
    localStorage.setItem('geaagro_geoprocessamento_inspections', JSON.stringify(updated));
    setEditingInspection(null);
  };

  const handleOpenMapWithTab = (subTab?: string) => {
    setViewMode('map');
    if (setActiveSubTab && subTab) {
      setActiveSubTab(subTab);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Status Banner if active */}
      {syncStatusMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatusMsg}</span>
          </div>
        </div>
      )}

      {/* UNIFIED PROFESSIONAL HEADER CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Top Info Section */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                SIG &amp; Geoprocessamento Agronômico
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {property.farmName} &bull; {geoPlots.length} Talhões Monitorados &bull; Integração Cadastro Técnico &bull; Sensoriamento Remoto Multiespectral
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Botões na parte inferior da UI) */}
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-zinc-950/60 border-t border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Navigation View Switcher on the Left */}
          <div className="bg-white dark:bg-zinc-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80 dark:border-zinc-700/80 shadow-2xs">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard Inteligente</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mapa Multicamadas</span>
            </button>
          </div>

          {/* Action Tools on the Right */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncSatellite}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer disabled:opacity-50"
              title="Sincronizar dados de satélite"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Satélite'}</span>
            </button>

            <button
              onClick={() => setIsRasterModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
              title="Importar Drone, GeoTIFF ou Imagem Georreferenciada"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Importar Imagem</span>
            </button>

            <button
              onClick={() => handleOpenNewInspection(selectedGeoPlot?.id)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
              title="Gerar Ponto de Vistoria em Campo"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Ponto de Vistoria</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Exportar Laudo Técnico e Dados"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Laudo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Module Body based on ViewMode */}
      {viewMode === 'dashboard' ? (
        <GeoprocessamentoDashboard
          plots={geoPlots}
          alerts={alerts}
          inspections={inspections}
          rasters={rasters}
          selectedPlot={selectedGeoPlot || geoPlots[0] || INITIAL_GEO_PLOTS[0]}
          onSelectPlot={setSelectedGeoPlot}
          onOpenMap={handleOpenMapWithTab}
          onNewInspection={handleOpenNewInspection}
          onEditInspection={handleEditInspection}
          onDeleteInspection={handleDeleteInspection}
          onExportReport={(plot, format) => {
            setSelectedGeoPlot(plot);
            setIsReportModalOpen(true);
          }}
        />
      ) : (
        <TraceabilityLeafletMap
          property={property}
          plots={plots}
          lots={lots}
          onSavePlots={handleSavePlots}
          onSelectLot={() => {}}
          onOpenPassport={setPassportModalLot}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />
      )}

      {/* RASTER IMPORT MODAL (100% Offline + GeoTIFF / Drone) */}
      <RasterImportModal
        isOpen={isRasterModalOpen}
        onClose={() => setIsRasterModalOpen(false)}
        plots={geoPlots}
        onUploadRaster={handleUploadRaster}
      />

      {/* INSPECTION POINT MODAL (Field Inspection & Sampling) */}
      <InspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => {
          setIsInspectionModalOpen(false);
          setEditingInspection(null);
        }}
        plots={geoPlots}
        initialPlotId={targetInspectionPlotId}
        inspectionToEdit={editingInspection}
        onSaveInspection={handleSaveInspection}
        onDeleteInspection={handleDeleteInspection}
      />

      {/* REPORT & GIS EXPORT MODAL (PDF, CSV, Excel, GeoTIFF) */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        plot={selectedGeoPlot}
        allPlots={geoPlots}
        company={currentCompany || companies?.[0]}
        agronomist={currentAgronomist || agronomists?.[0]}
        producer={currentProducer || producers?.[0]}
        farm={currentFarm || farms?.[0]}
        property={property}
        inspections={inspections}
        photos={photoDiary}
      />

      {/* Digital Food Passport Modal */}
      {passportModalLot && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-3xl p-4 sm:p-6 text-white border border-white/10">
            <button
              onClick={() => setPassportModalLot(null)}
              className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition"
            >
              Fechar X
            </button>
            <DigitalFoodPassportModal
              lot={passportModalLot}
              property={property}
              operations={operations}
              harvests={harvests}
              photos={photoDiary}
              onClose={() => setPassportModalLot(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoprocessamentoModule;
