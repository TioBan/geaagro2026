import React, { useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Play,
  XCircle,
} from 'lucide-react';
import {
  EstatisticaConjuntoDados,
  EstatisticaExperimento,
  EstatisticaUiPreferences,
  EstatisticaVariavel,
} from '../types/estatistica';
import { estatisticaStorage } from '../storage/estatisticaStorage';
import { parseNumericCell } from '../statistics-engine/designs/experimentalDesigns';
import {
  FriedmanResult,
  KruskalWallisResult,
  MannWhitneyResult,
  runFriedmanTest,
  runKruskalWallis,
  runMannWhitney,
  runWilcoxonPaired,
  WilcoxonPairedResult,
} from '../statistics-engine/nonparametric/nonParametricEngine';
import {
  HierarchicalClusterResult,
  KMeansResult,
  MetricaDistancia,
  MetodoLigacao,
  PcaResult,
} from '../statistics-engine/multivariate/multivariateEngine';
import {
  CategoricalContingencyResult,
  LogisticRegressionResult,
  MannKendallResult,
  runCategoricalContingency,
  runKaplanMeierAnalysis,
  runLogisticRegression,
  runMannKendallAnalysis,
  SurvivalAnalysisResult,
} from '../statistics-engine/special/specialAnalysesEngine';
import { executeInStatsWorker } from '../statistics-engine/workers/statisticsWorker';
import { ScientificChartCanvas } from '../charts/ScientificChartCanvas';

export type AdvancedSection = 'nao_parametrica' | 'multivariada' | 'especiais';

interface AnalisesAvancadasViewProps {
  section: AdvancedSection;
  experimento: EstatisticaExperimento;
  dataset: EstatisticaConjuntoDados | null;
  variaveis: EstatisticaVariavel[];
  prefs: EstatisticaUiPreferences;
  onNavigateSubTab: (tab: any) => void;
  onRefresh: () => Promise<void>;
}

