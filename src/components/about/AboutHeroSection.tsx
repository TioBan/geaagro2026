import React from 'react';
import { Sprout, Heart } from 'lucide-react';
import { handleAgroLogoClick } from '../../utils/agroEasterEgg';

export const AboutHeroSection: React.FC = () => {
  return (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-start gap-3.5 min-w-0">
        <button
          type="button"
          onClick={e => handleAgroLogoClick(e)}
          title="Toque no ícone da GeaAgro"
          className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 overflow-hidden p-1.5 hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <img
            src="/icon.png"
            alt="GeaAgro Logo"
            className="w-full h-full object-contain rounded-lg pointer-events-none"
            onError={e => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <Sprout className="w-6 h-6 pointer-events-none" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
              GeaAgro CRM
            </h2>
            <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
              v4.2.3.8
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl leading-relaxed">
            Plataforma de Inteligência Agronômica, Agricultura de Precisão e Gestão Rural Integrada.
          </p>
        </div>
      </div>

      {/* Dedicatória limpa sem caixa aninhada pesada */}
      <div className="pt-3 md:pt-0 md:pl-5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 shrink-0 space-y-0.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
          <span>Dedicatória Especial</span>
        </div>
        <p className="text-xs font-semibold text-slate-900 dark:text-white">
          Desenvolvido por{' '}
          <a
            href="https://www.instagram.com/fatiima.leao/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-400 hover:underline"
            title="Instagram: @fatiima.leao"
          >
            Fátima Leão
          </a>
        </p>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs">
          Rigor científico e dedicação à inovação no agronegócio brasileiro.
        </p>
      </div>
    </section>
  );
};
