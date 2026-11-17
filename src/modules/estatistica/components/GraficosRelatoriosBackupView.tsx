import React, { useMemo, useRef, useState } from 'react';
import {
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Save,
  Trash2,
} from 'lucide-react';
import {
  ConfiguracaoGraficoCientifico,
  EstatisticaConjuntoDados,
  EstatisticaExperimento,
  EstatisticaGrafico,
  EstatisticaProjeto,
  EstatisticaResultado,
  EstatisticaUiPreferences,
  EstatisticaVariavel,
} from '../types/estatistica';
import { estatisticaStorage } from '../storage/estatisticaStorage';
import { parseNumericCell } from '../statistics-engine/designs/experimentalDesigns';
import {
  downloadSvgElement,
  downloadSvgElementAsPng,
  exportSvgElementToPngDataUrl,
  ScientificChartCanvas,
} from '../charts/ScientificChartCanvas';
import {
  exportDatasetToCsv,
  exportProjectReportJson,
  exportResultsToXlsx,
  exportScientificReportPdf,
} from '../reports/reportExporter';

export type OutputSection = 'graficos' | 'relatorios';

interface GraficosRelatoriosBackupViewProps {
  section: OutputSection;
  projeto: EstatisticaProjeto | null;
  experimento: EstatisticaExperimento | null;
  dataset: EstatisticaConjuntoDados | null;
  variaveis: EstatisticaVariavel[];
  resultados: EstatisticaResultado[];
  graficos: EstatisticaGrafico[];
  prefs: EstatisticaUiPreferences;
  onRefresh: () => Promise<void>;
}

