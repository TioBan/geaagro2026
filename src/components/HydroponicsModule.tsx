import React, { useState, useMemo } from 'react';
import {
  Sprout,
  Droplets,
  Thermometer,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Layers,
  Calendar,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
  RefreshCw,
  Sliders,
  Eye,
  X,
  Wind,
  Sun,
  ShieldCheck,
  ShoppingBag,
  Flower2,
  Calculator,
  Compass,
  FileText,
  DollarSign,
  Package,
  BookOpen,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import {
  HydroponicBench,
  NutrientSolutionReservoir,
  HydroponicNutrientRecipe,
  IrrigationTimerSchedule,
  HydroponicEnvironmentSensors,
  HydroponicAlert,
  HydroponicCustomerOrder,
  HydroponicFinancialSummary,
  HydroponicPestDiseaseGuide,
} from '../types/hydroponics';
import {
  hydroponicRecipesCatalog,
  initialReservoirs,
  initialHydroponicBenches,
  initialIrrigationSchedule,
  initialHydroponicSensors,
  initialHydroponicAlerts,
  initialHydroponicOrders,
  initialHydroponicFinancials,
  hydroponicPestDiseaseCatalog,
} from '../data/hydroponicsData';
import {
  getHydroponicBenches,
  getHydroponicReservoirs,
  saveHydroponicBenches,
  saveHydroponicReservoirs,
} from '../utils/hydroponicsFieldBookSync';

export type HydroponicsSubTab =
  | 'dashboard'
  | 'mapa_estufa'
  | 'solucao_nutritiva'
  | 'simulador_receitas'
  | 'producao_bancadas'
  | 'ambiente'
  | 'irrigacao'
  | 'alertas'
  | 'relatorios'
  | 'financeiro'
  | 'fitossanidade'
  | 'comercial'
  | 'biblioteca';

interface HydroponicsModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: HydroponicsSubTab) => void;
}

