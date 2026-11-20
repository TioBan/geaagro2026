import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Droplets,
  Filter,
  FlaskConical,
  Layers,
  Leaf,
  Plus,
  Scale,
  Search,
  Share2,
  ShieldCheck,
  Thermometer,
  User,
  X,
  Zap,
} from 'lucide-react';
import {
  HydroponicAnnotation,
  HydroponicBench,
  NutrientSolutionReservoir,
} from '../../types/hydroponics';
import {
  addHydroponicAnnotationAndSync,
  ensureInitialHydroponicSync,
  getHydroponicAnnotations,
  getHydroponicBenches,
  getHydroponicReservoirs,
  saveHydroponicReservoirs,
} from '../../utils/hydroponicsFieldBookSync';
import { hydroponicRecipesCatalog } from '../../data/hydroponicsData';
import {
  BENCH_STATUS_META,
  calculateHydroponicFertilizers,
  formatBrDate,
  getCurrentTimeHHMM,
  getTodayIsoDate,
  HYDRO_INPUT_CLASS,
  HYDRO_LABEL_CLASS,
  HYDRO_TEXTAREA_CLASS,
  PUMP_STATUS_META,
} from '../hydroponics/hydroponicsUi';

interface HydroponicsFieldBookIntegrationProps {
  onNavigateToOperations?: () => void;
  onOpenFullHydroponicsModule?: () => void;
  farmId?: string;
}

const CATEGORY_LABELS: Record<HydroponicAnnotation['category'], string> = {
  manejo_solucao: 'Solução Nutritiva',
  bancada_transplante: 'Bancadas & Transplante',
  colheita: 'Colheita',
  sanidade_pragas: 'Sanidade',
  clima_estufa: 'Clima & Estufa',
  limpeza_manutencao: 'Limpeza & Manutenção',
  geral: 'Observação Geral',
};

export const HydroponicsFieldBookIntegration: React.FC<
  HydroponicsFieldBookIntegrationProps
