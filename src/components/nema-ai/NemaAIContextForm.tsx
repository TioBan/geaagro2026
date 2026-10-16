import React from 'react';
import { Compass } from 'lucide-react';
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
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-fade-in text-xs">
      <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
        <Compass className="w-4 h-4 text-amber-500" />
        Parâmetros de Entrada da Fazenda (Contexto da IA)
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">FAZENDA / PLANTAÇÃO</label>
          <input
            type="text"
            value={farmName}
            onChange={e => setFarmName(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">PRODUTOR</label>
          <input
            type="text"
            value={producerName}
            onChange={e => setProducerName(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">TALHÃO / LOTE</label>
          <input
            type="text"
            value={fieldName}
            onChange={e => setFieldName(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">ÁREA (HA)</label>
          <input
            type="number"
            value={areaHa}
            onChange={e => setAreaHa(Number(e.target.value))}
            className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">
            {activeDomain === 'pecuaria' ? 'ESPÉCIE DE PASTAGEM' : 'CULTURA ATUAL'}
          </label>
          <input
            type="text"
            value={cropOrPasture}
            onChange={e => setCropOrPasture(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">
            {activeDomain === 'pecuaria' ? 'FORRAGEIRA / VARIEDADE' : 'CULTIVAR / LINHAGEM'}
          </label>
          <input
            type="text"
            value={cultivarOrForage}
            onChange={e => setCultivarOrForage(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1">TEXTURA DO SOLO</label>
          <select
            value={soilType}
            onChange={e => setSoilType(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
          >
            <option value="Argiloso">Argiloso (&gt;35% argila)</option>
            <option value="Muito Argiloso">Muito Argiloso (&gt;60% argila)</option>
            <option value="Misto">Misto / Franco (15-35% argila)</option>
            <option value="Arenoso">Arenoso (&lt;15% argila)</option>
          </select>
        </div>

        {activeDomain === 'pecuaria' ? (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">TAXA LOTAÇÃO (UA/HA)</label>
              <input
                type="number"
                step="0.1"
                value={carryingCapacity}
                onChange={e => setCarryingCapacity(Number(e.target.value))}
                className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">META DE GMD (KG/DIA)</label>
              <input
                type="number"
                step="0.05"
                value={gmdTarget}
                onChange={e => setGmdTarget(Number(e.target.value))}
                className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
              />
            </div>
          </>
        ) : activeDomain === 'avicultura' ? (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">IDADE DO LOTE (DIAS)</label>
              <input
                type="number"
                value={batchAgeDays}
                onChange={e => setBatchAgeDays(Number(e.target.value))}
                className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">CONVERSÃO ALIMENTAR (CA)</label>
              <input
                type="number"
                step="0.01"
                value={feedConversion}
                onChange={e => setFeedConversion(Number(e.target.value))}
                className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 font-bold"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">LAUDOS DE SOLO ATIVOS</label>
            <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-[11px] font-bold text-slate-700 dark:text-zinc-300">
              {soilSamplesCount} laudos vinculados
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