export const HydroponicsModule: React.FC<HydroponicsModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<HydroponicsSubTab>('dashboard');
  const activeSubTab = (externalSubTab as HydroponicsSubTab) || internalSubTab;
  const setActiveSubTab = (tab: HydroponicsSubTab) => {
    setInternalSubTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  // State Management
  const [benches, setBenches] = useState<HydroponicBench[]>(() => getHydroponicBenches());
  const [reservoirs, setReservoirs] = useState<NutrientSolutionReservoir[]>(() => getHydroponicReservoirs());
  const [selectedReservoirId, setSelectedReservoirId] = useState<string>(() => {
    const list = getHydroponicReservoirs();
    return list[0]?.id || initialReservoirs[0]?.id || '';
  });
  const [irrigationSchedule, setIrrigationSchedule] = useState<IrrigationTimerSchedule>(initialIrrigationSchedule);
  const [sensors, setSensors] = useState<HydroponicEnvironmentSensors>(initialHydroponicSensors);
  const [alerts, setAlerts] = useState<HydroponicAlert[]>(initialHydroponicAlerts);
  const [orders, setOrders] = useState<HydroponicCustomerOrder[]>(initialHydroponicOrders);
  const [financials] = useState<HydroponicFinancialSummary>(initialHydroponicFinancials);

  // Selected Bench for Greenhouse Map Details Modal
  const [selectedBench, setSelectedBench] = useState<HydroponicBench | null>(null);

  // Nutrient Simulator State
  const [simulatorCropId, setSimulatorCropId] = useState<string>(hydroponicRecipesCatalog[0]?.id || '');
  const [simulatorVolumeLiters, setSimulatorVolumeLiters] = useState<number>(1000);
  const [simulatorPhase, setSimulatorPhase] = useState<'bercario' | 'desenvolvimento_engorda' | 'frutificacao'>('desenvolvimento_engorda');

  // New Bench Modal Form
  const [isAddBenchOpen, setIsAddBenchOpen] = useState(false);
  const [newBenchCode, setNewBenchCode] = useState('');
  const [newBenchCrop, setNewBenchCrop] = useState('Alface Crespa');
  const [newBenchCultivar, setNewBenchCultivar] = useState('Vanda');
  const [newBenchCapacity, setNewBenchCapacity] = useState(600);
  const [newBenchReservoir, setNewBenchReservoir] = useState('res-01');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fallbackReservoir: NutrientSolutionReservoir = {
    id: '',
    name: 'Nenhum Reservatório Cadastrado',
    capacityLiters: 1000,
    currentVolumeLiters: 0,
    currentPH: 0.0,
    targetPHMin: 0.0,
    targetPHMax: 0.0,
    currentEC: 0.0,
    targetECMin: 0.0,
    targetECMax: 0.0,
    solutionTempC: 0.0,
    dissolvedOxygenPpm: 0.0,
    pumpStatus: 'timer',
    lastWaterRefillDate: '--',
    lastNutrientAdjustmentDate: '--',
    waterConsumptionLitersDay: 0,
    associatedBenches: []
  };

  const currentReservoir = reservoirs.find(r => r.id === selectedReservoirId) || reservoirs[0] || fallbackReservoir;

  // Selected Recipe for Simulator
  const selectedRecipe = useMemo(() => {
    return hydroponicRecipesCatalog.find(r => r.id === simulatorCropId) || hydroponicRecipesCatalog[0];
  }, [simulatorCropId]);

  // Dynamic calculation for the nutrient simulator
  const calculatedFertilizers = useMemo(() => {
    const factor = simulatorVolumeLiters / 1000;
    const base = selectedRecipe.fertilizerStockGramsPer1000L;
    return {
      tankA: {
        calciumNitrate: Math.round(base.calciumNitrate * factor),
        ironChelateEDDHA: Math.round(base.ironChelateEDDHA * factor),
      },
      tankB: {
        potassiumNitrate: Math.round(base.potassiumNitrate * factor),
        monopotassiumPhosphate: Math.round(base.monopotassiumPhosphate * factor),
        magnesiumSulfate: Math.round(base.magnesiumSulfate * factor),
        micronutrients: Math.round(base.micronutrientsConMicros * factor),
      },
      totalGrams: Math.round(
        (base.calciumNitrate +
          base.ironChelateEDDHA +
          base.potassiumNitrate +
          base.monopotassiumPhosphate +
          base.magnesiumSulfate +
          base.micronutrientsConMicros) *
          factor
      ),
    };
  }, [selectedRecipe, simulatorVolumeLiters]);

  // Aggregated KPIs
  const totalActivePlantsInProduction = useMemo(() => {
    return benches.reduce((sum, b) => sum + b.currentPlantsCount, 0);
  }, [benches]);

  const readyForHarvestBenches = useMemo(() => {
    return benches.filter(b => b.status === 'pronto_colheita');
  }, [benches]);

  const activeAlertsCount = useMemo(() => {
    return alerts.filter(a => !a.resolved).length;
  }, [alerts]);

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, resolved: true } : a)));
    showNotification('Alerta marcado como resolvido!');
  };

  const handleAddBench = (e: React.FormEvent) => {
    e.preventDefault();
    const newB: HydroponicBench = {
      id: `banc-${Date.now()}`,
      code: newBenchCode || `BANC-${benches.length + 1}`,
      systemType: 'NFT',
      greenhouseSection: 'Estufa 01 - Setor A',
      cropName: newBenchCrop,
      cultivar: newBenchCultivar,
      category: 'folhosa',
      transplantDate: new Date().toLocaleDateString('pt-BR'),
      expectedHarvestDate: new Date(Date.now() + 24 * 86400000).toLocaleDateString('pt-BR'),
      daysAfterTransplant: 0,
      totalCapacityPlants: Number(newBenchCapacity),
      currentPlantsCount: Number(newBenchCapacity),
      reservoirId: newBenchReservoir,
      status: 'maternidade',
      healthStatus: 'excelente',
      estimatedYieldKg: Math.round((Number(newBenchCapacity) * 0.3)),
      gridPosition: {
        row: Math.ceil((benches.length + 1) / 3),
        col: ((benches.length) % 3) + 1,
      },
    };
    const updatedBenches = [...benches, newB];
    setBenches(updatedBenches);
    saveHydroponicBenches(updatedBenches);
    setIsAddBenchOpen(false);
    showNotification(`Bancada ${newB.code} cadastrada e sincronizada com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-cyan-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-teal-200/80 text-xs font-semibold">Sistemas NFT, DFT &amp; Substrato</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-400" />
              Gestão Hidropônica, Solução Nutritiva & Mapa Digital
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-3xl">
              Monitoramento em tempo real de reservatórios (pH, CE, Temperatura, O₂), simulador de dosagem de fertilizantes, mapa interativo da estufa, temporização de bombas e gestão comercial.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddBenchOpen(true)}
              className="bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold px-3.5 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Bancada
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}




      {/* ========================================================= */}
      {/* 1. DASHBOARD PRINCIPAL                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main 4 Hero Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Plantas em Produção
                </span>
                <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Sprout className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalActivePlantsInProduction.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <span>{benches.length} bancadas ativas (NFT & Calhas)</span>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Solução Nutritiva Total
                </span>
                <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Droplets className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                6.180 L
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">
                3 reservatórios (88% capacidade)
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Temp. Solução / Ar
                </span>
                <span className="p-1.5 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-lg">
                  <Thermometer className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {currentReservoir.solutionTempC}°C <span className="text-sm font-semibold text-slate-400">/ {sensors.airTempC}°C</span>
              </div>
              <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
                VPD: {sensors.vpdKpa} kPa (Ideal)
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Pronto para Colheita
                </span>
                <span className="p-1.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                {readyForHarvestBenches.length} Bancadas
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">
                ~1.950 maços / pés prontos
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Chemical Gauges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Reservoir Chemical Gauges (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-teal-500" />
                    Status da Solução Nutritiva em Tempo Real
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {currentReservoir.name}
                  </p>
                </div>
                <select
                  value={selectedReservoirId}
                  onChange={e => setSelectedReservoirId(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold rounded-lg p-2 text-slate-800 dark:text-zinc-200"
                >
                  {reservoirs.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">pH da Solução</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {currentReservoir.currentPH.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    Alvo: {currentReservoir.targetPHMin} - {currentReservoir.targetPHMax}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Condutividade (CE)</span>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5 block">
                    {currentReservoir.currentEC.toFixed(2)} <span className="text-xs font-normal">mS</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    Alvo: {currentReservoir.targetECMin} - {currentReservoir.targetECMax}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Oxigênio Dissolvido</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                    {currentReservoir.dissolvedOxygenPpm} <span className="text-xs font-normal">ppm</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Excelente ({'>'}6 ppm)
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Status da Bomba</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase mt-2 block flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    {currentReservoir.pumpStatus}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    15m Ligada / 15m Off
                  </span>
                </div>
              </div>

              {/* Progress volume */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-300">
                  <span>Volume no Reservatório:</span>
                  <span>
                    {currentReservoir.currentVolumeLiters.toLocaleString('pt-BR')} L / {currentReservoir.capacityLiters.toLocaleString('pt-BR')} L ({Math.round((currentReservoir.currentVolumeLiters / currentReservoir.capacityLiters) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${(currentReservoir.currentVolumeLiters / currentReservoir.capacityLiters) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions & Digital Map Shortcut (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Acesso Rápido aos Módulos
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setActiveSubTab('mapa_estufa')}
                  className="p-3 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100/50 dark:hover:bg-teal-900/40 text-left transition-colors cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400 mb-1" />
                  <span className="font-bold text-xs text-teal-950 dark:text-teal-200 block">
                    Mapa Digital da Estufa
                  </span>
                  <span className="text-[10px] text-teal-700/80 dark:text-teal-400">
                    Planta baixa interativa
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('simulador_receitas')}
                  className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 text-left transition-colors cursor-pointer"
                >
                  <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                  <span className="font-bold text-xs text-blue-950 dark:text-blue-200 block">
                    Simulador de Receitas
                  </span>
                  <span className="text-[10px] text-blue-700/80 dark:text-blue-400">
                    Cálculo Tanque A & B
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('irrigacao')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
                >
                  <Clock className="w-5 h-5 text-slate-600 dark:text-zinc-400 mb-1" />
                  <span className="font-bold text-xs text-slate-900 dark:text-zinc-200 block">
                    Timer de Irrigação
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Ciclos dia e noite
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('fitossanidade')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="font-bold text-xs text-slate-900 dark:text-zinc-200 block">
                    Fitossanidade & Pythium
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Manejo e desinfecção
                  </span>
                </button>
              </div>

              {/* Active alerts snippet */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-700 dark:text-zinc-300">Alertas Operacionais:</span>
                  <button
                    onClick={() => setActiveSubTab('alertas')}
                    className="text-teal-600 dark:text-teal-400 hover:underline text-[11px]"
                  >
                    Ver todos ({activeAlertsCount})
                  </button>
                </div>
                {alerts.filter(a => !a.resolved).slice(0, 1).map(alt => (
                  <div
                    key={alt.id}
                    className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-2.5 rounded-lg text-xs flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950 dark:text-amber-200">{alt.title}</span>
                      <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">{alt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAPA DIGITAL DA ESTUFA (DIFERENCIAL EXCLUSIVO)          */}
      {/* ========================================================= */}
      {activeSubTab === 'mapa_estufa' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                  Visão Espacial Interativa
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Planta Baixa & Mapa Digital das Bancadas
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Clique em qualquer bancada NFT ou calha para abrir os dados do lote, pH/CE em tempo real e previsão de colheita.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                  <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Maternidade
                </span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Desenvolvimento
                </span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Pronto p/ Colheita
                </span>
              </div>
            </div>

            {/* Interactive Grid Map representing the Greenhouse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {benches.map(bench => {
                const res = reservoirs.find(r => r.id === bench.reservoirId);
                const isReady = bench.status === 'pronto_colheita';
                const isNursery = bench.status === 'maternidade';

                return (
                  <div
                    key={bench.id}
                    onClick={() => setSelectedBench(bench)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden group hover:shadow-md ${
                      isReady
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-400/80 hover:border-blue-500'
                        : isNursery
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/80 hover:border-amber-500'
                        : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400/80 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white block group-hover:text-teal-600 transition-colors">
                          {bench.code} • {bench.systemType}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100 mt-0.5">
                          {bench.cropName}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                          {bench.cultivar}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isReady
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : isNursery
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {bench.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 mt-3 border-t border-slate-200/60 dark:border-zinc-800/80">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Idade do Lote:</span>
                        <strong className="text-slate-800 dark:text-zinc-200">
                          {bench.daysAfterTransplant} dias pós-transplante
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Previsão Colheita:</span>
                        <strong className="text-slate-800 dark:text-zinc-200">
                          {bench.expectedHarvestDate}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Capacidade / Plantas:</span>
                        <strong className="text-slate-800 dark:text-zinc-200">
                          {bench.currentPlantsCount} / {bench.totalCapacityPlants} un
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Reservatório:</span>
                        <strong className="text-teal-600 dark:text-teal-400">
                          pH {res?.currentPH.toFixed(1)} | CE {res?.currentEC.toFixed(1)}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-zinc-800/60 text-[11px]">
                      <span className="text-slate-500 dark:text-zinc-400">{bench.greenhouseSection}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Ver Detalhes <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MÓDULO DE SOLUÇÃO NUTRITIVA & RESERVATÓRIOS            */}
      {/* ========================================================= */}
      {activeSubTab === 'solucao_nutritiva' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reservoirs.map(res => (
              <div
                key={res.id}
                onClick={() => setSelectedReservoirId(res.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedReservoirId === res.id
                    ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-500 shadow-sm'
                    : 'bg-white dark:bg-black border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{res.name}</h4>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded">
                    {res.capacityLiters} L
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">pH Atual</span>
                    <strong className="text-emerald-600 text-lg">{res.currentPH.toFixed(1)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Condutividade</span>
                    <strong className="text-teal-600 text-lg">{res.currentEC.toFixed(2)} mS</strong>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Temp: {res.solutionTempC}°C</span>
                  <span>O₂: {res.dissolvedOxygenPpm} ppm</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Control Panel for the Selected Reservoir */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-teal-600" />
                  Prontuário Químico & Histórico de Correções - {currentReservoir.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Última reposição de água: {currentReservoir.lastWaterRefillDate} • Último ajuste de adubos: {currentReservoir.lastNutrientAdjustmentDate}
                </p>
              </div>
            </div>

            {/* Actions for adjusting pH / EC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block">
                  1. Correção de pH (Acidificar / Alcalinizar)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Para reduzir pH: Adicionar 25 ml de Ácido Fosfórico a 85% por 1.000 L. Para elevar pH: Adicionar Hidróxido de Potássio (KOH).
                </p>
                <button
                  onClick={() => showNotification('Registro de acidificação com Ácido Fosfórico (50 ml) salvo com sucesso!')}
                  className="w-full bg-slate-200 dark:bg-zinc-800 hover:bg-teal-600 hover:text-white text-slate-800 dark:text-zinc-200 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Registrar Correção de pH
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block">
                  2. Reposição de Fertilizantes (Elevar CE)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Adição proporcional de Solução Concentrada Tanque A (Nitrato de Ca + Fe) e Tanque B (KNO3 + MKP + MgSO4 + Micros).
                </p>
                <button
                  onClick={() => showNotification('Injeção de Solução Concentrada A e B (2,5 L cada) registrada!')}
                  className="w-full bg-slate-200 dark:bg-zinc-800 hover:bg-teal-600 hover:text-white text-slate-800 dark:text-zinc-200 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Registrar Adição de Adubo
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block">
                  3. Troca Total & Higienização
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Descarte da solução residual acumulada (sais não absorvidos) a cada 14 dias e lavagem com Peróxido de Hidrogênio.
                </p>
                <button
                  onClick={() => showNotification('Troca total do reservatório agendada e registrada no histórico!')}
                  className="w-full bg-slate-200 dark:bg-zinc-800 hover:bg-teal-600 hover:text-white text-slate-800 dark:text-zinc-200 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Registrar Troca Total de Solução
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SIMULADOR DE RECEITAS NUTRIENTES (DIFERENCIAL EXCLUSIVO) */}
      {/* ========================================================= */}
      {activeSubTab === 'simulador_receitas' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                  Calculadora Nutricional de Fertilizantes
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Simulador de Solução Nutritiva para Hidroponia
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Informe o volume do seu reservatório e a cultura desejada. O sistema calcula automaticamente a quantidade exata de cada sal para o Tanque A e Tanque B.
                </p>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Cultura Hidropônica
                </label>
                <select
                  value={simulatorCropId}
                  onChange={e => setSimulatorCropId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100"
                >
                  {hydroponicRecipesCatalog.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.cropName} ({r.scientificName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Volume do Reservatório (Litros)
                </label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  max="50000"
                  value={simulatorVolumeLiters}
                  onChange={e => setSimulatorVolumeLiters(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Fase de Cultivo
                </label>
                <select
                  value={simulatorPhase}
                  onChange={e => setSimulatorPhase(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-bold text-slate-800 dark:text-zinc-100"
                >
                  <option value="bercario">Berçário / Maternidade (50% da dose)</option>
                  <option value="desenvolvimento_engorda">Desenvolvimento / Engorda (Dose 100%)</option>
                  <option value="frutificacao">Frutificação / Floração</option>
                </select>
              </div>
            </div>

            {/* Target Parameters Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-teal-50/50 dark:bg-teal-950/20 p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/50">
              <div>
                <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block">pH Alvo:</span>
                <span className="font-extrabold text-sm text-teal-950 dark:text-teal-100">
                  {selectedRecipe.targetPH.ideal} ({selectedRecipe.targetPH.min} - {selectedRecipe.targetPH.max})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block">CE Alvo:</span>
                <span className="font-extrabold text-sm text-teal-950 dark:text-teal-100">
                  {selectedRecipe.targetEC.ideal} mS/cm
                </span>
              </div>
              <div>
                <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block">Temp. Solução Ideal:</span>
                <span className="font-extrabold text-sm text-teal-950 dark:text-teal-100">
                  {selectedRecipe.idealSolutionTempC.min}°C - {selectedRecipe.idealSolutionTempC.max}°C
                </span>
              </div>
              <div>
                <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block">Frequência de Troca:</span>
                <span className="font-extrabold text-sm text-teal-950 dark:text-teal-100">
                  A cada {selectedRecipe.replacementFrequencyDays} dias
                </span>
              </div>
            </div>

            {/* Calculated Fertilizer Batches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* TANQUE A */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border-2 border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                      A
                    </span>
                    Tanque Concentrado A (Cálcio & Ferro)
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">
                    Dissolver em água primeiro
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block">Nitrato de Cálcio</strong>
                      <span className="text-[10px] text-slate-400">15.5% N + 19% Ca</span>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      {calculatedFertilizers.tankA.calciumNitrate} g
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block">Quelato de Ferro (Fe-EDDHA / Fe-DTPA)</strong>
                      <span className="text-[10px] text-slate-400">6% Fe quelatizado</span>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      {calculatedFertilizers.tankA.ironChelateEDDHA} g
                    </span>
                  </div>
                </div>
              </div>

              {/* TANQUE B */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border-2 border-blue-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">
                      B
                    </span>
                    Tanque Concentrado B (Fósforo, Potássio, Magnésio & Micros)
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">
                    Nunca misturar puro com Tanque A
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block">Nitrato de Potássio (KNO₃)</strong>
                      <span className="text-[10px] text-slate-400">13% N + 44% K₂O</span>
                    </div>
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {calculatedFertilizers.tankB.potassiumNitrate} g
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block">Fosfato Monopotássico (MKP)</strong>
                      <span className="text-[10px] text-slate-400">52% P₂O₅ + 34% K₂O</span>
                    </div>
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {calculatedFertilizers.tankB.monopotassiumPhosphate} g
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block">Sulfato de Magnésio</strong>
                      <span className="text-[10px] text-slate-400">9% Mg + 12% S</span>
                    </div>
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {calculatedFertilizers.tankB.magnesiumSulfate} g
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block">Mix de Micronutrientes (B, Zn, Mn, Cu, Mo)</strong>
                      <span className="text-[10px] text-slate-400">Quelatos solúveis</span>
                    </div>
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {calculatedFertilizers.tankB.micronutrients} g
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Peso total de fertilizantes: <strong>{(calculatedFertilizers.totalGrams / 1000).toFixed(2)} kg</strong>
              </span>
              <button
                onClick={() => showNotification(`Receita para ${simulatorVolumeLiters}L de ${selectedRecipe.cropName} aplicada ao reservatório!`)}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                Aplicar ao Reservatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. GESTÃO DE PRODUÇÃO & BANCADAS                          */}
      {/* ========================================================= */}
      {activeSubTab === 'producao_bancadas' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Controle de Bancadas Hidropônicas & Lotes
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Gerenciamento de canais, datas de transplante, ciclo de engorda e peso colhido.
                </p>
              </div>

              <button
                onClick={() => setIsAddBenchOpen(true)}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Bancada
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Bancada / Sistema</th>
                    <th className="py-2.5 px-3">Cultura / Cultivar</th>
                    <th className="py-2.5 px-3 text-center">Idade Lote</th>
                    <th className="py-2.5 px-3 text-center">Transplante</th>
                    <th className="py-2.5 px-3 text-center">Colheita Prev.</th>
                    <th className="py-2.5 px-3 text-right">Plantas</th>
                    <th className="py-2.5 px-3 text-right">Prod. Est. (kg)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {benches.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-zinc-100">{b.code}</div>
                        <div className="text-[10px] text-slate-400">{b.systemType} • {b.greenhouseSection}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-teal-700 dark:text-teal-400">{b.cropName}</div>
                        <div className="text-[10px] text-slate-400">{b.cultivar}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-zinc-200">
                        {b.daysAfterTransplant} dias
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400">
                        {b.transplantDate}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-800 dark:text-zinc-200">
                        {b.expectedHarvestDate}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-zinc-100">
                        {b.currentPlantsCount} un
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-teal-600 dark:text-teal-400">
                        {b.estimatedYieldKg} kg
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'pronto_colheita'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : b.status === 'maternidade'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedBench(b)}
                          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline p-1 cursor-pointer"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CLIMA & AMBIENTE DA ESTUFA                             */}
      {/* ========================================================= */}
      {activeSubTab === 'ambiente' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Temp. do Ar</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {sensors.airTempC}°C
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Ideal (20-28°C)</span>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Umidade Relativa</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                {sensors.relativeHumidityPercent}%
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Adequada</span>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">VPD (Déficit Vapor)</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1 block">
                {sensors.vpdKpa} <span className="text-xs font-normal">kPa</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Ótimo p/ Transpiração</span>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Luminosidade</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {(sensors.lightLux / 1000).toFixed(1)}k <span className="text-xs font-normal">Lux</span>
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">{sensors.radiationWm2} W/m²</span>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Nível de CO₂</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {sensors.co2Ppm} <span className="text-xs font-normal">ppm</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Enriquecido</span>
            </div>

            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tela Sombreamento</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {sensors.shadingScreenPercent}%
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Aluminet Ativa</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. IRRIGAÇÃO & TEMPORIZAÇÃO DE BOMBAS                     */}
      {/* ========================================================= */}
      {activeSubTab === 'irrigacao' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Programação de Ciclos das Bombas NFT / DFT
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  ☀️ Ciclo Diurno (06:00 às 18:30)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold">Tempo Ligado (Minutos)</label>
                    <input
                      type="number"
                      value={irrigationSchedule.daytimeOnMinutes}
                      onChange={e => setIrrigationSchedule(s => ({ ...s, daytimeOnMinutes: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-black border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold">Tempo Desligado (Minutos)</label>
                    <input
                      type="number"
                      value={irrigationSchedule.daytimeOffMinutes}
                      onChange={e => setIrrigationSchedule(s => ({ ...s, daytimeOffMinutes: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-black border rounded font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  🌙 Ciclo Noturno (18:30 às 06:00)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold">Tempo Ligado (Minutos)</label>
                    <input
                      type="number"
                      value={irrigationSchedule.nighttimeOnMinutes}
                      onChange={e => setIrrigationSchedule(s => ({ ...s, nighttimeOnMinutes: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-black border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold">Intervalo de Espera (Horas)</label>
                    <input
                      type="number"
                      value={irrigationSchedule.nighttimeOffIntervalHours}
                      onChange={e => setIrrigationSchedule(s => ({ ...s, nighttimeOffIntervalHours: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-black border rounded font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => showNotification('Timer e programação de bombas atualizada com sucesso!')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer shadow-xs"
            >
              Salvar Programação de Temporizadores
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. SISTEMA DE ALERTAS                                     */}
      {/* ========================================================= */}
      {activeSubTab === 'alertas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Central de Alertas & Notificações Hidropônicas
            </h3>

            <div className="space-y-2">
              {alerts.map(alt => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    alt.resolved
                      ? 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 opacity-60'
                      : alt.severity === 'critico'
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{alt.title}</span>
                        <span className="text-[10px] text-slate-400">{alt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">{alt.description}</p>
                    </div>
                  </div>

                  {!alt.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="px-3 py-1 bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 cursor-pointer shrink-0"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. RELATÓRIOS & INDICADORES                               */}
      {/* ========================================================= */}
      {activeSubTab === 'relatorios' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Produção Mensal</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">8.900 maços</span>
              <span className="text-xs text-slate-500">2.850 kg colhidos</span>
            </div>
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Consumo de Água</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">1.390 L/dia</span>
              <span className="text-xs text-slate-500">0,15 L / pé produzido</span>
            </div>
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Eficiência por Bancada</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1 block">97.8%</span>
              <span className="text-xs text-slate-500">Perdas reduzidas a 2.2%</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. FINANCEIRO & CUSTOS                                   */}
      {/* ========================================================= */}
      {activeSubTab === 'financeiro' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Faturamento Bruto</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                R$ {financials.grossRevenueBrl.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">{financials.totalHarvestedUnits} maços vendidos</span>
            </div>
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Custo Operacional Total</span>
              <span className="text-2xl font-black text-slate-800 dark:text-zinc-200 mt-1 block">
                R$ {financials.totalOperatingCostBrl.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">Custo por planta: R$ {financials.unitCostPerPlantBrl.toFixed(2)}</span>
            </div>
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Lucro Líquido Hidroponia</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1 block">
                R$ {financials.netProfitBrl.toFixed(2)} ({financials.profitMarginPercent}%)
              </span>
              <span className="text-xs text-teal-600 font-semibold">Excelente rentabilidade</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. FITOSSANIDADE HIDROPÔNICA                             */}
      {/* ========================================================= */}
      {activeSubTab === 'fitossanidade' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hydroponicPestDiseaseCatalog.map(guide => (
              <div
                key={guide.id}
                className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{guide.name}</h4>
                    <span className="text-[11px] text-slate-400 italic">{guide.scientificName}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {guide.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="text-slate-700 dark:text-zinc-300 block mb-1">Sintomas Típicos:</strong>
                    <ul className="space-y-0.5 text-slate-600 dark:text-zinc-400 list-disc list-inside">
                      {guide.symptoms.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-teal-50/60 dark:bg-teal-950/20 p-2.5 rounded-lg border border-teal-200 dark:border-teal-900/50">
                    <strong className="text-teal-950 dark:text-teal-300 block font-bold">Manejo & Ajuste na Solução:</strong>
                    <p className="text-teal-900/80 dark:text-teal-300/80 text-[11px] mt-0.5">{guide.solutionAdjustmentTip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. COMERCIAL & CLIENTES                                  */}
      {/* ========================================================= */}
      {activeSubTab === 'comercial' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-teal-600" />
              Pedidos Recorrentes & Roteiro de Entregas
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Pedido / Cliente</th>
                    <th className="py-2.5 px-3">Cultura</th>
                    <th className="py-2.5 px-3 text-right">Qtd (Maços)</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                    <th className="py-2.5 px-3 text-center">Data Entrega</th>
                    <th className="py-2.5 px-3 text-center">Frequência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="py-3 px-3 font-bold">{o.customerName}</td>
                      <td className="py-3 px-3 text-teal-600 font-semibold">{o.cropName}</td>
                      <td className="py-3 px-3 text-right font-bold">{o.quantityBunched} un</td>
                      <td className="py-3 px-3 text-right font-bold">R$ {o.totalValueBrl.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center">{o.deliveryDateTarget}</td>
                      <td className="py-3 px-3 text-center">{o.recurrence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. BIBLIOTECA TÉCNICA                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'biblioteca' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Sistema NFT (Nutrient Film Technique)',
                desc: 'Fluxo laminar fino contínuo ou intermitente nos perfis de polipropileno com declividade de 2% a 4%.',
              },
              {
                title: 'Sistema DFT (Deep Flow / Piscina)',
                desc: 'Mudas flutuando sobre placas de isopor com lâmina de 10 a 20 cm de solução e aeração forçada.',
              },
              {
                title: 'Cultivo em Substrato com Gotejo',
                desc: 'Morangos, tomates e pimentões em slabs de fibra de coco com fertirrigação por pulso e drenagem de 20%.',
              },
              {
                title: 'Sanitização & Peróxido de Hidrogênio',
                desc: 'Dosagem segura de H2O2 a 30-50 ppm para oxigenação e combate a patógenos de raiz sem fitotoxicidade.',
              },
              {
                title: 'Manejo de Solução no Verão',
                desc: 'Estratégias de redução da CE em 20% nos horários de pico térmico e resfriamento da casa de bombas.',
              },
              {
                title: 'Nutrição com Quelatos de Alta Estabilidade',
                desc: 'Uso de Fe-EDDHA e Fe-DTPA para prevenir clorose férrica quando a água possui bicarbonatos elevados.',
              },
            ].map((lib, i) => (
              <div
                key={i}
                className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xs space-y-2"
              >
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  {lib.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{lib.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DETALHES DA BANCADA (DO MAPA DIGITAL)              */}
      {/* ========================================================= */}
      {selectedBench && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded">
                  {selectedBench.systemType} • {selectedBench.greenhouseSection}
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                  Bancada {selectedBench.code} - {selectedBench.cropName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cultivar: {selectedBench.cultivar}
                </p>
              </div>
              <button
                onClick={() => setSelectedBench(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border">
                <span className="text-[10px] text-slate-400 block">Idade Atual</span>
                <strong className="text-slate-800 dark:text-zinc-200">{selectedBench.daysAfterTransplant} dias pós-transplante</strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border">
                <span className="text-[10px] text-slate-400 block">Previsão Colheita</span>
                <strong className="text-slate-800 dark:text-zinc-200">{selectedBench.expectedHarvestDate}</strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border">
                <span className="text-[10px] text-slate-400 block">Ocupação de Plantas</span>
                <strong className="text-teal-600 dark:text-teal-400">{selectedBench.currentPlantsCount} / {selectedBench.totalCapacityPlants} un</strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border">
                <span className="text-[10px] text-slate-400 block">Produção Estimada</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{selectedBench.estimatedYieldKg} kg</strong>
              </div>
            </div>

            {selectedBench.notes && (
              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200">
                <strong>Observações de Manejo:</strong> {selectedBench.notes}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedBench(null)}
                className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVA BANCADA                                       */}
      {/* ========================================================= */}
      {isAddBenchOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Cadastrar Nova Bancada Hidropônica
              </h3>
              <button onClick={() => setIsAddBenchOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBench} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Código da Bancada</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BANC-13"
                  value={newBenchCode}
                  onChange={e => setNewBenchCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Cultura</label>
                <input
                  type="text"
                  required
                  value={newBenchCrop}
                  onChange={e => setNewBenchCrop(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Cultivar</label>
                <input
                  type="text"
                  required
                  value={newBenchCultivar}
                  onChange={e => setNewBenchCultivar(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Capacidade (Plantas)</label>
                  <input
                    type="number"
                    required
                    value={newBenchCapacity}
                    onChange={e => setNewBenchCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Reservatório</label>
                  <select
                    value={newBenchReservoir}
                    onChange={e => setNewBenchReservoir(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-900 border rounded-lg font-bold"
                  >
                    {reservoirs.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddBenchOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold"
                >
                  Salvar Bancada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
