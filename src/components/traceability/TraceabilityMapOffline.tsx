import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  AlertTriangle,
  Droplets,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  TraceabilityPlot,
  TraceabilityLot,
  TraceabilityProperty,
} from '../../types/traceability';

interface MapOfflineProps {
  property: TraceabilityProperty;
  plots: TraceabilityPlot[];
  lots: TraceabilityLot[];
  onSelectLot: (lot: TraceabilityLot) => void;
  onOpenPassport: (lot: TraceabilityLot) => void;
}

export const TraceabilityMapOffline: React.FC<MapOfflineProps> = ({
  property,
  plots,
  lots,
  onSelectLot,
  onOpenPassport,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(plots[0]?.id || null);

  const selectedPlot = plots.find(p => p.id === selectedPlotId) || plots[0] || null;
  const plotLots = selectedPlot
    ? lots.filter(l => l.plotId === selectedPlot.id || l.plotCode === selectedPlot.code)
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Croqui Esquemático de Talhões, Estufas & Unidades
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Visão offline das unidades de produção e status fitossanitário em tempo real
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 tabular-nums whitespace-nowrap">
            Coord.: {property.latitude || 0}, {property.longitude || 0}
          </span>
        </div>
      </div>

      {plots.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2">
          <Layers className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Nenhum talhão ou estufa cadastrado
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Desenhe talhões no Mapa Satélite GIS (Leaflet) ou importe uma propriedade na aba Configurações para visualizar o croqui esquemático.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Visual Croqui Grid */}
          <div className="lg:col-span-8 bg-slate-50/70 dark:bg-zinc-950/60 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Croqui Interativo ({plots.length} unidades)
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Em Produção
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-rose-500" /> Em Carência
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-slate-400" /> Vazio / Preparo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plots.map(plot => {
                const isSelected = selectedPlot?.id === plot.id;
                const hasQuarantine = lots.some(
                  l => (l.plotId === plot.id || l.plotCode === plot.code) && l.isUnderActiveQuarantine
                );

                return (
                  <button
                    key={plot.id}
                    type="button"
                    onClick={() => setSelectedPlotId(plot.id)}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/80 dark:border-emerald-600'
                        : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-semibold text-[11px] bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 px-1.5 py-0.5 rounded-md text-slate-800 dark:text-zinc-200">
                            {plot.code}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 capitalize">
                            {(plot.structureType || plot.type || 'campo_aberto').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-1 truncate">
                          {plot.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums truncate">
                          {plot.areaHa} ha •{' '}
                          {plot.currentCrop
                            ? `${plot.currentCrop} (${plot.currentCultivar || 'Padrão'})`
                            : 'Sem plantio ativo'}
                        </p>
                      </div>

                      {hasQuarantine ? (
                        <span
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 rounded-lg shrink-0"
                          title="Lote em carência"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1 capitalize">
                        <Droplets className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                        {(plot.irrigationSystem || plot.irrigationType || 'gotejamento').replace(/_/g, ' ')}
                      </span>
                      <span className="truncate">Solo: {plot.soilType || plot.soilTexture || 'Médio'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Plot Inspector */}
          {selectedPlot && (
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                    Detalhes de {selectedPlot.code}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{selectedPlot.name}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 tabular-nums whitespace-nowrap">
                  {selectedPlot.areaHa} ha
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Estrutura</span>
                  <strong className="capitalize text-slate-900 dark:text-zinc-100">
                    {(selectedPlot.structureType || selectedPlot.type || 'campo_aberto').replace(/_/g, ' ')}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Irrigação</span>
                  <strong className="capitalize text-slate-900 dark:text-zinc-100">
                    {(selectedPlot.irrigationSystem || selectedPlot.irrigationType || 'gotejamento').replace(/_/g, ' ')}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Solo / Substrato</span>
                  <strong className="capitalize text-slate-900 dark:text-zinc-100">
                    {selectedPlot.soilType || selectedPlot.soilTexture || 'Médio'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Coordenadas</span>
                  <strong className="font-mono text-slate-900 dark:text-zinc-100 tabular-nums">
                    {selectedPlot.latitude ?? '--'}, {selectedPlot.longitude ?? '--'}
                  </strong>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                <h5 className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider tabular-nums">
                  Lotes Ativos no Local ({plotLots.length})
                </h5>

                {plotLots.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg p-3">
                    Nenhum lote vinculado a este talhão no momento.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {plotLots.map(lot => (
                      <div
                        key={lot.id}
                        className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                            {lot.lotCode}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                            IGR {lot.igrScorePercentage}%
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                          {lot.cropName} - {lot.cultivarName}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => onSelectLot(lot)}
                            className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            Ver Gêmeo 360° <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPassport(lot)}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                          >
                            Passaporte
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
