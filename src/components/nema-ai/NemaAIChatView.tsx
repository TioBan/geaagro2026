import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Paperclip,
  FileCheck,
  X,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Leaf,
  CheckCircle2,
  Sliders,
  Download,
  FileText,
  FileCode,
  Loader2,
} from 'lucide-react';
import {
  AIDomain,
  ChatMessage,
  CentralAIAnalysisResult,
  getRiskBadgeColor,
} from './types';
import { PRESET_PROMPTS, DOMAINS_CONFIG } from './presets';
import { FormattedChatMessage } from './FormattedChatMessage';
import { exportChatToPdf, exportChatToTxt } from '../../utils/nemaAiExport';

interface NemaAIChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
  activeDomain: AIDomain;
  farmName: string;
  producerName?: string;
  fieldName: string;
  cropOrPasture: string;
  cultivarOrForage: string;
  soilType: string;
  uploadedFileName: string | null;
  latestResult?: CentralAIAnalysisResult | null;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onToggleConfig: () => void;
  onApplyRecommendations?: (result: CentralAIAnalysisResult) => void;
}

export const NemaAIChatView: React.FC<NemaAIChatViewProps> = ({
  messages,
  loading,
  activeDomain,
  farmName,
  producerName = 'Produtor Rural',
  fieldName,
  cropOrPasture,
  cultivarOrForage,
  soilType,
  uploadedFileName,
  latestResult,
  onSendMessage,
  onClearChat,
  onFileUpload,
  onRemoveFile,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle outside click to close export dropdown
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
    if (!inputText.trim() || loading) return;
    const text = inputText;
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

  const domainLabel = DOMAINS_CONFIG.find((d) => d.id === activeDomain)?.label || 'Agronomia';

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
      setExportFeedback('Prontuário exportado em TXT com sucesso!');
      setTimeout(() => setExportFeedback(null), 3500);
    } else {
      setIsExportingPdf(true);
      try {
        await exportChatToPdf(exportContext);
        setExportFeedback('Prontuário agronômico oficial exportado em PDF!');
      } catch (err) {
        console.error('Erro ao gerar PDF do prontuário:', err);
        setExportFeedback('Erro ao compilar o PDF. Tente novamente.');
      } finally {
        setIsExportingPdf(false);
        setTimeout(() => setExportFeedback(null), 3500);
      }
    }
  };

  const currentPresets = PRESET_PROMPTS[activeDomain] || [];

  return (
    <div className="flex flex-col h-[700px] sm:h-[750px] bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Top Chat Bar */}
      <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900 dark:text-white">Nema IA • Bate-Papo</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Online
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
              {farmName || 'Fazenda'} • {fieldName} • {cropOrPasture} ({cultivarOrForage}) • Solo {soilType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Export Dropdown Button */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExportingPdf}
              className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Exportar histórico da conversa para prontuário agronômico"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              )}
              <span>Exportar</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Options */}
            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-zinc-800 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Registro em Prontuário
                  </span>
                  <p className="text-[10px] text-slate-600 dark:text-zinc-400 mt-0.5">
                    Selecione o formato para arquivamento:
                  </p>
                </div>

                <button
                  onClick={() => handleExport('pdf')}
                  disabled={messages.length === 0}
                  className="w-full text-left p-2 rounded-lg hover:bg-amber-500/10 dark:hover:bg-amber-950/30 flex items-start gap-2.5 transition-colors cursor-pointer group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Prontuário em PDF
                      </span>
                      <span className="text-[9px] font-black uppercase px-1 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                        Oficial
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
                      Laudo completo com cabeçalho oficial, dados de campo e campos para CREA/ART.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('txt')}
                  disabled={messages.length === 0}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-start gap-2.5 transition-colors cursor-pointer group mt-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Transcrição em TXT
                      </span>
                      <span className="text-[9px] font-black uppercase px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                        Texto
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
                      Texto estruturado ideal para prontuários eletrônicos, WhatsApp e ERPs.
                    </p>
                  </div>
                </button>

                {messages.length === 0 && (
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 px-2.5 py-1 text-center font-bold">
                    Nenhuma mensagem registrada ainda.
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onToggleConfig}
            className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Alterar dados da fazenda/talhão"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contexto</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
              title="Iniciar nova conversa limpa"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Export notification banner */}
      {exportFeedback && (
        <div className="bg-emerald-500 text-white text-[11px] font-bold px-4 py-1.5 flex items-center justify-between shrink-0 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{exportFeedback}</span>
          </div>
          <button onClick={() => setExportFeedback(null)} className="hover:opacity-80 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Messages Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 select-text">
        {/* Welcome Message when chat is empty */}
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto my-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Bate-papo técnico com a Nema IA
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                Tire dúvidas agronômicas em tempo real, receba recomendações de dosagens, interprete sintomas e elabore planos de manejo fitossanitário para <strong className="text-slate-900 dark:text-zinc-200">{cropOrPasture}</strong>. Ao final, você pode exportar todo o histórico para o prontuário agronômico oficial em PDF ou TXT.
              </p>
            </div>

            {/* Quick Starter Suggestions */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                Sugestões para iniciar a conversa:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {currentPresets.slice(0, 4).map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(preset.prompt)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-950/20 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{preset.title}</span>
                      <Sparkles className="w-3 h-3 text-amber-500 opacity-60 group-hover:opacity-100" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {preset.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isExpanded = expandedReportId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar on Left */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed transition-all ${
                    isUser
                      ? 'bg-slate-900 dark:bg-amber-950/50 text-white border border-slate-800 dark:border-amber-500/30 rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {/* Attached file chip if sent with message */}
                  {msg.attachedFileName && (
                    <div className="mb-2.5 pb-2 border-b border-white/10 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                      <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Anexo: {msg.attachedFileName}</span>
                    </div>
                  )}

                  {/* Render content */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  ) : (
                    <FormattedChatMessage content={msg.content} />
                  )}

                  {/* Structured Technical Report preview if available */}
                  {!isUser && msg.result && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-zinc-800 space-y-2">
                      <button
                        onClick={() => setExpandedReportId(isExpanded ? null : msg.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/60 dark:hover:bg-zinc-950 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="font-extrabold text-[11px] text-slate-900 dark:text-white block">
                              Parecer Técnico & Indicadores Agronômicos
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${getRiskBadgeColor(msg.result.riskLevel)}`}>
                                Risco: {msg.result.riskLevel} ({msg.result.riskScorePercentage}%)
                              </span>
                              {msg.result.reproductionFactorAnalysis?.estimatedFR !== undefined && (
                                <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                                  FR: {msg.result.reproductionFactorAnalysis.estimatedFR}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                          <span>{isExpanded ? 'Recolher' : 'Expandir Laudo'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </button>

                      {/* Expanded Report Details */}
                      {isExpanded && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
                          {/* Executive Summary */}
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-zinc-400 block mb-1">
                              Resumo Executivo do Laudo
                            </span>
                            <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                              {msg.result.executiveSummary}
                            </p>
                          </div>

                          {/* Biological Management */}
                          {msg.result.biologicalManagementPlan && msg.result.biologicalManagementPlan.length > 0 && (
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                                <Leaf className="w-3.5 h-3.5" />
                                Prescrição Biológica
                              </span>
                              <div className="space-y-1.5">
                                {msg.result.biologicalManagementPlan.map((b, bIdx) => (
                                  <div key={bIdx} className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px]">
                                    <div className="font-extrabold text-slate-900 dark:text-white">{b.agent}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                      Alvo: {b.target} • Dose: {b.doseRecommendation} ({b.applicationTiming})
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Checklist */}
                          {msg.result.actionChecklist && msg.result.actionChecklist.length > 0 && (
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Checklist Operacional
                              </span>
                              <ul className="space-y-1">
                                {msg.result.actionChecklist.map((act, aIdx) => (
                                  <li key={aIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300 font-medium">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {onApplyRecommendations && (
                            <button
                              onClick={() => onApplyRecommendations(msg.result!)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
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

                {/* Footer of message: timestamp & copy */}
                <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-0.5 cursor-pointer ml-1"
                      title="Copiar resposta"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Copiado</span>
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

              {/* User Avatar on Right */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-center animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-2 shadow-2xs">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-100" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-200" />
              </span>
              <span className="font-bold text-slate-700 dark:text-zinc-200">
                Nema IA analisando contexto agronômico...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Docked Input Area (Bottom) */}
      <div className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-3 sm:p-4 space-y-2.5 shrink-0">
        {/* Quick Suggestion Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Perguntas Rápidas:
          </span>
          {currentPresets.slice(0, 4).map((p, pIdx) => (
            <button
              key={pIdx}
              onClick={() => onSendMessage(p.prompt)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-amber-500/10 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/80 dark:border-zinc-700/60 text-[11px] font-bold text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Input bar and buttons */}
        <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          {/* File Attachment Button */}
          <div className="relative pb-1 pl-1">
            <label
              htmlFor="nema-chat-file"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Anexar foto do campo ou laudo laboratorial (PDF/Imagem)"
            >
              <Paperclip className="w-4 h-4" />
            </label>
            <input
              id="nema-chat-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={onFileUpload}
              className="hidden"
            />
          </div>

          {/* Text Area */}
          <div className="flex-1 min-w-0">
            {uploadedFileName && (
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-1.5">
                <FileCheck className="w-3 h-3 text-amber-500" />
                <span className="truncate max-w-[200px]">{uploadedFileName}</span>
                <button
                  onClick={onRemoveFile}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Converse com a Nema IA sobre ${cropOrPasture}, manejo de solo, nematoides ou dúvidas... (Enter para enviar)`}
              rows={1}
              className="w-full bg-transparent text-xs p-1 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none resize-none font-medium max-h-[120px]"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || loading}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed pb-0.5"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Pressione <strong>Enter</strong> para enviar, <strong>Shift+Enter</strong> para nova linha</span>
          <span>Prontuário exportável em PDF e TXT</span>
        </div>
      </div>
    </div>
  );
};

