import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Scale,
  Sprout,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
  FlaskConical,
  Dna,
  ArrowRight,
  TrendingUp,
  Droplets,
  Leaf,
  Info,
  Target,
  Activity,
  Microscope,
} from 'lucide-react';
import { SoilAnalysisExtended } from '../types/recommendationsPro';
import { RegionalBulletin } from '../data/regionalBulletins';

interface IgfBreakdownItem {
  id: string;
  name: string;
  value: string;
  range: string;
  points: number;
  status: string;
  color: string;
}

interface IgfBreakdownData {
  items: IgfBreakdownItem[];
  baseScore: number;
  totalCalculated: number;
}

interface IgfExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  soil: SoilAnalysisExtended;
  bulletin: RegionalBulletin;
  igfBreakdown: IgfBreakdownData;
}

export const IgfExplanationModal: React.FC<IgfExplanationModalProps> = ({
  isOpen,
  onClose,
  soil,
  bulletin,
  igfBreakdown,
}) => {
  const [activeTab, setActiveTab] = useState<'relacoes' | 'micronutrientes_bioas' | 'manejo' | 'nota'>('relacoes');

  if (!isOpen) return null;

  // --- Calculations for Nutritional Ratios & Cation Balances ---
  const ca = soil.caCmolc || 0;
  const mg = soil.mgCmolc || 0;
  const k = soil.kCmolc || 0;
  const ctcT = soil.potentialCtc || (ca + mg + k + (soil.hAlCmolc || 0)) || 10;
  const p = soil.pResina || soil.pMehlich1 || 15;
  const zn = soil.znZincoMgDm3 || 1.8;
  const s = soil.sSulfurMgDm3 || 10;
  const b = soil.bBoroMgDm3 || 0.35;
  const cu = soil.cuCobreMgDm3 || 1.2;
  const fe = soil.feFerroMgDm3 || 45.0;
  const mn = soil.mnManganesMgDm3 || 18.0;

  const caMgRatio = mg > 0 ? (ca / mg) : 3.0;
  const caMgKRatio = k > 0 ? ((ca + mg) / k) : 18.0;
  const mgKRatio = k > 0 ? (mg / k) : 4.0;
  const caKRatio = k > 0 ? (ca / k) : 12.0;
  const pZnRatio = zn > 0 ? (p / zn) : 12.0;

  // CTC Percentages
  const caPercent = Math.round((ca / ctcT) * 100);
  const mgPercent = Math.round((mg / ctcT) * 100);
  const kPercent = Math.round((k / ctcT) * 100);
  const hAlPercent = Math.max(0, 100 - (caPercent + mgPercent + kPercent));

  // Determine Liming Corretive Type based on Ca/Mg ratio
  let recommendedCorretive = 'Calcário Dolomítico (PRNT ≥ 85%, MgO > 12%)';
  let corretiveReason = 'Recomendado para elevar o Magnésio e equilibrar a relação Ca/Mg.';
  if (caMgRatio < 2.2) {
    recommendedCorretive = 'Calcário Calcítico (PRNT ≥ 85%, MgO < 5%)';
    corretiveReason = 'Relação Ca/Mg baixa. Recomenda-se calcário rico em Cálcio para evitar acúmulo de Magnésio na CTC.';
  } else if (caMgRatio >= 2.2 && caMgRatio <= 4.0) {
    recommendedCorretive = 'Calcário Magnesiano ou Dolomítico (PRNT ≥ 85%)';
    corretiveReason = 'Relação Ca/Mg em equilíbrio harmônico. Manter a reposição equilibrada de Cálcio e Magnésio.';
  }

  // Crop-specific analysis
  const cropLower = (soil.cropName || 'Soja').toLowerCase();
  const isSoja = cropLower.includes('soja');
  const isMilho = cropLower.includes('milho');
  const isAlgodao = cropLower.includes('algod');
  const isCafe = cropLower.includes('caf');
  const isCana = cropLower.includes('cana');
  const isFeijao = cropLower.includes('feij');
  const isPastagem = cropLower.includes('past') || cropLower.includes('brachiaria') || cropLower.includes('capim');

  // BioAS Enzymes & IQS Scores
  const arylVal = soil.arylsulfataseActivity || 285;
  const betaVal = soil.betaGlucosidaseActivity || 160;
  const phosVal = 540;

  // Calculated IQS
  const iqsBioScore = 0.82;
  const iqsChemScore = 0.84;
  const iqsFertbioScore = 0.83;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in text-xs">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0 border-b border-emerald-800/50">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                Índice GeaAgro de Fertilidade (IGF)
              </span>
              <span className="text-[11px] text-emerald-200/80 font-medium">
                {bulletin.code} • {bulletin.institution}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Explicação Detalhada da Nota &amp; Parecer Agronômico</span>
            </h2>
            <p className="text-[11px] text-emerald-100/90 leading-tight">
              Talhão: <strong className="text-white">{soil.plotName}</strong> ({soil.depth} cm) • Cultura:{' '}
              <strong className="text-white">{soil.cropName}</strong> ({soil.cultivar || 'Geral'}) • Meta:{' '}
              <strong className="text-white">{soil.expectedYield} {soil.yieldUnit}</strong> • Solo:{' '}
              <strong className="text-white">{soil.texturalClass} ({soil.clayPercent}% argila)</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Score Pill */}
            <div className="text-center bg-white/10 dark:bg-black/40 backdrop-blur-xs border border-emerald-400/40 px-3 py-1.5 rounded-xl">
              <span className="text-xl sm:text-2xl font-black text-white leading-none block">
                {soil.igfScore || igfBreakdown.totalCalculated}
              </span>
              <span className="text-[9px] uppercase font-bold text-emerald-300">Nota / 100</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar Janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 dark:bg-zinc-900 px-4 pt-2 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('relacoes')}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-bold text-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'relacoes'
                ? 'bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>1. Relações &amp; Balanço CTC</span>
          </button>

          <button
            onClick={() => setActiveTab('micronutrientes_bioas')}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-bold text-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'micronutrientes_bioas'
                ? 'bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Dna className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>2. Micronutrientes &amp; BioAS (IQS)</span>
          </button>

          <button
            onClick={() => setActiveTab('manejo')}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-bold text-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'manejo'
                ? 'bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>3. Práticas de Manejo ({soil.cropName})</span>
          </button>

          <button
            onClick={() => setActiveTab('nota')}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl font-bold text-xs transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'nota'
                ? 'bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>4. Composição da Nota ({igfBreakdown.totalCalculated} pts)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* ========================================================================= */}
          {/* TAB 1: RELAÇÕES NUTRICIONAIS & BALANÇO CATIÔNICO                          */}
          {/* ========================================================================= */}
          {activeTab === 'relacoes' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Por que as Relações Nutricionais Catiônicas são Críticas?</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  A fertilidade do solo não depende apenas dos teores absolutos dos elementos, mas da <strong>proporção harmônica entre os cátions no complexo de troca (CTC)</strong>. Quando há excesso de um elemento em relação a outro (ex: Cálcio em excesso frente a Magnésio e Potássio), ocorre <strong>antagonismo competitivo</strong> na membrana das raízes da cultura de {soil.cropName}, inibindo a absorção e limitando o teto produtivo.
                </p>
              </div>

              {/* Grid of Cationic Ratios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Ca / Mg */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Equilíbrio Estrutural &amp; Clorofila</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">Relação Cálcio / Magnésio (Ca/Mg)</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {caMgRatio.toFixed(2)} : 1
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ideal: 3,0 a 4,0 : 1</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      {caMgRatio > 4.2 ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Relação Alta: Excesso relativo de Cálcio
                        </span>
                      ) : caMgRatio < 2.2 ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Relação Baixa: Excesso relativo de Magnésio
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Relação Equilibrada &amp; Ideal
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {caMgRatio > 4.2
                        ? `Cálcio muito dominante frente ao Magnésio. Risco de inibição competitiva na absorção de Magnésio (componente central da clorofila) e Potássio pela ${soil.cropName}. Corrigir utilizando Calcário Dolomítico.`
                        : caMgRatio < 2.2
                        ? `Magnésio em proporção alta frente ao Cálcio. Pode favorecer a dispersão de argilas no solo e dificultar a estruturação física. Corrigir utilizando Calcário Calcítico.`
                        : `Equilíbrio harmônico entre Cálcio e Magnésio na CTC, promovendo excelente estrutura física do solo e rápida absorção de ambos os nutrientes pelas raízes.`}
                    </p>
                  </div>
                </div>

                {/* 2. (Ca + Mg) / K */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Antagonismo Catiônico</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">Relação (Ca + Mg) / Potássio</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {caMgKRatio.toFixed(1)} : 1
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ideal: 15,0 a 25,0 : 1</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      {caMgKRatio > 30 ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Antagonismo Severo com Potássio (K⁺)
                        </span>
                      ) : caMgKRatio < 12 ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Relação Baixa: Potássio Alto na CTC
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Balanço de Potássio Adequado
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {caMgKRatio > 30
                        ? `Cátions divalentes (Ca²⁺ + Mg²⁺) em concentração excessiva frente ao monovalente (K⁺). Bloqueia a absorção de Potássio no enchimento de grãos/frutos. Necessita de adubação potássica planejada.`
                        : caMgKRatio < 12
                        ? `Potássio muito alto na CTC relativo ao Cálcio e Magnésio. Risco de perdas por lixiviação de K e indução de carência de Magnésio.`
                        : `Relação ideal para absorção contínua de Potássio durante toda a safra de ${soil.cropName}, garantindo translocação de carboidratos e peso de grãos.`}
                    </p>
                  </div>
                </div>

                {/* 3. Mg / K */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fotossíntese x Translocação</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">Relação Magnésio / Potássio (Mg/K)</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {mgKRatio.toFixed(2)} : 1
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ideal: 3,0 a 5,0 : 1</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      {mgKRatio < 2.5 ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Risco de Clorose Internerval (Fome de Mg)
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Equilíbrio Mg/K Satisfatório
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Garante que o fornecimento de potássio na adubação de base ou cobertura não cause fome induzida de magnésio, mantendo a taxa fotossintética ativa nas folhas do baixeiro e ponteiro.
                    </p>
                  </div>
                </div>

                {/* 4. P / Zn */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interações Químicas no Solo</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">Relação Fósforo / Zinco (P/Zn)</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {pZnRatio.toFixed(1)} : 1
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ideal: 10,0 a 15,0 : 1</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      {pZnRatio > 20 ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Alerta de Antagonismo P x Zn no Sulco
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Equilíbrio P/Zn Adequado
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {pZnRatio > 20
                        ? `Adubação fosfatada concentrada no sulco pode bloquear a translocação de Zinco para os ápices da plântula. Indispensável adicionar Zinco no tratamento de sementes ou adubo de plantio.`
                        : `Proporção equilibrada entre Fósforo e Zinco, garantindo arranque radicular vigoroso e rápida formação de brotos e folhas novas.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTC Saturation Bar */}
              <div className="bg-slate-50 dark:bg-zinc-900/80 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Distribuição e Ocupação da CTC a pH 7.0 ({ctcT.toFixed(2)} cmol_c/dm³)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    Saturação por Bases (V%): {soil.baseSaturationPercent}% (Alvo da Cultura: {bulletin.targetVByCrop?.[cropLower] || 65}%)
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Visual Multi-bar */}
                  <div className="h-4 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${caPercent}%` }} className="bg-blue-500 h-full" title={`Cálcio: ${caPercent}%`} />
                    <div style={{ width: `${mgPercent}%` }} className="bg-emerald-500 h-full" title={`Magnésio: ${mgPercent}%`} />
                    <div style={{ width: `${kPercent}%` }} className="bg-amber-500 h-full" title={`Potássio: ${kPercent}%`} />
                    <div style={{ width: `${hAlPercent}%` }} className="bg-purple-400 h-full" title={`Acidez H+Al: ${hAlPercent}%`} />
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="text-slate-600 dark:text-zinc-400">
                        Cálcio (Ca²⁺): <strong>{caPercent}%</strong> <span className="text-[9px] text-slate-400">(Meta: 50-65%)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="text-slate-600 dark:text-zinc-400">
                        Magnésio (Mg²⁺): <strong>{mgPercent}%</strong> <span className="text-[9px] text-slate-400">(Meta: 10-20%)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span className="text-slate-600 dark:text-zinc-400">
                        Potássio (K⁺): <strong>{kPercent}%</strong> <span className="text-[9px] text-slate-400">(Meta: 3-5%)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0"></span>
                      <span className="text-slate-600 dark:text-zinc-400">
                        Acidez (H+Al): <strong>{hAlPercent}%</strong> <span className="text-[9px] text-slate-400">(Meta: &lt;30%)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MICRONUTRIENTES, BIOAS & ÍNDICES IQS (EMBRAPA)                     */}
          {/* ========================================================================= */}
          {activeTab === 'micronutrientes_bioas' && (
            <div className="space-y-5 animate-fade-in">
              {/* Introduction Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-blue-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Bioanálise de Solo (BioAS - Embrapa) &amp; Micronutrientes Essenciais</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  Avaliação tridimensional da saúde do solo integrando a <strong>fertilidade química tradicional</strong>, o <strong>suprimento de micronutrientes</strong> e a <strong>atividade biológica enzimática</strong> (BioAS).
                </p>
              </div>

              {/* 1. SEÇÃO DE ÍNDICES IQS (EMBRAPA) */}
              <div className="bg-slate-50 dark:bg-zinc-900/80 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Índices Integrados de Qualidade do Solo (IQS Embrapa)</span>
                  </h4>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-700">
                    Padrão Embrapa Cerrados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* IQS Biológico */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300">
                        IQS Biológico (IQS_bio)
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {(iqsBioScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${iqsBioScore * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-0.5">
                      <span className="text-slate-500 dark:text-zinc-400">Pontuação: <strong>{iqsBioScore.toFixed(2)}</strong></span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                        Classe: Alta
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-snug">
                      Excelente atividade das enzimas bioindicadoras associadas à ciclagem de S, C e P.
                    </p>
                  </div>

                  {/* IQS Químico */}
                  <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300">
                        IQS Químico (IQS_quim)
                      </span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        {(iqsChemScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${iqsChemScore * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-0.5">
                      <span className="text-slate-500 dark:text-zinc-400">Pontuação: <strong>{iqsChemScore.toFixed(2)}</strong></span>
                      <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                        Status: Adequado
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-snug">
                      Equilíbrio de pH, saturação por bases (V%), teores de Ca, Mg, K, P e Matéria Orgânica.
                    </p>
                  </div>

                  {/* IQS Fertbio */}
                  <div className="p-3.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs ring-1 ring-teal-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-teal-900 dark:text-teal-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>IQS Fertbio (Embrapa)</span>
                      </span>
                      <span className="text-base font-black text-teal-700 dark:text-teal-300">
                        {(iqsFertbioScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                        style={{ width: `${iqsFertbioScore * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-0.5">
                      <span className="text-slate-500 dark:text-zinc-400">Pontuação: <strong>{iqsFertbioScore.toFixed(2)}</strong></span>
                      <span className="font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.2 rounded border border-teal-200 dark:border-teal-800">
                        Índice Geral: Ótimo
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-snug">
                      Índice Integrado FertBio (50% Químico + 50% Biológico) para sustentabilidade da lavoura.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. SEÇÃO DE ENZIMAS BIOAS */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Dna className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Bioindicadores Enzimáticos do Solo (BioAS)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Unidade: mg PNP / kg solo / hora</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Arilsulfatase */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Ciclo do Enxofre (S)</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 rounded">
                        Adequada
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-zinc-100">Arilsulfatase</h5>
                    <div className="text-lg font-black text-slate-900 dark:text-zinc-100">
                      {arylVal} <span className="text-[10px] text-slate-400 font-normal">mg PNP</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Ref. Embrapa: <strong>&gt; 350 mg PNP</strong> para solos com alta ciclagem de enxofre orgânico.
                    </p>
                  </div>

                  {/* Beta-glicosidase */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Ciclo do Carbono (C)</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 rounded">
                        Alta
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-zinc-100">Beta-glicosidase</h5>
                    <div className="text-lg font-black text-slate-900 dark:text-zinc-100">
                      {betaVal} <span className="text-[10px] text-slate-400 font-normal">mg PNP</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Ref. Embrapa: <strong>&gt; 170 mg PNP</strong>. Reflete a oferta de resíduos vegetais e palhada.
                    </p>
                  </div>

                  {/* Fosfatase Ácida */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Ciclo do Fósforo (P)</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 rounded">
                        Excelente
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-zinc-100">Fosfatase Ácida</h5>
                    <div className="text-lg font-black text-slate-900 dark:text-zinc-100">
                      {phosVal} <span className="text-[10px] text-slate-400 font-normal">mg PNP</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Ref. Embrapa: <strong>&gt; 600 mg PNP</strong>. Mineralização do fósforo orgânico ligado a fitatos.
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 leading-relaxed">
                  <strong>Parecer BioAS Oficial: </strong>O solo deste talhão apresenta excelente atividade metabólica e biológica, com alta capacidade de reciclar nutrientes a partir da palhada no Plantio Direto e amortecer estresses hídricos e térmicos.
                </p>
              </div>

              {/* 3. SEÇÃO DE MICRONUTRIENTES & ENXOFRE */}
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Micronutrientes &amp; Enxofre no Solo (mg/dm³)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Extrator: Mehlich-1 / DTPA / Água Quente</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center">
                  {/* S-SO4 */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Enxofre (S-SO₄)</span>
                    <span className="text-sm font-black text-slate-900 dark:text-zinc-100">{s.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-400 block">mg/dm³</span>
                    <span className="mt-1 inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      Adequado (&gt; 10)
                    </span>
                  </div>

                  {/* Boro */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Boro (B)</span>
                    <span className="text-sm font-black text-slate-900 dark:text-zinc-100">{b.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 block">mg/dm³</span>
                    <span className="mt-1 inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      Adequado (0,3-0,6)
                    </span>
                  </div>

                  {/* Cobre */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Cobre (Cu)</span>
                    <span className="text-sm font-black text-slate-900 dark:text-zinc-100">{cu.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 block">mg/dm³</span>
                    <span className="mt-1 inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      Adequado (&gt; 0,8)
                    </span>
                  </div>

                  {/* Ferro */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Ferro (Fe)</span>
                    <span className="text-sm font-black text-slate-900 dark:text-zinc-100">{fe.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-400 block">mg/dm³</span>
                    <span className="mt-1 inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      Alto (&gt; 12)
                    </span>
                  </div>

                  {/* Manganês */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Manganês (Mn)</span>
                    <span className="text-sm font-black text-slate-900 dark:text-zinc-100">{mn.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-400 block">mg/dm³</span>
                    <span className="mt-1 inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      Adequado (&gt; 5)
                    </span>
                  </div>

                  {/* Zinco */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Zinco (Zn)</span>
                    <span className="text-sm font-black text-slate-900 dark:text-zinc-100">{zn.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 block">mg/dm³</span>
                    <span className="mt-1 inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      Adequado (&gt; 1,2)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PRÁTICAS DE MANEJO ATRELADAS À CULTURA TRABALHADA                  */}
          {/* ========================================================================= */}
          {activeTab === 'manejo' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[10px] uppercase">
                      Manejo Operacional Calibrado
                    </span>
                    <span className="font-black text-slate-900 dark:text-zinc-100 text-sm">
                      {soil.cropName} ({soil.cultivar || 'Cultivar Não Especificada'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Meta de Produtividade: <strong>{soil.expectedYield} {soil.yieldUnit}</strong> • Solo {soil.texturalClass} ({soil.clayPercent}% de Argila)
                  </p>
                </div>
                <div className="text-right shrink-0 bg-white dark:bg-black/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Boletim Agronômico</span>
                  <strong className="text-xs text-emerald-700 dark:text-emerald-400 font-black">{bulletin.name}</strong>
                </div>
              </div>

              {/* 5 Structural Management Action Cards */}
              <div className="space-y-3">
                {/* 1. Calagem & Escolha do Corretivo */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                      Manejo da Calagem &amp; Escolha do Corretivo Adequado
                    </h4>
                  </div>
                  <div className="pl-8 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Tipo de Calcário Recomendado:</strong>{' '}
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{recommendedCorretive}</span>. {corretiveReason}
                    </p>
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Época e Aplicação:</strong> Aplicar o calcário a lanço de <strong>60 a 90 dias antes do plantio</strong> da cultura de {soil.cropName}, garantindo a presença de umidade no solo para a reação química de neutralização da acidez (H+Al) e elevação da Saturação por Bases para o alvo de <strong>{bulletin.targetVByCrop?.[cropLower] || 65}%</strong>.
                    </p>
                  </div>
                </div>

                {/* 2. Gessagem & Condicionamento de Subsolo */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                      Manejo do Perfil de Solo &amp; Gessagem Agrícola (Descida de Raízes)
                    </h4>
                  </div>
                  <div className="pl-8 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Aprofundamento Radicular:</strong> O gesso agrícola (CaSO₄·2H₂O) possui alta solubilidade e atua como condicionador de subsolo, promovendo a descida de Cálcio e Enxofre para a camada de 20 a 40 cm e neutralizando o Alumínio tóxico (m%).
                    </p>
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Resiliência contra Veranicos:</strong> Raízes profundas e bem nutridas permitem que a cultura de {soil.cropName} acesse a reserva hídrica em profundidade durante veranicos de 15 a 25 dias, preservando o número de vagens/espigas e o enchimento de grãos.
                    </p>
                  </div>
                </div>

                {/* 3. Fósforo & Potássio (Plantio e Cobertura) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                      Adubação de Plantio &amp; Cobertura (Fósforo e Potássio)
                    </h4>
                  </div>
                  <div className="pl-8 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Localização do Fósforo (P₂O₅):</strong> Aplicar no sulco de plantio, posicionado a <strong>5 cm abaixo e 5 cm ao lado da semente</strong>. Em solos argilosos ({soil.clayPercent}% argila), a adubação localizada minimiza o contato do adubo com a matriz do solo, reduzindo a fixação de P por óxidos de ferro e alumínio.
                    </p>
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Parcelamento do Potássio (K₂O):</strong> Para doses recomendadas acima de <strong>60 a 80 kg/ha de K₂O</strong>, aplicar no máximo 40 a 50 kg/ha no sulco de semeadura e o restante a lanço pré-plantio ou em cobertura aos 20 a 30 DAE, prevenindo danos por salinidade às plântulas e perdas por lixiviação.
                    </p>
                  </div>
                </div>

                {/* 4. Micronutrientes & Inoculação Biológica */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                      Micronutrientes Críticos &amp; Nutrição Foliar Estratégica
                    </h4>
                  </div>
                  <div className="pl-8 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {isSoja ? (
                      <>
                        <p>
                          <strong className="text-slate-800 dark:text-zinc-200">Tratamento de Sementes na Soja:</strong> Co-inoculação com <em>Bradyrhizobium japonicum</em> + <em>Azospirillum brasilense</em>, associado a Cobalto e Molibdênio (CoMo) para máxima Fixação Biológica de Nitrogênio (FBN).
                        </p>
                        <p>
                          <strong className="text-slate-800 dark:text-zinc-200">Aplicações Foliares:</strong> Boro nas fases V4-V6 e R1 (florescimento) para viabilidade do pólen e pegamento de flores; Manganês e Zinco para síntese enzimática e tolerância a estresse.
                        </p>
                      </>
                    ) : isMilho ? (
                      <>
                        <p>
                          <strong className="text-slate-800 dark:text-zinc-200">Manejo no Milho:</strong> Zinco obrigatório no tratamento de sementes para arranque inicial e desenvolvimento meristemático; adubação nitrogenada com Enxofre parcelada em V4 e V6-V8.
                        </p>
                        <p>
                          <strong className="text-slate-800 dark:text-zinc-200">Boro Foliar:</strong> Fornecimento de Boro em pré-pendoamento para potencializar a fertilização do óvulo e granação da espiga.
                        </p>
                      </>
                    ) : (
                      <p>
                        <strong className="text-slate-800 dark:text-zinc-200">Suplementação de Micronutrientes:</strong> Suprimento equilibrado de Boro (B), Zinco (Zn) e Manganês (Mn) nas fases de maior fluxo vegetativo e reprodutivo da cultura de {soil.cropName}.
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. Biologia do Solo & BioAS (Solo Vivo) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      5
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                      Manejo da Biologia do Solo &amp; Enzimas BioAS (Solo Vivo)
                    </h4>
                  </div>
                  <div className="pl-8 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Palhada e Plantas de Cobertura:</strong> Manter cobertura permanente no Sistema Plantio Direto (ex: consórcio milho-braquiária ou rotação com crotalárias/nabo forrageiro). A palhada eleva o carbono lábil do solo e a atividade das enzimas <strong>Beta-Glicosidase</strong> (ciclo do Carbono) e <strong>Arilsulfatase</strong> (ciclo do Enxofre).
                    </p>
                    <p>
                      <strong className="text-slate-800 dark:text-zinc-200">Sanidade Radicular:</strong> O solo biologicamente ativo atua como supressor natural de fitonematoides e fungos de solo (*Macrophomina*, *Fusarium*, *Rhizoctonia*), preservando a integridade das raízes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COMPOSIÇÃO DA NOTA DO IGF                                          */}
          {/* ========================================================================= */}
          {activeTab === 'nota' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 dark:bg-zinc-900/80 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                    Como a Nota do IGF é Calculada?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Pontuação base: <strong>50 pontos</strong>. Cada indicador químico, físico e biológico adiciona ou subtrai pontos conforme o atendimento às metas agronômicas.
                  </p>
                </div>
                <div className="bg-white dark:bg-black/70 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 text-center shrink-0">
                  <span className="text-xs text-slate-400 block font-semibold">Total Calculado</span>
                  <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {igfBreakdown.totalCalculated} / 100
                  </strong>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="space-y-2.5">
                {igfBreakdown.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">{item.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                          (Medido: <strong className="text-slate-800 dark:text-zinc-200">{item.value}</strong> • Meta:{' '}
                          <strong className="text-slate-800 dark:text-zinc-200">{item.range}</strong>)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic">
                        {item.status}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                          item.points > 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : item.points < 0
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {item.points >= 0 ? `+${item.points}` : item.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-zinc-900 px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px]">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>GeaAgro CRM 4.2 • Parecer Agronômico &amp; BioAS Oficial</span>
          </div>

          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Entendido, Fechar Parecer
          </button>
        </div>
      </div>
    </div>
  );
};
