import React, { useState, Suspense } from 'react';
import {
  Compass,
  Leaf,
  AlertTriangle,
  MapPin,
  Calendar,
  FlaskConical,
  Camera,
  Sparkles,
  Download,
  Eye,
  Activity,
  Droplets,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  FileImage
} from 'lucide-react';
import {
  GeoprocessamentoPlotState,
  GeoprocessamentoAlert,
  GeoprocessamentoInspectionPoint,
  GeoprocessamentoRasterUpload,
  TEMPORAL_STAGES_PROGRESSION
} from '../../data/geoprocessamentoData';
import { PrescriptionMapResult } from '../../utils/spatialInterpolationEngine';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

const VraPrescriptionModal = lazyWithRetry(() =>
  import('../soil/VraPrescriptionModal').then(m => ({ default: m.VraPrescriptionModal }))
);
const VraGridCanvasMap = lazyWithRetry(() =>
  import('./VraGridCanvasMap').then(m => ({ default: m.VraGridCanvasMap }))
);

const FALLBACK_PLOT: GeoprocessamentoPlotState = {
  id: '',
  code: 'TL-00',
  name: 'Nenhum Talhão Selecionado',
  farmName: '',
  areaHa: 0,
  crop: 'Não informado',
  cultivar: '',
  season: '',
  plantingDate: '',
  estimatedHarvestDate: '',
  irrigationType: 'Sequeiro',
  soilTexture: '',
  coordinates: { lat: 0, lng: 0 },
  photos: [],
  currentNdvi: 0,
  currentNdre: 0,
  currentGndvi: 0,
  currentSavi: 0,
  currentMsavi: 0,
  currentEvi: 0,
  currentVari: 0,
  currentNdwi: 0,
  currentChlorophyll: 0,
  currentBiomassTonHa: 0,
  currentCanopyCoverPct: 0,
  igvvScore: 0,
  vigorClassification: 'Médio Vigor',
  highVigorPct: 0,
  mediumVigorPct: 0,
  lowVigorPct: 0,
  criticalAreaHa: 0,
  estimatedYieldKgHa: 0,
  yieldPotentialPct: 0,
  phenologyStage: 'Não informado',
  gddAccumulated: 0,
  irrigationDeficitMm: 0,
  soilMoisturePct: 0,
  fertilityStatus: 'Adequado',
  lastSatelliteDate: '',
  cloudCoverPct: 0.0,
};

interface GeoprocessamentoDashboardProps {
  plots: GeoprocessamentoPlotState[];
  alerts: GeoprocessamentoAlert[];
  inspections: GeoprocessamentoInspectionPoint[];
  rasters: GeoprocessamentoRasterUpload[];
  selectedPlot?: GeoprocessamentoPlotState;
  onSelectPlot: (plot: GeoprocessamentoPlotState) => void;
  onOpenMap: (subTab?: string) => void;
  onNewInspection: (plotId: string) => void;
  onEditInspection?: (inspection: GeoprocessamentoInspectionPoint) => void;
  onDeleteInspection?: (id: string) => void;
  onExportReport: (plot: GeoprocessamentoPlotState, format: 'pdf' | 'excel' | 'csv' | 'geotiff') => void;
}

const ANALYSIS_TABS = [
  { id: 'geral' as const, label: 'Índices Espectrais', icon: Leaf },
  { id: 'fenologia' as const, label: 'Fenologia', icon: Calendar },
  { id: 'irrigacao' as const, label: 'Status Hídrico', icon: Droplets },
  { id: 'fertilidade' as const, label: 'Fertilidade & VRA', icon: FlaskConical },
  { id: 'gemeo' as const, label: 'Gêmeo Digital 360°', icon: Sparkles },
];

