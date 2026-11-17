import React, { useState, useRef } from 'react';
import {
  Upload,
  ClipboardPaste,
  Table2,
  Plus,
  Trash2,
  ArrowLeftRight,
  ShieldCheck,
  Download,
  Save,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  CelulaValor,
  DelineamentoMapeamento,
  EstatisticaConjuntoDados,
  EstatisticaExperimento,
  EstatisticaVariavel,
  PapelVariavel,
  TipoVariavel,
} from '../types/estatistica';
import {
  ParsedSpreadsheetPreview,
  convertLongToWide,
  convertWideToLong,
  inferVariablesFromDataset,
  parsePastedTabularText,
  parseSpreadsheetFile,
  validateDataset,
} from '../data-import/spreadsheetImporter';
import { estatisticaStorage } from '../storage/estatisticaStorage';
import { EXPERIMENTAL_DESIGNS_CATALOG } from '../statistics-engine/designs/experimentalDesigns';

interface DadosImportacaoViewProps {
  experimento: EstatisticaExperimento | null;
  dataset: EstatisticaConjuntoDados | null;
  variaveis: EstatisticaVariavel[];
  onRefresh: () => Promise<void>;
}

const PAPEIS_VARIAVEL: { value: PapelVariavel; label: string }[] = [
  { value: 'resposta', label: 'Variável Resposta (Y)' },
  { value: 'tratamento', label: 'Tratamento' },
  { value: 'fator_a', label: 'Fator A' },
  { value: 'fator_b', label: 'Fator B' },
  { value: 'fator_c', label: 'Fator C' },
  { value: 'bloco', label: 'Bloco' },
  { value: 'linha', label: 'Linha (DQL)' },
  { value: 'coluna', label: 'Coluna (DQL)' },
  { value: 'repeticao', label: 'Repetição' },
  { value: 'parcela', label: 'Parcela (Fator Principal)' },
  { value: 'subparcela', label: 'Subparcela (Fator Secundário)' },
  { value: 'tempo', label: 'Tempo / Época' },
  { value: 'unidade_experimental', label: 'Unidade Experimental / Indivíduo' },
  { value: 'dose', label: 'Dose / Concentração / Preditora X' },
  { value: 'covariavel', label: 'Covariável' },
  { value: 'ignorar', label: 'Ignorar / Rótulo Auxiliar' },
];

const TIPOS_VARIAVEL: { value: TipoVariavel; label: string }[] = [
  { value: 'quantitativa_continua', label: 'Quantitativa Contínua' },
  { value: 'quantitativa_discreta', label: 'Quantitativa Discreta' },
  { value: 'qualitativa_nominal', label: 'Qualitativa Nominal' },
  { value: 'qualitativa_ordinal', label: 'Qualitativa Ordinal' },
  { value: 'categorica', label: 'Categórica / Fator' },
];

