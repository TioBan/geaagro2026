import React, { useState } from 'react';
import { Sprout, X } from 'lucide-react';
import {
  CropDigitalTwin,
  CropType,
  CultivationSystem,
  SoilTextureType,
  IrrigationType,
} from '../../types/phenology';
import { Farm } from '../../types/agronomy';

interface NewTwinModalProps {
  selectedFarm?: Farm;
  onClose: () => void;
  onSave: (twin: CropDigitalTwin) => void;
}

export const NewTwinModal: React.FC<NewTwinModalProps> = ({
  selectedFarm,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<{
    plotName: string;
    plotAreaHa: number;
    crop: CropType;
    cultivarName: string;
    cycleDays: number;
    plantingDate: string;
    spacingMeters: number;
    plantPopulationPerHa: number;
    cultivationSystem: CultivationSystem;
    soilTexture: SoilTextureType;
    irrigationType: IrrigationType;
  }>({
    plotName: '',
    plotAreaHa: 1,
    crop: 'soja',
    cultivarName: '',
    cycleDays: 120,
    plantingDate: new Date().toISOString().split('T')[0],
    spacingMeters: 0.45,
    plantPopulationPerHa: 250000,
    cultivationSystem: 'plantio_direto',
    soilTexture: 'argiloso',
    irrigationType: 'sequeiro',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cycleDays = Number(formData.cycleDays) || 120;
    const plantingTime = new Date(formData.plantingDate).getTime();
    const now = Date.now();
    const dap = Math.max(0, Math.floor((now - plantingTime) / (1000 * 60 * 60 * 24)));
    const cycleProgress = Math.min(100, Math.round((dap / cycleDays) * 100));

    const createdTwin: CropDigitalTwin = {
      id: `twin-${Date.now()}`,
      farmId: selectedFarm?.id || 'farm-01',
      farmName: selectedFarm?.name || 'Fazenda Principal',
      plotId: `plot-${Date.now()}`,
      plotName: formData.plotName || 'Talhão Principal',
      plotAreaHa: Number(formData.plotAreaHa) || 1,
      crop: formData.crop,
      cropName: formData.crop === 'soja' ? 'Soja Grão' : 'Milho',
      cultivarName: formData.cultivarName || 'Cultivar Registrada',
      cycleDays: cycleDays,
      plantingDate: formData.plantingDate,
      emergenceDate: formData.plantingDate,
      spacingMeters: Number(formData.spacingMeters) || 0.45,
      plantPopulationPerHa: Number(formData.plantPopulationPerHa) || 250000,
      cultivationSystem: formData.cultivationSystem,
      soilTexture: formData.soilTexture,
      irrigationType: formData.irrigationType,
      currentDap: dap,
      currentStageId: dap <= 5 ? 'soja_VE' : dap <= 15 ? 'soja_VC' : dap <= 25 ? 'soja_V2' : 'soja_V4',
      currentStageCode: dap <= 5 ? 'VE' : dap <= 15 ? 'VC' : dap <= 25 ? 'V2' : 'V4',
      currentStageName: dap <= 5 ? 'Emergência (Cotilédones)' : dap <= 15 ? 'Cotiledonar' : dap <= 25 ? 'Segundo Nó' : 'Vegetativo Desenvolvido',
      cycleProgressPercent: cycleProgress,
      expectedHarvestDate: new Date(plantingTime + cycleDays * 86400000).toISOString().split('T')[0],
      accumulatedGdd: Math.round(dap * 14.5),
      targetGdd: 1480,
      idcScore: 95,
      idcStatus: 'dentro_do_esperado',
      nextStageCode: 'V6',
      daysToNextStage: 6,
      limitingFactors: [],
      notes: 'Lavoura cadastrada no Gêmeo Digital.',
    };

    onSave(createdTwin);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Cadastrar Novo Talhão no Gêmeo Digital
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Identificação do Talhão:</label>
              <input
                type="text"
                required
                value={formData.plotName}
                onChange={e => setFormData(prev => ({ ...prev, plotName: e.target.value }))}
                placeholder="Ex: Talhão 08 - Pivô Central"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Área Cultivada (ha):</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.plotAreaHa || ''}
                onChange={e => setFormData(prev => ({ ...prev, plotAreaHa: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Cultura:</label>
              <select
                value={formData.crop}
                onChange={e => setFormData(prev => ({ ...prev, crop: e.target.value as CropType }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              >
                <option value="soja">Soja (Glycine max)</option>
                <option value="milho">Milho (Zea mays)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Cultivar / Variedade:</label>
              <input
                type="text"
                required
                value={formData.cultivarName}
                onChange={e => setFormData(prev => ({ ...prev, cultivarName: e.target.value }))}
                placeholder="Ex: TMG 2381 IPRO"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Data de Plantio:</label>
              <input
                type="date"
                required
                value={formData.plantingDate}
                onChange={e => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Ciclo Médio Estimado (dias):</label>
              <input
                type="number"
                min="60"
                max="200"
                required
                value={formData.cycleDays || ''}
                onChange={e => setFormData(prev => ({ ...prev, cycleDays: parseInt(e.target.value, 10) || 120 }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Espaçamento Entre Linhas (m):</label>
              <input
                type="number"
                step="0.05"
                min="0.2"
                max="1.5"
                required
                value={formData.spacingMeters || ''}
                onChange={e => setFormData(prev => ({ ...prev, spacingMeters: parseFloat(e.target.value) || 0.45 }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">População Alvo (plantas/ha):</label>
              <input
                type="number"
                step="5000"
                min="10000"
                max="1000000"
                required
                value={formData.plantPopulationPerHa || ''}
                onChange={e => setFormData(prev => ({ ...prev, plantPopulationPerHa: parseInt(e.target.value, 10) || 250000 }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Sistema de Cultivo:</label>
              <select
                value={formData.cultivationSystem}
                onChange={e => setFormData(prev => ({ ...prev, cultivationSystem: e.target.value as CultivationSystem }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              >
                <option value="plantio_direto">Plantio Direto na Palha</option>
                <option value="convencional">Cultivo Convencional</option>
                <option value="cultivo_minimo">Cultivo Mínimo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Sistema de Irrigação:</label>
              <select
                value={formData.irrigationType}
                onChange={e => setFormData(prev => ({ ...prev, irrigationType: e.target.value as IrrigationType }))}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              >
                <option value="sequeiro">Sequeiro (Sem Irrigação)</option>
                <option value="pivo_central">Pivô Central</option>
                <option value="gotejamento">Gotejamento</option>
                <option value="aspersao">Aspersão Convencional</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-slate-600 dark:text-zinc-300 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-xs transition cursor-pointer"
            >
              Ativar Gêmeo Digital
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
