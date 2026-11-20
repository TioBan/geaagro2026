import React, { useState } from 'react';
import {
  Award,
  Scale,
  TrendingUp,
  Activity,
  Heart,
  Thermometer,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { SwineIESScore } from '../../types/swine';
import { SWINE_CARD_CLASS, SWINE_SUBCARD_CLASS } from './swineUi';

interface SwineIESScoreViewProps {
  iesScore: SwineIESScore;
}

export const SwineIESScoreView: React.FC<SwineIESScoreViewProps> = ({ iesScore }) => {
  const [simFeedConv, setSimFeedConv] = useState(2.3);
  const [simGmd, setSimGmd] = useState(850);
  const [simMort, setSimMort] = useState(2.5);
  const [simDpa, setSimDpa] = useState(31.0);

  const simFeedScore = Math.max(5, Math.min(25, 25 - (simFeedConv - 1.8) * 20));
  const simGmdScore = Math.max(5, Math.min(20, ((simGmd - 400) / 550) * 20));
  const simMortScore = Math.max(2, Math.min(20, 20 - simMort * 3.5));
  const simReproScore = Math.max(3, Math.min(15, ((simDpa - 22) / 10) * 15));
  const simulatedIES = Math.round(
    Math.min(
      100,
      Math.max(
        0,
        simFeedScore +
          simGmdScore +
          simMortScore +
          simReproScore +
          iesScore.environmentComfortScore +
          iesScore.biosecurityComplianceScore
      )
    )
  );

  const pillars = [
    {
      label: '1. Conversão Alimentar (25%)',
      score: iesScore.feedConversionScore,
      max: 25,
      icon: Scale,
      barClass: 'bg-rose-600',
    },
    {
      label: '2. Ganho Médio Diário — GMD (20%)',
      score: iesScore.gmdScore,
      max: 20,
      icon: TrendingUp,
      barClass: 'bg-emerald-600',
    },
    {
      label: '3. Sobrevivência & Mortalidade (20%)',
      score: iesScore.mortalityScore,
      max: 20,
      icon: Activity,
      barClass: 'bg-sky-600',
    },
    {
      label: '4. Eficiência Reprodutiva — DPA (15%)',
      score: iesScore.reproductiveEfficiencyScore,
      max: 15,
      icon: Heart,
      barClass: 'bg-rose-500',
    },
    {
      label: '5. Ambiência & Conforto Térmico (10%)',
      score: iesScore.environmentComfortScore,
      max: 10,
      icon: Thermometer,
      barClass: 'bg-amber-500',
    },
    {
      label: '6. Biosseguridade & Barreiras (10%)',
      score: iesScore.biosecurityComplianceScore,
      max: 10,
      icon: ShieldCheck,
      barClass: 'bg-emerald-500',
    },
  ];

  const hasData = iesScore.totalScore > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Índice de Eficiência Suinícola (IES)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Ponderação de conversão alimentar, GMD, mortalidade, DPA, ambiência e biosseguridade (0–100 pts).
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold shrink-0">
          {hasData ? iesScore.classification : 'Sem dados operacionais'}
        </span>
      </div>

      {/* Main Score & Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${SWINE_CARD_CLASS} p-5 flex flex-col items-center justify-center text-center space-y-3`}>
          <div className="w-24 h-24 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col items-center justify-center">
            <Award className="w-5 h-5 text-rose-600 dark:text-rose-400 mb-0.5" />
            <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
              {iesScore.totalScore}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">de 100 pts</span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {!hasData
                ? 'Aguardando Lançamentos'
                : iesScore.totalScore >= 90
                  ? 'Granja Padrão Ouro'
                  : iesScore.totalScore >= 75
                    ? 'Alta Performance'
                    : 'Atenção Zootécnica'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs">
              {!hasData
                ? 'Cadastre lotes, partos, leituras de ambiência e auditorias para gerar o score real.'
                : iesScore.totalScore >= 80
                  ? 'Plantel operando com boa eficiência zootécnica nos pilares monitorados.'
                  : 'Oportunidades identificadas nos pilares abaixo para elevar a eficiência.'}
            </p>
          </div>
        </div>

        <div className={`lg:col-span-2 ${SWINE_CARD_CLASS} p-4 space-y-3.5`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Composição Ponderada (6 Pilares)
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Máx. 100 pts</span>
          </div>

          <div className="space-y-3">
            {pillars.map(p => {
              const Icon = p.icon;
              const pct = Math.min(100, (p.score / p.max) * 100);
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                      {p.label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {p.score} / {p.max} pts
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                    <div className={`h-full ${p.barClass}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulator */}
      <div className={`${SWINE_CARD_CLASS} p-4 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Simulador de Cenários IES</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ajuste CA, GMD, mortalidade e DPA para projetar o impacto no índice geral.
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">IES Projetado</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {simulatedIES} pts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-2`}>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-zinc-300">Conversão (CA)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                {simFeedConv.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={1.8}
              max={3.0}
              step={0.05}
              value={simFeedConv}
              onChange={e => setSimFeedConv(parseFloat(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-2`}>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-zinc-300">GMD Global</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {simGmd} g/d
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={1050}
              step={10}
              value={simGmd}
              onChange={e => setSimGmd(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-2`}>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-zinc-300">Mortalidade</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                {simMort.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6.0}
              step={0.1}
              value={simMort}
              onChange={e => setSimMort(parseFloat(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-2`}>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-zinc-300">Desm./Matriz/Ano</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                {simDpa.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={22}
              max={36}
              step={0.5}
              value={simDpa}
              onChange={e => setSimDpa(parseFloat(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {iesScore.keyRecommendations.length > 0 && (
        <div className={`${SWINE_CARD_CLASS} p-4 space-y-2.5`}>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Recomendações Técnicas</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {iesScore.keyRecommendations.map(rec => (
              <div
                key={rec}
                className={`${SWINE_SUBCARD_CLASS} p-3 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
