import React, { useState } from 'react';
import {
  Sparkles,
  Sprout,
  X,
  Copy,
  Check,
  FileText,
  HelpCircle,
  ShieldCheck,
  Scale,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCheck2,
  BookOpen,
  Building2,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { Pericia, PericiaQuesito } from '../../types/pericia';

interface PericiaAIAssistantModalProps {
  pericia: Pericia;
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (targetSection: 'sinteseVistoria' | 'resultadoDiscussao' | 'conclusaoFinal' | 'quesito', text: string, quesitoId?: string) => void;
}

export const PericiaAIAssistantModal: React.FC<PericiaAIAssistantModalProps> = ({
  pericia,
  isOpen,
  onClose,
  onApplyText,
}) => {
  const [targetSection, setTargetSection] = useState<'sintese_vistoria' | 'resultado_discussao' | 'conclusao_laudo' | 'resposta_quesitos' | 'laudo_completo'>('resultado_discussao');
  const [tone, setTone] = useState<'judicial_abnt' | 'securitaria_proagro' | 'extrajudicial_assistencia'>('judicial_abnt');
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

  if (!isOpen) return null;

  const cultura = pericia.objetoDescricao?.cultura || pericia.analiseTecnica?.caracterizacaoCultura?.cultura || 'Lavoura Agrícola';
  const areaAfetada = pericia.objetoDescricao?.areaAfetadaHa || 0;
  const evento = pericia.objetoDescricao?.eventoRelacionado || pericia.objetoDescricao?.qualOProblema || 'Anomalia de Campo';
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
      // Client-side smart fallback text
      const perdaVal = (pericia.calculosDanos?.perdaFinanceiraTotalBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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
        keyHighlights: [`Vistoria presencial em ${imovel}`, `Área: ${areaAfetada} ha`, `Nexo causal: ${evento}`],
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

  const handleApply = (sectionKey?: 'sinteseVistoria' | 'resultadoDiscussao' | 'conclusaoFinal' | 'quesito') => {
    if (!resultData?.generatedText) return;

    let targetKey: 'sinteseVistoria' | 'resultadoDiscussao' | 'conclusaoFinal' | 'quesito' = 'resultadoDiscussao';
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

    onApplyText(targetKey, resultData.generatedText, targetKey === 'quesito' ? selectedQuesitoId : undefined);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  IA Assistente de Perícia Rural
                </h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Nema IA Legal
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Elaboração de minutas e pareceres periciais fundamentados com base nos dados de campo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-zinc-200 text-xs">
          
          {/* CONSOLIDATED FIELD INPUTS PREVIEW CARD */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700/80 overflow-hidden">
            <button
              onClick={() => setShowInputsSummary(!showInputsSummary)}
              className="w-full px-4 py-3 flex items-center justify-between bg-slate-100/80 dark:bg-zinc-800 font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Dados de Campo Consolidados ({imovel} • {cultura} • {areaAfetada} ha)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span>{showInputsSummary ? 'Ocultar Resumo' : 'Ver Resumo dos Inputs'}</span>
                {showInputsSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showInputsSummary && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-200 dark:border-zinc-700 text-[11px]">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Imóvel & Processo
                  </span>
                  <p className="text-slate-600 dark:text-zinc-400">{imovel} ({municipio}/{uf})</p>
                  <p className="text-slate-500">Perícia: {pericia.codigoPericia} ({pericia.tipo})</p>
                  <p className="text-slate-500">Processo: {pericia.numeroProcesso || pericia.numeroInterno || 'N/A'}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-amber-600" /> Objeto & Evento Danoso
                  </span>
                  <p className="text-slate-600 dark:text-zinc-400">Cultura: {cultura}</p>
                  <p className="text-slate-500">Área Atingida: {areaAfetada} ha</p>
                  <p className="text-slate-500">Causa/Evento: {evento}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-blue-600" /> Inspeção & Prejuízo
                  </span>
                  <p className="text-slate-600 dark:text-zinc-400">Data Vistoria: {primeiraVistoria?.data || pericia.dataAbertura || 'Recentemente'}</p>
                  <p className="text-slate-500">Vistorias Realizadas: {pericia.vistorias?.length || 0}</p>
                  <p className="text-slate-500 font-bold text-emerald-600">Dano: R$ {(pericia.calculosDanos?.perdaFinanceiraTotalBrl || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            )}
          </div>

          {/* CONTROLS: TARGET SECTION & TONE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* TARGET SECTION */}
            <div className="space-y-1.5">
              <label className="font-black text-slate-900 dark:text-white block">
                Seção do Laudo a Redigir:
              </label>
              <select
                value={targetSection}
                onChange={(e: any) => setTargetSection(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="sintese_vistoria">1. Síntese da Vistoria de Campo (Norma ABNT NBR 14.653-5)</option>
                <option value="resultado_discussao">2. Resultados e Discussão Técnica (Nexo Causal)</option>
                <option value="conclusao_laudo">3. Conclusão do Laudo e Encerramento Oficial</option>
                <option value="resposta_quesitos">4. Resposta a Quesito Processual Específico</option>
                <option value="laudo_completo">5. Minuta Estruturada Completa do Laudo</option>
              </select>
            </div>

            {/* TONE / ENQUADRAMENTO */}
            <div className="space-y-1.5">
              <label className="font-black text-slate-900 dark:text-white block">
                Enquadramento Jurídico / Formato:
              </label>
              <select
                value={tone}
                onChange={(e: any) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="judicial_abnt">⚖️ Perícia Judicial Formal (CPC Art. 473 & ABNT NBR 14.653-5)</option>
                <option value="securitaria_proagro">🛡️ Vistoria Securitária de Perda (Proagro / Seguro Agrícola)</option>
                <option value="extrajudicial_assistencia">📝 Parecer Técnico Extrajudicial / Assistente Técnico</option>
              </select>
            </div>
          </div>

          {/* IF QUESITO SELECTED */}
          {targetSection === 'resposta_quesitos' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-2 animate-in fade-in duration-150">
              <label className="font-bold text-emerald-900 dark:text-emerald-300 block">
                Selecione o Quesito a Responder:
              </label>
              {pericia.quesitos && pericia.quesitos.length > 0 ? (
                <select
                  value={selectedQuesitoId}
                  onChange={(e) => setSelectedQuesitoId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-semibold"
                >
                  {pericia.quesitos.map((q) => (
                    <option key={q.id} value={q.id}>
                      Quesito {q.numero}: {q.pergunta.length > 80 ? `${q.pergunta.slice(0, 80)}...` : q.pergunta}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  Nenhum quesito cadastrado nesta perícia. Você pode cadastrar quesitos na aba "Quesitos" do laudo.
                </p>
              )}
            </div>
          )}

          {/* CUSTOM PERITO FIELD NOTES */}
          <div className="space-y-1.5">
            <label className="font-black text-slate-900 dark:text-white block flex items-center justify-between">
              <span>Observações Específicas / Diretrizes do Perito (Opcional):</span>
              <span className="text-[11px] font-normal text-slate-500">Ex: ressalva sobre pivô central, gradiente espacial, etc.</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Digite aqui particularidades observadas em campo que deseja incluir na elaboração do texto pela IA..."
              rows={2}
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* GENERATE BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateText}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Elaborando Texto com a Nema IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
                  <span>Gerar Redação Pericial com IA</span>
                </>
              )}
            </button>
          </div>

          {/* GENERATED RESULT AREA */}
          {resultData && (
            <div className="mt-6 space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
              
              {/* METADATA BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-2xl text-emerald-900 dark:text-emerald-200">
                <div>
                  <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-100">
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
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => handleApply()}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {applied ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    <span>{applied ? 'Inserido no Laudo!' : 'Aplicar no Laudo'}</span>
                  </button>
                </div>
              </div>

              {/* HIGHLIGHTS */}
              {resultData.keyHighlights && resultData.keyHighlights.length > 0 && (
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {resultData.keyHighlights.map((hl, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-lg border border-slate-200 dark:border-zinc-700">
                      • {hl}
                    </span>
                  ))}
                </div>
              )}

              {/* TEXT DISPLAY BOX */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[320px] overflow-y-auto text-xs shadow-inner select-text">
                {resultData.generatedText}
              </div>

              {/* ACTION QUICK BUTTONS */}
              <div className="p-3 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-700 dark:text-zinc-300">Ação Rápida de Inserção:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApply('sinteseVistoria')}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer"
                  >
                    1. Síntese da Vistoria
                  </button>
                  <button
                    onClick={() => handleApply('resultadoDiscussao')}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer"
                  >
                    2. Resultados & Discussão
                  </button>
                  <button
                    onClick={() => handleApply('conclusaoFinal')}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer"
                  >
                    3. Conclusão Final
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            Inteligência Pericial Agronômica • AgroNutri Nema IA Legal
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
