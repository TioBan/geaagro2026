import React, { useState, useEffect } from 'react';
import { X, Save, Layers } from 'lucide-react';
import { FieldPlot, SoilTexture } from '../../types/agronomy';

interface EditPlotModalProps {
  isOpen: boolean;
  plot: FieldPlot | null;
  onSave: (updatedPlot: FieldPlot) => void;
  onClose: () => void;
}

export const EditPlotModal: React.FC<EditPlotModalProps> = ({
  isOpen,
  plot,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [areaHa, setAreaHa] = useState<number>(0);
  const [texture, setTexture] = useState<SoilTexture>('argiloso');
  const [clayPercentage, setClayPercentage] = useState<number>(40);
  const [currentCrop, setCurrentCrop] = useState('');
  const [spacingBetweenRowsMeters, setSpacingBetweenRowsMeters] = useState<number | ''>('');
  const [spacingBetweenPlantsMeters, setSpacingBetweenPlantsMeters] = useState<number | ''>('');
  const [irrigationType, setIrrigationType] = useState<'sequeiro' | 'pivo_central' | 'gotejamento' | 'aspersao'>('sequeiro');

  useEffect(() => {
    if (plot) {
      setName(plot.name || '');
      setAreaHa(plot.areaHa || 0);
      setTexture(plot.texture || 'argiloso');
      setClayPercentage(plot.clayPercentage || 40);
      setCurrentCrop(plot.currentCrop || '');
      setSpacingBetweenRowsMeters(plot.spacingBetweenRowsMeters || '');
      setSpacingBetweenPlantsMeters(plot.spacingBetweenPlantsMeters || '');
      setIrrigationType(plot.irrigationType || 'sequeiro');
    }
  }, [plot]);

  if (!isOpen || !plot) return null;

  const safeRow = Number(spacingBetweenRowsMeters) || 0;
  const safePlant = Number(spacingBetweenPlantsMeters) || 0;
  const calculatedPopulation = safeRow > 0 && safePlant > 0 ? Math.round(10000 / (safeRow * safePlant)) : 0;
  const calculatedLinearMeters = safeRow > 0 ? Math.round(10000 / safeRow) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: FieldPlot = {
      ...plot,
      name: name.trim(),
      areaHa: Number(areaHa) || 0,
      texture,
      clayPercentage: Number(clayPercentage) || 0,
      currentCrop: currentCrop.trim(),
      spacingBetweenRowsMeters: safeRow,
      spacingBetweenPlantsMeters: safePlant,
      plantPopulationPerHa: calculatedPopulation,
      linearMetersPerHa: calculatedLinearMeters,
      irrigationType,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Editar Talhão
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Parâmetros físicos, solo e densidade de plantio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Nome do Talhão / Identificação *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Área (ha) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={areaHa}
                onChange={(e) => setAreaHa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Cultura Atual / Planejada
              </label>
              <input
                type="text"
                value={currentCrop}
                onChange={(e) => setCurrentCrop(e.target.value)}
                placeholder="Ex: Soja, Milho, Café"
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Textura do Solo
              </label>
              <select
                value={texture}
                onChange={(e) => setTexture(e.target.value as SoilTexture)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="arenoso">Arenoso (&lt;15% argila)</option>
                <option value="medio">Médio (15 a 35% argila)</option>
                <option value="argiloso">Argiloso (35 a 60% argila)</option>
                <option value="muito_argiloso">Muito Argiloso (&gt;60% argila)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Teor de Argila (%)
              </label>
              <input
                type="number"
                value={clayPercentage}
                onChange={(e) => setClayPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Espaçamento Linhas (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={spacingBetweenRowsMeters}
                onChange={(e) => setSpacingBetweenRowsMeters(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Espaçamento Plantas (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={spacingBetweenPlantsMeters}
                onChange={(e) => setSpacingBetweenPlantsMeters(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Sistema de Irrigação
            </label>
            <select
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            >
              <option value="sequeiro">Sequeiro (sem irrigação)</option>
              <option value="pivo_central">Pivô Central</option>
              <option value="gotejamento">Gotejamento</option>
              <option value="aspersao">Aspersão Convencional</option>
            </select>
          </div>

          {/* Plantability preview box */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs space-y-1">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              Cálculo Automático de Estande:
            </p>
            <div className="flex justify-between text-slate-700 dark:text-zinc-300">
              <span>População Estimada:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {calculatedPopulation > 0 ? `${calculatedPopulation.toLocaleString('pt-BR')} plantas/ha` : '-'}
              </span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-zinc-300">
              <span>Metros Lineares:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                {calculatedLinearMeters > 0 ? `${calculatedLinearMeters.toLocaleString('pt-BR')} m/ha` : '-'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
