import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import { opfsWasmDB } from '../services/opfsWasmDatabase';
import { createFullBackup, validateAndInspectBackup, restoreBackup } from '../services/backupService';
import { estatisticaStorage } from '../modules/estatistica/storage/estatisticaStorage';
import {
  computeDescriptiveForArray,
  runDescriptiveAnalysis,
} from '../modules/estatistica/statistics-engine/descriptive/descriptiveStats';
import { validateDesignCompatibility } from '../modules/estatistica/statistics-engine/designs/experimentalDesigns';
import { runAnova } from '../modules/estatistica/statistics-engine/anova/anovaEngine';
import { runMeanComparison } from '../modules/estatistica/statistics-engine/mean-comparison/meanComparison';
import {
  runRegressionAnalysis,
  compareCandidateRegressions,
} from '../modules/estatistica/statistics-engine/regression/regressionEngine';
import { runCorrelationAnalysis } from '../modules/estatistica/statistics-engine/correlation/correlationEngine';
import {
  runAssumptionDiagnostics,
  estimateBoxCoxLambda,
  applyDataTransformation,
} from '../modules/estatistica/statistics-engine/assumptions/assumptionsEngine';
import {
  runKruskalWallis,
  runMannWhitney,
  runWilcoxonPaired,
  runFriedmanTest,
} from '../modules/estatistica/statistics-engine/nonparametric/nonParametricEngine';
import {
  runPcaAnalysis,
  runHierarchicalClustering,
  runKMeansClustering,
} from '../modules/estatistica/statistics-engine/multivariate/multivariateEngine';
import {
  runMannKendallAnalysis,
  runLogisticRegression,
  runCategoricalContingency,
  runKaplanMeierAnalysis,
} from '../modules/estatistica/statistics-engine/special/specialAnalysesEngine';
import {
  parsePastedTabularText,
  convertWideToLong,
  convertLongToWide,
  inferVariablesFromDataset,
  validateDataset,
} from '../modules/estatistica/data-import/spreadsheetImporter';

