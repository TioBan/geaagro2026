import React from 'react';
import {
  IrrigationSystemRecord,
  ClimateDayRecord,
  IrrigationEventLog,
  IrrigationKPIs,
} from '../../types/irrigation';
import {
  Droplets,
  Zap,
  Gauge,
  Activity,
  Sun,
  MapPin,
  SlidersHorizontal,
  ArrowRight,
  Plus,
} from 'lucide-react';
import type { IrrigationTab } from './IrrigationModule';
import { formatBrDate } from './irrigationUi';

interface Props {
  systems: IrrigationSystemRecord[];
  climate: ClimateDayRecord[];
  logs: IrrigationEventLog[];
  kpis: IrrigationKPIs;
  onNavigateToTab: (tab: IrrigationTab) => void;
}

export const IrrigationDashboardView: React.FC<Props> = ({
  systems,
  climate,
  logs,
  kpis,
  onNavigateToTab,
}) => {
  const latestClimate = climate[climate.length - 1] || null;
  const recentLogs = logs.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* 4-KPI Primary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
            <span>Área Irrigada</span>
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-zinc-100">
            {kpis.totalIrrigatedAreaHa.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">ha</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between gap-2">
            <span className="tabular-nums">
              Ativos: <strong className="text-slate-700 dark:text-zinc-200">{kpis.totalActiveSystemsCount}</strong>/{systems.length}
            </span>
            <span
              className={
                systems.length > 0
                  ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-slate-400 dark:text-zinc-500'
              }
            >
              {systems.length > 0 ? 'Operacional' : 'Sem cadastro'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
            <span>Volume Aplicado</span>
            <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-zinc-100">
            {kpis.totalWaterVolumeSeasonM3.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">m³</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Eficiência Média (Ea):{' '}
            <strong className="text-slate-700 dark:text-zinc-200">
              {kpis.avgSystemEfficiencyPct > 0 ? `${kpis.avgSystemEfficiencyPct}%` : '—'}
            </strong>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
            <span>Umidade do Solo</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-zinc-100">
            {kpis.currentSoilMoisturePct > 0 ? (
              <>
                {kpis.currentSoilMoisturePct}%{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">CAD</span>
              </>
            ) : (
              <span className="text-slate-400 dark:text-zinc-500">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between gap-2">
            <span>Estresse:</span>
            <span
              className={`font-medium truncate ${
                kpis.waterStressIndex === 'Não monitorado'
                  ? 'text-slate-400 dark:text-zinc-500'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {kpis.waterStressIndex}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
            <span>Custo Energético</span>
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-zinc-100">
            R$ {kpis.totalEnergyCostBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between gap-2 tabular-nums">
            <span>{kpis.totalEnergyConsumedKwh.toLocaleString('pt-BR')} kWh</span>
            <span className="text-amber-700 dark:text-amber-400 font-medium truncate">
              {systems[0]?.energyTariffType ? `Tarifa ${systems[0].energyTariffType}` : 'Sem registros'}
            </span>
          </div>
        </div>
      </div>

      {/* Meteorology + Active Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Weather Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                Meteorologia &amp; ET₀
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {latestClimate ? formatBrDate(latestClimate.date) : 'Sem leitura'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">ET₀ Diária</span>
                <span className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                  {latestClimate?.et0MmDay ? `${latestClimate.et0MmDay} mm/dia` : '—'}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Chuva Acum.</span>
                <span className="text-base font-bold tabular-nums text-sky-700 dark:text-sky-400">
                  {kpis.accumulatedRainfallMm} mm
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-zinc-400">Temp. Máx / Mín</span>
                <strong className="tabular-nums text-slate-900 dark:text-zinc-100">
                  {latestClimate ? `${latestClimate.tempMaxC}°C / ${latestClimate.tempMinC}°C` : '—'}
                </strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-zinc-400">Umidade Relativa</span>
                <strong className="tabular-nums text-slate-900 dark:text-zinc-100">
                  {latestClimate ? `${latestClimate.humidityRelativePct}%` : '—'}
                </strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-zinc-400">ETc Estimada (Kc 1,15)</span>
                <strong className="tabular-nums text-emerald-700 dark:text-emerald-400">
                  {latestClimate?.et0MmDay ? `${(latestClimate.et0MmDay * 1.15).toFixed(1)} mm/dia` : '—'}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('weather')}
            className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            Abrir Meteorologia
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Systems List */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Sistemas de Irrigação na Propriedade
              </h3>
              <button
                type="button"
                onClick={() => onNavigateToTab('systems')}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Gerenciar
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {systems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Nenhum sistema de irrigação cadastrado
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  Cadastre pivôs centrais, gotejamento ou aspersão para acompanhar vazão, uniformidade CUC/CUD, energia e manejo de lâminas.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('systems')}
                  className="mt-1 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Primeiro Sistema
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                {systems.map((sys) => (
                  <div
                    key={sys.id}
                    onClick={() => onNavigateToTab('digital_twin')}
                    className="p-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                          {sys.systemName}
                        </h4>
                        <span
                          className={`text-[11px] font-medium shrink-0 ${
                            sys.status === 'Ativo'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : sys.status === 'Manutenção'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          · {sys.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 tabular-nums">
                        {sys.plotName} · {sys.irrigatedAreaHa} ha · {sys.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0 tabular-nums">
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Vazão / Pressão</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {sys.nominalFlowM3h} m³/h · {sys.operatingPressureMca} mca
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">CUC / Ea</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {sys.cucPercent}% / {sys.applicationEfficiencyPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentLogs.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                Última rega registrada: <strong className="text-slate-800 dark:text-zinc-200">{recentLogs[0].systemName}</strong> em{' '}
                {formatBrDate(recentLogs[0].date)} ({recentLogs[0].grossDepthAppliedMm} mm)
              </span>
              <button
                type="button"
                onClick={() => onNavigateToTab('reports')}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                Ver extrato ({logs.length})
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(
          [
            {
              tab: 'calculator' as IrrigationTab,
              title: 'Cálculo de Lâminas',
              desc: 'Manejo hídrico, CAD, AFD e tempo (Ti)',
              icon: Gauge,
            },
            {
              tab: 'simulator' as IrrigationTab,
              title: 'Simulador de Cenários',
              desc: 'Compare lâminas, turnos e tarifas',
              icon: SlidersHorizontal,
            },
            {
              tab: 'water_quality' as IrrigationTab,
              title: 'Qualidade & Diário',
              desc: 'Salinidade da água e registros de campo',
              icon: Droplets,
            },
            {
              tab: 'digital_twin' as IrrigationTab,
              title: 'Painel Operacional',
              desc: 'Visão técnica do sistema e perfil do solo',
              icon: Activity,
            },
          ]
        ).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onNavigateToTab(item.tab)}
              className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-600 transition-colors text-left flex items-start gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                  {item.title}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IrrigationDashboardView;
