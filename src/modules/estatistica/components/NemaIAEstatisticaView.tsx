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
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-zinc-100">
          <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{chart.title}</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold uppercase">
          {chart.chartType}
        </span>
      </div>

      <div className="overflow-x-auto">
        <ScientificChartCanvas ref={svgRef} config={chartConfig} data={normalizedData} />
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (svgRef.current) downloadSvgElementAsPng(svgRef.current, safeSlug);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Baixar PNG</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (svgRef.current) downloadSvgElement(svgRef.current, safeSlug);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Baixar SVG</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
            saved
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <BookmarkPlus className="w-3.5 h-3.5" />
          )}
          <span>{saved ? 'Salvo na Galeria!' : 'Salvar no Experimento'}</span>
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

  const handleClearAllHistory = () => {
    if (confirm('Deseja apagar todas as conversas salvas no histórico da Nema IA Estatística?')) {
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
    }
  };

  const handleClearHistory = () => {
    if (confirm('Deseja reiniciar a conversa atual da Nema IA Estatística?')) {
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
      alert('Erro ao baixar arquivo: ' + err.message);
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
    <div className="space-y-6">
      {/* Banner Superior Limpo & Moderno */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <NemaIAEstatisticaIcon
              size={50}
              variant="emblem"
              className="rounded-2xl shadow-lg shadow-emerald-500/20"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Nema IA Estatística
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Assistente Biométrico & Estatístico
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Multimodal • PDF • Planilhas • Imagens
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Consultoria estatística avançada para experimentação científica, ANOVA, contrastes de médias, modelos dose-resposta, pressupostos e multivariada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsHistoryMode((prev) => !prev)}
              title="Alternar Modo Histórico de Conversas"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer border ${
                isHistoryMode
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Modo Histórico</span>
              {savedHistoryCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-bold ${
                    isHistoryMode
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {savedHistoryCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleNewConversation}
              title="Iniciar nova conversa"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-500/40 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Conversa</span>
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              title="Reiniciar conversa atual"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Chat</span>
            </button>
          </div>
        </div>

        {/* Barra de Contexto & Integração do Experimento Ativo */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 text-slate-300">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Experimento Ativo:</span>

            {experimentos.length > 0 && onSelectExperimento ? (
              <div className="relative">
                <select
                  value={activeExperimento?.id || ''}
                  onChange={(e) => onSelectExperimento(e.target.value || null)}
                  aria-label="Selecionar experimento ativo na Nema IA Estatística"
                  className="appearance-none pl-2.5 pr-7 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-semibold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {experimentos.map((exp) => (
                    <option key={exp.id} value={exp.id} className="bg-slate-900 text-white">
                      {exp.nome} ({exp.delineamento})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <strong className="text-emerald-300">
                {activeExperimento
                  ? `${activeExperimento.nome} (${activeExperimento.delineamento})`
                  : 'Nenhum selecionado'}
              </strong>
            )}

            {activeExperimento && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/70">
                  {dataset ? dataset.linhasWorking.length : 0} parcelas
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/70">
                  {variaveis.length} variáveis
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/70">
                  {resultados.length} análises
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/70">
                  {graficos.length} gráficos
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!activeExperimento && onNavigateSubTab && (
              <button
                type="button"
                onClick={() => onNavigateSubTab('projetos')}
                className="px-3 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Selecionar ou Criar Experimento</span>
              </button>
            )}

            {activeExperimento && dataset && dataset.linhasWorking.length > 0 && (
              <button
                type="button"
                onClick={handleAttachActiveDataset}
                className="px-3 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Carregar Dados no Chat</span>
              </button>
            )}

            {activeExperimento && resultados.length > 0 && (
              <button
                type="button"
                onClick={handleAttachActiveResults}
                className="px-3 py-1 text-xs font-semibold text-teal-200 bg-teal-950/80 hover:bg-teal-900/80 border border-teal-700/60 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Sincronizar Análises ({resultados.length})</span>
              </button>
            )}

            {activeExperimento && onNavigateSubTab && (
              <button
                type="button"
                onClick={() => onNavigateSubTab('relatorios')}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                title="Abrir Relatórios Científicos do Experimento"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Relatórios</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notificação de Status de Importação */}
      {importStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            importStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
          {importStatus.success && onNavigateSubTab && (
            <button
              type="button"
              onClick={() => onNavigateSubTab('dados')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition cursor-pointer"
            >
              Ver na aba Dados
            </button>
          )}
        </div>
      )}

      {/* Seletor de Especialidade / Função Estatística (Menu Suspenso) */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <label
          htmlFor="nema-estatistica-domain-select"
          className="text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider shrink-0"
        >
          Especialidade:
        </label>
        <div className="relative w-full sm:w-80">
          <select
            id="nema-estatistica-domain-select"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 dark:text-zinc-100 shadow-sm transition cursor-pointer focus:outline-none"
          >
            {DOMINIOS_ESTATISTICOS.map((dom) => (
              <option key={dom.id} value={dom.id}>
                {dom.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Área Principal: Modo Histórico + Conversa */}
      <div className={isHistoryMode ? 'grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch' : ''}>
        {isHistoryMode && (
          <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col h-[360px] lg:h-[750px] min-w-0 overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Histórico de Conversas
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Iniciar nova conversa"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHistoryMode(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Fechar Modo Histórico"
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
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <select
                  value={historyDomainFilter}
                  onChange={(e) => setHistoryDomainFilter(e.target.value)}
                  className="w-28 px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
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

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Clock className="w-7 h-7 text-slate-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {savedHistoryCount === 0 ? 'Sem conversas salvas' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Suas análises e consultas com a Nema IA Estatística ficam salvas aqui localmente.
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
                      className={`relative group p-3 rounded-xl border transition-colors cursor-pointer text-xs space-y-1.5 ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/60'
                          : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-950/60 border-slate-200/80 dark:border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                          {domainLabel}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-slate-400">{dateStr}</span>
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

                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {sess.title}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                        <span className="truncate flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>{sess.experimentName || 'Consultoria Estatística'}</span>
                        </span>
                        <span className="shrink-0 ml-1 tabular-nums">{msgCount} msgs</span>
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
          } bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col min-h-[500px] max-h-[750px]`}
        >
        {/* Histórico das Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <NemaIAEstatisticaIcon
                    size={36}
                    variant="emblem"
                    className="rounded-xl shadow-md shadow-emerald-500/20"
                  />
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-bl-none'
                  }`}
                >
                  {/* Cabeçalho da Mensagem */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-black/10 dark:border-white/10 text-[11px] opacity-80">
                    <span className="font-semibold">
                      {isUser ? 'Você (Pesquisador)' : 'Nema IA Estatística'}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.domainArea && (
                        <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">
                          {msg.domainArea}
                        </span>
                      )}
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Anexos da Mensagem */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {msg.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 text-[11px] flex items-center gap-1.5"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{att.name}</span>
                          <span className="opacity-70 text-[10px]">({Math.round(att.sizeBytes / 1024)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conteúdo Markdown Formatado */}
                  <div className="space-y-3 prose dark:prose-invert max-w-none text-xs sm:text-sm">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => {
                      // Se for título Markdown
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={pIdx} className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 mt-2 mb-1">
                            {paragraph.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={pIdx} className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-3 mb-1">
                            {paragraph.replace('## ', '')}
                          </h2>
                        );
                      }
                      // Se for tabela Markdown
                      if (paragraph.includes('|') && paragraph.includes('\n|')) {
                        const lines = paragraph.trim().split('\n');
                        const headers = lines[0].split('|').map((c) => c.trim()).filter(Boolean);
                        const dataLines = lines.slice(2).filter((l) => l.includes('|'));
                        return (
                          <div key={pIdx} className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                            <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-zinc-800">
                              <thead className="bg-slate-100 dark:bg-zinc-800/80 font-semibold text-slate-700 dark:text-zinc-200">
                                <tr>
                                  {headers.map((h, hIdx) => (
                                    <th key={hIdx} className="px-3 py-2 whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 bg-white dark:bg-zinc-900">
                                {dataLines.map((rowStr, rIdx) => {
                                  const cells = rowStr.split('|').map((c) => c.trim()).filter(Boolean);
                                  return (
                                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
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
                      // Se for bloco de código
                      if (paragraph.startsWith('```')) {
                        const cleanCode = paragraph.replace(/```[a-z]*\n?/g, '').replace(/```$/g, '');
                        const codeId = `code-${msg.id}-${pIdx}`;
                        return (
                          <div key={pIdx} className="my-2 rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-x-auto relative group">
                            <button
                              type="button"
                              onClick={() => handleCopyCode(cleanCode, codeId)}
                              className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1 transition"
                            >
                              {copiedCodeId === codeId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedCodeId === codeId ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                            <pre className="pr-12">{cleanCode}</pre>
                          </div>
                        );
                      }
                      // Se for lista com bullet
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
                      // Parágrafo comum
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

                  {/* Resumo Estatístico Estruturado */}
                  {msg.statisticalSummary && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Resumo dos Indicadores Biométricos</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {msg.statisticalSummary.fCalculado && (
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                            <span className="text-[10px] text-slate-400 block">F Calculado</span>
                            <strong className="text-slate-900 dark:text-white font-mono">{msg.statisticalSummary.fCalculado}</strong>
                          </div>
                        )}
                        {msg.statisticalSummary.pValor && (
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                            <span className="text-[10px] text-slate-400 block">p-valor</span>
                            <strong className="text-slate-900 dark:text-white font-mono">{msg.statisticalSummary.pValor}</strong>
                          </div>
                        )}
                        {msg.statisticalSummary.cvExperimental && (
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                            <span className="text-[10px] text-slate-400 block">CV Experimental</span>
                            <strong className="text-slate-900 dark:text-white font-mono">{msg.statisticalSummary.cvExperimental}</strong>
                          </div>
                        )}
                        {msg.statisticalSummary.r2 && (
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                            <span className="text-[10px] text-slate-400 block">R² Ajustado</span>
                            <strong className="text-slate-900 dark:text-white font-mono">{msg.statisticalSummary.r2}</strong>
                          </div>
                        )}
                      </div>
                      {msg.statisticalSummary.conclusaoCientifica && (
                        <p className="mt-2 text-[11px] text-slate-600 dark:text-zinc-400 italic">
                          "{msg.statisticalSummary.conclusaoCientifica}"
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveAnalysisToExperiment(msg)}
                          disabled={Boolean(savedMessageIds[msg.id])}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            savedMessageIds[msg.id]
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          {savedMessageIds[msg.id] ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <BookmarkPlus className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {savedMessageIds[msg.id]
                              ? 'Salvo nos Relatórios do Experimento'
                              : 'Salvar Análise no Experimento'}
                          </span>
                        </button>

                        {onNavigateSubTab && (
                          <button
                            type="button"
                            onClick={() =>
                              onNavigateSubTab(getSuggestedSubTabForDomain(msg.domainArea).tab)
                            }
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 text-slate-700 dark:text-zinc-200 flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>{getSuggestedSubTabForDomain(msg.domainArea).label}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cartão de Arquivos Gerados pela IA */}
                  {msg.generatedFiles && msg.generatedFiles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Arquivos Gerados para Download & Uso</span>
                      </div>
                      <div className="space-y-2">
                        {msg.generatedFiles.map((file, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0 mt-0.5">
                                {file.fileType === 'r' ? <FileCode className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                              </div>
                              <div>
                                <strong className="text-slate-900 dark:text-white block font-mono text-xs">
                                  {file.fileName}
                                </strong>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                  {file.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(file, 'csv')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 text-slate-800 dark:text-zinc-200 flex items-center gap-1 shadow-sm transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Baixar CSV</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(file, 'xlsx')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 text-slate-800 dark:text-zinc-200 flex items-center gap-1 shadow-sm transition cursor-pointer"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                                <span>Baixar Excel</span>
                              </button>
                              {file.canImportToDataset && (
                                <button
                                  type="button"
                                  onClick={() => handleImportToDataset(file)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                                >
                                  <Database className="w-3.5 h-3.5" />
                                  <span>Importar para Experimento</span>
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
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Gráficos Científicos Gerados</span>
                      </div>
                      <div className="space-y-3">
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

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">
                    EU
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 dark:text-zinc-400 text-xs py-2">
              <NemaIAEstatisticaIcon
                size={32}
                variant="emblem"
                className="rounded-xl animate-pulse"
              />
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Nema IA Estatística processando matriz de dados e cálculos biométricos...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prévia de Anexos Pendentes */}
        {attachments.length > 0 && (
          <div className="p-3 bg-slate-100 dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 text-xs">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center gap-2 shadow-sm"
              >
                {att.kind === 'pdf' && <FileText className="w-3.5 h-3.5 text-rose-500" />}
                {att.kind === 'spreadsheet' && <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                {att.kind === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-500" />}
                {att.kind === 'doc' && <FileText className="w-3.5 h-3.5 text-indigo-500" />}
                {att.kind === 'text' && <FileCode className="w-3.5 h-3.5 text-amber-500" />}
                <span className="font-medium truncate max-w-[160px]">{att.name}</span>
                {att.rowCount && att.colCount && (
                  <span className="text-[10px] text-slate-400">
                    ({att.rowCount} lin x {att.colCount} col)
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="text-slate-400 hover:text-rose-500 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Caixa de Entrada e Envio */}
        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-b-2xl">
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
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer shrink-0"
            >
              <Paperclip className="w-5 h-5" />
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
              placeholder="Digite sua dúvida estatística, peça para calcular ANOVA, ajustar regressão, gerar gráficos científicos ou planilhas com resultados..."
              className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={isLoading || (!inputPrompt.trim() && attachments.length === 0)}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition shadow-md cursor-pointer shrink-0 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              Suporta: <strong>PDF, Excel (XLSX), CSV, Word (DOC), Fotos e Cadernos de Campo</strong>
            </span>
            <span>Pressione Enter para enviar (Shift+Enter para nova linha)</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default NemaIAEstatisticaView;
