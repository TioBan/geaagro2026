import React, { useState } from 'react';
import {
  BrainCircuit,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Leaf,
  FileText,
  Beef,
  Sprout,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import { CentralAIAnalysisResult, getRiskBadgeColor } from './types';

interface NemaAIResultViewProps {
  analysisResult: CentralAIAnalysisResult;
  cropOrPasture: string;
  soilType: string;
  onCopyReport: () => void;
  copied: boolean;
}

export const NemaAIResultView: React.FC<NemaAIResultViewProps> = ({
  analysisResult,
  cropOrPasture,
  soilType,
  onCopyReport,
  copied,
}) => {
  const [expandedResultCard, setExpandedResultCard] = useState<string | null>(null);

  const toggleResultCard = (cardId: string) => {
    setExpandedResultCard(prev => (prev === cardId ? null : cardId));
  };

  const targets = analysisResult.dominantSpeciesOrTargets || analysisResult.dominantSpeciesIdentified || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
              Parecer Nema IA Centralized Assistant
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-amber-500" />
              Diagnóstico Técnico & Nível de Severidade / Risco
            </h3>
          </div>

          <button
            onClick={onCopyReport}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Diagnóstico'}</span>
          </button>
        </div>

        {/* Metrics Grid with Click-to-Expand */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Level Card */}
          <div
            onClick={() => toggleResultCard('risk')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleResultCard('risk'); }}
            className={`p-4 rounded-xl border ${getRiskBadgeColor(analysisResult.riskLevel)} space-y-2 cursor-pointer transition-all hover:scale-[1.01] select-none`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                Nível de Alerta / Severidade
              </span>
              <span className="text-xs opacity-75">
                {expandedResultCard === 'risk' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black">{analysisResult.riskLevel}</span>
              <span className="text-xs font-bold opacity-80">{analysisResult.riskScorePercentage}%</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-current h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(5, analysisResult.riskScorePercentage))}%` }}
              />
            </div>
            <span className="text-[10px] block opacity-70 font-semibold mt-1">
              {expandedResultCard === 'risk' ? 'Clique para recolher' : 'Clique para ver interpretação técnica'}
            </span>
          </div>

          {/* Reproduction / Efficiency Index */}
          <div
            onClick={() => toggleResultCard('fr')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleResultCard('fr'); }}
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-1.5 cursor-pointer transition-all hover:border-amber-400 select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Índice de Reprodução (FR)
              </span>
              <span className="text-xs text-slate-400">
                {expandedResultCard === 'fr' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {analysisResult.reproductionFactorAnalysis.estimatedFR}
              </span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  analysisResult.reproductionFactorAnalysis.estimatedFR > 1
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {analysisResult.reproductionFactorAnalysis.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium line-clamp-2">
              {analysisResult.reproductionFactorAnalysis.interpretation}
            </p>
            <span className="text-[10px] block text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {expandedResultCard === 'fr' ? 'Clique para recolher' : 'Clique para ver dinâmica do FR'}
            </span>
          </div>

          {/* Identified Targets */}
          <div
            onClick={() => toggleResultCard('targets')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleResultCard('targets'); }}
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-1.5 cursor-pointer transition-all hover:border-amber-400 select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Focos de Atenção Detectados
              </span>
              <span className="text-xs text-slate-400">
                {expandedResultCard === 'targets' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targets.length > 0 ? (
                targets.map((target, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300/40 px-2 py-0.5 rounded text-[11px] font-extrabold"
                  >
                    {target}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 font-bold">Nenhum fator limitante crítico</span>
              )}
            </div>
            <span className="text-[10px] block text-amber-600 dark:text-amber-400 font-semibold mt-2">
              {expandedResultCard === 'targets' ? 'Clique para recolher' : 'Clique para detalhes dos alvos'}
            </span>
          </div>
        </div>

        {/* Expanded Detailed Breakdown for Top Cards */}
        {expandedResultCard === 'risk' && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2 animate-in fade-in">
            <strong className="text-amber-700 dark:text-amber-400 font-bold block">
              Metodologia do Nível de Risco e Limite de Dano Econômico (LDE):
            </strong>
            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
              O nível de risco integra a densidade populacional, a suscetibilidade da cultura/cultivar ({cropOrPasture}), a textura do solo ({soilType}) e o balanço nutricional foliar. Solos mais arenosos e plantas com estresse nutricional têm um LDE significativamente mais baixo.
            </p>
            <div className="pt-2 border-t border-amber-500/10 text-slate-600 dark:text-zinc-400 font-medium">
              <strong>Avaliação de Limite de Dano:</strong> {analysisResult.damageThresholdAssessment}
            </div>
          </div>
        )}

        {expandedResultCard === 'fr' && (
          <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 text-xs space-y-2 animate-in fade-in">
            <strong className="text-sky-700 dark:text-sky-400 font-bold block">
              Entendendo o Fator de Reprodução (FR = Pf / Pi):
            </strong>
            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
              {analysisResult.reproductionFactorAnalysis.interpretation}
            </p>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              • <strong>FR &gt; 1.0 (Hospedeiro Favorável):</strong> O nematoide ou patógeno se multiplica na cultura atual, aumentando a população residual para a próxima safra.
              <br />
              • <strong>FR &lt; 1.0 (Não Hospedeiro / Resistente):</strong> Reduz a população ativa no perfil do solo, atuando como cultura de limpeza e redução biológica.
            </p>
          </div>
        )}

        {expandedResultCard === 'targets' && (
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs space-y-2 animate-in fade-in">
            <strong className="text-indigo-700 dark:text-indigo-400 font-bold block">
              Alvos e Fatores de Atenção Identificados:
            </strong>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-zinc-300">
              {targets.map((t, idx) => (
                <li key={idx}><strong>{t}:</strong> Requer monitoramento rigoroso e adoção de estratégias combinadas de controle biológico e rotação.</li>
              ))}
            </ul>
          </div>
        )}

        {/* Foliar Diagnosis & Nutritional Balance Panel */}
        {analysisResult.foliarDiagnosisAndBalance && (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Diagnóstico Nutricional Foliar Integrado & Sincronismo Solo-Planta
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Análise Foliar Integrada
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
              {analysisResult.foliarDiagnosisAndBalance.nutritionalStatusSummary && (
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Estado Nutricional da Folha</span>
                  <p className="mt-1 text-slate-800 dark:text-zinc-200 leading-relaxed">
                    {analysisResult.foliarDiagnosisAndBalance.nutritionalStatusSummary}
                  </p>
                </div>
              )}

              {analysisResult.foliarDiagnosisAndBalance.limitingNutrients && analysisResult.foliarDiagnosisAndBalance.limitingNutrients.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] text-rose-500 block font-bold uppercase">Nutrientes Limitantes / Críticos</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {analysisResult.foliarDiagnosisAndBalance.limitingNutrients.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.foliarDiagnosisAndBalance.soilPlantSynchrony && (
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] text-emerald-600 block font-bold uppercase">Sincronismo Solo x Tecido Foliar</span>
                  <p className="mt-1 text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {analysisResult.foliarDiagnosisAndBalance.soilPlantSynchrony}
                  </p>
                </div>
              )}

              {analysisResult.foliarDiagnosisAndBalance.foliarSprayRecommendation && (
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30 sm:col-span-2">
                  <span className="text-[10px] text-amber-600 block font-bold uppercase">Recomendação de Calda & Correção Foliar</span>
                  <p className="mt-1 text-slate-800 dark:text-zinc-200 leading-relaxed font-semibold">
                    {analysisResult.foliarDiagnosisAndBalance.foliarSprayRecommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Executive Report */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Parecer Técnico Consolidado do Especialista
          </span>
          <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-medium whitespace-pre-wrap">
            {analysisResult.executiveSummary}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400">
            <strong>Análise de Limite de Dano / Produtividade:</strong> {analysisResult.damageThresholdAssessment}
          </div>
        </div>

        {/* Conditional Livestock Panel if relevant */}
        {analysisResult.livestockAndPastureRecommendations && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-3">
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Beef className="w-4 h-4" />
              Prescrição Zootécnica & Manejo Agropecuário
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-700 dark:text-zinc-300">
              {analysisResult.livestockAndPastureRecommendations.carryingCapacityUaHa && (
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border">
                  <span className="text-[10px] text-slate-400 block font-bold">Capacidade Lotação (UA/ha)</span>
                  <strong className="text-slate-900 dark:text-white mt-0.5 block text-sm">
                    {analysisResult.livestockAndPastureRecommendations.carryingCapacityUaHa}
                  </strong>
                </div>
              )}
              {analysisResult.livestockAndPastureRecommendations.pastureManagement && (
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border">
                  <span className="text-[10px] text-slate-400 block font-bold">Manejo de Pastejo (Entrada/Saída)</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {analysisResult.livestockAndPastureRecommendations.pastureManagement}
                  </p>
                </div>
              )}
              {analysisResult.livestockAndPastureRecommendations.nutritionalStrategy && (
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-bold">Suplementação & Formulação Alimentar</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {analysisResult.livestockAndPastureRecommendations.nutritionalStrategy}
                  </p>
                </div>
              )}
              {analysisResult.livestockAndPastureRecommendations.sanitaryProtocol && (
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-bold">Protocolo Sanitário & Ambiência</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {analysisResult.livestockAndPastureRecommendations.sanitaryProtocol}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Biological plan and cover crops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Biological Control / Supplements */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Leaf className="w-4 h-4" />
              Prescrição Biológica & Microbiana de Sucesso
            </span>
            <div className="space-y-2.5 text-xs">
              {(analysisResult.biologicalManagementPlan || []).map((b, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1 font-medium">
                  <div className="flex items-center justify-between text-[11px]">
                    <strong className="text-emerald-700 dark:text-emerald-400 italic">{b.agent}</strong>
                    <span className="bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded text-amber-900 dark:text-amber-300 font-extrabold text-[9px]">
                      {b.doseRecommendation}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-300">
                    <span className="text-slate-400 font-bold">Alvo:</span> {b.target} • <span className="text-slate-400 font-bold">Momento:</span> {b.applicationTiming}
                  </p>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">{b.mechanismOfAction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Crops & Cultural strategy */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-3">
            <span className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1.5">
              <Sprout className="w-4 h-4" />
              Manejo Cultural, Rotação & Cobertura de Solo
            </span>
            <div className="space-y-3 text-xs font-medium">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Plantas de Cobertura / Co-cultivos Recomendados:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(analysisResult.cropRotationAndCoverCrops?.recommendedCoverCrops || []).map((c, idx) => (
                    <span key={idx} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[11px] font-bold">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Crops / Práticas a Evitar:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(analysisResult.cropRotationAndCoverCrops?.cropsToAvoid || []).map((c, idx) => (
                    <span key={idx} className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[11px] font-bold">
                      ✗ {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-2.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Estratégia de Sucessão Recomendada:</span>
                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed mt-0.5">
                  {analysisResult.cropRotationAndCoverCrops?.successionStrategy || ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chemical & Soil Health Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chemical Control */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-2.5">
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Manejo de Insumos Químicos / Farmacológicos
            </span>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-250 dark:border-zinc-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Intervenção Química Recomendada?
              </span>
              <strong className={`text-xs block ${analysisResult.chemicalManagementPlan?.recommended ? 'text-amber-500' : 'text-emerald-600'}`}>
                {analysisResult.chemicalManagementPlan?.recommended ? 'Sim, justificado sob alta pressão' : 'Não prioritário / Preservar controle biológico'}
              </strong>
              {analysisResult.chemicalManagementPlan?.activeIngredients && analysisResult.chemicalManagementPlan.activeIngredients.length > 0 && (
                <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-bold mt-1.5">
                  Ingredientes recomendados: {analysisResult.chemicalManagementPlan.activeIngredients.join(', ')}
                </p>
              )}
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                {analysisResult.chemicalManagementPlan?.observation || ''}
              </p>
            </div>
          </div>

          {/* BioAS Enzimático */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 space-y-2.5">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Diagnóstico de Fertilidade e BioAS (Atividade Biológica)
            </span>
            <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-zinc-400 space-y-1.5 font-medium">
              {(analysisResult.soilHealthAndBioASRecommendations || []).map((rec, idx) => (
                <li key={idx} className="leading-tight">{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Technical Checklist */}
        <div className="p-4 rounded-xl bg-slate-950 text-white space-y-3.5">
          <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Checklist Operacional de Campo da Nema IA
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {(analysisResult.actionChecklist || []).map((c, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                <span className="bg-amber-500/15 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
                  PASSO {idx + 1}
                </span>
                <span className="text-zinc-200 text-[11px] leading-relaxed font-semibold">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
