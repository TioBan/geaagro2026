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
  const cards = [
    {
      sigla: 'IPR · Potencial Rural',
      score: indicadores.iprScore,
      classificacao: indicadores.iprClassificacao,
      descricao: 'Avalia classe de solo, mecanização, disponibilidade de água e histórico produtivo.',
      icon: Sparkles,
      textTone: 'text-emerald-600 dark:text-emerald-400',
      barTone: 'bg-emerald-500'
    },
    {
      sigla: 'ICV · Conservação',
      score: indicadores.icvScore,
      classificacao: indicadores.icvClassificacao,
      descricao: 'Mede a integridade física média das construções calculada via Ross-Heidecke.',
      icon: Building,
      textTone: 'text-sky-600 dark:text-sky-400',
      barTone: 'bg-sky-500'
    },
    {
      sigla: 'IGM · Mercado',
      score: indicadores.igmScore,
      classificacao: indicadores.igmClassificacao,
      descricao: 'Homogeneidade dos dados de mercado e coeficiente de variação amostral.',
      icon: TrendingUp,
      textTone: 'text-amber-600 dark:text-amber-400',
      barTone: 'bg-amber-500'
    },
    {
      sigla: 'IGT · Territorial',
      score: indicadores.igtScore,
      classificacao: indicadores.igtClassificacao,
      descricao: 'Proporção de uso eficiente do solo entre lavouras e conformidade ambiental (CAR).',
      icon: Layers,
      textTone: 'text-violet-600 dark:text-violet-400',
      barTone: 'bg-violet-500'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Cabeçalho + Faixa dos 4 Índices */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="p-5 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
              Inteligência GeaAgro
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              Scorecard Multidimensional
            </span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
            Índices Proprietários · {propriedadeNome || 'Imóvel Rural'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl">
            Matriz técnica para quantificar vocação produtiva, estado de conservação, consistência mercadológica e equilíbrio fundiário.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-200/80 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
          {cards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.sigla} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    {item.sigla}
                  </span>
                  <Icon className={`w-4 h-4 ${item.textTone}`} />
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold tabular-nums ${item.textTone}`}>
                      {item.score}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">/ 100</span>
                  </div>
                  <span className={`text-xs font-medium block mt-0.5 ${item.textTone}`}>
                    {item.classificacao}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-sm overflow-hidden">
                  <div
                    className={`${item.barTone} h-full transition-all`}
                    style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {item.descricao}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pontos Fortes e Pontos de Atenção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            Pontos Fortes Identificados
          </h3>
          {indicadores.pontosFortes.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Preencha os dados do imóvel, solos e mercado para consolidar o diagnóstico.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {indicadores.pontosFortes.map((pf, idx) => (
                <li key={idx} className="py-2 first:pt-0 last:pb-0 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {pf}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            Pontos de Atenção & Recomendações
          </h3>
          {indicadores.pontosAtencao.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhum alerta técnico identificado com os dados atuais.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {indicadores.pontosAtencao.map((pa, idx) => (
                <li key={idx} className="py-2 first:pt-0 last:pb-0 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {pa}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
