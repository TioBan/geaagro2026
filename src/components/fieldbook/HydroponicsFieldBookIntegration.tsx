import React, { useState, useEffect, useMemo } from 'react';
import {
  Droplets,
  Plus,
  Activity,
  Calendar,
  Layers,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  FlaskConical,
  X,
  User,
  Check,
  Zap,
  Leaf,
  Scale,
  Building2,
  Share2,
} from 'lucide-react';
import {
  HydroponicBench,
  NutrientSolutionReservoir,
  HydroponicAnnotation,
} from '../../types/hydroponics';
import {
  getHydroponicBenches,
  getHydroponicReservoirs,
  getHydroponicAnnotations,
  saveHydroponicBenches,
  saveHydroponicReservoirs,
  addHydroponicAnnotationAndSync,
  ensureInitialHydroponicSync,
} from '../../utils/hydroponicsFieldBookSync';
import { hydroponicRecipesCatalog } from '../../data/hydroponicsData';

interface HydroponicsFieldBookIntegrationProps {
  onNavigateToOperations?: () => void;
  onOpenFullHydroponicsModule?: () => void;
  farmId?: string;
}

export const HydroponicsFieldBookIntegration: React.FC<HydroponicsFieldBookIntegrationProps> = ({
  onNavigateToOperations,
  onOpenFullHydroponicsModule,
  farmId = 'farm-1',
}) => {
  const [benches, setBenches] = useState<HydroponicBench[]>([]);
  const [reservoirs, setReservoirs] = useState<NutrientSolutionReservoir[]>([]);
  const [annotations, setAnnotations] = useState<HydroponicAnnotation[]>([]);
  const [activeTab, setActiveTab] = useState<'anotacoes' | 'bancadas' | 'reservatorios' | 'fitossanidade' | 'calculadora'>('anotacoes');
  
  // Search & Filter state for annotations
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // Modal state for new annotation
  const [isNewAnnotationModalOpen, setIsNewAnnotationModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<HydroponicAnnotation['category']>('manejo_solucao');
  const [annAuthor, setAnnAuthor] = useState('Eng. Agrônomo Marcelo Torres');
  const [annDate, setAnnDate] = useState(new Date().toISOString().split('T')[0]);
  const [annTime, setAnnTime] = useState(new Date().toTimeString().slice(0, 5));
  const [annNotes, setAnnNotes] = useState('');
  const [annBenchId, setAnnBenchId] = useState('');
  const [annReservoirId, setAnnReservoirId] = useState('');
  const [annPH, setAnnPH] = useState('');
  const [annEC, setAnnEC] = useState('');
  const [annWaterRefill, setAnnWaterRefill] = useState('');
  const [annFertilizers, setAnnFertilizers] = useState('');
  const [annPestObs, setAnnPestObs] = useState('');
  const [annTemp, setAnnTemp] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Nutrient Calculator state
  const [calcCropId, setCalcCropId] = useState('recipe-alface-crespa');
  const [calcVolume, setCalcVolume] = useState<number>(1000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial data and setup listeners
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
    };
  }, [farmId]);

  // Selected recipe calculation
  const currentRecipe = useMemo(() => {
    return hydroponicRecipesCatalog.find(r => r.id === calcCropId) || hydroponicRecipesCatalog[0];
  }, [calcCropId]);

  const fertilizerCalc = useMemo(() => {
    const factor = calcVolume / 1000;
    const base = currentRecipe.fertilizerStockGramsPer1000L;
    return {
      tankA: {
        calciumNitrate: Math.round(base.calciumNitrate * factor),
        ironEDDHA: Math.round(base.ironChelateEDDHA * factor),
      },
      tankB: {
        potassiumNitrate: Math.round(base.potassiumNitrate * factor),
        mkp: Math.round(base.monopotassiumPhosphate * factor),
        magnesiumSulfate: Math.round(base.magnesiumSulfate * factor),
        micros: Math.round(base.micronutrientsConMicros * factor),
      },
      total: Math.round(
        (base.calciumNitrate +
          base.ironChelateEDDHA +
          base.potassiumNitrate +
          base.monopotassiumPhosphate +
          base.magnesiumSulfate +
          base.micronutrientsConMicros) *
          factor
      ),
    };
  }, [currentRecipe, calcVolume]);

  // Filtered annotations
  const filteredAnnotations = useMemo(() => {
    return annotations.filter(ann => {
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

  // Handle submit new annotation
  const handleSubmitAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annNotes.trim()) {
      showToast('Por favor, preencha o título e as observações.');
      return;
    }

    const selectedBench = benches.find(b => b.id === annBenchId);
    const selectedReservoir = reservoirs.find(r => r.id === annReservoirId);

    const { annotation } = addHydroponicAnnotationAndSync(
      {
        date: annDate,
        time: annTime,
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
        pestOrDiseaseObserved: annPestObs.trim() || undefined,
        temperatureC: annTemp ? parseFloat(annTemp) : undefined,
      },
      farmId
    );

    // If pH or EC was provided and a reservoir was selected, update reservoir values
    if (selectedReservoir && (annPH || annEC)) {
      const updatedReservoirs = reservoirs.map(r => {
        if (r.id === selectedReservoir.id) {
          return {
            ...r,
            currentPH: annPH ? parseFloat(annPH) : r.currentPH,
            currentEC: annEC ? parseFloat(annEC) : r.currentEC,
            lastNutrientAdjustmentDate: `${annDate} ${annTime}`,
          };
        }
        return r;
      });
      setReservoirs(updatedReservoirs);
      saveHydroponicReservoirs(updatedReservoirs);
    }

    refreshData();
    setIsNewAnnotationModalOpen(false);
    
    // Reset form
    setAnnTitle('');
    setAnnNotes('');
    setAnnPH('');
    setAnnEC('');
    setAnnWaterRefill('');
    setAnnFertilizers('');
    setAnnPestObs('');
    setAnnTemp('');
    setAnnBenchId('');
    setAnnReservoirId('');

    showToast(`✅ Anotação registrada e sincronizada com o Caderno de Campo com sucesso!`);
  };

  // Open modal with pre-fills
  const openNewAnnotationForBench = (bench: HydroponicBench) => {
    setAnnBenchId(bench.id);
    setAnnReservoirId(bench.reservoirId || '');
    setAnnCategory('bancada_transplante');
    setAnnTitle(`Manejo da Bancada ${bench.code} (${bench.cropName})`);
    setIsNewAnnotationModalOpen(true);
  };

  const openNewAnnotationForReservoir = (reservoir: NutrientSolutionReservoir) => {
    setAnnReservoirId(reservoir.id);
    setAnnPH(reservoir.currentPH.toString());
    setAnnEC(reservoir.currentEC.toString());
    setAnnCategory('manejo_solucao');
    setAnnTitle(`Leitura & Calibração do ${reservoir.name}`);
    setIsNewAnnotationModalOpen(true);
  };

  // KPIs
  const totalActivePlants = useMemo(() => benches.reduce((sum, b) => sum + b.currentPlantsCount, 0), [benches]);
  const readyForHarvestCount = useMemo(() => benches.filter(b => b.status === 'pronto_colheita').length, [benches]);
  const avgReservoirPH = useMemo(() => {
    if (reservoirs.length === 0) return '6.0';
    return (reservoirs.reduce((s, r) => s + r.currentPH, 0) / reservoirs.length).toFixed(2);
  }, [reservoirs]);
  const avgReservoirEC = useMemo(() => {
    if (reservoirs.length === 0) return '1.5';
    return (reservoirs.reduce((s, r) => s + r.currentEC, 0) / reservoirs.length).toFixed(2);
  }, [reservoirs]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 text-white p-6 rounded-2xl border border-teal-700/50 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-400/30 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide">
                <Droplets className="w-4 h-4 text-teal-400" />
                Hidroponia &amp; Estufas Conectadas
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Sincronização Ativa com Caderno de Campo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Anotações Técnicas &amp; Manejo Hidropônico
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Todas as medições de pH, Condutividade Elétrica (CE), reposição de solução nutritiva, transplantes e despescas ficam centralizadas diretamente no seu Caderno de Campo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setAnnBenchId('');
                setAnnReservoirId('');
                setAnnTitle('');
                setAnnNotes('');
                setIsNewAnnotationModalOpen(true);
              }}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Anotação Hidropônica</span>
            </button>

            {onNavigateToOperations && (
              <button
                onClick={onNavigateToOperations}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
                title="Ver todas as operações no Caderno de Campo"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Ver no Histórico Geral</span>
              </button>
            )}

            {onOpenFullHydroponicsModule && (
              <button
                onClick={onOpenFullHydroponicsModule}
                className="px-3.5 py-2.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-cyan-500/40 cursor-pointer"
                title="Abrir Módulo de Hidroponia Dedicado"
              >
                <Share2 className="w-4 h-4 text-cyan-300" />
                <span>Módulo Dedicado</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Plantas em Cultivo</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalActivePlants.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">pés</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{benches.length} bancadas monitoradas</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Média de pH</span>
            <FlaskConical className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
              {avgReservoirPH}
            </span>
            <span className="text-[11px] font-bold text-slate-500">Faixa Ideal (5.8 - 6.5)</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">✓ Estável nos tanques</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Condutividade (CE)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {avgReservoirEC}
            </span>
            <span className="text-xs font-semibold text-slate-500">mS/cm</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{reservoirs.length} reservatórios ativos</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Pronto p/ Colheita</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {readyForHarvestCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">bancadas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{annotations.length} anotações arquivadas</p>
        </div>
      </div>

      {/* Subtabs Bar inside Caderno de Campo */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('anotacoes')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'anotacoes'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Diário de Anotações &amp; Manejo ({annotations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bancadas')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'bancadas'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bancadas &amp; Cultivos ({benches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservatorios')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reservatorios'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Solução Nutritiva &amp; Reservatórios ({reservoirs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calculadora')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'calculadora'
              ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Simulador de Dosagem Nutritiva</span>
        </button>
      </div>

      {/* TAB 1: DIÁRIO DE ANOTAÇÕES & MANEJO */}
      {activeTab === 'anotacoes' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, nota, autor ou bancada..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filtrar:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'manejo_solucao', label: '💧 Solução Nutritiva' },
                { id: 'bancada_transplante', label: '🌱 Bancadas' },
                { id: 'colheita', label: '🧺 Colheita' },
                { id: 'sanidade_pragas', label: '🛡️ Sanidade' },
                { id: 'limpeza_manutencao', label: '🧹 Limpeza' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Annotations Timeline */}
          {filteredAnnotations.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 dark:text-zinc-300">
                Nenhuma anotação hidropônica encontrada
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Registre sua primeira observação técnica, leitura de sensores ou manejo de solução nutritiva para sincronizar com o Caderno de Campo.
              </p>
              <button
                onClick={() => setIsNewAnnotationModalOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeira Anotação</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnnotations.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-teal-500/50 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`p-2 rounded-xl text-xs ${
                          ann.category === 'manejo_solucao'
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-800'
                            : ann.category === 'colheita'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                            : ann.category === 'sanidade_pragas'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200 dark:border-amber-800'
                            : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800'
                        }`}
                      >
                        {ann.category === 'manejo_solucao' && <Droplets className="w-4 h-4" />}
                        {ann.category === 'bancada_transplante' && <Leaf className="w-4 h-4" />}
                        {ann.category === 'colheita' && <CheckCircle2 className="w-4 h-4" />}
                        {ann.category === 'sanidade_pragas' && <ShieldCheck className="w-4 h-4" />}
                        {ann.category === 'limpeza_manutencao' && <Zap className="w-4 h-4" />}
                        {ann.category === 'geral' && <BookOpen className="w-4 h-4" />}
                      </span>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {ann.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {new Date(ann.date).toLocaleDateString('pt-BR')} às {ann.time}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ann.author}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ann.syncedWithFieldBook && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" />
                          Sincronizado Caderno de Campo
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {ann.notes}
                  </p>

                  {/* Param badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {ann.benchCode && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono font-semibold">
                        Bancada: {ann.benchCode}
                      </span>
                    )}
                    {ann.reservoirName && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold">
                        {ann.reservoirName}
                      </span>
                    )}
                    {ann.phValue !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold font-mono">
                        pH: {ann.phValue}
                      </span>
                    )}
                    {ann.ecValue !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold font-mono">
                        CE: {ann.ecValue} mS/cm
                      </span>
                    )}
                    {ann.temperatureC !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
                        Temp: {ann.temperatureC}°C
                      </span>
                    )}
                    {ann.waterRefilledLiters !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                        Reposição: {ann.waterRefilledLiters}L
                      </span>
                    )}
                    {ann.fertilizersAddedSummary && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                        {ann.fertilizersAddedSummary}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BANCADAS & CULTIVOS */}
      {activeTab === 'bancadas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Bancadas em Produção ({benches.length})
            </h3>
            <span className="text-xs text-slate-500">
              {totalActivePlants.toLocaleString()} plantas em desenvolvimento
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benches.map(bench => {
              const res = reservoirs.find(r => r.id === bench.reservoirId);
              return (
                <div
                  key={bench.id}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-teal-500/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {bench.code}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {bench.systemType}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                        {bench.cropName} <span className="font-normal text-slate-500">({bench.cultivar})</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        bench.status === 'pronto_colheita'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : bench.status === 'maternidade'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                      }`}
                    >
                      {bench.status === 'pronto_colheita'
                        ? 'Pronto p/ Colheita'
                        : bench.status === 'maternidade'
                        ? 'Berçário'
                        : 'Desenvolvimento'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">População</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {bench.currentPlantsCount} / {bench.totalCapacityPlants}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Idade (DAT)</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {bench.daysAfterTransplant} dias
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Transplante:</span>
                      <span className="font-mono font-medium">{bench.transplantDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Previsão Colheita:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{bench.expectedHarvestDate}</span>
                    </div>
                    {res && (
                      <div className="flex items-center justify-between">
                        <span>Reservatório:</span>
                        <span className="font-semibold text-teal-700 dark:text-teal-300">{res.name.split('-')[0]}</span>
                      </div>
                    )}
                  </div>

                  {bench.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic bg-slate-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                      "{bench.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openNewAnnotationForBench(bench)}
                      className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Anotação</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RESERVATÓRIOS & SOLUÇÃO NUTRITIVA */}
      {activeTab === 'reservatorios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              Monitoramento dos Reservatórios de Solução Nutritiva
            </h3>
            <span className="text-xs text-slate-500">Leituras em tempo real</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reservoirs.map(res => (
              <div
                key={res.id}
                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-zinc-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{res.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Capacidade: {res.capacityLiters}L • Atual: {res.currentVolumeLiters}L
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      res.pumpStatus === 'ligada'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    Bomba {res.pumpStatus}
                  </span>
                </div>

                {/* Gauges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200/60 dark:border-teal-800/40 text-center">
                    <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold uppercase block">
                      Potencial Hidrogênico (pH)
                    </span>
                    <p className="text-2xl font-black text-teal-950 dark:text-teal-200 mt-0.5">
                      {res.currentPH.toFixed(2)}
                    </p>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 block mt-0.5">
                      Alvo: {res.targetPHMin} - {res.targetPHMax}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-center">
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase block">
                      Condutividade (CE)
                    </span>
                    <p className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-0.5">
                      {res.currentEC.toFixed(2)}
                    </p>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">
                      mS/cm (Alvo: {res.targetECMin}-{res.targetECMax})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    <span>Temp: <strong>{res.solutionTempC}°C</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-500" />
                    <span>O₂: <strong>{res.dissolvedOxygenPpm} mg/L</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-zinc-400 border-t pt-2 border-slate-100 dark:border-zinc-800">
                  <p>Último ajuste: {res.lastNutrientAdjustmentDate}</p>
                </div>

                <button
                  onClick={() => openNewAnnotationForReservoir(res)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Anotar Manejo / Calibração</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SIMULADOR DE DOSAGEM NUTRITIVA */}
      {activeTab === 'calculadora' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                Calculadora Rápida de Solução Nutritiva
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulação balanceada de sais para Tanque A (Cálcio + Ferro) e Tanque B (Potássio, Fósforo, Magnésio e Micros)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                  Cultura &amp; Fórmula:
                </label>
                <select
                  value={calcCropId}
                  onChange={e => setCalcCropId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                >
                  {hydroponicRecipesCatalog.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.cropName} ({recipe.stage === 'bercario' ? 'Berçário' : recipe.stage === 'frutificacao' ? 'Frutificação' : 'Engorda'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                  Volume (Litros):
                </label>
                <input
                  type="number"
                  value={calcVolume}
                  onChange={e => setCalcVolume(Math.max(50, parseInt(e.target.value) || 100))}
                  step="50"
                  className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Sais Calculados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tanque A */}
            <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200/80 dark:border-teal-800/40 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-teal-200/60 dark:border-teal-800/40">
                <span className="font-extrabold text-sm text-teal-950 dark:text-teal-200">
                  Tanque Concentrado A (Cálcio &amp; Ferro)
                </span>
                <span className="text-xs bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded">
                  {fertilizerCalc.tankA.calciumNitrate + fertilizerCalc.tankA.ironEDDHA}g total
                </span>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Nitrato de Cálcio [Ca(NO₃)₂]:</span>
                  <span className="font-bold font-mono text-teal-900 dark:text-teal-200">
                    {fertilizerCalc.tankA.calciumNitrate} g
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Quelato de Ferro (Fe-EDDHA / DTPA 6%):</span>
                  <span className="font-bold font-mono text-teal-900 dark:text-teal-200">
                    {fertilizerCalc.tankA.ironEDDHA} g
                  </span>
                </li>
              </ul>
            </div>

            {/* Tanque B */}
            <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-2xl border border-cyan-200/80 dark:border-cyan-800/40 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-cyan-200/60 dark:border-cyan-800/40">
                <span className="font-extrabold text-sm text-cyan-950 dark:text-cyan-200">
                  Tanque Concentrado B (N-P-K, Mg, S e Micros)
                </span>
                <span className="text-xs bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 font-bold px-2 py-0.5 rounded">
                  {fertilizerCalc.tankB.potassiumNitrate + fertilizerCalc.tankB.mkp + fertilizerCalc.tankB.magnesiumSulfate + fertilizerCalc.tankB.micros}g total
                </span>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Nitrato de Potássio (KNO₃):</span>
                  <span className="font-bold font-mono text-cyan-900 dark:text-cyan-200">
                    {fertilizerCalc.tankB.potassiumNitrate} g
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Fosfato Monopotássico (MKP - KH₂PO₄):</span>
                  <span className="font-bold font-mono text-cyan-900 dark:text-cyan-200">
                    {fertilizerCalc.tankB.mkp} g
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Sulfato de Magnésio (MgSO₄·7H₂O):</span>
                  <span className="font-bold font-mono text-cyan-900 dark:text-cyan-200">
                    {fertilizerCalc.tankB.magnesiumSulfate} g
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Complexo de Micronutrientes (B, Zn, Mn, Cu, Mo):</span>
                  <span className="font-bold font-mono text-cyan-900 dark:text-cyan-200">
                    {fertilizerCalc.tankB.micros} g
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs">
            <span className="text-slate-600 dark:text-zinc-300 font-medium">
              💡 Deseja registrar a aplicação desta fórmula no Caderno de Campo?
            </span>
            <button
              onClick={() => {
                setAnnCategory('manejo_solucao');
                setAnnTitle(`Preparo de ${calcVolume}L de Solução Nutritiva - ${currentRecipe.cropName}`);
                setAnnFertilizers(`Tanque A: Nitrato de Cálcio ${fertilizerCalc.tankA.calciumNitrate}g, Fe-EDDHA ${fertilizerCalc.tankA.ironEDDHA}g. Tanque B: Nitrato de Potássio ${fertilizerCalc.tankB.potassiumNitrate}g, MKP ${fertilizerCalc.tankB.mkp}g, MgSO4 ${fertilizerCalc.tankB.magnesiumSulfate}g, Micros ${fertilizerCalc.tankB.micros}g.`);
                setAnnNotes(`Preparo e aplicação de solução nutritiva completa para ${calcVolume} litros para cultivo de ${currentRecipe.cropName}. CE esperada: ${currentRecipe.targetEC.min}-${currentRecipe.targetEC.max} mS/cm.`);
                setIsNewAnnotationModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Registrar no Caderno de Campo
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NOVA ANOTAÇÃO / MANEJO HIDROPÔNICO */}
      {isNewAnnotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-teal-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Nova Anotação de Hidroponia</h3>
                  <p className="text-xs text-teal-200 font-medium">
                    Sincronização em tempo real com o Caderno de Campo
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewAnnotationModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitAnnotation} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Categoria da Anotação *
                  </label>
                  <select
                    value={annCategory}
                    onChange={e => setAnnCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="manejo_solucao">💧 Manejo da Solução Nutritiva / Correção</option>
                    <option value="bancada_transplante">🌱 Bancada &amp; Transplante / Germinação</option>
                    <option value="colheita">🧺 Colheita / Despesca Comercial</option>
                    <option value="sanidade_pragas">🛡️ Sanidade / Inspeção de Raízes &amp; Copas</option>
                    <option value="clima_estufa">☀️ Clima, Ventilação &amp; Temperatura</option>
                    <option value="limpeza_manutencao">🧹 Limpeza de Perfis &amp; Reservatórios</option>
                    <option value="geral">📝 Outras Observações Gerais</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Título do Registro *
                  </label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    placeholder="Ex: Calibração de pH & CE - Reservatório 01"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={annDate}
                    onChange={e => setAnnDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={annTime}
                    onChange={e => setAnnTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Responsável Técnico
                  </label>
                  <input
                    type="text"
                    value={annAuthor}
                    onChange={e => setAnnAuthor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Associations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Vincular a Reservatório (Opcional)
                  </label>
                  <select
                    value={annReservoirId}
                    onChange={e => setAnnReservoirId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="">Nenhum reservatório específico</option>
                    {reservoirs.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Atual: pH {r.currentPH} | CE {r.currentEC})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Vincular a Bancada (Opcional)
                  </label>
                  <select
                    value={annBenchId}
                    onChange={e => setAnnBenchId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="">Nenhuma bancada específica</option>
                    {benches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.cropName} ({b.systemType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Technical Measurements */}
              <div className="p-3.5 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-200 dark:border-teal-800/40 space-y-3">
                <span className="font-bold text-teal-900 dark:text-teal-200 block">
                  🔬 Parâmetros Químicos e Físicos (Opcional)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">
                      pH Medido
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="Ex: 6.1"
                      value={annPH}
                      onChange={e => setAnnPH(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">
                      CE (mS/cm)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="Ex: 1.55"
                      value={annEC}
                      onChange={e => setAnnEC(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">
                      Reposição Água (L)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 250"
                      value={annWaterRefill}
                      onChange={e => setAnnWaterRefill(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">
                      Temp. Solução (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 21.5"
                      value={annTemp}
                      onChange={e => setAnnTemp(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 block mb-0.5">
                    Fertilizantes / Corretivos Adicionados
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 180g Nitrato de Cálcio, 120g Nitrato de Potássio, 50ml Ácido Fosfórico"
                    value={annFertilizers}
                    onChange={e => setAnnFertilizers(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Observações Detalhadas de Manejo *
                </label>
                <textarea
                  rows={4}
                  value={annNotes}
                  onChange={e => setAnnNotes(e.target.value)}
                  required
                  placeholder="Descreva as ações executadas, estado das raízes, vigor das folhas, acionamento de bomba ou recomendações para os próximos turnos..."
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAnnotationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar &amp; Sincronizar</span>
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
