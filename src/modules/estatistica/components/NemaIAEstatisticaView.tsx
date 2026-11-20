import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Paperclip,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Download,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Layers,
  Calculator,
  FileCode,
  X,
  BarChart3,
  BookmarkPlus,
  History,
  Plus,
  Search,
  Clock,
  MessageSquare,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  EstatisticaExperimento,
  EstatisticaConjuntoDados,
  EstatisticaVariavel,
  EstatisticaResultado,
  EstatisticaGrafico,
  CategoriaAnalise,
  ConfiguracaoGraficoCientifico,
} from '../types/estatistica';
import { estatisticaStorage } from '../storage/estatisticaStorage';
import { parseSpreadsheetFile } from '../data-import/spreadsheetImporter';
import {
  ScientificChartCanvas,
  downloadSvgElement,
  downloadSvgElementAsPng,
} from '../charts/ScientificChartCanvas';
import { NemaIAEstatisticaIcon } from '../../../components/icons/NemaIAEstatisticaIcon';

export interface GeneratedFilePayload {
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'txt' | 'json' | 'r';
  description: string;
  content: string;
  canImportToDataset?: boolean;
}

export interface GeneratedChartPayload {
  chartId: string;
  title: string;
  subtitle?: string;
  chartType:
    | 'colunas'
    | 'barras'
    | 'linhas'
    | 'dispersao'
    | 'boxplot'
    | 'histograma'
    | 'regressao'
    | 'residuos'
    | 'qqplot'
    | 'heatmap'
    | 'biplot';
  axisX?: string;
  axisY?: string;
  unitX?: string;
  unitY?: string;
  equation?: string;
  r2?: string;
  dataJson: string;
}

export interface StatisticalSummaryPayload {
  delineamento?: string;
  fCalculado?: string;
  pValor?: string;
  significancia?: string;
  cvExperimental?: string;
  cvClassificacao?: string;
  r2?: string;
  equacaoRegressao?: string;
  pontoMaximoOuMinimo?: string;
  pressupostoNormalidade?: string;
  pressupostoHomocedasticidade?: string;
  conclusaoCientifica?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  kind: 'pdf' | 'spreadsheet' | 'image' | 'doc' | 'text';
  mimeType: string;
  sizeBytes: number;
  base64Data?: string;
  extractedText?: string;
  rowCount?: number;
  colCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  domainArea?: string;
  statisticalSummary?: StatisticalSummaryPayload;
  generatedFiles?: GeneratedFilePayload[];
  generatedCharts?: GeneratedChartPayload[];
  attachments?: {
    name: string;
    kind: string;
    sizeBytes: number;
  }[];
  isFallback?: boolean;
}

interface NemaIAEstatisticaViewProps {
  activeExperimento: EstatisticaExperimento | null;
  experimentos?: EstatisticaExperimento[];
  dataset: EstatisticaConjuntoDados | null;
  variaveis: EstatisticaVariavel[];
  resultados?: EstatisticaResultado[];
  graficos?: EstatisticaGrafico[];
  onSelectExperimento?: (id: string | null) => void;
  onRefresh: () => Promise<void>;
  onNavigateSubTab?: (tab: string) => void;
}

const DOMINIOS_ESTATISTICOS = [
  { id: 'geral', label: 'Geral & Consultoria' },
  { id: 'descritiva', label: 'Estatística Descritiva' },
  { id: 'delineamento', label: 'Delineamentos (DIC/DBC/DQL/Fatorial)' },
  { id: 'anova', label: 'ANOVA & Teste F' },
  { id: 'medias', label: 'Médias (Tukey/Duncan/Scott-Knott)' },
  { id: 'regressao', label: 'Regressão & Curvas Dose-Resposta' },
  { id: 'pressupostos', label: 'Pressupostos (Shapiro/Bartlett)' },
  { id: 'nao_parametrica', label: 'Não Paramétrica (Kruskal/Friedman)' },
  { id: 'multivariada', label: 'Multivariada (PCA & Clusters)' },
  { id: 'especiais', label: 'Análise Conjunta & Sobrevivência' },
];

export interface EstatisticaChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  domainArea: string;
  experimentName?: string;
  messages: ChatMessage[];
}

const SESSIONS_STORAGE_KEY = 'geaagro_nema_ia_estatistica_sessions_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'geaagro_nema_ia_estatistica_active_session_v1';
const LEGACY_STORAGE_KEY = 'geaagro_nema_ia_estatistica_messages_v1';

const createWelcomeMessage = (content?: string): ChatMessage => ({
  id: 'msg-welcome-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
  role: 'assistant',
  content:
    content ||
    `### Bem-vindo à Nema IA Estatística

Sou sua assistente biométrica e estatística especializada em **pesquisa experimental, análise de dados e biometria agrícola**.

**Como posso ajudar hoje?**
- **Executar Análises:** ANOVA, Comparações de Médias (Tukey, Duncan, Scott-Knott), Regressão Dose-Resposta, Pressupostos (Shapiro-Wilk, Bartlett), Não Paramétrica e PCA.
- **Gerar Gráficos Científicos:** Ploto gráficos de colunas com barras de erro e letras de Tukey, curvas de regressão com IC 95%, boxplots, histogramas, correlações e diagnósticos de resíduos prontos para baixar em PNG/SVG ou salvar no experimento.
- **Interpretar Documentos:** Envie laudos em **PDF**, planilhas **Excel (XLSX/CSV)**, documentos **DOC/DOCX** ou **fotos** de cadernos de campo.
- **Gerar Planilhas com Dados e Resultados:** Gero planilhas **CSV/Excel (.xlsx)** com resultados estatísticos calculados (ANOVA, Médias, Descritiva, Regressão) e matrizes experimentais para importar no GeaAgro.`,
  timestamp: new Date().toISOString(),
  domainArea: 'Geral & Consultoria',
});

const deriveSessionTitle = (msgs: ChatMessage[], experimentName?: string): string => {
  const firstUserMsg = msgs.find((m) => m.role === 'user');
  if (firstUserMsg?.content) {
    const clean = firstUserMsg.content.replace(/\s+/g, ' ').trim();
    return clean.length > 68 ? clean.slice(0, 68) + '...' : clean;
  }
  return experimentName ? `Consulta • ${experimentName}` : 'Nova Consulta Estatística';
};

const createEmptySession = (
  domainArea = 'geral',
  experimentName?: string,
  welcomeText?: string
): EstatisticaChatSession => {
  const now = new Date().toISOString();
  return {
    id: 'est-sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title: experimentName ? `Consulta • ${experimentName}` : 'Nova Consulta Estatística',
    createdAt: now,
    updatedAt: now,
    domainArea,
    experimentName,
    messages: [createWelcomeMessage(welcomeText)],
  };
};

