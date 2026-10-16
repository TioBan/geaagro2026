import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  RefreshCw,
  Sprout,
  FlaskConical,
  Bug,
  Beef,
  Bird,
  X,
  FileCheck,
  History,
  Compass,
  Layers,
} from 'lucide-react';
import { NEMATODE_SPECIES_CATALOG } from '../data/nematologyData';
import { nemaAIDB, NemaAIDiagnosisLog } from '../utils/nemaAiDb';
import {
  AIDomain,
  CentralAIAnalysisResult,
  NemaAIConsoleProps,
  ChatMessage,
} from './nema-ai/types';
import { DOMAINS_CONFIG, PRESET_PROMPTS } from './nema-ai/presets';
import { NemaAIContextForm } from './nema-ai/NemaAIContextForm';
import { NemaAIResultView } from './nema-ai/NemaAIResultView';
import { NemaAIHistorySidebar } from './nema-ai/NemaAIHistorySidebar';
import { NemaAIScoreView } from './nema-ai/NemaAIScoreView';
import { NemaAIChatView } from './nema-ai/NemaAIChatView';
import { exportChatToPdf, exportChatToTxt } from '../utils/nemaAiExport';

export const NemaAIConsole: React.FC<NemaAIConsoleProps> = ({
  currentFarm,
  currentProducer,
  currentField,
  soilSamples = [],
  leafSamples = [],
  speciesCatalog = NEMATODE_SPECIES_CATALOG,
  onApplyRecommendations,
  initialSubModule,
}) => {
  const [activeSubModule, setActiveSubModule] = useState<'conversa' | 'score'>(initialSubModule || 'conversa');

  useEffect(() => {
    if (initialSubModule) {
      setActiveSubModule(initialSubModule);
    }
  }, [initialSubModule]);

  // Domain selection state
  const [activeDomain, setActiveDomain] = useState<AIDomain>('geral');

  // Custom context override states
  const [farmName, setFarmName] = useState<string>('');
  const [producerName, setProducerName] = useState<string>('');
  const [fieldName, setFieldName] = useState<string>('Talhão Principal');
  const [areaHa, setAreaHa] = useState<number>(50);
  const [cropOrPasture, setCropOrPasture] = useState<string>('Soja');
  const [cultivarOrForage, setCultivarOrForage] = useState<string>('Padrão');
  const [soilType, setSoilType] = useState<string>('Argiloso');

  // Livestock and Aviculture specific variables
  const [carryingCapacity, setCarryingCapacity] = useState<number>(1.8); // UA/ha
  const [gmdTarget, setGmdTarget] = useState<number>(0.8); // kg/day
  const [batchAgeDays, setBatchAgeDays] = useState<number>(21);
  const [feedConversion, setFeedConversion] = useState<number>(1.65);

  // Chat input and execution states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CentralAIAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showExpandedResult, setShowExpandedResult] = useState<boolean>(false);

  // History states
  const [diagnosesHistory, setDiagnosesHistory] = useState<NemaAIDiagnosisLog[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const history = await nemaAIDB.getAllDiagnoses();
      setDiagnosesHistory(history);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Sync with prop changes when available
  useEffect(() => {
    if (currentFarm) {
      setFarmName(currentFarm.name || '');
      const farmCrop = (currentFarm as any).currentCrop || currentFarm.plots?.[0]?.currentCrop || currentFarm.cropHistory?.[0];
      if (farmCrop) {
        setCropOrPasture(farmCrop);
      }
      setFieldName(currentFarm.city ? `Pivô ${currentFarm.city}` : 'Talhão Principal');
    }
    if (currentProducer) {
      setProducerName(currentProducer.name || '');
    }
  }, [currentFarm, currentProducer]);

  // File Upload Handler (Image/PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Content = result.split(',')[1];
      setFileBase64(base64Content);
      setFileMimeType(file.type);
    };
    reader.onerror = () => {
      setErrorMessage('Erro ao ler o arquivo anexado.');
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedFile = () => {
    setUploadedFileName(null);
    setFileBase64(null);
    setFileMimeType(null);
  };

  // Run Nema IA Central Analysis / Conversational Chat
  const runCentralAI = async (customPrompt?: string) => {
    setLoading(true);
    setErrorMessage(null);

    const promptToSend = customPrompt || userPrompt;
    if (!promptToSend.trim()) {
      setErrorMessage('Por favor, digite uma pergunta ou selecione um preset rápido.');
      setLoading(false);
      return;
    }

    const currentFile = uploadedFileName;
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
      attachedFileName: currentFile,
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setUserPrompt('');

    // Build specific context based on the active domain
    const livestockContext =
      activeDomain === 'pecuaria'
        ? {
            carryingCapacityUaHa: carryingCapacity,
            gmdTargetKgDay: gmdTarget,
            pastureSpecies: cultivarOrForage,
          }
        : activeDomain === 'avicultura'
        ? {
            batchAgeDays,
            feedConversion,
            aviarySystem: 'Dark House',
          }
        : null;

    const payload = {
      domain: activeDomain,
      farmName: farmName || 'Fazenda Ativa',
      producerName: producerName || 'Produtor Rural',
      fieldName,
      areaHa,
      crop: cropOrPasture,
      cultivar: cultivarOrForage,
      soilType,
      userPrompt: promptToSend,
      messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
      fileData: fileBase64,
      mimeType: fileMimeType,
      selectedSpecies: 'Todas as espécies ou alvos',
      livestockContext,
      labResults: soilSamples.map(s => ({
        id: s.id,
        sampleCode: s.sampleCode,
        plot: s.plotId || (s as any).plotName,
        depth: s.depth || (s as any).depthCm,
        sand: s.sandPercent,
        clay: s.clayPercent,
        ph: s.phCaCl2 || (s as any).phWater,
        om: s.organicMatterGdm3 || (s as any).organicMatter,
        p: s.pResinaMgDm3 || s.pMehlich1MgDm3 || (s as any).pResin,
        k: s.kCmolcDm3 || (s as any).kExchangeable,
        v: s.vPercent,
      })),
      foliarSamples: leafSamples.map(l => ({
        id: l.id,
        sampleCode: l.sampleCode,
        crop: l.crop,
        growthStage: l.growthStage,
        n: l.n_g_kg ?? (l as any).results?.N,
        p: l.p_g_kg ?? (l as any).results?.P,
        k: l.k_g_kg ?? (l as any).results?.K,
        ca: l.ca_g_kg ?? (l as any).results?.Ca,
        mg: l.mg_g_kg ?? (l as any).results?.Mg,
        s: l.s_g_kg ?? (l as any).results?.S,
        b: l.b_mg_kg ?? (l as any).results?.B,
        zn: l.zn_mg_kg ?? (l as any).results?.Zn,
        cu: l.cu_mg_kg ?? (l as any).results?.Cu,
        fe: l.fe_mg_kg ?? (l as any).results?.Fe,
        mn: l.mn_mg_kg ?? (l as any).results?.Mn,
        mo: (l as any).results?.Mo ?? 0.8,
      })),
      leafSamples,
    };

    try {
      const response = await fetch('/api/nema-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao processar análise técnica.');
      }

      const botReply = data.data.reply || data.data.executiveSummary || 'Parecer técnico gerado com sucesso.';
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: Date.now(),
        result: data.data,
      };

      const finalMessages = [...nextMessages, botMsg];
      setChatMessages(finalMessages);
      setAnalysisResult(data.data);

      if (onApplyRecommendations) {
        onApplyRecommendations(data.data);
      }

      // Save to IndexedDB local history
      try {
        const logId = selectedHistoryId || `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const log: NemaAIDiagnosisLog = {
          id: logId,
          timestamp: Date.now(),
          domain: activeDomain,
          prompt: promptToSend,
          farmName: farmName || 'Fazenda Ativa',
          producerName: producerName || 'Produtor Rural',
          fieldName,
          areaHa,
          cropOrPasture,
          cultivarOrForage,
          soilType,
          result: data.data,
          uploadedFileName: currentFile,
          messages: finalMessages,
        };
        await nemaAIDB.saveDiagnosis(log);
        setSelectedHistoryId(logId);
        await loadHistory();
      } catch (saveErr) {
        console.error('Erro ao salvar diagnóstico no histórico local:', saveErr);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro de comunicação com o servidor de Inteligência Artificial.');
    } finally {
      setLoading(false);
      removeUploadedFile();
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setSelectedHistoryId(null);
    setAnalysisResult(null);
    removeUploadedFile();
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const targets = analysisResult.dominantSpeciesOrTargets || analysisResult.dominantSpeciesIdentified || [];
    const text = `PARECER TÉCNICO NEMA IA (CENTRAL AGRO)
Data: ${new Date().toLocaleDateString('pt-BR')}
Fazenda: ${farmName} | Produtor: ${producerName}
Domínio Técnico: ${analysisResult.domainCategory || activeDomain.toUpperCase()}
Grau de Risco / Alerta: ${analysisResult.riskLevel} (${analysisResult.riskScorePercentage}%)
Resumo Executivo: ${analysisResult.executiveSummary}

Focos de Atenção: ${targets.join(', ')}
Avaliação de Limites/Dano: ${analysisResult.damageThresholdAssessment}

Manejo Biológico Recomendado:
${(analysisResult.biologicalManagementPlan || []).map(b => `- ${b.agent} contra ${b.target}: ${b.doseRecommendation} em ${b.applicationTiming}`).join('\n')}

Manejo Cultural & Coberturas:
- Recomendadas: ${(analysisResult.cropRotationAndCoverCrops?.recommendedCoverCrops || []).join(', ')}
- Evitar: ${(analysisResult.cropRotationAndCoverCrops?.cropsToAvoid || []).join(', ')}
- Estratégia de Sucessão: ${analysisResult.cropRotationAndCoverCrops?.successionStrategy || ''}

Saúde do Solo (BioAS):
${(analysisResult.soilHealthAndBioASRecommendations || []).map(s => `- ${s}`).join('\n')}

Checklist Operacional:
${(analysisResult.actionChecklist || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectHistoryItem = (item: NemaAIDiagnosisLog) => {
    setSelectedHistoryId(item.id);
    setActiveDomain(item.domain);
    setUserPrompt(item.prompt);
    setFarmName(item.farmName);
    setProducerName(item.producerName);
    setFieldName(item.fieldName);
    setAreaHa(item.areaHa);
    setCropOrPasture(item.cropOrPasture);
    setCultivarOrForage(item.cultivarOrForage);
    setSoilType(item.soilType);
    setUploadedFileName(item.uploadedFileName);
    setAnalysisResult(item.result);

    if (item.messages && item.messages.length > 0) {
      setChatMessages(item.messages);
    } else {
      setChatMessages([
        {
          id: `hist_user_${item.id}`,
          role: 'user',
          content: item.prompt,
          timestamp: item.timestamp,
          attachedFileName: item.uploadedFileName,
        },
        {
          id: `hist_bot_${item.id}`,
          role: 'assistant',
          content: item.result?.reply || item.result?.executiveSummary || 'Parecer técnico registrado.',
          timestamp: item.timestamp + 1000,
          result: item.result,
        },
      ]);
    }
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await nemaAIDB.deleteDiagnosis(id);
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
        setAnalysisResult(null);
      }
      await loadHistory();
    } catch (err) {
      console.error('Erro ao deletar diagnóstico do histórico:', err);
    }
  };

  const handleClearAllHistory = async () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de diagnósticos locais? Esta ação é irreversível.')) {
      try {
        await nemaAIDB.clearHistory();
        setSelectedHistoryId(null);
        setAnalysisResult(null);
        await loadHistory();
      } catch (err) {
        console.error('Erro ao limpar histórico:', err);
      }
    }
  };

  const handleDomainChange = (domain: AIDomain, defaultCrop: string) => {
    setActiveDomain(domain);
    // Preserve custom crops (like Maracujá) when changing domains
    if (!cropOrPasture || ['Soja', 'Milho', 'Brachiaria brizantha', 'Frango de Corte', 'Padrão'].includes(cropOrPasture)) {
      setCropOrPasture(defaultCrop);
    }
  };

  const handleExportHistoryItem = (item: NemaAIDiagnosisLog, format: 'pdf' | 'txt') => {
    const messagesToExport: ChatMessage[] = item.messages && item.messages.length > 0
      ? item.messages
      : [
          {
            id: `u-${item.id}`,
            role: 'user',
            content: item.prompt,
            timestamp: item.timestamp,
            attachedFileName: item.uploadedFileName || undefined,
          },
          {
            id: `a-${item.id}`,
            role: 'assistant',
            content: item.result?.executiveSummary || 'Parecer agronômico emitido pela Nema IA.',
            timestamp: item.timestamp,
            result: item.result,
          },
        ];

    const exportContext = {
      farmName: item.farmName || farmName || 'Fazenda Principal',
      producerName: producerName || 'Produtor Rural',
      fieldName: item.fieldName || 'Talhão Geral',
      cropOrPasture: item.cropOrPasture || cropOrPasture,
      cultivarOrForage,
      soilType,
      domain: item.domain || activeDomain,
      messages: messagesToExport,
      latestResult: item.result,
    };

    if (format === 'txt') {
      exportChatToTxt(exportContext);
    } else {
      exportChatToPdf(exportContext);
    }
  };

  const getDomainIcon = (domain: AIDomain) => {
    switch (domain) {
      case 'geral':
        return <Sprout className="w-5 h-5 mb-1" />;
      case 'fertilidade':
        return <FlaskConical className="w-5 h-5 mb-1" />;
      case 'nematologia':
        return <Bug className="w-5 h-5 mb-1" />;
      case 'pecuaria':
        return <Beef className="w-5 h-5 mb-1" />;
      case 'avicultura':
        return <Bird className="w-5 h-5 mb-1" />;
    }
  };

  return (
    <div className="space-y-6">
      {activeSubModule === 'conversa' ? (
        <>
          {/* Dynamic Header */}
          <div className="bg-gradient-to-r from-stone-950 via-neutral-900 to-amber-955 text-white rounded-2xl p-6 shadow-md border border-amber-955/40 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-stone-400 text-xs font-semibold">
                  Motor Nema é baseado no ecossistema IA com biblioteca Agropecuária Integrada
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 via-amber-600/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/40 shrink-0">
                  <Sprout className="w-6 h-6 text-amber-400" />
                </div>
                <span>Conversa com a Nema IA</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
                O cérebro digital da sua fazenda. Faça perguntas técnicas complexas, envie fotos de sintomas ou laudos laboratoriais e obtenha pareceres profissionais fundamentados em Agronomia, Agricultura e Zootecnia.
              </p>
            </div>

            {/* Header Control Buttons */}
            <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`bg-stone-900 hover:bg-stone-850 border border-stone-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  showHistory ? 'text-amber-400 border-amber-500/40' : 'text-stone-300'
                }`}
              >
                <History className="w-4 h-4" />
                <span>{showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}</span>
              </button>

              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`bg-stone-900 hover:bg-stone-850 border border-stone-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  showConfig ? 'text-amber-400 border-amber-500/40' : 'text-stone-300'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{showConfig ? 'Ocultar Contexto Fazenda' : 'Configurar Contexto Técnico'}</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Workspace Column (3 columns when history is open, 4 when closed) */}
            <div className={showHistory ? 'lg:col-span-3 space-y-6' : 'lg:col-span-4 space-y-6'}>
              {/* Domain Selection Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                {DOMAINS_CONFIG.map(domain => {
                  const isActive = activeDomain === domain.id;
                  return (
                    <button
                      key={domain.id}
                      onClick={() => handleDomainChange(domain.id, domain.defaultCrop)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer border ${
                        domain.id === 'avicultura' ? 'col-span-2 sm:col-span-1' : ''
                      } ${
                        isActive
                          ? 'bg-white dark:bg-zinc-900 border-amber-500 shadow-2xs text-amber-600 dark:text-amber-400'
                          : 'border-transparent text-slate-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-900/40'
                      }`}
                    >
                      {getDomainIcon(domain.id)}
                      <span className="text-xs font-extrabold text-center leading-none">{domain.label}</span>
                      <span className="text-[9px] opacity-60 text-center mt-0.5">{domain.sublabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Context configuration panel */}
              {showConfig && (
                <NemaAIContextForm
                  activeDomain={activeDomain}
                  farmName={farmName}
                  setFarmName={setFarmName}
                  producerName={producerName}
                  setProducerName={setProducerName}
                  fieldName={fieldName}
                  setFieldName={setFieldName}
                  areaHa={areaHa}
                  setAreaHa={setAreaHa}
                  cropOrPasture={cropOrPasture}
                  setCropOrPasture={setCropOrPasture}
                  cultivarOrForage={cultivarOrForage}
                  setCultivarOrForage={setCultivarOrForage}
                  soilType={soilType}
                  setSoilType={setSoilType}
                  carryingCapacity={carryingCapacity}
                  setCarryingCapacity={setCarryingCapacity}
                  gmdTarget={gmdTarget}
                  setGmdTarget={setGmdTarget}
                  batchAgeDays={batchAgeDays}
                  setBatchAgeDays={setBatchAgeDays}
                  feedConversion={feedConversion}
                  setFeedConversion={setFeedConversion}
                  soilSamplesCount={soilSamples.length}
                />
              )}

              {/* Chat Mode / Bate-Papo com a Nema IA */}
              <NemaAIChatView
                messages={chatMessages}
                loading={loading}
                activeDomain={activeDomain}
                farmName={farmName}
                producerName={producerName}
                fieldName={fieldName}
                cropOrPasture={cropOrPasture}
                cultivarOrForage={cultivarOrForage}
                soilType={soilType}
                uploadedFileName={uploadedFileName}
                latestResult={analysisResult}
                onSendMessage={(text) => runCentralAI(text)}
                onClearChat={handleClearChat}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeUploadedFile}
                onToggleConfig={() => setShowConfig(!showConfig)}
                onApplyRecommendations={onApplyRecommendations}
              />

              {errorMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-800 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Optional Full Technical Report Panel */}
              {analysisResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowExpandedResult(!showExpandedResult)}
                      className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl shadow-2xs"
                    >
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>
                        {showExpandedResult
                          ? 'Ocultar Painel Detalhado de Laudo e Gráficos'
                          : 'Visualizar Painel Detalhado de Laudo & Gráficos'}
                      </span>
                    </button>
                  </div>
                  {showExpandedResult && (
                    <NemaAIResultView
                      analysisResult={analysisResult}
                      cropOrPasture={cropOrPasture}
                      soilType={soilType}
                      onCopyReport={handleCopyReport}
                      copied={copied}
                    />
                  )}
                </div>
              )}
            </div>

            {/* History Column */}
            {showHistory && (
              <NemaAIHistorySidebar
                diagnosesHistory={diagnosesHistory}
                selectedHistoryId={selectedHistoryId}
                onSelect={handleSelectHistoryItem}
                onDelete={handleDeleteHistoryItem}
                onClearAll={handleClearAllHistory}
                onExportItem={handleExportHistoryItem}
              />
            )}
          </div>
        </>
      ) : (
        /* Nema Score Screen */
        <NemaAIScoreView
          currentField={currentField}
          soilType={soilType}
          cropOrPasture={cropOrPasture}
          loading={loading}
          analysisResult={analysisResult}
          onRunAIScore={() => runCentralAI()}
        />
      )}
    </div>
  );
};

export default NemaAIConsole;
