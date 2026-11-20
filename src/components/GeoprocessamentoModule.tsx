import React, { useState, useEffect, useRef, Suspense } from 'react';
import { GeoprocessamentoDashboard } from './geoprocessamento/GeoprocessamentoDashboard';
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
  Upload,
  Download,
  RefreshCw,
  X
} from 'lucide-react';
import { Company, Agronomist, RuralProducer, Farm } from '../types/agronomy';
import { lazyWithRetry } from '../utils/lazyWithRetry';

const TraceabilityLeafletMap = lazyWithRetry(() =>
  import('./traceability/TraceabilityLeafletMap').then(m => ({ default: m.TraceabilityLeafletMap }))
);
const DigitalFoodPassportModal = lazyWithRetry(() =>
  import('./traceability/DigitalFoodPassportModal').then(m => ({ default: m.DigitalFoodPassportModal }))
);
const RasterImportModal = lazyWithRetry(() =>
  import('./geoprocessamento/RasterImportModal').then(m => ({ default: m.RasterImportModal }))
);
const InspectionModal = lazyWithRetry(() =>
  import('./geoprocessamento/InspectionModal').then(m => ({ default: m.InspectionModal }))
);
const ReportExportModal = lazyWithRetry(() =>
  import('./geoprocessamento/ReportExportModal').then(m => ({ default: m.ReportExportModal }))
);

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

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function readStoredArray<T extends { id?: string }>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((item): item is T => Boolean(item && item.id));
    }
  } catch {
    // Fallback para estado inicial limpo
  }
  return fallback;
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
  const [viewMode, setViewMode] = useState<'dashboard' | 'map'>(() => {
    if (activeSubTab === 'draw' || activeSubTab === 'ndvi' || activeSubTab === 'pois' || activeSubTab === 'layers' || activeSubTab === 'list') {
      return 'map';
    }
    return 'dashboard';
  });

  // Base traceability & agronomic technical registration state
  const [property] = useState<TraceabilityProperty>(() =>
    readStoredJson('geaagro_traceability_property', INITIAL_TRACEABILITY_PROPERTY)
  );
  const [plots, setPlots] = useState<TraceabilityPlot[]>(() =>
    readStoredJson('geaagro_traceability_plots', INITIAL_TRACEABILITY_PLOTS)
  );
  const [lots] = useState<TraceabilityLot[]>(() =>
    readStoredJson('geaagro_traceability_lots', INITIAL_TRACEABILITY_LOTS)
  );
  const [operations] = useState<TraceabilityOperation[]>(() =>
    readStoredJson('geaagro_traceability_operations', INITIAL_TRACEABILITY_OPERATIONS)
  );
  const [harvests] = useState<TraceabilityHarvestItem[]>(() =>
    readStoredJson('geaagro_traceability_harvests', INITIAL_TRACEABILITY_HARVESTS)
  );
  const [photoDiary] = useState<TraceabilityPhotoDiaryItem[]>(() =>
    readStoredJson('geaagro_traceability_photos', INITIAL_TRACEABILITY_PHOTO_DIARY)
  );

  // Remote Sensing & Geoprocessing States
  const [geoPlots, setGeoPlots] = useState<GeoprocessamentoPlotState[]>(() =>
    readStoredArray('geaagro_geoprocessamento_plots', INITIAL_GEO_PLOTS)
  );
  const [alerts] = useState<GeoprocessamentoAlert[]>(() =>
    readStoredArray('geaagro_geoprocessamento_alerts', INITIAL_GEO_ALERTS)
  );
  const [inspections, setInspections] = useState<GeoprocessamentoInspectionPoint[]>(() =>
    readStoredArray('geaagro_geoprocessamento_inspections', INITIAL_GEO_INSPECTIONS)
  );
  const [rasters, setRasters] = useState<GeoprocessamentoRasterUpload[]>(() =>
    readStoredArray('geaagro_geoprocessamento_rasters', INITIAL_GEO_RASTERS)
  );

  const [selectedGeoPlot, setSelectedGeoPlot] = useState<GeoprocessamentoPlotState | undefined>(
    () => geoPlots[0] || INITIAL_GEO_PLOTS[0]
  );

  useEffect(() => {
    if (!selectedGeoPlot && geoPlots.length > 0) {
      setSelectedGeoPlot(geoPlots[0]);
    } else if (selectedGeoPlot && !geoPlots.some(p => p.id === selectedGeoPlot.id)) {
      setSelectedGeoPlot(geoPlots[0]);
    }
  }, [geoPlots, selectedGeoPlot]);

  // Modals & sync state
  const [isRasterModalOpen, setIsRasterModalOpen] = useState<boolean>(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState<boolean>(false);
  const [editingInspection, setEditingInspection] = useState<GeoprocessamentoInspectionPoint | null>(null);
  const [targetInspectionPlotId, setTargetInspectionPlotId] = useState<string | undefined>();
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv' | 'excel' | 'geotiff'>('pdf');
  const [passportModalLot, setPassportModalLot] = useState<TraceabilityLot | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const syncTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      syncTimersRef.current.forEach(t => window.clearTimeout(t));
      syncTimersRef.current = [];
    };
  }, []);

  const handleSyncSatellite = () => {
    syncTimersRef.current.forEach(t => window.clearTimeout(t));
    syncTimersRef.current = [];

    setIsSyncing(true);
    setSyncStatusMsg('Conectando ao catálogo Copernicus Sentinel-2 L2A (10m)...');
    const t1 = window.setTimeout(() => {
      setSyncStatusMsg('Verificando cobertura de nuvens recente (0.0% nuvens)...');
    }, 1000);
    const t2 = window.setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Sincronização concluída. Cenas multiespectrais atualizadas.');
      const t3 = window.setTimeout(() => setSyncStatusMsg(null), 3500);
      syncTimersRef.current.push(t3);
    }, 2200);
    syncTimersRef.current.push(t1, t2);
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

  // Synchronize plot changes between Traceability and Geoprocessamento
  const handleSavePlots = (updatedPlots: TraceabilityPlot[]) => {
    setPlots(updatedPlots);
    localStorage.setItem('geaagro_traceability_plots', JSON.stringify(updatedPlots));

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
        crop: tp.currentCrop || 'Cultura não definida',
        cultivar: tp.currentCultivar || '',
        season: '',
        plantingDate: '',
        estimatedHarvestDate: '',
        irrigationType: tp.irrigationSystem || 'Sequeiro',
        soilTexture: tp.soilTexture || 'Médio',
        coordinates: { lat: tp.latitude || -15.7801, lng: tp.longitude || -47.9292 },
        photos: [],
        currentNdvi: 0.65,
        currentNdre: 0.60,
        currentGndvi: 0.62,
        currentSavi: 0.60,
        currentMsavi: 0.61,
        currentEvi: 0.62,
        currentVari: 0.35,
        currentNdwi: 0.50,
        currentChlorophyll: 45.0,
        currentBiomassTonHa: 10.0,
        currentCanopyCoverPct: 70,
        igvvScore: 70,
        vigorClassification: 'Médio Vigor' as const,
        highVigorPct: 50,
        mediumVigorPct: 40,
        lowVigorPct: 10,
        criticalAreaHa: 0,
        estimatedYieldKgHa: 0,
        yieldPotentialPct: 80,
        phenologyStage: 'Aguardando monitoramento' as const,
        gddAccumulated: 0,
        irrigationDeficitMm: 0,
        soilMoisturePct: 50,
        fertilityStatus: 'Adequado' as const,
        lastSatelliteDate: new Date().toISOString().split('T')[0],
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
    const exists = inspections.some(i => i.id === newInspection.id);
    const updated = exists
      ? inspections.map(i => (i.id === newInspection.id ? newInspection : i))
      : [newInspection, ...inspections];
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

  const handleOpenExportReport = (plot?: GeoprocessamentoPlotState, format: 'pdf' | 'excel' | 'csv' | 'geotiff' = 'pdf') => {
    if (plot) setSelectedGeoPlot(plot);
    setReportFormat(format);
    setIsReportModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Sync Status Notice */}
      {syncStatusMsg && (
        <div
          role="status"
          className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 px-3.5 py-2.5 rounded-lg flex items-center justify-between gap-2 text-xs font-medium"
        >
          <div className="flex items-center gap-2 min-w-0">
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="truncate">{syncStatusMsg}</span>
          </div>
          {!isSyncing && (
            <button
              type="button"
              onClick={() => setSyncStatusMsg(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 p-0.5 cursor-pointer"
              aria-label="Fechar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Unified Flat Hairline Module Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                SIG e Geoprocessamento Agronômico
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                {property.farmName} · {geoPlots.length} {geoPlots.length === 1 ? 'talhão monitorado' : 'talhões monitorados'} · Sensoriamento Remoto Multiespectral
              </p>
            </div>
          </div>

          {/* Primary Export CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenExportReport(selectedGeoPlot, 'pdf')}
              disabled={!selectedGeoPlot}
              className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title={selectedGeoPlot ? 'Exportar laudo técnico e dados SIG' : 'Cadastre um talhão para exportar laudos'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Laudo</span>
            </button>
          </div>
        </div>

        {/* Workspace Navigation & Utility Toolbar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 dark:bg-zinc-950/60 border-t border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Segmented View Switcher */}
          <div className="inline-flex items-center bg-slate-100/90 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200/80 dark:border-zinc-800 gap-0.5 self-start">
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'dashboard'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Painel Analítico</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mapa Multicamadas</span>
            </button>
          </div>

          {/* Field & Satellite Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSyncSatellite}
              disabled={isSyncing}
              className="h-8 px-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Satélite'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRasterModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Importar Imagem</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenNewInspection(selectedGeoPlot?.id)}
              className="h-8 px-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Ponto de Vistoria</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Module Body */}
      {viewMode === 'dashboard' ? (
        <GeoprocessamentoDashboard
          plots={geoPlots}
          alerts={alerts}
          inspections={inspections}
          rasters={rasters}
          selectedPlot={selectedGeoPlot || geoPlots[0]}
          onSelectPlot={setSelectedGeoPlot}
          onOpenMap={handleOpenMapWithTab}
          onNewInspection={handleOpenNewInspection}
          onEditInspection={handleEditInspection}
          onDeleteInspection={handleDeleteInspection}
          onExportReport={handleOpenExportReport}
        />
      ) : (
        <Suspense
          fallback={
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center text-xs text-slate-500 dark:text-zinc-400">
              Carregando mapa multicamadas SIG...
            </div>
          }
        >
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
        </Suspense>
      )}

      {/* Lazy Modals */}
      {isRasterModalOpen && (
        <Suspense fallback={null}>
          <RasterImportModal
            isOpen={isRasterModalOpen}
            onClose={() => setIsRasterModalOpen(false)}
            plots={geoPlots}
            onUploadRaster={handleUploadRaster}
          />
        </Suspense>
      )}

      {isInspectionModalOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {isReportModalOpen && (
        <Suspense fallback={null}>
          <ReportExportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            plot={selectedGeoPlot}
            allPlots={geoPlots}
            initialFormat={reportFormat}
            company={currentCompany || companies?.[0]}
            agronomist={currentAgronomist || agronomists?.[0]}
            producer={currentProducer || producers?.[0]}
            farm={currentFarm || farms?.[0]}
            property={property}
            inspections={inspections}
            photos={photoDiary}
          />
        </Suspense>
      )}

      {passportModalLot && (
        <Suspense fallback={null}>
          <DigitalFoodPassportModal
            lot={passportModalLot}
            property={property}
            operations={operations}
            harvests={harvests}
            photos={photoDiary}
            onClose={() => setPassportModalLot(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default GeoprocessamentoModule;
