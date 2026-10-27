import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Layers,
  Leaf,
  AlertTriangle,
  MapPin,
  Calendar,
  CloudRain,
  FlaskConical,
  Camera,
  FileText,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle2,
  Activity,
  Sliders,
  Maximize2,
  Wheat,
  Droplets,
  Sprout,
  BarChart3,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  Check,
  X,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Edit3,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import {
  GeoprocessamentoPlotState,
  GeoprocessamentoAlert,
  GeoprocessamentoInspectionPoint,
  GeoprocessamentoRasterUpload,
  TEMPORAL_STAGES_PROGRESSION
} from '../../data/geoprocessamentoData';
import { VraPrescriptionModal } from '../soil/VraPrescriptionModal';
import { VraGridCanvasMap } from './VraGridCanvasMap';
import { PrescriptionMapResult } from '../../utils/spatialInterpolationEngine';

const FALLBACK_PLOT: GeoprocessamentoPlotState = {
  id: 'geo-tl-01',
  code: 'TL-01',
  name: 'Talhão Pivô Central 01',
  farmName: 'Fazenda Santa Helena HF & Grãos',
  areaHa: 120,
  crop: 'Soja',
  cultivar: 'M 8349 IPRO',
  season: '2025/2026',
  plantingDate: '2025-10-15',
  estimatedHarvestDate: '2026-02-28',
  irrigationType: 'Pivô Central',
  soilTexture: 'Argiloso (48% Argila)',
  coordinates: { lat: -12.5833, lng: -55.7167 },
  photos: [],
  currentNdvi: 0.82,
  currentNdre: 0.74,
  currentGndvi: 0.78,
  currentSavi: 0.76,
  currentMsavi: 0.75,
  currentEvi: 0.79,
  currentVari: 0.65,
  currentNdwi: 0.64,
  currentChlorophyll: 62.5,
  currentBiomassTonHa: 26.5,
  currentCanopyCoverPct: 92,
  igvvScore: 88,
  vigorClassification: 'Alto Vigor',
  highVigorPct: 82,
  mediumVigorPct: 15,
  lowVigorPct: 3,
  criticalAreaHa: 3.6,
  estimatedYieldKgHa: 4250,
  yieldPotentialPct: 95,
  phenologyStage: 'Enchimento de Grãos',
  gddAccumulated: 1120,
  irrigationDeficitMm: 0,
  soilMoisturePct: 78,
  fertilityStatus: 'Adequado',
  lastSatelliteDate: '2026-09-20',
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
  const selectedPlot = propSelectedPlot || (plots && plots.length > 0 ? plots[0] : FALLBACK_PLOT);
  const [activeAnalysisView, setActiveAnalysisView] = useState<'geral' | 'fenologia' | 'irrigacao' | 'fertilidade' | 'gemeo'>('geral');
  const [isAnalysisMenuOpen, setIsAnalysisMenuOpen] = useState<boolean>(false);
  const analysisMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (analysisMenuRef.current && !analysisMenuRef.current.contains(e.target as Node)) {
        setIsAnalysisMenuOpen(false);
      }
    };
    if (isAnalysisMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAnalysisMenuOpen]);

  const ANALYSIS_MODULES = [
    {
      id: 'geral' as const,
      label: 'Índices Espectrais',
      category: 'Sensoriamento Remoto',
      desc: 'NDVI, EVI, SAVI, NDRE, biomassa e 10 índices biofísicos da lavoura',
      icon: Leaf,
      badge: '10 Índices',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
    },
    {
      id: 'fenologia' as const,
      label: 'Evolução Temporal & Fenologia',
      category: 'Série Histórica & Ciclo',
      desc: 'Curva temporal de biomassa, acúmulo térmico (GDD) e estágios fenológicos',
      icon: Calendar,
      badge: 'Série Temporal',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
    },
    {
      id: 'irrigacao' as const,
      label: 'Status Hídrico (NDWI)',
      category: 'Manejo Hídrico & Irrigação',
      desc: 'Teor de água na copa, umidade foliar e mapeamento de déficit hídrico',
      icon: Droplets,
      badge: 'NDWI',
      badgeColor: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300'
    },
    {
      id: 'fertilidade' as const,
      label: 'Fertilidade & Solo',
      category: 'Nutrição & Química do Solo',
      desc: 'Variabilidade espacial, CTC, pH, V%, matéria orgânica e zonas de manejo',
      icon: FlaskConical,
      badge: 'Química do Solo',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
    },
    {
      id: 'gemeo' as const,
      label: 'Gêmeo Digital 360°',
      category: 'Simulação & IA Espacial',
      desc: 'Simulação 3D, estresse agronômico em tempo real e projeção de produtividade',
      icon: Sparkles,
      badge: 'IA 360°',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
    }
  ];

  const currentModule = ANALYSIS_MODULES.find(m => m.id === activeAnalysisView) || ANALYSIS_MODULES[0];
  const CurrentIcon = currentModule.icon;
  const [selectedThematicMap, setSelectedThematicMap] = useState<'ndvi' | 'vigor' | 'biomassa' | 'estresse_hidrico' | 'nutricional' | 'variabilidade' | 'produtividade'>('ndvi');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isInspectionMenuOpen, setIsInspectionMenuOpen] = useState<boolean>(true);
  const [inspectionFilter, setInspectionFilter] = useState<'all' | 'pendente' | 'em_vistoria' | 'concluido'>('all');
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

  const handleSyncSatellite = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Conectando ao catálogo Copernicus Sentinel-2 L2A (10m)...');
    setTimeout(() => {
      setSyncStatusMsg('Verificando cobertura de nuvens recente (Passagem: 20/09/2026 - 0.0% nuvens)...');
    }, 1200);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg('Sincronização concluída! Novas cenas multiespectrais armazenadas em cache offline.');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }, 2500);
  };

  if (plots.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-4 shadow-sm animate-fade-in">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-800">
            <Compass className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Nenhum Talhão Cadastrado no Geoprocessamento
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Módulo limpo sem dados pré-preenchidos. Para iniciar a análise multiespectral e de sensoriamento remoto, desenhe um polígono no mapa ou sincronize talhões do Cadastro Técnico.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenMap('draw')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-2 shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Desenhar Talhão no Mapa SIG</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status Feedback if triggered */}
      {syncStatusMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatusMsg}</span>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Talhões</span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totalMonitoredPlots} <span className="text-xs font-normal text-slate-400">({totalMonitoredAreaHa.toFixed(1)} ha)</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">100% delimitados</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">NDVI Médio</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">
            {averageNdviFarm}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Sentinel-2 (20/09)</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Índice IGVV</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {averageIgvv} <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">Vigor GeaAgro</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Áreas Críticas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            {totalCriticalAreaHa} <span className="text-xs font-normal text-slate-400">ha</span>
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">NDVI &lt; 0.50 persistente</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Alertas</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">
            {activeAlertsCount}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Necessitam ação</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vistorias</span>
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">
            {pendingInspectionsCount}
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">Pontos de campo</div>
        </div>
      </div>

      {/* Main Content Area: Plot Selector & Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monitored Plots List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Talhões Monitorados</span>
              </h3>
              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {plots.length} Ativos
              </span>
            </div>

            <div className="space-y-2.5">
              {plots.map(p => {
                const isSelected = selectedPlot.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlot(p)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                            {p.code}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {p.crop} &bull; {p.cultivar}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {p.name} &bull; {p.areaHa} ha
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          p.currentNdvi >= 0.75
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : p.currentNdvi >= 0.60
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          NDVI {p.currentNdvi.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Vigor Mini Progress Bar */}
                    <div className="space-y-1 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                        <span>Vigor ({p.vigorClassification})</span>
                        <span>IGVV: {p.igvvScore}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${p.highVigorPct}%` }} className="bg-emerald-500 h-full" title={`Alto Vigor: ${p.highVigorPct}%`} />
                        <div style={{ width: `${p.mediumVigorPct}%` }} className="bg-amber-400 h-full" title={`Médio Vigor: ${p.mediumVigorPct}%`} />
                        <div style={{ width: `${p.lowVigorPct}%` }} className="bg-rose-500 h-full" title={`Baixo Vigor: ${p.lowVigorPct}%`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Active Alerts Box */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Alertas Espaciais Ativos</span>
              </h3>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                {activeAlertsCount} Alertas
              </span>
            </div>

            <div className="space-y-2">
              {alerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-2xl border text-xs text-left ${
                    alert.severity === 'critico'
                      ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20'
                      : alert.severity === 'grave'
                      ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-800 dark:text-zinc-200">
                      [{alert.plotCode}] {alert.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-white/70 dark:bg-zinc-800">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[10px]">
                    <span className="text-slate-500 dark:text-zinc-400">Área: {alert.affectedAreaHa} ha ({alert.affectedAreaPct}%)</span>
                    <button
                      onClick={() => onNewInspection(alert.plotId)}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Gerar Ponto de Vistoria</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Inspection Points & Field Scouting List - Collapsible Dropdown / Menu Suspenso */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden transition-all">
            {/* Clickable Dropdown Accordion Header */}
            <div
              onClick={() => setIsInspectionMenuOpen(!isInspectionMenuOpen)}
              className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition"
              role="button"
              aria-expanded={isInspectionMenuOpen}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Pontos de Vistoria &amp; Amostragem</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    {inspections.length} {inspections.length === 1 ? 'ponto registrado' : 'pontos registrados'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewInspection(selectedPlot.id);
                  }}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition active:scale-95"
                  title="Cadastrar Novo Ponto de Vistoria"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo Ponto</span>
                </button>
                <div className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg">
                  {isInspectionMenuOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible Content Body */}
            {isInspectionMenuOpen && (
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 dark:border-zinc-800/80 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setInspectionFilter('all')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      inspectionFilter === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    Todos ({inspections.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionFilter('pendente')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      inspectionFilter === 'pendente'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    Pendentes ({inspections.filter(i => i.status === 'pendente').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionFilter('em_vistoria')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      inspectionFilter === 'em_vistoria'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    Em Vistoria ({inspections.filter(i => i.status === 'em_vistoria').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionFilter('concluido')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      inspectionFilter === 'concluido'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    Concluídos ({inspections.filter(i => i.status === 'concluido').length})
                  </button>
                </div>

                {/* Inspection Points List */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {(() => {
                    const filtered = inspections.filter(insp => {
                      if (inspectionFilter === 'all') return true;
                      return insp.status === inspectionFilter;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-400">
                          Nenhum ponto encontrado para o filtro selecionado.
                        </div>
                      );
                    }

                    return filtered.map(insp => {
                      const inspPhotos = insp.photos || (insp.photoUrl ? [insp.photoUrl] : []);
                      return (
                        <div
                          key={insp.id}
                          className="p-3 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 text-xs text-left space-y-2 hover:border-slate-300 dark:hover:border-zinc-700 transition"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200">
                                  {insp.plotCode}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  insp.status === 'concluido'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : insp.status === 'em_vistoria'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                  {insp.status === 'concluido' ? 'Concluído' : insp.status === 'em_vistoria' ? 'Em Vistoria' : 'Pendente'}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 uppercase">
                                  {insp.severity}
                                </span>
                              </div>
                              <h5 className="font-bold text-slate-900 dark:text-white mt-1">
                                {insp.name}
                              </h5>
                            </div>
                          </div>

                          {insp.observations && (
                            <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                              {insp.observations}
                            </p>
                          )}

                          {/* Photo Thumbnail Previews */}
                          {inspPhotos.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-0.5">
                              {inspPhotos.map((pUrl, pIdx) => (
                                <img
                                  key={pIdx}
                                  src={pUrl}
                                  alt="Foto da Vistoria"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-zinc-700 shrink-0 shadow-2xs"
                                />
                              ))}
                              <span className="text-[10px] text-slate-400 ml-1 font-medium">
                                {inspPhotos.length} {inspPhotos.length === 1 ? 'foto' : 'fotos'}
                              </span>
                            </div>
                          )}

                          {/* Card Footer with Edit and Delete actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[11px]">
                            <span className="text-slate-400 font-mono text-[10px]">
                              {insp.lat.toFixed(4)}, {insp.lng.toFixed(4)}
                            </span>

                            <div className="flex items-center gap-1">
                              {onEditInspection && (
                                <button
                                  type="button"
                                  onClick={() => onEditInspection(insp)}
                                  className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold flex items-center gap-1 cursor-pointer transition"
                                  title="Editar Ponto de Vistoria"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Editar</span>
                                </button>
                              )}
                              {onDeleteInspection && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteInspection(insp.id)}
                                  className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                                  title="Apagar Ponto de Vistoria"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Selected Plot Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {/* Selected Plot Hero Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  {selectedPlot.code}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedPlot.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {selectedPlot.crop} &bull; {selectedPlot.cultivar}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {selectedPlot.farmName} &bull; {selectedPlot.areaHa} ha &bull; {selectedPlot.irrigationType} &bull; {selectedPlot.season}
                  </p>
                </div>
              </div>

              {/* Action Buttons for this Plot */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onOpenMap('ndvi')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver no Mapa</span>
                </button>
                <button
                  onClick={() => onExportReport(selectedPlot, 'pdf')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Relatório PDF</span>
                </button>
              </div>
            </div>

            {/* Analytical Modules Dropdown Menu (Menu Suspenso) */}
            <div className="relative pb-1 border-b border-slate-100 dark:border-zinc-800" ref={analysisMenuRef}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Menu Suspenso Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsAnalysisMenuOpen(prev => !prev)}
                  className={`w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isAnalysisMenuOpen
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 hover:bg-slate-100/80 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 border-slate-200/90 dark:border-zinc-700/70 shadow-2xs'
                  }`}
                  aria-expanded={isAnalysisMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CurrentIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider leading-none mb-0.5">
                        Módulo de Análise:
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {currentModule.label}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${currentModule.badgeColor}`}>
                          {currentModule.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500">
                    <span className="text-[10px] font-bold hidden md:inline">Alternar</span>
                    <ChevronDown className={`w-4 h-4 text-slate-600 dark:text-zinc-300 transition-transform duration-200 ${isAnalysisMenuOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
                  </div>
                </button>

                {/* Subtitle / summary of active module */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate max-w-[320px] text-[11px]">{currentModule.desc}</span>
                </div>
              </div>

              {/* Dropdown Popover List (Menu Suspenso Aberto) */}
              {isAnalysisMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-[440px] max-w-[95vw] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[1000] p-2 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    <span>Selecionar Visão Analítica ({ANALYSIS_MODULES.length})</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Offline</span>
                  </div>

                  <div className="space-y-1 pt-1 max-h-[60vh] overflow-y-auto">
                    {ANALYSIS_MODULES.map((mod) => {
                      const isSelected = activeAnalysisView === mod.id;
                      const IconComp = mod.icon;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => {
                            setActiveAnalysisView(mod.id);
                            setIsAnalysisMenuOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-500/40 shadow-2xs'
                              : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                            }`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-xs font-bold ${
                                  isSelected ? 'text-emerald-900 dark:text-emerald-200 font-extrabold' : 'text-slate-900 dark:text-white'
                                }`}>
                                  {mod.label}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${mod.badgeColor}`}>
                                  {mod.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                                {mod.desc}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 mt-1">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-zinc-700" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* TAB CONTENT: GERAL / ÍNDICES ESPECTRAIS */}
            {activeAnalysisView === 'geral' && (
              <div className="space-y-4">
                {/* 10 Calculated Vegetation Indices Grid */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 mb-2.5 flex items-center justify-between">
                    <span>10 Índices Calculados da Lavoura</span>
                    <span className="text-[10px] font-normal text-slate-400">Passagem: {selectedPlot.lastSatelliteDate}</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-left">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">NDVI</span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{selectedPlot.currentNdvi.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Vigor Geral</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">NDRE</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentNdre.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Borda do Vermelho</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">GNDVI</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentGndvi.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Nitrogênio (N)</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">SAVI</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentSavi.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Ajuste de Solo</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">MSAVI</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentMsavi.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Estande Inicial</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">EVI</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentEvi.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Canópia Densa</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">VARI</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentVari.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Visível (RGB Drone)</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">NDWI</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">{selectedPlot.currentNdwi.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">Hidratação Foliar</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">Clorofila</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentChlorophyll}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">SPAD Estimado</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">Biomassa</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{selectedPlot.currentBiomassTonHa}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5">ton/ha estimadas</span>
                    </div>
                  </div>
                </div>

                {/* Vigor Distribution & Yield Potential */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                      Zoneamento de Vigor Vegetativo
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Alto Vigor (NDVI &gt; 0.70)
                          </span>
                          <span>{selectedPlot.highVigorPct}% ({((selectedPlot.areaHa * selectedPlot.highVigorPct)/100).toFixed(2)} ha)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${selectedPlot.highVigorPct}%` }} className="bg-emerald-500 h-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Médio Vigor (NDVI 0.50 - 0.70)
                          </span>
                          <span>{selectedPlot.mediumVigorPct}% ({((selectedPlot.areaHa * selectedPlot.mediumVigorPct)/100).toFixed(2)} ha)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${selectedPlot.mediumVigorPct}%` }} className="bg-amber-400 h-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Baixo Vigor / Solo Exposto (&lt; 0.50)
                          </span>
                          <span>{selectedPlot.lowVigorPct}% ({((selectedPlot.areaHa * selectedPlot.lowVigorPct)/100).toFixed(2)} ha)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${selectedPlot.lowVigorPct}%` }} className="bg-rose-500 h-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Yield Potential & IGVV */}
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          Produtividade Estimada da Safra
                        </h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {selectedPlot.yieldPotentialPct}% do Teto
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {selectedPlot.estimatedYieldKgHa.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                        Projeção baseada na curva de acúmulo de biomassa e interceptação de radiação fotossinteticamente ativa (fAPAR).
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700/60 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                        Índice GeaAgro (IGVV):
                      </span>
                      <span className="text-sm font-black text-emerald-600">
                        {selectedPlot.igvvScore} pontos / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FENOLOGIA & EVOLUÇÃO TEMPORAL */}
            {activeAnalysisView === 'fenologia' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      Estádio Atual da Lavoura
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedPlot.phenologyStage}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                      Graus-Dia Acumulados (GDD): <strong className="text-slate-900 dark:text-white">{selectedPlot.gddAccumulated}°C/dia</strong> &bull; Plantio em {selectedPlot.plantingDate}
                    </p>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                    Colheita prevista: {selectedPlot.estimatedHarvestDate}
                  </span>
                </div>

                {/* Temporal Stages Progression Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-800/70 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-3">Fase Fenológica</th>
                        <th className="p-3">Data</th>
                        <th className="p-3">DAP</th>
                        <th className="p-3">NDVI Real</th>
                        <th className="p-3">NDVI Alvo</th>
                        <th className="p-3">NDRE</th>
                        <th className="p-3">Biomassa (ton/ha)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {TEMPORAL_STAGES_PROGRESSION.map((stage, idx) => {
                        const isCurrent = stage.stage === selectedPlot.phenologyStage;
                        const diff = stage.ndvi - stage.targetExpectedNdvi;
                        return (
                          <tr key={idx} className={isCurrent ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold' : ''}>
                            <td className="p-3 flex items-center gap-1.5">
                              {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                              <span>{stage.stage}</span>
                            </td>
                            <td className="p-3 text-slate-500 dark:text-zinc-400">{stage.date}</td>
                            <td className="p-3">{stage.daysAfterPlanting} dias</td>
                            <td className="p-3 font-bold text-emerald-600">{stage.ndvi.toFixed(2)}</td>
                            <td className="p-3 text-slate-400">{stage.targetExpectedNdvi.toFixed(2)}</td>
                            <td className="p-3">{stage.ndre.toFixed(2)}</td>
                            <td className="p-3">{stage.biomass}</td>
                            <td className="p-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                diff >= 0
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {diff >= 0 ? '+ Conforme' : '- Déficit'}
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

            {/* TAB CONTENT: STATUS HÍDRICO & IRRIGAÇÃO */}
            {activeAnalysisView === 'irrigacao' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-left">
                    <span className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300 block">NDWI (Teor Hídrico Foliar)</span>
                    <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{selectedPlot.currentNdwi.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400 block mt-1">Status: Folhas Túrgidas</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                    <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-zinc-300 block">Umidade Retida no Solo</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{selectedPlot.soilMoisturePct}%</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1">Capacidade de Campo</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left">
                    <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-zinc-300 block">Déficit Hídrico do Talhão</span>
                    <span className={`text-2xl font-black ${selectedPlot.irrigationDeficitMm > 5 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                      {selectedPlot.irrigationDeficitMm} mm
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1">
                      {selectedPlot.irrigationDeficitMm > 0 ? 'Repor na próxima lâmina' : 'Equilíbrio pleno'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Cruzamento Espacial: NDVI x Evapotranspiração (ET₀) x Chuva</span>
                  </h5>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    A correlação multiespectral indica que a lâmina média aplicada de <strong>4.2 mm/dia</strong> no sistema de <em>{selectedPlot.irrigationType}</em> é suficiente para manter a turgescência das folhas sem lixiviação de nutrientes na camada radicular explorada.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FERTILIDADE & SOLO */}
            {activeAnalysisView === 'fertilidade' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
                  <FlaskConical className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      Status Nutricional Detectado por Sensoriamento
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedPlot.fertilityStatus}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      Índice GNDVI cruzado com os dados da última análise de solo ({selectedPlot.soilTexture}). Manchas com clorofila abaixo da média sugerem resposta direta a adubação nitrogenada de cobertura.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Textura do Solo</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm mt-0.5 block">{selectedPlot.soilTexture}</span>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Retenção de cátions calibrada</p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Clorofila Funcional</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">{selectedPlot.currentChlorophyll} SPAD</span>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Atividade fotossintética plena</p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Eficiência Nutricional</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm mt-0.5 block">88%</span>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Resposta à fertirrigação</p>
                  </div>
                </div>

                {/* Seção do Mapa de Grid Interpolado VRA (IDW / Krigagem) */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <Compass className="w-4 h-4 text-emerald-600" />
                        <span>Mapeamento Espacial de Nutrientes &amp; Taxa Variável (VRA)</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Interpolação de solo por Inverso do Peso da Distância (IDW) e Krigagem Ordinária com geração de arquivo ISOXML.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVraModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Gerar / Interpolar Grid de Nutrientes</span>
                    </button>
                  </div>

                  {/* Componente de Visualização do Grid no Leaflet */}
                  <VraGridCanvasMap
                    prescriptionResult={vraResult}
                    height="460px"
                    nutrientName={vraResult?.metadata.nutrientName || vraResult?.metadata.nutrient || 'Fósforo (P)'}
                    plotName={selectedPlot.name}
                    farmName={selectedPlot.farmName}
                    onOpenModalToReinterpolate={() => setIsVraModalOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: GÊMEO DIGITAL 360° DO TALHÃO */}
            {activeAnalysisView === 'gemeo' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-5 rounded-3xl border border-emerald-500/20 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-black tracking-tight">Gêmeo Digital do Talhão &bull; {selectedPlot.code}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Safra Atual
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    O Gêmeo Digital integra em tempo real a série histórica de satélite, fotos georreferenciadas de campo, laudos químicos de solo, eventos pluviométricos e registros do Caderno de Campo.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Fotografias</span>
                      <span className="font-bold text-white text-sm">{selectedPlot.photos.length} Registradas</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Pontos de Inspeção</span>
                      <span className="font-bold text-white text-sm">
                        {inspections.filter(i => i.plotId === selectedPlot.id).length} Vistorias
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Passagens Satélite</span>
                      <span className="font-bold text-white text-sm">4 Cenas L2A</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Conformidade Global</span>
                      <span className="font-bold text-emerald-400 text-sm">100% Rastreável</span>
                    </div>
                  </div>
                </div>

                {/* Photo Diary preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Diário Fotográfico &amp; Evidências de Vistoria</span>
                    </h5>
                    <button
                      onClick={() => onNewInspection(selectedPlot.id)}
                      className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Foto de Campo</span>
                    </button>
                  </div>

                  {(() => {
                    // Combine plot photos + inspection photos
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
                      ...selectedPlot.photos.map(p => ({ ...p, inspection: null })),
                      ...inspectionPhotos
                    ];

                    if (allGalleryPhotos.length === 0) {
                      return (
                        <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-400">
                          Nenhuma fotografia anexada a este talhão ainda. Clique em "Adicionar Foto de Campo".
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allGalleryPhotos.map(photo => (
                          <div key={photo.id} className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                            <div className="relative h-40 bg-black">
                              <img
                                src={photo.url}
                                alt={photo.caption}
                                className="w-full h-full object-cover"
                              />
                              {photo.inspection && (
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                  {onEditInspection && (
                                    <button
                                      type="button"
                                      onClick={() => onEditInspection(photo.inspection!)}
                                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white text-xs cursor-pointer backdrop-blur-xs transition"
                                      title="Editar Vistoria"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteInspection && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteInspection(photo.inspection!.id)}
                                      className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white text-xs cursor-pointer backdrop-blur-xs transition"
                                      title="Apagar Vistoria"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="p-3 text-xs">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 mb-1">
                                <span>{photo.date}</span>
                                {photo.ndviPoint !== undefined && (
                                  <span className="font-bold text-emerald-600">NDVI {photo.ndviPoint}</span>
                                )}
                              </div>
                              <p className="text-slate-700 dark:text-zinc-300 font-medium line-clamp-2">
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

      {/* Modal de Prescrição VRA e Interpolação Espacial */}
      <VraPrescriptionModal
        isOpen={isVraModalOpen}
        onClose={() => setIsVraModalOpen(false)}
        plotName={selectedPlot.name}
        farmName={selectedPlot.farmName}
        onPrescriptionGenerated={(res) => setVraResult(res)}
      />
    </div>
  );
};
