import React, { useState } from 'react';
import {
  Award,
  Sparkles,
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

interface SwineIESScoreViewProps {
  iesScore: SwineIESScore;
}

export const SwineIESScoreView: React.FC<SwineIESScoreViewProps> = ({
  iesScore,
}) => {
  // Simulator inputs
  const [simFeedConv, setSimFeedConv] = useState(2.3);
  const [simGmd, setSimGmd] = useState(850);
  const [simMort, setSimMort] = useState(2.5);
  const [simDpa, setSimDpa] = useState(31.0);

  // Calculate simulated score
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Métrica Exclusiva de Desempenho GeaAgro</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">
            Índice de Eficiência Suinícola (IES)
          </h2>
          <p className="text-xs text-gray-500">
            Algoritmo multivariável que pondera conversão alimentar, ganho de peso, sobrevivência, produtividade de fêmea, ambiência e biossegurança.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Classificação Atual:</span>
          <span className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-xl text-xs font-black shadow-xs">
            {iesScore.classification}
          </span>
        </div>
      </div>

      {/* Main Score & Component Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Huge Score Badge */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-pink-500 via-rose-600 to-pink-700 text-white flex flex-col items-center justify-center shadow-xl shadow-pink-600/30 p-2 border-4 border-white">
            <Award className="w-8 h-8 text-amber-300" />
            <span className="text-3xl font-black mt-0.5">{iesScore.totalScore}</span>
            <span className="text-[10px] font-bold text-pink-100 uppercase tracking-wider">Pontos / 100</span>
          </div>

          <div>
            <h3 className="text-base font-black text-gray-900">
              {iesScore.totalScore >= 90
                ? 'Granja Padrão Ouro'
                : iesScore.totalScore >= 75
                ? 'Alta Performance'
                : 'Atenção Zootécnica'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              {iesScore.totalScore >= 80
                ? 'O plantel opera com índices de conversão e sobrevivência de destaque nacional.'
                : 'Oportunidades identificadas nos pilares de conversão, ambiência e manejo.'}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-gray-100 text-xs text-gray-600 space-y-1 text-left">
            <div className="flex justify-between">
              <span>Classificação:</span>
              <span className="font-bold text-gray-900">{iesScore.classification}</span>
            </div>
          </div>
        </div>

        {/* Right: Dimension Bars */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Composição Ponderada do IES (6 Pilares)
            </h3>
            <span className="text-xs text-gray-400 font-medium">Peso Máx: 100 pts</span>
          </div>

          <div className="space-y-4">
            {/* 1. Feed Conversion */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-pink-600" />
                  1. Conversão Alimentar Granja (Peso 25%)
                </span>
                <span className="text-pink-600">{iesScore.feedConversionScore} / 25 pts</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-600 rounded-full"
                  style={{ width: `${(iesScore.feedConversionScore / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. GMD */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  2. Ganho Médio Diário (GMD) (Peso 20%)
                </span>
                <span className="text-emerald-600">{iesScore.gmdScore} / 20 pts</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${(iesScore.gmdScore / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. Mortality */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  3. Taxa de Sobrevivência & Mortalidade (Peso 20%)
                </span>
                <span className="text-blue-600">{iesScore.mortalityScore} / 20 pts</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(iesScore.mortalityScore / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. Reproduction */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  4. Eficiência Reprodutiva (Desm./Fêmea/Ano) (Peso 15%)
                </span>
                <span className="text-rose-600">{iesScore.reproductiveEfficiencyScore} / 15 pts</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full"
                  style={{ width: `${(iesScore.reproductiveEfficiencyScore / 15) * 100}%` }}
                />
              </div>
            </div>

            {/* 5. Environment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                  5. Ambiência & Conforto Térmico (Peso 10%)
                </span>
                <span className="text-amber-600">{iesScore.environmentComfortScore} / 10 pts</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{ width: `${(iesScore.environmentComfortScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* 6. Biosecurity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  6. Biosseguridade & Barreiras Sanitárias (Peso 10%)
                </span>
                <span className="text-emerald-600">{iesScore.biosecurityComplianceScore} / 10 pts</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${(iesScore.biosecurityComplianceScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-600" />
              <span>Simulador Preditivo de Otimização Zootécnica</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ajuste as variáveis zootécnicas para simular o ganho de pontuação IES e o impacto na rentabilidade da granja.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-gray-500 font-semibold block">IES Simulado</span>
            <span className="text-2xl font-black text-pink-600">{simulatedIES} pts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Conversão Alimentar</span>
              <span className="text-pink-600">{simFeedConv.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={1.8}
              max={3.0}
              step={0.05}
              value={simFeedConv}
              onChange={e => setSimFeedConv(parseFloat(e.target.value))}
              className="w-full accent-pink-600"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>GMD Global (g/dia)</span>
              <span className="text-emerald-600">{simGmd} g</span>
            </div>
            <input
              type="range"
              min={500}
              max={1050}
              step={10}
              value={simGmd}
              onChange={e => setSimGmd(parseInt(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Mortalidade (%)</span>
              <span className="text-rose-600">{simMort.toFixed(1)}%</span>
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

          <div className="p-4 bg-gray-50 rounded-2xl border space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Desm./Fêmea/Ano (DPA)</span>
              <span className="text-blue-600">{simDpa.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={22}
              max={36}
              step={0.5}
              value={simDpa}
              onChange={e => setSimDpa(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {iesScore.keyRecommendations && iesScore.keyRecommendations.length > 0 && (
        <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-pink-950 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-pink-600" />
            <span>Recomendações Técnicas Estratégicas para Elevar o IES</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {iesScore.keyRecommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 bg-white rounded-2xl border border-pink-100 text-xs text-gray-800 flex items-start gap-2.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
