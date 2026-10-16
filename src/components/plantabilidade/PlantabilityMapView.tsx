import React, { useState } from 'react';
import { PropertyField, PlantabilitySamplingPoint, SeedingConfig } from '../../types/plantability';
import { calculatePlantabilityMetrics } from '../../utils/plantabilityCalculations';
import { MapPin, Layers, Compass, Sparkles, Filter, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  samplings: PlantabilitySamplingPoint[];
  configs: SeedingConfig[];
}

export const PlantabilityMapView: React.FC<Props> = ({ fields, samplings, configs }) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields?.[0]?.id || '');
  const [mapLayer, setMapLayer] = useState<'plantability' | 'speed' | 'depth'>('plantability');

  const activeField = (fields || []).find(f => f?.id === selectedFieldId) || fields?.[0];
  const fieldSamplings = samplings.filter(s => s.fieldId === activeField?.id);
  const activeConfig = configs.find(c => c.fieldId === activeField?.id);
  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            Mapa Interativo de Plantabilidade & Zonas de Qualidade
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Visualização geoespacial dos pontos de amostragem no talhão, com mapa de calor de falhas, duplos, profundidade e velocidade.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold">
            <button
              onClick={() => setMapLayer('plantability')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mapLayer === 'plantability' ? 'bg-emerald-600 text-white shadow' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Plantabilidade
            </button>
            <button
              onClick={() => setMapLayer('speed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mapLayer === 'speed' ? 'bg-emerald-600 text-white shadow' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Velocidade
            </button>
            <button
              onClick={() => setMapLayer('depth')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mapLayer === 'depth' ? 'bg-emerald-600 text-white shadow' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Profundidade
            </button>
          </div>

          <select
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value)}
            className="p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-bold text-xs"
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>
                {f.fieldCode} - {f.crop}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Canvas/SVG Map Canvas Container */}
      <div className="bg-stone-900 text-white p-6 rounded-3xl border border-stone-800 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-xs border-b border-stone-800 pb-3">
          <span className="font-mono font-bold text-emerald-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Talhão Mapeado: {activeField?.fieldCode} ({activeField?.areaHa} ha)
          </span>
          <span className="font-mono text-stone-400">
            Pontos de Amostragem: {(fieldSamplings || []).length}
          </span>
        </div>

        {/* Polygon Grid Visual Representation */}
        <div className="relative w-full h-80 bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden flex items-center justify-center p-4">
          {/* Grid background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Simulated Field Contour */}
          <div className="relative w-full max-w-xl h-64 border-2 border-dashed border-emerald-500/50 rounded-2xl bg-emerald-950/20 p-6 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-stone-900/80 px-2 py-0.5 rounded self-start">
              {activeField?.fieldCode} — Contour Perimeter
            </span>

            {/* Interactive Sampling Points Pins or Empty State */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
              {(fieldSamplings || []).length === 0 ? (
                <div className="col-span-full text-center py-4 text-xs text-stone-400 font-mono">
                  Nenhum ponto de amostragem medido neste talhão ainda.
                </div>
              ) : (
                fieldSamplings.map((s) => {
                  const pMetrics = calculatePlantabilityMetrics([s], activeConfig);
                  let pinBg = 'bg-emerald-500';
                  if (pMetrics.igpScore < 80) pinBg = 'bg-amber-500';
                  if (pMetrics.igpScore < 70) pinBg = 'bg-rose-500';

                  return (
                    <div
                      key={s.id}
                      className="bg-stone-900/90 border border-stone-700 p-3 rounded-xl flex items-center gap-3 shadow-lg hover:scale-105 transition-transform"
                    >
                      <div className={`w-3 h-3 rounded-full ${pinBg} animate-pulse`} />
                      <div className="font-mono text-[11px] leading-tight">
                        <p className="font-bold text-white">{s.pointCode}</p>
                        <p className="text-[10px] text-stone-400">IGP: {pMetrics.igpScore} | CV: {pMetrics.cvPercent}%</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono pt-2 border-t border-stone-800">
              <span>Camada Ativa: {mapLayer.toUpperCase()}</span>
              <span>Velocidade Semeadora: {activeConfig ? activeConfig.targetSpeedKmH : 6.5} km/h</span>
            </div>
          </div>
        </div>

        {/* Map Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono pt-2 border-t border-stone-800 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Excelente / Aceitável (IGP ≥ 90)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Atenção (Falhas / CV 25-35%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Crítico (Altas Falhas & Duplos)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