> = ({ onNavigateToOperations, onOpenFullHydroponicsModule, farmId = 'farm-1' }) => {
  const [benches, setBenches] = useState<HydroponicBench[]>([]);
  const [reservoirs, setReservoirs] = useState<NutrientSolutionReservoir[]>([]);
  const [annotations, setAnnotations] = useState<HydroponicAnnotation[]>([]);
  const [activeTab, setActiveTab] = useState<
    'anotacoes' | 'bancadas' | 'reservatorios' | 'calculadora'
  >('anotacoes');

  // Search & Filter state for annotations
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // Modal state for new annotation
  const [isNewAnnotationModalOpen, setIsNewAnnotationModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] =
    useState<HydroponicAnnotation['category']>('manejo_solucao');
  const [annAuthor, setAnnAuthor] = useState('');
  const [annDate, setAnnDate] = useState<string>(() => getTodayIsoDate());
  const [annTime, setAnnTime] = useState<string>(() => getCurrentTimeHHMM());
  const [annNotes, setAnnNotes] = useState('');
  const [annBenchId, setAnnBenchId] = useState('');
  const [annReservoirId, setAnnReservoirId] = useState('');
  const [annPH, setAnnPH] = useState('');
  const [annEC, setAnnEC] = useState('');
  const [annWaterRefill, setAnnWaterRefill] = useState('');
  const [annFertilizers, setAnnFertilizers] = useState('');
  const [annTemp, setAnnTemp] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quick Nutrient Calculator state
  const [calcCropId, setCalcCropId] = useState(
    () => hydroponicRecipesCatalog[0]?.id || 'rec-alface'
  );
  const [calcVolume, setCalcVolume] = useState<number>(1000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshData = () => {
    setBenches(getHydroponicBenches());
    setReservoirs(getHydroponicReservoirs());
    setAnnotations(getHydroponicAnnotations());
  };

  useEffect(() => {
    ensureInitialHydroponicSync(farmId);
    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener('geaagro-hydroponics-updated', handleUpdate);
    window.addEventListener('geaagro-hydroponics-annotations-updated', handleUpdate);

    return () => {
      window.removeEventListener('geaagro-hydroponics-updated', handleUpdate);
      window.removeEventListener('geaagro-hydroponics-annotations-updated', handleUpdate);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [farmId]);

  useEffect(() => {
    if (!isNewAnnotationModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNewAnnotationModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isNewAnnotationModalOpen]);

  const currentRecipe = useMemo(
    () => hydroponicRecipesCatalog.find((r) => r.id === calcCropId) || hydroponicRecipesCatalog[0],
    [calcCropId]
  );

  const fertilizerCalc = useMemo(
    () => calculateHydroponicFertilizers(currentRecipe, calcVolume, 'desenvolvimento_engorda'),
    [currentRecipe, calcVolume]
  );

  const filteredAnnotations = useMemo(() => {
    return annotations.filter((ann) => {
      if (categoryFilter !== 'todos' && ann.category !== categoryFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        ann.title.toLowerCase().includes(term) ||
        ann.notes.toLowerCase().includes(term) ||
        (ann.author && ann.author.toLowerCase().includes(term)) ||
        (ann.benchCode && ann.benchCode.toLowerCase().includes(term)) ||
        (ann.reservoirName && ann.reservoirName.toLowerCase().includes(term))
      );
    });
  }, [annotations, categoryFilter, searchTerm]);

  const openModalWithDefaults = (overrides?: {
    benchId?: string;
    reservoirId?: string;
    category?: HydroponicAnnotation['category'];
    title?: string;
    notes?: string;
    ph?: string;
    ec?: string;
    fertilizers?: string;
  }) => {
    setAnnDate(getTodayIsoDate());
    setAnnTime(getCurrentTimeHHMM());
    setAnnBenchId(overrides?.benchId || '');
    setAnnReservoirId(overrides?.reservoirId || '');
    setAnnCategory(overrides?.category || 'manejo_solucao');
    setAnnTitle(overrides?.title || '');
    setAnnNotes(overrides?.notes || '');
    setAnnPH(overrides?.ph || '');
    setAnnEC(overrides?.ec || '');
    setAnnFertilizers(overrides?.fertilizers || '');
    setAnnWaterRefill('');
    setAnnTemp('');
    setIsNewAnnotationModalOpen(true);
  };

  const handleSubmitAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annNotes.trim()) {
      showToast('Preencha o título e as observações técnicas.');
      return;
    }

    const selectedBench = benches.find((b) => b.id === annBenchId);
    const selectedReservoir = reservoirs.find((r) => r.id === annReservoirId);
    const finalDate = annDate || getTodayIsoDate();
    const finalTime = annTime || getCurrentTimeHHMM();

    addHydroponicAnnotationAndSync(
      {
        date: finalDate,
        time: finalTime,
        author: annAuthor.trim() || 'Equipe de Manejo Hidropônico',
        category: annCategory,
        title: annTitle.trim(),
        notes: annNotes.trim(),
        benchId: selectedBench?.id,
        benchCode: selectedBench?.code,
        reservoirId: selectedReservoir?.id,
        reservoirName: selectedReservoir?.name,
        phValue: annPH ? parseFloat(annPH) : undefined,
        ecValue: annEC ? parseFloat(annEC) : undefined,
        waterRefilledLiters: annWaterRefill ? parseFloat(annWaterRefill) : undefined,
        fertilizersAddedSummary: annFertilizers.trim() || undefined,
        temperatureC: annTemp ? parseFloat(annTemp) : undefined,
      },
      farmId
    );

    if (selectedReservoir && (annPH || annEC)) {
      const updatedReservoirs = reservoirs.map((r) =>
        r.id === selectedReservoir.id
          ? {
              ...r,
              currentPH: annPH ? parseFloat(annPH) : r.currentPH,
              currentEC: annEC ? parseFloat(annEC) : r.currentEC,
              lastNutrientAdjustmentDate: `${formatBrDate(finalDate)} ${finalTime}`,
            }
          : r
      );
      setReservoirs(updatedReservoirs);
      saveHydroponicReservoirs(updatedReservoirs);
    }

    refreshData();
    setIsNewAnnotationModalOpen(false);
    showToast('Anotação registrada e sincronizada com o Caderno de Campo.');
  };

  const totalActivePlants = useMemo(
    () => benches.reduce((sum, b) => sum + b.currentPlantsCount, 0),
    [benches]
  );
  const readyForHarvestCount = useMemo(
    () => benches.filter((b) => b.status === 'pronto_colheita').length,
    [benches]
  );
  const avgReservoirPH = useMemo(() => {
    if (reservoirs.length === 0) return '—';
    return (reservoirs.reduce((s, r) => s + r.currentPH, 0) / reservoirs.length).toFixed(2);
  }, [reservoirs]);
  const avgReservoirEC = useMemo(() => {
    if (reservoirs.length === 0) return '—';
    return (reservoirs.reduce((s, r) => s + r.currentEC, 0) / reservoirs.length).toFixed(2);
  }, [reservoirs]);

  return (
    <div className="space-y-4">
      {/* Inline Notification */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 px-3.5 py-2.5 text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-0.5 text-emerald-700 dark:text-emerald-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Compact Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Hidroponia &amp; Estufas</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Sincronizado ao Caderno de Campo
                </span>
              </div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                Anotações Técnicas &amp; Manejo Hidropônico
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openModalWithDefaults()}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Anotação
            </button>

            {onNavigateToOperations && (
              <button
                type="button"
                onClick={onNavigateToOperations}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Histórico Geral
              </button>
            )}

            {onOpenFullHydroponicsModule && (
              <button
                type="button"
                onClick={onOpenFullHydroponicsModule}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Módulo Dedicado
              </button>
            )}
          </div>
        </div>

        {/* 4-KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs tabular-nums">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px]">Plantas em Cultivo</span>
              <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <strong className="text-sm text-slate-900 dark:text-zinc-100 block mt-0.5">
              {totalActivePlants.toLocaleString('pt-BR')} pés
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {benches.length} bancadas
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px]">Média de pH</span>
              <FlaskConical className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <strong className="text-sm text-slate-900 dark:text-zinc-100 block mt-0.5">
              {avgReservoirPH}
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              Faixa ideal 5,8–6,5
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px]">Condutividade (CE)</span>
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <strong className="text-sm text-emerald-700 dark:text-emerald-400 block mt-0.5">
              {avgReservoirEC} mS/cm
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {reservoirs.length} reservatórios
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span className="text-[11px]">Pronto p/ Colheita</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <strong className="text-sm text-slate-900 dark:text-zinc-100 block mt-0.5">
              {readyForHarvestCount} bancadas
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {annotations.length} anotações
            </span>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 flex items-center gap-1 overflow-x-auto">
        {[
          {
            id: 'anotacoes' as const,
            label: `Diário de Anotações (${annotations.length})`,
            icon: BookOpen,
          },
          {
            id: 'bancadas' as const,
            label: `Bancadas & Cultivos (${benches.length})`,
            icon: Layers,
          },
          {
            id: 'reservatorios' as const,
            label: `Reservatórios (${reservoirs.length})`,
            icon: FlaskConical,
          },
          {
            id: 'calculadora' as const,
            label: 'Simulador de Dosagem',
            icon: Scale,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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

      {/* TAB 1: DIÁRIO DE ANOTAÇÕES */}
      {activeTab === 'anotacoes' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar título, nota, autor ou bancada..."
                className={`${HYDRO_INPUT_CLASS} pl-8`}
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium inline-flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3 h-3" /> Filtrar:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'manejo_solucao', label: 'Solução' },
                { id: 'bancada_transplante', label: 'Bancadas' },
                { id: 'colheita', label: 'Colheita' },
                { id: 'sanidade_pragas', label: 'Sanidade' },
                { id: 'limpeza_manutencao', label: 'Limpeza' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filteredAnnotations.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2.5">
              <BookOpen className="w-7 h-7 text-slate-400 mx-auto" />
              <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Nenhuma anotação hidropônica encontrada
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Registre leituras de pH/CE, reposição de solução ou manejos de bancada para sincronizar automaticamente com o Caderno de Campo.
              </p>
              <button
                type="button"
                onClick={() => openModalWithDefaults()}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Primeira Anotação
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAnnotations.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        {ann.category === 'manejo_solucao' && <Droplets className="w-3.5 h-3.5" />}
                        {ann.category === 'bancada_transplante' && <Leaf className="w-3.5 h-3.5" />}
                        {ann.category === 'colheita' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {ann.category === 'sanidade_pragas' && <ShieldCheck className="w-3.5 h-3.5" />}
                        {ann.category === 'limpeza_manutencao' && <Zap className="w-3.5 h-3.5" />}
                        {(ann.category === 'geral' || ann.category === 'clima_estufa') && (
                          <BookOpen className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {ann.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                          <span>{CATEGORY_LABELS[ann.category]}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {formatBrDate(ann.date)} {ann.time && `às ${ann.time}`}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ann.author}
                          </span>
                        </div>
                      </div>
                    </div>

                    {ann.syncedWithFieldBook && (
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        Sincronizado Caderno de Campo
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {ann.notes}
                  </p>

                  {/* Unboxed Metadata Line */}
                  {(ann.benchCode ||
                    ann.reservoirName ||
                    ann.phValue !== undefined ||
                    ann.ecValue !== undefined ||
                    ann.temperatureC !== undefined ||
                    ann.waterRefilledLiters !== undefined ||
                    ann.fertilizersAddedSummary) && (
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      {ann.benchCode && (
                        <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">
                          Bancada {ann.benchCode}
                        </span>
                      )}
                      {ann.reservoirName && <span>{ann.reservoirName}</span>}
                      {ann.phValue !== undefined && (
                        <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
                          pH {ann.phValue}
                        </span>
                      )}
                      {ann.ecValue !== undefined && (
                        <span className="font-mono font-medium text-sky-700 dark:text-sky-400">
                          CE {ann.ecValue} mS/cm
                        </span>
                      )}
                      {ann.temperatureC !== undefined && (
                        <span className="font-mono">Temp {ann.temperatureC} °C</span>
                      )}
                      {ann.waterRefilledLiters !== undefined && (
                        <span>Reposição {ann.waterRefilledLiters} L</span>
                      )}
                      {ann.fertilizersAddedSummary && <span>{ann.fertilizersAddedSummary}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BANCADAS & CULTIVOS */}
      {activeTab === 'bancadas' && (
        <div className="space-y-3">
          {benches.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
              <Layers className="w-7 h-7 text-slate-400 mx-auto" />
              <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Nenhuma bancada cadastrada
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Cadastre bancadas no módulo dedicado de Hidroponia para acompanhar lotação, idade e colheitas aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {benches.map((bench) => {
                const res = reservoirs.find((r) => r.id === bench.reservoirId);
                const statusMeta = BENCH_STATUS_META[bench.status];
                return (
                  <div
                    key={bench.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                          <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                            {bench.code}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{bench.systemType.replace('_', ' ')}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 truncate">
                          {bench.cropName}{' '}
                          <span className="font-normal text-slate-500 dark:text-zinc-400">
                            ({bench.cultivar})
                          </span>
                        </p>
                      </div>
                      <span className={`text-[11px] font-medium shrink-0 ${statusMeta.textClass}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
                      <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          População
                        </span>
                        <strong className="text-slate-900 dark:text-zinc-100">
                          {bench.currentPlantsCount} / {bench.totalCapacityPlants}
                        </strong>
                      </div>
                      <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Idade (DAT)
                        </span>
                        <strong className="text-slate-900 dark:text-zinc-100">
                          {bench.daysAfterTransplant} dias
                        </strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-1 tabular-nums">
                      <div className="flex items-center justify-between">
                        <span>Transplante:</span>
                        <span className="font-mono">{formatBrDate(bench.transplantDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Previsão Colheita:</span>
                        <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
                          {formatBrDate(bench.expectedHarvestDate)}
                        </span>
                      </div>
                      {res && (
                        <div className="flex items-center justify-between">
                          <span>Reservatório:</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[160px]">
                            {res.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          openModalWithDefaults({
                            benchId: bench.id,
                            reservoirId: bench.reservoirId,
                            category: 'bancada_transplante',
                            title: `Manejo da Bancada ${bench.code} (${bench.cropName})`,
                          })
                        }
                        className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-emerald-500 text-xs font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Nova Anotação
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESERVATÓRIOS */}
      {activeTab === 'reservatorios' && (
        <div className="space-y-3">
          {reservoirs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
              <FlaskConical className="w-7 h-7 text-slate-400 mx-auto" />
              <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Nenhum reservatório cadastrado
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Cadastre reservatórios de solução nutritiva para monitorar pH, condutividade elétrica (CE) e oxigenação.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 tabular-nums">
              {reservoirs.map((res) => {
                const pumpMeta = PUMP_STATUS_META[res.pumpStatus];
                return (
                  <div
                    key={res.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {res.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {res.currentVolumeLiters} / {res.capacityLiters} L
                        </p>
                      </div>
                      <span className={`text-[11px] font-medium shrink-0 ${pumpMeta.textClass}`}>
                        {pumpMeta.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2.5">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          pH Atual
                        </span>
                        <strong className="text-base font-bold text-slate-900 dark:text-zinc-100">
                          {res.currentPH.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                          Alvo {res.targetPHMin}–{res.targetPHMax}
                        </span>
                      </div>

                      <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2.5">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          CE (mS/cm)
                        </span>
                        <strong className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                          {res.currentEC.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                          Alvo {res.targetECMin}–{res.targetECMax}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        {res.solutionTempC} °C
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-sky-500" />
                        O₂ {res.dissolvedOxygenPpm} mg/L
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openModalWithDefaults({
                          reservoirId: res.id,
                          category: 'manejo_solucao',
                          title: `Leitura & Calibração — ${res.name}`,
                          ph: res.currentPH.toString(),
                          ec: res.currentEC.toString(),
                        })
                      }
                      className="h-8 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Anotar Manejo / Calibração
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SIMULADOR DE DOSAGEM */}
      {activeTab === 'calculadora' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Calculadora Rápida de Solução Nutritiva
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Formulação balanceada de sais para Tanque A (Cálcio + Ferro) e Tanque B (N-P-K, Mg, S e Micros).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div>
                <label className={HYDRO_LABEL_CLASS}>Cultura &amp; Fórmula</label>
                <select
                  value={calcCropId}
                  onChange={(e) => setCalcCropId(e.target.value)}
                  className={HYDRO_INPUT_CLASS}
                >
                  {hydroponicRecipesCatalog.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.cropName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-28">
                <label className={HYDRO_LABEL_CLASS}>Volume (L)</label>
                <input
                  type="number"
                  value={calcVolume}
                  onChange={(e) => setCalcVolume(Math.max(50, parseInt(e.target.value, 10) || 100))}
                  step="50"
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tabular-nums">
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Tanque Concentrado A (Cálcio &amp; Ferro)
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  {fertilizerCalc.tankATotal} g total
                </span>
              </div>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-300">
                    Nitrato de Cálcio [Ca(NO₃)₂]:
                  </span>
                  <strong className="font-mono text-slate-900 dark:text-zinc-100">
                    {fertilizerCalc.tankA.calciumNitrate} g
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-300">
                    Quelato de Ferro (Fe-EDDHA / DTPA 6%):
                  </span>
                  <strong className="font-mono text-slate-900 dark:text-zinc-100">
                    {fertilizerCalc.tankA.ironChelateEDDHA} g
                  </strong>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Tanque Concentrado B (N-P-K, Mg, S e Micros)
                </span>
                <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                  {fertilizerCalc.tankBTotal} g total
                </span>
              </div>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-300">
                    Nitrato de Potássio (KNO₃):
                  </span>
                  <strong className="font-mono text-slate-900 dark:text-zinc-100">
                    {fertilizerCalc.tankB.potassiumNitrate} g
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-300">
                    Fosfato Monopotássico (MKP):
                  </span>
                  <strong className="font-mono text-slate-900 dark:text-zinc-100">
                    {fertilizerCalc.tankB.monopotassiumPhosphate} g
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-300">
                    Sulfato de Magnésio (MgSO₄):
                  </span>
                  <strong className="font-mono text-slate-900 dark:text-zinc-100">
                    {fertilizerCalc.tankB.magnesiumSulfate} g
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-zinc-300">
                    Complexo de Micronutrientes:
                  </span>
                  <strong className="font-mono text-slate-900 dark:text-zinc-100">
                    {fertilizerCalc.tankB.micronutrients} g
                  </strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <span className="text-slate-600 dark:text-zinc-400">
              Deseja registrar a aplicação desta fórmula diretamente no Caderno de Campo?
            </span>
            <button
              type="button"
              onClick={() =>
                openModalWithDefaults({
                  category: 'manejo_solucao',
                  title: `Preparo de ${calcVolume} L de Solução — ${currentRecipe.cropName}`,
                  fertilizers: `Tanque A: Ca(NO3)2 ${fertilizerCalc.tankA.calciumNitrate}g, Fe-EDDHA ${fertilizerCalc.tankA.ironChelateEDDHA}g. Tanque B: KNO3 ${fertilizerCalc.tankB.potassiumNitrate}g, MKP ${fertilizerCalc.tankB.monopotassiumPhosphate}g, MgSO4 ${fertilizerCalc.tankB.magnesiumSulfate}g, Micros ${fertilizerCalc.tankB.micronutrients}g.`,
                  notes: `Preparo e aplicação de solução nutritiva completa para ${calcVolume} L (${currentRecipe.cropName}). CE alvo: ${currentRecipe.targetEC.min}–${currentRecipe.targetEC.max} mS/cm.`,
                })
              }
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Registrar no Caderno de Campo
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NOVA ANOTAÇÃO */}
      {isNewAnnotationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
          onClick={() => setIsNewAnnotationModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Nova Anotação de Hidroponia
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Sincronização imediata com as operações do Caderno de Campo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAnnotationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitAnnotation}
              className="space-y-3.5 max-h-[75vh] overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={HYDRO_LABEL_CLASS}>Categoria da Anotação *</label>
                  <select
                    value={annCategory}
                    onChange={(e) =>
                      setAnnCategory(e.target.value as HydroponicAnnotation['category'])
                    }
                    className={HYDRO_INPUT_CLASS}
                  >
                    <option value="manejo_solucao">Manejo da Solução Nutritiva / Correção</option>
                    <option value="bancada_transplante">Bancada &amp; Transplante / Germinação</option>
                    <option value="colheita">Colheita / Despesca Comercial</option>
                    <option value="sanidade_pragas">Sanidade / Inspeção de Raízes &amp; Copas</option>
                    <option value="clima_estufa">Clima, Ventilação &amp; Temperatura</option>
                    <option value="limpeza_manutencao">Limpeza de Perfis &amp; Reservatórios</option>
                    <option value="geral">Outras Observações Gerais</option>
                  </select>
                </div>

                <div>
                  <label className={HYDRO_LABEL_CLASS}>Título do Registro *</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Ex: Calibração de pH & CE - Reservatório 01"
                    required
                    className={HYDRO_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={HYDRO_LABEL_CLASS}>Data *</label>
                  <input
                    type="date"
                    value={annDate}
                    onChange={(e) => setAnnDate(e.target.value)}
                    required
                    className={`${HYDRO_INPUT_CLASS} font-mono`}
                  />
                </div>

                <div>
                  <label className={HYDRO_LABEL_CLASS}>Horário</label>
                  <input
                    type="time"
                    value={annTime}
                    onChange={(e) => setAnnTime(e.target.value)}
                    className={`${HYDRO_INPUT_CLASS} font-mono`}
                  />
                </div>

                <div>
                  <label className={HYDRO_LABEL_CLASS}>Responsável Técnico</label>
                  <input
                    type="text"
                    value={annAuthor}
                    onChange={(e) => setAnnAuthor(e.target.value)}
                    placeholder="Nome do responsável"
                    className={HYDRO_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={HYDRO_LABEL_CLASS}>Vincular a Reservatório (Opcional)</label>
                  <select
                    value={annReservoirId}
                    onChange={(e) => setAnnReservoirId(e.target.value)}
                    className={HYDRO_INPUT_CLASS}
                  >
                    <option value="">Nenhum reservatório específico</option>
                    {reservoirs.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (pH {r.currentPH} · CE {r.currentEC})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={HYDRO_LABEL_CLASS}>Vincular a Bancada (Opcional)</label>
                  <select
                    value={annBenchId}
                    onChange={(e) => setAnnBenchId(e.target.value)}
                    className={HYDRO_INPUT_CLASS}
                  >
                    <option value="">Nenhuma bancada específica</option>
                    {benches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.cropName} ({b.systemType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3 space-y-3">
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                  Parâmetros Químicos e Físicos (Opcional)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className={HYDRO_LABEL_CLASS}>pH Medido</label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="6.0"
                      value={annPH}
                      onChange={(e) => setAnnPH(e.target.value)}
                      className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className={HYDRO_LABEL_CLASS}>CE (mS/cm)</label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="1.50"
                      value={annEC}
                      onChange={(e) => setAnnEC(e.target.value)}
                      className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className={HYDRO_LABEL_CLASS}>Reposição Água (L)</label>
                    <input
                      type="number"
                      placeholder="200"
                      value={annWaterRefill}
                      onChange={(e) => setAnnWaterRefill(e.target.value)}
                      className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className={HYDRO_LABEL_CLASS}>Temp. Solução (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="21.5"
                      value={annTemp}
                      onChange={(e) => setAnnTemp(e.target.value)}
                      className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                    />
                  </div>
                </div>

                <div>
                  <label className={HYDRO_LABEL_CLASS}>
                    Fertilizantes / Corretivos Adicionados
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 180g Nitrato de Cálcio, 120g Nitrato de Potássio, 50ml Ácido Fosfórico"
                    value={annFertilizers}
                    onChange={(e) => setAnnFertilizers(e.target.value)}
                    className={HYDRO_INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={HYDRO_LABEL_CLASS}>Observações Detalhadas de Manejo *</label>
                <textarea
                  rows={3}
                  value={annNotes}
                  onChange={(e) => setAnnNotes(e.target.value)}
                  required
                  placeholder="Descreva as ações executadas, estado das raízes, vigor das folhas ou recomendações..."
                  className={HYDRO_TEXTAREA_CLASS}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAnnotationModalOpen(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar &amp; Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HydroponicsFieldBookIntegration;
