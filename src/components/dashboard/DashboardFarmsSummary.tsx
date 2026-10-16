import React, { useMemo } from 'react';
import {
  Building2,
  MapPin,
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { Farm, RuralProducer, SoilSample } from '../../types/agronomy';

interface DashboardFarmsSummaryProps {
  farms: Farm[];
  activeFarm: Farm;
  producers: RuralProducer[];
  soilSamples: SoilSample[];
  setSelectedFarmId: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardFarmsSummary: React.FC<DashboardFarmsSummaryProps> = ({
  farms = [],
  activeFarm,
  producers = [],
  soilSamples = [],
  setSelectedFarmId,
  setActiveTab,
}) => {
  // Pre-index the latest soil sample for each farm in a single pass
  const latestSamplesByFarmId = useMemo(() => {
    const map = new Map<string, SoilSample>();
    for (const sample of soilSamples) {
      if (!sample?.farmId) continue;
      const current = map.get(sample.farmId);
      if (!current || new Date(sample.collectionDate).getTime() > new Date(current.collectionDate).getTime()) {
        map.set(sample.farmId, sample);
      }
    }
    return map;
  }, [soilSamples]);

  // Pre-index producers by id for instant O(1) lookup
  const producersById = useMemo(() => {
    const map = new Map<string, RuralProducer>();
    for (const p of producers) {
      if (p?.id) map.set(p.id, p);
    }
    return map;
  }, [producers]);

  const validFarms = useMemo(() => farms.filter(f => f && f.id), [farms]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Resumo das Fazendas & Última Análise de Solo
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Visão rápida de cada propriedade com sua análise física e química mais recente.
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
          {validFarms.length} fazendas ativas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {validFarms.map(f => {
          const latestSample = latestSamplesByFarmId.get(f.id);
          const isActive = f.id === activeFarm?.id;
          const farmProducer = f.producerId ? producersById.get(f.producerId) : undefined;

          // Soil quality interpretation
          let soilHealthStatus = 'Sem Análise';
          let healthColor = 'text-slate-400 bg-slate-50 border-slate-100 dark:bg-zinc-900 dark:border-zinc-800';

          if (latestSample) {
            const ph = latestSample.phCaCl2;
            const v = latestSample.vPercent || 50;
            if (ph >= 5.5 && v >= 60) {
              soilHealthStatus = 'Fertilidade Excelente';
              healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/40';
            } else if (ph >= 5.0 && v >= 45) {
              soilHealthStatus = 'Fertilidade Regular';
              healthColor = 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40';
            } else {
              soilHealthStatus = 'Necessita Correção Urgente';
              healthColor = 'text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/40';
            }
          }

          return (
            <div
              key={f.id}
              className={`flex flex-col bg-white dark:bg-zinc-950 rounded-2xl border transition-all duration-200 overflow-hidden ${
                isActive
                  ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-slate-100 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Farm Top Cover Bar */}
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 tracking-tight">
                        {f.name}
                      </h3>
                      {isActive && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                          Selecionada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-400 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{f.city} - {f.state}</span>
                      <span className="text-slate-300 dark:text-zinc-700 mx-1">|</span>
                      <span>Produtor: {farmProducer?.name || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Cultivada</span>
                    <strong className="text-xs font-black text-slate-700 dark:text-zinc-200">
                      {f.cultivatedAreaHa} ha <span className="text-[9px] text-slate-400 font-normal">/ {f.totalAreaHa} ha</span>
                    </strong>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-zinc-900" />

                {/* Latest Analysis Panel */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Última Análise de Solo
                    </span>
                    {latestSample && (
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${healthColor}`}>
                        {soilHealthStatus}
                      </span>
                    )}
                  </div>

                  {latestSample ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-900/80">
                      {/* Column 1: Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Protocolo:</span>
                          <span className="font-bold text-slate-700 dark:text-zinc-300">{latestSample.labProtocol}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Coleta:</span>
                          <span className="font-bold text-slate-700 dark:text-zinc-300">
                            {new Date(latestSample.collectionDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Profundidade:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">{latestSample.depth} cm</span>
                        </div>
                      </div>

                      {/* Column 2: Parameters */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800 text-center">
                          <span className="text-[8px] text-slate-400 block font-bold">pH CaCl₂</span>
                          <strong className="text-xs text-slate-800 dark:text-zinc-200 font-black">
                            {latestSample.phCaCl2.toFixed(1)}
                          </strong>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800 text-center">
                          <span className="text-[8px] text-slate-400 block font-bold">Bases (V%)</span>
                          <strong className="text-xs text-slate-800 dark:text-zinc-200 font-black">
                            {latestSample.vPercent ? Math.round(latestSample.vPercent) : '--'}%
                          </strong>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800 text-center">
                          <span className="text-[8px] text-slate-400 block font-bold">Argila</span>
                          <strong className="text-xs text-slate-800 dark:text-zinc-200 font-black">
                            {Math.round(latestSample.clayPercent)}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-slate-400 dark:text-zinc-500">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                      <span className="text-xs block font-bold">Nenhuma análise cadastrada</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="bg-slate-50/60 dark:bg-zinc-900/60 px-5 py-3 border-t border-slate-100 dark:border-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
                {!isActive ? (
                  <button
                    onClick={() => setSelectedFarmId(f.id)}
                    className="text-[10px] font-black text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Selecionar como Ativa <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Ativa no Sistema
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {latestSample && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedFarmId(f.id);
                          setActiveTab('relatorios');
                        }}
                        className="px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-[10px] text-slate-700 dark:text-zinc-300 font-extrabold cursor-pointer transition-colors"
                      >
                        Laudo Completo
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFarmId(f.id);
                          setActiveTab('recomendacoes');
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        Recomendar <ArrowUpRight className="w-3 h-3 text-emerald-100" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