export const DadosImportacaoView: React.FC<DadosImportacaoViewProps> = ({
  experimento,
  dataset,
  variaveis,
  onRefresh,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingPreview, setPendingPreview] = useState<ParsedSpreadsheetPreview | null>(null);
  const [selectedFileForSheet, setSelectedFileForSheet] = useState<File | null>(null);

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualColsText, setManualColsText] = useState('Tratamento, Bloco, Resposta');
  const [manualRowsCount, setManualRowsCount] = useState(8);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertDir, setConvertDir] = useState<'wide_to_long' | 'long_to_wide'>('wide_to_long');
  const [selectedWideCols, setSelectedWideCols] = useState<string[]>([]);
  const [wideIdCol, setWideIdCol] = useState<string>('');
  const [longTratCol, setLongTratCol] = useState<string>('');
  const [longValCol, setLongValCol] = useState<string>('');

  const [newColName, setNewColName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [checksumStatus, setChecksumStatus] = useState<string | null>(null);

  if (!experimento) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
        Selecione ou crie um experimento na aba Projetos e Experimentos antes de importar ou digitar dados.
      </div>
    );
  }

  const persistWorkingChanges = async (
    cols: string[],
    rows: Record<string, CelulaValor>[],
    varsList: Omit<EstatisticaVariavel, 'id' | 'criadoEm'>[],
    formato: 'longo' | 'largo',
    rawMeta?: { artifactKey: string; fileName: string; mimeType: string; checksum: number }
  ) => {
    setSaving(true);
    try {
      const validacao = validateDataset({
        columns: cols,
        rows,
        variaveis: varsList,
        delineamento: experimento.delineamento,
        mapeamento: experimento.mapeamento,
      });

      const savedVars = await estatisticaStorage.substituirVariaveisExperimento(
        experimento.id,
        varsList
      );

      // Auto-preencher mapeamento apenas para campos ainda vazios com base nos papéis definidos
      const nextMap: DelineamentoMapeamento = { ...experimento.mapeamento };
      const respVars = savedVars.filter((v) => v.papel === 'resposta').map((v) => v.nome);
      if (respVars.length > 0) nextMap.respostaCols = respVars;
      const findByRole = (role: PapelVariavel) => savedVars.find((v) => v.papel === role)?.nome;
      if (!nextMap.tratamentoCol) nextMap.tratamentoCol = findByRole('tratamento');
      if (!nextMap.blocoCol) nextMap.blocoCol = findByRole('bloco');
      if (!nextMap.linhaCol) nextMap.linhaCol = findByRole('linha');
      if (!nextMap.colunaCol) nextMap.colunaCol = findByRole('coluna');
      if (!nextMap.parcelaCol) nextMap.parcelaCol = findByRole('parcela') || findByRole('fator_a');
      if (!nextMap.subparcelaCol)
        nextMap.subparcelaCol = findByRole('subparcela') || findByRole('fator_b');
      if (!nextMap.tempoCol) nextMap.tempoCol = findByRole('tempo');
      if (!nextMap.unidadeCol) nextMap.unidadeCol = findByRole('unidade_experimental');
      if (!nextMap.fatoresCols || nextMap.fatoresCols.length === 0) {
        const fCols = savedVars
          .filter((v) => ['fator_a', 'fator_b', 'fator_c', 'tratamento'].includes(v.papel))
          .map((v) => v.nome);
        if (fCols.length >= 2) nextMap.fatoresCols = fCols;
      }

      await estatisticaStorage.salvarExperimento({
        ...experimento,
        mapeamento: nextMap,
        status: validacao.compatibilidadeDelineamento.compativel ? 'pronto' : 'rascunho',
      });

      await estatisticaStorage.salvarConjuntoDados({
        id: dataset?.id || `ds_${experimento.id}`,
        experimentoId: experimento.id,
        formato,
        colunas: cols,
        linhasWorking: rows,
        rawArtifactKey: rawMeta?.artifactKey ?? dataset?.rawArtifactKey ?? null,
        rawFileName: rawMeta?.fileName ?? dataset?.rawFileName ?? null,
        rawMimeType: rawMeta?.mimeType ?? dataset?.rawMimeType ?? null,
        rawChecksum: rawMeta?.checksum ?? dataset?.rawChecksum ?? null,
        temDadosOriginaisPreservados: Boolean(
          rawMeta?.artifactKey || dataset?.rawArtifactKey
        ),
        transformacaoAtiva: dataset?.transformacaoAtiva || null,
        validacao,
        versao: dataset?.versao || 1,
      });

      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const preview = await parseSpreadsheetFile(file);
      setSelectedFileForSheet(file);
      if (preview.sheetNames.length > 1) {
        setPendingPreview(preview);
      } else {
        await commitImportedPreview(preview);
      }
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.message || 'Erro ao ler planilha.' });
    } finally {
      e.target.value = '';
    }
  };

  const commitImportedPreview = async (preview: ParsedSpreadsheetPreview) => {
    if (!preview.columns.length) {
      setMsg({ type: 'err', text: 'A planilha selecionada não possui colunas identificáveis.' });
      return;
    }
    setSaving(true);
    try {
      const rawSaved = await estatisticaStorage.salvarArquivoOriginalOpfs(
        experimento.id,
        preview.fileName,
        preview.rawBytes,
        preview.mimeType
      );
      const inferredVars = inferVariablesFromDataset(
        experimento.id,
        preview.columns,
        preview.rows
      );
      await persistWorkingChanges(preview.columns, preview.rows, inferredVars, 'longo', {
        artifactKey: rawSaved.artifactKey,
        fileName: preview.fileName,
        mimeType: preview.mimeType,
        checksum: rawSaved.checksum,
      });
      setPendingPreview(null);
      setSelectedFileForSheet(null);
      setMsg({
        type: 'ok',
        text: `Planilha "${preview.fileName}" importada (${preview.rows.length} linhas × ${preview.columns.length} colunas). Cópia bruta preservada no OPFS (checksum ${rawSaved.checksum}).`,
      });
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.message || 'Erro ao salvar dados importados.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCommitPaste = async () => {
    if (!pasteText.trim()) return;
    try {
      const parsed = parsePastedTabularText(pasteText);
      if (!parsed.columns.length || !parsed.rows.length) {
        setMsg({ type: 'err', text: 'Nenhum dado tabular válido encontrado na colagem.' });
        return;
      }
      const rawSaved = await estatisticaStorage.salvarArquivoOriginalOpfs(
        experimento.id,
        `colagem_manual_${Date.now()}.tsv`,
        parsed.rawBytes,
        'text/tab-separated-values'
      );
      const inferredVars = inferVariablesFromDataset(experimento.id, parsed.columns, parsed.rows);
      await persistWorkingChanges(parsed.columns, parsed.rows, inferredVars, 'longo', {
        artifactKey: rawSaved.artifactKey,
        fileName: 'Colagem direta de planilha',
        mimeType: 'text/tab-separated-values',
        checksum: rawSaved.checksum,
      });
      setShowPasteModal(false);
      setPasteText('');
      setMsg({
        type: 'ok',
        text: `Importadas ${parsed.rows.length} linhas via área de transferência e preservadas em OPFS.`,
      });
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.message || 'Erro ao processar texto colado.' });
    }
  };

  const handleCreateManualGrid = async () => {
    const cols = manualColsText
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (cols.length < 2) {
      setMsg({ type: 'err', text: 'Informe ao menos 2 colunas separadas por vírgula.' });
      return;
    }
    const nRows = Math.max(2, Math.min(200, manualRowsCount));
    const blankRows: Record<string, CelulaValor>[] = Array.from({ length: nRows }, () => {
      const r: Record<string, CelulaValor> = {};
      cols.forEach((c) => {
        r[c] = null;
      });
      return r;
    });
    const inferredVars = inferVariablesFromDataset(experimento.id, cols, blankRows);
    await persistWorkingChanges(cols, blankRows, inferredVars, 'longo');
    setShowManualModal(false);
    setMsg({
      type: 'ok',
      text: `Grade manual criada (${nRows} linhas × ${cols.length} colunas). Preencha as células abaixo.`,
    });
  };

  const handleCellEdit = (rowIdx: number, col: string, rawStr: string) => {
    if (!dataset) return;
    let parsed: CelulaValor = null;
    const tr = rawStr.trim();
    if (tr === '') parsed = null;
    else if (tr.toUpperCase() === 'NA' || tr.toUpperCase() === 'N/A') parsed = 'N/A';
    else {
      const normalized = /^-?\d+,\d+$/.test(tr) ? tr.replace(',', '.') : tr;
      const num = Number(normalized);
      parsed = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(normalized) && Number.isFinite(num) ? num : tr;
    }

    const updatedRows = dataset.linhasWorking.map((r, idx) =>
      idx === rowIdx ? { ...r, [col]: parsed } : r
    );
    const varsClean = variaveis.map(({ id: _i, criadoEm: _c, ...rest }) => rest);
    void persistWorkingChanges(dataset.colunas, updatedRows, varsClean, dataset.formato);
  };

  const handleAddRow = async () => {
    if (!dataset) return;
    const emptyRow: Record<string, CelulaValor> = {};
    dataset.colunas.forEach((c) => {
      emptyRow[c] = null;
    });
    const varsClean = variaveis.map(({ id: _i, criadoEm: _c, ...rest }) => rest);
    await persistWorkingChanges(
      dataset.colunas,
      [...dataset.linhasWorking, emptyRow],
      varsClean,
      dataset.formato
    );
  };

  const handleDeleteRow = async (idx: number) => {
    if (!dataset) return;
    const updated = dataset.linhasWorking.filter((_, i) => i !== idx);
    const varsClean = variaveis.map(({ id: _i, criadoEm: _c, ...rest }) => rest);
    await persistWorkingChanges(dataset.colunas, updated, varsClean, dataset.formato);
  };

  const handleAddColumn = async () => {
    if (!dataset || !newColName.trim()) return;
    const col = newColName.trim();
    if (dataset.colunas.includes(col)) return;
    const cols = [...dataset.colunas, col];
    const rows = dataset.linhasWorking.map((r) => ({ ...r, [col]: null }));
    const varsClean = [
      ...variaveis.map(({ id: _i, criadoEm: _c, ...rest }) => rest),
      {
        experimentoId: experimento.id,
        nome: col,
        rotulo: col,
        unidade: '',
        tipo: 'quantitativa_continua' as TipoVariavel,
        papel: 'resposta' as PapelVariavel,
        transformacao: 'nenhuma' as const,
        origemColuna: col,
      },
    ];
    await persistWorkingChanges(cols, rows, varsClean, dataset.formato);
    setNewColName('');
  };

  const handleUpdateVariavelMeta = async (
    v: EstatisticaVariavel,
    patch: Partial<Pick<EstatisticaVariavel, 'tipo' | 'papel' | 'unidade' | 'rotulo'>>
  ) => {
    if (!dataset) return;
    const updatedVars = variaveis.map(({ id: _i, criadoEm: _c, ...rest }) =>
      rest.nome === v.nome ? { ...rest, ...patch } : rest
    );
    await persistWorkingChanges(dataset.colunas, dataset.linhasWorking, updatedVars, dataset.formato);
  };

  const handleApplyConvert = async () => {
    if (!dataset) return;
    if (convertDir === 'wide_to_long') {
      if (selectedWideCols.length < 2) {
        setMsg({ type: 'err', text: 'Selecione pelo menos 2 colunas de tratamento para empilhar.' });
        return;
      }
      const res = convertWideToLong({
        rows: dataset.linhasWorking,
        treatmentCols: selectedWideCols,
        idCol: wideIdCol || undefined,
      });
      const inferred = inferVariablesFromDataset(experimento.id, res.columns, res.rows);
      await persistWorkingChanges(res.columns, res.rows, inferred, 'longo');
      setShowConvertModal(false);
      setMsg({ type: 'ok', text: `Convertido para Formato Longo (${res.rows.length} linhas).` });
    } else {
      if (!longTratCol || !longValCol) {
        setMsg({ type: 'err', text: 'Selecione a coluna de Tratamento e a coluna Resposta.' });
        return;
      }
      const res = convertLongToWide({
        rows: dataset.linhasWorking,
        tratCol: longTratCol,
        valCol: longValCol,
      });
      const inferred = inferVariablesFromDataset(experimento.id, res.columns, res.rows);
      await persistWorkingChanges(res.columns, res.rows, inferred, 'largo');
      setShowConvertModal(false);
      setMsg({ type: 'ok', text: `Convertido para Formato Largo (${res.rows.length} linhas).` });
    }
  };

  const handleVerifyRawOpfs = async () => {
    if (!dataset?.rawArtifactKey) return;
    const art = await estatisticaStorage.lerArquivoOriginalOpfs(dataset.rawArtifactKey);
    if (!art) {
      setChecksumStatus('Arquivo bruto não localizado no armazenamento atual.');
      return;
    }
    setChecksumStatus(
      art.checksumValid
        ? `Integridade WASM verificada (checksum ${art.record.checksum} · ${art.record.sizeBytes} bytes intactos)`
        : 'Divergência de checksum detectada!'
    );
  };

  const handleDownloadRawOpfs = async () => {
    if (!dataset?.rawArtifactKey) return;
    const art = await estatisticaStorage.lerArquivoOriginalOpfs(dataset.rawArtifactKey);
    if (!art) return;
    const blob = new Blob([new Uint8Array(art.bytes)], { type: art.record.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = dataset.rawFileName || 'arquivo_original_opfs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
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
          <button type="button" onClick={() => setMsg(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Barra de Ações de Entrada de Dados */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Banco Experimental — {experimento.nome}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Importe XLSX/XLS/CSV, cole diretamente do Excel ou crie uma planilha manual editável.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xlsx,.xls,.ods"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Colar do Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Nova Planilha Manual</span>
          </button>
          {dataset && (
            <button
              type="button"
              onClick={() => {
                setSelectedWideCols([]);
                setShowConvertModal(true);
              }}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Converter Largo / Longo</span>
            </button>
          )}
        </div>
      </div>

      {/* Preservação Imutável do Arquivo Original no OPFS */}
      {dataset?.temDadosOriginaisPreservados && (
        <div className="bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-zinc-100 truncate">
                Arquivo Original Imutável no OPFS: {dataset.rawFileName}
              </p>
              <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                Checksum WASM Original: {dataset.rawChecksum} · Versão de trabalho: v{dataset.versao}
                {checksumStatus ? ` · ${checksumStatus}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleVerifyRawOpfs}
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Verificar Checksum
            </button>
            <button
              type="button"
              onClick={handleDownloadRawOpfs}
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Original</span>
            </button>
          </div>
        </div>
      )}

      {!dataset ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
            Nenhuma matriz de dados carregada neste experimento
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Utilize os botões acima para importar uma planilha Excel/CSV, colar células diretamente da
            sua planilha ou inicializar uma tabela manual em branco.
          </p>
        </div>
      ) : (
        <>
          {/* Painel de Validação e Qualidade dos Dados */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Diagnóstico de Qualidade & Compatibilidade ({EXPERIMENTAL_DESIGNS_CATALOG[experimento.delineamento].sigla})
              </h4>
              <span
                className={`text-xs font-semibold ${
                  dataset.validacao.compatibilidadeDelineamento.compativel
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {dataset.validacao.compatibilidadeDelineamento.compativel
                  ? '● Estrutura compatível com o delineamento'
                  : '✖ Estrutura incompatível ou mapeamento incompleto'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                <span className="text-slate-500 dark:text-zinc-400 block">Dimensão</span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {dataset.validacao.totalLinhas} × {dataset.validacao.totalColunas}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                <span className="text-slate-500 dark:text-zinc-400 block">Células Vazias</span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {dataset.validacao.celulasVazias}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                <span className="text-slate-500 dark:text-zinc-400 block">N/A Explícitos</span>
                <span className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {dataset.validacao.celulasNA}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                <span className="text-slate-500 dark:text-zinc-400 block">Zeros Reais (0)</span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {dataset.validacao.celulasZero}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                <span className="text-slate-500 dark:text-zinc-400 block">Textos Inválidos</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    dataset.validacao.celulasInvalidasNumericas > 0
                      ? 'text-rose-600'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {dataset.validacao.celulasInvalidasNumericas}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                <span className="text-slate-500 dark:text-zinc-400 block">Balanceamento</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {dataset.validacao.desbalanceado ? 'Desbalanceado' : 'Balanceado'}
                </span>
              </div>
            </div>

            {(!dataset.validacao.compatibilidadeDelineamento.compativel ||
              dataset.validacao.problemas.length > 0) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs space-y-1 text-amber-900 dark:text-amber-200">
                {dataset.validacao.compatibilidadeDelineamento.motivos.map((m, i) => (
                  <div key={`m-${i}`} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span>{m}</span>
                  </div>
                ))}
                {dataset.validacao.problemas.slice(0, 5).map((p, i) => (
                  <div key={`p-${i}`} className="text-[11px] opacity-90">
                    · {p.mensagem}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Classificação e Mapeamento de Variáveis */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Dicionário de Variáveis & Papéis Experimentais
              </h4>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Ajuste manualmente tipo, papel estatístico e unidade
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Coluna</th>
                    <th className="px-4 py-2.5 font-semibold">Tipo Estatístico</th>
                    <th className="px-4 py-2.5 font-semibold">Papel no Experimento</th>
                    <th className="px-4 py-2.5 font-semibold">Unidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {variaveis.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                      <td className="px-4 py-2 font-semibold text-slate-900 dark:text-white">
                        {v.nome}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={v.tipo}
                          onChange={(e) =>
                            handleUpdateVariavelMeta(v, { tipo: e.target.value as TipoVariavel })
                          }
                          className="px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded text-xs"
                        >
                          {TIPOS_VARIAVEL.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={v.papel}
                          onChange={(e) =>
                            handleUpdateVariavelMeta(v, { papel: e.target.value as PapelVariavel })
                          }
                          className="px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded text-xs"
                        >
                          {PAPEIS_VARIAVEL.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          defaultValue={v.unidade}
                          onBlur={(e) => {
                            if (e.target.value !== v.unidade) {
                              void handleUpdateVariavelMeta(v, { unidade: e.target.value });
                            }
                          }}
                          placeholder="ex: kg/ha"
                          className="w-28 px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Planilha Interativa Editável */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Editor de Matriz de Trabalho ({dataset.formato === 'longo' ? 'Formato Longo' : 'Formato Largo'})
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Células vazias = dado ausente · N/A = ausente explícito · 0 = zero numérico real · Formato salvo automaticamente
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Nova coluna..."
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg w-36"
                />
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg whitespace-nowrap cursor-pointer"
                >
                  + Coluna
                </button>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Linha</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-mono text-slate-500 w-12 border-r border-slate-200 dark:border-zinc-800">
                      #
                    </th>
                    {dataset.colunas.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-zinc-200 border-r border-slate-200 dark:border-zinc-800 min-w-[120px]"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {dataset.linhasWorking.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30">
                      <td className="px-3 py-1.5 font-mono tabular-nums text-slate-400 border-r border-slate-200 dark:border-zinc-800">
                        {rIdx + 1}
                      </td>
                      {dataset.colunas.map((col) => {
                        const val = row[col];
                        const isBlank = val === null || val === undefined || val === '';
                        const isNA = val === 'N/A';
                        const isNum = typeof val === 'number';
                        return (
                          <td
                            key={col}
                            className={`p-0 border-r border-slate-200 dark:border-zinc-800 ${
                              isNA
                                ? 'bg-amber-50/60 dark:bg-amber-950/20'
                                : isBlank
                                ? 'bg-slate-50/40 dark:bg-zinc-950/30'
                                : ''
                            }`}
                          >
                            <input
                              key={`${rIdx}-${col}-${String(val)}`}
                              defaultValue={val === null || val === undefined ? '' : String(val)}
                              onBlur={(e) => {
                                const orig = val === null || val === undefined ? '' : String(val);
                                if (e.target.value !== orig) {
                                  handleCellEdit(rIdx, col, e.target.value);
                                }
                              }}
                              placeholder="vazio"
                              className={`w-full px-2.5 py-1.5 bg-transparent focus:outline-none focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-emerald-500 ${
                                isNum
                                  ? 'text-right font-mono tabular-nums text-slate-900 dark:text-zinc-100'
                                  : isNA
                                  ? 'text-center font-mono text-amber-700 dark:text-amber-400'
                                  : 'text-left text-slate-800 dark:text-zinc-200'
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rIdx)}
                          title="Excluir linha"
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {saving && (
              <div className="px-4 py-2 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-emerald-600" />
                <span>Persistindo alterações e recalculando validação no OPFS...</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Selecionar Aba de Arquivo XLSX */}
      {pendingPreview && selectedFileForSheet && (
        <div className="fixed inset-0 z-[1400] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Selecionar Aba da Planilha Excel
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              O arquivo "{pendingPreview.fileName}" contém múltiplas abas. Escolha qual aba deseja importar:
            </p>
            <select
              value={pendingPreview.selectedSheet}
              onChange={async (e) => {
                const p = await parseSpreadsheetFile(selectedFileForSheet, e.target.value);
                setPendingPreview(p);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
            >
              {pendingPreview.sheetNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="text-xs font-mono text-slate-600 dark:text-zinc-300">
              Prévia: {pendingPreview.rows.length} linhas × {pendingPreview.columns.length} colunas
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingPreview(null);
                  setSelectedFileForSheet(null);
                }}
                className="px-4 py-2 text-xs bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => commitImportedPreview(pendingPreview)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Importar Aba Selecionada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Colar Dados do Excel */}
      {showPasteModal && (
        <div className="fixed inset-0 z-[1400] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Colar Dados Tabulares (Excel / Calc / CSV)
              </h4>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="cursor-pointer text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={'Tratamento\tBloco\tProdutividade\nT1\tB1\t4200\nT1\tB2\t4350...'}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCommitPaste}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Processar & Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Planilha Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-[1400] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Criar Nova Planilha Manual em Branco
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  Nomes das Colunas (separadas por vírgula)
                </label>
                <input
                  value={manualColsText}
                  onChange={(e) => setManualColsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Quantidade Inicial de Linhas</label>
                <input
                  type="number"
                  min={2}
                  max={200}
                  value={manualRowsCount}
                  onChange={(e) => setManualRowsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 text-xs bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateManualGrid}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Criar Matriz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conversor Largo <-> Longo */}
      {showConvertModal && dataset && (
        <div className="fixed inset-0 z-[1400] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Conversão Bidirecional (Formato Largo ↔ Formato Longo)
            </h4>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setConvertDir('wide_to_long')}
                className={`flex-1 py-1.5 rounded-md font-medium cursor-pointer ${
                  convertDir === 'wide_to_long' ? 'bg-white dark:bg-zinc-800 shadow-2xs' : ''
                }`}
              >
                Largo → Longo (Empilhar)
              </button>
              <button
                type="button"
                onClick={() => setConvertDir('long_to_wide')}
                className={`flex-1 py-1.5 rounded-md font-medium cursor-pointer ${
                  convertDir === 'long_to_wide' ? 'bg-white dark:bg-zinc-800 shadow-2xs' : ''
                }`}
              >
                Longo → Largo (Expandir)
              </button>
            </div>

            {convertDir === 'wide_to_long' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">
                    Colunas que representam Tratamentos (marque ≥ 2)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    {dataset.colunas.map((c) => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedWideCols.includes(c)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedWideCols([...selectedWideCols, c]);
                            else setSelectedWideCols(selectedWideCols.filter((x) => x !== c));
                          }}
                        />
                        <span className="truncate">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Coluna de Bloco / Repetição existente (opcional)
                  </label>
                  <select
                    value={wideIdCol}
                    onChange={(e) => setWideIdCol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
                  >
                    <option value="">Gerar Repetição 1..n automaticamente</option>
                    {dataset.colunas.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Coluna de Tratamento</label>
                  <select
                    value={longTratCol}
                    onChange={(e) => setLongTratCol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
                  >
                    <option value="">Selecione...</option>
                    {dataset.colunas.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Coluna Resposta (Y)</label>
                  <select
                    value={longValCol}
                    onChange={(e) => setLongValCol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
                  >
                    <option value="">Selecione...</option>
                    {dataset.colunas.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-xs bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyConvert}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                Converter Formato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
