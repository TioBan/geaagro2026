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
  Activity,
  Milk,
  Beef,
  Scale,
  HeartPulse,
  Thermometer,
  Droplets,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  Layers3,
  Sun,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle
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

  // Totais e Categorias
  const totalAnimals = animals.length;
  const females = animals.filter(a => a.sex === 'Fêmea');
  const males = animals.filter(a => a.sex === 'Macho');
  
  const lactatingCows = animals.filter(a => a.status === 'Em Lactação');
  const dryCows = animals.filter(a => a.category === 'Matriz Seca' || a.category === 'Matriz Gestante Seca');
  const bulls = animals.filter(a => a.category === 'Reprodutor (Touro)');
  const calves = animals.filter(a => a.category === 'Bezerra (0-6m)' || a.category === 'Bezerro (0-6m)');
  const heifers = animals.filter(a => a.category === 'Novilha em Recria (7-24m)');
  const beefFattening = animals.filter(a => a.category === 'Garrote em Engorda' || a.category === 'Búfalo em Terminação');

  // Métricas Leiteiras
  const totalDailyMilk = lactatingCows.reduce((acc, a) => acc + (a.averageDailyMilkLiters || 0), 0);
  const avgMilkPerCow = lactatingCows.length > 0 ? (totalDailyMilk / lactatingCows.length) : 0;
  const avgFat = lactatingCows.length > 0 ? lactatingCows.reduce((acc, a) => acc + (a.averageFatPct || 7.8), 0) / lactatingCows.length : 7.8;
  const avgProtein = lactatingCows.length > 0 ? lactatingCows.reduce((acc, a) => acc + (a.averageProteinPct || 4.4), 0) / lactatingCows.length : 4.4;
  const mozzarellaLitersPerKg = calculateMozzarellaYieldLitersPerKg(avgFat, avgProtein);
  const dailyMozzarellaKg = mozzarellaLitersPerKg > 0 ? totalDailyMilk / mozzarellaLitersPerKg : 0;

  // Métricas de Carne & Peso
  const avgWeight = totalAnimals > 0 ? Math.round(animals.reduce((acc, a) => acc + a.currentWeightKg, 0) / totalAnimals) : 0;
  const beefAnimals = animals.filter(a => a.purpose === 'Corte' || a.category.includes('Engorda') || a.category.includes('Terminação'));
  const avgBeefWeight = beefAnimals.length > 0 ? Math.round(beefAnimals.reduce((acc, a) => acc + a.currentWeightKg, 0) / beefAnimals.length) : 512;
  const avgGMD = 0.76; // kg/dia médio

  // Indicadores Reprodutivos
  const pregnantCount = (animals || []).filter(a => a && (a.status === 'Gestante' || (a.reproductionRecords && a.reproductionRecords.length > 0 && a.reproductionRecords[a.reproductionRecords.length - 1]?.dgResult === 'Positivo (Gestante)'))).length;
  const pregnancyRate = (females || []).length > 0 ? Math.round((pregnantCount / (females || []).length) * 100) : 0;
  const calvingIntervalAvg = 402; // dias

  // Sanidade
  const pendingVaccines = 0; // Rebanho imunizado
  const activeTreatments = animals.filter(a => a.status === 'Tratamento Sanitário' || a.status === 'Quarentena').length;

  return (
    <div className="space-y-6">
      {/* Banner Principal com IEB e Status de Bem-estar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card do Índice de Eficiência da Bubalinocultura (IEB) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 border border-teal-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full text-xs font-black uppercase tracking-wider">
                <Award className="w-4 h-4 text-teal-400" />
                <span>Índice Exclusivo GeaAgro</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Índice de Eficiência da Bubalinocultura (IEB)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Avaliação integrada de alta precisão ponderando <strong>Reprodução, Aptidão Queijeira / Leite, Ganho em Carne, Bem-Estar Térmico e Manejo Forrageiro</strong>.
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-teal-500/40 rounded-2xl min-w-[160px] text-center shadow-lg">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-300">Score Geral</span>
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 my-1">
                {ieb.overallScore}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-black">
                {ieb.classification}
              </span>
            </div>
          </div>

          {/* 6 Pilares do IEB */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Reprodução</span>
              <span className="text-lg font-black text-teal-300">{ieb.reproductiveEfficiencyScore}%</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Produção Leite/Carne</span>
              <span className="text-lg font-black text-emerald-300">{ieb.productiveEfficiencyScore}%</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanidade</span>
              <span className="text-lg font-black text-sky-300">{ieb.healthBiosecurityScore}%</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Bem-Estar Térmico</span>
              <span className="text-lg font-black text-amber-300">{ieb.thermalWelfareScore}%</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pastagens</span>
              <span className="text-lg font-black text-lime-300">{ieb.foragePastureManagementScore}%</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Custos / IOFC</span>
              <span className="text-lg font-black text-indigo-300">{ieb.economicCostScore}%</span>
            </div>
          </div>
        </div>

        {/* Card de Bem-Estar & Conforto Térmico (Diferencial Bubalino) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Conforto Térmico &amp; Água
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Biometeorologia Bubalina</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-lg">
                ITU: {thermalWelfare.thiCalculated}
              </span>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400">Estado Térmico:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{thermalWelfare.stressLevel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400">Temperatura Ambiente:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{thermalWelfare.ambientTemperatureC}°C ({thermalWelfare.relativeHumidityPct}% UR)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400">Disponibilidade Banho:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{thermalWelfare.waterBathAvailabilityHours}h / dia (Açude 01)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400">Sombra por Cabeça:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{thermalWelfare.shadeAvailabilityM2PerHead} m² / cabeça</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('welfare_water')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ver Gestão de Água &amp; Conforto</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid de 4 Grandes Indicadores Zootécnicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total do Rebanho & Composição */}
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total de Búfalos</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{totalAnimals}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {females.length} fêmeas ({lactatingCows.length} em lactação) • {males.length} machos
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span>Matrizes: <strong>{lactatingCows.length + dryCows.length}</strong></span>
            <span>Bezerros: <strong>{calves.length}</strong></span>
          </div>
        </div>

        {/* Produção Leiteira & Queijo Mozzarella */}
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Leite &amp; Mozzarella</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Milk className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {totalDailyMilk.toFixed(1)} <span className="text-base font-bold text-slate-500">L/dia</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Média {avgMilkPerCow.toFixed(1)} L/vaca • {avgFat.toFixed(1)}% Gordura
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-zinc-400">Rendimento Mozzarella:</span>
            <span className="font-black text-blue-600 dark:text-blue-400">{dailyMozzarellaKg.toFixed(1)} kg/dia</span>
          </div>
        </div>

        {/* Produção de Carne & GMD */}
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Corte &amp; Desempenho</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <Beef className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {avgGMD} <span className="text-base font-bold text-slate-500">kg/dia GMD</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Peso médio do rebanho: <strong>{avgWeight} kg</strong>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span>Rendimento Carcaça:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">51.5%</span>
          </div>
        </div>

        {/* Reprodução & Fertilidade */}
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Taxa de Prenhez</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {pregnancyRate}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              IEP Médio: <strong>{calvingIntervalAvg} dias</strong> (13.4 meses)
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span>Mortalidade Bezerros:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 1.5% (Ótimo)</span>
          </div>
        </div>
      </div>

      {/* Estrutura do Rebanho por Categorias & Destaques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Categorias */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers3 className="w-5 h-5 text-teal-600" />
                <span>Estatísticas &amp; Estrutura do Rebanho</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Composição zootécnica atualizada da fazenda</p>
            </div>
            <button
              onClick={() => onNavigateTab('registry')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Todos os Animais</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 text-xs block">Matrizes em Lactação</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{lactatingCows.length}</div>
              <span className="text-[10px] text-teal-600 font-semibold">{totalDailyMilk.toFixed(0)} L/dia coletados</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 text-xs block">Matrizes Secas / Gestantes</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{dryCows.length}</div>
              <span className="text-[10px] text-slate-500">Período seco e pré-parto</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 text-xs block">Reprodutores (Touros)</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{bulls.length}</div>
              <span className="text-[10px] text-slate-500">Andrológico aprovado</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 text-xs block">Bezerras e Bezerros (0-6m)</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{calves.length}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">100% colostrados</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 text-xs block">Novilhas em Recria (7-24m)</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{heifers.length}</div>
              <span className="text-[10px] text-slate-500">Média 345 kg</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 text-xs block">Engorda &amp; Terminação</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{beefFattening.length}</div>
              <span className="text-[10px] text-slate-500">Previsão abate 530 kg</span>
            </div>
          </div>

          {/* Destaque de Animais com Gêmeo Digital */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Animais Destaque (Acesso Rápido ao Gêmeo Digital)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {animals.slice(0, 2).map((animal) => (
                <div
                  key={animal.id}
                  onClick={() => {
                    if (onSelectAnimalForTwin) onSelectAnimalForTwin(animal.id);
                    onNavigateTab('digital_twin');
                  }}
                  className="p-3 bg-slate-50 dark:bg-zinc-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-zinc-700 hover:border-teal-400 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{animal.identificationNumber}</span>
                      <span className="px-1.5 py-0.2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded">
                        {animal.breed}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{animal.name}</p>
                    <span className="text-[11px] text-slate-500">{animal.category} • {animal.currentWeightKg} kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 block">
                      {animal.status === 'Em Lactação' ? `${animal.averageDailyMilkLiters} L/dia` : `${animal.currentWeightKg} kg`}
                    </span>
                    <span className="text-[10px] text-slate-400">Ver Gêmeo →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel de Recomendações do IEB & Alertas */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Plano de Ação Sugerido</span>
            </h3>
            <span className="text-[11px] font-bold text-teal-600">IEB {ieb.overallScore}/100</span>
          </div>

          <div className="space-y-2.5">
            {ieb.actionPlan.map((action, idx) => (
              <div key={idx} className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/50 rounded-xl text-xs text-teal-950 dark:text-teal-200 font-medium flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{action}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">Diferenciais da Espécie:</span>
            <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>Leite com <strong>8.0% gordura média</strong> (Rendimento de ~4.6L por kg de Mozzarella).</li>
              <li>Excelente digestão de fibra em forragens de áreas úmidas (Capim Angola e Humidicola).</li>
              <li>Menor emissão relativa e alta longevidade produtiva (&gt; 10 lactações).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
