import React from 'react';
import { BuffaloPaddock } from '../../types/buffalo';
import {
  Sprout,
  Compass,
  Layers3,
  Sun,
  Droplets,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface BuffaloPasturesViewProps {
  paddocks: BuffaloPaddock[];
}

export const BuffaloPasturesView: React.FC<BuffaloPasturesViewProps> = ({ paddocks }) => {
  const totalAreaHa = paddocks.reduce((acc, p) => acc + p.areaHa, 0);
  const totalAnimalsGrazing = paddocks.reduce((acc, p) => acc + p.currentAnimalCount, 0);
  const avgStockingRate = paddocks.reduce((acc, p) => acc + p.currentStockingRateUaHa, 0) / (paddocks.length || 1);

  return (
    <div className="space-y-6">
      {/* Top Banner de Métricas de Pastagem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Área Total de Pastagens</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalAreaHa} <span className="text-sm font-bold text-slate-400">ha</span></div>
          <span className="text-xs text-slate-500">{paddocks.length} piquetes rotacionados</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Taxa de Lotação Média</span>
          <div className="text-3xl font-black text-emerald-600">{avgStockingRate.toFixed(1)} <span className="text-sm font-bold text-slate-400">UA/ha</span></div>
          <span className="text-xs text-teal-600 font-bold">Alta capacidade de suporte</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Búfalos em Pastejo</span>
          <div className="text-3xl font-black text-blue-600">{totalAnimalsGrazing}</div>
          <span className="text-xs text-slate-500">Distribuição zootécnica por lote</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Sombreamento Médio</span>
          <div className="text-3xl font-black text-amber-600">25%</div>
          <span className="text-xs text-slate-500">Árvores nativas + sombrites</span>
        </div>
      </div>

      {/* Lista de Piquetes Cadastrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paddocks.map((paddock) => (
          <div
            key={paddock.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold rounded-md">
                  {paddock.status}
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white mt-1.5">{paddock.name}</h4>
                <p className="text-xs text-slate-500">{paddock.forageSpecies}</p>
              </div>
              <span className="text-xs font-black text-emerald-600">{paddock.areaHa} ha</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Altura Atual</span>
                <span className="font-black text-slate-900 dark:text-white">{paddock.currentCanopyHeightCm} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Entrada / Saída</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{paddock.entryCanopyHeightCm} / {paddock.exitCanopyHeightCm} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lotação</span>
                <span className="font-black text-teal-600">{paddock.currentStockingRateUaHa} UA/ha</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Animais no Piquete</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{paddock.currentAnimalCount} cabeças</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Acesso Hídrico</span>
                <span className="font-bold text-blue-600">{paddock.waterPointType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Sombra</span>
                <span className="font-bold text-amber-600">{paddock.shadeAreaPct}% da área</span>
              </div>
            </div>

            {paddock.notes && (
              <p className="text-xs text-slate-600 dark:text-zinc-400 pt-1">
                {paddock.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
