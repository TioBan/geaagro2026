import React, { useState } from 'react';
import {
  IrrigationSystemRecord,
  ClimateDayRecord,
  IrrigationKPIs,
} from '../../types/irrigation';
import { Droplets, ShieldCheck, Activity, Layers } from 'lucide-react';
import { formatBrDate } from './irrigationUi';

interface Props {
  systems: IrrigationSystemRecord[];
  climate: ClimateDayRecord[];
  kpis: IrrigationKPIs;
}

export const SystemDigitalTwinView: React.FC<Props> = ({
  systems,
  climate,
  kpis,
}) => {
  const [twinMode, setTwinMode] = useState<'system' | 'plot'>('system');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  const activeSystem =
    (selectedSystemId ? systems.find((s) => s.id === selectedSystemId) : null) ||
    systems[0] ||
    null;

  const latestClimate = climate[climate.length - 1] || null;

  if (systems.length === 0 || !activeSystem) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
        <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
          <Droplets className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum Sistema de Irrigação Cadastrado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
          Cadastre seus pivôs ou sistemas fixos na aba Sistemas para acompanhar a modelagem operacional e o perfil hídrico do talhão.
        </p>
      </div>
    );
  }

  // Derive realistic soil profile percentages from latest climate balance when available
  const baseMoisture =
    kpis.currentSoilMoisturePct > 0
      ? kpis.currentSoilMoisturePct
      : latestClimate
      ? Math.max(
          45,
          Math.min(
            95,
            Math.round(78 + (latestClimate.effectiveRainfallMm - latestClimate.et0MmDay) * 2)
          )
        )
      : 75;

  const soilLayers = [
    {
      label: 'Camada 0 – 20 cm (Zona Superficial)',
      pct: Math.max(30, Math.min(100, baseMoisture - 3)),
    },
    {
      label: 'Camada 20 – 40 cm (Zona Radicular Efetiva)',
      pct: Math.max(30, Math.min(100, baseMoisture)),
    },
    {
      label: 'Camada 40 – 60 cm (Subsolo / Reserva)',
      pct: Math.max(30, Math.min(100, baseMoisture + 4)),
    },
  ];

  const estimatedCv = Math.round(activeSystem.powerKw * 1.3596);

  return (
    <div className="space-y-4">
      {/* Header + Mode Segmented Switch */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Painel Operacional &amp; Balanço Hídrico do Talhão
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Visão integrada de desempenho hidráulico do sistema selecionado e reserva de umidade por camada.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTwinMode('system')}
            className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              twinMode === 'system'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Sistema
          </button>
          <button
            type="button"
            onClick={() => setTwinMode('plot')}
            className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              twinMode === 'plot'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Perfil do Solo
          </button>
        </div>
      </div>

      {twinMode === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* System Selector */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block px-0.5">
              Sistemas Disponíveis ({systems.length})
            </span>

            {systems.map((sys) => {
              const selected = activeSystem.id === sys.id;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-white dark:bg-zinc-900 border-emerald-500 dark:border-emerald-600'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                      {sys.systemName}
                    </span>
                    <span
                      className={`text-[11px] font-medium shrink-0 ${
                        sys.status === 'Ativo'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {sys.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                    {sys.plotName} · {sys.irrigatedAreaHa} ha · {sys.type}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active System Overview */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
                  {activeSystem.type} · {activeSystem.plotName}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  {activeSystem.systemName}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Status: {activeSystem.status}
              </span>
            </div>

            {/* Clean Hairline SVG Hydraulic Schematic */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-5 flex flex-col sm:flex-row items-center gap-5">
              <svg
                viewBox="0 0 120 120"
                className="w-28 h-28 shrink-0"
                aria-hidden="true"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="stroke-slate-300 dark:stroke-zinc-700"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="34"
                  fill="none"
                  strokeWidth="1.5"
                  className="stroke-sky-500/50"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="18"
                  fill="none"
                  strokeWidth="1.5"
                  className="stroke-emerald-500/60"
                />
                <line
                  x1="60"
                  y1="60"
                  x2="104"
                  y2="38"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="stroke-emerald-600 dark:stroke-emerald-400"
                />
                <circle cx="60" cy="60" r="4" className="fill-slate-900 dark:fill-zinc-100" />
              </svg>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
                  Conjunto Motobomba · {activeSystem.powerKw} kW (~{estimatedCv} CV) · Tarifa {activeSystem.energyTariffType}
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  Vazão Nominal: {activeSystem.nominalFlowM3h} m³/h · Pressão: {activeSystem.operatingPressureMca} mca
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
                  Área coberta de {activeSystem.irrigatedAreaHa} ha ({(activeSystem.nominalFlowM3h / Math.max(1, activeSystem.irrigatedAreaHa)).toFixed(2)} m³/h/ha).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs tabular-nums">
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Uniformidade CUC</span>
                <strong className="text-base text-emerald-700 dark:text-emerald-400">
                  {activeSystem.cucPercent ?? 0}%
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Distribuição CUD</span>
                <strong className="text-base text-emerald-700 dark:text-emerald-400">
                  {activeSystem.cudPercent ?? 0}%
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Eficiência Ea</span>
                <strong className="text-base text-sky-700 dark:text-sky-400">
                  {activeSystem.applicationEfficiencyPct ?? 85}%
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {twinMode === 'plot' && (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Perfil Vertical de Umidade — {activeSystem.plotName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {latestClimate
                  ? `Baseado na leitura climática de ${formatBrDate(latestClimate.date)} (ET₀ ${latestClimate.et0MmDay} mm/dia · Chuva ${latestClimate.rainfallMm} mm).`
                  : 'Estimativa de reserva hídrica por camada (lance leituras em Meteorologia para refinar).'}
              </p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-sky-700 dark:text-sky-400">
              Reserva Média: {baseMoisture}% CAD
            </span>
          </div>

          <div className="space-y-3">
            {soilLayers.map((layer) => (
              <div
                key={layer.label}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {layer.label}
                  </span>
                  <strong className="tabular-nums text-sky-700 dark:text-sky-400">
                    {layer.pct}% da Capacidade de Campo
                  </strong>
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-sm overflow-hidden">
                  <div
                    className="bg-sky-600 dark:bg-sky-500 h-full transition-all"
                    style={{ width: `${layer.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemDigitalTwinView;
