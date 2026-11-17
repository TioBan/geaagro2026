import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Paperclip,
  X,
  Copy,
  Check,
  RotateCcw,
  User,
  ChevronDown,
  ChevronUp,
  Layers,
  Leaf,
  CheckCircle2,
  SlidersHorizontal,
  Download,
  FileText,
  FileCode,
  Loader2,
  Brain,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  MapPin,
} from 'lucide-react';
import { NemaAIIcon } from './NemaAIIcon';
import {
  AIDomain,
  ChatMessage,
  CentralAIAnalysisResult,
  NemaAttachment,
  NemaAttachmentKind,
  getRiskBadgeColor,
} from './types';
import { PRESET_PROMPTS, DOMAINS_CONFIG } from './presets';
import { FormattedChatMessage } from './FormattedChatMessage';
import { exportChatToPdf, exportChatToTxt } from '../../utils/nemaAiExport';

interface NemaAIChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
  parsingAttachments?: boolean;
  activeDomain: AIDomain;
  farmName: string;
  producerName?: string;
  fieldName: string;
  cropOrPasture: string;
  cultivarOrForage: string;
  soilType: string;
  pendingAttachments: NemaAttachment[];
  latestResult?: CentralAIAnalysisResult | null;
  memoryEnabled: boolean;
  memoryCount: number;
  onOpenMemory: () => void;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (id: string) => void;
  onToggleConfig: () => void;
  onApplyRecommendations?: (result: CentralAIAnalysisResult) => void;
}

function getAttachmentIcon(kind: NemaAttachmentKind) {
  switch (kind) {
    case 'image':
      return <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    case 'video':
      return <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
    case 'pdf':
      return <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
    case 'geoprocessing':
      return <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
  }
}