function normalizeChartData(chart: GeneratedChartPayload): any {
  let parsed: any = {};
  try {
    parsed = typeof chart.dataJson === 'string' ? JSON.parse(chart.dataJson) : chart.dataJson || {};
  } catch {
    parsed = {};
  }

  if (chart.chartType === 'colunas' || chart.chartType === 'barras') {
    const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
    return {
      items: rawItems.map((it: any) => ({
        label: String(it?.label ?? it?.tratamento ?? ''),
        value: Number(it?.value ?? it?.media ?? 0),
        error: it?.error !== undefined ? Number(it.error) : undefined,
        letra: it?.letra !== undefined ? String(it.letra) : undefined,
      })),
    };
  }

  if (chart.chartType === 'boxplot') {
    if (Array.isArray(parsed?.groups) && parsed.groups.length > 0) {
      return {
        groups: parsed.groups.map((g: any) => ({
          label: String(g?.label ?? ''),
          values: Array.isArray(g?.values) ? g.values.map(Number).filter(Number.isFinite) : [],
        })),
      };
    }
    if (Array.isArray(parsed?.boxes) && parsed.boxes.length > 0) {
      return {
        groups: parsed.boxes.map((b: any) => {
          const vals = [b?.min, b?.q1, b?.median, b?.median, b?.q3, b?.max]
            .map(Number)
            .filter(Number.isFinite);
          const outliers = Array.isArray(b?.outliers)
            ? b.outliers.map(Number).filter(Number.isFinite)
            : [];
          return {
            label: String(b?.label ?? ''),
            values: [...vals, ...outliers],
          };
        }),
      };
    }
    return { groups: [] };
  }

  if (
    chart.chartType === 'regressao' ||
    chart.chartType === 'dispersao' ||
    chart.chartType === 'linhas' ||
    chart.chartType === 'residuos' ||
    chart.chartType === 'qqplot'
  ) {
    const points = Array.isArray(parsed?.points)
      ? parsed.points
          .map((p: any) => ({
            x: Number(p?.x),
            y: Number(p?.y),
            label: p?.label ? String(p.label) : undefined,
          }))
          .filter((p: any) => Number.isFinite(p.x) && Number.isFinite(p.y))
      : [];
    const curve = Array.isArray(parsed?.curve)
      ? parsed.curve
          .map((c: any) => ({
            x: Number(c?.x),
            yPred: Number(c?.yPred ?? c?.y),
            icInf: c?.icInf !== undefined ? Number(c.icInf) : undefined,
            icSup: c?.icSup !== undefined ? Number(c.icSup) : undefined,
          }))
          .filter((c: any) => Number.isFinite(c.x) && Number.isFinite(c.yPred))
      : [];

    const eqBase = parsed?.equationText || parsed?.equacao || chart.equation || '';
    const r2Val = parsed?.r2 ?? chart.r2;
    const equationText =
      parsed?.equationText ||
      (eqBase ? `${eqBase}${r2Val && !String(eqBase).includes('R²') ? `  |  R² = ${r2Val}` : ''}` : undefined);

    return {
      points,
      curve,
      equationText,
      pontoMaximo: parsed?.pontoMaximo,
    };
  }

  if (chart.chartType === 'histograma') {
    const values = Array.isArray(parsed?.values)
      ? parsed.values.map(Number).filter(Number.isFinite)
      : [];
    return { values };
  }

  if (chart.chartType === 'heatmap') {
    return {
      variaveis: Array.isArray(parsed?.variaveis) ? parsed.variaveis.map(String) : [],
      matrizR: Array.isArray(parsed?.matrizR) ? parsed.matrizR : [],
    };
  }

  if (chart.chartType === 'biplot') {
    return {
      scores: Array.isArray(parsed?.scores) ? parsed.scores : [],
      loadings: Array.isArray(parsed?.loadings) ? parsed.loadings : [],
      pc1Label: parsed?.pc1Label,
      pc2Label: parsed?.pc2Label,
    };
  }

  return parsed;
}

interface ChatChartCardProps {
  chart: GeneratedChartPayload;
  onSaveToExperiment: (config: ConfiguracaoGraficoCientifico, data: any) => Promise<void>;
}

const ChatChartCard: React.FC<ChatChartCardProps> = ({ chart, onSaveToExperiment }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const normalizedData = useMemo(() => normalizeChartData(chart), [chart]);

  const chartConfig: ConfiguracaoGraficoCientifico = useMemo(
    () => ({
      tipo: chart.chartType || 'colunas',
      titulo: chart.title || 'Gráfico Científico',
      subtitulo: chart.subtitle || '',
      eixoX: chart.axisX || 'Eixo X',
      eixoY: chart.axisY || 'Eixo Y',
      unidadeX: chart.unitX || '',
      unidadeY: chart.unitY || '',
      mostrarLegenda: true,
      mostrarIC: true,
      mostrarRotulos: true,
      mostrarEquacao: Boolean(chart.equation || normalizedData?.equationText),
      paleta: 'scientific_emerald',
      casasDecimais: 2,
    }),
    [chart, normalizedData]
  );

  const safeSlug = (chart.title || chart.chartId || 'grafico_nema_ia')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_|_$/g, '');

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSaveToExperiment(chartConfig, normalizedData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-zinc-100">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{chart.title}</span>
        </div>
        <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400">
          {chart.chartType}
        </span>
      </div>

      <div className="overflow-x-auto">
        <ScientificChartCanvas ref={svgRef} config={chartConfig} data={normalizedData} />
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (svgRef.current) downloadSvgElementAsPng(svgRef.current, safeSlug);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>PNG</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (svgRef.current) downloadSvgElement(svgRef.current, safeSlug);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>SVG</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
            saved
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <BookmarkPlus className="w-3.5 h-3.5" />
          )}
          <span>{saved ? 'Salvo na Galeria' : 'Salvar no Experimento'}</span>
        </button>
      </div>
    </div>
  );
};

