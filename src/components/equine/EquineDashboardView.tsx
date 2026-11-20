import React, { useMemo } from 'react';
import {
  Plus,
  Heart,
  Award,
  Syringe,
  Hammer,
  Wheat,
  Dna,
  AlertTriangle,
  ChevronRight,
  FileCheck,
  Sparkles,
  Scale,
  DollarSign,
  Trophy,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineHealthRecord,
  EquineFarrieryRecord,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineExpenseRecord,
} from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals: EquineAnimal[];
  healthRecords: EquineHealthRecord[];
  farrieryRecords: EquineFarrieryRecord[];
  trainingRecords: EquineTrainingRecord[];
  competitionRecords: EquineCompetitionRecord[];
  expenses: EquineExpenseRecord[];
  onNavigateTab: (tabId: string, animalId?: string) => void;
  onOpenPassport: (animal: EquineAnimal) => void;
}

export const EquineDashboardView: React.FC<Props> = ({
  animals,
  healthRecords,
  farrieryRecords,
  trainingRecords,
  competitionRecords,
  expenses,
  onNavigateTab,
  onOpenPassport,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeHealth = useMemo(() => (healthRecords || []).filter(h => h && h.id), [healthRecords]);
  const safeFarriery = useMemo(() => (farrieryRecords || []).filter(f => f && f.id), [farrieryRecords]);
  const safeTraining = useMemo(() => (trainingRecords || []).filter(t => t && t.id), [trainingRecords]);
  const safeCompetitions = useMemo(() => (competitionRecords || []).filter(c => c && c.id), [competitionRecords]);
  const safeExpenses = useMemo(() => (expenses || []).filter(e => e && e.id), [expenses]);

  const metrics = useMemo(() => {
    const total = safeAnimals.length;
    const stallions = safeAnimals.filter(a => a.sex === 'Garanhão').length;
    const mares = safeAnimals.filter(a => a.sex === 'Égua').length;
    const pregnantMares = safeAnimals.filter(a => a.isPregnant);
    const athletes = safeAnimals.filter(
      a => a.category === 'Treinamento / Esporte' || a.status === 'Em Treinamento Externo' || a.status === 'Em Competição'
    ).length;

    const avgBodyScore =
      total > 0
        ? safeAnimals.reduce((sum, a) => sum + (a.bodyScore || 5), 0) / total
        : 0;

    const totalExpenses = safeExpenses
      .filter(e => e.type !== 'Receita')
      .reduce((sum, e) => sum + (e.amountBrl || 0), 0);

    const totalPrizes = safeCompetitions.reduce((sum, c) => sum + (c.prizeMoneyBrl || 0), 0);

    const today = new Date();
    const soonThreshold = new Date();
    soonThreshold.setDate(today.getDate() + 15);

    const dueFarriery = safeFarriery.filter(f => {
      const dueStr = f.nextShoeingDate || f.nextDueDate;
      if (!dueStr) return false;
      const d = new Date(dueStr);
      return !isNaN(d.getTime()) && d <= soonThreshold;
    });

    const pendingHealth = safeHealth.filter(h => {
      if (h.status === 'Agendado' || h.status === 'Em Tratamento') return true;
      if (!h.nextDueDate) return false;
      const d = new Date(h.nextDueDate);
      return !isNaN(d.getTime()) && d <= soonThreshold;
    });

    const breedCount: Record<string, number> = {};
    safeAnimals.forEach(a => {
      const breed = a.breed || 'Não informada';
      breedCount[breed] = (breedCount[breed] || 0) + 1;
    });

    return {
      total,
      stallions,
      mares,
      pregnantMares,
      athletes,
      avgBodyScore,
      totalExpenses,
      totalPrizes,
      dueFarriery,
      pendingHealth,
      breedCount,
    };
  }, [safeAnimals, safeExpenses, safeCompetitions, safeFarriery, safeHealth]);

  const operationalAlerts = useMemo(() => {
    const items: Array<{
      id: string;
      severity: 'high' | 'medium' | 'info';
      title: string;
      detail: string;
      tab: string;
      animalId?: string;
    }> = [];

    metrics.pendingHealth.slice(0, 2).forEach(h => {
      const animal = safeAnimals.find(a => a.id === h.animalId);
      items.push({
        id: `health-${h.id}`,
        severity: 'high',
        title: `${h.title} — ${animal?.name || 'Animal'}`,
        detail: h.nextDueDate
          ? `Vencimento/Reforço em ${new Date(h.nextDueDate).toLocaleDateString('pt-BR')}`
          : `Status: ${h.status}`,
        tab: 'health',
        animalId: h.animalId,
      });
    });

    metrics.dueFarriery.slice(0, 2).forEach(f => {
      const animal = safeAnimals.find(a => a.id === f.animalId);
      const dueStr = f.nextShoeingDate || f.nextDueDate;
      items.push({
        id: `far-${f.id}`,
        severity: 'medium',
        title: `Troca de Ferradura — ${animal?.name || 'Animal'}`,
        detail: dueStr
          ? `Prevista para ${new Date(dueStr).toLocaleDateString('pt-BR')} · ${f.farrierName}`
          : `Ferrador: ${f.farrierName}`,
        tab: 'farriery',
        animalId: f.animalId,
      });
    });

    metrics.pregnantMares.slice(0, 2).forEach(m => {
      items.push({
        id: `preg-${m.id}`,
        severity: 'info',
        title: `Gestação em Acompanhamento — ${m.name}`,
        detail: `${m.breed} · Escore Henneke ${m.bodyScore}/9 · Monitoramento nutricional`,
        tab: 'reproduction',
        animalId: m.id,
      });
    });

    return items;
  }, [metrics.pendingHealth, metrics.dueFarriery, metrics.pregnantMares, safeAnimals]);

  const kpis = [
    {
      label: 'Total na Tropa',
      value: String(metrics.total),
      sub: `${metrics.stallions} garanhões · ${metrics.mares} éguas`,
      tab: 'registry',
      icon: EquinoIcon,
    },
    {
      label: 'Atletas / Treino',
      value: String(metrics.athletes),
      sub: `${safeTraining.length} treinos registrados`,
      tab: 'training',
      icon: Award,
    },
    {
      label: 'Éguas Gestantes',
      value: String(metrics.pregnantMares.length),
      sub: 'Acompanhamento reprodutivo',
      tab: 'reproduction',
      icon: Heart,
    },
    {
      label: 'Escore Henneke',
      value: metrics.total > 0 ? `${metrics.avgBodyScore.toFixed(1)}/9` : '—',
      sub: 'Média corporal do plantel',
      tab: 'biometrics',
      icon: Scale,
    },
    {
      label: 'Premiações',
      value: `R$ ${metrics.totalPrizes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      sub: `${safeCompetitions.length} provas registradas`,
      tab: 'training',
      icon: Trophy,
    },
    {
      label: 'Custo Acumulado',
      value: `R$ ${metrics.totalExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      sub: `${safeExpenses.length} lançamentos`,
      tab: 'financial',
      icon: DollarSign,
    },
  ];

  const quickActions = [
    { label: 'Gêmeo Digital 360°', tab: 'digital_twin', icon: Sparkles },
    { label: 'Genealogia & Pedigree', tab: 'genealogy', icon: Dna },
    { label: 'Nutrição NRC', tab: 'nutrition', icon: Wheat },
    { label: 'Sanidade & MAPA', tab: 'health', icon: Syringe },
    { label: 'Podologia & Cascos', tab: 'farriery', icon: Hammer },
    { label: 'Guia de Enfermidades', tab: 'diseases_bank', icon: BookOpen },
  ];

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            Equinocultura & Gestão de Haras
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Visão consolidada do plantel, sanidade, podologia, reprodução e desempenho esportivo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('digital_twin')}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Gêmeo 360°</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('registry')}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Cavalo</span>
          </button>
        </div>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          {kpis.map(kpi => {
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.label}
                type="button"
                onClick={() => onNavigateTab(kpi.tab)}
                className="p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 text-slate-500 dark:text-zinc-400">
                  <span className="text-[11px] font-medium truncate">{kpi.label}</span>
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-75" />
                </div>
                <div className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums truncate">
                  {kpi.value}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {kpi.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Featured Herd */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Animais do Plantel
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Acesso direto ao prontuário 360° e passaporte digital
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('registry')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver todos ({metrics.total})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {safeAnimals.length === 0 ? (
            <div className="p-8 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 mx-auto flex items-center justify-center">
                <EquinoIcon className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                Nenhum equino cadastrado ainda
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Cadastre seu primeiro animal para habilitar biometria, nutrição NRC, prontuário sanitário e passaporte digital.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('registry')}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Primeiro Cavalo</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {safeAnimals.slice(0, 5).map(animal => (
                <div
                  key={animal.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {animal.photoUrl ? (
                        <img
                          src={animal.photoUrl}
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <EquinoIcon className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {animal.name}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          {animal.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                        {animal.breed} · {animal.sex} · {animal.registrationNumber} · {animal.weightKg} kg · ECC {animal.bodyScore}/9
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('digital_twin', animal.id)}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>360°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPassport(animal)}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Passaporte</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Alerts, Breed Breakdown & Shortcuts */}
        <div className="space-y-5">
          {/* Operational Alerts */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Pendências & Alertas</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
                {operationalAlerts.length}
              </span>
            </div>

            {operationalAlerts.length === 0 ? (
              <div className="p-4 flex items-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Nenhuma pendência crítica de sanidade ou podologia nos próximos 15 dias.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                {operationalAlerts.map(alert => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => onNavigateTab(alert.tab, alert.animalId)}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-900 dark:text-zinc-100 truncate">
                        {alert.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        {alert.detail}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Breed Distribution */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Composição por Raça
            </h3>

            {Object.keys(metrics.breedCount).length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Cadastre animais para visualizar a distribuição racial do haras.
              </p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(metrics.breedCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([breed, count]) => {
                    const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                    return (
                      <div key={breed} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-zinc-300 truncate">
                            {breed}
                          </span>
                          <span className="text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Quick Module Links */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Acesso Rápido
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.tab}
                    type="button"
                    onClick={() => onNavigateTab(action.tab)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 truncate transition-colors cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
