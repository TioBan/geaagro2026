import React, { useMemo } from 'react';
import {
  Users,
  Activity,
  Heart,
  Baby,
  Scale,
  ShieldAlert,
  Award,
  ArrowRight,
  Layers,
  Thermometer,
  Boxes,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  Cpu,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineShedEnvironment,
  SwineFeedInventoryItem,
  SwineBiosecurityLog,
  SwineTab,
  SwineIESScore,
} from '../../types/swine';
import {
  calculateSwineExecutiveKPIs,
  calculateSwineIES,
  SwineExecutiveKPIs,
} from '../../utils/swineStorage';
import {
  SWINE_CARD_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  getComfortBadgeClass,
} from './swineUi';

interface SwineDashboardViewProps {
  kpis?: SwineExecutiveKPIs;
  iesScore?: SwineIESScore;
  animals?: SwineAnimal[];
  batches?: SwineBatch[];
  litters?: FarrowingLitter[];
  sheds?: SwineShedEnvironment[];
  inventory?: SwineFeedInventoryItem[];
  biosecurity?: SwineBiosecurityLog[];
  onNavigate: (tab: SwineTab) => void;
}

export const SwineDashboardView: React.FC<SwineDashboardViewProps> = ({
  kpis: propKpis,
  iesScore: propIes,
  animals = [],
  batches = [],
  litters = [],
  sheds = [],
  inventory = [],
  biosecurity = [],
  onNavigate,
}) => {
  const kpis = useMemo(
    () => propKpis ?? calculateSwineExecutiveKPIs(animals, batches, litters, inventory, sheds),
    [propKpis, animals, batches, litters, inventory, sheds]
  );

  const ies = useMemo(
    () => propIes ?? calculateSwineIES(kpis, sheds, biosecurity),
    [propIes, kpis, sheds, biosecurity]
  );

  const avgBornAlive = useMemo(() => {
    if (litters.length === 0) return null;
    const sum = litters.reduce((acc, l) => acc + l.bornAlive, 0);
    return Number((sum / litters.length).toFixed(1));
  }, [litters]);

  const activeWithdrawalCount = useMemo(() => {
    const now = Date.now();
    let count = 0;
    animals.forEach(a => {
      const hasActive = (a.healthHistory || []).some(h => {
        if (!h.withdrawalDays || h.withdrawalDays <= 0) return false;
        const end = new Date(h.date).getTime() + h.withdrawalDays * 86400000;
        return Number.isFinite(end) && now < end;
      });
      if (hasActive) count += 1;
    });
    return count;
  }, [animals]);

  const biosecurityCompliantCount = useMemo(
    () => biosecurity.filter(b => b.status === 'Conforme').length,
    [biosecurity]
  );

  return (
    <div className="space-y-4">
      {/* Compact Production Flow Strip */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Fluxo da Produção e Gargalos
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
              Reprodução → Gestação → Maternidade → Creche → Crescimento → Terminação → Abate
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('flow_pipeline')}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <span>Abrir Fluxo</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Executive Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Total do Rebanho</span>
            <Users className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
            {kpis.totalAnimals}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">animais ativos</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Matrizes Ativas</span>
            <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
            {kpis.activeSows}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {kpis.activeBoars} cachaços
          </span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Maternidade</span>
            <Baby className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {kpis.maternityPiglets}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">leitões lactantes</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Creche</span>
            <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
            {kpis.nurseryPiglets}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">desmamados</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Cresc. / Terminação</span>
            <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {kpis.growingPigs + kpis.finishingPigs}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {kpis.growingPigs} cresc. · {kpis.finishingPigs} term.
          </span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5">
            <span className="text-[11px] font-medium">Mortalidade Geral</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
            {kpis.overallMortalityPct}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            meta &lt; 3,0%
          </span>
        </div>
      </div>

      {/* Main 3-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reproductive Performance */}
        <div className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Desempenho Reprodutivo
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reproduction')}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Detalhes</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Taxa de Concepção</span>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                {kpis.conceptionRatePct}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">Meta &gt; 90%</span>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Taxa de Parto</span>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                {kpis.farrowingRatePct}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">Meta &gt; 88%</span>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Desmam. / Matriz / Ano</span>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                {kpis.weanedPerSowYear}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">DPA</span>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Taxa de Reposição</span>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                {kpis.replacementRatePct}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 block">Marrãs no plantel</span>
            </div>
          </div>

          <div className={`${SWINE_SUBCARD_CLASS} p-2.5 text-xs space-y-1 text-slate-600 dark:text-zinc-400`}>
            <div className="flex justify-between">
              <span>Leitões vivos / parto</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {avgBornAlive !== null ? `${avgBornAlive} leitões` : 'Sem partos'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Conversão alimentar média</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {kpis.avgFeedConversionRatio > 0 ? `${kpis.avgFeedConversionRatio} kg/kg` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GMD médio dos lotes</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {kpis.avgDailyGainG > 0 ? `${kpis.avgDailyGainG} g/dia` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Facilities & Ambience */}
        <div className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Instalações & Clima
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('environment')}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Galpões</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {sheds.length === 0 ? (
            <div className={`${SWINE_SUBCARD_CLASS} p-5 text-center space-y-1.5`}>
              <Thermometer className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Nenhuma leitura de galpão registrada
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Registre temperatura, umidade e NH₃ na aba Ambiência.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sheds.slice(0, 5).map(shed => (
                <div
                  key={shed.id}
                  className={`${SWINE_SUBCARD_CLASS} p-2.5 flex items-center justify-between gap-2`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                      {shed.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      {shed.currentOccupancy}/{shed.capacityAnimals} · {shed.temperatureC}°C · {shed.ammoniaNhpPpm} ppm NH₃
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${getComfortBadgeClass(shed.comfortStatus)}`}
                  >
                    {shed.comfortStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sanity & Biosecurity */}
        <div className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Sanidade & Biosseguridade
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('health')}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Sanidade</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className={`${SWINE_SUBCARD_CLASS} p-2.5 flex items-center justify-between gap-2`}>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Carência para Abate
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {activeWithdrawalCount > 0
                    ? `${activeWithdrawalCount} animal(is) com período de carência ativo.`
                    : 'Nenhum animal em período de carência ativo.'}
                </p>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${
                  activeWithdrawalCount > 0
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {activeWithdrawalCount > 0 ? 'Atenção' : 'Liberado'}
              </span>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-2.5 flex items-center justify-between gap-2`}>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Estoque & Insumos
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {inventory.length === 0
                    ? 'Nenhum insumo cadastrado no almoxarifado.'
                    : kpis.criticalStockAlerts > 0
                      ? `${kpis.criticalStockAlerts} item(ns) no estoque mínimo.`
                      : `${inventory.length} item(ns) com estoque regular.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('inventory')}
                className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline shrink-0 cursor-pointer"
              >
                Estoque
              </button>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-2.5 flex items-center justify-between gap-2`}>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Auditorias de Biosseguridade
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  {biosecurity.length === 0
                    ? 'Nenhuma inspeção de barreira registrada.'
                    : `${biosecurityCompliantCount} de ${biosecurity.length} registros conformes.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('biosecurity')}
                className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline shrink-0 cursor-pointer"
              >
                Barreiras
              </button>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-2.5 flex items-center justify-between gap-2`}>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Índice IES Atual
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {ies.totalScore > 0 ? ies.classification : 'Aguardando dados operacionais'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('ies_score')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums hover:underline shrink-0 cursor-pointer"
              >
                {ies.totalScore} pts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Shortcuts Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {[
          { id: 'flow_pipeline' as SwineTab, label: 'Fluxo Produtivo', icon: Layers },
          { id: 'animals' as SwineTab, label: 'Plantel & Animais', icon: Users },
          { id: 'digital_twin' as SwineTab, label: 'Gêmeo Digital', icon: Cpu },
          { id: 'maternity' as SwineTab, label: 'Maternidade', icon: Baby },
          { id: 'nutrition' as SwineTab, label: 'Nutrição & Ração', icon: Boxes },
          { id: 'diseases_lib' as SwineTab, label: 'Guia de Doenças', icon: ShieldAlert },
          { id: 'ies_score' as SwineTab, label: 'Score IES', icon: Award },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`${SWINE_CARD_CLASS} p-3 hover:border-rose-300 dark:hover:border-rose-700 transition-colors flex items-center gap-2.5 text-left cursor-pointer`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 leading-tight truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
