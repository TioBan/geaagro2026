import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { AIDomain } from './types';

interface NemaAIContextFormProps {
  activeDomain: AIDomain;
  farmName: string;
  setFarmName: (v: string) => void;
  producerName: string;
  setProducerName: (v: string) => void;
  fieldName: string;
  setFieldName: (v: string) => void;
  areaHa: number;
  setAreaHa: (v: number) => void;
  cropOrPasture: string;
  setCropOrPasture: (v: string) => void;
  cultivarOrForage: string;
  setCultivarOrForage: (v: string) => void;
  soilType: string;
  setSoilType: (v: string) => void;
  carryingCapacity: number;
  setCarryingCapacity: (v: number) => void;
  gmdTarget: number;
  setGmdTarget: (v: number) => void;
  batchAgeDays: number;
  setBatchAgeDays: (v: number) => void;
  feedConversion: number;
  setFeedConversion: (v: number) => void;
  soilSamplesCount: number;
}

export const NemaAIContextForm: React.FC<NemaAIContextFormProps> = ({
  activeDomain,
  farmName,
  setFarmName,
  producerName,
  setProducerName,
  fieldName,
  setFieldName,
  areaHa,
  setAreaHa,
  cropOrPasture,
  setCropOrPasture,
  cultivarOrForage,
  setCultivarOrForage,
  soilType,
  setSoilType,
  carryingCapacity,
  setCarryingCapacity,
  gmdTarget,
  setGmdTarget,
  batchAgeDays,
  setBatchAgeDays,
  feedConversion,
  setFeedConversion,
  soilSamplesCount,
}) => {
  const inputClass =
    'w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-emerald-500';
  const labelClass = 'block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 mb-1';

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Contexto Técnico da Propriedade / Lote
        </h4>
        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
          {soilSamplesCount} laudo(s) de solo vinculado(s)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>Fazenda / Unidade</label>
          <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Produtor / Técnico</label>
          <input type="text" value={producerName} onChange={(e) => setProducerName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Talhão / Piquete / Galpão</label>
          <input type="text" value={fieldName} onChange={(e) => setFieldName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Área (ha)</label>
          <input
            type="number"
            value={areaHa}
            onChange={(e) => setAreaHa(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            {activeDomain === 'pecuaria' ? 'Espécie / Pastagem' : 'Cultura / Atividade'}
          </label>
          <input
            type="text"
            value={cropOrPasture}
            onChange={(e) => setCropOrPasture(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            {activeDomain === 'pecuaria' ? 'Forrageira / Raça' : 'Cultivar / Clone / Linhagem'}
          </label>
          <input
            type="text"
            value={cultivarOrForage}
            onChange={(e) => setCultivarOrForage(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Textura do Solo</label>
          <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className={inputClass}>
            <option value="Argiloso">Argiloso (&gt;35% argila)</option>
            <option value="Muito Argiloso">Muito Argiloso (&gt;60% argila)</option>
            <option value="Misto">Misto / Franco (15-35% argila)</option>
            <option value="Arenoso">Arenoso (&lt;15% argila)</option>
          </select>
        </div>

        {activeDomain === 'pecuaria' ? (
          <>
            <div>
              <label className={labelClass}>Lotação (UA/ha)</label>
              <input
                type="number"
                step="0.1"
                value={carryingCapacity}
                onChange={(e) => setCarryingCapacity(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Meta GMD (kg/dia)</label>
              <input
                type="number"
                step="0.05"
                value={gmdTarget}
                onChange={(e) => setGmdTarget(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </>
        ) : activeDomain === 'avicultura' ? (
          <>
            <div>
              <label className={labelClass}>Idade do Lote (dias)</label>
              <input
                type="number"
                value={batchAgeDays}
                onChange={(e) => setBatchAgeDays(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Conversão Alimentar (CA)</label>
              <input
                type="number"
                step="0.01"
                value={feedConversion}
                onChange={(e) => setFeedConversion(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
