import React from 'react';
import { RuralProducer } from '../../types/agronomy';

interface DashboardHeaderBannerProps {
  producer?: RuralProducer;
  totalFarmsCount: number;
  totalAreaHa: number;
  totalCultivatedAreaHa: number;
}

export const DashboardHeaderBanner: React.FC<DashboardHeaderBannerProps> = ({
  producer,
  totalFarmsCount,
  totalAreaHa,
  totalCultivatedAreaHa,
}) => {
  return (
    <div className="relative bg-gradient-to-r from-emerald-800 to-teal-950 dark:from-zinc-900 dark:to-zinc-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-700/20 dark:border-zinc-800 overflow-hidden">
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Painel Principal do Produtor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Olá, <span className="text-emerald-400">{producer?.name || 'Produtor Rural'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-medium leading-relaxed">
            Bem-vindo ao seu painel consolidado. Monitore a saúde do solo de suas propriedades e tome decisões ágeis de calagem e nutrição para maximizar seu rendimento agrícola.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/5 dark:bg-black/25 backdrop-blur-xs p-4 rounded-xl border border-white/10 dark:border-zinc-800 shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] text-emerald-200/60 block font-bold">Propriedades</span>
            <strong className="text-xl font-black text-white">{totalFarmsCount}</strong>
          </div>
          <div className="text-center px-2 border-x border-white/10 dark:border-zinc-800/80">
            <span className="text-[10px] text-emerald-200/60 block font-bold">Área Total</span>
            <strong className="text-xl font-black text-white">
              {totalAreaHa.toLocaleString('pt-BR')} <span className="text-xs font-normal">ha</span>
            </strong>
          </div>
          <div className="text-center px-2">
            <span className="text-[10px] text-emerald-200/60 block font-bold">Cultivada</span>
            <strong className="text-xl font-black text-emerald-400">
              {totalCultivatedAreaHa.toLocaleString('pt-BR')} <span className="text-xs font-normal">ha</span>
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