export const NemaAIChatView: React.FC<NemaAIChatViewProps> = ({
  messages,
  loading,
  parsingAttachments = false,
  activeDomain,
  farmName,
  producerName = 'Produtor Rural',
  fieldName,
  cropOrPasture,
  cultivarOrForage,
  soilType,
  pendingAttachments,
  latestResult,
  memoryEnabled,
  memoryCount,
  onOpenMemory,
  onSendMessage,
  onClearChat,
  onFileUpload,
  onRemoveAttachment,
  onToggleConfig,
  onApplyRecommendations,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if ((!inputText.trim() && pendingAttachments.length === 0) || loading) return;
    const text = inputText.trim() || 'Analise tecnicamente os anexos enviados considerando o contexto da fazenda e oriente a melhor tomada de decisão.';
    setInputText('');
    onSendMessage(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const domainConfig = DOMAINS_CONFIG.find((d) => d.id === activeDomain);
  const domainLabel = domainConfig?.label || 'Agronomia';

  const handleExport = async (format: 'pdf' | 'txt') => {
    setShowExportMenu(false);
    if (messages.length === 0) {
      setExportFeedback('Inicie ou carregue uma conversa para exportar.');
      setTimeout(() => setExportFeedback(null), 3000);
      return;
    }

    const exportContext = {
      farmName: farmName || 'Fazenda Principal',
      producerName: producerName || 'Produtor Rural',
      fieldName: fieldName || 'Talhão Geral',
      cropOrPasture,
      cultivarOrForage,
      soilType,
      domain: domainLabel,
      messages,
      latestResult,
    };

    if (format === 'txt') {
      exportChatToTxt(exportContext);
      setExportFeedback('Prontuário exportado em TXT com sucesso.');
      setTimeout(() => setExportFeedback(null), 3500);
    } else {
      setIsExportingPdf(true);
      try {
        await exportChatToPdf(exportContext);
        setExportFeedback('Prontuário agronômico exportado em PDF.');
      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        setExportFeedback('Erro ao compilar o PDF. Tente novamente.');
      } finally {
        setIsExportingPdf(false);
        setTimeout(() => setExportFeedback(null), 3500);
      }
    }
  };

  const currentPresets = PRESET_PROMPTS[activeDomain] || [];

  return (
    <div className="flex flex-col h-[640px] lg:h-[760px] bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      {/* Compact Header Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-white dark:bg-zinc-900 relative z-20">
        <div className="flex items-center gap-3 min-w-0">
          <NemaAIIcon size={34} />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Nema IA
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-lg">
              {farmName || 'Fazenda Ativa'} • {fieldName} • {cropOrPasture} ({cultivarOrForage}) • {domainLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Continuous Memory Toggle/Manager Button */}
          <button
            onClick={onOpenMemory}
            className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              memoryEnabled
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15'
                : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400'
            }`}
            title="Gerenciar Modo Memória Contínua"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Memória</span>
            <span className="tabular-nums text-[10px] opacity-80">({memoryCount})</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExportingPdf}
              className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Exportar conversa para PDF ou TXT"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              )}
              <span className="hidden sm:inline">Exportar</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 z-30">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={messages.length === 0}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-start gap-2.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Prontuário em PDF
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Laudo formal com campos CREA/ART
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('txt')}
                  disabled={messages.length === 0}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-start gap-2.5 transition-colors cursor-pointer mt-0.5 disabled:opacity-40"
                >
                  <FileCode className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Transcrição em TXT
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Texto limpo para prontuário e envio
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onToggleConfig}
            className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Configurar dados da propriedade e talhão"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Contexto</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
              title="Nova conversa limpa"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Nova</span>
            </button>
          )}
        </div>
      </div>

      {/* Export toast */}
      {exportFeedback && (
        <div className="bg-emerald-600 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{exportFeedback}</span>
          </div>
          <button onClick={() => setExportFeedback(null)} className="hover:opacity-80 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/60 dark:bg-zinc-950/70 select-text">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto my-6 space-y-6">
            <div className="text-center space-y-2.5">
              <div className="flex justify-center">
                <NemaAIIcon size={48} className="shadow-sm rounded-2xl" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Consultoria Técnica Nema IA
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-lg mx-auto">
                Especialista em adubação, fertilidade e biologia do solo, fitossanidade, nematologia, agropecuária (bovinos, suínos, aves, búfalos), heveicultura, receituários, geoprocessamento/NDVI, máquinas, perícia, avaliação rural e pesquisa.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                Envie <strong className="text-slate-700 dark:text-zinc-300">fotos, vídeos, PDFs, planilhas (CSV/XLSX/ODS)</strong> ou <strong className="text-slate-700 dark:text-zinc-300">arquivos geo (KML, KMZ, GeoJSON, GPX, GeoTIFF)</strong> para tomada de decisão.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentPresets.slice(0, 4).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(preset.prompt)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/70 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-2">
                    <span>{preset.title}</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 opacity-50 group-hover:opacity-100 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isExpanded = expandedReportId === msg.id;

          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <NemaAIIcon size={28} className="mt-1 rounded-lg" />
              )}

              <div className={`max-w-[88%] sm:max-w-[80%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border border-slate-200/90 dark:border-zinc-800 rounded-tl-xs'
                  }`}
                >
                  {/* Multi-attachment chips/previews inside message */}
                  {msg.attachments && msg.attachments.length > 0 ? (
                    <div className="mb-3 pb-2.5 border-b border-white/15 dark:border-zinc-800 flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] ${
                            isUser
                              ? 'bg-black/20 text-white/95'
                              : 'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {att.previewUrl && att.kind === 'image' ? (
                            <img
                              src={att.previewUrl}
                              alt={att.name}
                              className="w-7 h-7 rounded object-cover shrink-0"
                            />
                          ) : (
                            getAttachmentIcon(att.kind)
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold block truncate max-w-[160px]">{att.name}</span>
                            {att.summaryLabel && (
                              <span className="text-[10px] opacity-80 block">{att.summaryLabel}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : msg.attachedFileName ? (
                    <div className="mb-2.5 pb-2 border-b border-white/15 text-[11px] font-medium flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Anexo: {msg.attachedFileName}</span>
                    </div>
                  ) : null}

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <FormattedChatMessage content={msg.content} />
                  )}

                  {/* Memory updated indicator */}
                  {!isUser && msg.memoryAddedCount && msg.memoryAddedCount > 0 ? (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <Brain className="w-3.5 h-3.5" />
                      <span>
                        Memória atualizada com +{msg.memoryAddedCount}{' '}
                        {msg.memoryAddedCount === 1 ? 'registro operacional' : 'registros operacionais'}
                      </span>
                    </div>
                  ) : null}

                  {/* Collapsible Technical Parecer */}
                  {!isUser && msg.result && (
                    <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-zinc-800 space-y-2">
                      <button
                        onClick={() => setExpandedReportId(isExpanded ? null : msg.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/70 dark:hover:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-slate-900 dark:text-white block truncate">
                              Parecer Técnico Estruturado • {msg.result.domainCategory || domainLabel}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getRiskBadgeColor(
                                  msg.result.riskLevel
                                )}`}
                              >
                                Criticidade: {msg.result.riskLevel} ({msg.result.riskScorePercentage}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
                          <span>{isExpanded ? 'Ocultar' : 'Detalhes'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 block mb-1">
                              Resumo Executivo
                            </span>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                              {msg.result.executiveSummary}
                            </p>
                          </div>

                          {msg.result.biologicalManagementPlan && msg.result.biologicalManagementPlan.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                                <Leaf className="w-3.5 h-3.5" />
                                Recomendações Biológicas / Manejo
                              </span>
                              <div className="space-y-1.5">
                                {msg.result.biologicalManagementPlan.map((b, bIdx) => (
                                  <div
                                    key={bIdx}
                                    className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                                  >
                                    <div className="font-semibold text-slate-900 dark:text-white">{b.agent}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                      Alvo: {b.target} • Dose: {b.doseRecommendation} ({b.applicationTiming})
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.result.actionChecklist && msg.result.actionChecklist.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400 flex items-center gap-1 mb-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Plano de Ação Operacional
                              </span>
                              <ul className="space-y-1">
                                {msg.result.actionChecklist.map((act, aIdx) => (
                                  <li
                                    key={aIdx}
                                    className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-zinc-300"
                                  >
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {onApplyRecommendations && (
                            <button
                              onClick={() => onApplyRecommendations(msg.result!)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aplicar Recomendações no Talhão</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 px-1 text-[11px] text-slate-400 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span className="tabular-nums">
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer ml-1"
                      title="Copiar resposta"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              Nema IA analisando consulta e anexos...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-3 sm:p-4 space-y-2.5 shrink-0">
        {/* Quick Prompts Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          {currentPresets.slice(0, 4).map((p, pIdx) => (
            <button
              key={pIdx}
              onClick={() => onSendMessage(p.prompt)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200/70 dark:border-zinc-700/60 text-[11px] font-medium text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Pending Attachments Preview Bar */}
        {(pendingAttachments.length > 0 || parsingAttachments) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs max-w-[260px]"
              >
                {att.previewUrl && (att.kind === 'image' || att.kind === 'geoprocessing') ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-8 h-8 rounded-md object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    {getAttachmentIcon(att.kind)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-[11px] text-slate-900 dark:text-white block truncate">
                    {att.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate">
                    {att.summaryLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(att.id)}
                  className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                  title="Remover anexo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {parsingAttachments && (
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Lendo arquivo(s)...</span>
              </div>
            )}
          </div>
        )}

        {/* Input box */}
        <div className="flex items-end gap-2 bg-slate-50 dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
          <div className="pb-0.5 pl-0.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={parsingAttachments}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Anexar fotos, vídeos, PDF, planilhas (CSV/XLSX/ODS) ou arquivos geo (KML/KMZ/GeoJSON/GPX/GeoTIFF)"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf,.csv,.tsv,.xlsx,.xls,.ods,.kml,.kmz,.geojson,.json,.gpx,.tif,.tiff"
              onChange={(e) => {
                onFileUpload(e);
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Pergunte sobre ${cropOrPasture}, envie fotos, vídeos, laudos PDF, planilhas ou mapas KML/NDVI...`}
            rows={1}
            className="flex-1 bg-transparent text-xs sm:text-[13px] py-1.5 px-1 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none resize-none max-h-[130px]"
          />

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && pendingAttachments.length === 0) || loading || parsingAttachments}
            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 px-1">
          <span>Suporta Fotos, Vídeos, PDF, Planilhas (CSV/XLSX/ODS) e Geo (KML/KMZ/GeoJSON/GeoTIFF)</span>
          <span>Enter envia • Shift+Enter quebra linha</span>
        </div>
      </div>
    </div>
  );
};
