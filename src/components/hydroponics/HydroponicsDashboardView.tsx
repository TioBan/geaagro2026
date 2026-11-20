import React from 'react';
import {
  AlertTriangle,
  Calculator,
  Clock,
  Compass,
  Droplets,
  Plus,
  ShieldCheck,
  Sprout,
  Thermometer,
} from 'lucide-react';
import {
  HydroponicAlert,
  HydroponicBench,
  HydroponicEnvironmentSensors,
  IrrigationTimerSchedule,
  NutrientSolutionReservoir,
} from '../../types/hydroponics';
import type { HydroponicsSubTab } from '../HydroponicsModule';
import { PUMP_STATUS_META } from './hydroponicsUi';

interface HydroponicsDashboardViewProps {
  benches: HydroponicBench[];
  reservoirs: NutrientSolutionReservoir[];
  selectedReservoirId: string;
  onSelectReservoir: (id: string) => void;
  irrigationSchedule: IrrigationTimerSchedule;
  sensors: HydroponicEnvironmentSensors;
  alerts: HydroponicAlert[];
  onNavigateToTab: (tab: HydroponicsSubTab) => void;
  onOpenNewBench: () => void;
  onOpenNewReservoir: () => void;
}

export const HydroponicsDashboardView: React.FC<HydroponicsDashboardViewProps> = ({
  benches,
  reservoirs,
  selectedReservoirId,
  onSelectReservoir,
  irrigationSchedule,
  sensors,
  alerts,
  onNavigateToTab,
  onOpenNewBench,
  onOpenNewReservoir,
}) => {
  const activeReservoir =
    reservoirs.find((r) => r.id === selectedReservoirId) || reservoirs[0] || null;

  const totalPlants = benches.reduce((sum, b) => sum + b.currentPlantsCount, 0);
  const readyBenches = benches.filter((b) => b.status === 'pronto_colheita');
  const readyUnits = readyBenches.reduce((sum, b) => sum + b.currentPlantsCount, 0);

  const totalSolutionLiters = reservoirs.reduce((sum, r) => sum + (r.currentVolumeLiters || 0), 0);
  const totalCapacityLiters = reservoirs.reduce((sum, r) => sum + (r.capacityLiters || 0), 0);
  const totalCapPct =
    totalCapacityLiters > 0 ? Math.round((totalSolutionLiters / totalCapacityLiters) * 100) : 0;

  const openAlerts = alerts.filter((a) => !a.resolved);

  const phInRange =
    activeReservoir !== null &&
    activeReservoir.currentPH >= activeReservoir.targetPHMin &&
    activeReservoir.currentPH <= activeReservoir.targetPHMax;

  const ecInRange =
    activeReservoir !== null &&
    activeReservoir.currentEC >= activeReservoir.targetECMin &&
    activeReservoir.currentEC <= activeReservoir.targetECMax;

  const oxygenStatus =
    activeReservoir === null
      ? 'Sem leitura'
      : activeReservoir.dissolvedOxygenPpm >= 6
      ? 'Adequado (>6 ppm)'
      : activeReservoir.dissolvedOxygenPpm >= 4
      ? 'Atenção (4–6 ppm)'
      : 'Crítico (<4 ppm)';

  const volumePct =
    activeReservoir && activeReservoir.capacityLiters > 0
      ? Math.min(100, Math.round((activeReservoir.currentVolumeLiters / activeReservoir.capacityLiters) * 100))
      : 0;

  return (
    <div className="space-y-4">
      {/* 4-Card Operational KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 tabular-nums">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Plantas em Produção</span>
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5">
            {totalPlants.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {benches.length === 0
              ? 'Nenhuma bancada cadastrada'
              : `${benches.length} ${benches.length === 1 ? 'bancada monitorada' : 'bancadas monitoradas'}`}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Solução Nutritiva</span>
            <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5">
            {totalSolutionLiters.toLocaleString('pt-BR')} L
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {reservoirs.length === 0
              ? 'Nenhum reservatório ativo'
              : `${reservoirs.length} ${reservoirs.length === 1 ? 'tanque' : 'tanques'} · ${totalCapPct}% ocupado`}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Temp. Solução / Ar</span>
            <Thermometer className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5">
            {activeReservoir ? `${activeReservoir.solutionTempC.toFixed(1)} °C` : '—'}
            <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 ml-1">
              / {sensors.airTempC > 0 ? `${sensors.airTempC.toFixed(1)} °C` : '—'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {sensors.vpdKpa > 0 ? `VPD ${sensors.vpdKpa.toFixed(2)} kPa` : 'Sem leitura climática'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Pronto p/ Colheita</span>
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1.5">
            {readyBenches.length} {readyBenches.length === 1 ? 'bancada' : 'bancadas'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {readyUnits > 0
              ? `${readyUnits.toLocaleString('pt-BR')} pés/maços estimados`
              : 'Nenhuma bancada em ponto de corte'}
          </p>
        </div>
      </div>

      {/* Main Split: Reservoir Telemetry + Quick Shortcuts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Reservoir Chemical Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Status da Solução Nutritiva
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {activeReservoir
                  ? activeReservoir.name
                  : 'Cadastre um reservatório para acompanhar pH, CE e volume'}
              </p>
            </div>

            {reservoirs.length > 0 ? (
              <select
                value={activeReservoir?.id || ''}
                onChange={(e) => onSelectReservoir(e.target.value)}
                aria-label="Selecionar reservatório"
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-800 dark:text-zinc-200"
              >
                {reservoirs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={onOpenNewReservoir}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Reservatório
              </button>
            )}
          </div>

          {activeReservoir ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
                <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH Atual</span>
                  <strong
                    className={`text-lg font-bold block mt-0.5 ${
                      phInRange
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {activeReservoir.currentPH.toFixed(2)}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Alvo {activeReservoir.targetPHMin}–{activeReservoir.targetPHMax}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CE (mS/cm)</span>
                  <strong
                    className={`text-lg font-bold block mt-0.5 ${
                      ecInRange
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {activeReservoir.currentEC.toFixed(2)}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Alvo {activeReservoir.targetECMin}–{activeReservoir.targetECMax}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Oxigênio (O₂)</span>
                  <strong className="text-lg font-bold text-slate-900 dark:text-zinc-100 block mt-0.5">
                    {activeReservoir.dissolvedOxygenPpm.toFixed(1)}
                    <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-0.5">
                      ppm
                    </span>
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">{oxygenStatus}</span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Bomba</span>
                  <strong
                    className={`text-sm font-semibold block mt-1.5 ${
                      PUMP_STATUS_META[activeReservoir.pumpStatus].textClass
                    }`}
                  >
                    {PUMP_STATUS_META[activeReservoir.pumpStatus].label}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                    {irrigationSchedule.daytimeOnMinutes}m on / {irrigationSchedule.daytimeOffMinutes}m off
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 tabular-nums">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
                  <span>Nível do Reservatório</span>
                  <span className="font-medium">
                    {activeReservoir.currentVolumeLiters.toLocaleString('pt-BR')} /{' '}
                    {activeReservoir.capacityLiters.toLocaleString('pt-BR')} L ({volumePct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${volumePct}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-6 text-center space-y-2.5">
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Nenhum reservatório cadastrado ainda
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Adicione seu primeiro tanque de solução nutritiva para acompanhar pH, condutividade elétrica, oxigenação e vinculá-lo às bancadas.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onOpenNewReservoir}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Reservatório
                </button>
                <button
                  type="button"
                  onClick={onOpenNewBench}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova Bancada
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Navigation & Alerts Summary */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Atalhos Operacionais
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateToTab('mapa_estufa')}
              className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 hover:border-emerald-500/60 text-left transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                Mapa da Estufa
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Planta baixa e lotes
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('simulador_receitas')}
              className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 hover:border-emerald-500/60 text-left transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                Simulador de Sais
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Formulação Tanque A/B
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('irrigacao')}
              className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 hover:border-emerald-500/60 text-left transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-600 dark:text-zinc-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                Bombas &amp; Timer
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Ciclos dia e noite
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('fitossanidade')}
              className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 hover:border-emerald-500/60 text-left transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                Fitossanidade
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Pythium, míldio e algas
              </span>
            </button>
          </div>

          {/* Alerts Snippet */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                Alertas Operacionais
              </span>
              <button
                type="button"
                onClick={() => onNavigateToTab('alertas')}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer tabular-nums"
              >
                Ver central ({openAlerts.length})
              </button>
            </div>

            {openAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nenhum alerta pendente no momento.
              </p>
            ) : (
              openAlerts.slice(0, 2).map((alt) => (
                <div
                  key={alt.id}
                  className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 flex items-start gap-2 text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 block truncate">
                      {alt.title}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                      {alt.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
