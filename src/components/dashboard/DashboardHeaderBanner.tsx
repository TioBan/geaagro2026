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
  const occupationPct =
    totalAreaHa > 0 ? Math.round((totalCultivatedAreaHa / totalAreaHa) * 100) : 0;

  return (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Painel consolidado
          </p>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            Olá, {producer?.name || 'Produtor Rural'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            Acompanhe a fertilidade do solo, operações de campo, recomendações técnicas e condições climáticas das suas propriedades.
          </p>
        </div>

        <div className="grid grid-cols-3 border border-slate-200 dark:border-zinc-800 rounded-lg divide-x divide-slate-200 dark:divide-zinc-800 shrink-0 tabular-nums">
          <div className="px-4 py-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Propriedades
            </span>
            <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              {totalFarmsCount}
            </strong>
          </div>
          <div className="px-4 py-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Área total
            </span>
            <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              {totalAreaHa.toLocaleString('pt-BR')}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">ha</span>
            </strong>
          </div>
          <div className="px-4 py-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Cultivada ({occupationPct}%)
            </span>
            <strong className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {totalCultivatedAreaHa.toLocaleString('pt-BR')}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">ha</span>
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
};
