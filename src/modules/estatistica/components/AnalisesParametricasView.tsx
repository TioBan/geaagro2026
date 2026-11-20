import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Play,
  Save,
  ShieldCheck,
  Square,
  XCircle,
} from 'lucide-react';
import {
  EstatisticaConjuntoDados,
  EstatisticaExperimento,
  EstatisticaResultado,
  EstatisticaUiPreferences,
  EstatisticaVariavel,
  TipoDelineamento,
  TransformacaoDados,
} from '../types/estatistica';
import { estatisticaStorage } from '../storage/estatisticaStorage';
import { runDescriptiveAnalysis, DescriptiveStatsItem } from '../statistics-engine/descriptive/descriptiveStats';
import {
  EXPERIMENTAL_DESIGNS_CATALOG,
  parseNumericCell,
  validateDesignCompatibility,
} from '../statistics-engine/designs/experimentalDesigns';
import { AnovaResult, runAnova } from '../statistics-engine/anova/anovaEngine';
import {
  MeanComparisonResult,
  MetodoComparacaoMedias,
  runMeanComparison,
} from '../statistics-engine/mean-comparison/meanComparison';
import {
  compareCandidateRegressions,
  RegressionComparisonSummary,
  RegressionResult,
  runRegressionAnalysis,
  TipoModeloRegressao,
} from '../statistics-engine/regression/regressionEngine';
import {
  CorrelationMatrixResult,
  MetodoCorrelacao,
  runCorrelationAnalysis,
} from '../statistics-engine/correlation/correlationEngine';
import {
  applyDataTransformation,
  AssumptionDiagnosticsResult,
  estimateBoxCoxLambda,
  runAssumptionDiagnostics,
} from '../statistics-engine/assumptions/assumptionsEngine';
import { executeInStatsWorker } from '../statistics-engine/workers/statisticsWorker';
import { ScientificChartCanvas } from '../charts/ScientificChartCanvas';

export type ParametricSection =
  | 'descritiva'
  | 'delineamentos'
  | 'anova'
  | 'medias'
  | 'regressao'
  | 'correlacao'
  | 'pressupostos';

interface AnalisesParametricasViewProps {
  section: ParametricSection;
  experimento: EstatisticaExperimento;
  dataset: EstatisticaConjuntoDados | null;
  variaveis: EstatisticaVariavel[];
  prefs: EstatisticaUiPreferences;
  resultados: EstatisticaResultado[];
  lastAnova: AnovaResult | null;
  onSetLastAnova: (res: AnovaResult | null) => void;
  onNavigateSubTab: (tab: any) => void;
  onRefresh: () => Promise<void>;
}