export const AnalisesAvancadasView: React.FC<AnalisesAvancadasViewProps> = ({
  section,
  experimento,
  dataset,
  variaveis,
  prefs,
  onNavigateSubTab,
  onRefresh,
}) => {
  const dec = prefs.casasDecimais ?? 4;
  const fmt = (v: number | null | undefined, digits = dec) =>
    v !== null && v !== undefined && Number.isFinite(v) ? v.toFixed(digits) : '-';
  const fmtP = (p: number | null | undefined) => {
    if (p === null || p === undefined || !Number.isFinite(p)) return '-';
    return p < 0.0001 ? '< 0,0001' : p.toFixed(4);
  };

  const rows = dataset?.linhasWorking || [];
  const cols = dataset?.colunas || [];

  const numericCols = useMemo(() => {
    const marked = variaveis
      .filter((v) => v.tipo === 'quantitativa_continua' || v.tipo === 'quantitativa_discreta')
      .map((v) => v.nome);
    if (marked.length > 0) return marked;
    return cols.filter((c) => rows.some((r) => parseNumericCell(r[c]) !== null));
  }, [variaveis, cols, rows]);

  const [alpha, setAlpha] = useState<number>(experimento.alphaPadrao || prefs.alphaPadrao || 0.05);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Não paramétrica
  const [npTest, setNpTest] = useState<'kruskal' | 'mann_whitney' | 'wilcoxon' | 'friedman'>('kruskal');
  const [npResp, setNpResp] = useState<string>(experimento.mapeamento.respostaCols?.[0] || numericCols[0] || cols[0] || '');
  const [npGroup, setNpGroup] = useState<string>(experimento.mapeamento.tratamentoCol || cols[0] || '');
  const [npBlock, setNpBlock] = useState<string>(experimento.mapeamento.blocoCol || cols[1] || '');
  const [npSecondCol, setNpSecondCol] = useState<string>(numericCols[1] || numericCols[0] || '');
  const [npDunnMethod, setNpDunnMethod] = useState<'holm' | 'bonferroni'>('holm');
  const [kwRes, setKwRes] = useState<KruskalWallisResult | null>(null);
  const [mwRes, setMwRes] = useState<MannWhitneyResult | null>(null);
  const [wxRes, setWxRes] = useState<WilcoxonPairedResult | null>(null);
  const [frRes, setFrRes] = useState<FriedmanResult | null>(null);

  // Multivariada
  const [mvTest, setMvTest] = useState<'pca' | 'hca' | 'kmeans'>('pca');
  const [mvVars, setMvVars] = useState<string[]>(() => numericCols.slice(0, 5));
  const [mvLabelCol, setMvLabelCol] = useState<string>(experimento.mapeamento.tratamentoCol || '');
  const [pcaMatrix, setPcaMatrix] = useState<'correlacao' | 'covariancia'>('correlacao');
  const [hcaMetric, setHcaMetric] = useState<MetricaDistancia>('euclidiana');
  const [hcaLinkage, setHcaLinkage] = useState<MetodoLigacao>('ward');
  const [mvStandardize, setMvStandardize] = useState<boolean>(true);
  const [mvK, setMvK] = useState<number>(3);
  const [pcaRes, setPcaRes] = useState<PcaResult | null>(null);
  const [hcaRes, setHcaRes] = useState<HierarchicalClusterResult | null>(null);
  const [kmRes, setKmRes] = useState<KMeansResult | null>(null);

  // Especiais
  const [spTest, setSpTest] = useState<'mann_kendall' | 'logistica' | 'contingencia' | 'sobrevivencia'>('mann_kendall');
  const [mkCol, setMkCol] = useState<string>(numericCols[0] || cols[0] || '');
  const [mkRes, setMkRes] = useState<MannKendallResult | null>(null);

  const [logRespCol, setLogRespCol] = useState<string>(cols[0] || '');
  const [logPredCols, setLogPredCols] = useState<string[]>(() => numericCols.slice(0, 2));
  const [logPosVal, setLogPosVal] = useState<string>('');
  const [logRes, setLogRes] = useState<LogisticRegressionResult | null>(null);

  const [catRowCol, setCatRowCol] = useState<string>(cols[0] || '');
  const [catColCol, setCatColCol] = useState<string>(cols[1] || cols[0] || '');
  const [catRes, setCatRes] = useState<CategoricalContingencyResult | null>(null);

  const [survTimeCol, setSurvTimeCol] = useState<string>(numericCols[0] || cols[0] || '');
  const [survEventCol, setSurvEventCol] = useState<string>(cols[1] || cols[0] || '');
  const [survGroupCol, setSurvGroupCol] = useState<string>('');
  const [survRes, setSurvRes] = useState<SurvivalAnalysisResult | null>(null);

  if (!dataset || rows.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-6 py-8 text-center space-y-3">
        <Activity className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Importe dados experimentais antes de executar análises avançadas
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Carregue ou crie sua matriz de dados na aba Dados &amp; Planilhas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateSubTab('dados')}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
        >
          Ir para Dados &amp; Planilhas
        </button>
      </div>
    );
  }

  const handleRunNonParametric = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      const resp = npResp || numericCols[0] || cols[0];
      const grp = npGroup || cols[0];

      if (npTest === 'kruskal' || npTest === 'mann_whitney') {
        const map = new Map<string, number[]>();
        for (const r of rows) {
          const y = parseNumericCell(r[resp]);
          const g = String(r[grp] ?? '').trim();
          if (y !== null && g) {
            if (!map.has(g)) map.set(g, []);
            map.get(g)!.push(y);
          }
        }
        const grupos = Array.from(map.entries()).map(([grupo, valores]) => ({ grupo, valores }));
        if (npTest === 'kruskal') {
          const res = runKruskalWallis(grupos, alpha, npDunnMethod);
          setKwRes(res);
          await estatisticaStorage.salvarAnaliseEResultado(
            {
              experimentoId: experimento.id,
              categoria: 'nao_parametrica',
              subtipo: 'Kruskal-Wallis + Dunn',
              parametros: { resp, grp, npDunnMethod, alpha },
            },
            {
              experimentoId: experimento.id,
              categoria: 'nao_parametrica',
              titulo: `Kruskal-Wallis + Dunn (${resp} ~ ${grp})`,
              subtipo: 'Kruskal-Wallis',
              dados: res,
              interpretacaoDeterministica: res.interpretacao,
              avisosTecnicos: [],
            }
          );
          setOkMsg('Teste de Kruskal-Wallis + pós-teste de Dunn salvo.');
        } else {
          if (grupos.length !== 2) {
            throw new Error(`Mann-Whitney U exige exatamente 2 grupos em "${grp}" (encontrados: ${grupos.length}).`);
          }
          const res = runMannWhitney(
            { nome: grupos[0].grupo, valores: grupos[0].valores },
            { nome: grupos[1].grupo, valores: grupos[1].valores },
            alpha
          );
          setMwRes(res);
          await estatisticaStorage.salvarAnaliseEResultado(
            {
              experimentoId: experimento.id,
              categoria: 'nao_parametrica',
              subtipo: 'Mann-Whitney U',
              parametros: { resp, grp, alpha },
            },
            {
              experimentoId: experimento.id,
              categoria: 'nao_parametrica',
              titulo: `Mann-Whitney U (${grupos[0].grupo} vs ${grupos[1].grupo})`,
              subtipo: 'Mann-Whitney U',
              dados: res,
              interpretacaoDeterministica: res.interpretacao,
              avisosTecnicos: [],
            }
          );
          setOkMsg('Teste de Mann-Whitney U salvo.');
        }
      } else if (npTest === 'wilcoxon') {
        const aVals: number[] = [];
        const bVals: number[] = [];
        for (const r of rows) {
          const va = parseNumericCell(r[resp]);
          const vb = parseNumericCell(r[npSecondCol]);
          if (va !== null && vb !== null) {
            aVals.push(va);
            bVals.push(vb);
          }
        }
        const res = runWilcoxonPaired(aVals, bVals, alpha);
        setWxRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'nao_parametrica',
            subtipo: 'Wilcoxon Pareado',
            parametros: { colA: resp, colB: npSecondCol, alpha },
          },
          {
            experimentoId: experimento.id,
            categoria: 'nao_parametrica',
            titulo: `Wilcoxon Pareado (${resp} vs ${npSecondCol})`,
            subtipo: 'Wilcoxon Pareado',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('Teste de Wilcoxon Pareado salvo.');
      } else {
        const res = runFriedmanTest(rows, grp, npBlock, resp, alpha);
        setFrRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'nao_parametrica',
            subtipo: 'Friedman',
            parametros: { resp, grp, bloco: npBlock, alpha },
          },
          {
            experimentoId: experimento.id,
            categoria: 'nao_parametrica',
            titulo: `Friedman (${resp} ~ ${grp} | Bloco ${npBlock})`,
            subtipo: 'Friedman',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('Teste de Friedman + pós-teste de Nemenyi salvo.');
      }
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro no teste não paramétrico.');
    }
  };

  const handleRunMultivariate = async () => {
    setErrMsg(null);
    setOkMsg(null);
    const vars = mvVars.length >= 2 ? mvVars : numericCols.slice(0, 4);
    if (vars.length < 2) {
      setErrMsg('Selecione ao menos 2 variáveis numéricas.');
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsRunning(true);
    try {
      if (mvTest === 'pca') {
        const res = await executeInStatsWorker<PcaResult>(
          'pca',
          { rows, variaveis: vars, matrizTipo: pcaMatrix, labelCol: mvLabelCol || undefined },
          ctrl.signal
        );
        setPcaRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'multivariada',
            subtipo: `PCA (${pcaMatrix})`,
            parametros: { variaveis: vars, matrizTipo: pcaMatrix },
          },
          {
            experimentoId: experimento.id,
            categoria: 'multivariada',
            titulo: `PCA — Análise de Componentes Principais (${pcaMatrix})`,
            subtipo: 'PCA',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('PCA executada via Web Worker e salva.');
      } else if (mvTest === 'hca') {
        const res = await executeInStatsWorker<HierarchicalClusterResult>(
          'cluster_hier',
          {
            rows,
            variaveis: vars,
            metricaDistancia: hcaMetric,
            metodoLigacao: hcaLinkage,
            padronizarZ: mvStandardize,
            kGrupos: mvK,
            labelCol: mvLabelCol || undefined,
          },
          ctrl.signal
        );
        setHcaRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'multivariada',
            subtipo: `HCA (${hcaLinkage} / ${hcaMetric})`,
            parametros: { variaveis: vars, hcaMetric, hcaLinkage, kGrupos: mvK },
          },
          {
            experimentoId: experimento.id,
            categoria: 'multivariada',
            titulo: `Agrupamento Hierárquico (${hcaLinkage.toUpperCase()})`,
            subtipo: 'HCA',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('Agrupamento hierárquico e dendrograma gerados.');
      } else {
        const res = await executeInStatsWorker<KMeansResult>(
          'kmeans',
          {
            rows,
            variaveis: vars,
            k: mvK,
            padronizarZ: mvStandardize,
            labelCol: mvLabelCol || undefined,
          },
          ctrl.signal
        );
        setKmRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'multivariada',
            subtipo: `K-Means (k=${mvK})`,
            parametros: { variaveis: vars, k: mvK, mvStandardize },
          },
          {
            experimentoId: experimento.id,
            categoria: 'multivariada',
            titulo: `K-Means Particionamento (k = ${mvK})`,
            subtipo: 'K-Means',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('K-Means++ e Silhueta concluídos.');
      }
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro na análise multivariada.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSpecial = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      if (spTest === 'mann_kendall') {
        const serie = rows
          .map((r) => parseNumericCell(r[mkCol]))
          .filter((v): v is number => v !== null);
        const res = runMannKendallAnalysis(serie, alpha);
        setMkRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            subtipo: 'Mann-Kendall & Sen',
            parametros: { coluna: mkCol, alpha },
          },
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            titulo: `Série Temporal (Mann-Kendall & Sen) — ${mkCol}`,
            subtipo: 'Mann-Kendall',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('Análise temporal Mann-Kendall + Inclinação de Sen salva.');
      } else if (spTest === 'logistica') {
        const res = runLogisticRegression({
          rows,
          responseCol: logRespCol,
          predictorCols: logPredCols.length ? logPredCols : numericCols.slice(0, 1),
          positiveValue: logPosVal.trim() || undefined,
          alpha,
        });
        setLogRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            subtipo: 'Regressão Logística Binária',
            parametros: { responseCol: logRespCol, predictors: logPredCols, alpha },
          },
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            titulo: `Regressão Logística Binária (${logRespCol})`,
            subtipo: 'Logística IRLS',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('Regressão Logística Binária (IRLS) salva.');
      } else if (spTest === 'contingencia') {
        const res = runCategoricalContingency(rows, catRowCol, catColCol, alpha);
        setCatRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            subtipo: 'Contingência χ² / Fisher / G',
            parametros: { rowCol: catRowCol, colCol: catColCol, alpha },
          },
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            titulo: `Tabela de Contingência (${catRowCol} × ${catColCol})`,
            subtipo: 'Contingência',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('Análise categórica salva.');
      } else {
        const res = runKaplanMeierAnalysis({
          rows,
          timeCol: survTimeCol,
          eventCol: survEventCol,
          groupCol: survGroupCol || undefined,
          alpha,
        });
        setSurvRes(res);
        await estatisticaStorage.salvarAnaliseEResultado(
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            subtipo: 'Kaplan-Meier & Log-Rank',
            parametros: { timeCol: survTimeCol, eventCol: survEventCol, groupCol: survGroupCol },
          },
          {
            experimentoId: experimento.id,
            categoria: 'especial',
            titulo: `Sobrevivência (Kaplan-Meier) — ${survTimeCol}`,
            subtipo: 'Kaplan-Meier',
            dados: res,
            interpretacaoDeterministica: res.interpretacao,
            avisosTecnicos: [],
          }
        );
        setOkMsg('Análise de sobrevivência Kaplan-Meier + Log-Rank salva.');
      }
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao executar análise especial.');
    }
  };

  return (
    <div className="space-y-4">
      {errMsg && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-300">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errMsg}</span>
        </div>
      )}
      {okMsg && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{okMsg}</span>
        </div>
      )}

      {/* ====================================================================== */}
      {/* A. TESTES NÃO PARAMÉTRICOS                                             */}
      {/* ====================================================================== */}
      {section === 'nao_parametrica' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Teste Não Paramétrico
              </label>
              <select
                value={npTest}
                onChange={(e) => setNpTest(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              >
                <option value="kruskal">Kruskal-Wallis + Dunn</option>
                <option value="mann_whitney">Mann-Whitney U (2 grupos)</option>
                <option value="wilcoxon">Wilcoxon Pareado (2 colunas)</option>
                <option value="friedman">Friedman + Nemenyi (Blocos)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                {npTest === 'wilcoxon' ? 'Coluna A (Antes/T1)' : 'Variável Resposta'}
              </label>
              <select
                value={npResp}
                onChange={(e) => setNpResp(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              >
                {(numericCols.length ? numericCols : cols).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {npTest === 'wilcoxon' ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Coluna B (Depois/T2)
                </label>
                <select
                  value={npSecondCol}
                  onChange={(e) => setNpSecondCol(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  {(numericCols.length ? numericCols : cols).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Tratamento / Grupo
                </label>
                <select
                  value={npGroup}
                  onChange={(e) => setNpGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {npTest === 'friedman' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Bloco / Sujeito
                </label>
                <select
                  value={npBlock}
                  onChange={(e) => setNpBlock(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {npTest === 'kruskal' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Ajuste Pós-Teste Dunn
                </label>
                <select
                  value={npDunnMethod}
                  onChange={(e) => setNpDunnMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  <option value="holm">Holm-Bonferroni</option>
                  <option value="bonferroni">Bonferroni</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunNonParametric}
              className="h-8 px-3.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Executar Teste</span>
            </button>
          </div>

          {npTest === 'kruskal' && kwRes && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-wrap gap-6 text-xs font-mono">
                <span>H = <b>{fmt(kwRes.estatisticaH, 3)}</b></span>
                <span>GL = <b>{kwRes.gl}</b></span>
                <span>p-valor = <b className={kwRes.pValor < alpha ? 'text-emerald-600' : ''}>{fmtP(kwRes.pValor)}</b></span>
                <span>η²_H = <b>{fmt(kwRes.etaQuadradoH, 3)}</b></span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2 px-3">Grupo</th>
                      <th className="py-2 px-3 text-right">n</th>
                      <th className="py-2 px-3 text-right">Mediana</th>
                      <th className="py-2 px-3 text-right">IQR</th>
                      <th className="py-2 px-3 text-right">Posto Médio</th>
                      <th className="py-2 px-3 text-center">Letra (Dunn)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                    {kwRes.grupos.map((g) => (
                      <tr key={g.grupo}>
                        <td className="py-2 px-3 font-sans font-semibold">{g.grupo}</td>
                        <td className="py-2 px-3 text-right">{g.n}</td>
                        <td className="py-2 px-3 text-right font-bold">{fmt(g.mediana)}</td>
                        <td className="py-2 px-3 text-right">{fmt(g.iqr)}</td>
                        <td className="py-2 px-3 text-right">{fmt(g.mediaPostos, 2)}</td>
                        <td className="py-2 px-3 text-center font-bold">{g.letra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-xs space-y-1">
                {kwRes.interpretacao.map((t, i) => <div key={i}>• {t}</div>)}
              </div>
            </div>
          )}

          {npTest === 'mann_whitney' && mwRes && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="font-mono flex flex-wrap gap-6">
                <span>U = <b>{fmt(mwRes.uEstatistica, 2)}</b></span>
                <span>Z = <b>{fmt(mwRes.zEstatistica, 3)}</b></span>
                <span>p-valor = <b>{fmtP(mwRes.pValor)}</b></span>
                <span>r rank-biserial = <b>{fmt(mwRes.rRankBiserial, 3)}</b></span>
              </div>
              {mwRes.interpretacao.map((t, i) => <div key={i}>• {t}</div>)}
            </div>
          )}

          {npTest === 'wilcoxon' && wxRes && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="font-mono flex flex-wrap gap-6">
                <span>W = <b>{fmt(wxRes.estatisticaW, 1)}</b></span>
                <span>W+ / W- = <b>{fmt(wxRes.somaPostosPositivos, 1)} / {fmt(wxRes.somaPostosNegativos, 1)}</b></span>
                <span>p-valor = <b>{fmtP(wxRes.pValor)}</b></span>
                <span>Mediana dif. = <b>{fmt(wxRes.medianaDiferencas)}</b></span>
              </div>
              {wxRes.interpretacao.map((t, i) => <div key={i}>• {t}</div>)}
            </div>
          )}

          {npTest === 'friedman' && frRes && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-wrap gap-6 text-xs font-mono">
                <span>χ²_Friedman = <b>{fmt(frRes.chi2Friedman, 3)}</b></span>
                <span>GL = <b>{frRes.gl}</b></span>
                <span>p-valor = <b>{fmtP(frRes.pValor)}</b></span>
                <span>W Kendall = <b>{fmt(frRes.wKendall, 3)}</b></span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2 px-3">Tratamento</th>
                      <th className="py-2 px-3 text-right">Blocos</th>
                      <th className="py-2 px-3 text-right">Mediana</th>
                      <th className="py-2 px-3 text-right">Posto Médio</th>
                      <th className="py-2 px-3 text-center">Grupo Nemenyi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                    {frRes.tratamentos.map((t) => (
                      <tr key={t.grupo}>
                        <td className="py-2 px-3 font-sans font-semibold">{t.grupo}</td>
                        <td className="py-2 px-3 text-right">{t.n}</td>
                        <td className="py-2 px-3 text-right font-bold">{fmt(t.mediana)}</td>
                        <td className="py-2 px-3 text-right">{fmt(t.mediaPostos, 2)}</td>
                        <td className="py-2 px-3 text-center font-bold">{t.letra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* B. ESTATÍSTICA MULTIVARIADA                                            */}
      {/* ====================================================================== */}
      {section === 'multivariada' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Técnica Multivariada
                </label>
                <select
                  value={mvTest}
                  onChange={(e) => setMvTest(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  <option value="pca">PCA (Componentes Principais)</option>
                  <option value="hca">Agrupamento Hierárquico (Dendrograma)</option>
                  <option value="kmeans">K-Means++ (Silhueta)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Rótulo das Observações
                </label>
                <select
                  value={mvLabelCol}
                  onChange={(e) => setMvLabelCol(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  <option value="">Índice automático (Obs 1..n)</option>
                  {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {mvTest === 'pca' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Matriz Base
                  </label>
                  <select
                    value={pcaMatrix}
                    onChange={(e) => setPcaMatrix(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                  >
                    <option value="correlacao">Correlação (Padronizada Z)</option>
                    <option value="covariancia">Covariância (Escala bruta)</option>
                  </select>
                </div>
              )}

              {mvTest === 'hca' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Distância / Ligação
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={hcaMetric}
                        onChange={(e) => setHcaMetric(e.target.value as any)}
                        className="w-1/2 px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                      >
                        <option value="euclidiana">Euclidiana</option>
                        <option value="manhattan">Manhattan</option>
                        <option value="correlacao">1 - r</option>
                      </select>
                      <select
                        value={hcaLinkage}
                        onChange={(e) => setHcaLinkage(e.target.value as any)}
                        className="w-1/2 px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                      >
                        <option value="ward">Ward</option>
                        <option value="average">UPGMA</option>
                        <option value="complete">Completa</option>
                        <option value="single">Simples</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {(mvTest === 'hca' || mvTest === 'kmeans') && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Nº de Grupos (k)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={mvK}
                    onChange={(e) => setMvK(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                {isRunning ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    className="h-8 px-3.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunMultivariate}
                    className="h-8 px-3.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Executar</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                  Variáveis Quantitativas Selecionadas ({mvVars.length})
                </label>
                {mvTest !== 'pca' && (
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mvStandardize}
                      onChange={(e) => setMvStandardize(e.target.checked)}
                    />
                    <span>Padronizar (Z-score)</span>
                  </label>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {numericCols.map((c) => {
                  const sel = mvVars.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setMvVars((prev) => (sel ? prev.filter((x) => x !== c) : [...prev, c]))
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        sel
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {mvTest === 'pca' && pcaRes && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold">
                    Autovalores & Variância Explicada
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="py-2 px-3">Eixo</th>
                        <th className="py-2 px-3 text-right">Autovalor</th>
                        <th className="py-2 px-3 text-right">Var %</th>
                        <th className="py-2 px-3 text-right">Acumulada %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                      {pcaRes.autovalores.map((ev, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-3 font-semibold">CP{i + 1}</td>
                          <td className="py-1.5 px-3 text-right">{fmt(ev, 4)}</td>
                          <td className="py-1.5 px-3 text-right">{pcaRes.varianciaExplicadaPct[i].toFixed(2)}%</td>
                          <td className="py-1.5 px-3 text-right font-bold">{pcaRes.varianciaAcumuladaPct[i].toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold">
                    Cargas Fatoriais (Loadings)
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="py-2 px-3">Variável</th>
                        <th className="py-2 px-3 text-right">CP1</th>
                        <th className="py-2 px-3 text-right">CP2</th>
                        <th className="py-2 px-3 text-right">Comunal.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                      {pcaRes.loadings.map((l) => (
                        <tr key={l.variavel}>
                          <td className="py-1.5 px-3 font-sans font-medium">{l.variavel}</td>
                          <td className="py-1.5 px-3 text-right">{fmt(l.pc1, 3)}</td>
                          <td className="py-1.5 px-3 text-right">{fmt(l.pc2, 3)}</td>
                          <td className="py-1.5 px-3 text-right">{fmt(l.comunalidade2Eixos, 3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ScientificChartCanvas
                  config={{
                    tipo: 'biplot',
                    titulo: `Biplot PCA (${pcaRes.matrizTipo})`,
                    subtitulo: `Variância acumulada CP1 + CP2 = ${(pcaRes.varianciaAcumuladaPct[1] ?? pcaRes.varianciaAcumuladaPct[0]).toFixed(2)}%`,
                    eixoX: 'CP1',
                    eixoY: 'CP2',
                    unidadeX: '',
                    unidadeY: '',
                    mostrarLegenda: false,
                    mostrarIC: false,
                    mostrarRotulos: true,
                    mostrarEquacao: false,
                    paleta: prefs.paletaGraficoPadrao || 'scientific_emerald',
                    casasDecimais: 2,
                  }}
                  data={{
                    scores: pcaRes.scores,
                    loadings: pcaRes.loadings,
                    pc1Label: `CP1 (${pcaRes.varianciaExplicadaPct[0].toFixed(1)}%)`,
                    pc2Label: `CP2 (${(pcaRes.varianciaExplicadaPct[1] ?? 0).toFixed(1)}%)`,
                  }}
                />
              </div>
            </div>
          )}

          {mvTest === 'hca' && hcaRes && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <ScientificChartCanvas
                  config={{
                    tipo: 'dendrograma',
                    titulo: `Dendrograma (${hcaRes.metodoLigacao.toUpperCase()} · ${hcaRes.metricaDistancia})`,
                    subtitulo: `${hcaRes.nObservacoes} observações · corte k = ${hcaRes.kGrupos}`,
                    eixoX: 'Observações',
                    eixoY: 'Altura de Fusão',
                    unidadeX: '',
                    unidadeY: '',
                    mostrarLegenda: false,
                    mostrarIC: false,
                    mostrarRotulos: true,
                    mostrarEquacao: false,
                    paleta: prefs.paletaGraficoPadrao || 'scientific_emerald',
                    casasDecimais: 2,
                  }}
                  data={{
                    dendrograma: hcaRes.dendrograma,
                    labels: hcaRes.atribuicoes.map((a) => a.rotulo),
                  }}
                />
              </div>
              <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-[440px] flex flex-col">
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold">
                  Atribuição aos {hcaRes.kGrupos} Grupos
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono">
                      {hcaRes.atribuicoes.map((a) => (
                        <tr key={a.obsIndex}>
                          <td className="py-1.5 px-3 font-sans">{a.rotulo}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                            Grupo {a.cluster}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {mvTest === 'kmeans' && kmRes && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-wrap gap-6 text-xs font-mono">
                <span>Clusters k = <b>{kmRes.k}</b></span>
                <span>Inércia (WCSS) = <b>{fmt(kmRes.inerciaWcss, 3)}</b></span>
                <span>Índice de Silhueta Médio = <b>{fmt(kmRes.silhuetaMedia, 3)}</b></span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2 px-3">Cluster</th>
                      <th className="py-2 px-3 text-right">n</th>
                      {kmRes.variaveis.map((v) => (
                        <th key={v} className="py-2 px-3 text-right">{v} (Centro)</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                    {kmRes.centroides.map((c) => (
                      <tr key={c.cluster}>
                        <td className="py-2 px-3 font-sans font-bold">Cluster {c.cluster}</td>
                        <td className="py-2 px-3 text-right">{c.tamanho}</td>
                        {kmRes.variaveis.map((v) => (
                          <td key={v} className="py-2 px-3 text-right">{fmt(c.valores[v], 3)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* C. ANÁLISES ESPECIAIS                                                  */}
      {/* ====================================================================== */}
      {section === 'especiais' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-3.5">
            <div className="inline-flex flex-wrap items-center p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg gap-0.5">
              {[
                { id: 'mann_kendall', label: 'Mann-Kendall & Sen' },
                { id: 'logistica', label: 'Logística Binária' },
                { id: 'contingencia', label: 'Contingência (χ² / Fisher)' },
                { id: 'sobrevivencia', label: 'Sobrevivência (KM)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSpTest(t.id as any)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    spTest === t.id
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              {spTest === 'mann_kendall' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Série Numérica Ordenada
                  </label>
                  <select
                    value={mkCol}
                    onChange={(e) => setMkCol(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  >
                    {(numericCols.length ? numericCols : cols).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {spTest === 'logistica' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Resposta Binária (0/1 ou 2 classes)
                    </label>
                    <select
                      value={logRespCol}
                      onChange={(e) => setLogRespCol(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    >
                      {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Valor Positivo (Evento = 1)
                    </label>
                    <input
                      type="text"
                      value={logPosVal}
                      onChange={(e) => setLogPosVal(e.target.value)}
                      placeholder="Automático (ex: 1 ou Sim)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Preditora Numérica Principal
                    </label>
                    <select
                      value={logPredCols[0] || ''}
                      onChange={(e) => setLogPredCols([e.target.value])}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    >
                      {(numericCols.length ? numericCols : cols).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              {spTest === 'contingencia' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Variável Linha (Categórica)
                    </label>
                    <select
                      value={catRowCol}
                      onChange={(e) => setCatRowCol(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    >
                      {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Variável Coluna (Categórica)
                    </label>
                    <select
                      value={catColCol}
                      onChange={(e) => setCatColCol(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    >
                      {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              {spTest === 'sobrevivencia' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Tempo até Evento / Censura
                    </label>
                    <select
                      value={survTimeCol}
                      onChange={(e) => setSurvTimeCol(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    >
                      {(numericCols.length ? numericCols : cols).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Status Evento (1=Ocorrido, 0=Cens.)
                    </label>
                    <select
                      value={survEventCol}
                      onChange={(e) => setSurvEventCol(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    >
                      {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Grupo (Opcional p/ Log-Rank)
                    </label>
                    <select
                      value={survGroupCol}
                      onChange={(e) => setSurvGroupCol(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                    >
                      <option value="">Sem estratificação</option>
                      {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleRunSpecial}
                className="h-8 px-3.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Executar Análise</span>
              </button>
            </div>
          </div>

          {spTest === 'mann_kendall' && mkRes && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="font-mono flex flex-wrap gap-6">
                <span>S = <b>{mkRes.sEstatistica}</b></span>
                <span>Z = <b>{fmt(mkRes.zEstatistica, 3)}</b></span>
                <span>τ Kendall = <b>{fmt(mkRes.tauKendall, 3)}</b></span>
                <span>Inclinação Sen = <b>{fmt(mkRes.inclinacaoSen, 4)}</b></span>
                <span>p-valor = <b>{fmtP(mkRes.pValor)}</b></span>
              </div>
              {mkRes.interpretacao.map((t, i) => <div key={i}>• {t}</div>)}
            </div>
          )}

          {spTest === 'logistica' && logRes && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 text-xs font-mono flex flex-wrap gap-5">
                <span>McFadden Pseudo-R² = <b>{fmt(logRes.pseudoR2McFadden, 4)}</b></span>
                <span>AIC = <b>{logRes.aic.toFixed(2)}</b></span>
                <span>Acurácia = <b>{(logRes.acuraciaClassificacao * 100).toFixed(1)}%</b></span>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Parâmetro</th>
                    <th className="py-2 px-3 text-right">β</th>
                    <th className="py-2 px-3 text-right">Wald χ²</th>
                    <th className="py-2 px-3 text-right">p-valor</th>
                    <th className="py-2 px-3 text-right">Odds Ratio</th>
                    <th className="py-2 px-3 text-right">IC 95% OR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                  {logRes.coeficientes.map((c) => (
                    <tr key={c.nome}>
                      <td className="py-2 px-3 font-sans">{c.nome}</td>
                      <td className="py-2 px-3 text-right">{fmt(c.beta)}</td>
                      <td className="py-2 px-3 text-right">{fmt(c.waldChi2, 3)}</td>
                      <td className="py-2 px-3 text-right">{fmtP(c.pValor)}</td>
                      <td className="py-2 px-3 text-right font-bold">{fmt(c.oddsRatio, 3)}</td>
                      <td className="py-2 px-3 text-right">[{fmt(c.orIcInf, 2)}; {fmt(c.orIcSup, 2)}]</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {spTest === 'contingencia' && catRes && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="font-mono flex flex-wrap gap-6">
                <span>χ² Pearson = <b>{fmt(catRes.chi2Pearson, 3)}</b> (p={fmtP(catRes.pValorChi2)})</span>
                <span>Teste G = <b>{fmt(catRes.testeG, 3)}</b> (p={fmtP(catRes.pValorG)})</span>
                <span>V de Cramér = <b>{fmt(catRes.vCramer, 3)}</b></span>
                {catRes.fisherExatoP !== undefined && (
                  <span>Exato de Fisher p = <b>{fmtP(catRes.fisherExatoP)}</b></span>
                )}
              </div>
              {catRes.interpretacao.map((t, i) => <div key={i}>• {t}</div>)}
            </div>
          )}

          {spTest === 'sobrevivencia' && survRes && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 text-xs">
              {survRes.logRankChi2 !== undefined && (
                <div className="font-mono flex gap-6">
                  <span>Log-Rank χ² = <b>{fmt(survRes.logRankChi2, 3)}</b></span>
                  <span>GL = <b>{survRes.logRankGl}</b></span>
                  <span>p-valor = <b>{fmtP(survRes.logRankPValor)}</b></span>
                </div>
              )}
              {survRes.interpretacao.map((t, i) => <div key={i}>• {t}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
