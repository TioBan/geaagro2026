import React, { useState } from 'react';
import {
  PropertyCropSeason,
  ImplementationCostItem,
  InputItem,
  MachineEquipment,
  AgriculturalOperationCost,
  CommercializationRecord,
  FinancialDiaryEntry,
  EconomicKPIs,
} from '../../types/costs';
import {
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Tractor,
  Wheat,
  Droplets,
  CloudSun,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  BarChart2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface EconomicTwin360ViewProps {
  season: PropertyCropSeason;
  seasons: PropertyCropSeason[];
  onSelectSeason: (season: PropertyCropSeason) => void;
  kpis: EconomicKPIs;
  operations: AgriculturalOperationCost[];
  inputs: InputItem[];
  machines: MachineEquipment[];
  sales: CommercializationRecord[];
  diary: FinancialDiaryEntry[];
}

export const EconomicTwin360View: React.FC<EconomicTwin360ViewProps> = ({
  season,
  seasons,
  onSelectSeason,
  kpis,
  operations,
  inputs,
  machines,
  sales,
  diary,
}) => {
  const [selectedPlot, setSelectedPlot] = useState<string>('all');

  // Filter operations for active season
  const seasonOps = (operations || []).filter(o => o.seasonId === season.id);
  const totalFuelLiters = seasonOps.reduce((acc, o) => acc + (o.fuelLiters || 0), 0);
  const totalMachineHours = seasonOps.reduce((acc, o) => acc + (o.hoursWorked || 0), 0);
  
  // Total Inputs Investment used
  const totalInputsCost = seasonOps.reduce((acc, o) => {
    return acc + (o.inputsUsed || []).reduce((sum, inp) => sum + (inp.totalCost || 0), 0);
  }, 0);

  // Weather and Diary recent events
  const recentEvents = (diary || []).filter(d => d.seasonId === season.id);

  // Profitability status
  const netProfit = kpis.netMarginTotal;
  const isProfitable = netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Header Banner - Gêmeo Econômico 360° */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-850 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Gêmeo Econômico da Safra 360°
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {season.seasonName}
              {season.crop ? ` — ${season.crop}` : ''}
              {season.cultivar ? ` (${season.cultivar})` : ''}
            </h2>
            <p className="text-emerald-100/80 text-sm max-w-2xl">
              Painel unificado conectando Área Cultivada, Calendário Operacional, Custos Acumulados, Consumo de Insumos, Horas de Máquina, Eventos Climáticos e Retorno Financeiro de cada decisão de manejo.
            </p>
          </div>

          {/* Season Selector */}
          <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10 self-stretch sm:self-auto">
            <Calendar className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
            <select
              value={season.id}
              onChange={(e) => {
                const s = seasons.find(item => item.id === e.target.value);
                if (s) onSelectSeason(s);
              }}
              className="bg-transparent text-white font-semibold text-sm outline-none cursor-pointer pr-4"
            >
              {(seasons && seasons.length > 0) ? (
                seasons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.seasonName} {s.crop ? `(${s.crop} - ${s.plantedAreaHa} ha)` : ''}
                  </option>
                ))
              ) : (
                <option value="empty" className="bg-slate-900 text-white">
                  Nenhuma safra cadastrada
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Área Cultivada</div>
            <div className="text-xl font-bold mt-1 text-white">{season.plantedAreaHa} ha</div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">{season.productionSystem}</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Investimento Acumulado</div>
            <div className="text-xl font-bold mt-1 text-white">R$ {(kpis.totalSeasonCost / 1000).toFixed(1)}k</div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">R$ {kpis.costPerHa}/ha</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Custo por Saca</div>
            <div className="text-xl font-bold mt-1 text-white">R$ {kpis.costPerBag.toFixed(2)}</div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">Base R$ {kpis.breakEvenPricePerBag.toFixed(2)} CTP</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Produtividade Est./Real</div>
            <div className="text-xl font-bold mt-1 text-white">
              {(kpis.totalBagsHarvested / season.plantedAreaHa).toFixed(1)} sc/ha
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">Meta: {season.targetYieldBagsHa} sc/ha</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Ponto de Equilíbrio</div>
            <div className="text-xl font-bold mt-1 text-amber-300">{kpis.breakEvenYieldBagsHa.toFixed(1)} sc/ha</div>
            <div className="text-[10px] text-amber-200/70 mt-0.5">Necessário p/ cobrir custos</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-xs text-emerald-200 font-medium">Margem Líquida</div>
            <div className={`text-xl font-bold mt-1 ${isProfitable ? 'text-emerald-300' : 'text-rose-300'}`}>
              {kpis.netMarginPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">ROI: {kpis.roiPct}%</div>
          </div>
        </div>
      </div>

      {/* Grid Central do Gêmeo Econômico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card 1: Calendário de Operações & Rastreamento Econômico */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg">
                <Tractor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-base">Operações & Maquinário</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Custos operacionais e consumo de combustível</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-full">
              {seasonOps.length} registros
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Horas de Máquina</span>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">{totalMachineHours}h</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Combustível Usado</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalFuelLiters} L</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Últimas Atividades Registradas</div>
            {seasonOps.slice(0, 3).map((op) => (
              <div key={op.id} className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200">
                  <span>{op.operationType} — {op.plotName}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">R$ {op.totalOperationCost.toLocaleString('pt-BR')}</span>
                </div>
                <div className="text-slate-500 dark:text-zinc-400 flex justify-between">
                  <span>{op.machineName || 'Equipamento'} ({op.hoursWorked}h)</span>
                  <span>{new Date(op.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Balanço de Insumos e Utilização */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 rounded-lg">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-base">Insumos & Almoxarifado</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Aplicação de Sementes, Fertilizantes e Defensivos</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
              R$ {(totalInputsCost / 1000).toFixed(1)}k aplicados
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(inputs || []).slice(0, 4).map((inp) => {
              const pctUsed = Math.min(100, Math.round(((inp.quantityPurchased - inp.currentStock) / (inp.quantityPurchased || 1)) * 100));
              return (
                <div key={inp.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-zinc-300">
                    <span className="truncate max-w-[180px]">{inp.name}</span>
                    <span>{pctUsed}% consumido ({inp.currentStock} {inp.unit} em estoque)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pctUsed > 80 ? 'bg-emerald-500' : pctUsed > 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${pctUsed}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <span>Rastreabilidade em tempo real ativa</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Card 3: Eventos Climáticos & Decisões de Manejo */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 rounded-lg">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-base">Diário & Impactos Climáticos</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Ocorrências agronômicas e reflexo financeiro</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full">
              {recentEvents.length} eventos
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {recentEvents.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 italic py-4 text-center">
                Nenhum evento registrado nesta safra ainda.
              </p>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200">
                    <span className="flex items-center gap-1.5">
                      {evt.weatherEvent && evt.weatherEvent !== 'Sem Eventos' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      {evt.title}
                    </span>
                    <span className="text-slate-500">{new Date(evt.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 line-clamp-2">{evt.notes}</p>
                  {evt.costImpact ? (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium pt-1">
                      Impacto estimado: R$ {evt.costImpact.toLocaleString('pt-BR')}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Retorno Comercial e DRE Agrícola Resumido */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
        <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-lg mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Resultado Comercial & Balanço Final da Safra
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900 space-y-1">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider block">Receita Bruta Total</span>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
              R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block">R$ {kpis.grossRevenuePerHa.toLocaleString('pt-BR')} / ha</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Custo Operacional (COE)</span>
            <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              R$ {kpis.totalSeasonCost.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">R$ {kpis.costPerHa.toLocaleString('pt-BR')} / ha</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Lucro Bruto Estimado</span>
            <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              R$ {kpis.grossMarginTotal.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Margem Bruta: {kpis.grossMarginPct}%</span>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${isProfitable ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'}`}>
            <span className="text-xs font-semibold uppercase tracking-wider block">Lucro Líquido Realizado</span>
            <div className="text-2xl font-black">
              R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs font-medium block">
              ROI: {kpis.roiPct}% sobre CTP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
