import React from 'react';
import { Sprout, Heart } from 'lucide-react';
import { handleAgroLogoClick } from '../../utils/agroEasterEgg';

export const AboutHeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 text-center shadow-xs">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Main App Icon with Easter Egg */}
        <div
          className="relative group cursor-pointer select-none"
          onClick={(e) => handleAgroLogoClick(e)}
          title="Toque no ícone da GeaAgro!"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-600 dark:to-teal-900 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-100 dark:ring-emerald-950/60 transition-transform duration-200 group-hover:scale-105 active:scale-95 overflow-hidden p-2">
            <img
              src="/icon.png"
              alt="GeaAgro Logo"
              className="w-full h-full object-contain rounded-xl pointer-events-none"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <Sprout className="w-11 h-11 sm:w-13 sm:h-13 pointer-events-none" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs border border-white dark:border-black flex items-center gap-1">
            <Sprout className="w-3 h-3" />
            <span>v4.2.3.4</span>
          </div>
        </div>

        {/* App Title & Subtitle */}
        <div className="space-y-1 pt-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            GeaAgro CRM 4.2.3.4
          </h1>
          <p className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-400 max-w-lg mx-auto">
            Plataforma de Inteligência Agronômica, Agricultura de Precisão e Gestão Rural Integrada
          </p>
        </div>

        {/* Prominent Dedication Card */}
        <div className="w-full max-w-xl mx-auto pt-2">
          <div className="bg-white dark:bg-black/90 border-2 border-emerald-500/40 dark:border-emerald-500/50 rounded-xl p-4 sm:p-5 shadow-sm relative">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
              <span>Dedicatória Especial</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
              <span>Desenvolvido por</span>
              <a
                href="https://www.instagram.com/fatiima.leao/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Instagram: @fatiima.leao"
              >
                Fátima Leão
              </a>
              <span>&amp;</span>
              <a
                href="https://www.instagram.com/lucas.agrobr/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Instagram: @lucas.agrobr"
              >
                Lucas Mendes
              </a>
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
              Construído com dedicação, rigor científico e paixão pela inovação no agronegócio brasileiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
