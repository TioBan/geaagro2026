import React, { useMemo } from 'react';
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
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
  const latestSamplesByFarmId = useMemo(() => {
    const map = new Map<string, SoilSample>();
    for (const sample of soilSamples) {
      if (!sample?.farmId) continue;
      const current = map.get(sample.farmId);
      if (
        !current ||
        new Date(sample.collectionDate).getTime() > new Date(current.collectionDate).getTime()
      ) {
        map.set(sample.farmId, sample);
      }
    }
    return map;
  }, [soilSamples]);

  const producersById = useMemo(() => {
    const map = new Map<string, RuralProducer>();
    for (const p of producers) {
      if (p?.id) map.set(p.id, p);
    }
    return map;
  }, [producers]);

  const validFarms = useMemo(() => farms.filter(f => f && f.id), [farms]);

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Propriedades e última análise de solo
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Resumo rápido por fazenda com os parâmetros químicos mais recentes.
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
          {validFarms.length} propriedade{validFarms.length === 1 ? '' : 's'}
        </span>
      </div>

      {validFarms.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhuma propriedade cadastrada no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {validFarms.map(f => {
            const latestSample = latestSamplesByFarmId.get(f.id);
            const isActive = f.id === activeFarm?.id;
            const farmProducer = f.producerId ? producersById.get(f.producerId) : undefined;

            let soilHealthStatus = 'Sem análise';
            let statusColor = 'text-slate-500 dark:text-zinc-400';
            let statusOk = true;

            if (latestSample) {
              const ph = latestSample.phCaCl2;
              const v = latestSample.vPercent || 50;
              if (ph >= 5.5 && v >= 60) {
                soilHealthStatus = 'Fertilidade excelente';
                statusColor = 'text-emerald-700 dark:text-emerald-400';
                statusOk = true;
              } else if (ph >= 5.0 && v >= 45) {
                soilHealthStatus = 'Fertilidade regular';
                statusColor = 'text-amber-700 dark:text-amber-400';
                statusOk = false;
              } else {
                soilHealthStatus = 'Correção recomendada';
                statusColor = 'text-red-600 dark:text-red-400';
                statusOk = false;
              }
            }

            return (
              <div
                key={f.id}
                className={`bg-white dark:bg-zinc-900 rounded-xl border transition-colors flex flex-col overflow-hidden ${
                  isActive
                    ? 'border-emerald-500/80 dark:border-emerald-600/80'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="p-4 sm:p-5 flex-1 space-y-4">
                  {/* Cabeçalho da Fazenda */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {f.name}
                        </h3>
                        {isActive && (
                          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                            · Ativa
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {f.city} - {f.state}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{farmProducer?.name || 'Produtor não informado'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 tabular-nums">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                        Área cultivada
                      </span>
                      <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                        {f.cultivatedAreaHa} ha{' '}
                        <span className="font-normal text-slate-400 dark:text-zinc-500">
                          / {f.totalAreaHa} ha
                        </span>
                      </strong>
                    </div>
                  </div>

                  {/* Última Análise de Solo */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-slate-600 dark:text-zinc-300">
                        Última análise de solo
                      </span>
                      {latestSample && (
                        <span className={`inline-flex items-center gap-1 font-medium ${statusColor}`}>
                          {statusOk ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {soilHealthStatus}
                        </span>
                      )}
                    </div>

                    {latestSample ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs tabular-nums">
                        <dl className="space-y-1 text-slate-500 dark:text-zinc-400">
                          <div className="flex justify-between gap-2">
                            <dt>Protocolo</dt>
                            <dd className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                              {latestSample.labProtocol}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt>Coleta</dt>
                            <dd className="font-medium text-slate-800 dark:text-zinc-200">
                              {new Date(latestSample.collectionDate).toLocaleDateString('pt-BR')}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt>Profundidade</dt>
                            <dd className="font-medium text-emerald-700 dark:text-emerald-400">
                              {latestSample.depth} cm
                            </dd>
                          </div>
                        </dl>

                        <div className="grid grid-cols-3 border border-slate-200 dark:border-zinc-800 rounded-lg divide-x divide-slate-200 dark:divide-zinc-800 self-center">
                          <div className="py-2 px-1.5 text-center">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                              pH CaCl₂
                            </span>
                            <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {latestSample.phCaCl2.toFixed(1)}
                            </strong>
                          </div>
                          <div className="py-2 px-1.5 text-center">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                              V%
                            </span>
                            <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {latestSample.vPercent ? Math.round(latestSample.vPercent) : '--'}%
                            </strong>
                          </div>
                          <div className="py-2 px-1.5 text-center">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                              Argila
                            </span>
                            <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {Math.round(latestSample.clayPercent)}%
                            </strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-xs text-slate-400 dark:text-zinc-500 flex items-center justify-between gap-2">
                        <span>Nenhuma análise de solo cadastrada para esta propriedade.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFarmId(f.id);
                            setActiveTab('solos');
                          }}
                          className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline whitespace-nowrap cursor-pointer"
                        >
                          Lançar análise
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-zinc-950/40">
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => setSelectedFarmId(f.id)}
                      className="text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Selecionar fazenda</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Fazenda selecionada
                    </span>
                  )}

                  {latestSample && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFarmId(f.id);
                          setActiveTab('relatorios');
                        }}
                        className="h-7 px-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer transition-colors"
                      >
                        Laudo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFarmId(f.id);
                          setActiveTab('recomendacoes');
                        }}
                        className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Recomendar</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
