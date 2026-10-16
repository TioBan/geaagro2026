import React, { useState } from 'react';
import { BuffaloPaddock, BuffaloWaterPoint, BuffaloAnimal } from '../../types/buffalo';
import {
  MapPin,
  Waves,
  Sun,
  Layers3,
  Compass,
  Info,
  Activity,
  Droplets,
  Trees
} from 'lucide-react';

interface BuffaloSmartMapViewProps {
  paddocks: BuffaloPaddock[];
  waterPoints: BuffaloWaterPoint[];
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloSmartMapView: React.FC<BuffaloSmartMapViewProps> = ({
  paddocks,
  waterPoints,
  animals,
  onOpenDigitalTwin
}) => {
  const [selectedPaddock, setSelectedPaddock] = useState<BuffaloPaddock | null>(paddocks[0] || null);

  return (
    <div className="space-y-6">
      {/* Top Banner do Mapa */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 block">
            Geotecnologia &amp; Manejo Espacial
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-600" />
            <span>Mapa Inteligente da Fazenda de Búfalos</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-zinc-300">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Piquete Ocupado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Açude de Banho</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Sombra &gt; 20%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualizador de Piquetes Espaciais em Grid Estilizado */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl relative min-h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-teal-400">Layout Espacial da Fazenda (Vista Aérea)</span>
              <span className="text-xs text-slate-400 font-mono">Área Total: 52.5 ha</span>
            </div>

            {/* Grid dos Piquetes e Pontos Hídricos */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {paddocks.map((p) => {
                const isSelected = selectedPaddock?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPaddock(p)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-950/80 border-teal-400 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-black text-white">{p.name.split('-')[0]}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                        {p.areaHa} ha
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{p.forageSpecies}</p>
                    
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-300 pt-2 border-t border-slate-800">
                      <span>Lotação: <strong>{p.currentStockingRateUaHa} UA/ha</strong></span>
                      <span className="text-blue-400 flex items-center gap-1">
                        <Waves className="w-3 h-3" /> {p.waterPointType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>💡 Clique em qualquer piquete para inspecionar os animais e qualidade forrageira.</span>
            <span className="text-teal-400 font-bold">Açude Central Operacional</span>
          </div>
        </div>

        {/* Painel Lateral de Detalhes do Piquete Selecionado */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
          {selectedPaddock ? (
            <div className="space-y-4">
              <div>
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold rounded-md">
                  {selectedPaddock.status}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">{selectedPaddock.name}</h3>
                <p className="text-xs text-slate-500">{selectedPaddock.forageSpecies}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Área</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedPaddock.areaHa} ha</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Animais</span>
                  <span className="font-bold text-teal-600">{selectedPaddock.currentAnimalCount} cabeças</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Altura Atual</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedPaddock.currentCanopyHeightCm} cm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sombra</span>
                  <span className="font-bold text-amber-600">{selectedPaddock.shadeAreaPct}%</span>
                </div>
              </div>

              {selectedPaddock.notes && (
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  {selectedPaddock.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Selecione um piquete no mapa.</p>
          )}
        </div>
      </div>
    </div>
  );
};
