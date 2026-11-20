import React, { useMemo } from 'react';
import {
  AnimalProfile,
  DietFormulation,
  FeedIngredient,
  ForageProductionPlan,
  AnimalSpecies,
} from '../../types/animalNutrition';
import { getSpeciesLabel, SPECIES_OPTIONS } from './nutritionConstants';
import {
  AlertTriangle,
  ArrowRight,
  Plus,
  Wheat,
  Zap,
} from 'lucide-react';

interface Props {
  animalProfiles: AnimalProfile[];
  formulations: DietFormulation[];
  ingredients: FeedIngredient[];
  foragePlans: ForageProductionPlan[];
  selectedSpecies: AnimalSpecies | 'todas';
  onSelectSpecies: (sp: AnimalSpecies | 'todas') => void;
  onNavigateTab: (tab: string) => void;
  onSelectDiet: (dietId: string) => void;
}

export const NutritionDashboard: React.FC<Props> = ({
  animalProfiles,
  formulations,
  ingredients,
  foragePlans,
  selectedSpecies,
  onSelectSpecies,
  onNavigateTab,
  onSelectDiet,
}) => {
  const filteredProfiles = useMemo(
    () =>
      selectedSpecies === 'todas'
        ? animalProfiles
        : animalProfiles.filter((p) => p.species === selectedSpecies),
    [animalProfiles, selectedSpecies]
  );

  const filteredDiets = useMemo(
    () =>
      selectedSpecies === 'todas'
        ? formulations
        : formulations.filter((d) => d.species === selectedSpecies),
    [formulations, selectedSpecies]
  );

  const metrics = useMemo(() => {
    const profileAnimals = filteredProfiles.reduce((sum, p) => sum + (p.count || 0), 0);
    let dietAnimals = 0;
    let totalDailyFeedMnTons = 0;
    let totalDailyCost = 0;
    let weightedIgenSum = 0;

    filteredDiets.forEach((d) => {
      const count = d.animalCount || 1;
      const mnKg = d.totalDmnKgPerAnimal || 0;
      const dailyCostPerAnimal = d.costs?.costPerAnimalDay || 0;

      dietAnimals += count;
      totalDailyFeedMnTons += (mnKg * count) / 1000;
      totalDailyCost += dailyCostPerAnimal * count;
      weightedIgenSum += (d.igen?.score || 0) * count;
    });

    const totalAnimalsCount = profileAnimals > 0 ? profileAnimals : dietAnimals;
    const averageIgen =
      dietAnimals > 0 && filteredDiets.length > 0 ? Math.round(weightedIgenSum / dietAnimals) : null;

    const avgCostPerKgMs =
      filteredDiets.length > 0
        ? filteredDiets.reduce((acc, d) => acc + (d.costs?.costPerKgMs || 0), 0) / filteredDiets.length
        : null;

    return {
      totalAnimalsCount,
      totalDailyFeedMnTons,
      totalDailyCost,
      averageIgen,
      avgCostPerKgMs,
    };
  }, [filteredProfiles, filteredDiets]);

  const lowStockIngredients = useMemo(
    () => ingredients.filter((i) => i.stockKg <= i.minStockAlertKg),
    [ingredients]
  );

  const healthAlerts = useMemo(() => {
    const list: Array<{ dietName: string; alert: string }> = [];
    filteredDiets.forEach((d) => {
      if (d.metabolicHealth?.alerts?.length) {
        d.metabolicHealth.alerts.forEach((alt) => {
          list.push({ dietName: d.name, alert: alt });
        });
      }
    });
    return list;
  }, [filteredDiets]);

  return (
    <div id="nutrition-dashboard-container" className="space-y-5">
      {/* Species Filter Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
          <button
            type="button"
            onClick={() => onSelectSpecies('todas')}
            className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              selectedSpecies === 'todas'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas Espécies
          </button>
          {SPECIES_OPTIONS.filter((s) => s.id !== 'reprodutores').map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => onSelectSpecies(sp.id)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedSpecies === sp.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sp.shortLabel}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('formulador')}
          className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Formulação
        </button>
      </div>

      {/* Unified 4-KPI Hairline Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Dietas Ativas</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {filteredDiets.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">formulações</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            {filteredProfiles.length} lotes configurados
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Animais em Trato</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.totalAnimalsCount.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">cabeças</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Consumo: <strong className="text-slate-700 dark:text-slate-200">{metrics.totalDailyFeedMnTons.toFixed(1)} t/dia</strong> (MN)
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Custo Alimentar Diário</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              R$ {metrics.totalDailyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Média:{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {metrics.avgCostPerKgMs !== null ? `R$ ${metrics.avgCostPerKgMs.toFixed(2)}/kg MS` : '—'}
            </strong>
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Índice IGEN Médio</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {metrics.averageIgen !== null ? metrics.averageIgen : '—'}
            </span>
            {metrics.averageIgen !== null && (
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">/ 100</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.averageIgen !== null
              ? 'Eficiência nutricional e conversão'
              : 'Crie uma dieta para calcular o IGEN'}
          </p>
        </div>
      </div>

      {/* Alerts Row (Only rendered when alerts exist) */}
      {(lowStockIngredients.length > 0 || healthAlerts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lowStockIngredients.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Estoque Crítico de Ingredientes ({lowStockIngredients.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('alimentos')}
                  className="text-xs font-medium text-rose-700 dark:text-rose-400 hover:underline whitespace-nowrap"
                >
                  Gerenciar estoque
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto">
                {lowStockIngredients.map((ing) => (
                  <div key={ing.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="font-medium text-slate-900 dark:text-slate-100 block truncate">{ing.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        Atual: {(ing.stockKg / 1000).toFixed(1)} t · Mínimo: {(ing.minStockAlertKg / 1000).toFixed(1)} t
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('alimentos')}
                      className="h-7 px-2.5 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md text-[11px] font-medium shrink-0 transition-colors"
                    >
                      Repor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {healthAlerts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-3">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span>Alertas Metabólicos & Ruminais ({healthAlerts.length})</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto">
                {healthAlerts.map((alt, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 text-xs">
                    <span className="font-medium text-slate-900 dark:text-slate-100 block">{alt.dietName}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">{alt.alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Formulations Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Formulações Ativas e Desempenho Zootécnico
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rações, TMR e suplementos balanceados com custo diário e índice IGEN
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('formulador')}
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            Abrir Formulador
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredDiets.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-8 px-4 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nenhuma formulação ativa para o filtro selecionado
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Monte uma dieta balanceada no Formulador Zootécnico utilizando os {ingredients.length} ingredientes do banco bromatológico.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('formulador')}
                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Primeira Dieta
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('animais')}
                className="h-8 px-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium rounded-md transition-colors"
              >
                Cadastrar Lotes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDiets.map((diet) => (
              <div
                key={diet.id}
                onClick={() => onSelectDiet(diet.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDiet(diet.id);
                  }
                }}
                className="border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 rounded-lg p-4 cursor-pointer transition-colors flex flex-col justify-between bg-slate-50/40 dark:bg-slate-800/30"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {getSpeciesLabel(diet.species)} · {diet.animalCount} cab · Batelada {diet.targetBatchKg.toLocaleString('pt-BR')} kg
                    </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0">
                      IGEN {diet.igen?.score ?? 0} ({diet.igen?.grade ?? '—'})
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                    {diet.name}
                  </h4>

                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">PB</span>
                      <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                        {(diet.calculatedBromatology?.crudeProteinPct ?? 0).toFixed(1)}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">NDT</span>
                      <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                        {(diet.calculatedBromatology?.tdnPct ?? 0).toFixed(1)}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">FDN</span>
                      <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                        {(diet.calculatedBromatology?.ndfPct ?? 0).toFixed(1)}%
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Custo/Dia</span>
                      <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                        R$ {(diet.costs?.costPerAnimalDay ?? 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                  {diet.costs?.costPerLiterMilk !== undefined ? (
                    <span>
                      Custo Leite: <strong className="text-slate-900 dark:text-white">R$ {diet.costs.costPerLiterMilk.toFixed(2)}/L</strong>
                    </span>
                  ) : diet.costs?.costPerKgGain !== undefined ? (
                    <span>
                      Custo Ganho: <strong className="text-slate-900 dark:text-white">R$ {diet.costs.costPerKgGain.toFixed(2)}/kg</strong>
                    </span>
                  ) : (
                    <span>
                      Custo MS: <strong className="text-slate-900 dark:text-white">R$ {(diet.costs?.costPerKgMs ?? 0).toFixed(2)}/kg</strong>
                    </span>
                  )}

                  {diet.costs?.incomeOverFeedCostDaily !== undefined && (
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      IOFC: R$ {diet.costs.incomeOverFeedCostDaily.toFixed(2)}/cab/d
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forage Autonomy Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Estoque de Forragens & Autonomia Alimentar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Volumosos cadastrados com projeção de meses de segurança no silo e galpão
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('forragens')}
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            Gerenciar Forragens
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {foragePlans.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-6 px-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nenhum planejamento de forragem cadastrado. Registre silagens, fenos ou capineiras para acompanhar a autonomia alimentar.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('forragens')}
              className="mt-3 h-7 px-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Forragem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {foragePlans.map((fp) => {
              const statusColor =
                fp.stockStatus === 'confortavel'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : fp.stockStatus === 'atencao'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-rose-700 dark:text-rose-400';

              const barColor =
                fp.monthsOfAutonomy >= 4
                  ? 'bg-emerald-600 dark:bg-emerald-500'
                  : fp.monthsOfAutonomy >= 2
                  ? 'bg-amber-500'
                  : 'bg-rose-600';

              return (
                <div
                  key={fp.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-800/30"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                        {fp.name}
                      </span>
                      <span className={`text-[11px] font-semibold tabular-nums whitespace-nowrap ${statusColor}`}>
                        {fp.monthsOfAutonomy.toFixed(1)} m
                      </span>
                    </div>

                    <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 space-y-1 tabular-nums">
                      <div className="flex justify-between">
                        <span>Estoque</span>
                        <strong className="text-slate-800 dark:text-slate-200">{fp.currentStockTon} t</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Consumo</span>
                        <strong className="text-slate-800 dark:text-slate-200">{fp.monthlyConsumptionTon} t/mês</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Custo</span>
                        <strong className="text-emerald-700 dark:text-emerald-400">R$ {fp.costPerTon}/t</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.min(100, (fp.monthsOfAutonomy / 6) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
