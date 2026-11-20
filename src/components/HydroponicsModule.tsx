import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Calculator,
  Clock,
  Compass,
  DollarSign,
  Droplets,
  Package,
  Plus,
  ShieldCheck,
  Sprout,
  Thermometer,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  HydroponicAlert,
  HydroponicBench,
  HydroponicCustomerOrder,
  HydroponicEnvironmentSensors,
  HydroponicFinancialSummary,
  IrrigationTimerSchedule,
  NutrientSolutionReservoir,
} from '../types/hydroponics';
import {
  addHydroponicAnnotationAndSync,
  getHydroponicAlerts,
  getHydroponicBenches,
  getHydroponicFinancials,
  getHydroponicOrders,
  getHydroponicReservoirs,
  getHydroponicSchedule,
  getHydroponicSensors,
  saveHydroponicAlerts,
  saveHydroponicBenches,
  saveHydroponicFinancials,
  saveHydroponicOrders,
  saveHydroponicReservoirs,
  saveHydroponicSchedule,
  saveHydroponicSensors,
} from '../utils/hydroponicsFieldBookSync';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { HydroponicsDashboardView } from './hydroponics/HydroponicsDashboardView';
import {
  BenchDetailModal,
  BenchFormModal,
  ReservoirFormModal,
} from './hydroponics/HydroponicsModals';
import {
  formatBrDate,
  getCurrentTimeHHMM,
  getTodayIsoDate,
} from './hydroponics/hydroponicsUi';

const HydroponicsBenchesView = lazyWithRetry(() =>
  import('./hydroponics/HydroponicsBenchesView').then((m) => ({
    default: m.HydroponicsBenchesView,
  }))
);

const HydroponicsNutrientView = lazyWithRetry(() =>
  import('./hydroponics/HydroponicsNutrientView').then((m) => ({
    default: m.HydroponicsNutrientView,
  }))
);

const HydroponicsEnvironmentAndTimerView = lazyWithRetry(() =>
  import('./hydroponics/HydroponicsEnvironmentAndTimerView').then((m) => ({
    default: m.HydroponicsEnvironmentAndTimerView,
  }))
);

const HydroponicsAlertsAndHealthView = lazyWithRetry(() =>
  import('./hydroponics/HydroponicsAlertsAndHealthView').then((m) => ({
    default: m.HydroponicsAlertsAndHealthView,
  }))
);

const HydroponicsBusinessView = lazyWithRetry(() =>
  import('./hydroponics/HydroponicsBusinessView').then((m) => ({
    default: m.HydroponicsBusinessView,
  }))
);

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

const HYDROPONICS_TABS: {
  id: HydroponicsSubTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Visão Geral', icon: Activity },
  { id: 'mapa_estufa', label: 'Mapa da Estufa', icon: Compass },
  { id: 'solucao_nutritiva', label: 'Solução & Tanques', icon: Droplets },
  { id: 'simulador_receitas', label: 'Simulador de Sais', icon: Calculator },
  { id: 'producao_bancadas', label: 'Bancadas & Lotes', icon: Sprout },
  { id: 'ambiente', label: 'Clima & VPD', icon: Thermometer },
  { id: 'irrigacao', label: 'Bombas & Timer', icon: Clock },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
  { id: 'fitossanidade', label: 'Fitossanidade', icon: ShieldCheck },
  { id: 'comercial', label: 'Vendas & Pedidos', icon: Package },
  { id: 'financeiro', label: 'Custos & Margem', icon: DollarSign },
  { id: 'relatorios', label: 'Relatórios', icon: TrendingUp },
  { id: 'biblioteca', label: 'Biblioteca Técnica', icon: BookOpen },
];

const TabLoadingFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
    Carregando painel...
  </div>
);

