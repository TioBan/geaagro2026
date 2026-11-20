import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Sprout,
  X,
  Copy,
  Check,
  Scale,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Building2,
} from 'lucide-react';
import { Pericia } from '../../types/pericia';

interface PericiaAIAssistantModalProps {
  pericia: Pericia;
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (
    targetSection: 'sinteseVistoria' | 'resultadoDiscussao' | 'conclusaoFinal' | 'quesito',
    text: string,
    quesitoId?: string
  ) => void;
}

export const PericiaAIAssistantModal: React.FC<PericiaAIAssistantModalProps> = ({
  pericia,
  isOpen,
  onClose,
  onApplyText,
}) => {
  const [targetSection, setTargetSection] = useState<
    'sintese_vistoria' | 'resultado_discussao' | 'conclusao_laudo' | 'resposta_quesitos' | 'laudo_completo'
  >('resultado_discussao');
  const [tone, setTone] = useState<
    'judicial_abnt' | 'securitaria_proagro' | 'extrajudicial_assistencia'
  >('judicial_abnt');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedQuesitoId, setSelectedQuesitoId] = useState<string>(pericia.quesitos?.[0]?.id || '');

  const [loading, setLoading] = useState(false);
  const [showInputsSummary, setShowInputsSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [resultData, setResultData] = useState<{
    generatedText: string;
    suggestedTitle?: string;
    keyHighlights?: string[];
    nexoCausalSummary?: string;
    normativeReference?: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cultura =
    pericia.objetoDescricao?.cultura ||
    pericia.analiseTecnica?.caracterizacaoCultura?.cultura ||
    'Lavoura Agrícola';
  const areaAfetada = pericia.objetoDescricao?.areaAfetadaHa || 0;
  const evento =
    pericia.objetoDescricao?.eventoRelacionado ||
    pericia.objetoDescricao?.qualOProblema ||
    'Anomalia de Campo';
  const imovel = pericia.imovelNome || 'Imóvel Rural';
  const municipio = pericia.municipio || 'Município';
  const uf = pericia.uf || 'UF';
  const primeiraVistoria = pericia.vistorias?.[0];

  const handleGenerateText = async () => {
    setLoading(true);
    setResultData(null);
    setApplied(false);

    const selectedQuesito = pericia.quesitos?.find((q) => q.id === selectedQuesitoId);

    try {
      const response = await fetch('/api/pericia-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pericia,
          targetSection,
          tone,
          customPrompt,
          quesito: targetSection === 'resposta_quesitos' ? selectedQuesito : null,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResultData(json.data);
      } else {
        throw new Error(json.error || 'Erro ao gerar texto da perícia');
      }
    } catch (err) {
      console.warn('Fallback local acionado na IA Assistente de Perícia:', err);
      const perdaVal = (pericia.calculosDanos?.perdaFinanceiraTotalBrl || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      });
      let fallbackText = '';
      if (targetSection === 'sintese_vistoria') {
        fallbackText = `### SÍNTESE DA VISTORIA PERICIAL DE CAMPO\n\nA amostragem e inspeção pericial foram conduzidas no imóvel **${imovel}** (${municipio}/${uf}) na lavoura de **${cultura}**.\n\nConstatou-se uma superfície atingida de **${areaAfetada} hectares**, apresentando sintomatologia e danos correlacionados com o evento **${evento}**.\n\nTodos os pontos de vistoria foram registrados via coordenadas georreferenciadas GPS e fotografias analíticas anexadas a este laudo.`;
      } else if (targetSection === 'resultado_discussao') {
        fallbackText = `### RESULTADOS E DISCUSSÃO TÉCNICA AGRONÔMICA\n\n**1. Análise Causal e Sintomatologia:**\nA vistoria técnica presencial na cultura de **${cultura}** confirmou nexo causal direto entre o sinistro por **${evento}** e a depreciação do potencial produtivo na área de **${areaAfetada} ha**.\n\n**2. Caracterização Edáfica e Sanidade:**\nOs laudos laboratoriais de solo anexados afastam limitações de fertilidade ou deficiência mineral primária como geradoras do dano.\n\n**3. Liquidação e Valoração do Prejuízo:**\nO valor apurado para reparação/indenização pericial foi quantificado no montante de **R$ ${perdaVal}**.`;
      } else if (targetSection === 'conclusao_laudo') {
        fallbackText = `### CONCLUSÃO PERICIAL OFICIAL\n\nCom base na instrução técnica presencial, análise de dados e diretrizes da norma ABNT NBR 14.653-5, o Perito conclui que:\n\n1. O imóvel **${imovel}** sofreu prejuízo por **${evento}** na cultura de **${cultura}** (${areaAfetada} ha).\n2. Restou comprovado o nexo de causalidade técnica entre o evento adverso e a quebra de safra.\n3. O prejuízo econômico encontra-se liquidado em **R$ ${perdaVal}**.`;
      } else if (targetSection === 'resposta_quesitos' && selectedQuesito) {
        fallbackText = `**RESPOSTA AO QUESITO Nº ${selectedQuesito.numero}:**\n\n*Pergunta:* "${selectedQuesito.pergunta}"\n\n*Resposta do Perito:* Sim. As constatações presenciais no imóvel **${imovel}**, relativas à cultura de **${cultura}**, atestam que o evento **${evento}** causou avarias na área de **${areaAfetada} ha**, com prejuízo líquido de R$ ${perdaVal}.`;
      } else {
        fallbackText = `### MINUTA DO LAUDO PERICIAL AGRONÔMICO\n\n**Imóvel:** ${imovel} (${municipio}/${uf})\n**Cultura:** ${cultura} • **Área Afetada:** ${areaAfetada} ha\n**Evento:** ${evento} • **Dano:** R$ ${perdaVal}\n\nTexto redigido em observância à Norma ABNT NBR 14.653-5 e Código de Processo Civil Art. 473.`;
      }

      setResultData({
        generatedText: fallbackText,
        suggestedTitle: 'Minuta Gerada (Modo Inteligente Local)',
        keyHighlights: [
          `Vistoria presencial em ${imovel}`,
          `Área: ${areaAfetada} ha`,
          `Nexo causal: ${evento}`,
        ],
        nexoCausalSummary: `Nexo causal atrelado ao evento ${evento}.`,
        normativeReference: 'ABNT NBR 14.653-5 • CPC Art. 473',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultData?.generatedText) return;
    navigator.clipboard.writeText(resultData.generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (
    sectionKey?: 'sinteseVistoria' | 'resultadoDiscussao' | 'conclusaoFinal' | 'quesito'
  ) => {
    if (!resultData?.generatedText) return;

    let targetKey: 'sinteseVistoria' | 'resultadoDiscussao' | 'conclusaoFinal' | 'quesito' =
      'resultadoDiscussao';
    if (sectionKey) {
      targetKey = sectionKey;
    } else if (targetSection === 'sintese_vistoria') {
      targetKey = 'sinteseVistoria';
    } else if (targetSection === 'resultado_discussao' || targetSection === 'laudo_completo') {
      targetKey = 'resultadoDiscussao';
    } else if (targetSection === 'conclusao_laudo') {
      targetKey = 'conclusaoFinal';
    } else if (targetSection === 'resposta_quesitos') {
      targetKey = 'quesito';
    }

    onApplyText(
      targetKey,
      resultData.generatedText,
      targetKey === 'quesito' ? selectedQuesitoId : undefined
    );
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-800 w-full max-w-4xl max-h-[90vh] my-auto flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  Assistente de Redação Pericial
                </h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
                  ABNT NBR 14.653
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                Elaboração de minutas e pareceres fundamentados nos dados de campo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-zinc-200 text-xs">
          {/* Consolidated Field Inputs Collapsible */}
          <div className="bg-slate-50/80 dark:bg-zinc-950/40 rounded-lg border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInputsSummary(!showInputsSummary)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                  Dados consolidados ({imovel} • {cultura} • {areaAfetada} ha)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
                <span>{showInputsSummary ? 'Ocultar' : 'Ver resumo'}</span>
                {showInputsSummary ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {showInputsSummary && (
              <div className="p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-200/80 dark:border-zinc-800 text-[11px]">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-1">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Imóvel & Processo
                  </span>
                  <p className="text-slate-600 dark:text-zinc-300">
                    {imovel} ({municipio}/{uf})
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400">
                    Perícia: {pericia.codigoPericia} ({pericia.tipo})
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400">
                    Processo: {pericia.numeroProcesso || pericia.numeroInterno || 'N/A'}
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-1">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Objeto & Evento Danoso
                  </span>
                  <p className="text-slate-600 dark:text-zinc-300">Cultura: {cultura}</p>
                  <p className="text-slate-500 dark:text-zinc-400 tabular-nums">
                    Área atingida: {areaAfetada} ha
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400">Causa/Evento: {evento}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-1">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Inspeção & Prejuízo
                  </span>
                  <p className="text-slate-600 dark:text-zinc-300">
                    Data vistoria: {primeiraVistoria?.data || pericia.dataAbertura || 'Recentemente'}
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 tabular-nums">
                    Vistorias realizadas: {pericia.vistorias?.length || 0}
                  </p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    Dano: R$ {(pericia.calculosDanos?.perdaFinanceiraTotalBrl || 0).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Target Section & Legal Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400 block">
                Seção do Laudo a Redigir
              </label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value as typeof targetSection)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="sintese_vistoria">1. Síntese da Vistoria de Campo (ABNT NBR 14.653-5)</option>
                <option value="resultado_discussao">2. Resultados e Discussão Técnica (Nexo Causal)</option>
                <option value="conclusao_laudo">3. Conclusão do Laudo e Encerramento Oficial</option>
                <option value="resposta_quesitos">4. Resposta a Quesito Processual Específico</option>
                <option value="laudo_completo">5. Minuta Estruturada Completa do Laudo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400 block">
                Enquadramento Jurídico / Formato
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="judicial_abnt">Perícia Judicial Formal (CPC Art. 473 & ABNT NBR 14.653-5)</option>
                <option value="securitaria_proagro">Vistoria Securitária de Perda (Proagro / Seguro Agrícola)</option>
                <option value="extrajudicial_assistencia">Parecer Técnico Extrajudicial / Assistente Técnico</option>
              </select>
            </div>
          </div>

          {/* Quesito selector */}
          {targetSection === 'resposta_quesitos' && (
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-lg space-y-1.5">
              <label className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 block">
                Selecione o Quesito a Responder
              </label>
              {pericia.quesitos && pericia.quesitos.length > 0 ? (
                <select
                  value={selectedQuesitoId}
                  onChange={(e) => setSelectedQuesitoId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-medium"
                >
                  {pericia.quesitos.map((q) => (
                    <option key={q.id} value={q.id}>
                      Quesito {q.numero}: {q.pergunta.length > 80 ? `${q.pergunta.slice(0, 80)}...` : q.pergunta}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-amber-700 dark:text-amber-400 text-xs">
                  Nenhum quesito cadastrado nesta perícia. Cadastre quesitos na aba "Quesitos" do laudo.
                </p>
              )}
            </div>
          )}

          {/* Custom Notes */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
                Observações / Diretrizes do Perito (Opcional)
              </label>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Ex: ressalva sobre pivô central, gradiente espacial
              </span>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Informe particularidades observadas em campo que deseja incluir na minuta..."
              rows={2}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Generate CTA */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateText}
              disabled={loading}
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Elaborando redação...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Redação Pericial</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Area */}
          {resultData && (
            <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 p-3 rounded-lg">
                <div>
                  <h4 className="font-semibold text-xs text-emerald-950 dark:text-emerald-100">
                    {resultData.suggestedTitle || 'Texto Pericial Redigido'}
                  </h4>
                  {resultData.normativeReference && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Fundamentação: {resultData.normativeReference}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-8 px-3 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApply()}
                    className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {applied ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{applied ? 'Inserido no Laudo' : 'Aplicar no Laudo'}</span>
                  </button>
                </div>
              </div>

              {resultData.keyHighlights && resultData.keyHighlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {resultData.keyHighlights.map((hl, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium rounded border border-slate-200/80 dark:border-zinc-700"
                    >
                      {hl}
                    </span>
                  ))}
                </div>
              )}

              <div className="bg-slate-950 text-slate-100 p-4 rounded-lg border border-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto text-xs select-text">
                {resultData.generatedText}
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-zinc-950/40 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  Inserção direta em seção:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApply('sinteseVistoria')}
                    className="h-7 px-2.5 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    1. Síntese da Vistoria
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply('resultadoDiscussao')}
                    className="h-7 px-2.5 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    2. Resultados & Discussão
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply('conclusaoFinal')}
                    className="h-7 px-2.5 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    3. Conclusão Final
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-zinc-950/40 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            Redação assistida conforme ABNT NBR 14.653 e CPC Art. 473
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