export const GraficosRelatoriosBackupView: React.FC<GraficosRelatoriosBackupViewProps> = ({
  section,
  projeto,
  experimento,
  dataset,
  variaveis,
  resultados,
  graficos,
  prefs,
  onRefresh,
}) => {
  const rows = dataset?.linhasWorking || [];
  const cols = dataset?.colunas || [];

  const numericCols = useMemo(() => {
    const marked = variaveis
      .filter((v) => v.tipo === 'quantitativa_continua' || v.tipo === 'quantitativa_discreta')
      .map((v) => v.nome);
    if (marked.length > 0) return marked;
    return cols.filter((c) => rows.some((r) => parseNumericCell(r[c]) !== null));
  }, [variaveis, cols, rows]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const reportGraphRefs = useRef<Record<string, SVGSVGElement | null>>({});

  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [sourceMode, setSourceMode] = useState<'dataset' | 'resultado'>('dataset');
  const [selectedResultadoId, setSelectedResultadoId] = useState<string>(resultados[0]?.id || '');

  const [xCol, setXCol] = useState<string>(experimento?.mapeamento.tratamentoCol || cols[0] || '');
  const [yCol, setYCol] = useState<string>(
    experimento?.mapeamento.respostaCols?.[0] || numericCols[0] || cols[0] || ''
  );

  const [chartConfig, setChartConfig] = useState<ConfiguracaoGraficoCientifico>({
    tipo: 'colunas',
    titulo: experimento ? `Distribuição — ${experimento.nome}` : 'Gráfico Científico',
    subtitulo: projeto ? `${projeto.nome}` : '',
    eixoX: experimento?.mapeamento.tratamentoCol || cols[0] || 'Tratamento',
    eixoY: experimento?.mapeamento.respostaCols?.[0] || numericCols[0] || 'Resposta',
    unidadeX: '',
    unidadeY: '',
    mostrarLegenda: false,
    mostrarIC: true,
    mostrarRotulos: true,
    mostrarEquacao: true,
    paleta: prefs.paletaGraficoPadrao || 'scientific_emerald',
    casasDecimais: 2,
  });

  // Estado de Relatórios
  const [selectedResIds, setSelectedResIds] = useState<string[]>(() => resultados.map((r) => r.id));
  const [selectedGraphIds, setSelectedGraphIds] = useState<string[]>(() => graficos.map((g) => g.id));
  const [observacoesAutor, setObservacoesAutor] = useState<string>('');
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  React.useEffect(() => {
    setSelectedResIds(resultados.map((r) => r.id));
  }, [resultados]);

  React.useEffect(() => {
    setSelectedGraphIds(graficos.map((g) => g.id));
  }, [graficos]);

  // Montar dados de plotagem dinamicamente conforme fonte selecionada
  const computedPlotData = useMemo(() => {
    if (sourceMode === 'resultado') {
      const res = resultados.find((r) => r.id === selectedResultadoId) || resultados[0];
      if (!res) return {};
      if (res.categoria === 'comparacao_medias' && Array.isArray(res.dados?.gruposOrdenados)) {
        return {
          items: res.dados.gruposOrdenados.map((g: any) => ({
            label: g.grupo,
            value: g.media,
            error: g.dp,
            letra: g.letra,
          })),
        };
      }
      if (res.categoria === 'anova' && Array.isArray(res.dados?.mediasTratamentos)) {
        return {
          items: res.dados.mediasTratamentos.map((g: any) => ({
            label: g.grupo,
            value: g.media,
            error: g.dp,
          })),
        };
      }
      if (res.categoria === 'regressao' && res.dados?.observacoes) {
        return {
          points: res.dados.observacoes.map((o: any) => ({ x: o.x, y: o.yObservado })),
          curve: res.dados.curvaPredita || [],
          equationText: res.dados.equacaoTexto,
        };
      }
      if (res.categoria === 'correlacao' && res.dados?.matrizR) {
        return { variaveis: res.dados.variaveis, matrizR: res.dados.matrizR };
      }
      if (res.categoria === 'multivariada' && res.dados?.scores) {
        return {
          scores: res.dados.scores,
          loadings: res.dados.loadings,
          pc1Label: `CP1 (${res.dados.varianciaExplicadaPct?.[0]?.toFixed(1) ?? ''}%)`,
          pc2Label: `CP2 (${res.dados.varianciaExplicadaPct?.[1]?.toFixed(1) ?? ''}%)`,
        };
      }
      if (res.categoria === 'multivariada' && res.dados?.dendrograma) {
        return {
          dendrograma: res.dados.dendrograma,
          labels: (res.dados.atribuicoes || []).map((a: any) => a.rotulo),
        };
      }
      if (res.categoria === 'pressupostos' && res.dados?.normalidade) {
        if (chartConfig.tipo === 'qqplot') {
          return {
            points: res.dados.normalidade.qqPoints.map((q: any) => ({
              x: q.teoricoZ,
              y: q.residuoPadronizado,
            })),
          };
        }
        return {
          points: (res.dados.diagnosticoObservacoes || []).map((d: any) => ({
            x: d.obsIndex,
            y: d.residuoPadronizado,
          })),
        };
      }
      return {};
    }

    // Fonte: conjunto de trabalho
    const colX = xCol || cols[0];
    const colY = yCol || numericCols[0] || cols[0];
    if (!colX || !colY || rows.length === 0) return {};

    if (chartConfig.tipo === 'histograma') {
      return {
        values: rows
          .map((r) => parseNumericCell(r[colY]))
          .filter((v): v is number => v !== null),
      };
    }

    if (chartConfig.tipo === 'dispersao' || chartConfig.tipo === 'linhas' || chartConfig.tipo === 'regressao') {
      const pts = rows
        .map((r, idx) => {
          const xv = parseNumericCell(r[colX]);
          const yv = parseNumericCell(r[colY]);
          return { x: xv !== null ? xv : idx + 1, y: yv };
        })
        .filter((p): p is { x: number; y: number } => p.y !== null);
      return { points: pts };
    }

    // Agrupar por colX (colunas, barras, boxplot)
    const map = new Map<string, number[]>();
    for (const r of rows) {
      const g = r[colX] !== null && r[colX] !== undefined ? String(r[colX]).trim() : '';
      const v = parseNumericCell(r[colY]);
      if (g && v !== null) {
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push(v);
      }
    }

    if (chartConfig.tipo === 'boxplot') {
      return {
        groups: Array.from(map.entries()).map(([label, values]) => ({ label, values })),
      };
    }

    return {
      items: Array.from(map.entries()).map(([label, values]) => {
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const ss = values.reduce((s, v) => s + (v - mean) * (v - mean), 0);
        const sd = values.length > 1 ? Math.sqrt(ss / (values.length - 1)) : 0;
        return { label, value: mean, error: sd };
      }),
    };
  }, [sourceMode, selectedResultadoId, resultados, xCol, yCol, cols, numericCols, rows, chartConfig.tipo]);

  const handleSaveChart = async () => {
    if (!experimento) return;
    setMsg(null);
    try {
      await estatisticaStorage.salvarGrafico({
        experimentoId: experimento.id,
        resultadoId: sourceMode === 'resultado' ? selectedResultadoId : undefined,
        nome: chartConfig.titulo || `Gráfico ${chartConfig.tipo}`,
        configuracao: chartConfig,
        dadosPlotagem: computedPlotData,
      });
      setMsg({ type: 'ok', text: 'Gráfico científico salvo no experimento (GeaAgroOfflineDB).' });
      await onRefresh();
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.message || 'Erro ao salvar gráfico.' });
    }
  };

  const handleExportPdf = async () => {
    if (!experimento) return;
    setExportingPdf(true);
    setMsg(null);
    try {
      const chosenResults = resultados.filter((r) => selectedResIds.includes(r.id));
      const chosenGraphs = graficos.filter((g) => selectedGraphIds.includes(g.id));
      const graficosImagens: { titulo: string; pngDataUrl: string }[] = [];

      for (const g of chosenGraphs) {
        const svgEl = reportGraphRefs.current[g.id];
        if (svgEl) {
          const png = await exportSvgElementToPngDataUrl(svgEl, 2);
          graficosImagens.push({ titulo: g.configuracao.titulo || g.nome, pngDataUrl: png });
        }
      }

      await exportScientificReportPdf({
        projeto,
        experimento,
        dataset,
        resultadosSelecionados: chosenResults,
        graficosImagens,
        observacoesAutor,
      });

      await estatisticaStorage.registrarHistorico({
        projetoId: projeto?.id,
        experimentoId: experimento.id,
        acao: 'relatorio',
        entidade: 'Relatório PDF',
        descricao: `Exportado relatório PDF com ${chosenResults.length} resultado(s) e ${graficosImagens.length} gráfico(s).`,
      });
      setMsg({ type: 'ok', text: 'Relatório científico PDF gerado e baixado offline.' });
      await onRefresh();
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.message || 'Erro ao exportar PDF.' });
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-medium ${
            msg.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
          }`}
        >
          <span>{msg.text}</span>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 1. GERADOR DE GRÁFICOS CIENTÍFICOS                                     */}
      {/* ====================================================================== */}
      {section === 'graficos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Personalização do Gráfico Científico
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceMode('dataset')}
                className={`py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                  sourceMode === 'dataset'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                }`}
              >
                Dados do Experimento
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('resultado')}
                className={`py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                  sourceMode === 'resultado'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                }`}
              >
                Resultado Salvo ({resultados.length})
              </button>
            </div>

            {sourceMode === 'resultado' ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Resultado Estatístico Fonte
                </label>
                <select
                  value={selectedResultadoId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedResultadoId(id);
                    const found = resultados.find((r) => r.id === id);
                    if (found?.categoria === 'regressao') setChartConfig((c) => ({ ...c, tipo: 'regressao', titulo: found.titulo }));
                    else if (found?.categoria === 'correlacao') setChartConfig((c) => ({ ...c, tipo: 'heatmap', titulo: found.titulo }));
                    else if (found?.categoria === 'multivariada' && found.dados?.scores) setChartConfig((c) => ({ ...c, tipo: 'biplot', titulo: found.titulo }));
                    else if (found?.categoria === 'multivariada' && found.dados?.dendrograma) setChartConfig((c) => ({ ...c, tipo: 'dendrograma', titulo: found.titulo }));
                    else if (found?.categoria === 'comparacao_medias' || found?.categoria === 'anova') setChartConfig((c) => ({ ...c, tipo: 'colunas', titulo: found.titulo }));
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                >
                  {resultados.length === 0 && <option value="">Nenhum resultado salvo ainda</option>}
                  {resultados.map((r) => (
                    <option key={r.id} value={r.id}>{r.titulo}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Eixo X / Grupo
                  </label>
                  <select
                    value={xCol}
                    onChange={(e) => setXCol(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  >
                    {cols.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Eixo Y (Numérica)
                  </label>
                  <select
                    value={yCol}
                    onChange={(e) => setYCol(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  >
                    {(numericCols.length ? numericCols : cols).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Tipo de Gráfico (12)
                </label>
                <select
                  value={chartConfig.tipo}
                  onChange={(e) => setChartConfig((c) => ({ ...c, tipo: e.target.value as any }))}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                >
                  <option value="colunas">Colunas + Erro</option>
                  <option value="barras">Barras Horizontais</option>
                  <option value="boxplot">Boxplot Científico</option>
                  <option value="histograma">Histograma + Normal</option>
                  <option value="dispersao">Dispersão (XY)</option>
                  <option value="linhas">Linhas</option>
                  <option value="regressao">Regressão + IC</option>
                  <option value="residuos">Resíduos (±2σ)</option>
                  <option value="qqplot">Q-Q Plot Normal</option>
                  <option value="heatmap">Heatmap Correlação</option>
                  <option value="biplot">Biplot PCA</option>
                  <option value="dendrograma">Dendrograma HCA</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Paleta Científica
                </label>
                <select
                  value={chartConfig.paleta}
                  onChange={(e) => setChartConfig((c) => ({ ...c, paleta: e.target.value as any }))}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                >
                  <option value="scientific_emerald">Esmeralda GeaAgro</option>
                  <option value="high_contrast_colorblind">Okabe-Ito (Daltonismo)</option>
                  <option value="cobalt_amber">Cobalto & Âmbar</option>
                  <option value="monochrome_paper">Monocromático (Artigo P&B)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Título e Subtítulo
              </label>
              <input
                type="text"
                value={chartConfig.titulo}
                onChange={(e) => setChartConfig((c) => ({ ...c, titulo: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 mb-1.5"
              />
              <input
                type="text"
                value={chartConfig.subtitulo}
                onChange={(e) => setChartConfig((c) => ({ ...c, subtitulo: e.target.value }))}
                placeholder="Subtítulo opcional"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={chartConfig.eixoX}
                onChange={(e) => setChartConfig((c) => ({ ...c, eixoX: e.target.value }))}
                placeholder="Rótulo Eixo X"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
              />
              <input
                type="text"
                value={chartConfig.unidadeX}
                onChange={(e) => setChartConfig((c) => ({ ...c, unidadeX: e.target.value }))}
                placeholder="Unidade X (ex: kg/ha)"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
              />
              <input
                type="text"
                value={chartConfig.eixoY}
                onChange={(e) => setChartConfig((c) => ({ ...c, eixoY: e.target.value }))}
                placeholder="Rótulo Eixo Y"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
              />
              <input
                type="text"
                value={chartConfig.unidadeY}
                onChange={(e) => setChartConfig((c) => ({ ...c, unidadeY: e.target.value }))}
                placeholder="Unidade Y (ex: sc/ha)"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
              />
            </div>

            <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 dark:text-zinc-400">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chartConfig.mostrarIC}
                  onChange={(e) => setChartConfig((c) => ({ ...c, mostrarIC: e.target.checked }))}
                />
                <span>Barras Erro / IC</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chartConfig.mostrarRotulos}
                  onChange={(e) => setChartConfig((c) => ({ ...c, mostrarRotulos: e.target.checked }))}
                />
                <span>Rótulos / Letras</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chartConfig.mostrarEquacao}
                  onChange={(e) => setChartConfig((c) => ({ ...c, mostrarEquacao: e.target.checked }))}
                />
                <span>Equação</span>
              </label>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              {experimento && (
                <button
                  type="button"
                  onClick={handleSaveChart}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar no Experimento</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => svgRef.current && downloadSvgElementAsPng(svgRef.current, chartConfig.titulo || 'grafico')}
                className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                PNG (2x)
              </button>
              <button
                type="button"
                onClick={() => svgRef.current && downloadSvgElement(svgRef.current, chartConfig.titulo || 'grafico')}
                className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                SVG
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <ScientificChartCanvas ref={svgRef} config={chartConfig} data={computedPlotData} />

            {graficos.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Gráficos Salvos no Experimento ({graficos.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {graficos.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setChartConfig(g.configuracao)}
                        className="text-left font-medium text-slate-800 dark:text-zinc-200 hover:text-emerald-600 truncate cursor-pointer"
                      >
                        {g.nome} ({g.configuracao.tipo})
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await estatisticaStorage.excluirGrafico(g.id);
                          await onRefresh();
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Excluir gráfico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. RELATÓRIOS & EXPORTAÇÃO                                             */}
      {/* ====================================================================== */}
      {section === 'relatorios' && (
        <div className="space-y-5">
          {!experimento ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500">
              Selecione um experimento ativo para compor e exportar relatórios técnicos.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Composição do Relatório Técnico-Científico — {experimento.nome}
                </h3>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Resultados Estatísticos para Incluir ({selectedResIds.length}/{resultados.length})
                  </div>
                  {resultados.length === 0 ? (
                    <div className="text-xs text-slate-400 py-3">
                      Nenhuma análise executada neste experimento ainda.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {resultados.map((r) => {
                        const checked = selectedResIds.includes(r.id);
                        return (
                          <label
                            key={r.id}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setSelectedResIds((prev) =>
                                    e.target.checked ? [...prev, r.id] : prev.filter((x) => x !== r.id)
                                  )
                                }
                              />
                              <span className="font-medium text-slate-900 dark:text-white truncate">{r.titulo}</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 shrink-0">
                              {new Date(r.criadoEm).toLocaleDateString('pt-BR')}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Gráficos Científicos Embutidos no PDF ({selectedGraphIds.length}/{graficos.length})
                  </div>
                  {graficos.length === 0 ? (
                    <div className="text-xs text-slate-400 py-2">
                      Salve gráficos na aba Gráficos Científicos para incorporá-los automaticamente no PDF.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {graficos.map((g) => {
                        const checked = selectedGraphIds.includes(g.id);
                        return (
                          <label
                            key={g.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setSelectedGraphIds((prev) =>
                                  e.target.checked ? [...prev, g.id] : prev.filter((x) => x !== g.id)
                                )
                              }
                            />
                            <span className="font-medium text-slate-900 dark:text-white">{g.nome}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Notas Metodológicas / Conclusões do Pesquisador
                  </label>
                  <textarea
                    rows={3}
                    value={observacoesAutor}
                    onChange={(e) => setObservacoesAutor(e.target.value)}
                    placeholder="Observações de campo, condições edafoclimáticas ou recomendações agronômicas..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Exportação 100% Offline
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Todos os arquivos são compilados localmente no navegador sem envio a servidores externos.
                </p>

                <button
                  type="button"
                  disabled={exportingPdf}
                  onClick={handleExportPdf}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{exportingPdf ? 'Gerando PDF...' : 'Exportar Relatório Científico PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportResultsToXlsx({
                      projeto,
                      experimento,
                      dataset,
                      resultadosSelecionados: resultados.filter((r) => selectedResIds.includes(r.id)),
                    })
                  }
                  className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Exportar Planilha XLSX Multi-Abas</span>
                </button>

                {dataset && (
                  <button
                    type="button"
                    onClick={() => exportDatasetToCsv(dataset, experimento.nome)}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Dados de Trabalho (CSV)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    exportProjectReportJson({
                      projeto,
                      experimento,
                      dataset,
                      resultadosSelecionados: resultados.filter((r) => selectedResIds.includes(r.id)),
                    })
                  }
                  className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>Exportar JSON Auditável (OPFS + Checksums)</span>
                </button>
              </div>
            </div>
          )}

          {/* Renderizador invisível de gráficos selecionados para captura SVG→PNG 2x no PDF */}
          <div className="sr-only" aria-hidden="true">
            {graficos
              .filter((g) => selectedGraphIds.includes(g.id))
              .map((g) => (
                <ScientificChartCanvas
                  key={g.id}
                  ref={(el) => {
                    reportGraphRefs.current[g.id] = el;
                  }}
                  config={g.configuracao}
                  data={g.dadosPlotagem}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
