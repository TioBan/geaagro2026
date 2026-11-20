import React from 'react';
import {
  CaprineTab,
  CaprineAnimal,
  CaprineMilkRecord,
  CaprineWeighingRecord,
  CaprineHealthRecord,
  CaprineIecBreakdown
} from '../../types/caprine';
import { CaprinoIcon } from '../icons/CaprinoIcon';
import {
  Users,
  Milk,
  Scale,
  Heart,
  Baby,
  Syringe,
  AlertTriangle,
  Award,
  Activity,
  Plus,
  Sparkles,
  CheckCircle2,
  Droplets,
  Dna,
  Sprout,
  Wheat,
  Home,
  FileText,
  ChevronRight
} from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  milkLogs: CaprineMilkRecord[];
  weighings: CaprineWeighingRecord[];
  healthRecords: CaprineHealthRecord[];
  onNavigate: (tab: CaprineTab) => void;
  onOpenAddAnimalModal: () => void;
  onSelectAnimalForTwin?: (id: string) => void;
}

const FALLBACK_GOAT_IMG =
  'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=200&q=80';

export const CaprineDashboardView: React.FC<Props> = ({
  animals,
  milkLogs,
  weighings,
  healthRecords,
  onNavigate,
  onOpenAddAnimalModal,
  onSelectAnimalForTwin
}) => {
  const activeAnimals = animals.filter(a => a.status === 'Ativo');
  const totalAnimals = activeAnimals.length;
  const lactatingDoes = activeAnimals.filter(a => a.category === 'Cabra em Lactação').length;
  const pregnantDoes = activeAnimals.filter(a => a.category === 'Matriz Gestante').length;
  const kidsCount = activeAnimals.filter(
    a => a.category === 'Cabrito Mamando' || a.category === 'Cabrito Desmamado'
  ).length;

  const uniqueMilkDays = Math.max(1, new Set(milkLogs.map(m => m.date)).size);
  const totalDailyMilk =
    milkLogs.length > 0
      ? milkLogs.reduce((acc, curr) => acc + curr.totalLiters, 0) / uniqueMilkDays
      : 0;

  const weighingsWithGmd = weighings.filter(w => (w.gmdGramsDay || 0) > 0);
  const avgGmd =
    weighingsWithGmd.length > 0
      ? Math.round(
          weighingsWithGmd.reduce((acc, curr) => acc + (curr.gmdGramsDay || 0), 0) /
            weighingsWithGmd.length
        )
      : 0;

  const famachaAlerts = activeAnimals.filter(
    a => a.famachaScore !== undefined && a.famachaScore >= 3
  ).length;

  const iec: CaprineIecBreakdown = {
    reproductiveScore: 18,
    milkGmdScore: 17,
    famachaHealthScore: famachaAlerts === 0 ? 20 : Math.max(8, 20 - famachaAlerts * 3),
    feedEfficiencyScore: 13,
    pastureScore: 14,
    financialMarginScore: 8,
    totalIec: 0
  };
  iec.totalIec =
    iec.reproductiveScore +
    iec.milkGmdScore +
    iec.famachaHealthScore +
    iec.feedEfficiencyScore +
    iec.pastureScore +
    iec.financialMarginScore;

  const quickShortcuts: {
    tab: CaprineTab;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }[] = [
    {
      tab: 'digital_twin',
      title: 'Gêmeo Digital 360°',
      subtitle: 'Passaporte e histórico individual',
      icon: Sparkles,
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      tab: 'genealogy',
      title: 'Genealogia & Pedigree',
      subtitle: 'Árvore e simulador de inbreeding',
      icon: Dna,
      accent: 'text-violet-600 dark:text-violet-400'
    },
    {
      tab: 'pastures',
      title: 'Pastagens & Caprineira',
      subtitle: 'Rotação de piquetes e forragem',
      icon: Sprout,
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      tab: 'facilities',
      title: 'Apriscos & Instalações',
      subtitle: 'Lotação e biosseguridade',
      icon: Home,
      accent: 'text-amber-600 dark:text-amber-400'
    },
    {
      tab: 'nutrition',
      title: 'Nutrição NRC',
      subtitle: 'CMS, PB, NDT e banco de alimentos',
      icon: Wheat,
      accent: 'text-teal-600 dark:text-teal-400'
    },
    {
      tab: 'reports',
      title: 'Relatórios & Exportação',
      subtitle: 'Boletim PDF e planilha CSV',
      icon: FileText,
      accent: 'text-sky-600 dark:text-sky-400'
    }
  ];

  const iecRows = [
    { label: 'Reprodução e prolificidade', value: iec.reproductiveScore, max: 20 },
    { label: 'Leite e GMD carne', value: iec.milkGmdScore, max: 20 },
    { label: 'Sanidade e FAMACHA', value: iec.famachaHealthScore, max: 20 },
    { label: 'Eficiência alimentar', value: iec.feedEfficiencyScore, max: 15 },
    { label: 'Pastejo e piquetes', value: iec.pastureScore, max: 15 },
    { label: 'Margem zootécnica', value: iec.financialMarginScore, max: 10 }
  ];

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CaprinoIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
              Caprinocultura &amp; Zootecnia
            </h1>
            <span className="text-[11px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-md shrink-0">
              IEC {iec.totalIec}/100
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Controle de plantel, lactação, GMD, protocolo FAMACHA, nutrição NRC e apriscos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAddAnimalModal}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Caprino
          </button>
          <button
            type="button"
            onClick={() => onNavigate('milk')}
            className="h-8 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Milk className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Lançar Leite
          </button>
          <button
            type="button"
            onClick={() => onNavigate('health')}
            className="h-8 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Syringe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            FAMACHA
          </button>
        </div>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <button
          type="button"
          onClick={() => onNavigate('registry')}
          className="p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[11px] font-medium">Plantel Ativo</span>
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
            {totalAnimals}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">cab.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
            {animals.length} cadastrados
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('milk')}
          className="p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[11px] font-medium">Em Lactação</span>
            <Milk className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
            {lactatingDoes}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">mat.</span>
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5 truncate">
            Ordenha ativa
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('reproduction')}
          className="p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[11px] font-medium">Gestantes</span>
            <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
            {pregnantDoes}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">cab.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
            Controle de parto
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('kids')}
          className="p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[11px] font-medium">Cabritos</span>
            <Baby className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
            {kidsCount}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">crias</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
            Cria e recria
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('milk')}
          className="p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[11px] font-medium">Leite Diário</span>
            <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
            {totalDailyMilk.toFixed(1)}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">L/dia</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate tabular-nums">
            {(totalDailyMilk / Math.max(1, lactatingDoes)).toFixed(1)} L/cabra
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('meat')}
          className="p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
            <span className="text-[11px] font-medium">GMD Médio</span>
            <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
            {avgGmd > 0 ? avgGmd : '--'}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">g/dia</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
            {weighings.length} pesagens
          </p>
        </button>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: IEC + FAMACHA */}
        <div className="lg:col-span-5 space-y-5">
          {/* IEC Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Índice de Eficiência Caprina (IEC)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Boletim
              </button>
            </div>

            <div className="flex items-baseline gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                {iec.totalIec}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">/ 100 pontos</span>
              <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {iec.totalIec >= 85 ? 'Alto desempenho' : 'Atenção sanitária'}
              </span>
            </div>

            <div className="space-y-2">
              {iecRows.map(row => (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-zinc-400">{row.label}</span>
                    <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                      {row.value}/{row.max}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                      style={{ width: `${Math.round((row.value / row.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAMACHA Status Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Monitoramento FAMACHA
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {healthRecords.length} registros
              </span>
            </div>

            {famachaAlerts > 0 ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-rose-900 dark:text-rose-200">
                    {famachaAlerts} animal(is) com FAMACHA grau 3 ou superior
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    Avaliar mucosa ocular e aplicar desverminação seletiva imediata.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                    Plantel sem alertas de anemia (Graus 1 e 2)
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Mantenha a inspeção quinzenal para controle de Haemonchus contortus.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('health')}
              className="w-full h-8 px-3 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Abrir Controle Sanitário</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Herd Roster + Module Shortcuts */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Herd Roster */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Destaques do Plantel Caprino
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Clique em um animal para abrir o Gêmeo Digital 360°
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('registry')}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Ver todos ({animals.length})
              </button>
            </div>

            {animals.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Nenhum caprino cadastrado ainda.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Cadastre o primeiro animal com brinco RFID para iniciar o acompanhamento zootécnico.
                </p>
                <button
                  type="button"
                  onClick={onOpenAddAnimalModal}
                  className="mt-2 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Caprino
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {animals.slice(0, 5).map(animal => {
                  const famacha = animal.famachaScore || 1;
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() =>
                        onSelectAnimalForTwin
                          ? onSelectAnimalForTwin(animal.id)
                          : onNavigate('digital_twin')
                      }
                      className="w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={animal.photoUrl || FALLBACK_GOAT_IMG}
                          alt={animal.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                              {animal.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 shrink-0">
                              {animal.earTag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {animal.breed} · {animal.category} ·{' '}
                            <span className="tabular-nums">{animal.weightKg} kg</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[11px] font-medium tabular-nums ${
                            famacha >= 3
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          FAMACHA {famacha}
                        </span>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate max-w-[120px]">
                          {animal.lot}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact Module Shortcuts */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-slate-200 dark:divide-zinc-800 overflow-hidden">
            {quickShortcuts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => onNavigate(item.tab)}
                  className={`p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                    idx % 3 !== 0 ? 'lg:border-l lg:border-slate-200 lg:dark:border-zinc-800' : ''
                  } ${idx >= 3 ? 'lg:border-t lg:border-slate-200 lg:dark:border-zinc-800' : ''} ${
                    idx % 2 !== 0 ? 'sm:border-l sm:border-slate-200 sm:dark:border-zinc-800 lg:border-l' : ''
                  } ${idx >= 2 ? 'sm:border-t sm:border-slate-200 sm:dark:border-zinc-800 lg:border-t-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.accent}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
