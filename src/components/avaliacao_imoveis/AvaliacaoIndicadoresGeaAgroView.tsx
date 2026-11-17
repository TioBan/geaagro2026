import React from 'react';
import { IndicadoresExclusivosGeaAgro } from '../../types/avaliacaoImoveis';
import {
  Sparkles,
  Building,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  indicadores: IndicadoresExclusivosGeaAgro;
  propriedadeNome: string;
}

export const AvaliacaoIndicadoresGeaAgroView: React.FC<Props> = ({
  indicadores,
  propriedadeNome
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-500/30 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Inteligência Exclusiva GeaAgro
          </span>
          <span className="text-xs text-slate-400">Rural Property Scorecard</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Índices Proprietários GeaAgro • {propriedadeNome}
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          Matriz multidimensional desenvolvida para quantificar vocação produtiva, estado de conservação, consistência mercadológica e equilíbrio fundiário.
        </p>
      </div>

      {/* Grid dos 4 Índices GeaAgro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. IPR */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IPR - Potencial Rural</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {indicadores.iprScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 block mt-0.5">
              {indicadores.iprClassificacao}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${indicadores.iprScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Avalia classe de solo, mecanização, disponibilidade de água e histórico produtivo.
          </p>
        </div>

        {/* 2. ICV */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ICV - Conservação</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {indicadores.icvScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-xs font-bold text-blue-600 block mt-0.5">
              {indicadores.icvClassificacao}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${indicadores.icvScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Mede a integridade física média das construções calculada via Ross-Heidecke.
          </p>
        </div>

        {/* 3. IGM */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IGM - Mercado</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {indicadores.igmScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-xs font-bold text-amber-600 block mt-0.5">
              {indicadores.igmClassificacao}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${indicadores.igmScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Homogeneidade dos dados de mercado e coeficiente de variação amostral.
          </p>
        </div>

        {/* 4. IGT */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IGT - Territorial</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {indicadores.igtScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-xs font-bold text-purple-600 block mt-0.5">
              {indicadores.igtClassificacao}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${indicadores.igtScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Proporção de uso eficiente do solo entre lavouras e conformidade ambiental (CAR).
          </p>
        </div>
      </div>

      {/* Pontos Fortes e Pontos de Atenção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pontos Fortes */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            Pontos Fortes Identificados no Diagnóstico
          </h3>
          <ul className="space-y-2">
            {indicadores.pontosFortes.map((pf, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{pf}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pontos de Atenção */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            Pontos de Atenção & Recomendações Periciais
          </h3>
          <ul className="space-y-2">
            {indicadores.pontosAtencao.map((pa, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{pa}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
