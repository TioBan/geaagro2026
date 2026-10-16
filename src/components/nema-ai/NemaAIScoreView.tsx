import React from 'react';
import { Activity, Sliders, ShieldCheck, Bot } from 'lucide-react';
import { NemaIAScoreCard } from '../NemaIAScoreCard';
import { InfestationRisk } from '../../types/nematology';
import { CentralAIAnalysisResult } from './types';

interface NemaAIScoreViewProps {
  currentField?: any;
  soilType: string;
  cropOrPasture: string;
  loading: boolean;
  analysisResult: CentralAIAnalysisResult | null;
  onRunAIScore: () => void;
}

export const NemaAIScoreView: React.FC<NemaAIScoreViewProps> = ({
  currentField,
  soilType,
  cropOrPasture,
  loading,
  analysisResult,
  onRunAIScore,
}) => {
  const aiScoreData = analysisResult?.nemaIAScore
    ? {
        score: analysisResult.nemaIAScore.score,
        riskLevel: (analysisResult.nemaIAScore.riskLevel as InfestationRisk) || 'Moderada',
        executiveSummary: analysisResult.nemaIAScore.interpretation,
        subScores: analysisResult.nemaIAScore.subScores,
      }
    : analysisResult
    ? {
        score: analysisResult.riskScorePercentage,
        riskLevel: (analysisResult.riskLevel as InfestationRisk) || 'Moderada',
        executiveSummary: analysisResult.executiveSummary,
        subScores: {
          populationPressure: Math.min(45, Math.round(analysisResult.riskScorePercentage * 0.45)),
          reproductionDynamics: Math.min(25, Math.round(analysisResult.riskScorePercentage * 0.25)),
          soilVulnerability: Math.min(15, Math.round(analysisResult.riskScorePercentage * 0.15)),
          cropSusceptibility: Math.min(15, Math.round(analysisResult.riskScorePercentage * 0.15)),
        },
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Nema Score Specialized Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-955 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-700/50 space-y-2">
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 w-fit">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          Métricas Fitossanitárias
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Nema Score — Gêmeo Digital Integrado
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
          Monitore os índices de risco populacional, reprodutivo e vulnerabilidade de solo do seu talhão de forma offline ou sincronizada com IA online.
        </p>
      </div>

      {/* Nema IA Score Card (Local & AI) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
        <NemaIAScoreCard
          field={currentField}
          soilType={soilType}
          currentCrop={cropOrPasture}
          onRunAIScore={onRunAIScore}
          loadingAI={loading}
          aiScoreData={aiScoreData}
        />

        {/* Extra analytical info about the score breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-500" />
              Interpretação dos Sub-Índices
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-700 dark:text-zinc-300 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-indigo-600 dark:text-indigo-400">Pressão Populacional (45 pts max):</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mapeia as densidades quantitativas de ovos, juvenis e adultos por amostra física de solo ou raiz.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-indigo-600 dark:text-indigo-400">Dinâmica de Reprodução - FR (25 pts max):</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mede a proporção da população final em relação à inicial (Pf/Pi). Valores abaixo de 1.0 reduzem a pressão residual no solo.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-indigo-600 dark:text-indigo-400">Vulnerabilidade do Solo (15 pts max):</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Avalia a textura física. Solos arenosos ou com baixos níveis de argila e matéria orgânica facilitam a mobilidade das pragas.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-indigo-600 dark:text-indigo-400">Suscetibilidade da Cultura (15 pts max):</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Informa o nível de resistência ou suscetibilidade biológica da cultivar semeada em relação às espécies presentes.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Melhores Práticas de Manejo Baseadas no Score
            </h4>
            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
              <p>
                Se o seu <strong>Nema Score</strong> estiver crítico (abaixo de 50/100 na escala de sanidade), recomendamos a aplicação imediata de bionematicidas à base de <em>Bacillus subtilis</em> e <em>Bacillus methylotrophicus</em> no sulco de plantio.
              </p>
              <p>
                Para talhões moderados, planeje a sucessão com culturas não-hospedeiras, como milheto ADRG 9010 ou crotalárias, visando a quebra do ciclo reprodutivo natural dos fitonematoides.
              </p>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-amber-600 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span>Deseja um diagnóstico detalhado? Utilize o submódulo &quot;Conversa com Nema IA&quot;.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
