import React from 'react';
import {
  AnimalProfile,
  DietFormulation,
  FeedIngredient,
  ForageProductionPlan,
  AnimalSpecies,
} from '../../types/animalNutrition';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  DollarSign,
  Layers,
  Scale,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
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
  onSelectDiet: (diet: DietFormulation) => void;
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
  // Filter by species if selected
  const filteredProfiles =
    selectedSpecies === 'todas'
      ? animalProfiles
      : animalProfiles.filter((p) => p.species === selectedSpecies);

  const filteredDiets =
    selectedSpecies === 'todas'
      ? formulations
      : formulations.filter((d) => d.species === selectedSpecies);

  // Global calculations
  const totalAnimalsCount = filteredProfiles.reduce((sum, p) => sum + (p.count || 0), 0);
  
  // Total daily feed consumption
  let totalDailyFeedMnTons = 0;
  let totalDailyCost = 0;
  let weightedIgenSum = 0;

  filteredDiets.forEach((d) => {
    const count = d.animalCount || 1;
    const mnKg = d.totalDmnKgPerAnimal || 0;
    const dailyCostPerAnimal = d.costs?.costPerAnimalDay || 0;

    totalDailyFeedMnTons += (mnKg * count) / 1000;
    totalDailyCost += dailyCostPerAnimal * count;
    weightedIgenSum += (d.igen?.score || 85) * count;
  });

  const averageIgen = totalAnimalsCount > 0 && filteredDiets.length > 0
    ? Math.round(weightedIgenSum / totalAnimalsCount)
    : 91;

  const avgCostPerKgMs = filteredDiets.length > 0
    ? (filteredDiets.reduce((acc, d) => acc + (d.costs?.costPerKgMs || 0), 0) / filteredDiets.length).toFixed(2)
    : '1.62';

  // Low stock ingredients
  const lowStockIngredients = ingredients.filter(
    (i) => i.stockKg <= i.minStockAlertKg
  );

  // Critical health alerts
  const healthAlerts: Array<{ dietName: string; alert: string }> = [];
  filteredDiets.forEach((d) => {
    if (d.metabolicHealth?.alerts && d.metabolicHealth.alerts.length > 0) {
      d.metabolicHealth.alerts.forEach((alt) => {
        healthAlerts.push({ dietName: d.name, alert: alt });
      });
    }
  });

  const speciesOptions: Array<{ id: AnimalSpecies | 'todas'; label: string; icon: string }> = [
    { id: 'todas', label: 'Todas Espécies', icon: '🌐' },
    { id: 'bovinos_leite', label: 'Bovinos Leite', icon: '🥛' },
    { id: 'bovinos_corte', label: 'Bovinos Corte', icon: '🐂' },
    { id: 'bezerros', label: 'Bezerros', icon: '🐮' },
    { id: 'bubalinos', label: 'Bubalinos', icon: '🐃' },
    { id: 'caprinos', label: 'Caprinos', icon: '🐐' },
    { id: 'ovinos', label: 'Ovinos', icon: '🐑' },
    { id: 'suinos', label: 'Suínos', icon: '🐖' },
    { id: 'aves_corte', label: 'Aves Corte', icon: '🍗' },
    { id: 'aves_postura', label: 'Aves Postura', icon: '🥚' },
    { id: 'equinos', label: 'Equinos', icon: '🐎' },
    { id: 'peixes', label: 'Piscicultura', icon: '🐟' },
  ];

  return (
    <div id="nutrition-dashboard-container" className="space-y-6">
      {/* Species Selector Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          {speciesOptions.map((sp) => (
            <button
              key={sp.id}
              onClick={() => onSelectSpecies(sp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedSpecies === sp.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{sp.icon}</span>
              <span>{sp.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onNavigateTab('formulation')}
          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Nova Formulação
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Diets Active */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Dietas & Formulações</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{filteredDiets.length}</span>
            <span className="text-xs text-emerald-400 font-medium">ativas no rebanho</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {filteredProfiles.length} lotes / categorias configuradas
          </p>
        </div>

        {/* Animals Feeded & Volume */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Animais em Trato Diário</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalAnimalsCount.toLocaleString('pt-BR')}</span>
            <span className="text-xs text-blue-400 font-medium">cabeças</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Consumo total: <strong className="text-slate-200">{totalDailyFeedMnTons.toFixed(1)} t/dia</strong> (MN)
          </p>
        </div>

        {/* Daily Feed Cost & Average /kg MS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Custo Alimentar Diário</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              R$ {totalDailyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Média: <strong className="text-amber-400">R$ {avgCostPerKgMs}/kg MS</strong>
          </p>
        </div>

        {/* IGEN Score (Índice GeaAgro de Eficiência Nutricional) */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/90 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Índice IGEN Global</span>
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-300">{averageIgen}</span>
            <span className="text-xs font-bold text-emerald-400">/ 100 (Nota A+)</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Alta conversão & estabilidade metabólica
          </p>
        </div>
      </div>

      {/* Live Alerts Row if any */}
      {(lowStockIngredients.length > 0 || healthAlerts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stock Alerts */}
          {lowStockIngredients.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4">
              <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Alertas de Estoque Crítico ({lowStockIngredients.length})</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {lowStockIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between bg-slate-900/60 border border-rose-900/40 rounded-lg p-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{ing.name}</span>
                      <span className="text-slate-400 block text-[11px]">
                        Estoque: {(ing.stockKg / 1000).toFixed(1)} t (Mínimo: {(ing.minStockAlertKg / 1000).toFixed(1)} t)
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigateTab('ingredients')}
                      className="px-2 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded text-[11px] font-medium"
                    >
                      Repor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Alerts */}
          {healthAlerts.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-2">
                <Zap className="w-4 h-4" />
                <span>Diagnósticos Metabólicos & Ruminais</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {healthAlerts.map((alt, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-amber-900/40 rounded-lg p-2 text-xs"
                  >
                    <span className="font-semibold text-amber-300 block">{alt.dietName}:</span>
                    <span className="text-slate-300 text-[11px]">{alt.alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Formulations List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Formulações Ativas e Desempenho Zootécnico
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rações, TMR e suplementos balanceados em tempo real com indicador de custo e IGEN
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('formulation')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            Ver Todas & Formular &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDiets.map((diet) => (
            <div
              key={diet.id}
              onClick={() => onSelectDiet(diet)}
              className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {diet.species.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    IGEN {diet.igen?.score || 90} ({diet.igen?.grade || 'A'})
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mt-2.5">{diet.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lote: {diet.animalCount} animais &bull; Batelada: {diet.targetBatchKg} kg
                </p>

                {/* Key Nutrients Mini Grid */}
                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center">
                  <div className="bg-slate-900/70 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">PB</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {diet.calculatedBromatology?.crudeProteinPct?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-900/70 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">NDT</span>
                    <span className="text-xs font-bold text-blue-400">
                      {diet.calculatedBromatology?.tdnPct?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-900/70 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">FDN</span>
                    <span className="text-xs font-bold text-amber-400">
                      {diet.calculatedBromatology?.ndfPct?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-900/70 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Custo/Dia</span>
                    <span className="text-xs font-bold text-white">
                      R$ {diet.costs?.costPerAnimalDay?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Economic Highlights */}
              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                {diet.costs?.costPerLiterMilk !== undefined && (
                  <span className="text-slate-300">
                    Custo Leite: <strong className="text-emerald-400">R$ {diet.costs.costPerLiterMilk.toFixed(2)}/L</strong>
                  </span>
                )}
                {diet.costs?.costPerKgGain !== undefined && (
                  <span className="text-slate-300">
                    Custo Ganho: <strong className="text-emerald-400">R$ {diet.costs.costPerKgGain.toFixed(2)}/kg</strong>
                  </span>
                )}
                {diet.costs?.incomeOverFeedCostDaily !== undefined && (
                  <span className="text-emerald-400 font-semibold">
                    IOFC: +R$ {diet.costs.incomeOverFeedCostDaily.toFixed(2)}/cab/d
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forage Autonomy & Planning Summary */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-400" />
              Estoque de Forragens & Autonomia Alimentar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Planejamento de volumosos da fazenda: silagens, fenos e cana com cálculo de meses de segurança
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('forage')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Gerenciar Forragens &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {foragePlans.map((fp) => (
            <div
              key={fp.id}
              className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{fp.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fp.stockStatus === 'confortavel'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : fp.stockStatus === 'atencao'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {fp.monthsOfAutonomy.toFixed(1)} meses
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Estoque Atual:</span>
                    <strong className="text-slate-200">{fp.currentStockTon} t</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Consumo Mensal:</span>
                    <strong className="text-slate-200">{fp.monthlyConsumptionTon} t/mês</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo Estimado:</span>
                    <strong className="text-emerald-400">R$ {fp.costPerTon}/t</strong>
                  </div>
                </div>
              </div>

              {/* Autonomy Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fp.monthsOfAutonomy >= 4
                        ? 'bg-emerald-400'
                        : fp.monthsOfAutonomy >= 2
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (fp.monthsOfAutonomy / 6) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
