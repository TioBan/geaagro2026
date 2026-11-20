import React, { useState, useEffect } from 'react';
import { Sprout, X } from 'lucide-react';
import {
  CropDigitalTwin,
  CropType,
  CultivationSystem,
  SoilTextureType,
  IrrigationType
} from '../../types/phenology';
import { Farm } from '../../types/agronomy';
import { SOJA_PHENOLOGICAL_STAGES } from '../../data/phenologyData';

interface NewTwinModalProps {
  selectedFarm?: Farm;
  onClose: () => void;
  onSave: (twin: CropDigitalTwin) => void;
}

const CROP_LABELS: Record<CropType, string> = {
  soja: 'Soja Grão',
  milho: 'Milho',
  algodao: 'Algodão',
  feijao: 'Feijão',
  cafe: 'Café',
  cana: 'Cana-de-açúcar',
  trigo: 'Trigo',
  hortalicas: 'Hortaliças'
};

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const NewTwinModal: React.FC<NewTwinModalProps> = ({
  selectedFarm,
  onClose,
  onSave
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
    plotAreaHa: 10,
    crop: 'soja',
    cultivarName: '',
    cycleDays: 120,
    plantingDate: new Date().toISOString().split('T')[0],
    spacingMeters: 0.45,
    plantPopulationPerHa: 250000,
    cultivationSystem: 'plantio_direto',
    soilTexture: 'argiloso',
    irrigationType: 'sequeiro'
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cycleDays = Number(formData.cycleDays) || 120;
    const plantingTime = new Date(formData.plantingDate).getTime();
    const now = Date.now();
    const dap = Math.max(0, Math.floor((now - plantingTime) / (1000 * 60 * 60 * 24)));
    const cycleProgress = Math.min(100, Math.round((dap / cycleDays) * 100));

    // Resolve current and next stage accurately from official phenology table
    let stageIdx = SOJA_PHENOLOGICAL_STAGES.findIndex(
      s => dap >= s.dapRange[0] && dap <= s.dapRange[1]
    );
    if (stageIdx === -1) {
      if (dap < SOJA_PHENOLOGICAL_STAGES[0].dapRange[0]) {
        stageIdx = 0;
      } else {
        const nextIdx = SOJA_PHENOLOGICAL_STAGES.findIndex(s => dap < s.dapRange[0]);
        stageIdx = nextIdx === -1 ? SOJA_PHENOLOGICAL_STAGES.length - 1 : Math.max(0, nextIdx - 1);
      }
    }

    const activeStage = SOJA_PHENOLOGICAL_STAGES[stageIdx];
    const nextStage = SOJA_PHENOLOGICAL_STAGES[Math.min(stageIdx + 1, SOJA_PHENOLOGICAL_STAGES.length - 1)];
    const daysToNext = Math.max(1, nextStage.dapRange[0] - dap);

    const createdTwin: CropDigitalTwin = {
      id: `twin-${Date.now()}`,
      farmId: selectedFarm?.id || 'farm-01',
      farmName: selectedFarm?.name || 'Fazenda Principal',
      plotId: `plot-${Date.now()}`,
      plotName: formData.plotName.trim() || 'Talhão Principal',
      plotAreaHa: Number(formData.plotAreaHa) || 1,
      crop: formData.crop,
      cropName: CROP_LABELS[formData.crop] || 'Soja Grão',
      cultivarName: formData.cultivarName.trim() || 'Cultivar Registrada',
      cycleDays,
      plantingDate: formData.plantingDate,
      emergenceDate: formData.plantingDate,
      spacingMeters: Number(formData.spacingMeters) || 0.45,
      plantPopulationPerHa: Number(formData.plantPopulationPerHa) || 250000,
      cultivationSystem: formData.cultivationSystem,
      soilTexture: formData.soilTexture,
      irrigationType: formData.irrigationType,
      currentDap: dap,
      currentStageId: activeStage.id,
      currentStageCode: activeStage.code,
      currentStageName: activeStage.name,
      cycleProgressPercent: cycleProgress,
      expectedHarvestDate: new Date(plantingTime + cycleDays * 86400000).toISOString().split('T')[0],
      accumulatedGdd: Math.round(dap * 14.5),
      targetGdd: 1480,
      idcScore: 95,
      idcStatus: 'dentro_do_esperado',
      nextStageCode: nextStage.code,
      daysToNextStage: daysToNext,
      limitingFactors: [],
      notes: 'Lavoura cadastrada no monitoramento fenológico.'
    };

    onSave(createdTwin);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cadastrar Nova Lavoura no Monitoramento</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Identificação do Talhão</label>
              <input
                type="text"
                required
                value={formData.plotName}
                onChange={e => setFormData(prev => ({ ...prev, plotName: e.target.value }))}
                placeholder="Ex: Talhão 08 - Pivô Central"
                className={inputClass}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Área Cultivada (ha)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.plotAreaHa || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, plotAreaHa: parseFloat(e.target.value) || 0 }))
                }
                className={`${inputClass} tabular-nums`}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Cultura</label>
              <select
                value={formData.crop}
                onChange={e => setFormData(prev => ({ ...prev, crop: e.target.value as CropType }))}
                className={inputClass}
              >
                <option value="soja">Soja (Glycine max)</option>
                <option value="milho">Milho (Zea mays)</option>
                <option value="algodao">Algodão</option>
                <option value="feijao">Feijão</option>
                <option value="trigo">Trigo</option>
                <option value="cafe">Café</option>
                <option value="cana">Cana-de-açúcar</option>
                <option value="hortalicas">Hortaliças</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Cultivar / Variedade</label>
              <input
                type="text"
                required
                value={formData.cultivarName}
                onChange={e => setFormData(prev => ({ ...prev, cultivarName: e.target.value }))}
                placeholder="Ex: TMG 2381 IPRO"
                className={inputClass}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Data de Plantio</label>
              <input
                type="date"
                required
                value={formData.plantingDate}
                onChange={e => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                className={`${inputClass} tabular-nums`}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Ciclo Médio (dias)</label>
              <input
                type="number"
                min="60"
                max="365"
                required
                value={formData.cycleDays || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, cycleDays: parseInt(e.target.value, 10) || 120 }))
                }
                className={`${inputClass} tabular-nums`}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Espaçamento (m)</label>
              <input
                type="number"
                step="0.05"
                min="0.2"
                max="2.0"
                required
                value={formData.spacingMeters || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    spacingMeters: parseFloat(e.target.value) || 0.45
                  }))
                }
                className={`${inputClass} tabular-nums`}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">População Alvo (pl/ha)</label>
              <input
                type="number"
                step="5000"
                min="1000"
                max="1000000"
                required
                value={formData.plantPopulationPerHa || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    plantPopulationPerHa: parseInt(e.target.value, 10) || 250000
                  }))
                }
                className={`${inputClass} tabular-nums`}
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Sistema de Cultivo</label>
              <select
                value={formData.cultivationSystem}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    cultivationSystem: e.target.value as CultivationSystem
                  }))
                }
                className={inputClass}
              >
                <option value="plantio_direto">Plantio Direto na Palha</option>
                <option value="convencional">Cultivo Convencional</option>
                <option value="cultivo_minimo">Cultivo Mínimo</option>
                <option value="organico">Orgânico</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Textura do Solo</label>
              <select
                value={formData.soilTexture}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    soilTexture: e.target.value as SoilTextureType
                  }))
                }
                className={inputClass}
              >
                <option value="argiloso">Argiloso</option>
                <option value="medio_franco">Médio / Franco</option>
                <option value="arenoso">Arenoso</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-medium text-slate-600 dark:text-zinc-300">Sistema de Irrigação</label>
              <select
                value={formData.irrigationType}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    irrigationType: e.target.value as IrrigationType
                  }))
                }
                className={inputClass}
              >
                <option value="sequeiro">Sequeiro (Sem Irrigação)</option>
                <option value="pivo_central">Pivô Central</option>
                <option value="gotejamento">Gotejamento</option>
                <option value="aspersao_convencional">Aspersão Convencional</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
            >
              Ativar Monitoramento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