export const NemaIAEstatisticaView: React.FC<NemaIAEstatisticaViewProps> = ({
  activeExperimento,
  experimentos = [],
  dataset,
  variaveis,
  resultados = [],
  graficos = [],
  onSelectExperimento,
  onRefresh,
  onNavigateSubTab,
}) => {
  const [sessions, setSessions] = useState<EstatisticaChatSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved) {
        const legacyMessages: ChatMessage[] = JSON.parse(legacySaved);
        if (Array.isArray(legacyMessages) && legacyMessages.length > 0) {
          const hasUserMsg = legacyMessages.some((m) => m.role === 'user');
          if (hasUserMsg) {
            const now = new Date().toISOString();
            return [
              {
                id: 'est-sess-migrated-' + Date.now(),
                title: deriveSessionTitle(legacyMessages),
                createdAt: legacyMessages[0]?.timestamp || now,
                updatedAt: legacyMessages[legacyMessages.length - 1]?.timestamp || now,
                domainArea: 'geral',
                messages: legacyMessages,
              },
            ];
          }
        }
      }
    } catch {
      // ignore storage errors
    }
    return [createEmptySession('geral', activeExperimento?.nome)];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return '';
  });

  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDomainFilter, setHistoryDomainFilter] = useState('all');

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('geral');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Record<string, boolean>>({});
  const [importStatus, setImportStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [confirmAction, setConfirmAction] = useState<'clear_chat' | 'clear_all_history' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = useMemo(() => activeSession?.messages || [], [activeSession]);

  const savedHistoryCount = useMemo(
    () => sessions.filter((s) => s.messages.some((m) => m.role === 'user')).length,
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return [...sessions]
      .filter((s) => s.messages.some((m) => m.role === 'user') || s.id === activeSession?.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter((s) => {
        if (historyDomainFilter !== 'all' && s.domainArea !== historyDomainFilter) return false;
        if (!q) return true;
        return (
          s.title.toLowerCase().includes(q) ||
          (s.experimentName || '').toLowerCase().includes(q) ||
          s.messages.some((m) => m.content.toLowerCase().includes(q))
        );
      });
  }, [sessions, activeSession?.id, historySearch, historyDomainFilter]);

  useEffect(() => {
    if (activeSession && activeSession.id !== activeSessionId) {
      setActiveSessionId(activeSession.id);
    }
  }, [activeSession, activeSessionId]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      if (activeSession?.id) {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, activeSession.id);
      }
    } catch {
      // storage quota
    }
  }, [sessions, activeSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeSession?.id, isLoading]);

  const handleNewConversation = () => {
    const hasUserMessagesInCurrent = activeSession?.messages.some((m) => m.role === 'user');
    if (!hasUserMessagesInCurrent && activeSession) {
      setAttachments([]);
      setImportStatus(null);
      return;
    }
    const newSess = createEmptySession(selectedDomain, activeExperimento?.nome);
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
    setAttachments([]);
    setImportStatus(null);
  };

  const handleSelectSession = (session: EstatisticaChatSession) => {
    setActiveSessionId(session.id);
    if (session.domainArea && DOMINIOS_ESTATISTICOS.some((d) => d.id === session.domainArea)) {
      setSelectedDomain(session.domainArea);
    }
    setAttachments([]);
    setImportStatus(null);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createEmptySession(selectedDomain, activeExperimento?.nome);
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSession?.id === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const executeConfirmedClear = () => {
    if (confirmAction === 'clear_all_history') {
      const fresh = createEmptySession(
        selectedDomain,
        activeExperimento?.nome,
        'Histórico completo limpo. Como posso colaborar com sua análise estatística hoje?'
      );
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setAttachments([]);
      setImportStatus(null);
    } else if (confirmAction === 'clear_chat') {
      const targetId = activeSession?.id;
      const welcome = createWelcomeMessage(
        'Conversa reiniciada. Como posso colaborar com sua análise estatística hoje?'
      );
      if (targetId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetId
              ? {
                  ...s,
                  title: activeExperimento?.nome
                    ? `Consulta • ${activeExperimento.nome}`
                    : 'Nova Consulta Estatística',
                  updatedAt: new Date().toISOString(),
                  messages: [welcome],
                }
              : s
          )
        );
      }
      setAttachments([]);
      setImportStatus(null);
    }
    setConfirmAction(null);
  };

  const handleClearAllHistory = () => {
    setConfirmAction('clear_all_history');
  };

  const handleClearHistory = () => {
    setConfirmAction('clear_chat');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      const mimeType = file.type || 'application/octet-stream';
      const sizeBytes = file.size;

      try {
        if (fileName.endsWith('.csv') || fileName.endsWith('.tsv') || fileName.endsWith('.txt')) {
          const text = await file.text();
          const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
          const rows = parsed.data || [];
          const cols = parsed.meta.fields || [];

          setAttachments((prev) => [
            ...prev,
            {
              id: 'att-' + Date.now() + '-' + i,
              name: fileName,
              kind: 'spreadsheet',
              mimeType: 'text/csv',
              sizeBytes,
              extractedText: text.slice(0, 30000),
              rowCount: rows.length,
              colCount: cols.length,
            },
          ]);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          const preview = await parseSpreadsheetFile(file);
          const csvText = XLSX.utils.sheet_to_csv(
            XLSX.read(preview.rawBytes, { type: 'array' }).Sheets[preview.selectedSheet]
          );

          setAttachments((prev) => [
            ...prev,
            {
              id: 'att-' + Date.now() + '-' + i,
              name: fileName,
              kind: 'spreadsheet',
              mimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              sizeBytes,
              extractedText: csvText.slice(0, 35000),
              rowCount: preview.rows.length,
              colCount: preview.columns.length,
            },
          ]);
        } else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            setAttachments((prev) => [
              ...prev,
              {
                id: 'att-' + Date.now() + '-' + i,
                name: fileName,
                kind: 'pdf',
                mimeType: 'application/pdf',
                sizeBytes,
                base64Data,
              },
            ]);
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            setAttachments((prev) => [
              ...prev,
              {
                id: 'att-' + Date.now() + '-' + i,
                name: fileName,
                kind: 'image',
                mimeType: file.type,
                sizeBytes,
                base64Data,
              },
            ]);
          };
          reader.readAsDataURL(file);
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
          const text = await file.text().catch(() => '');
          setAttachments((prev) => [
            ...prev,
            {
              id: 'att-' + Date.now() + '-' + i,
              name: fileName,
              kind: 'doc',
              mimeType: file.type || 'application/msword',
              sizeBytes,
              extractedText: text ? text.slice(0, 20000) : `Documento DOC/DOCX: ${fileName}`,
            },
          ]);
        } else {
          // Outros formatos textuais
          const text = await file.text().catch(() => '');
          setAttachments((prev) => [
            ...prev,
            {
              id: 'att-' + Date.now() + '-' + i,
              name: fileName,
              kind: 'text',
              mimeType,
              sizeBytes,
              extractedText: text.slice(0, 20000),
            },
          ]);
        }
      } catch (err: any) {
        console.error('Erro ao ler arquivo:', err);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAttachActiveDataset = () => {
    if (!dataset || dataset.linhasWorking.length === 0) {
      setImportStatus({
        message: 'Não há dados cadastrados no experimento ativo para anexar.',
        success: false,
      });
      return;
    }

    const csvContent = [
      dataset.colunas.join(','),
      ...dataset.linhasWorking.map((row) =>
        dataset.colunas.map((col) => JSON.stringify(row[col] ?? '')).join(',')
      ),
    ].join('\n');

    const attName = `dados_${activeExperimento?.nome.replace(/\s+/g, '_') || 'experimento'}.csv`;

    setAttachments((prev) => [
      ...prev.filter((a) => a.name !== attName && a.name !== 'dados_experimento_ativo.csv'),
      {
        id: 'att-active-' + Date.now(),
        name: attName,
        kind: 'spreadsheet',
        mimeType: 'text/csv',
        sizeBytes: new Blob([csvContent]).size,
        extractedText: csvContent.slice(0, 30000),
        rowCount: dataset.linhasWorking.length,
        colCount: dataset.colunas.length,
      },
    ]);
  };

  const handleAttachActiveResults = () => {
    if (!resultados || resultados.length === 0) {
      setImportStatus({
        message: 'Ainda não há análises calculadas salvas no experimento ativo.',
        success: false,
      });
      return;
    }

    const reportText = resultados
      .slice(0, 12)
      .map(
        (r, idx) =>
          `[${idx + 1}] ${r.titulo} (${r.categoria} / ${r.subtipo}) - ${new Date(r.criadoEm).toLocaleString('pt-BR')}\n` +
          `Interpretação: ${(r.interpretacaoDeterministica || []).join(' | ')}\n` +
          `Dados: ${JSON.stringify(r.dados).slice(0, 2200)}`
      )
      .join('\n\n---\n\n');

    const attName = `analises_${activeExperimento?.nome.replace(/\s+/g, '_') || 'experimento'}.txt`;

    setAttachments((prev) => [
      ...prev.filter((a) => a.name !== attName),
      {
        id: 'att-results-' + Date.now(),
        name: attName,
        kind: 'text',
        mimeType: 'text/plain',
        sizeBytes: new Blob([reportText]).size,
        extractedText: reportText.slice(0, 28000),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt && attachments.length === 0) return;
    if (isLoading) return;

    const targetSessionId = activeSession?.id;
    const currentMessagesSnapshot = activeSession?.messages || [];

    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: prompt || 'Analise os anexos enviados.',
      timestamp: new Date().toISOString(),
      domainArea: selectedDomain,
      attachments: attachments.map((a) => ({
        name: a.name,
        kind: a.kind,
        sizeBytes: a.sizeBytes,
      })),
    };

    if (targetSessionId) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          const updatedMsgs = [...s.messages, userMessage];
          return {
            ...s,
            title: deriveSessionTitle(updatedMsgs, activeExperimento?.nome || s.experimentName),
            updatedAt: userMessage.timestamp,
            domainArea: selectedDomain,
            experimentName: activeExperimento?.nome || s.experimentName,
            messages: updatedMsgs,
          };
        })
      );
    }

    setInputPrompt('');
    setIsLoading(true);
    setImportStatus(null);

    const attachmentsToSend = attachments;
    setAttachments([]);

    try {
      const activeExperimentContext = activeExperimento
        ? {
            nome: activeExperimento.nome,
            delineamento: activeExperimento.delineamento,
            alphaPadrao: activeExperimento.alphaPadrao,
            variaveis: variaveis.map((v) => ({
              nome: v.nome,
              tipo: v.tipo,
              papel: v.papel,
              unidade: v.unidade,
            })),
            dataSummary: dataset
              ? {
                  totalLinhas: dataset.linhasWorking.length,
                  colunas: dataset.colunas,
                  amostraLinhas: dataset.linhasWorking.slice(0, 10),
                }
              : null,
            resultadosSalvos: resultados.slice(0, 8).map((r) => ({
              titulo: r.titulo,
              categoria: r.categoria,
              subtipo: r.subtipo,
              interpretacao: r.interpretacaoDeterministica,
            })),
          }
        : null;

      const previousHistory = currentMessagesSnapshot.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const payload = {
        userPrompt: prompt,
        domainArea: selectedDomain,
        activeExperimentContext,
        messages: previousHistory,
        attachments: attachmentsToSend.map((a) => ({
          name: a.name,
          kind: a.kind,
          mimeType: a.mimeType,
          base64Data: a.base64Data,
          extractedText: a.extractedText,
          rowCount: a.rowCount,
          colCount: a.colCount,
        })),
      };

      const response = await fetch('/api/nema-estatistica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.statusText}`);
      }

      const resData = await response.json();
      const aiData = resData.data;

      const assistantMessage: ChatMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: aiData.reply || 'Análise concluída com sucesso.',
        timestamp: new Date().toISOString(),
        domainArea: aiData.domainArea || selectedDomain,
        statisticalSummary: aiData.statisticalSummary,
        generatedFiles: aiData.generatedFiles || [],
        generatedCharts: aiData.generatedCharts || [],
        isFallback: Boolean(resData.isFallback),
      };

      if (targetSessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? {
                  ...s,
                  updatedAt: assistantMessage.timestamp,
                  messages: [...s.messages, assistantMessage],
                }
              : s
          )
        );
      }
    } catch (err: any) {
      console.error('Erro ao consultar Nema IA Estatística:', err);
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `### Não foi possível completar a consulta online\n\n${err.message || 'Verifique sua conexão ou tente novamente em instantes.'}\n\n*Dica: Você pode utilizar os módulos offline de ANOVA, Médias e Regressão nas abas superiores do GeaAgro Estatística para realizar cálculos determinísticos locais.*`,
        timestamp: new Date().toISOString(),
        domainArea: selectedDomain,
      };
      if (targetSessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? {
                  ...s,
                  updatedAt: errorMessage.timestamp,
                  messages: [...s.messages, errorMessage],
                }
              : s
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = (file: GeneratedFilePayload, formatOverride?: 'xlsx' | 'csv') => {
    try {
      const targetFormat = formatOverride || file.fileType;
      let blob: Blob;
      let extension = targetFormat;
      let downloadFileName = file.fileName;

      if (!downloadFileName.endsWith(`.${extension}`)) {
        downloadFileName = downloadFileName.replace(/\.[^/.]+$/, '') + `.${extension}`;
      }

      if (targetFormat === 'xlsx') {
        // Converter CSV (simples ou multi-seção com tabelas ANOVA + Tukey) para XLSX via SheetJS
        const parsed = Papa.parse(file.content, {
          header: false,
          dynamicTyping: true,
          skipEmptyLines: false,
        });
        const aoaData = ((parsed.data as any[][]) || []).filter(
          (row) => Array.isArray(row)
        );
        const ws = XLSX.utils.aoa_to_sheet(aoaData);
        const wb = XLSX.utils.book_new();
        const sheetName = file.canImportToDataset
          ? 'Dados Experimentais'
          : 'Resultados Estatisticos';
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } else if (targetFormat === 'csv') {
        blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' });
      } else if (targetFormat === 'r') {
        blob = new Blob([file.content], { type: 'text/plain;charset=utf-8;' });
      } else {
        blob = new Blob([file.content], { type: 'text/plain;charset=utf-8;' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setImportStatus({
        message: 'Erro ao baixar arquivo: ' + (err?.message || 'Falha na exportação'),
        success: false,
      });
    }
  };

  const handleImportToDataset = async (file: GeneratedFilePayload) => {
    try {
      setImportStatus({ message: 'Processando e validando matriz de dados...', success: true });

      const parsed = Papa.parse(file.content, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      const rows: Record<string, any>[] = (parsed.data as Record<string, any>[]) || [];
      const cols = parsed.meta.fields || Object.keys(rows[0] || {});

      if (rows.length === 0 || cols.length === 0) {
        throw new Error('O arquivo gerado não contém linhas ou colunas estruturadas para importação.');
      }

      let targetExp = activeExperimento;
      if (!targetExp) {
        // Criar um novo projeto e experimento padrão se o usuário não possuir um
        const proj = await estatisticaStorage.salvarProjeto({
          nome: 'Projeto de Experimentação Nema IA',
          descricao: 'Criado automaticamente pela Nema IA Estatística.',
          categoria: 'Experimentação Agrícola',
          pesquisador: 'Pesquisador Nema IA',
          instituicao: 'GeaAgro',
          culturaOuArea: 'Culturas Gerais',
          localidade: 'Campo Experimental',
          tags: ['NemaIA', 'Estatística'],
          status: 'ativo',
        });
        targetExp = await estatisticaStorage.salvarExperimento({
          projetoId: proj.id,
          nome: 'Experimento Gerado por IA',
          descricao: file.description,
          objetivo: 'Avaliação experimental biométrica',
          delineamento: 'DBC',
          mapeamento: { respostaCols: [] },
          alphaPadrao: 0.05,
          status: 'pronto',
        });
      }

      // Salvar o conjunto de dados no banco estruturado
      await estatisticaStorage.salvarConjuntoDados({
        id: `ds_${targetExp.id}`,
        experimentoId: targetExp.id,
        formato: 'longo',
        colunas: cols,
        linhasWorking: rows,
        rawArtifactKey: null,
        rawFileName: file.fileName,
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

      // Inferir e salvar variáveis
      for (let idx = 0; idx < cols.length; idx++) {
        const col = cols[idx];
        const lower = col.toLowerCase();
        let tipo: 'quantitativa_continua' | 'categorica' = 'quantitativa_continua';
        let papel: any = 'resposta';

        if (lower.includes('trat') || lower.includes('variedade') || lower.includes('clone') || lower.includes('cultivar')) {
          tipo = 'categorica';
          papel = 'tratamento';
        } else if (lower.includes('bloc') || lower.includes('rep') || lower.includes('repet')) {
          tipo = 'categorica';
          papel = 'bloco';
        } else if (lower.includes('linha')) {
          tipo = 'categorica';
          papel = 'linha';
        } else if (lower.includes('coluna')) {
          tipo = 'categorica';
          papel = 'coluna';
        } else if (lower.includes('dose') || lower.includes('conc')) {
          tipo = 'quantitativa_continua';
          papel = 'dose';
        }

        await estatisticaStorage.salvarVariavel({
          experimentoId: targetExp.id,
          nome: col,
          rotulo: col,
          unidade: '',
          tipo,
          papel,
          transformacao: 'nenhuma',
        });
      }

      await onRefresh();
      setImportStatus({
        message: `Sucesso! ${rows.length} parcelas e ${cols.length} variáveis importadas para o experimento "${targetExp.nome}".`,
        success: true,
      });
    } catch (err: any) {
      console.error('Erro ao importar para dataset:', err);
      setImportStatus({
        message: 'Erro na importação: ' + (err.message || 'Dados inválidos'),
        success: false,
      });
    }
  };

  const handleSaveChartToExperiment = async (
    config: ConfiguracaoGraficoCientifico,
    dadosPlotagem: any
  ) => {
    try {
      let targetExp = activeExperimento;
      if (!targetExp) {
        const proj = await estatisticaStorage.salvarProjeto({
          nome: 'Projeto de Experimentação Nema IA',
          descricao: 'Criado automaticamente pela Nema IA Estatística.',
          categoria: 'Experimentação Agrícola',
          pesquisador: 'Pesquisador Nema IA',
          instituicao: 'GeaAgro',
          culturaOuArea: 'Culturas Gerais',
          localidade: 'Campo Experimental',
          tags: ['NemaIA', 'Estatística'],
          status: 'ativo',
        });
        targetExp = await estatisticaStorage.salvarExperimento({
          projetoId: proj.id,
          nome: 'Experimento Gerado por IA',
          descricao: 'Experimento criado para armazenamento de gráficos científicos.',
          objetivo: 'Avaliação experimental biométrica',
          delineamento: 'DBC',
          mapeamento: { respostaCols: [] },
          alphaPadrao: 0.05,
          status: 'pronto',
        });
      }

      await estatisticaStorage.salvarGrafico({
        experimentoId: targetExp.id,
        nome: config.titulo || 'Gráfico Nema IA Estatística',
        configuracao: config,
        dadosPlotagem,
      });

      await onRefresh();
      setImportStatus({
        message: `Gráfico "${config.titulo}" salvo na galeria do experimento "${targetExp.nome}".`,
        success: true,
      });
    } catch (err: any) {
      console.error('Erro ao salvar gráfico:', err);
      setImportStatus({
        message: 'Erro ao salvar gráfico: ' + (err.message || 'Falha de gravação'),
        success: false,
      });
    }
  };

  const handleSaveAnalysisToExperiment = async (msg: ChatMessage) => {
    try {
      let targetExp = activeExperimento;
      if (!targetExp) {
        const proj = await estatisticaStorage.salvarProjeto({
          nome: 'Projeto de Experimentação Nema IA',
          descricao: 'Criado automaticamente pela Nema IA Estatística.',
          categoria: 'Experimentação Agrícola',
          pesquisador: 'Pesquisador Nema IA',
          instituicao: 'GeaAgro',
          culturaOuArea: 'Culturas Gerais',
          localidade: 'Campo Experimental',
          tags: ['NemaIA', 'Estatística'],
          status: 'ativo',
        });
        targetExp = await estatisticaStorage.salvarExperimento({
          projetoId: proj.id,
          nome: 'Experimento Gerado por IA',
          descricao: 'Experimento criado para registro de análises biométricas Nema IA.',
          objetivo: 'Avaliação experimental biométrica',
          delineamento: 'DBC',
          mapeamento: { respostaCols: [] },
          alphaPadrao: 0.05,
          status: 'analisado',
        });
      }

      const dom = (msg.domainArea || selectedDomain || '').toLowerCase();
      let categoria: CategoriaAnalise = 'anova';
      if (dom.includes('descrit')) categoria = 'descritiva';
      else if (dom.includes('med') || dom.includes('tukey') || dom.includes('scott')) categoria = 'comparacao_medias';
      else if (dom.includes('regres') || dom.includes('dose')) categoria = 'regressao';
      else if (dom.includes('correl')) categoria = 'correlacao';
      else if (dom.includes('pressup') || dom.includes('shapiro')) categoria = 'pressupostos';
      else if (dom.includes('nao_param') || dom.includes('kruskal')) categoria = 'nao_parametrica';
      else if (dom.includes('multiv') || dom.includes('pca')) categoria = 'multivariada';
      else if (dom.includes('espec')) categoria = 'especial';

      const interpretacoes: string[] = [];
      if (msg.statisticalSummary?.conclusaoCientifica) {
        interpretacoes.push(msg.statisticalSummary.conclusaoCientifica);
      }
      if (msg.statisticalSummary?.fCalculado) {
        interpretacoes.push(`F Calculado = ${msg.statisticalSummary.fCalculado}`);
      }
      if (msg.statisticalSummary?.pValor) {
        interpretacoes.push(`p-valor = ${msg.statisticalSummary.pValor}`);
      }
      if (msg.statisticalSummary?.cvExperimental) {
        interpretacoes.push(`CV Experimental = ${msg.statisticalSummary.cvExperimental}`);
      }
      if (interpretacoes.length === 0) {
        interpretacoes.push(msg.content.replace(/[#*`]/g, '').slice(0, 260));
      }

      await estatisticaStorage.salvarAnaliseEResultado(
        {
          experimentoId: targetExp.id,
          categoria,
          subtipo: `Nema IA Estatística (${msg.domainArea || 'Biometria'})`,
          parametros: { origem: 'nema_ia_estatistica', msgId: msg.id },
        },
        {
          experimentoId: targetExp.id,
          categoria,
          titulo: `Laudo Biométrico Nema IA — ${msg.domainArea || 'Análise Estatística'}`,
          subtipo: msg.statisticalSummary?.delineamento || targetExp.delineamento,
          dados: {
            resumoIndicadores: msg.statisticalSummary || {},
            parecerMarkdown: msg.content,
            arquivosGerados: (msg.generatedFiles || []).map((f) => f.fileName),
          },
          interpretacaoDeterministica: interpretacoes,
          avisosTecnicos: [],
        }
      );

      await onRefresh();
      setSavedMessageIds((prev) => ({ ...prev, [msg.id]: true }));
      setImportStatus({
        message: `Análise biométrica salva nos Relatórios do experimento "${targetExp.nome}".`,
        success: true,
      });
    } catch (err: any) {
      console.error('Erro ao salvar análise no experimento:', err);
      setImportStatus({
        message: 'Erro ao salvar análise: ' + (err.message || 'Falha de gravação'),
        success: false,
      });
    }
  };

  const getSuggestedSubTabForDomain = (domain?: string): { tab: string; label: string } => {
    const d = (domain || selectedDomain || '').toLowerCase();
    if (d.includes('descrit')) return { tab: 'descritiva', label: 'Abrir Estatística Descritiva' };
    if (d.includes('delinea')) return { tab: 'delineamentos', label: 'Abrir Delineamentos' };
    if (d.includes('med') || d.includes('tukey')) return { tab: 'medias', label: 'Abrir Comparação de Médias' };
    if (d.includes('regres')) return { tab: 'regressao', label: 'Abrir Regressão' };
    if (d.includes('pressup')) return { tab: 'pressupostos', label: 'Abrir Pressupostos' };
    if (d.includes('nao_param') || d.includes('kruskal')) return { tab: 'nao_parametrica', label: 'Abrir Não Paramétrica' };
    if (d.includes('multiv') || d.includes('pca')) return { tab: 'multivariada', label: 'Abrir Multivariada' };
    if (d.includes('espec')) return { tab: 'especiais', label: 'Abrir Análises Especiais' };
    return { tab: 'anova', label: 'Abrir Módulo ANOVA' };
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho Plano & Barra de Contexto Integrada */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <NemaIAEstatisticaIcon
              size={34}
              variant="emblem"
              className="rounded-lg shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                  Nema IA Estatística
                </h2>
                <span className="text-xs text-slate-400 dark:text-zinc-500">·</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Assistente Biométrico · PDF · Planilhas · Imagens
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                Consultoria para experimentação agrícola, ANOVA, contrastes, regressão, pressupostos e multivariada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsHistoryMode((prev) => !prev)}
              title="Alternar Histórico de Conversas"
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border ${
                isHistoryMode
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico</span>
              {savedHistoryCount > 0 && (
                <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-zinc-400">
                  ({savedHistoryCount})
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleNewConversation}
              title="Iniciar nova conversa"
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Conversa</span>
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              title="Reiniciar conversa atual"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Barra Integrada: Especialidade (Menu Suspenso) + Experimento Ativo */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Menu Suspenso de Especialidade */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="nema-estatistica-domain-select"
                className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 whitespace-nowrap"
              >
                Especialidade:
              </label>
              <div className="relative">
                <select
                  id="nema-estatistica-domain-select"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="appearance-none h-8 pl-2.5 pr-7 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500/60 focus:border-emerald-500 text-xs font-medium text-slate-800 dark:text-zinc-100 transition-colors cursor-pointer focus:outline-none max-w-[230px]"
                >
                  {DOMINIOS_ESTATISTICOS.map((dom) => (
                    <option key={dom.id} value={dom.id}>
                      {dom.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">|</span>

            {/* Contexto do Experimento Ativo */}
            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {experimentos.length > 0 && onSelectExperimento ? (
                <div className="relative">
                  <select
                    value={activeExperimento?.id || ''}
                    onChange={(e) => onSelectExperimento(e.target.value || null)}
                    aria-label="Selecionar experimento ativo na Nema IA Estatística"
                    className="appearance-none h-8 pl-2.5 pr-7 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500/60 text-slate-800 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[220px]"
                  >
                    {experimentos.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.nome} ({exp.delineamento})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <span className="font-medium text-slate-700 dark:text-zinc-200">
                  {activeExperimento
                    ? `${activeExperimento.nome} (${activeExperimento.delineamento})`
                    : 'Nenhum experimento'}
                </span>
              )}

              {activeExperimento && (
                <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                  {dataset ? dataset.linhasWorking.length : 0} parcelas · {variaveis.length} var. · {resultados.length} análises · {graficos.length} gráf.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {!activeExperimento && onNavigateSubTab && (
              <button
                type="button"
                onClick={() => onNavigateSubTab('projetos')}
                className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar Experimento</span>
              </button>
            )}

            {activeExperimento && dataset && dataset.linhasWorking.length > 0 && (
              <button
                type="button"
                onClick={handleAttachActiveDataset}
                className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Carregar Dados</span>
              </button>
            )}

            {activeExperimento && resultados.length > 0 && (
              <button
                type="button"
                onClick={handleAttachActiveResults}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sincronizar ({resultados.length})</span>
              </button>
            )}

            {activeExperimento && onNavigateSubTab && (
              <button
                type="button"
                onClick={() => onNavigateSubTab('relatorios')}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                title="Abrir Relatórios Científicos do Experimento"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Relatórios</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notificação de Status de Importação / Exportação */}
      {importStatus && (
        <div
          className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            importStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="truncate">{importStatus.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {importStatus.success && onNavigateSubTab && (
              <button
                type="button"
                onClick={() => onNavigateSubTab('dados')}
                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 whitespace-nowrap transition-colors cursor-pointer"
              >
                Ver na aba Dados
              </button>
            )}
            <button
              type="button"
              onClick={() => setImportStatus(null)}
              className="p-0.5 opacity-70 hover:opacity-100 cursor-pointer"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Área Principal: Modo Histórico + Conversa */}
      <div className={isHistoryMode ? 'grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch' : ''}>
        {isHistoryMode && (
          <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col h-[340px] lg:h-[680px] min-w-0 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Conversas Salvas
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {savedHistoryCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer px-1.5 py-0.5 rounded"
                      title="Apagar todo o histórico"
                    >
                      Limpar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNewConversation}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                    title="Iniciar nova conversa"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nova</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHistoryMode(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Fechar Histórico"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Buscar conversa..."
                    className="w-full h-8 pl-8 pr-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <select
                  value={historyDomainFilter}
                  onChange={(e) => setHistoryDomainFilter(e.target.value)}
                  className="w-28 h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
                  title="Filtrar por especialidade"
                >
                  <option value="all">Todas</option>
                  {DOMINIOS_ESTATISTICOS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Clock className="w-6 h-6 text-slate-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                    {savedHistoryCount === 0 ? 'Sem conversas salvas' : 'Nenhum resultado'}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    Suas consultas estatísticas ficam salvas localmente.
                  </p>
                </div>
              ) : (
                filteredSessions.map((sess) => {
                  const dateStr = new Date(sess.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isSelected = activeSession?.id === sess.id;
                  const domainLabel =
                    DOMINIOS_ESTATISTICOS.find((d) => d.id === sess.domainArea)?.label ||
                    'Geral & Consultoria';
                  const msgCount = sess.messages.length;

                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess)}
                      className={`relative group px-3 py-2.5 transition-colors cursor-pointer text-xs space-y-1 border-l-2 ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-l-emerald-600'
                          : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
                          {domainLabel}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono tabular-nums text-slate-400">
                            {dateStr}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(e, sess.id)}
                            className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 cursor-pointer rounded transition-opacity"
                            title="Excluir conversa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                        {sess.title}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="truncate flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>{sess.experimentName || 'Consultoria Estatística'}</span>
                        </span>
                        <span className="shrink-0 ml-1 font-mono tabular-nums">{msgCount} msgs</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Área de Conversa */}
        <div
          className={`${
            isHistoryMode ? 'lg:col-span-8' : ''
          } bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col min-h-[460px] max-h-[680px] overflow-hidden`}
        >
          {/* Histórico das Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <NemaIAEstatisticaIcon
                      size={28}
                      variant="emblem"
                      className="rounded-lg shrink-0 mt-0.5"
                    />
                  )}

                  <div
                    className={`max-w-3xl rounded-xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed ${
                      isUser
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/35 border border-emerald-200/80 dark:border-emerald-900/60 text-slate-900 dark:text-zinc-100'
                        : 'bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 text-slate-900 dark:text-zinc-100'
                    }`}
                  >
                    {/* Cabeçalho da Mensagem */}
                    <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-200/70 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">
                        {isUser ? 'Você' : 'Nema IA Estatística'}
                      </span>
                      <span className="font-mono tabular-nums">
                        {msg.domainArea ? `${msg.domainArea} · ` : ''}
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Anexos da Mensagem */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2.5 flex flex-wrap gap-1.5">
                        {msg.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-700 dark:text-zinc-300 flex items-center gap-1.5"
                          >
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[180px]">{att.name}</span>
                            <span className="text-slate-400 font-mono tabular-nums text-[10px]">
                              {Math.round(att.sizeBytes / 1024)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Conteúdo Markdown Formatado */}
                    <div className="space-y-2.5 prose dark:prose-invert max-w-none text-xs sm:text-[13px]">
                      {msg.content.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.startsWith('### ')) {
                          return (
                            <h3
                              key={pIdx}
                              className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-2 mb-1"
                            >
                              {paragraph.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (paragraph.startsWith('## ')) {
                          return (
                            <h2
                              key={pIdx}
                              className="text-sm sm:text-base font-semibold text-emerald-700 dark:text-emerald-400 mt-3 mb-1"
                            >
                              {paragraph.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (paragraph.includes('|') && paragraph.includes('\n|')) {
                          const lines = paragraph.trim().split('\n');
                          const headers = lines[0]
                            .split('|')
                            .map((c) => c.trim())
                            .filter(Boolean);
                          const dataLines = lines.slice(2).filter((l) => l.includes('|'));
                          return (
                            <div
                              key={pIdx}
                              className="overflow-x-auto my-2.5 rounded-lg border border-slate-200 dark:border-zinc-800"
                            >
                              <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-zinc-800">
                                <thead className="bg-slate-100/80 dark:bg-zinc-900 font-semibold text-slate-700 dark:text-zinc-200">
                                  <tr>
                                    {headers.map((h, hIdx) => (
                                      <th key={hIdx} className="px-3 py-2 whitespace-nowrap">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
                                  {dataLines.map((rowStr, rIdx) => {
                                    const cells = rowStr
                                      .split('|')
                                      .map((c) => c.trim())
                                      .filter(Boolean);
                                    return (
                                      <tr
                                        key={rIdx}
                                        className="hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                                      >
                                        {cells.map((cell, cIdx) => (
                                          <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        if (paragraph.startsWith('```')) {
                          const cleanCode = paragraph
                            .replace(/```[a-z]*\n?/g, '')
                            .replace(/```$/g, '');
                          const codeId = `code-${msg.id}-${pIdx}`;
                          return (
                            <div
                              key={pIdx}
                              className="my-2 rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-x-auto relative"
                            >
                              <button
                                type="button"
                                onClick={() => handleCopyCode(cleanCode, codeId)}
                                className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedCodeId === codeId ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedCodeId === codeId ? 'Copiado' : 'Copiar'}</span>
                              </button>
                              <pre className="pr-14">{cleanCode}</pre>
                            </div>
                          );
                        }
                        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                          const items = paragraph.split('\n').filter(Boolean);
                          return (
                            <ul key={pIdx} className="list-disc pl-4 space-y-1">
                              {items.map((it, iIdx) => (
                                <li key={iIdx}>
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: it
                                        .replace(/^[-*]\s*/, '')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                                    }}
                                  />
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p
                            key={pIdx}
                            className="leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Resumo Estatístico Estruturado (Faixa Plana com Divisórias) */}
                    {msg.statisticalSummary && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2.5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Indicadores Biométricos</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs overflow-hidden">
                          {msg.statisticalSummary.fCalculado && (
                            <div className="px-3 py-2">
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                                F Calculado
                              </span>
                              <strong className="text-slate-900 dark:text-zinc-100 font-mono tabular-nums">
                                {msg.statisticalSummary.fCalculado}
                              </strong>
                            </div>
                          )}
                          {msg.statisticalSummary.pValor && (
                            <div className="px-3 py-2">
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                                p-valor
                              </span>
                              <strong className="text-slate-900 dark:text-zinc-100 font-mono tabular-nums">
                                {msg.statisticalSummary.pValor}
                              </strong>
                            </div>
                          )}
                          {msg.statisticalSummary.cvExperimental && (
                            <div className="px-3 py-2">
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                                CV Experimental
                              </span>
                              <strong className="text-slate-900 dark:text-zinc-100 font-mono tabular-nums">
                                {msg.statisticalSummary.cvExperimental}
                              </strong>
                            </div>
                          )}
                          {msg.statisticalSummary.r2 && (
                            <div className="px-3 py-2">
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                                R² Ajustado
                              </span>
                              <strong className="text-slate-900 dark:text-zinc-100 font-mono tabular-nums">
                                {msg.statisticalSummary.r2}
                              </strong>
                            </div>
                          )}
                        </div>
                        {msg.statisticalSummary.conclusaoCientifica && (
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic">
                            &ldquo;{msg.statisticalSummary.conclusaoCientifica}&rdquo;
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveAnalysisToExperiment(msg)}
                            disabled={Boolean(savedMessageIds[msg.id])}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                              savedMessageIds[msg.id]
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {savedMessageIds[msg.id] ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {savedMessageIds[msg.id]
                                ? 'Salvo nos Relatórios'
                                : 'Salvar no Experimento'}
                            </span>
                          </button>

                          {onNavigateSubTab && (
                            <button
                              type="button"
                              onClick={() =>
                                onNavigateSubTab(getSuggestedSubTabForDomain(msg.domainArea).tab)
                              }
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer"
                            >
                              <span>{getSuggestedSubTabForDomain(msg.domainArea).label}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Arquivos Gerados pela IA */}
                    {msg.generatedFiles && msg.generatedFiles.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Arquivos Gerados</span>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                          {msg.generatedFiles.map((file, fIdx) => (
                            <div
                              key={fIdx}
                              className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                {file.fileType === 'r' ? (
                                  <FileCode className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                )}
                                <div className="min-w-0">
                                  <strong className="text-slate-900 dark:text-zinc-100 block font-mono text-xs truncate">
                                    {file.fileName}
                                  </strong>
                                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                    {file.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(file, 'csv')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>CSV</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(file, 'xlsx')}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer"
                                >
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Excel</span>
                                </button>
                                {file.canImportToDataset && (
                                  <button
                                    type="button"
                                    onClick={() => handleImportToDataset(file)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                                  >
                                    <Database className="w-3.5 h-3.5" />
                                    <span>Importar</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gráficos Científicos Gerados pela IA */}
                    {msg.generatedCharts && msg.generatedCharts.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2.5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Gráficos Científicos Gerados</span>
                        </div>
                        <div className="space-y-2.5">
                          {msg.generatedCharts.map((chart, cIdx) => (
                            <ChatChartCard
                              key={chart.chartId || `chart-${msg.id}-${cIdx}`}
                              chart={chart}
                              onSaveToExperiment={handleSaveChartToExperiment}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-500 dark:text-zinc-400 text-xs py-1">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                <span>Processando matriz de dados e cálculos biométricos...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prévia de Anexos Pendentes */}
          {attachments.length > 0 && (
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap gap-1.5 text-xs">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5"
                >
                  {att.kind === 'pdf' && <FileText className="w-3.5 h-3.5 text-rose-500" />}
                  {att.kind === 'spreadsheet' && <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                  {att.kind === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-500" />}
                  {att.kind === 'doc' && <FileText className="w-3.5 h-3.5 text-indigo-500" />}
                  {att.kind === 'text' && <FileCode className="w-3.5 h-3.5 text-amber-500" />}
                  <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                  {att.rowCount && att.colCount && (
                    <span className="text-[10px] font-mono tabular-nums text-slate-400">
                      {att.rowCount}×{att.colCount}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-slate-400 hover:text-rose-500 p-0.5 rounded cursor-pointer"
                    aria-label="Remover anexo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Caixa de Entrada e Envio */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar arquivo (PDF, XLSX, CSV, DOC, Imagem)"
                className="h-9 w-9 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="Digite sua dúvida estatística, solicite ANOVA, regressão, gráficos ou planilhas..."
                className="flex-1 resize-none px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={isLoading || (!inputPrompt.trim() && attachments.length === 0)}
                className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>

            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-zinc-500 px-0.5">
              <span>Anexos: PDF, XLSX, CSV, DOC e imagens de caderno de campo</span>
              <span>Enter envia · Shift+Enter quebra linha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação Local (Sem window.confirm) */}
      {confirmAction && (
        <div className="fixed inset-0 z-[1500] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-sm p-5 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {confirmAction === 'clear_all_history'
                  ? 'Limpar histórico completo?'
                  : 'Reiniciar conversa atual?'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {confirmAction === 'clear_all_history'
                  ? 'Todas as conversas salvas localmente da Nema IA Estatística serão removidas.'
                  : 'As mensagens da conversa atual serão limpas e uma nova sessão será iniciada.'}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeConfirmedClear}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NemaIAEstatisticaView;