export const AnalisesParametricasView: React.FC<AnalisesParametricasViewProps> = ({
  section,
  experimento,
  dataset,
  variaveis,
  prefs,
  resultados,
  lastAnova,
  onSetLastAnova,
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

  const categoricalCols = useMemo(() => {
    const marked = variaveis
      .filter((v) => v.tipo !== 'quantitativa_continua' && v.tipo !== 'quantitativa_discreta')
      .map((v) => v.nome);
    if (marked.length > 0) return marked;
    return cols;
  }, [variaveis, cols]);

  const defaultResp = experimento.mapeamento.respostaCols?.[0] || numericCols[0] || cols[0] || '';
  const defaultTrat = experimento.mapeamento.tratamentoCol || categoricalCols[0] || cols[0] || '';

  const [alpha, setAlpha] = useState<number>(experimento.alphaPadrao || prefs.alphaPadrao || 0.05);
  const [respCol, setRespCol] = useState<string>(defaultResp);
  const [groupCol, setGroupCol] = useState<string>(defaultTrat);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Resultados locais da sessão por subseção
  const [descRes, setDescRes] = useState<{
    geral: DescriptiveStatsItem;
    grupos: DescriptiveStatsItem[];
    interpretacao: string[];
  } | null>(null);

  // Delineamentos (rascunho de mapeamento para validar e salvar no experimento)
  const [designDraft, setDesignDraft] = useState<TipoDelineamento>(experimento.delineamento);
  const [mapDraft, setMapDraft] = useState(experimento.mapeamento);

  // Comparação de médias
  const [mcMethod, setMcMethod] = useState<MetodoComparacaoMedias>('tukey');
  const [mcTestemunha, setMcTestemunha] = useState<string>('');
  const [mcTwoSided, setMcTwoSided] = useState<boolean>(true);
  const [mcPairedT, setMcPairedT] = useState<boolean>(false);
  const [mcCustomDfErro, setMcCustomDfErro] = useState<string>('');
  const [mcCustomQmErro, setMcCustomQmErro] = useState<string>('');
  const [mcResult, setMcResult] = useState<MeanComparisonResult | null>(null);

  // Regressão
  const [regModel, setRegModel] = useState<TipoModeloRegressao>('quadratica');
  const [regPredictors, setRegPredictors] = useState<string[]>(() =>
    numericCols.filter((c) => c !== defaultResp).slice(0, 1)
  );
  const [regPolyDeg, setRegPolyDeg] = useState<number>(2);
  const [regMetPct, setRegMetPct] = useState<number>(95);
  const [regResult, setRegResult] = useState<RegressionResult | null>(null);
  const [regComparison, setRegComparison] = useState<RegressionComparisonSummary[] | null>(null);

  // Correlação
  const [corrMetodo, setCorrMetodo] = useState<MetodoCorrelacao>('pearson');
  const [corrVars, setCorrVars] = useState<string[]>(() => numericCols.slice(0, 4));
  const [corrResult, setCorrResult] = useState<CorrelationMatrixResult | null>(null);

  // Pressupostos & Transformação
  const [assumpResult, setAssumpResult] = useState<AssumptionDiagnosticsResult | null>(null);
  const [transMethod, setTransMethod] = useState<TransformacaoDados>('nenhuma');
  const [customLambda, setCustomLambda] = useState<string>('');
  const [newColSuffix, setNewColSuffix] = useState<string>('_trans');
  const [transPreviewStats, setTransPreviewStats] = useState<{
    lambdaUsed?: number;
    validCount: number;
    min: number;
    max: number;
    warnings: string[];
    transformedValues: (number | null)[];
  } | null>(null);

  const activeResp = respCol || defaultResp;
  const activeGroup = groupCol || defaultTrat;

  // Recuperar último resultado ANOVA salvo se lastAnova estiver vazio
  const effectiveAnova = useMemo(() => {
    if (lastAnova) return lastAnova;
    const saved = resultados.find((r) => r.categoria === 'anova');
    return saved ? (saved.dados as AnovaResult) : null;
  }, [lastAnova, resultados]);

  const designCompat = useMemo(
    () =>
      validateDesignCompatibility(
        section === 'delineamentos' ? designDraft : experimento.delineamento,
        section === 'delineamentos' ? mapDraft : experimento.mapeamento,
        rows,
        activeResp
      ),
    [section, designDraft, mapDraft, experimento.delineamento, experimento.mapeamento, rows, activeResp]
  );

  if (!dataset || rows.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-6 py-8 text-center space-y-3">
        <Calculator className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Nenhum dado carregado no experimento &ldquo;{experimento.nome}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Importe uma planilha Excel/CSV ou crie uma grade manual na aba Dados antes de executar análises.
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

  const handleCancelWorker = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  // ============================================================================
  // EXECUÇÕES E PERSISTÊNCIA DETERMINÍSTICA
  // ============================================================================
  const handleRunDescriptive = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      const res = runDescriptiveAnalysis(rows, activeResp, activeGroup || undefined, alpha);
      setDescRes(res);
      await estatisticaStorage.salvarAnaliseEResultado(
        {
          experimentoId: experimento.id,
          categoria: 'descritiva',
          subtipo: activeGroup ? `Estratificada (${activeGroup})` : 'Global',
          parametros: { responseCol: activeResp, groupCol: activeGroup || null, alpha },
        },
        {
          experimentoId: experimento.id,
          categoria: 'descritiva',
          titulo: `Estatística Descritiva — ${activeResp}`,
          subtipo: activeGroup ? `Por ${activeGroup}` : 'Global',
          dados: res,
          interpretacaoDeterministica: res.interpretacao,
          avisosTecnicos: [],
        }
      );
      setOkMsg(`Análise descritiva de "${activeResp}" calculada e salva localmente.`);
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao calcular estatística descritiva.');
    }
  };

  const handleSaveDesignMapping = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      await estatisticaStorage.salvarExperimento({
        ...experimento,
        delineamento: designDraft,
        mapeamento: {
          ...mapDraft,
          respostaCols: mapDraft.respostaCols?.length ? mapDraft.respostaCols : [activeResp],
        },
        status: designCompat.compativel ? 'pronto' : experimento.status,
      });
      setOkMsg(`Delineamento ${designDraft} e mapeamento de papéis salvos no experimento.`);
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao salvar delineamento.');
    }
  };

  const handleRunAnova = async () => {
    setErrMsg(null);
    setOkMsg(null);
    if (!designCompat.compativel) {
      setErrMsg(
        `Execução bloqueada por incompatibilidade matemática com o delineamento ${experimento.delineamento}: ${designCompat.motivos.join(' ')}`
      );
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsRunning(true);
    try {
      const res = await executeInStatsWorker<AnovaResult>(
        'anova',
        {
          delineamento: experimento.delineamento,
          mapeamento: experimento.mapeamento,
          rows,
          responseCol: activeResp,
          alpha,
        },
        ctrl.signal
      );
      onSetLastAnova(res);
      await estatisticaStorage.salvarAnaliseEResultado(
        {
          experimentoId: experimento.id,
          categoria: 'anova',
          subtipo: experimento.delineamento,
          parametros: { responseCol: activeResp, delineamento: experimento.delineamento, alpha },
        },
        {
          experimentoId: experimento.id,
          categoria: 'anova',
          titulo: `ANOVA (${experimento.delineamento}) — ${activeResp}`,
          subtipo: experimento.delineamento,
          dados: res,
          interpretacaoDeterministica: res.interpretacao,
          avisosTecnicos: res.avisos,
        }
      );
      if (experimento.status !== 'analisado') {
        await estatisticaStorage.salvarExperimento({ ...experimento, status: 'analisado' });
      }
      setOkMsg(`ANOVA (${experimento.delineamento}) executada e gravada no GeaAgroOfflineDB.`);
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao executar ANOVA.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunMeanComparison = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      const grpName = activeGroup || experimento.mapeamento.tratamentoCol;
      if (!grpName) {
        setErrMsg('Selecione a coluna categórica de Tratamento/Fator para agrupar as médias.');
        return;
      }

      const mapGrp = new Map<string, number[]>();
      for (const r of rows) {
        const y = parseNumericCell(r[activeResp]);
        const g = r[grpName] !== null && r[grpName] !== undefined ? String(r[grpName]).trim() : '';
        if (y !== null && g) {
          if (!mapGrp.has(g)) mapGrp.set(g, []);
          mapGrp.get(g)!.push(y);
        }
      }
      const grupos = Array.from(mapGrp.entries()).map(([grupo, valores]) => ({ grupo, valores }));

      // Usar erro da ANOVA se compatível ou parâmetros informados / estimativa intra-grupo
      let dfErro = Number(mcCustomDfErro);
      let qmErro = Number(mcCustomQmErro);
      let anovaSig: boolean | undefined;

      if (!Number.isFinite(dfErro) || dfErro <= 0 || !Number.isFinite(qmErro) || qmErro <= 0) {
        if (effectiveAnova && effectiveAnova.variavelResposta === activeResp) {
          dfErro = effectiveAnova.dfErroPrincipal;
          qmErro = effectiveAnova.qmErroPrincipal;
          anovaSig = effectiveAnova.tabela.some(
            (r) => r.pValor !== null && r.pValor < alpha && !r.fonte.startsWith('Bloco')
          );
        } else {
          // Erro intra-grupo de 1 fator
          let ssWithin = 0;
          let nTot = 0;
          for (const g of grupos) {
            const m = g.valores.reduce((s, v) => s + v, 0) / g.valores.length;
            ssWithin += g.valores.reduce((s, v) => s + (v - m) * (v - m), 0);
            nTot += g.valores.length;
          }
          dfErro = Math.max(1, nTot - grupos.length);
          qmErro = ssWithin / dfErro;
        }
      }

      const res = runMeanComparison({
        metodo: mcMethod,
        grupos,
        dfErro,
        qmErro,
        alpha,
        testemunha: mcMethod === 'dunnett' ? mcTestemunha || grupos[0]?.grupo : undefined,
        anovaSignificativa: anovaSig,
        twoSided: mcTwoSided,
        pairedT: mcPairedT,
      });

      setMcResult(res);
      await estatisticaStorage.salvarAnaliseEResultado(
        {
          experimentoId: experimento.id,
          categoria: 'comparacao_medias',
          subtipo: mcMethod.toUpperCase(),
          parametros: { responseCol: activeResp, groupCol: grpName, metodo: mcMethod, dfErro, qmErro, alpha },
        },
        {
          experimentoId: experimento.id,
          categoria: 'comparacao_medias',
          titulo: `Comparação de Médias (${mcMethod.toUpperCase()}) — ${activeResp}`,
          subtipo: mcMethod.toUpperCase(),
          dados: res,
          interpretacaoDeterministica: res.interpretacao,
          avisosTecnicos: res.observacoes,
        }
      );
      setOkMsg(`Teste ${mcMethod.toUpperCase()} calculado e salvo.`);
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao executar comparação de médias.');
    }
  };

  const handleRunRegression = async () => {
    setErrMsg(null);
    setOkMsg(null);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsRunning(true);
    try {
      const preds = regPredictors.length ? regPredictors : numericCols.filter((c) => c !== activeResp).slice(0, 1);
      const res = await executeInStatsWorker<RegressionResult>(
        'regression',
        {
          modelo: regModel,
          rows,
          responseCol: activeResp,
          predictorCols: preds,
          polyDegree: regPolyDeg,
          alpha,
          metTargetPercent: regMetPct / 100,
        },
        ctrl.signal
      );
      setRegResult(res);
      if (preds.length === 1) {
        setRegComparison(compareCandidateRegressions(rows, activeResp, preds[0], alpha));
      } else {
        setRegComparison(null);
      }

      await estatisticaStorage.salvarAnaliseEResultado(
        {
          experimentoId: experimento.id,
          categoria: 'regressao',
          subtipo: regModel,
          parametros: { responseCol: activeResp, predictorCols: preds, modelo: regModel, alpha },
        },
        {
          experimentoId: experimento.id,
          categoria: 'regressao',
          titulo: `Regressão (${regModel}) — ${activeResp} ~ ${preds.join(' + ')}`,
          subtipo: regModel,
          dados: res,
          interpretacaoDeterministica: res.interpretacao,
          avisosTecnicos: res.avisos,
        }
      );
      setOkMsg(`Modelo de regressão (${regModel}) ajustado e registrado.`);
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao ajustar modelo de regressão.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCorrelation = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      const vars = corrVars.length >= 2 ? corrVars : numericCols.slice(0, 4);
      const res = runCorrelationAnalysis({
        rows,
        variaveis: vars,
        metodo: corrMetodo,
        alpha,
      });
      setCorrResult(res);
      await estatisticaStorage.salvarAnaliseEResultado(
        {
          experimentoId: experimento.id,
          categoria: 'correlacao',
          subtipo: corrMetodo,
          parametros: { variaveis: vars, metodo: corrMetodo, alpha },
        },
        {
          experimentoId: experimento.id,
          categoria: 'correlacao',
          titulo: `Correlação de ${corrMetodo === 'pearson' ? 'Pearson (r)' : 'Spearman (ρ)'}`,
          subtipo: corrMetodo,
          dados: res,
          interpretacaoDeterministica: res.interpretacao,
          avisosTecnicos: [res.avisoCausalidade],
        }
      );
      setOkMsg(`Matriz de correlação (${corrMetodo}) calculada.`);
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro na análise de correlação.');
    }
  };

  const handleRunAssumptions = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      // Se já houver ANOVA compatível para activeResp, utiliza seus resíduos; caso contrário, calcula ANOVA DIC/DBC ou resíduos simples em torno dos grupos
      let anovaTarget = effectiveAnova && effectiveAnova.variavelResposta === activeResp ? effectiveAnova : null;
      if (!anovaTarget && designCompat.compativel) {
        anovaTarget = runAnova({
          delineamento: experimento.delineamento,
          mapeamento: experimento.mapeamento,
          rows,
          responseCol: activeResp,
          alpha,
        });
        onSetLastAnova(anovaTarget);
      }

      let residuos: number[] = [];
      let resPad: number[] = [];
      let resStu: number[] = [];
      let lev: number[] = [];
      let cook: number[] = [];
      let obsIdx: number[] = [];
      const grpArrays: number[][] = [];

      const grpKeyCol = activeGroup || experimento.mapeamento.tratamentoCol;
      if (grpKeyCol) {
        const m = new Map<string, number[]>();
        rows.forEach((r) => {
          const y = parseNumericCell(r[activeResp]);
          const g = String(r[grpKeyCol] ?? '').trim();
          if (y !== null && g) {
            if (!m.has(g)) m.set(g, []);
            m.get(g)!.push(y);
          }
        });
        m.forEach((vals) => grpArrays.push(vals));
      }

      if (anovaTarget) {
        residuos = anovaTarget.residuos;
        resPad = anovaTarget.residuosPadronizados;
        resStu = anovaTarget.residuosStudentizados;
        lev = anovaTarget.alavancagem;
        cook = anovaTarget.distanciaCook;
        obsIdx = anovaTarget.observacoesIndices;
      } else {
        // Fallback determinístico em torno da média da coluna/grupo
        const vals = rows
          .map((r, i) => ({ y: parseNumericCell(r[activeResp]), i }))
          .filter((o): o is { y: number; i: number } => o.y !== null);
        if (vals.length < 3) throw new Error('Observações insuficientes para verificar pressupostos.');
        const mean = vals.reduce((s, v) => s + v.y, 0) / vals.length;
        residuos = vals.map((v) => v.y - mean);
        const sd = Math.sqrt(
          Math.max(1e-18, residuos.reduce((s, r) => s + r * r, 0) / Math.max(1, vals.length - 1))
        );
        resPad = residuos.map((r) => r / sd);
        resStu = [...resPad];
        lev = vals.map(() => 1 / vals.length);
        cook = vals.map(() => 0);
        obsIdx = vals.map((v) => v.i);
      }

      const res = runAssumptionDiagnostics({
        residuos,
        residuosPadronizados: resPad,
        residuosStudentizados: resStu,
        alavancagem: lev,
        distanciaCook: cook,
        observacoesIndices: obsIdx,
        gruposParaVariancia: grpArrays,
        alpha,
      });
      setAssumpResult(res);

      await estatisticaStorage.salvarAnaliseEResultado(
        {
          experimentoId: experimento.id,
          categoria: 'pressupostos',
          subtipo: 'Shapiro-Wilk + Levene + Bartlett + Cook',
          parametros: { responseCol: activeResp, alpha },
        },
        {
          experimentoId: experimento.id,
          categoria: 'pressupostos',
          titulo: `Verificação de Pressupostos — ${activeResp}`,
          subtipo: 'Diagnóstico Completo',
          dados: res,
          interpretacaoDeterministica: res.interpretacao,
          avisosTecnicos: res.outliersDetectados.length
            ? [`Outliers detectados nas linhas: ${res.outliersDetectados.join(', ')}`]
            : [],
        }
      );
      setOkMsg('Diagnóstico completo de pressupostos concluído e salvo.');
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao verificar pressupostos.');
    }
  };

  const handlePreviewTransform = () => {
    setErrMsg(null);
    setTransPreviewStats(null);
    try {
      const vals = rows.map((r) => parseNumericCell(r[activeResp]));
      const lam = transMethod === 'box_cox' && customLambda.trim() ? Number(customLambda.replace(',', '.')) : undefined;
      const out = applyDataTransformation(vals, transMethod, lam);
      const valid = out.transformed.filter((v): v is number => v !== null && Number.isFinite(v));
      setTransPreviewStats({
        lambdaUsed: out.lambdaUsed,
        validCount: valid.length,
        min: valid.length ? Math.min(...valid) : NaN,
        max: valid.length ? Math.max(...valid) : NaN,
        warnings: out.warnings,
        transformedValues: out.transformed,
      });
    } catch (err: any) {
      setErrMsg(err?.message || 'Não foi possível aplicar esta transformação.');
    }
  };

  const handleApplyTransformAsNewColumn = async () => {
    if (!transPreviewStats || !dataset) return;
    setErrMsg(null);
    try {
      const newColName = `${activeResp}${newColSuffix || '_trans'}`;
      if (dataset.colunas.includes(newColName)) {
        setErrMsg(`A coluna "${newColName}" já existe. Altere o sufixo para não sobrescrever colunas.`);
        return;
      }
      const newCols = [...dataset.colunas, newColName];
      const newRows = dataset.linhasWorking.map((r, idx) => ({
        ...r,
        [newColName]: transPreviewStats.transformedValues[idx] !== null
          ? Number(transPreviewStats.transformedValues[idx]!.toFixed(6))
          : null,
      }));
      await estatisticaStorage.salvarConjuntoDados({
        ...dataset,
        colunas: newCols,
        linhasWorking: newRows,
        transformacaoAtiva: {
          variavel: newColName,
          metodo: transMethod,
          lambda: transPreviewStats.lambdaUsed,
          aplicadaEm: new Date().toISOString(),
        },
      });
      await estatisticaStorage.salvarVariavel({
        experimentoId: experimento.id,
        nome: newColName,
        rotulo: `${activeResp} (${transMethod})`,
        unidade: 'transformada',
        tipo: 'quantitativa_continua',
        papel: 'resposta',
        transformacao: transMethod,
        boxCoxLambda: transPreviewStats.lambdaUsed,
        origemColuna: activeResp,
      });
      await estatisticaStorage.registrarHistorico({
        experimentoId: experimento.id,
        acao: 'transformacao',
        entidade: newColName,
        descricao: `Criada variável transformada "${newColName}" via ${transMethod}${transPreviewStats.lambdaUsed !== undefined ? ` (λ = ${transPreviewStats.lambdaUsed})` : ''} a partir de "${activeResp}" (dados brutos intactos).`,
      });
      setRespCol(newColName);
      setOkMsg(`Nova coluna "${newColName}" adicionada com sucesso! Dados originais preservados intactos.`);
      setTransPreviewStats(null);
      await onRefresh();
    } catch (err: any) {
      setErrMsg(err?.message || 'Erro ao salvar variável transformada.');
    }
  };

  // Lista única de níveis para selecionar testemunha no Dunnett
  const groupLevels = useMemo(() => {
    if (!activeGroup) return [];
    return Array.from(
      new Set(rows.map((r) => String(r[activeGroup] ?? '').trim()).filter(Boolean))
    );
  }, [rows, activeGroup]);

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

      {/* Barra comum de parâmetros globais para análises */}
      {section !== 'delineamentos' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-wrap items-end gap-3">
          {section !== 'correlacao' && (
            <div className="min-w-[180px] flex-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Variável Resposta (Y)
              </label>
              <select
                value={activeResp}
                onChange={(e) => setRespCol(e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {(numericCols.length > 0 ? numericCols : cols).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(section === 'descritiva' || section === 'medias' || section === 'pressupostos') && (
            <div className="min-w-[180px] flex-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                {section === 'descritiva' ? 'Estratificar por Fator (Opcional)' : 'Coluna de Tratamento / Grupo'}
              </label>
              <select
                value={activeGroup}
                onChange={(e) => setGroupCol(e.target.value)}
                className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {section === 'descritiva' && <option value="">Conjunto completo (sem grupos)</option>}
                {cols.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-32">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Nível α
            </label>
            <select
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full h-8 px-2.5 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value={0.01}>0,01 (1%)</option>
              <option value={0.05}>0,05 (5%)</option>
              <option value={0.10}>0,10 (10%)</option>
            </select>
          </div>

          {isRunning && (
            <button
              type="button"
              onClick={handleCancelWorker}
              className="h-8 px-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 1. ESTATÍSTICA DESCRITIVA                                              */}
      {/* ====================================================================== */}
      {section === 'descritiva' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Estatística Descritiva Completa (Global &amp; Estratificada)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Tendência central, dispersão, quartis, assimetria (g1), curtose (g2) e IC t de Student.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunDescriptive}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Calcular Descritiva</span>
            </button>
          </div>

          {descRes && (
            <div className="space-y-4">
              {/* Indicadores globais em faixa única com divisórias */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
                {[
                  { lbl: 'n Válidas / Ausentes', val: `${descRes.geral.nValidas} / ${descRes.geral.nAusentes}` },
                  { lbl: 'Média ± DP', val: `${fmt(descRes.geral.media)} ± ${fmt(descRes.geral.desvioPadrao)}` },
                  { lbl: 'Mediana / IQR', val: `${fmt(descRes.geral.mediana)} / ${fmt(descRes.geral.iqr)}` },
                  { lbl: 'CV Experimental', val: `${fmt(descRes.geral.cvPercent, 2)}%` },
                  { lbl: `IC ${((1 - alpha) * 100).toFixed(0)}%`, val: `[${fmt(descRes.geral.icInferior, 2)}; ${fmt(descRes.geral.icSuperior, 2)}]` },
                  { lbl: 'Assimetria / Curtose', val: `${fmt(descRes.geral.assimetria, 2)} / ${fmt(descRes.geral.curtoseExcesso, 2)}` },
                ].map((k) => (
                  <div key={k.lbl} className="px-3.5 py-3">
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">{k.lbl}</div>
                    <div className="text-xs font-semibold font-mono tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
                      {k.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabela completa */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Grupo</th>
                        <th className="py-2.5 px-3 font-semibold text-right">n</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Média</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Mediana</th>
                        <th className="py-2.5 px-3 font-semibold text-right">DP (s)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">EPM</th>
                        <th className="py-2.5 px-3 font-semibold text-right">CV%</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Mín</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Q1</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Q3</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Máx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-mono tabular-nums">
                      {[descRes.geral, ...descRes.grupos].map((g, i) => (
                        <tr key={i} className={i === 0 ? 'bg-slate-50/70 dark:bg-zinc-950/60 font-semibold' : ''}>
                          <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">{g.grupo}</td>
                          <td className="py-2 px-3 text-right">{g.nValidas}</td>
                          <td className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-400">{fmt(g.media)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.mediana)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.desvioPadrao)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.erroPadrao)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.cvPercent, 2)}%</td>
                          <td className="py-2 px-3 text-right">{fmt(g.minimo)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.q1)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.q3)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.maximo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interpretação */}
              <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-1.5">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Leitura Técnica Determinística
                </div>
                {descRes.interpretacao.map((line, i) => (
                  <p key={i} className="text-xs text-slate-600 dark:text-zinc-400">
                    • {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. DELINEAMENTOS EXPERIMENTAIS                                         */}
      {/* ====================================================================== */}
      {section === 'delineamentos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Catálogo de Delineamentos Suportados
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {(Object.keys(EXPERIMENTAL_DESIGNS_CATALOG) as TipoDelineamento[]).map((key) => {
                const d = EXPERIMENTAL_DESIGNS_CATALOG[key];
                const active = designDraft === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDesignDraft(key)}
                    className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      active
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-700'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{d.nome}</span>
                      <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                        {d.sigla}
                      </span>
                    </div>
                    {prefs.exibirFormulas && (
                      <div className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 mt-1">
                        {d.formulaModelo}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{d.descricao}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mapeamento de Colunas — {EXPERIMENTAL_DESIGNS_CATALOG[designDraft].sigla}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Vincule as variáveis experimentais exigidas pelo modelo selecionado.
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  designCompat.compativel
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {designCompat.compativel ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Estrutura Compatível</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incompatível</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Variável Resposta Principal *
                </label>
                <select
                  value={mapDraft.respostaCols?.[0] || activeResp}
                  onChange={(e) =>
                    setMapDraft((m) => ({ ...m, respostaCols: [e.target.value] }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  {cols.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {(designDraft === 'DIC' ||
                designDraft === 'DBC' ||
                designDraft === 'DQL' ||
                designDraft === 'MODELO_MISTO' ||
                designDraft === 'MEDIDAS_REPETIDAS') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    {designDraft === 'MODELO_MISTO' ? 'Fator Fixo *' : 'Tratamento'}
                  </label>
                  <select
                    value={mapDraft.tratamentoCol || ''}
                    onChange={(e) => setMapDraft((m) => ({ ...m, tratamentoCol: e.target.value || undefined }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Selecione --</option>
                    {cols.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {(designDraft === 'DBC' ||
                designDraft === 'FATORIAL' ||
                designDraft === 'PARCELA_SUBDIVIDIDA' ||
                designDraft === 'PARCELA_SUBDIVIDIDA_TEMPO' ||
                designDraft === 'FAIXAS') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Coluna de Bloco {designDraft === 'FATORIAL' ? '(Opcional p/ DBC)' : '*'}
                  </label>
                  <select
                    value={mapDraft.blocoCol || ''}
                    onChange={(e) => setMapDraft((m) => ({ ...m, blocoCol: e.target.value || undefined }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Sem bloco (DIC) --</option>
                    {cols.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {designDraft === 'DQL' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Linha (Quadrado Latino) *
                    </label>
                    <select
                      value={mapDraft.linhaCol || ''}
                      onChange={(e) => setMapDraft((m) => ({ ...m, linhaCol: e.target.value || undefined }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Selecione --</option>
                      {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Coluna (Quadrado Latino) *
                    </label>
                    <select
                      value={mapDraft.colunaCol || ''}
                      onChange={(e) => setMapDraft((m) => ({ ...m, colunaCol: e.target.value || undefined }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Selecione --</option>
                      {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </>
              )}

              {designDraft === 'FATORIAL' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Fatores do Fatorial (selecione 2 ou 3 colunas) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cols.map((c) => {
                      const checked = (mapDraft.fatoresCols || []).includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            const cur = mapDraft.fatoresCols || [];
                            const next = checked
                              ? cur.filter((x) => x !== c)
                              : cur.length < 3
                              ? [...cur, c]
                              : cur;
                            setMapDraft((m) => ({ ...m, fatoresCols: next }));
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer ${
                            checked
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(designDraft === 'PARCELA_SUBDIVIDIDA' ||
                designDraft === 'PARCELA_SUBDIVIDIDA_TEMPO' ||
                designDraft === 'FAIXAS') && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Fator A (Parcela / Faixa A) *
                    </label>
                    <select
                      value={mapDraft.parcelaCol || ''}
                      onChange={(e) => setMapDraft((m) => ({ ...m, parcelaCol: e.target.value || undefined }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Selecione --</option>
                      {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  {designDraft === 'PARCELA_SUBDIVIDIDA_TEMPO' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Fator Tempo / Época *
                      </label>
                      <select
                        value={mapDraft.tempoCol || ''}
                        onChange={(e) => setMapDraft((m) => ({ ...m, tempoCol: e.target.value || undefined }))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                      >
                        <option value="">-- Selecione --</option>
                        {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Fator B (Subparcela / Faixa B) *
                      </label>
                      <select
                        value={mapDraft.subparcelaCol || ''}
                        onChange={(e) => setMapDraft((m) => ({ ...m, subparcelaCol: e.target.value || undefined }))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                      >
                        <option value="">-- Selecione --</option>
                        {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {designDraft === 'MEDIDAS_REPETIDAS' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Unidade Experimental / Indivíduo *
                    </label>
                    <select
                      value={mapDraft.unidadeCol || ''}
                      onChange={(e) => setMapDraft((m) => ({ ...m, unidadeCol: e.target.value || undefined }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Selecione --</option>
                      {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Fator Tempo / Medição *
                    </label>
                    <select
                      value={mapDraft.tempoCol || ''}
                      onChange={(e) => setMapDraft((m) => ({ ...m, tempoCol: e.target.value || undefined }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Selecione --</option>
                      {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </>
              )}

              {designDraft === 'MODELO_MISTO' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Fator Aleatório (Ex.: Bloco / Local / Indivíduo) *
                  </label>
                  <select
                    value={mapDraft.efeitoAleatorioCol || ''}
                    onChange={(e) => setMapDraft((m) => ({ ...m, efeitoAleatorioCol: e.target.value || undefined }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Selecione --</option>
                    {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              )}

              {designDraft === 'ANINHADO' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Fator Superior (A) *
                    </label>
                    <select
                      value={mapDraft.fatorPaiCol || ''}
                      onChange={(e) => setMapDraft((m) => ({ ...m, fatorPaiCol: e.target.value || undefined }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Selecione --</option>
                      {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Fator Aninhado B(A) *
                    </label>
                    <select
                      value={mapDraft.fatorAninhadoCol || ''}
                      onChange={(e) => setMapDraft((m) => ({ ...m, fatorAninhadoCol: e.target.value || undefined }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Selecione --</option>
                      {cols.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Diagnóstico de compatibilidade ao vivo */}
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-800 dark:text-zinc-200">
                Validação Matemática Estrita ({designCompat.validRowsCount} linhas válidas)
              </div>
              {designCompat.motivos.map((m, i) => (
                <div key={i} className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </div>
              ))}
              {designCompat.avisos.map((a, i) => (
                <div key={i} className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{a}</span>
                </div>
              ))}
              {designCompat.compativel && designCompat.avisos.length === 0 && (
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Estrutura de dados compatível com {EXPERIMENTAL_DESIGNS_CATALOG[designDraft].sigla}.</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveDesignMapping}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Mapeamento</span>
              </button>
              <button
                type="button"
                disabled={!designCompat.compativel}
                onClick={async () => {
                  await handleSaveDesignMapping();
                  onNavigateSubTab('anova');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-40 whitespace-nowrap transition-colors cursor-pointer"
              >
                Avançar para ANOVA →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. ANÁLISE DE VARIÂNCIA (ANOVA)                                        */}
      {/* ====================================================================== */}
      {section === 'anova' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Análise de Variância (ANOVA) — {EXPERIMENTAL_DESIGNS_CATALOG[experimento.delineamento].nome}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {prefs.exibirFormulas && (
                  <span className="font-mono mr-2">{EXPERIMENTAL_DESIGNS_CATALOG[experimento.delineamento].formulaModelo} ·</span>
                )}
                GL, SQ, QM, F, p-valor exato, CV% e estratos de erro.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateSubTab('delineamentos')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
              >
                Delineamento
              </button>
              <button
                type="button"
                disabled={isRunning}
                onClick={handleRunAnova}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Calculando...' : 'Executar ANOVA'}</span>
              </button>
            </div>
          </div>

          {!designCompat.compativel && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-semibold">Delineamento incompatível com o banco atual:</div>
              {designCompat.motivos.map((m, i) => (
                <div key={i}>• {m}</div>
              ))}
            </div>
          )}

          {effectiveAnova && (
            <div className="space-y-4">
              {/* Resumo métrico em faixa única com divisórias */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
                {[
                  { lbl: 'Observações (N)', val: String(effectiveAnova.nObservacoes) },
                  { lbl: 'Média Geral', val: fmt(effectiveAnova.mediaGeral) },
                  { lbl: 'CV Experimental', val: `${fmt(effectiveAnova.cvExperimental, 2)}%` },
                  { lbl: 'QM Resíduo', val: fmt(effectiveAnova.qmErroPrincipal) },
                  { lbl: 'R² do Modelo', val: `${(effectiveAnova.rSquared * 100).toFixed(2)}%` },
                ].map((m) => (
                  <div key={m.lbl} className="px-3.5 py-3">
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">{m.lbl}</div>
                    <div className="text-sm font-semibold font-mono tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                      {m.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quadro da ANOVA */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Quadro da Análise de Variância ({effectiveAnova.variavelResposta})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateSubTab('pressupostos')}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Verificar Pressupostos →
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateSubTab('medias')}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Comparar Médias →
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Fonte de Variação</th>
                        <th className="py-2.5 px-3 font-semibold text-right">GL</th>
                        <th className="py-2.5 px-3 font-semibold text-right">SQ</th>
                        <th className="py-2.5 px-3 font-semibold text-right">QM</th>
                        <th className="py-2.5 px-3 font-semibold text-right">F</th>
                        <th className="py-2.5 px-3 font-semibold text-right">p-valor</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Sig.</th>
                        <th className="py-2.5 px-3 font-semibold">Erro Ref.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-mono tabular-nums">
                      {effectiveAnova.tabela.map((r, i) => (
                        <tr key={i} className={r.fonte === 'Total' ? 'font-bold bg-slate-50/70 dark:bg-zinc-950/60' : ''}>
                          <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">{r.fonte}</td>
                          <td className="py-2 px-3 text-right">{r.gl}</td>
                          <td className="py-2 px-3 text-right">{fmt(r.sq)}</td>
                          <td className="py-2 px-3 text-right">{fmt(r.qm)}</td>
                          <td className="py-2 px-3 text-right">{fmt(r.fValor, 3)}</td>
                          <td className="py-2 px-3 text-right">{fmtP(r.pValor)}</td>
                          <td
                            className={`py-2 px-3 text-center font-bold ${
                              r.significancia === 'ns' || r.significancia === '-'
                                ? 'text-slate-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {r.significancia}
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-500 dark:text-zinc-400">
                            {r.erroReferencia || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Satterthwaite & Esfericidade se houver */}
              {effectiveAnova.satterthwaiteInfo && (
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-bold">Aproximação de Satterthwaite: </span>
                  {effectiveAnova.satterthwaiteInfo.descricao}
                </div>
              )}
              {effectiveAnova.esfericidade && (
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-xs text-slate-700 dark:text-zinc-300 font-mono">
                  Esfericidade ({effectiveAnova.esfericidade.tempoFator}): ε_GG ={' '}
                  {fmt(effectiveAnova.esfericidade.epsilonGG, 3)} (p_GG = {fmtP(effectiveAnova.esfericidade.pValorGG)}) · ε_HF ={' '}
                  {fmt(effectiveAnova.esfericidade.epsilonHF, 3)} (p_HF = {fmtP(effectiveAnova.esfericidade.pValorHF)})
                </div>
              )}

              {/* Desdobramento de efeitos simples (Fatorial / Split-Plot) */}
              {effectiveAnova.desdobramentos.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Desdobramento de Efeitos Simples (Interação Fatorial / Subdividida)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
                    {effectiveAnova.desdobramentos.map((sl, i) => (
                      <div key={i} className="p-3.5 space-y-2 border-b border-slate-100 dark:border-zinc-800/70">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{sl.titulo}</span>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                            F = {fmt(sl.tabela[0]?.fValor, 3)} · p = {fmtP(sl.tabela[0]?.pValor)} ({sl.tabela[0]?.significancia})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono tabular-nums">
                          {sl.mediasGrupo.map((mg) => (
                            <div key={mg.nivel} className="flex justify-between py-0.5 border-b border-slate-100 dark:border-zinc-800/60">
                              <span className="font-sans text-slate-700 dark:text-zinc-300">{mg.nivel}</span>
                              <span>{fmt(mg.media)} ± {fmt(mg.dp, 2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interpretação */}
              <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-1.5">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Interpretação Estatística Determinística
                </div>
                {effectiveAnova.interpretacao.map((line, i) => (
                  <p key={i} className="text-xs text-slate-600 dark:text-zinc-400">
                    • {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 4. COMPARAÇÃO DE MÉDIAS                                                */}
      {/* ====================================================================== */}
      {section === 'medias' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Teste de Comparação
              </label>
              <select
                value={mcMethod}
                onChange={(e) => setMcMethod(e.target.value as MetodoComparacaoMedias)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              >
                <option value="tukey">Tukey HSD / Kramer</option>
                <option value="scott_knott">Scott-Knott (Agrupamento)</option>
                <option value="duncan">Duncan (MRT)</option>
                <option value="dunnett">Dunnett (vs Testemunha)</option>
                <option value="lsd">Fisher LSD (t)</option>
                <option value="teste_t">Teste t (Welch / Pareado)</option>
              </select>
            </div>

            {mcMethod === 'dunnett' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Testemunha (Controle)
                </label>
                <select
                  value={mcTestemunha || groupLevels[0] || ''}
                  onChange={(e) => setMcTestemunha(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  {groupLevels.map((lv) => (
                    <option key={lv} value={lv}>{lv}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                GL Resíduo (Opcional se ANOVA ativa)
              </label>
              <input
                type="number"
                value={mcCustomDfErro}
                onChange={(e) => setMcCustomDfErro(e.target.value)}
                placeholder={effectiveAnova ? String(effectiveAnova.dfErroPrincipal) : 'Automático'}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                QM Resíduo (Opcional)
              </label>
              <input
                type="number"
                step="any"
                value={mcCustomQmErro}
                onChange={(e) => setMcCustomQmErro(e.target.value)}
                placeholder={effectiveAnova ? fmt(effectiveAnova.qmErroPrincipal) : 'Automático'}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {mcMethod === 'teste_t' && (
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 cursor-pointer">
                  <input type="checkbox" checked={mcPairedT} onChange={(e) => setMcPairedT(e.target.checked)} />
                  <span>Amostras pareadas</span>
                </label>
              )}
              {mcMethod === 'dunnett' && (
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 cursor-pointer">
                  <input type="checkbox" checked={mcTwoSided} onChange={(e) => setMcTwoSided(e.target.checked)} />
                  <span>Bilateral (two-sided)</span>
                </label>
              )}
              <button
                type="button"
                onClick={handleRunMeanComparison}
                className="h-8 px-3.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Comparar Médias</span>
              </button>
            </div>
          </div>

          {mcResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Agrupamento de Médias ({mcResult.metodo.toUpperCase()})
                    </span>
                    <span className="font-mono text-slate-500 dark:text-zinc-400">
                      GL={mcResult.dfErro} · QM={fmt(mcResult.qmErro)} · Valor crítico={fmt(mcResult.valorCriticoPrincipal, 3)}
                    </span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Tratamento</th>
                        <th className="py-2.5 px-3 font-semibold text-right">n</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Média</th>
                        <th className="py-2.5 px-3 font-semibold text-right">DP</th>
                        <th className="py-2.5 px-3 font-semibold text-right">EPM</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Letras / Grupo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-mono tabular-nums">
                      {mcResult.gruposOrdenados.map((g) => (
                        <tr key={g.grupo}>
                          <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">{g.grupo}</td>
                          <td className="py-2 px-3 text-right">{g.n}</td>
                          <td className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">{fmt(g.media)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.dp)}</td>
                          <td className="py-2 px-3 text-right">{fmt(g.epm)}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-white">{g.letra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Contrastes pareados */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white">
                    Contrastes Pareados ({mcResult.comparacoesPares.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500">
                        <tr>
                          <th className="py-2 px-3">Par</th>
                          <th className="py-2 px-3 text-right">Dif.</th>
                          <th className="py-2 px-3 text-right">DMS</th>
                          <th className="py-2 px-3 text-right">p-valor</th>
                          <th className="py-2 px-3 text-center">Decisão</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-mono tabular-nums">
                        {mcResult.comparacoesPares.map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 px-3 font-sans text-slate-800 dark:text-zinc-200">
                              {p.grupoA} vs {p.grupoB}
                            </td>
                            <td className="py-1.5 px-3 text-right">{fmt(p.diferenca)}</td>
                            <td className="py-1.5 px-3 text-right">{p.dms > 0 ? fmt(p.dms) : '-'}</td>
                            <td className="py-1.5 px-3 text-right">{fmtP(p.pValor)}</td>
                            <td className={`py-1.5 px-3 text-center font-semibold ${p.significativo ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {p.significativo ? 'Difere *' : 'ns'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <ScientificChartCanvas
                  config={{
                    tipo: 'colunas',
                    titulo: `Médias (${mcResult.metodo.toUpperCase()}) — ${activeResp}`,
                    subtitulo: `Letras iguais não diferem ao nível α = ${(alpha * 100).toFixed(1)}%`,
                    eixoX: activeGroup,
                    eixoY: activeResp,
                    unidadeX: '',
                    unidadeY: '',
                    mostrarLegenda: false,
                    mostrarIC: true,
                    mostrarRotulos: true,
                    mostrarEquacao: false,
                    paleta: prefs.paletaGraficoPadrao || 'scientific_emerald',
                    casasDecimais: 2,
                  }}
                  data={{
                    items: mcResult.gruposOrdenados.map((g) => ({
                      label: g.grupo,
                      value: g.media,
                      error: g.dp,
                      letra: g.letra,
                    })),
                  }}
                />
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  {mcResult.interpretacao.map((t, i) => <div key={i}>• {t}</div>)}
                  {mcResult.observacoes.map((o, i) => (
                    <div key={`o-${i}`} className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 5. REGRESSÃO & DOSE-RESPOSTA                                           */}
      {/* ====================================================================== */}
      {section === 'regressao' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Modelo de Regressão
                </label>
                <select
                  value={regModel}
                  onChange={(e) => setRegModel(e.target.value as TipoModeloRegressao)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  <option value="linear_simples">Linear Simples (ŷ = b₀ + b₁x)</option>
                  <option value="quadratica">Polinomial Quadrática (2º grau)</option>
                  <option value="cubica">Polinomial Cúbica (3º grau)</option>
                  <option value="polinomial">Polinomial de Grau p</option>
                  <option value="linear_multipla">Linear Múltipla (com VIF)</option>
                  <option value="exponencial">Exponencial (a·e^bx)</option>
                  <option value="logaritmica">Logarítmica (a + b·ln x)</option>
                  <option value="potencia">Potência / Alométrica (a·x^b)</option>
                  <option value="logistica">Logística 3P Não Linear (LM)</option>
                </select>
              </div>

              {regModel === 'polinomial' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Grau do Polinômio (2–6)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={regPolyDeg}
                    onChange={(e) => setRegPolyDeg(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {regModel === 'quadratica' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Alvo MET (% da resposta máx.)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={99}
                    value={regMetPct}
                    onChange={(e) => setRegMetPct(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={isRunning}
                onClick={handleRunRegression}
                className="h-8 px-3.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Ajustar Regressão</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Variável(eis) Preditora(s) (X)
              </label>
              <div className="flex flex-wrap gap-2">
                {numericCols
                  .filter((c) => c !== activeResp)
                  .map((c) => {
                    const sel = regPredictors.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (regModel === 'linear_multipla') {
                            setRegPredictors((prev) =>
                              sel ? prev.filter((x) => x !== c) : [...prev, c]
                            );
                          } else {
                            setRegPredictors([c]);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer ${
                          sel
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {regResult && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 break-all">
                      {regResult.equacaoTexto}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs font-mono tabular-nums">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">R²</span>
                        <span className="font-bold">{(regResult.rSquared * 100).toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">R² aj.</span>
                        <span className="font-bold">{(regResult.adjRSquared * 100).toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">AIC</span>
                        <span className="font-bold">{regResult.aic.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">BIC</span>
                        <span className="font-bold">{regResult.bic.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coeficientes */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600">
                        <tr>
                          <th className="py-2 px-3">Parâmetro</th>
                          <th className="py-2 px-3 text-right">Estimativa</th>
                          <th className="py-2 px-3 text-right">EP</th>
                          <th className="py-2 px-3 text-right">t</th>
                          <th className="py-2 px-3 text-right">p-valor</th>
                          {regModel === 'linear_multipla' && <th className="py-2 px-3 text-right">VIF</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                        {regResult.coeficientes.map((c) => (
                          <tr key={c.nome}>
                            <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">{c.nome}</td>
                            <td className="py-2 px-3 text-right font-bold">{fmt(c.estimativa)}</td>
                            <td className="py-2 px-3 text-right">{fmt(c.erroPadrao)}</td>
                            <td className="py-2 px-3 text-right">{fmt(c.tValor, 3)}</td>
                            <td className={`py-2 px-3 text-right ${c.pValor < alpha ? 'text-emerald-600 font-bold' : ''}`}>
                              {fmtP(c.pValor)}
                            </td>
                            {regModel === 'linear_multipla' && (
                              <td className="py-2 px-3 text-right">{c.vif ? fmt(c.vif, 2) : '-'}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {regResult.avisos.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                  {regResult.doseResposta && (
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-3 text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold">Dose-Resposta / Ponto Crítico: </span>
                      {regResult.doseResposta.descricao}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 space-y-4">
                  {regResult.curvaPredita.length > 0 && (
                    <ScientificChartCanvas
                      config={{
                        tipo: 'regressao',
                        titulo: `${regResult.variavelResposta} vs ${regResult.variaveisPreditoras[0]}`,
                        subtitulo: `R² = ${(regResult.rSquared * 100).toFixed(2)}% · AIC = ${regResult.aic.toFixed(1)}`,
                        eixoX: regResult.variaveisPreditoras[0],
                        eixoY: regResult.variavelResposta,
                        unidadeX: '',
                        unidadeY: '',
                        mostrarLegenda: false,
                        mostrarIC: true,
                        mostrarRotulos: false,
                        mostrarEquacao: true,
                        paleta: prefs.paletaGraficoPadrao || 'scientific_emerald',
                        casasDecimais: 2,
                      }}
                      data={{
                        points: regResult.observacoes.map((o) => ({ x: o.x, y: o.yObservado })),
                        curve: regResult.curvaPredita,
                        equationText: regResult.equacaoTexto,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Comparativo de modelos por AICc/BIC */}
              {regComparison && regComparison.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white">
                    Comparação Multi-Modelos por Parcimônia (AICc / BIC — nunca selecionado apenas por R²)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600">
                        <tr>
                          <th className="py-2 px-3">Modelo</th>
                          <th className="py-2 px-3 text-right">R²</th>
                          <th className="py-2 px-3 text-right">R² aj.</th>
                          <th className="py-2 px-3 text-right">AICc</th>
                          <th className="py-2 px-3 text-right">BIC</th>
                          <th className="py-2 px-3 text-right">RMSE</th>
                          <th className="py-2 px-3">Avaliação Determinística</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                        {regComparison.map((c) => (
                          <tr key={c.modelo} className={c.recomendadoPorCriterio ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}>
                            <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-zinc-100">
                              {c.nomeModelo}{' '}
                              {c.recomendadoPorCriterio && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                                  · Recomendado
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">{(c.rSquared * 100).toFixed(2)}%</td>
                            <td className="py-2 px-3 text-right">{(c.adjRSquared * 100).toFixed(2)}%</td>
                            <td className="py-2 px-3 text-right font-bold">{c.aic.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right">{c.bic.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right">{fmt(c.rmse, 3)}</td>
                            <td className="py-2 px-3 font-sans text-slate-600 dark:text-zinc-400">{c.justificativa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 6. CORRELAÇÃO                                                          */}
      {/* ====================================================================== */}
      {section === 'correlacao' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <select
                  value={corrMetodo}
                  onChange={(e) => setCorrMetodo(e.target.value as MetodoCorrelacao)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  <option value="pearson">Correlação Linear de Pearson (r)</option>
                  <option value="spearman">Correlação de Postos de Spearman (ρ)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleRunCorrelation}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Calcular Matriz</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {numericCols.map((c) => {
                const active = corrVars.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setCorrVars((prev) =>
                        active ? prev.filter((x) => x !== c) : [...prev, c]
                      )
                    }
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      active
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

          {corrResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{corrResult.avisoCausalidade}</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600">
                      <tr>
                        <th className="py-2 px-3">Par de Variáveis</th>
                        <th className="py-2 px-3 text-right">{corrResult.metodo === 'pearson' ? 'r' : 'ρ'}</th>
                        <th className="py-2 px-3 text-right">n</th>
                        <th className="py-2 px-3 text-right">p-valor</th>
                        <th className="py-2 px-3 text-right">IC 95% (Fisher-Z)</th>
                        <th className="py-2 px-3">Força</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono tabular-nums">
                      {corrResult.pares.map((p, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">
                            {p.varA} × {p.varB}
                          </td>
                          <td className={`py-2 px-3 text-right font-bold ${p.significativo ? 'text-emerald-600' : ''}`}>
                            {fmt(p.coeficiente, 4)}
                          </td>
                          <td className="py-2 px-3 text-right">{p.n}</td>
                          <td className="py-2 px-3 text-right">{fmtP(p.pValor)}</td>
                          <td className="py-2 px-3 text-right">
                            {p.icInferior !== null ? `[${fmt(p.icInferior, 2)}; ${fmt(p.icSuperior, 2)}]` : '-'}
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-600 dark:text-zinc-400">
                            {p.classificacaoForca}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-6">
                <ScientificChartCanvas
                  config={{
                    tipo: 'heatmap',
                    titulo: `Matriz de Correlação (${corrResult.metodo.toUpperCase()})`,
                    subtitulo: `n pares = ${corrResult.pares.length}`,
                    eixoX: '',
                    eixoY: '',
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
                    variaveis: corrResult.variaveis,
                    matrizR: corrResult.matrizR,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 7. PRESSUPOSTOS, DIAGNÓSTICOS & TRANSFORMAÇÕES                         */}
      {/* ====================================================================== */}
      {section === 'pressupostos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Pressupostos, Diagnóstico de Resíduos &amp; Transformação
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Shapiro-Wilk, Levene, Bartlett, Durbin-Watson, Distância de Cook e transformações sem alterar os dados brutos.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunAssumptions}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auditar Pressupostos</span>
            </button>
          </div>

          {assumpResult && (
            <div className="space-y-4">
              {/* Faixa unificada dos 3 pressupostos */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
                <div className="p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-xs gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">Normalidade (Shapiro-Wilk)</span>
                    <span className={assumpResult.normalidade.atendido ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}>
                      {assumpResult.normalidade.atendido ? 'Atendido' : 'Desvio'}
                    </span>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                    W = {fmt(assumpResult.normalidade.estatisticaW, 4)} · p = {fmtP(assumpResult.normalidade.pValor)}
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-xs gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">Homocedasticidade</span>
                    <span className={assumpResult.homogeneidade.leveneMedia?.atendido !== false ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}>
                      {assumpResult.homogeneidade.leveneMedia?.atendido !== false ? 'Atendido' : 'Desvio'}
                    </span>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                    Levene p = {fmtP(assumpResult.homogeneidade.leveneMedia?.pValor)} · Med. p = {fmtP(assumpResult.homogeneidade.leveneMediana?.pValor)} · Bart. p = {fmtP(assumpResult.homogeneidade.bartlett?.pValor)}
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-xs gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">Independência (DW)</span>
                    <span className={!assumpResult.independencia.alertaDependencia ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                      {!assumpResult.independencia.alertaDependencia ? 'Atendido' : 'Alerta'}
                    </span>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                    DW = {fmt(assumpResult.independencia.durbinWatson, 3)} · ρ₁ = {fmt(assumpResult.independencia.autocorrelacaoLag1, 3)}
                  </div>
                </div>
              </div>

              {/* Gráficos diagnósticos Q-Q Plot e Resíduos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScientificChartCanvas
                  config={{
                    tipo: 'qqplot',
                    titulo: `Q-Q Plot Normal — ${activeResp}`,
                    subtitulo: `Shapiro-Wilk W = ${fmt(assumpResult.normalidade.estatisticaW, 4)} (p = ${fmtP(assumpResult.normalidade.pValor)})`,
                    eixoX: 'Quantis Teóricos Normal (Z)',
                    eixoY: 'Resíduos Padronizados',
                    unidadeX: '',
                    unidadeY: '',
                    mostrarLegenda: false,
                    mostrarIC: false,
                    mostrarRotulos: false,
                    mostrarEquacao: false,
                    paleta: prefs.paletaGraficoPadrao || 'scientific_emerald',
                    casasDecimais: 2,
                  }}
                  data={{
                    points: assumpResult.normalidade.qqPoints.map((q) => ({
                      x: q.teoricoZ,
                      y: q.residuoPadronizado,
                    })),
                  }}
                />
                <ScientificChartCanvas
                  config={{
                    tipo: 'residuos',
                    titulo: `Resíduos Padronizados × Ordem — ${activeResp}`,
                    subtitulo: 'Faixas tracejadas em ±2 desvios padrão',
                    eixoX: 'Índice da Observação',
                    eixoY: 'Resíduo Padronizado',
                    unidadeX: '',
                    unidadeY: '',
                    mostrarLegenda: false,
                    mostrarIC: false,
                    mostrarRotulos: false,
                    mostrarEquacao: false,
                    paleta: prefs.paletaGraficoPadrao || 'scientific_emerald',
                    casasDecimais: 2,
                  }}
                  data={{
                    points: assumpResult.diagnosticoObservacoes.map((d) => ({
                      x: d.obsIndex,
                      y: d.residuoPadronizado,
                    })),
                  }}
                />
              </div>

              <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="font-bold">{assumpResult.recomendacaoTransformacao}</div>
                {assumpResult.interpretacao.map((line, i) => (
                  <div key={i}>• {line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Bloco explícito e opcional de Transformação de Dados (nunca automático!) */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Transformação Explícita e Controlada de Variável (Opcional)
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                A transformação cria uma nova coluna derivada no conjunto de trabalho; os valores originais e o arquivo OPFS bruto permanecem intactos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Método de Transformação
                </label>
                <select
                  value={transMethod}
                  onChange={(e) => setTransMethod(e.target.value as TransformacaoDados)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  <option value="log10">Log10(x)</option>
                  <option value="ln">Logaritmo Natural Ln(x)</option>
                  <option value="raiz">Raiz Quadrada √x</option>
                  <option value="raiz_mais_05">Raiz(x + 0,5) [com zeros]</option>
                  <option value="arcoseno_raiz">Arcoseno √p [proporções / %]</option>
                  <option value="box_cox">Box-Cox (MLE ótimo)</option>
                </select>
              </div>

              {transMethod === 'box_cox' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    λ (vazio = estimar ótimo)
                  </label>
                  <input
                    type="text"
                    value={customLambda}
                    onChange={(e) => setCustomLambda(e.target.value)}
                    placeholder="Ex: 0.5 ou automático"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Sufixo da Nova Coluna
                </label>
                <input
                  type="text"
                  value={newColSuffix}
                  onChange={(e) => setNewColSuffix(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={handlePreviewTransform}
                className="h-8 px-3 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
              >
                Pré-visualizar
              </button>

              <button
                type="button"
                disabled={!transPreviewStats}
                onClick={handleApplyTransformAsNewColumn}
                className="h-8 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-40 whitespace-nowrap transition-colors cursor-pointer"
              >
                Salvar Nova Coluna
              </button>
            </div>

            {transPreviewStats && (
              <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 text-xs font-mono text-slate-700 dark:text-zinc-300 space-y-1">
                <div>
                  Prévia ({activeResp}{newColSuffix}): {transPreviewStats.validCount} valores válidos · mín={fmt(transPreviewStats.min)} · máx={fmt(transPreviewStats.max)}
                  {transPreviewStats.lambdaUsed !== undefined && ` · λ ótimo MLE = ${transPreviewStats.lambdaUsed}`}
                </div>
                {transPreviewStats.warnings.map((w, i) => (
                  <div key={i} className="font-sans flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