export const HydroponicsModule: React.FC<HydroponicsModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<HydroponicsSubTab>('dashboard');
  const activeSubTab: HydroponicsSubTab =
    externalSubTab && HYDROPONICS_TABS.some((t) => t.id === externalSubTab)
      ? (externalSubTab as HydroponicsSubTab)
      : internalSubTab;

  const setActiveSubTab = useCallback(
    (tab: HydroponicsSubTab) => {
      setInternalSubTab(tab);
      if (setExternalSubTab) {
        setExternalSubTab(tab);
      }
    },
    [setExternalSubTab]
  );

  // Persisted State
  const [benches, setBenches] = useState<HydroponicBench[]>(() => getHydroponicBenches());
  const [reservoirs, setReservoirs] = useState<NutrientSolutionReservoir[]>(() =>
    getHydroponicReservoirs()
  );
  const [selectedReservoirId, setSelectedReservoirId] = useState<string>(
    () => getHydroponicReservoirs()[0]?.id || ''
  );
  const [irrigationSchedule, setIrrigationSchedule] = useState<IrrigationTimerSchedule>(() =>
    getHydroponicSchedule()
  );
  const [sensors, setSensors] = useState<HydroponicEnvironmentSensors>(() =>
    getHydroponicSensors()
  );
  const [alerts, setAlerts] = useState<HydroponicAlert[]>(() => getHydroponicAlerts());
  const [orders, setOrders] = useState<HydroponicCustomerOrder[]>(() => getHydroponicOrders());
  const [financials, setFinancials] = useState<HydroponicFinancialSummary>(() =>
    getHydroponicFinancials()
  );

  // Modals State
  const [selectedBench, setSelectedBench] = useState<HydroponicBench | null>(null);
  const [isAddBenchOpen, setIsAddBenchOpen] = useState(false);
  const [isReservoirModalOpen, setIsReservoirModalOpen] = useState(false);
  const [editingReservoir, setEditingReservoir] = useState<NutrientSolutionReservoir | null>(null);

  // Notification banner with safe cleanup timer
  const [notification, setNotification] = useState<string | null>(null);
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
    notifyTimerRef.current = setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      setBenches(getHydroponicBenches());
      setReservoirs(getHydroponicReservoirs());
    };
    window.addEventListener('geaagro-hydroponics-updated', syncFromStorage);
    return () => {
      window.removeEventListener('geaagro-hydroponics-updated', syncFromStorage);
      if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
    };
  }, []);

  // Summary Header Metrics
  const headerMetrics = useMemo(() => {
    const totalPlants = benches.reduce((s, b) => s + b.currentPlantsCount, 0);
    const readyCount = benches.filter((b) => b.status === 'pronto_colheita').length;
    const totalSolution = reservoirs.reduce((s, r) => s + (r.currentVolumeLiters || 0), 0);
    const avgPh =
      reservoirs.length > 0
        ? (reservoirs.reduce((s, r) => s + r.currentPH, 0) / reservoirs.length).toFixed(2)
        : '—';
    const avgEc =
      reservoirs.length > 0
        ? (reservoirs.reduce((s, r) => s + r.currentEC, 0) / reservoirs.length).toFixed(2)
        : '—';
    return { totalPlants, readyCount, totalSolution, avgPh, avgEc };
  }, [benches, reservoirs]);

  // Handlers
  const handleAddBench = useCallback(
    (newBench: HydroponicBench) => {
      setBenches((prev) => {
        const updated = [...prev, newBench];
        saveHydroponicBenches(updated);
        return updated;
      });
      setIsAddBenchOpen(false);
      showNotification(`Bancada ${newBench.code} cadastrada e sincronizada.`);
    },
    [showNotification]
  );

  const handleUpdateBenchStatus = useCallback(
    (benchId: string, status: HydroponicBench['status']) => {
      setBenches((prev) => {
        const updated = prev.map((b) => (b.id === benchId ? { ...b, status } : b));
        saveHydroponicBenches(updated);
        return updated;
      });
      setSelectedBench((curr) => (curr && curr.id === benchId ? { ...curr, status } : curr));
      showNotification('Estágio da bancada atualizado.');
    },
    [showNotification]
  );

  const handleDeleteBench = useCallback(
    (benchId: string) => {
      setBenches((prev) => {
        const updated = prev.filter((b) => b.id !== benchId);
        saveHydroponicBenches(updated);
        return updated;
      });
      setSelectedBench(null);
      showNotification('Bancada removida.');
    },
    [showNotification]
  );

  const handleSaveReservoir = useCallback(
    (saved: NutrientSolutionReservoir) => {
      setReservoirs((prev) => {
        const exists = prev.some((r) => r.id === saved.id);
        const updated = exists
          ? prev.map((r) => (r.id === saved.id ? saved : r))
          : [...prev, saved];
        saveHydroponicReservoirs(updated);
        return updated;
      });
      setSelectedReservoirId(saved.id);
      setIsReservoirModalOpen(false);
      setEditingReservoir(null);
      showNotification(`Reservatório "${saved.name}" salvo com sucesso.`);
    },
    [showNotification]
  );

  const handleDeleteReservoir = useCallback(
    (id: string) => {
      setReservoirs((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        saveHydroponicReservoirs(updated);
        if (selectedReservoirId === id) {
          setSelectedReservoirId(updated[0]?.id || '');
        }
        return updated;
      });
      showNotification('Reservatório removido.');
    },
    [selectedReservoirId, showNotification]
  );

  const handleLogReservoirAction = useCallback(
    (
      reservoir: NutrientSolutionReservoir,
      actionType: 'ph' | 'fertilizer' | 'full_change'
    ) => {
      const todayIso = getTodayIsoDate();
      const todayBr = formatBrDate(todayIso);
      const timeStr = getCurrentTimeHHMM();

      const actionMeta =
        actionType === 'ph'
          ? {
              title: `Correção de pH — ${reservoir.name}`,
              notes: `Ajuste de pH para a faixa alvo (${reservoir.targetPHMin}–${reservoir.targetPHMax}) no ${reservoir.name}.`,
              fertilizers: 'Ácido Fosfórico 85% / KOH (ajuste fino)',
            }
          : actionType === 'fertilizer'
          ? {
              title: `Reposição de Sais (CE) — ${reservoir.name}`,
              notes: `Injeção proporcional de Solução Concentrada A e B para estabilizar CE em ${reservoir.targetECMin}–${reservoir.targetECMax} mS/cm.`,
              fertilizers: 'Solução Concentrada Tanque A (Ca+Fe) e Tanque B (NPK+Mg+Micros)',
            }
          : {
              title: `Troca Total & Sanitização — ${reservoir.name}`,
              notes: `Esgotamento residual, higienização com peróxido de hidrogênio e recarga de ${reservoir.capacityLiters} L.`,
              fertilizers: 'Peróxido de Hidrogênio 30–50 ppm + Nova Carga Nutritiva',
            };

      addHydroponicAnnotationAndSync({
        date: todayIso,
        time: timeStr,
        author: 'Equipe de Hidroponia',
        category: actionType === 'full_change' ? 'limpeza_manutencao' : 'manejo_solucao',
        title: actionMeta.title,
        notes: actionMeta.notes,
        reservoirId: reservoir.id,
        reservoirName: reservoir.name,
        phValue: reservoir.currentPH,
        ecValue: reservoir.currentEC,
        waterRefilledLiters:
          actionType === 'full_change' ? reservoir.capacityLiters : undefined,
        fertilizersAddedSummary: actionMeta.fertilizers,
        temperatureC: reservoir.solutionTempC,
      });

      setReservoirs((prev) => {
        const updated = prev.map((r) =>
          r.id === reservoir.id
            ? {
                ...r,
                currentVolumeLiters:
                  actionType === 'full_change' ? r.capacityLiters : r.currentVolumeLiters,
                lastWaterRefillDate:
                  actionType === 'full_change' ? todayBr : r.lastWaterRefillDate,
                lastNutrientAdjustmentDate: `${todayBr} ${timeStr}`,
              }
            : r
        );
        saveHydroponicReservoirs(updated);
        return updated;
      });

      showNotification(`${actionMeta.title} registrada e sincronizada com o Caderno de Campo.`);
    },
    [showNotification]
  );

  const handleApplyRecipeToReservoir = useCallback(
    (payload: {
      recipeName: string;
      volumeLiters: number;
      targetPHMin: number;
      targetPHMax: number;
      targetECMin: number;
      targetECMax: number;
      summaryText: string;
    }) => {
      const todayIso = getTodayIsoDate();
      const todayBr = formatBrDate(todayIso);
      const timeStr = getCurrentTimeHHMM();
      const targetRes =
        reservoirs.find((r) => r.id === selectedReservoirId) || reservoirs[0] || null;

      addHydroponicAnnotationAndSync({
        date: todayIso,
        time: timeStr,
        author: 'Equipe de Hidroponia',
        category: 'manejo_solucao',
        title: `Preparo de ${payload.volumeLiters} L — ${payload.recipeName}`,
        notes: `Formulação aplicada para ${payload.volumeLiters} L (${payload.recipeName}). Faixa alvo: pH ${payload.targetPHMin}–${payload.targetPHMax}, CE ${payload.targetECMin}–${payload.targetECMax} mS/cm.`,
        reservoirId: targetRes?.id,
        reservoirName: targetRes?.name,
        phValue: Number(((payload.targetPHMin + payload.targetPHMax) / 2).toFixed(2)),
        ecValue: Number(((payload.targetECMin + payload.targetECMax) / 2).toFixed(2)),
        waterRefilledLiters: payload.volumeLiters,
        fertilizersAddedSummary: payload.summaryText,
      });

      if (targetRes) {
        setReservoirs((prev) => {
          const updated = prev.map((r) =>
            r.id === targetRes.id
              ? {
                  ...r,
                  targetPHMin: payload.targetPHMin,
                  targetPHMax: payload.targetPHMax,
                  targetECMin: payload.targetECMin,
                  targetECMax: payload.targetECMax,
                  lastNutrientAdjustmentDate: `${todayBr} ${timeStr}`,
                }
              : r
          );
          saveHydroponicReservoirs(updated);
          return updated;
        });
      }

      showNotification(
        `Fórmula para ${payload.volumeLiters} L (${payload.recipeName}) registrada e sincronizada com o Caderno de Campo.`
      );
    },
    [reservoirs, selectedReservoirId, showNotification]
  );

  const handleSaveSensors = useCallback(
    (updated: HydroponicEnvironmentSensors) => {
      setSensors(updated);
      saveHydroponicSensors(updated);
      showNotification('Leitura climática e VPD da estufa atualizados.');
    },
    [showNotification]
  );

  const handleSaveSchedule = useCallback(
    (updated: IrrigationTimerSchedule) => {
      setIrrigationSchedule(updated);
      saveHydroponicSchedule(updated);
      showNotification('Programação de ciclos das bombas salva.');
    },
    [showNotification]
  );

  const handleResolveAlert = useCallback(
    (id: string) => {
      setAlerts((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, resolved: true } : a));
        saveHydroponicAlerts(updated);
        return updated;
      });
      showNotification('Alerta marcado como resolvido.');
    },
    [showNotification]
  );

  const handleAddAlert = useCallback(
    (data: Omit<HydroponicAlert, 'id' | 'timestamp' | 'resolved'>) => {
      const newAlert: HydroponicAlert = {
        ...data,
        id: `alt-${Date.now()}`,
        timestamp: `${formatBrDate(getTodayIsoDate())} ${getCurrentTimeHHMM()}`,
        resolved: false,
      };
      setAlerts((prev) => {
        const updated = [newAlert, ...prev];
        saveHydroponicAlerts(updated);
        return updated;
      });
      showNotification('Alerta operacional registrado.');
    },
    [showNotification]
  );

  const handleAddOrder = useCallback(
    (order: HydroponicCustomerOrder) => {
      setOrders((prev) => {
        const updated = [order, ...prev];
        saveHydroponicOrders(updated);
        return updated;
      });
      showNotification(`Pedido ${order.orderNumber} (${order.customerName}) cadastrado.`);
    },
    [showNotification]
  );

  const handleUpdateOrderStatus = useCallback(
    (id: string, status: HydroponicCustomerOrder['status']) => {
      setOrders((prev) => {
        const updated = prev.map((o) => (o.id === id ? { ...o, status } : o));
        saveHydroponicOrders(updated);
        return updated;
      });
      showNotification('Status do pedido atualizado.');
    },
    [showNotification]
  );

  const handleDeleteOrder = useCallback(
    (id: string) => {
      setOrders((prev) => {
        const updated = prev.filter((o) => o.id !== id);
        saveHydroponicOrders(updated);
        return updated;
      });
      showNotification('Pedido removido.');
    },
    [showNotification]
  );

  const handleSaveFinancials = useCallback(
    (updated: HydroponicFinancialSummary) => {
      setFinancials(updated);
      saveHydroponicFinancials(updated);
      showNotification('Custos e indicadores financeiros salvos.');
    },
    [showNotification]
  );

  return (
    <div className="space-y-4">
      {/* Compact Hairline Header + 5-KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                Hidroponia &amp; Estufas Conectadas
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                Sistemas NFT, DFT e Substrato · Solução nutritiva, mapa de bancadas, clima VPD e gestão comercial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditingReservoir(null);
                setIsReservoirModalOpen(true);
              }}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Reservatório
            </button>

            <button
              type="button"
              onClick={() => setIsAddBenchOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Bancada
            </button>
          </div>
        </div>

        {/* 5-KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs tabular-nums">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Bancadas Ativas</span>
            <strong className="text-sm text-slate-900 dark:text-zinc-100">
              {benches.filter((b) => b.status !== 'vazia').length}/{benches.length}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Plantas em Cultivo</span>
            <strong className="text-sm text-emerald-700 dark:text-emerald-400">
              {headerMetrics.totalPlants.toLocaleString('pt-BR')}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Média pH / CE</span>
            <strong className="text-sm text-slate-900 dark:text-zinc-100">
              {headerMetrics.avgPh} · {headerMetrics.avgEc} mS
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Volume em Tanques</span>
            <strong className="text-sm text-sky-700 dark:text-sky-400">
              {headerMetrics.totalSolution.toLocaleString('pt-BR')} L
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pronto p/ Colheita</span>
            <strong className="text-sm text-slate-900 dark:text-zinc-100">
              {headerMetrics.readyCount} {headerMetrics.readyCount === 1 ? 'bancada' : 'bancadas'}
            </strong>
          </div>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {notification && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 px-3.5 py-2.5 text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Fechar aviso"
            className="p-0.5 text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Single-Row Scrollable Subtab Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 flex items-center gap-1 overflow-x-auto">
        {HYDROPONICS_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Subtab Content */}
      {activeSubTab === 'dashboard' && (
        <HydroponicsDashboardView
          benches={benches}
          reservoirs={reservoirs}
          selectedReservoirId={selectedReservoirId}
          onSelectReservoir={setSelectedReservoirId}
          irrigationSchedule={irrigationSchedule}
          sensors={sensors}
          alerts={alerts}
          onNavigateToTab={setActiveSubTab}
          onOpenNewBench={() => setIsAddBenchOpen(true)}
          onOpenNewReservoir={() => {
            setEditingReservoir(null);
            setIsReservoirModalOpen(true);
          }}
        />
      )}

      {(activeSubTab === 'mapa_estufa' || activeSubTab === 'producao_bancadas') && (
        <Suspense fallback={<TabLoadingFallback />}>
          <HydroponicsBenchesView
            mode={activeSubTab}
            benches={benches}
            reservoirs={reservoirs}
            onSelectBench={setSelectedBench}
            onOpenNewBench={() => setIsAddBenchOpen(true)}
            onUpdateBenchStatus={handleUpdateBenchStatus}
          />
        </Suspense>
      )}

      {(activeSubTab === 'solucao_nutritiva' || activeSubTab === 'simulador_receitas') && (
        <Suspense fallback={<TabLoadingFallback />}>
          <HydroponicsNutrientView
            mode={activeSubTab}
            reservoirs={reservoirs}
            selectedReservoirId={selectedReservoirId}
            onSelectReservoir={setSelectedReservoirId}
            onOpenNewReservoir={() => {
              setEditingReservoir(null);
              setIsReservoirModalOpen(true);
            }}
            onEditReservoir={(res) => {
              setEditingReservoir(res);
              setIsReservoirModalOpen(true);
            }}
            onDeleteReservoir={handleDeleteReservoir}
            onLogReservoirAction={handleLogReservoirAction}
            onApplyRecipeToReservoir={handleApplyRecipeToReservoir}
          />
        </Suspense>
      )}

      {(activeSubTab === 'ambiente' || activeSubTab === 'irrigacao') && (
        <Suspense fallback={<TabLoadingFallback />}>
          <HydroponicsEnvironmentAndTimerView
            mode={activeSubTab}
            sensors={sensors}
            onSaveSensors={handleSaveSensors}
            schedule={irrigationSchedule}
            onSaveSchedule={handleSaveSchedule}
          />
        </Suspense>
      )}

      {(activeSubTab === 'alertas' ||
        activeSubTab === 'fitossanidade' ||
        activeSubTab === 'biblioteca') && (
        <Suspense fallback={<TabLoadingFallback />}>
          <HydroponicsAlertsAndHealthView
            mode={activeSubTab}
            alerts={alerts}
            reservoirs={reservoirs}
            onResolveAlert={handleResolveAlert}
            onAddAlert={handleAddAlert}
          />
        </Suspense>
      )}

      {(activeSubTab === 'comercial' ||
        activeSubTab === 'financeiro' ||
        activeSubTab === 'relatorios') && (
        <Suspense fallback={<TabLoadingFallback />}>
          <HydroponicsBusinessView
            mode={activeSubTab}
            benches={benches}
            reservoirs={reservoirs}
            orders={orders}
            financials={financials}
            onAddOrder={handleAddOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSaveFinancials={handleSaveFinancials}
          />
        </Suspense>
      )}

      {/* Modals */}
      <BenchDetailModal
        bench={selectedBench}
        reservoirs={reservoirs}
        onClose={() => setSelectedBench(null)}
        onUpdateStatus={handleUpdateBenchStatus}
        onDelete={handleDeleteBench}
      />

      <BenchFormModal
        open={isAddBenchOpen}
        existingCount={benches.length}
        reservoirs={reservoirs}
        onClose={() => setIsAddBenchOpen(false)}
        onSave={handleAddBench}
      />

      <ReservoirFormModal
        open={isReservoirModalOpen}
        editing={editingReservoir}
        onClose={() => {
          setIsReservoirModalOpen(false);
          setEditingReservoir(null);
        }}
        onSave={handleSaveReservoir}
      />
    </div>
  );
};

export default HydroponicsModule;