describe('GeaAgro Estatística — Suíte Científica, OPFS+WASM e Backup', () => {
  it('1. Estatística Descritiva: calcula métricas exatas, quartis, CV% e IC', () => {
    const vals = [10, 12, 14, 16, 18, 20, null, 0];
    const res = computeDescriptiveForArray(vals, { grupo: 'Geral', variavel: 'Produtividade' });
    expect(res.nTotal).toBe(8);
    expect(res.nValidas).toBe(7);
    expect(res.nAusentes).toBe(1);
    expect(res.nZeros).toBe(1);
    expect(res.media).toBeCloseTo(90 / 7, 5);
    expect(res.mediana).toBeCloseTo(14, 5);
    expect(res.minimo).toBe(0);
    expect(res.maximo).toBe(20);
    expect(res.icInferior).toBeLessThan(res.media);
    expect(res.icSuperior).toBeGreaterThan(res.media);

    const grouped = runDescriptiveAnalysis(
      [
        { Trat: 'T1', Y: 50 },
        { Trat: 'T1', Y: 52 },
        { Trat: 'T2', Y: 60 },
        { Trat: 'T2', Y: 62 },
      ],
      'Y',
      'Trat'
    );
    expect(grouped.grupos.length).toBe(2);
    expect(grouped.grupos.find((g) => g.grupo === 'T2')?.media).toBeCloseTo(61, 5);
  });

  it('2. ANOVA DIC e DBC: tabela exata, F, p-valor, R² e CV%', () => {
    // DIC clássico 3 tratamentos × 4 repetições
    const dicRows = [
      { Trat: 'A', Y: 20 }, { Trat: 'A', Y: 22 }, { Trat: 'A', Y: 21 }, { Trat: 'A', Y: 23 },
      { Trat: 'B', Y: 30 }, { Trat: 'B', Y: 32 }, { Trat: 'B', Y: 31 }, { Trat: 'B', Y: 29 },
      { Trat: 'C', Y: 40 }, { Trat: 'C', Y: 41 }, { Trat: 'C', Y: 39 }, { Trat: 'C', Y: 42 },
    ];
    const dicAnova = runAnova({
      delineamento: 'DIC',
      mapeamento: { respostaCols: ['Y'], tratamentoCol: 'Trat' },
      rows: dicRows,
      responseCol: 'Y',
    });
    expect(dicAnova.nObservacoes).toBe(12);
    expect(dicAnova.dfErroPrincipal).toBe(9);
    expect(dicAnova.qmErroPrincipal).toBeCloseTo(5 / 3, 4);
    expect(dicAnova.tabela[0].gl).toBe(2);
    expect(dicAnova.tabela[0].fValor).toBeCloseTo(216.8, 2);
    expect(dicAnova.tabela[0].pValor!).toBeLessThan(0.0001);

    // DBC 3 tratamentos × 4 blocos
    const dbcRows = [
      { Trat: 'T1', Bloco: 'B1', Y: 10 }, { Trat: 'T2', Bloco: 'B1', Y: 15 }, { Trat: 'T3', Bloco: 'B1', Y: 20 },
      { Trat: 'T1', Bloco: 'B2', Y: 12 }, { Trat: 'T2', Bloco: 'B2', Y: 17 }, { Trat: 'T3', Bloco: 'B2', Y: 22 },
      { Trat: 'T1', Bloco: 'B3', Y: 14 }, { Trat: 'T2', Bloco: 'B3', Y: 19 }, { Trat: 'T3', Bloco: 'B3', Y: 24 },
      { Trat: 'T1', Bloco: 'B4', Y: 16 }, { Trat: 'T2', Bloco: 'B4', Y: 21 }, { Trat: 'T3', Bloco: 'B4', Y: 26 },
    ];
    const dbcAnova = runAnova({
      delineamento: 'DBC',
      mapeamento: { respostaCols: ['Y'], tratamentoCol: 'Trat', blocoCol: 'Bloco' },
      rows: dbcRows,
      responseCol: 'Y',
    });
    expect(dbcAnova.tabela.find((r) => r.fonte.includes('Bloco'))?.gl).toBe(3);
    expect(dbcAnova.dfErroPrincipal).toBe(6);
    expect(dbcAnova.qmErroPrincipal).toBeCloseTo(0, 6);
  });

  it('3. Quadrado Latino (DQL), Fatorial 2x2 com Desdobramento e Split-Plot (Erro A e Erro B)', () => {
    // DQL 4x4
    const dqlRows = [
      { L: 1, C: 1, T: 'A', Y: 25 }, { L: 1, C: 2, T: 'B', Y: 30 }, { L: 1, C: 3, T: 'C', Y: 35 }, { L: 1, C: 4, T: 'D', Y: 40 },
      { L: 2, C: 1, T: 'B', Y: 31 }, { L: 2, C: 2, T: 'C', Y: 36 }, { L: 2, C: 3, T: 'D', Y: 41 }, { L: 2, C: 4, T: 'A', Y: 26 },
      { L: 3, C: 1, T: 'C', Y: 37 }, { L: 3, C: 2, T: 'D', Y: 42 }, { L: 3, C: 3, T: 'A', Y: 27 }, { L: 3, C: 4, T: 'B', Y: 32 },
      { L: 4, C: 1, T: 'D', Y: 43 }, { L: 4, C: 2, T: 'A', Y: 28 }, { L: 4, C: 3, T: 'B', Y: 33 }, { L: 4, C: 4, T: 'C', Y: 38 },
    ];
    const dqlRes = runAnova({
      delineamento: 'DQL',
      mapeamento: { respostaCols: ['Y'], tratamentoCol: 'T', linhaCol: 'L', colunaCol: 'C' },
      rows: dqlRows,
      responseCol: 'Y',
    });
    expect(dqlRes.dfErroPrincipal).toBe(6);
    expect(dqlRes.tabela.some((r) => r.fonte.includes('Linha'))).toBe(true);
    expect(dqlRes.tabela.some((r) => r.fonte.includes('Coluna'))).toBe(true);

    // Fatorial 2x2 em DBC com interação significativa -> gera desdobramentos
    const fatRows = [
      { A: 'A1', B: 'B1', Bl: '1', Y: 10.2 }, { A: 'A1', B: 'B2', Bl: '1', Y: 30.4 },
      { A: 'A2', B: 'B1', Bl: '1', Y: 28.1 }, { A: 'A2', B: 'B2', Bl: '1', Y: 11.8 },
      { A: 'A1', B: 'B1', Bl: '2', Y: 11.4 }, { A: 'A1', B: 'B2', Bl: '2', Y: 31.0 },
      { A: 'A2', B: 'B1', Bl: '2', Y: 28.9 }, { A: 'A2', B: 'B2', Bl: '2', Y: 13.3 },
      { A: 'A1', B: 'B1', Bl: '3', Y: 9.1 },  { A: 'A1', B: 'B2', Bl: '3', Y: 28.7 },
      { A: 'A2', B: 'B1', Bl: '3', Y: 27.3 }, { A: 'A2', B: 'B2', Bl: '3', Y: 10.9 },
    ];
    const fatRes = runAnova({
      delineamento: 'FATORIAL',
      mapeamento: { respostaCols: ['Y'], fatoresCols: ['A', 'B'], blocoCol: 'Bl' },
      rows: fatRows,
      responseCol: 'Y',
    });
    const interRow = fatRes.tabela.find((r) => r.fonte.includes('×'));
    expect(interRow?.pValor!).toBeLessThan(0.001);
    expect(fatRes.desdobramentos.length).toBeGreaterThan(0);

    // Split-Plot em DBC (2 parcelas × 2 subparcelas × 3 blocos)
    const spRows = [
      { P: 'P1', S: 'S1', Bl: '1', Y: 20 }, { P: 'P1', S: 'S2', Bl: '1', Y: 25 },
      { P: 'P2', S: 'S1', Bl: '1', Y: 30 }, { P: 'P2', S: 'S2', Bl: '1', Y: 38 },
      { P: 'P1', S: 'S1', Bl: '2', Y: 22 }, { P: 'P1', S: 'S2', Bl: '2', Y: 27 },
      { P: 'P2', S: 'S1', Bl: '2', Y: 31 }, { P: 'P2', S: 'S2', Bl: '2', Y: 39 },
      { P: 'P1', S: 'S1', Bl: '3', Y: 21 }, { P: 'P1', S: 'S2', Bl: '3', Y: 26 },
      { P: 'P2', S: 'S1', Bl: '3', Y: 33 }, { P: 'P2', S: 'S2', Bl: '3', Y: 40 },
    ];
    const spRes = runAnova({
      delineamento: 'PARCELA_SUBDIVIDIDA',
      mapeamento: { respostaCols: ['Y'], parcelaCol: 'P', subparcelaCol: 'S', blocoCol: 'Bl' },
      rows: spRows,
      responseCol: 'Y',
    });
    expect(spRes.estratosErro.length).toBeGreaterThanOrEqual(2);
    expect(spRes.satterthwaiteInfo).toBeDefined();
  });

  it('4. Rejeição estrita de delineamento incompatível', () => {
    const invalidDbc = validateDesignCompatibility(
      'DBC',
      { respostaCols: ['Y'], tratamentoCol: 'Trat', blocoCol: 'Bloco' },
      [
        { Trat: 'A', Bloco: 'Unico', Y: 10 },
        { Trat: 'B', Bloco: 'Unico', Y: 20 },
      ],
      'Y'
    );
    expect(invalidDbc.compativel).toBe(false);
    expect(() =>
      runAnova({
        delineamento: 'DBC',
        mapeamento: { respostaCols: ['Y'], tratamentoCol: 'Trat', blocoCol: 'Bloco' },
        rows: [
          { Trat: 'A', Bloco: 'Unico', Y: 10 },
          { Trat: 'B', Bloco: 'Unico', Y: 20 },
        ],
        responseCol: 'Y',
      })
    ).toThrow();
  });

  it('5. Comparação de Médias: Tukey, Scott-Knott, Duncan, Dunnett e Fisher LSD', () => {
    const grupos = [
      { grupo: 'Testemunha', valores: [10, 11, 10, 9] },
      { grupo: 'Dose 50', valores: [20, 21, 19, 20] },
      { grupo: 'Dose 100', valores: [30, 31, 29, 30] },
    ];
    const tukey = runMeanComparison({ metodo: 'tukey', grupos, dfErro: 9, qmErro: 0.67, alpha: 0.05 });
    expect(tukey.gruposOrdenados[0].grupo).toBe('Dose 100');
    expect(tukey.gruposOrdenados[0].letra).not.toBe(tukey.gruposOrdenados[2].letra);

    const sk = runMeanComparison({ metodo: 'scott_knott', grupos, dfErro: 9, qmErro: 0.67, alpha: 0.05 });
    expect(new Set(sk.gruposOrdenados.map((g) => g.letra)).size).toBe(3);

    const duncan = runMeanComparison({ metodo: 'duncan', grupos, dfErro: 9, qmErro: 0.67, alpha: 0.05 });
    expect(duncan.comparacoesPares.every((p) => p.significativo)).toBe(true);

    const dunnett = runMeanComparison({
      metodo: 'dunnett',
      grupos,
      dfErro: 9,
      qmErro: 0.67,
      alpha: 0.05,
      testemunha: 'Testemunha',
    });
    expect(dunnett.comparacoesPares.length).toBe(2);
    expect(dunnett.comparacoesPares.every((p) => p.significativo)).toBe(true);

    const lsdUnprot = runMeanComparison({
      metodo: 'lsd',
      grupos,
      dfErro: 9,
      qmErro: 0.67,
      anovaSignificativa: false,
    });
    expect(lsdUnprot.observacoes.some((o) => o.toLowerCase().includes('não foi significativa'))).toBe(true);
  });

  it('6. Regressão Linear, Quadrática com MET/Máximo e Comparação por AIC/BIC', () => {
    const quadRows = [
      { N: 0, Prod: 40 },
      { N: 50, Prod: 65 },
      { N: 100, Prod: 80 },
      { N: 150, Prod: 85 },
      { N: 200, Prod: 80 },
      { N: 250, Prod: 65 },
    ];
    const quad = runRegressionAnalysis({
      modelo: 'quadratica',
      rows: quadRows,
      responseCol: 'Prod',
      predictorCols: ['N'],
      metTargetPercent: 0.95,
    });
    expect(quad.rSquared).toBeGreaterThan(0.99);
    expect(quad.doseResposta?.tipoPonto).toBe('maximo');
    expect(quad.doseResposta?.pontoCriticoX).toBeCloseTo(150, 1);
    expect(quad.doseResposta?.dentroDoIntervaloExperimental).toBe(true);

    const comp = compareCandidateRegressions(quadRows, 'Prod', 'N');
    expect(comp.find((c) => c.recomendadoPorCriterio)?.modelo).toBe('quadratica');
  });

  it('7. Correlação Pearson & Spearman + Aviso obrigatório de causalidade', () => {
    const rows = [
      { X: 1, Y: 2, Z: 10 },
      { X: 2, Y: 4, Z: 8 },
      { X: 3, Y: 6, Z: 6 },
      { X: 4, Y: 8, Z: 4 },
      { X: 5, Y: 10, Z: 2 },
    ];
    const pRes = runCorrelationAnalysis({ rows, variaveis: ['X', 'Y', 'Z'], metodo: 'pearson' });
    expect(pRes.matrizR[0][1]).toBeCloseTo(1, 5);
    expect(pRes.matrizR[0][2]).toBeCloseTo(-1, 5);
    expect(pRes.avisoCausalidade.toLowerCase()).toContain('causa e efeito');

    const sRes = runCorrelationAnalysis({ rows, variaveis: ['X', 'Y', 'Z'], metodo: 'spearman' });
    expect(sRes.matrizR[0][1]).toBeCloseTo(1, 5);
  });

  it('8. Pressupostos (Shapiro-Wilk, Levene, Bartlett, DW, Cook) e Transformação sem mutar original', () => {
    const dic = runAnova({
      delineamento: 'DIC',
      mapeamento: { respostaCols: ['Y'], tratamentoCol: 'T' },
      rows: [
        { T: 'A', Y: 10.2 }, { T: 'A', Y: 9.8 }, { T: 'A', Y: 10.1 }, { T: 'A', Y: 9.9 },
        { T: 'B', Y: 20.3 }, { T: 'B', Y: 19.7 }, { T: 'B', Y: 20.1 }, { T: 'B', Y: 19.9 },
      ],
      responseCol: 'Y',
    });
    const diag = runAssumptionDiagnostics({
      residuos: dic.residuos,
      residuosPadronizados: dic.residuosPadronizados,
      residuosStudentizados: dic.residuosStudentizados,
      alavancagem: dic.alavancagem,
      distanciaCook: dic.distanciaCook,
      observacoesIndices: dic.observacoesIndices,
      gruposParaVariancia: [
        [10.2, 9.8, 10.1, 9.9],
        [20.3, 19.7, 20.1, 19.9],
      ],
    });
    expect(diag.normalidade.estatisticaW).toBeGreaterThan(0.5);
    expect(diag.homogeneidade.leveneMedia?.pValor).toBeGreaterThan(0.05);
    expect(diag.independencia.durbinWatson).toBeGreaterThan(0);

    const orig = [1, 4, 9, 16, 25];
    const lam = estimateBoxCoxLambda(orig);
    expect(lam).toBeGreaterThanOrEqual(-2);
    expect(lam).toBeLessThanOrEqual(2);
    const { transformed } = applyDataTransformation(orig, 'raiz');
    expect(transformed).toEqual([1, 2, 3, 4, 5]);
    expect(orig).toEqual([1, 4, 9, 16, 25]);
  });

  it('9. Testes Não Paramétricos: Kruskal-Wallis + Dunn, Mann-Whitney, Wilcoxon Pareado e Friedman', () => {
    const kw = runKruskalWallis([
      { grupo: 'G1', valores: [1, 2, 3, 2, 1] },
      { grupo: 'G2', valores: [10, 11, 12, 11, 10] },
      { grupo: 'G3', valores: [20, 21, 22, 21, 20] },
    ]);
    expect(kw.pValor).toBeLessThan(0.01);
    expect(kw.postHocDunn.length).toBe(3);

    const mw = runMannWhitney(
      { nome: 'Controle', valores: [5, 6, 7, 5, 6] },
      { nome: 'Tratado', valores: [15, 16, 17, 15, 16] }
    );
    expect(mw.significativo).toBe(true);

    const wil = runWilcoxonPaired([10, 12, 14, 16, 18, 20], [5, 6, 8, 9, 11, 13]);
    expect(wil.significativo).toBe(true);

    const frRows = [
      { B: 'B1', T: 'T1', Y: 10 }, { B: 'B1', T: 'T2', Y: 20 }, { B: 'B1', T: 'T3', Y: 30 },
      { B: 'B2', T: 'T1', Y: 12 }, { B: 'B2', T: 'T2', Y: 22 }, { B: 'B2', T: 'T3', Y: 32 },
      { B: 'B3', T: 'T1', Y: 11 }, { B: 'B3', T: 'T2', Y: 21 }, { B: 'B3', T: 'T3', Y: 31 },
      { B: 'B4', T: 'T1', Y: 13 }, { B: 'B4', T: 'T2', Y: 23 }, { B: 'B4', T: 'T3', Y: 33 },
    ];
    const fr = runFriedmanTest(frRows, 'T', 'B', 'Y');
    expect(fr.pValor).toBeLessThan(0.05);
  });

  it('10. Análise Multivariada: PCA, HCA (Ward) e K-Means com Silhouette', () => {
    const mvRows = [
      { Nome: 'C1', V1: 10, V2: 11, V3: 2 },
      { Nome: 'C2', V1: 11, V2: 10, V3: 3 },
      { Nome: 'C3', V1: 12, V2: 12, V3: 2.5 },
      { Nome: 'C4', V1: 50, V2: 52, V3: 40 },
      { Nome: 'C5', V1: 51, V2: 49, V3: 42 },
      { Nome: 'C6', V1: 52, V2: 51, V3: 41 },
    ];
    const pca = runPcaAnalysis({
      rows: mvRows,
      variaveis: ['V1', 'V2', 'V3'],
      matrizTipo: 'correlacao',
      labelCol: 'Nome',
    });
    expect(pca.varianciaExplicadaPct[0]).toBeGreaterThan(95);

    const hca = runHierarchicalClustering({
      rows: mvRows,
      variaveis: ['V1', 'V2', 'V3'],
      metricaDistancia: 'euclidiana',
      metodoLigacao: 'ward',
      padronizarZ: true,
      kGrupos: 2,
      labelCol: 'Nome',
    });
    expect(hca.atribuicoes.filter((a) => a.cluster === 1).length).toBe(3);

    const km = runKMeansClustering({
      rows: mvRows,
      variaveis: ['V1', 'V2', 'V3'],
      k: 2,
      padronizarZ: true,
      labelCol: 'Nome',
    });
    expect(km.silhuetaMedia).toBeGreaterThan(0.7);
  });

  it('11. Análises Especiais: Mann-Kendall, Logística IRLS, Qui-Quadrado/Fisher e Kaplan-Meier', () => {
    const mk = runMannKendallAnalysis([10, 12, 15, 18, 22, 25, 29, 34]);
    expect(mk.tendencia).toBe('crescente');
    expect(mk.inclinacaoSen).toBeGreaterThan(2);

    const logRows = [
      { Dose: 0, Morto: '0' }, { Dose: 1, Morto: '0' }, { Dose: 2, Morto: '0' }, { Dose: 3, Morto: '0' },
      { Dose: 4, Morto: '0' }, { Dose: 6, Morto: '1' }, { Dose: 7, Morto: '1' }, { Dose: 8, Morto: '1' },
      { Dose: 9, Morto: '1' }, { Dose: 10, Morto: '1' },
    ];
    const logRes = runLogisticRegression({
      rows: logRows,
      responseCol: 'Morto',
      predictorCols: ['Dose'],
      positiveValue: '1',
    });
    expect(logRes.acuraciaClassificacao).toBeGreaterThanOrEqual(0.8);

    const contRows = [
      ...Array.from({ length: 18 }, () => ({ Manejo: 'Biológico', Status: 'Sadio' })),
      ...Array.from({ length: 2 }, () => ({ Manejo: 'Biológico', Status: 'Doente' })),
      ...Array.from({ length: 4 }, () => ({ Manejo: 'Testemunha', Status: 'Sadio' })),
      ...Array.from({ length: 16 }, () => ({ Manejo: 'Testemunha', Status: 'Doente' })),
    ];
    const cont = runCategoricalContingency(contRows, 'Manejo', 'Status');
    expect(cont.pValorChi2).toBeLessThan(0.001);
    expect(cont.fisherExatoP).toBeLessThan(0.001);

    const kmRows = [
      { T: 10, E: 1, G: 'A' }, { T: 20, E: 1, G: 'A' }, { T: 30, E: 0, G: 'A' },
      { T: 40, E: 1, G: 'B' }, { T: 50, E: 0, G: 'B' }, { T: 60, E: 1, G: 'B' },
    ];
    const kmRes = runKaplanMeierAnalysis({ rows: kmRows, timeCol: 'T', eventCol: 'E', groupCol: 'G' });
    expect(kmRes.curvas.length).toBe(2);
    expect(kmRes.logRankPValor).toBeDefined();
  });

  it('12. Importação Tabular, Conversão Wide↔Long e Validação de Integridade', () => {
    const csv = 'Bloco;T1;T2\n1;45.2;52.1\n2;47.0;54.3';
    const parsed = parsePastedTabularText(csv);
    expect(parsed.columns).toEqual(['Bloco', 'T1', 'T2']);
    expect(parsed.rows.length).toBe(2);

    const long = convertWideToLong({
      rows: parsed.rows,
      treatmentCols: ['T1', 'T2'],
      idCol: 'Bloco',
      tratColName: 'Tratamento',
      repColName: 'Bloco',
      valColName: 'Produtividade',
    });
    expect(long.rows.length).toBe(4);

    const wideBack = convertLongToWide({
      rows: long.rows,
      tratCol: 'Tratamento',
      valCol: 'Produtividade',
    });
    expect(wideBack.columns).toEqual(['Repeticao', 'T1', 'T2']);

    const vars = inferVariablesFromDataset('exp1', long.columns, long.rows);
    expect(vars.find((v) => v.nome === 'Tratamento')?.papel).toBe('tratamento');

    const val = validateDataset({
      columns: long.columns,
      rows: long.rows,
      variaveis: vars,
      delineamento: 'DBC',
      mapeamento: { respostaCols: ['Produtividade'], tratamentoCol: 'Tratamento', blocoCol: 'Bloco' },
    });
    expect(val.compatibilidadeDelineamento.compativel).toBe(true);
  });

  it('13. Persistência OPFS+WASM + Checksum, CRUD GeaAgroOfflineDB e Backup Round-Trip Completo', async () => {
    const proj = await estatisticaStorage.salvarProjeto({
      nome: 'Ensaio Soja 2026',
      descricao: 'Avaliação de cultivares',
      categoria: 'Melhoramento Genético',
      pesquisador: 'Eng. Agr. Teste',
      instituicao: 'UFV',
      culturaOuArea: 'Soja',
      localidade: 'Rio Verde - GO',
      tags: ['soja', 'dbc'],
      status: 'ativo',
    });

    const exp = await estatisticaStorage.salvarExperimento({
      projetoId: proj.id,
      nome: 'Ensaio DBC Inoculação',
      descricao: '4 blocos × 3 doses',
      objetivo: 'Avaliar produtividade',
      delineamento: 'DBC',
      mapeamento: { respostaCols: ['Prod'], tratamentoCol: 'Trat', blocoCol: 'Bloco' },
      alphaPadrao: 0.05,
      status: 'pronto',
    });

    const rawText = 'Trat;Bloco;Prod\nT1;1;60.5';
    const rawBytes = new TextEncoder().encode(rawText);
    const savedRaw = await estatisticaStorage.salvarArquivoOriginalOpfs(
      exp.id,
      'dados_teste.csv',
      rawBytes,
      'text/csv'
    );

    const ds = await estatisticaStorage.salvarConjuntoDados({
      id: `ds_${exp.id}`,
      experimentoId: exp.id,
      formato: 'longo',
      colunas: ['Trat', 'Bloco', 'Prod'],
      linhasWorking: [{ Trat: 'T1', Bloco: '1', Prod: 60.5 }],
      rawArtifactKey: savedRaw.artifactKey,
      rawFileName: 'dados_teste.csv',
      rawMimeType: 'text/csv',
      rawChecksum: savedRaw.checksum,
      temDadosOriginaisPreservados: true,
      validacao: {
        totalLinhas: 1,
        totalColunas: 3,
        celulasVazias: 0,
        celulasNA: 0,
        celulasZero: 0,
        celulasInvalidasNumericas: 0,
        linhasDuplicadas: [],
        desbalanceado: false,
        observacoesPorGrupo: { T1: 1 },
        problemas: [],
        compatibilidadeDelineamento: { compativel: true, motivos: [], avisos: [] },
      },
      versao: 1,
    });

    expect(ds.rawChecksum).toBe(savedRaw.checksum);
    const readRaw = await estatisticaStorage.lerArquivoOriginalOpfs(ds.rawArtifactKey!);
    expect(readRaw).not.toBeNull();
    expect(readRaw!.checksumValid).toBe(true);
    expect(new TextDecoder().decode(readRaw!.bytes)).toBe(rawText);

    // Criar backup completo e validar presença do módulo estatistica + arquivos OPFS
    const backup = await createFullBackup({
      userResponsible: 'Pesquisador Teste',
      encryption: { mode: 'none' },
    });
    expect(backup.backupFile.manifest.modulesIncluded).toContain('estatistica');
    expect(
      backup.backupFile.rawPayload?.opfsData?.files &&
        Object.keys(backup.backupFile.rawPayload.opfsData.files).includes(ds.rawArtifactKey!)
    ).toBe(true);

    const inspection = await validateAndInspectBackup(backup.jsonString);
    expect(inspection.isValid).toBe(true);

    // Excluir e restaurar via backupService
    await estatisticaStorage.excluirProjeto(proj.id);
    const projetosAntes = await estatisticaStorage.listarProjetos();
    expect(projetosAntes.some((p) => p.id === proj.id)).toBe(false);

    const restored = await restoreBackup(backup.backupFile);
    expect(restored.success).toBe(true);

    const projetosDepois = await estatisticaStorage.listarProjetos();
    expect(projetosDepois.some((p) => p.id === proj.id)).toBe(true);
    const readRestoredRaw = await estatisticaStorage.lerArquivoOriginalOpfs(ds.rawArtifactKey!);
    expect(readRestoredRaw).not.toBeNull();

    // Limpeza final para manter banco limpo sem dados pré-populados
    await estatisticaStorage.excluirProjeto(proj.id);
  });

  it('14. Nema IA Estatística — Integração de Módulo, Restrições de UI e Importação de Arquivos Gerados', async () => {
    // 1. Criar projeto e experimento limpos
    const proj = await estatisticaStorage.salvarProjeto({
      nome: 'Ensaio Biométrico Nema IA',
      categoria: 'Experimentação Agrícola',
      descricao: 'Teste automatizado Nema IA',
      pesquisador: 'Pesquisador',
      instituicao: 'GeaAgro',
      culturaOuArea: 'Milho',
      localidade: 'Campo 1',
      tags: ['NemaIA'],
      status: 'ativo',
    });
    const exp = await estatisticaStorage.salvarExperimento({
      projetoId: proj.id,
      nome: 'Doses N Milho 2026',
      descricao: 'Ensaio de doses',
      objetivo: 'Produtividade',
      delineamento: 'DBC',
      mapeamento: { respostaCols: [] },
      alphaPadrao: 0.05,
      status: 'pronto',
    });

    // 2. Simular geração de arquivo pela Nema IA Estatística (CSV estruturado)
    const simulatedGeneratedCsv = [
      'Tratamento,Bloco,Produtividade_sc_ha,Massa_Mil_Graos_g',
      'Controle,Bloco_1,85.2,280',
      'Controle,Bloco_2,83.4,275',
      'Dose_100kg,Bloco_1,118.5,315',
      'Dose_100kg,Bloco_2,121.0,320',
      'Dose_200kg,Bloco_1,134.2,340',
      'Dose_200kg,Bloco_2,132.8,338',
    ].join('\n');

    // 3. Importar para o dataset via estatisticaStorage
    const parsed = Papa.parse(simulatedGeneratedCsv, { header: true, dynamicTyping: true, skipEmptyLines: true });
    const rows = parsed.data as Record<string, any>[];
    const cols = parsed.meta.fields || [];

    const ds = await estatisticaStorage.salvarConjuntoDados({
      id: `ds_${exp.id}`,
      experimentoId: exp.id,
      formato: 'longo',
      colunas: cols,
      linhasWorking: rows,
      rawArtifactKey: null,
      rawFileName: 'gerado_nema_ia_dbc.csv',
      rawMimeType: 'text/csv',
      rawChecksum: null,
      temDadosOriginaisPreservados: false,
      validacao: {
        totalLinhas: rows.length,
        totalColunas: cols.length,
        celulasVazias: 0,
        celulasNA: 0,
        celulasZero: 0,
        celulasInvalidasNumericas: 0,
        linhasDuplicadas: [],
        desbalanceado: false,
        observacoesPorGrupo: {},
        problemas: [],
        compatibilidadeDelineamento: { compativel: true, motivos: [], avisos: [] },
      },
      versao: 1,
    });

    expect(ds.linhasWorking.length).toBe(6);
    expect(ds.colunas).toEqual(['Tratamento', 'Bloco', 'Produtividade_sc_ha', 'Massa_Mil_Graos_g']);

    // 4. Salvar variáveis inferidas
    for (const c of cols) {
      await estatisticaStorage.salvarVariavel({
        experimentoId: exp.id,
        nome: c,
        rotulo: c,
        unidade: '',
        tipo: c.includes('sc') || c.includes('Mil') ? 'quantitativa_continua' : 'categorica',
        papel: c.toLowerCase().includes('trat') ? 'tratamento' : c.toLowerCase().includes('bloc') ? 'bloco' : 'resposta',
        transformacao: 'nenhuma',
      });
    }

    const vars = await estatisticaStorage.listarVariaveis(exp.id);
    expect(vars.length).toBe(4);
    expect(vars.find((v) => v.papel === 'tratamento')?.nome).toBe('Tratamento');
    expect(vars.find((v) => v.papel === 'bloco')?.nome).toBe('Bloco');

    // 5. Executar ANOVA nos dados gerados pela IA
    const anovaRes = runAnova({
      delineamento: 'DBC',
      mapeamento: {
        respostaCols: ['Produtividade_sc_ha'],
        tratamentoCol: 'Tratamento',
        blocoCol: 'Bloco',
      },
      rows: ds.linhasWorking,
      responseCol: 'Produtividade_sc_ha',
    });

    expect(anovaRes.cvExperimental).toBeLessThan(10);
    const tratRow = anovaRes.tabela.find((r) => r.fonte.includes('Tratamento'));
    expect(tratRow?.pValor).toBeDefined();
    expect(tratRow!.pValor!).toBeLessThan(0.05);

    // Limpeza
    await estatisticaStorage.excluirProjeto(proj.id);
  });
});
