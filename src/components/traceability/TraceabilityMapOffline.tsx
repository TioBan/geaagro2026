import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Boxes,
  Droplets,
  Sun,
  Eye,
  CheckCircle2,
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
  const [selectedPlot, setSelectedPlot] = useState<TraceabilityPlot>(plots[0]);

  const plotLots = lots.filter(l => l.plotId === selectedPlot?.id || l.plotCode === selectedPlot?.code);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Mapa Visual de Talhões, Estufas & Microbacias
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Visão espacial georreferenciada da propriedade e status de cada unidade de produção em tempo real
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-xl">
            Coordenadas: {property.latitude}, {property.longitude}
          </span>
        </div>
      </div>

      {/* Grid: Interactive Farm Layout & Plot Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Croqui Grid */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-zinc-950 p-6 rounded-2xl border border-slate-300 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Croqui Interativo da Fazenda
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Em Produção</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Em Carência</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-400" /> Vazio / Preparo</span>
            </div>
          </div>

          {/* Grid of Plots / Greenhouses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plots.map(plot => {
              const isSelected = selectedPlot?.id === plot.id;
              const hasQuarantine = lots.some(l => (l.plotId === plot.id || l.plotCode === plot.code) && l.isUnderActiveQuarantine);

              return (
                <div
                  key={plot.id}
                  onClick={() => setSelectedPlot(plot)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-800 dark:text-zinc-200">
                          {plot.code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">
                          {(plot.structureType || plot.type || 'campo_aberto').replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {plot.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {plot.areaHa} ha • {plot.currentCrop ? `${plot.currentCrop} (${plot.currentCultivar || 'Padrão'})` : 'Sem plantio ativo'}
                      </p>
                    </div>

                    {hasQuarantine ? (
                      <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg" title="Lote em carência">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      {plot.irrigationSystem || plot.irrigationType || 'Gotejamento'}
                    </span>
                    <span>Solo: {plot.soilType || plot.soilTexture || 'Arenoso-Argiloso'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Plot Inspector */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Detalhes de {selectedPlot.code}
              </h4>
              <p className="text-xs text-slate-500">{selectedPlot.name}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {selectedPlot.areaHa} ha
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
            <p>Tipo de Estrutura: <strong className="capitalize">{(selectedPlot.structureType || selectedPlot.type || 'campo_aberto').replace('_', ' ')}</strong></p>
            <p>Sistema de Irrigação: <strong>{selectedPlot.irrigationSystem || selectedPlot.irrigationType || 'Gotejamento'}</strong></p>
            <p>Tipo de Solo / Substrato: <strong>{selectedPlot.soilType || selectedPlot.soilTexture || 'Arenoso-Argiloso'}</strong></p>
            <p>Coordenadas Centrais: <strong className="font-mono">{selectedPlot.latitude}, {selectedPlot.longitude}</strong></p>
          </div>

          {/* Lotes Ativos neste talhão */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Lotes Ativos no Local ({plotLots.length})
            </h5>

            {plotLots.map(lot => (
              <div key={lot.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                    {lot.lotCode}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">IGR {lot.igrScorePercentage}%</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  {lot.cropName} - {lot.cultivarName}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onSelectLot(lot)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Ver Gêmeo 360° &rarr;
                  </button>
                  <button
                    onClick={() => onOpenPassport(lot)}
                    className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded cursor-pointer"
                  >
                    Passaporte
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