export const GeoprocessamentoDashboard: React.FC<GeoprocessamentoDashboardProps> = ({
  plots,
  alerts,
  inspections,
  rasters,
  selectedPlot: propSelectedPlot,
  onSelectPlot,
  onOpenMap,
  onNewInspection,
  onEditInspection,
  onDeleteInspection,
  onExportReport,
}) => {
  const selectedPlot = propSelectedPlot || (plots.length > 0 ? plots[0] : FALLBACK_PLOT);
  const [activeAnalysisView, setActiveAnalysisView] = useState<'geral' | 'fenologia' | 'irrigacao' | 'fertilidade' | 'gemeo'>('geral');
  const [isInspectionMenuOpen, setIsInspectionMenuOpen] = useState<boolean>(true);
  const [inspectionFilter, setInspectionFilter] = useState<'all' | 'pendente' | 'em_vistoria' | 'concluido'>('all');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isVraModalOpen, setIsVraModalOpen] = useState<boolean>(false);
  const [vraResult, setVraResult] = useState<PrescriptionMapResult | null>(null);

  // Aggregated KPIs
  const totalMonitoredPlots = plots.length;
  const totalMonitoredAreaHa = plots.reduce((acc, p) => acc + p.areaHa, 0);
  const averageNdviFarm = (plots.reduce((acc, p) => acc + p.currentNdvi, 0) / (plots.length || 1)).toFixed(2);
  const averageIgvv = Math.round(plots.reduce((acc, p) => acc + p.igvvScore, 0) / (plots.length || 1));
  const totalCriticalAreaHa = plots.reduce((acc, p) => acc + p.criticalAreaHa, 0).toFixed(2);
  const activeAlertsCount = alerts.filter(a => !a.isResolved).length;
  const pendingInspectionsCount = inspections.filter(i => i.status === 'pendente').length;

  if (plots.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-8 text-center space-y-3">
        <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800/60">
          <Compass className="w-5 h-5" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Nenhum Talhão Cadastrado no Geoprocessamento
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Desenhe um polígono no Mapa Multicamadas ou sincronize os talhões cadastrados para habilitar os índices multiespectrais, zoneamento de vigor e prescrição VRA.
          </p>
        </div>
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onOpenMap('draw')}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Desenhar Talhão no Mapa SIG</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredInspections = inspections.filter(insp =>
    inspectionFilter === 'all' ? true : insp.status === inspectionFilter
  );

  const selectedPlotRasters = rasters.filter(r => !r.plotId || r.plotId === selectedPlot.id);

  const spectralIndices = [
    { key: 'NDVI', value: selectedPlot.currentNdvi.toFixed(2), desc: 'Vigor Geral', accent: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'NDRE', value: selectedPlot.currentNdre.toFixed(2), desc: 'Borda do Vermelho', accent: 'text-slate-900 dark:text-zinc-100' },
    { key: 'GNDVI', value: selectedPlot.currentGndvi.toFixed(2), desc: 'Sensível a Nitrogênio', accent: 'text-slate-900 dark:text-zinc-100' },
    { key: 'SAVI', value: selectedPlot.currentSavi.toFixed(2), desc: 'Ajuste de Solo', accent: 'text-slate-900 dark:text-zinc-100' },
    { key: 'MSAVI', value: selectedPlot.currentMsavi.toFixed(2), desc: 'Emergência Inicial', accent: 'text-slate-900 dark:text-zinc-100' },
    { key: 'EVI', value: selectedPlot.currentEvi.toFixed(2), desc: 'Canópia Densa', accent: 'text-slate-900 dark:text-zinc-100' },
    { key: 'VARI', value: selectedPlot.currentVari.toFixed(2), desc: 'Visível (RGB Drone)', accent: 'text-slate-900 dark:text-zinc-100' },
    { key: 'NDWI', value: selectedPlot.currentNdwi.toFixed(2), desc: 'Hidratação Foliar', accent: 'text-sky-600 dark:text-sky-400' },
    { key: 'Clorofila', value: `${selectedPlot.currentChlorophyll}`, desc: 'SPAD Estimado', accent: 'text-slate-900 dark:text-zinc-100' },
    { key: 'Biomassa', value: `${selectedPlot.currentBiomassTonHa}`, desc: 'ton/ha estimadas', accent: 'text-slate-900 dark:text-zinc-100' },
  ];

  return (
    <div className="space-y-4">
      {/* Unified Hairline 6-Metric KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800 overflow-hidden">
        <div className="p-3.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium mb-1">
            <span>Talhões</span>
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {totalMonitoredPlots}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums mt-0.5">
            {totalMonitoredAreaHa.toFixed(1)} ha delimitados
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium mb-1">
            <span>NDVI Médio</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {averageNdviFarm}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
            {selectedPlot.lastSatelliteDate ? `Sentinel-2 · ${selectedPlot.lastSatelliteDate}` : 'Sentinel-2 L2A'}
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium mb-1">
            <span>Índice IGVV</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {averageIgvv} <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            Vigor vegetativo
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium mb-1">
            <span>Áreas Críticas</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            {totalCriticalAreaHa} <span className="text-xs font-normal text-slate-400">ha</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            NDVI &lt; 0.50 persistente
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium mb-1">
            <span>Alertas</span>
            <Activity className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-lg font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
            {activeAlertsCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {activeAlertsCount > 0 ? 'Requerem ação' : 'Sem alertas ativos'}
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium mb-1">
            <span>Vistorias</span>
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-lg font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
            {pendingInspectionsCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
            {inspections.length} pontos no total
          </div>
        </div>
      </div>

      {/* Main Content Area: Plot Selector & Detailed Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Monitored Plots List */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Talhões Monitorados</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {plots.length} {plots.length === 1 ? 'ativo' : 'ativos'}
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
              {plots.map(p => {
                const isSelected = selectedPlot.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPlot(p)}
                    className={`w-full p-3 rounded-lg border transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shrink-0">
                            {p.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                            {p.crop}{p.cultivar ? ` · ${p.cultivar}` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate tabular-nums">
                          {p.name} · {p.areaHa} ha
                        </p>
                      </div>

                      <span className={`text-[10px] font-semibold font-mono tabular-nums px-1.5 py-0.5 rounded-md border shrink-0 ${
                        p.currentNdvi >= 0.75
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                          : p.currentNdvi >= 0.60
                            ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                      }`}>
                        NDVI {p.currentNdvi.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-1 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        <span>{p.vigorClassification}</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">IGVV {p.igvvScore}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-sm overflow-hidden flex">
                        <div style={{ width: `${p.highVigorPct}%` }} className="bg-emerald-500 h-full" title={`Alto Vigor: ${p.highVigorPct}%`} />
                        <div style={{ width: `${p.mediumVigorPct}%` }} className="bg-amber-400 h-full" title={`Médio Vigor: ${p.mediumVigorPct}%`} />
                        <div style={{ width: `${p.lowVigorPct}%` }} className="bg-rose-500 h-full" title={`Baixo Vigor: ${p.lowVigorPct}%`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Spatial Alerts */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Alertas Espaciais</span>
              </h3>
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 tabular-nums">
                {activeAlertsCount} {activeAlertsCount === 1 ? 'ativo' : 'ativos'}
              </span>
            </div>

            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
                Nenhuma anomalia espacial crítica detectada nos talhões monitorados.
              </p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 3).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-xs text-left ${
                      alert.severity === 'critico'
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                        : alert.severity === 'grave'
                          ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                          : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        [{alert.plotCode}] {alert.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 capitalize shrink-0">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-800 text-[11px]">
                      <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                        {alert.affectedAreaHa} ha ({alert.affectedAreaPct}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => onNewInspection(alert.plotId)}
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Gerar Vistoria</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspection Points Collapsible Section */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div
              onClick={() => setIsInspectionMenuOpen(!isInspectionMenuOpen)}
              className="p-4 flex items-center justify-between gap-2 cursor-pointer select-none hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              role="button"
              aria-expanded={isInspectionMenuOpen}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    Pontos de Vistoria e Amostragem
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    {inspections.length} {inspections.length === 1 ? 'ponto registrado' : 'pontos registrados'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewInspection(selectedPlot.id);
                  }}
                  className="h-7 px-2.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo</span>
                </button>
                <span className="p-1 text-slate-400">
                  {isInspectionMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </div>
            </div>

            {isInspectionMenuOpen && (
              <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-100 dark:border-zinc-800">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
                  {([
                    { id: 'all', label: `Todos (${inspections.length})` },
                    { id: 'pendente', label: `Pendentes (${inspections.filter(i => i.status === 'pendente').length})` },
                    { id: 'em_vistoria', label: `Em Vistoria (${inspections.filter(i => i.status === 'em_vistoria').length})` },
                    { id: 'concluido', label: `Concluídos (${inspections.filter(i => i.status === 'concluido').length})` },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setInspectionFilter(tab.id)}
                      className={`h-7 px-2 rounded-md font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap tabular-nums ${
                        inspectionFilter === tab.id
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Inspection List */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                  {filteredInspections.length === 0 ? (
                    <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                      Nenhum ponto encontrado para o filtro selecionado.
                    </div>
                  ) : (
                    filteredInspections.map(insp => {
                      const inspPhotos = insp.photos || (insp.photoUrl ? [insp.photoUrl] : []);
                      const isConfirming = confirmingDeleteId === insp.id;

                      return (
                        <div
                          key={insp.id}
                          className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50 text-xs space-y-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                {insp.plotCode}
                              </span>
                              <span className={`font-medium px-1.5 py-0.5 rounded border ${
                                insp.status === 'concluido'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                  : insp.status === 'em_vistoria'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                              }`}>
                                {insp.status === 'concluido' ? 'Concluído' : insp.status === 'em_vistoria' ? 'Em Vistoria' : 'Pendente'}
                              </span>
                              <span className="text-slate-500 dark:text-zinc-400 capitalize">
                                · {insp.severity}
                              </span>
                            </div>
                            <h5 className="font-semibold text-slate-900 dark:text-zinc-100 mt-1">
                              {insp.name}
                            </h5>
                          </div>

                          {insp.observations && (
                            <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                              {insp.observations}
                            </p>
                          )}

                          {inspPhotos.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                              {inspPhotos.map((pUrl, pIdx) => (
                                <img
                                  key={pIdx}
                                  src={pUrl}
                                  alt="Foto da vistoria"
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 object-cover rounded-md border border-slate-200 dark:border-zinc-700 shrink-0"
                                />
                              ))}
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 ml-1 tabular-nums">
                                {inspPhotos.length} {inspPhotos.length === 1 ? 'foto' : 'fotos'}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-800 text-[11px]">
                            <span className="text-slate-400 font-mono tabular-nums text-[10px]">
                              {insp.lat.toFixed(4)}, {insp.lng.toFixed(4)}
                            </span>

                            <div className="flex items-center gap-1">
                              {isConfirming ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteInspection?.(insp.id);
                                      setConfirmingDeleteId(null);
                                    }}
                                    className="h-6 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-medium cursor-pointer"
                                  >
                                    Excluir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmingDeleteId(null)}
                                    className="h-6 px-2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-medium cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  {onEditInspection && (
                                    <button
                                      type="button"
                                      onClick={() => onEditInspection(insp)}
                                      className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Editar</span>
                                    </button>
                                  )}
                                  {onDeleteInspection && (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmingDeleteId(insp.id)}
                                      className="h-7 w-7 rounded-md flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                      title="Excluir ponto"
                                      aria-label={`Excluir ${insp.name}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Plot Analytical Workspace */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
            {/* Selected Plot Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 px-2.5 min-w-[44px] rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono font-semibold text-xs shrink-0">
                  {selectedPlot.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {selectedPlot.name}
                    </h3>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      {selectedPlot.crop}{selectedPlot.cultivar ? ` · ${selectedPlot.cultivar}` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate tabular-nums">
                    {[selectedPlot.farmName, `${selectedPlot.areaHa} ha`, selectedPlot.irrigationType, selectedPlot.season].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenMap('ndvi')}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver no Mapa</span>
                </button>
                <button
                  type="button"
                  onClick={() => onExportReport(selectedPlot, 'pdf')}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Laudo PDF</span>
                </button>
              </div>
            </div>

            {/* Clean Single-Row Analytical Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-zinc-800">
              {ANALYSIS_TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeAnalysisView === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAnalysisView(tab.id)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: ÍNDICES ESPECTRAIS */}
            {activeAnalysisView === 'geral' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      10 Índices Biofísicos da Lavoura
                    </h4>
                    {selectedPlot.lastSatelliteDate && (
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        Passagem: {selectedPlot.lastSatelliteDate}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {spectralIndices.map(idx => (
                      <div
                        key={idx.key}
                        className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 text-left"
                      >
                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                          {idx.key}
                        </span>
                        <span className={`text-base font-semibold tabular-nums block mt-0.5 ${idx.accent}`}>
                          {idx.value}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5 truncate">
                          {idx.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vigor Distribution & Yield Potential */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-4 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mb-3">
                      Zoneamento de Vigor Vegetativo
                    </h5>
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: 'Alto Vigor (NDVI > 0.70)', pct: selectedPlot.highVigorPct, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
                        { label: 'Médio Vigor (0.50 a 0.70)', pct: selectedPlot.mediumVigorPct, color: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-400' },
                        { label: 'Baixo Vigor (< 0.50)', pct: selectedPlot.lowVigorPct, color: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400' },
                      ].map(row => (
                        <div key={row.label}>
                          <div className="flex justify-between mb-1 tabular-nums">
                            <span className={`font-medium ${row.text}`}>{row.label}</span>
                            <span className="text-slate-600 dark:text-zinc-300">
                              {row.pct}% ({((selectedPlot.areaHa * row.pct) / 100).toFixed(2)} ha)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-sm overflow-hidden">
                            <div style={{ width: `${row.pct}%` }} className={`${row.color} h-full`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-4 rounded-lg border border-slate-200/70 dark:border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          Produtividade Estimada da Safra
                        </h5>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {selectedPlot.yieldPotentialPct}% do teto
                        </span>
                      </div>
                      <div className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {selectedPlot.estimatedYieldKgHa.toLocaleString('pt-BR')}{' '}
                        <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">kg/ha</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        Projeção baseada na curva de acúmulo de biomassa e interceptação de radiação fotossinteticamente ativa (fAPAR).
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between text-xs tabular-nums">
                      <span className="text-slate-600 dark:text-zinc-400">Índice GeaAgro (IGVV)</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedPlot.igvvScore} / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FENOLOGIA & EVOLUÇÃO TEMPORAL */}
            {activeAnalysisView === 'fenologia' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block">
                      Estádio Atual da Lavoura
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                      {selectedPlot.phenologyStage}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                      GDD acumulado: <strong className="font-medium text-slate-800 dark:text-zinc-200">{selectedPlot.gddAccumulated}°C/dia</strong>
                      {selectedPlot.plantingDate ? ` · Plantio em ${selectedPlot.plantingDate}` : ''}
                    </p>
                  </div>

                  {selectedPlot.estimatedHarvestDate && (
                    <span className="px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 self-start sm:self-auto tabular-nums">
                      Colheita prevista: {selectedPlot.estimatedHarvestDate}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-[11px] font-medium text-slate-500 dark:text-zinc-400 border-b border-slate-200/80 dark:border-zinc-800">
                      <tr>
                        <th className="px-3 py-2.5">Fase Fenológica</th>
                        <th className="px-3 py-2.5">Data</th>
                        <th className="px-3 py-2.5 text-right">DAP</th>
                        <th className="px-3 py-2.5 text-right">NDVI Real</th>
                        <th className="px-3 py-2.5 text-right">NDVI Alvo</th>
                        <th className="px-3 py-2.5 text-right">NDRE</th>
                        <th className="px-3 py-2.5 text-right">Biomassa</th>
                        <th className="px-3 py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                      {TEMPORAL_STAGES_PROGRESSION.map((stage, idx) => {
                        const isCurrent = stage.stage === selectedPlot.phenologyStage;
                        const diff = stage.ndvi - stage.targetExpectedNdvi;
                        return (
                          <tr
                            key={idx}
                            className={isCurrent ? 'bg-emerald-50/50 dark:bg-emerald-950/25' : 'hover:bg-slate-50/60 dark:hover:bg-zinc-800/30'}
                          >
                            <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                              <span>{stage.stage}</span>
                              {isCurrent && (
                                <span className="ml-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                  (Atual)
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 dark:text-zinc-400">{stage.date}</td>
                            <td className="px-3 py-2.5 text-right text-slate-700 dark:text-zinc-300">{stage.daysAfterPlanting} d</td>
                            <td className="px-3 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{stage.ndvi.toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-right text-slate-500 dark:text-zinc-400">{stage.targetExpectedNdvi.toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-right text-slate-700 dark:text-zinc-300">{stage.ndre.toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-right text-slate-700 dark:text-zinc-300">{stage.biomass} t/ha</td>
                            <td className="px-3 py-2.5 text-right">
                              <span className={`text-[11px] font-medium ${
                                diff >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                              }`}>
                                {diff >= 0 ? 'Conforme' : 'Déficit'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: STATUS HÍDRICO & IRRIGAÇÃO */}
            {activeAnalysisView === 'irrigacao' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400 block">
                      NDWI (Teor Hídrico Foliar)
                    </span>
                    <span className="text-xl font-semibold text-sky-600 dark:text-sky-400 tabular-nums block mt-0.5">
                      {selectedPlot.currentNdwi.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      Folhas túrgidas
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                      Umidade Retida no Solo
                    </span>
                    <span className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block mt-0.5">
                      {selectedPlot.soilMoisturePct}%
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      Capacidade de campo
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                      Déficit Hídrico do Talhão
                    </span>
                    <span className={`text-xl font-semibold tabular-nums block mt-0.5 ${
                      selectedPlot.irrigationDeficitMm > 5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-zinc-100'
                    }`}>
                      {selectedPlot.irrigationDeficitMm} mm
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      {selectedPlot.irrigationDeficitMm > 0 ? 'Repor na próxima lâmina' : 'Equilíbrio hídrico'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-4 rounded-lg border border-slate-200/70 dark:border-zinc-800 text-xs space-y-1.5">
                  <h5 className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Cruzamento Espacial: NDVI × Evapotranspiração (ET₀) × Chuva</span>
                  </h5>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    A correlação multiespectral indica que a lâmina média aplicada de <strong className="font-medium text-slate-800 dark:text-zinc-200">4.2 mm/dia</strong> no sistema de <span className="italic">{selectedPlot.irrigationType}</span> mantém a turgescência foliar sem lixiviação na camada radicular explorada.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: FERTILIDADE & SOLO / VRA */}
            {activeAnalysisView === 'fertilidade' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-start gap-2.5">
                  <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 block">
                      Status Nutricional por Sensoriamento
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                      {selectedPlot.fertilityStatus}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Índice GNDVI cruzado com a análise de solo ({selectedPlot.soilTexture || 'textura média'}). Manchas com clorofila abaixo da média respondem à adubação nitrogenada em taxa variável.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Textura do Solo</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm mt-0.5 block">
                      {selectedPlot.soilTexture || 'Médio'}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Retenção de cátions calibrada</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Clorofila Funcional</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums mt-0.5 block">
                      {selectedPlot.currentChlorophyll} SPAD
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Atividade fotossintética</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Eficiência Nutricional</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm tabular-nums mt-0.5 block">88%</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Resposta à fertirrigação</p>
                  </div>
                </div>

                {/* VRA Interpolation Grid Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Mapeamento Espacial de Nutrientes e Taxa Variável (VRA)</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Interpolação por IDW e Krigagem Ordinária com exportação para controladores ISOXML.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVraModalOpen(true)}
                      className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gerar Grid de Nutrientes</span>
                    </button>
                  </div>

                  <Suspense
                    fallback={
                      <div className="h-[440px] rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-xs text-slate-500">
                        Carregando mapa de interpolação VRA...
                      </div>
                    }
                  >
                    <VraGridCanvasMap
                      prescriptionResult={vraResult}
                      height="440px"
                      nutrientName={vraResult?.metadata.nutrientName || vraResult?.metadata.nutrient || 'Fósforo (P)'}
                      plotName={selectedPlot.name}
                      farmName={selectedPlot.farmName}
                      onOpenModalToReinterpolate={() => setIsVraModalOpen(true)}
                    />
                  </Suspense>
                </div>
              </div>
            )}

            {/* TAB 5: GÊMEO DIGITAL 360° */}
            {activeAnalysisView === 'gemeo' && (
              <div className="space-y-4">
                <div className="bg-slate-50/70 dark:bg-zinc-950/60 p-4 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        Gêmeo Digital · Talhão {selectedPlot.code}
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      Safra Atual
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Consolidação da série histórica de satélite, imagens raster importadas, fotos georreferenciadas de campo e inspeções agronômicas deste talhão.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/70 dark:border-zinc-800 text-xs tabular-nums">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Fotografias</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                        {selectedPlot.photos.length} registradas
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Vistorias</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                        {inspections.filter(i => i.plotId === selectedPlot.id).length} pontos
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Rasters Importados</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                        {selectedPlotRasters.length} cenas
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Rastreabilidade</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                        100% vinculada
                      </span>
                    </div>
                  </div>
                </div>

                {/* Imported Rasters List (if any) */}
                {selectedPlotRasters.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <FileImage className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Imagens Raster Processadas ({selectedPlotRasters.length})</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedPlotRasters.map(raster => (
                        <div
                          key={raster.id}
                          className="p-2.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-zinc-100 truncate">{raster.fileName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                              {raster.captureDate} · {raster.resolutionMeters} m/px · {raster.fileSize}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                            NDVI {raster.averageNdvi.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Diary Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Diário Fotográfico e Evidências de Vistoria</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => onNewInspection(selectedPlot.id)}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Foto</span>
                    </button>
                  </div>

                  {(() => {
                    const plotInspections = inspections.filter(i => i.plotId === selectedPlot.id);
                    const inspectionPhotos = plotInspections.flatMap(insp => {
                      const allPhotos = insp.photos || (insp.photoUrl ? [insp.photoUrl] : []);
                      return allPhotos.map((url, idx) => ({
                        id: `insp-photo-${insp.id}-${idx}`,
                        url,
                        caption: `${insp.name} (${insp.status === 'concluido' ? 'Concluído' : 'Em Vistoria'})${insp.observations ? `: ${insp.observations}` : ''}`,
                        date: insp.dateInspected || insp.dateCreated,
                        ndviPoint: insp.associatedIndexValue,
                        inspection: insp
                      }));
                    });

                    const allGalleryPhotos = [
                      ...selectedPlot.photos.map(p => ({ ...p, inspection: null as GeoprocessamentoInspectionPoint | null })),
                      ...inspectionPhotos
                    ];

                    if (allGalleryPhotos.length === 0) {
                      return (
                        <div className="p-6 text-center rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                          Nenhuma fotografia anexada a este talhão ainda. Clique em &ldquo;Adicionar Foto&rdquo; para registrar uma evidência de campo.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allGalleryPhotos.map(photo => (
                          <div
                            key={photo.id}
                            className="rounded-lg border border-slate-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900"
                          >
                            <div className="relative h-40 bg-zinc-950">
                              <img
                                src={photo.url}
                                alt={photo.caption}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {photo.inspection && (
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                  {onEditInspection && (
                                    <button
                                      type="button"
                                      onClick={() => onEditInspection(photo.inspection!)}
                                      className="h-7 w-7 rounded-md bg-black/65 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
                                      title="Editar vistoria"
                                      aria-label="Editar vistoria"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteInspection && (
                                    confirmingDeleteId === photo.inspection.id ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteInspection(photo.inspection!.id);
                                          setConfirmingDeleteId(null);
                                        }}
                                        className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-medium cursor-pointer"
                                      >
                                        Confirmar
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmingDeleteId(photo.inspection!.id)}
                                        className="h-7 w-7 rounded-md bg-rose-600/85 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                                        title="Excluir vistoria"
                                        aria-label="Excluir vistoria"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="p-3 text-xs">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1 tabular-nums">
                                <span>{photo.date}</span>
                                {photo.ndviPoint !== undefined && (
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    NDVI {photo.ndviPoint}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 dark:text-zinc-300 line-clamp-2">
                                {photo.caption}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Prescrição VRA */}
      {isVraModalOpen && (
        <Suspense fallback={null}>
          <VraPrescriptionModal
            isOpen={isVraModalOpen}
            onClose={() => setIsVraModalOpen(false)}
            plotName={selectedPlot.name}
            farmName={selectedPlot.farmName}
            onPrescriptionGenerated={(res) => setVraResult(res)}
          />
        </Suspense>
      )}
    </div>
  );
};
