import React from 'react';
import {
  PropertyCropSeason,
  InputItem,
  MachineEquipment,
  AgriculturalOperationCost,
  FinancialDiaryEntry,
  EconomicKPIs,
} from '../../types/costs';
import { formatCostDate } from '../../utils/costStorage';
import { AlertTriangle, ArrowRight, CloudSun, DollarSign, Tractor, Wheat } from 'lucide-react';
import type { CostTabType } from './CostManagementModule';

interface EconomicTwin360ViewProps {
  season: PropertyCropSeason;
  kpis: EconomicKPIs;
  operations: AgriculturalOperationCost[];
  inputs: InputItem[];
  machines: MachineEquipment[];
  diary: FinancialDiaryEntry[];
  onNavigateTab?: (tab: CostTabType) => void;
}

export const EconomicTwin360View: React.FC<EconomicTwin360ViewProps> = ({
  season,
  kpis,
  operations,
  inputs,
  machines,
  diary,
  onNavigateTab,
}) => {
  const seasonOps = (operations || []).filter((o) => o.seasonId === season.id);
  const totalFuelLiters = seasonOps.reduce((acc, o) => acc + (o.fuelLiters || 0), 0);
  const totalMachineHours = seasonOps.reduce((acc, o) => acc + (o.hoursWorked || 0), 0);
  const totalInputsCost = seasonOps.reduce(
    (acc, o) => acc + (o.inputsUsed || []).reduce((sum, inp) => sum + (inp.totalCost || 0), 0),
    0
  );
  const recentEvents = (diary || []).filter((d) => d.seasonId === season.id);

  const isProfitable = kpis.netMarginTotal >= 0;
  const estYieldScHa =
    season.plantedAreaHa > 0 ? (kpis.totalBagsHarvested / season.plantedAreaHa).toFixed(1) : '0.0';

  return (
    <div className="space-y-5">
      {/* Unified 6-Metric Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Área Cultivada</div>
            <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              {season.plantedAreaHa.toLocaleString('pt-BR')} ha
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
              {season.productionSystem}
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Investimento Acumulado</div>
            <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              R$ {(kpis.totalSeasonCost / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              R$ {kpis.costPerHa.toLocaleString('pt-BR')}/ha
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Custo por Saca</div>
            <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              R$ {kpis.costPerBag.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              CTP R$ {kpis.breakEvenPricePerBag.toFixed(2)}/sc
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Produtividade Est./Real</div>
            <div className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              {estYieldScHa} sc/ha
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              Meta: {season.targetYieldBagsHa} sc/ha
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Ponto de Equilíbrio</div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              {kpis.breakEvenYieldBagsHa.toFixed(1)} sc/ha
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Cobertura do CTP</div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Margem Líquida</div>
            <div
              className={`text-lg font-bold mt-1 tabular-nums ${
                isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {kpis.netMarginPct.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              ROI: {kpis.roiPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Central 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Operações & Maquinário */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Tractor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">Operações &amp; Maquinário</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                    {seasonOps.length} operações · {(machines || []).length} máquinas
                  </p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('operations')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  Abrir <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Horas Trabalhadas</span>
                <span className="text-base font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {totalMachineHours} h
                </span>
              </div>
              <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Combustível Usado</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {totalFuelLiters.toLocaleString('pt-BR')} L
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Últimas Atividades</div>
              {seasonOps.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-3">
                  Nenhuma operação lançada nesta safra.
                </p>
              ) : (
                seasonOps.slice(0, 3).map((op) => (
                  <div
                    key={op.id}
                    className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg text-xs space-y-1 border border-slate-200/70 dark:border-zinc-800"
                  >
                    <div className="flex justify-between gap-2 font-medium text-slate-800 dark:text-zinc-200">
                      <span className="truncate">
                        {op.operationType} · {op.plotName}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums shrink-0">
                        R$ {op.totalOperationCost.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex justify-between tabular-nums">
                      <span>
                        {op.machineName || 'Equipamento'} ({op.hoursWorked}h)
                      </span>
                      <span>{formatCostDate(op.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Insumos & Almoxarifado */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Wheat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">Insumos &amp; Almoxarifado</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                    R$ {(totalInputsCost / 1000).toFixed(1)}k aplicados · {(inputs || []).length} itens
                  </p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('inputs')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  Estoque <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(inputs || []).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-3">
                  Nenhum insumo cadastrado no almoxarifado.
                </p>
              ) : (
                (inputs || []).slice(0, 4).map((inp) => {
                  const pctUsed = Math.max(
                    0,
                    Math.min(100, Math.round(((inp.quantityPurchased - inp.currentStock) / (inp.quantityPurchased || 1)) * 100))
                  );
                  return (
                    <div key={inp.id} className="space-y-1">
                      <div className="flex justify-between gap-2 text-xs text-slate-700 dark:text-zinc-300">
                        <span className="truncate font-medium">{inp.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap shrink-0 tabular-nums">
                          {inp.currentStock.toLocaleString('pt-BR')} {inp.unit} ({pctUsed}% uso)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pctUsed > 80 ? 'bg-emerald-500' : pctUsed > 40 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${pctUsed}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
            Controle de ponto crítico e consumo por operação integrado ao estoque.
          </div>
        </div>

        {/* Card 3: Diário & Impactos Climáticos */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">Diário &amp; Ocorrências</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                    {recentEvents.length} evento{recentEvents.length === 1 ? '' : 's'} registrado{recentEvents.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('timeline')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  Diário <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {recentEvents.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-3">
                  Nenhum evento climático ou fitossanitário registrado nesta safra.
                </p>
              ) : (
                recentEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg text-xs space-y-1 border border-slate-200/70 dark:border-zinc-800"
                  >
                    <div className="flex justify-between gap-2 font-medium text-slate-800 dark:text-zinc-200">
                      <span className="flex items-center gap-1.5 truncate">
                        {evt.weatherEvent && evt.weatherEvent !== 'Sem Eventos' && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate">{evt.title}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
                        {formatCostDate(evt.date)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">{evt.notes}</p>
                    {evt.costImpact ? (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium tabular-nums">
                        Impacto: R$ {evt.costImpact.toLocaleString('pt-BR')}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Result & Balance Summary */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Resultado Comercial &amp; Balanço da Safra
          </h3>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Ver DRE Completo <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
              Receita Bruta Total
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              R$ {kpis.grossRevenueTotal.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 block tabular-nums">
              R$ {kpis.grossRevenuePerHa.toLocaleString('pt-BR')} / ha
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium block">
              Custo Operacional (COE)
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              R$ {kpis.totalSeasonCost.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              R$ {kpis.costPerHa.toLocaleString('pt-BR')} / ha
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium block">
              Lucro Bruto Estimado
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              R$ {kpis.grossMarginTotal.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              Margem Bruta: {kpis.grossMarginPct}%
            </span>
          </div>

          <div
            className={`p-3.5 rounded-lg border space-y-1 ${
              isProfitable
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50'
                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/50'
            }`}
          >
            <span
              className={`text-[11px] font-medium block ${
                isProfitable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              Lucro Líquido Realizado
            </span>
            <div
              className={`text-xl font-bold tabular-nums ${
                isProfitable ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              R$ {kpis.netMarginTotal.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 block tabular-nums">
              ROI: {kpis.roiPct}% sobre CTP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
