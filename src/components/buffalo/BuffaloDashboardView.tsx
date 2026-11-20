import React from 'react';
import {
  BuffaloAnimal,
  BuffaloPaddock,
  BuffaloWaterPoint,
  BuffaloThermalWelfareIndex,
  BuffaloIEBCalculation
} from '../../types/buffalo';
import { calculateIEB, calculateMozzarellaYieldLitersPerKg } from '../../data/buffaloData';
import {
  ArrowUpRight,
  Thermometer,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface BuffaloDashboardViewProps {
  animals: BuffaloAnimal[];
  paddocks: BuffaloPaddock[];
  waterPoints: BuffaloWaterPoint[];
  thermalWelfare: BuffaloThermalWelfareIndex;
  onNavigateTab: (tab: string) => void;
  onSelectAnimalForTwin?: (animalId: string) => void;
}

export const BuffaloDashboardView: React.FC<BuffaloDashboardViewProps> = ({
  animals,
  paddocks,
  waterPoints,
  thermalWelfare,
  onNavigateTab,
  onSelectAnimalForTwin
}) => {
  const ieb: BuffaloIEBCalculation = calculateIEB(animals, paddocks, thermalWelfare);

  const totalAnimals = animals.length;
  const females = animals.filter(a => a.sex === 'Fêmea');
  const males = animals.filter(a => a.sex === 'Macho');

  const lactatingCows = animals.filter(a => a.status === 'Em Lactação');
  const dryCows = animals.filter(a => a.category === 'Matriz Seca' || a.category === 'Matriz Gestante Seca');
  const bulls = animals.filter(a => a.category === 'Reprodutor (Touro)');
  const calves = animals.filter(a => a.category === 'Bezerra (0-6m)' || a.category === 'Bezerro (0-6m)');
  const heifers = animals.filter(a => a.category === 'Novilha em Recria (7-24m)');
  const beefFattening = animals.filter(a => a.category === 'Garrote em Engorda' || a.category === 'Búfalo em Terminação');

  const totalDailyMilk = lactatingCows.reduce((acc, a) => acc + (a.averageDailyMilkLiters || 0), 0);
  const avgMilkPerCow = lactatingCows.length > 0 ? totalDailyMilk / lactatingCows.length : 0;
  const avgFat = lactatingCows.length > 0
    ? lactatingCows.reduce((acc, a) => acc + (a.averageFatPct || 0), 0) / lactatingCows.length
    : 0;
  const avgProtein = lactatingCows.length > 0
    ? lactatingCows.reduce((acc, a) => acc + (a.averageProteinPct || 0), 0) / lactatingCows.length
    : 0;
  const mozzarellaLitersPerKg = avgFat > 0 && avgProtein > 0
    ? calculateMozzarellaYieldLitersPerKg(avgFat, avgProtein)
    : 0;
  const dailyMozzarellaKg = mozzarellaLitersPerKg > 0 ? totalDailyMilk / mozzarellaLitersPerKg : 0;

  const avgWeight = totalAnimals > 0
    ? Math.round(animals.reduce((acc, a) => acc + (a.currentWeightKg || 0), 0) / totalAnimals)
    : 0;

  const allWeighingGmds = animals
    .flatMap(a => a.weighings || [])
    .map(w => w.dailyGainKg)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const avgGMD = allWeighingGmds.length > 0
    ? Number((allWeighingGmds.reduce((acc, v) => acc + v, 0) / allWeighingGmds.length).toFixed(2))
    : 0;

  const pregnantCount = animals.filter(
    a =>
      a.status === 'Gestante' ||
      (a.reproductionRecords &&
        a.reproductionRecords.length > 0 &&
        a.reproductionRecords[a.reproductionRecords.length - 1]?.dgResult === 'Positivo (Gestante)')
  ).length;
  const pregnancyRate = females.length > 0 ? Math.round((pregnantCount / females.length) * 100) : 0;
  const animalsWithIEP = females.filter(a => a.calvingIntervalDays && a.calvingIntervalDays > 0);
  const calvingIntervalAvg = animalsWithIEP.length > 0
    ? Math.round(animalsWithIEP.reduce((acc, a) => acc + (a.calvingIntervalDays || 0), 0) / animalsWithIEP.length)
    : 0;

  const activeTreatments = animals.filter(
    a => a.status === 'Tratamento Sanitário' || a.status === 'Quarentena'
  ).length;

  const iebPillars = [
    { label: 'Reprodução', score: ieb.reproductiveEfficiencyScore, color: 'bg-teal-600' },
    { label: 'Produção', score: ieb.productiveEfficiencyScore, color: 'bg-emerald-600' },
    { label: 'Sanidade', score: ieb.healthBiosecurityScore, color: 'bg-sky-600' },
    { label: 'Conforto Térmico', score: ieb.thermalWelfareScore, color: 'bg-amber-500' },
    { label: 'Pastagens', score: ieb.foragePastureManagementScore, color: 'bg-lime-600' },
    { label: 'Custos / IOFC', score: ieb.economicCostScore, color: 'bg-indigo-600' }
  ];

  const categories = [
    { label: 'Matrizes em Lactação', count: lactatingCows.length, note: totalDailyMilk > 0 ? `${totalDailyMilk.toFixed(0)} L/dia` : 'Sem controle' },
    { label: 'Matrizes Secas / Gestantes', count: dryCows.length, note: 'Período seco e pré-parto' },
    { label: 'Reprodutores (Touros)', count: bulls.length, note: 'Plantel reprodutivo' },
    { label: 'Bezerros (0-6m)', count: calves.length, note: 'Fase neonatal' },
    { label: 'Novilhas (7-24m)', count: heifers.length, note: 'Recria e reposição' },
    { label: 'Engorda e Terminação', count: beefFattening.length, note: 'Lotes de corte' }
  ];

  const thermalTone =
    thermalWelfare.thiCalculated > 84
      ? 'text-rose-600 dark:text-rose-400'
      : thermalWelfare.thiCalculated > 78
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400';

  const quickShortcuts = [
    { id: 'registry', label: 'Cadastro Individual', desc: `${totalAnimals} registrados` },
    { id: 'dairy', label: 'Leite & Mozzarella', desc: `${dailyMozzarellaKg.toFixed(1)} kg/dia` },
    { id: 'welfare_water', label: 'Bem-Estar & Água', desc: `${waterPoints.length} pontos hídricos` },
    { id: 'reproduction', label: 'Reprodução & IATF', desc: `${pregnancyRate}% prenhez` },
    { id: 'pastures', label: 'Pastagens & Piquetes', desc: `${paddocks.length} piquetes` },
    { id: 'diseases_lib', label: 'Atlas de Doenças', desc: '13 fichas clínicas' }
  ];

  return (
    <div className="space-y-4">
      {/* Faixa unificada de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Rebanho Total</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">{totalAnimals}</div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {females.length} F · {males.length} M
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Leite Diário</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalDailyMilk.toFixed(1)} <span className="text-xs font-normal text-slate-500">L</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              Média {avgMilkPerCow.toFixed(1)} L/vaca
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Mozzarella Est.</span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
              {dailyMozzarellaKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg/dia</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {avgFat > 0 ? `${avgFat.toFixed(1)}% gord.` : 'Sem leite ativo'}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Peso Médio / GMD</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {avgWeight} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {avgGMD > 0 ? `GMD ${avgGMD} kg/dia` : 'Sem pesagens'}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Taxa de Prenhez</span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {pregnancyRate}%
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {calvingIntervalAvg > 0 ? `IEP ${calvingIntervalAvg} dias` : `${pregnantCount} gestantes`}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Sanidade / Carência</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {activeTreatments}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {activeTreatments === 0 ? 'Rebanho regular' : 'Em manejo sanitário'}
            </span>
          </div>
        </div>
      </section>

      {/* Linha Principal: IEB + Conforto Térmico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Índice de Eficiência da Bubalinocultura (IEB) */}
        <section className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Índice de Eficiência da Bubalinocultura (IEB)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Avaliação ponderada de reprodução, produção leite/carne, sanidade, conforto térmico e pastagens
              </p>
            </div>
            <div className="flex items-baseline gap-2 shrink-0 tabular-nums">
              <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{ieb.overallScore}</span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">/100</span>
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">· {ieb.classification}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
            {iebPillars.map(pillar => (
              <div key={pillar.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-zinc-400">{pillar.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{pillar.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pillar.color}`}
                    style={{ width: `${Math.min(100, Math.max(0, pillar.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conforto Térmico & Água */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Conforto Térmico &amp; Água</h2>
              </div>
              <span className={`text-xs font-semibold tabular-nums ${thermalTone}`}>
                ITU {thermalWelfare.thiCalculated}
              </span>
            </div>

            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Condição atual</dt>
                <dd className={`font-medium text-right ${thermalTone}`}>{thermalWelfare.stressLevel}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Ambiente</dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                  {thermalWelfare.ambientTemperatureC}°C · {thermalWelfare.relativeHumidityPct}% UR
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Banho de imersão</dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                  {thermalWelfare.waterBathAvailabilityHours} h/dia · {waterPoints.length} pontos
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Sombra disponível</dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                  {thermalWelfare.shadeAvailabilityM2PerHead} m²/cabeça
                </dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('welfare_water')}
            className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Gerenciar Conforto Hídrico</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>

      {/* Linha Secundária: Composição + Animais Destaque + Plano de Ação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Composição do Plantel</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Distribuição por categoria zootécnica</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('registry')}
              className="h-7 px-2.5 rounded-md text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Cadastro completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.map(cat => (
              <div
                key={cat.label}
                className="p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40"
              >
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">{cat.label}</span>
                <div className="text-lg font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">{cat.count}</div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-500 block truncate">{cat.note}</span>
              </div>
            ))}
          </div>

          {/* Acesso Rápido ao Gêmeo Digital */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Acesso Rápido ao Gêmeo Digital 360°
              </h3>
              {animals.length === 0 && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('registry')}
                  className="h-7 px-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Búfalo</span>
                </button>
              )}
            </div>

            {animals.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-5 text-center rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                Nenhum búfalo cadastrado. Registre o plantel inicial para habilitar o acompanhamento individual e o cálculo completo do IEB.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                {animals.slice(0, 4).map(animal => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => {
                      if (onSelectAnimalForTwin) onSelectAnimalForTwin(animal.id);
                      else onNavigateTab('digital_twin');
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                          {animal.identificationNumber}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300 truncate">{animal.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        {animal.breed} · {animal.category} · {animal.status}
                      </p>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 block">
                        {animal.status === 'Em Lactação' && animal.averageDailyMilkLiters
                          ? `${animal.averageDailyMilkLiters} L/dia`
                          : `${animal.currentWeightKg} kg`}
                      </span>
                      <span className="text-[11px] text-slate-400">Abrir 360°</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Plano de Ação & Atalhos */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Plano de Ação IEB</span>
              </h2>
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
                {ieb.overallScore}/100
              </span>
            </div>

            <ol className="space-y-2">
              {ieb.actionPlan.map((action, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed flex items-start gap-2"
                >
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 tabular-nums shrink-0 mt-0.5">
                    0{idx + 1}.
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Acesso Rápido</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickShortcuts.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigateTab(item.id)}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-teal-500/60 dark:hover:border-teal-500/60 text-left transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-slate-900 dark:text-white block truncate">{item.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate tabular-nums">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
