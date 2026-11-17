import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Sprout,
  FlaskConical,
  Bug,
  Beef,
  Bird,
  History,
  SlidersHorizontal,
  Layers,
  Map as MapIcon,
  Scale,
  GraduationCap,
  Brain,
} from 'lucide-react';
import { NEMATODE_SPECIES_CATALOG } from '../data/nematologyData';
import { nemaAIDB, NemaAIDiagnosisLog } from '../utils/nemaAiDb';
import {
  AIDomain,
  CentralAIAnalysisResult,
  NemaAIConsoleProps,
  ChatMessage,
  NemaAttachment,
  NemaMemoryState,
  MemoryCategory,
} from './nema-ai/types';
import { DOMAINS_CONFIG } from './nema-ai/presets';
import { NemaAIContextForm } from './nema-ai/NemaAIContextForm';
import { NemaAIResultView } from './nema-ai/NemaAIResultView';
import { NemaAIHistorySidebar } from './nema-ai/NemaAIHistorySidebar';
import { NemaAIScoreView } from './nema-ai/NemaAIScoreView';
import { NemaAIChatView } from './nema-ai/NemaAIChatView';
import { NemaAIMemoryDrawer } from './nema-ai/NemaAIMemoryDrawer';
import { NemaAIIcon } from './nema-ai/NemaAIIcon';
import { NemaIAEstatisticaIcon } from './icons/NemaIAEstatisticaIcon';
import { exportChatToPdf, exportChatToTxt } from '../utils/nemaAiExport';
import { generateOfflineNemaAIDiagnosis } from '../utils/offlineNemaAI';
import { parseNemaAttachment } from '../utils/nemaAiAttachments';
import {
  loadNemaMemory,
  toggleNemaMemory,
  updateSituationSummary,
  addManualMemoryItem,
  removeMemoryItem,
  clearNemaMemory,
  applyAIMemoryUpdates,
} from '../utils/nemaAiMemory';

export const NemaAIConsole: React.FC<NemaAIConsoleProps> = ({
  currentFarm,
  currentProducer,
  currentField,
  soilSamples = [],
  leafSamples = [],
  speciesCatalog: _speciesCatalog = NEMATODE_SPECIES_CATALOG,
  onApplyRecommendations,
  initialSubModule,
}) => {
  const [activeSubModule, setActiveSubModule] = useState<'conversa' | 'score'>(initialSubModule || 'conversa');

  useEffect(() => {
    if (initialSubModule) {
      setActiveSubModule(initialSubModule);
    }
  }, [initialSubModule]);

  const [activeDomain, setActiveDomain] = useState<AIDomain>('geral');

  // Farm / Context states
  const [farmName, setFarmName] = useState<string>('');
  const [producerName, setProducerName] = useState<string>('');
  const [fieldName, setFieldName] = useState<string>('Talhão Principal');
  const [areaHa, setAreaHa] = useState<number>(50);
  const [cropOrPasture, setCropOrPasture] = useState<string>('Soja');
  const [cultivarOrForage, setCultivarOrForage] = useState<string>('Padrão');
  const [soilType, setSoilType] = useState<string>('Argiloso');

  // Livestock & Aviculture context variables
  const [carryingCapacity, setCarryingCapacity] = useState<number>(1.8);
  const [gmdTarget, setGmdTarget] = useState<number>(0.8);
  const [batchAgeDays, setBatchAgeDays] = useState<number>(21);
  const [feedConversion, setFeedConversion] = useState<number>(1.65);

  // Conversation & Multimodal attachments
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsingAttachments, setParsingAttachments] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CentralAIAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<NemaAttachment[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showExpandedResult, setShowExpandedResult] = useState<boolean>(false);

  // History states
  const [diagnosesHistory, setDiagnosesHistory] = useState<NemaAIDiagnosisLog[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Continuous Memory Mode
  const [memoryState, setMemoryState] = useState<NemaMemoryState>(() => loadNemaMemory());
  const [showMemoryDrawer, setShowMemoryDrawer] = useState<boolean>(false);

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

  useEffect(() => {
    if (currentFarm) {
      setFarmName(currentFarm.name || '');
      const farmCrop =
        (currentFarm as any).currentCrop ||
        currentFarm.plots?.[0]?.currentCrop ||
        currentFarm.cropHistory?.[0];
      if (farmCrop) {
        setCropOrPasture(farmCrop);
      }
      setFieldName(currentFarm.city ? `Área ${currentFarm.city}` : 'Talhão Principal');
    }
    if (currentProducer) {
      setProducerName(currentProducer.name || '');
    }
  }, [currentFarm, currentProducer]);

  // Multi-file Upload Handler (Photos, Videos, PDF, Spreadsheets, Geoprocessing)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMessage(null);
    setParsingAttachments(true);

    try {
      const remainingSlots = Math.max(0, 5 - pendingAttachments.length);
      const selectedFiles = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        setErrorMessage('Limite de até 5 anexos simultâneos por mensagem.');
      }

      const parsed = await Promise.all(selectedFiles.map((file) => parseNemaAttachment(file)));
      setPendingAttachments((prev) => [...prev, ...parsed]);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar arquivo anexado.');
    } finally {
      setParsingAttachments(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const runCentralAI = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || '').trim();
    if (!promptToSend && pendingAttachments.length === 0) {
      setErrorMessage('Digite uma pergunta ou anexe um arquivo para consultar a Nema IA.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const activeAttachments = [...pendingAttachments];
    setPendingAttachments([]);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
      attachedFileName: activeAttachments[0]?.name || null,
      attachments: activeAttachments.map((a) => ({
        id: a.id,
        name: a.name,
        kind: a.kind,
        mimeType: a.mimeType,
        summaryLabel: a.summaryLabel,
        previewUrl: a.kind === 'image' ? a.previewUrl : undefined,
      })),
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);

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
      messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
      attachments: activeAttachments.map((a) => ({
        name: a.name,
        kind: a.kind,
        mimeType: a.mimeType,
        base64Data: a.base64Data,
        extractedText: a.extractedText,
        summaryLabel: a.summaryLabel,
      })),
      memoryContext: memoryState.enabled
        ? {
            enabled: true,
            situationSummary: memoryState.situationSummary,
            items: memoryState.items.slice(0, 20).map((it) => ({
              category: it.category,
              content: it.content,
            })),
          }
        : { enabled: false },
      selectedSpecies: 'Todas as espécies ou alvos',
      livestockContext,
      labResults: soilSamples.map((s) => ({
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
      foliarSamples: leafSamples.map((l) => ({
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

    let analysisData: CentralAIAnalysisResult | null = null;

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
      analysisData = data.data;
    } catch (err) {
      console.warn('[Nema IA] Ativando motor heurístico local offline:', err);
      analysisData = generateOfflineNemaAIDiagnosis({
        crop: cropOrPasture,
        domain: activeDomain,
        farmName: farmName || 'Fazenda Ativa',
        fieldName,
        areaHa,
        prompt: promptToSend,
      });
    }

    try {
      if (analysisData) {
        let memoryAddedCount = 0;
        if (memoryState.enabled && analysisData.memoryUpdates) {
          const updated = applyAIMemoryUpdates(analysisData.memoryUpdates, farmName || undefined);
          setMemoryState(updated.state);
          memoryAddedCount = updated.addedCount;
        }

        const botReply =
          analysisData.reply || analysisData.executiveSummary || 'Parecer técnico gerado com sucesso.';
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: botReply,
          timestamp: Date.now(),
          result: analysisData,
          memoryAddedCount,
        };

        const finalMessages = [...nextMessages, botMsg];
        setChatMessages(finalMessages);
        setAnalysisResult(analysisData);

        if (onApplyRecommendations) {
          onApplyRecommendations(analysisData);
        }

        try {
          const logId =
            selectedHistoryId || `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
            result: analysisData,
            uploadedFileName: activeAttachments.map((a) => a.name).join(', ') || null,
            messages: finalMessages,
          };
          await nemaAIDB.saveDiagnosis(log);
          setSelectedHistoryId(logId);
          await loadHistory();
        } catch (saveErr) {
          console.error('Erro ao salvar histórico local:', saveErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao processar diagnóstico.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setSelectedHistoryId(null);
    setAnalysisResult(null);
    setPendingAttachments([]);
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const targets =
      analysisResult.dominantSpeciesOrTargets || analysisResult.dominantSpeciesIdentified || [];
    const text = `PARECER TÉCNICO NEMA IA
Data: ${new Date().toLocaleDateString('pt-BR')}
Fazenda: ${farmName || 'Fazenda Ativa'} | Produtor: ${producerName || 'Produtor Rural'}
Especialidade: ${analysisResult.domainCategory || activeDomain.toUpperCase()}
Criticidade: ${analysisResult.riskLevel} (${analysisResult.riskScorePercentage}%)
Resumo Executivo: ${analysisResult.executiveSummary}

Focos de Atenção: ${targets.join(', ')}

Checklist Operacional:
${(analysisResult.actionChecklist || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectHistoryItem = (item: NemaAIDiagnosisLog) => {
    setSelectedHistoryId(item.id);
    setActiveDomain(item.domain || 'geral');
    setFarmName(item.farmName || '');
    setProducerName(item.producerName || '');
    setFieldName(item.fieldName || 'Talhão Principal');
    setAreaHa(item.areaHa || 50);
    setCropOrPasture(item.cropOrPasture || 'Soja');
    setCultivarOrForage(item.cultivarOrForage || 'Padrão');
    setSoilType(item.soilType || 'Argiloso');
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
        setChatMessages([]);
      }
      await loadHistory();
    } catch (err) {
      console.error('Erro ao deletar histórico:', err);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await nemaAIDB.clearHistory();
      setSelectedHistoryId(null);
      setAnalysisResult(null);
      setChatMessages([]);
      await loadHistory();
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
    }
  };

  const handleDomainChange = (domain: AIDomain, defaultCrop: string) => {
    setActiveDomain(domain);
    const defaultCrops = DOMAINS_CONFIG.map((d) => d.defaultCrop).concat(['Padrão']);
    if (!cropOrPasture || defaultCrops.includes(cropOrPasture)) {
      setCropOrPasture(defaultCrop);
    }
  };

  const handleExportHistoryItem = (item: NemaAIDiagnosisLog, format: 'pdf' | 'txt') => {
    const messagesToExport: ChatMessage[] =
      item.messages && item.messages.length > 0
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
        return <Sprout className="w-3.5 h-3.5 shrink-0" />;
      case 'fertilidade':
        return <FlaskConical className="w-3.5 h-3.5 shrink-0" />;
      case 'nematologia':
        return <Bug className="w-3.5 h-3.5 shrink-0" />;
      case 'pecuaria':
        return <Beef className="w-3.5 h-3.5 shrink-0" />;
      case 'avicultura':
        return <Bird className="w-3.5 h-3.5 shrink-0" />;
      case 'geoprocessamento':
        return <MapIcon className="w-3.5 h-3.5 shrink-0" />;
      case 'pericia_avaliacao':
        return <Scale className="w-3.5 h-3.5 shrink-0" />;
      case 'ensino_pesquisa':
        return <GraduationCap className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      {activeSubModule === 'conversa' ? (
        <>
          {/* Clean Top Toolbar & Specialty Strip */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <NemaAIIcon size={38} className="shadow-xs rounded-xl" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Nema IA — Inteligência Agropecuária
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Consultoria técnica especializada com memória contínua e análise de fotos, vídeos, PDF, planilhas e mapas geo.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('gea-navigate', {
                        detail: { tab: 'estatistica', subTab: 'ia_estatistica' },
                      })
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Abrir Nema IA Estatística (Biometria & Experimentação)"
                >
                  <NemaIAEstatisticaIcon size={18} variant="emblem" className="rounded-md" />
                  <span>Nema IA Estatística</span>
                </button>

                <button
                  onClick={() => setShowMemoryDrawer(true)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    memoryState.enabled
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Modo Memória</span>
                  <span className="tabular-nums opacity-75">• {memoryState.items.length}</span>
                </button>

                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showConfig
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Contexto</span>
                </button>

                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showHistory
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{showHistory ? 'Ocultar Histórico' : 'Histórico'}</span>
                </button>
              </div>
            </div>

            {/* Clean Horizontal Specialty Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-zinc-800/80 pb-0.5">
              {DOMAINS_CONFIG.map((domain) => {
                const isActive = activeDomain === domain.id;
                return (
                  <button
                    key={domain.id}
                    onClick={() => handleDomainChange(domain.id, domain.defaultCrop)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50'
                    }`}
                  >
                    {getDomainIcon(domain.id)}
                    <div>
                      <div className="text-xs font-semibold leading-tight">{domain.label}</div>
                      <div className={`text-[10px] leading-tight ${isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                        {domain.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

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

          {/* Main Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
            <div className={showHistory ? 'lg:col-span-3 space-y-4' : 'lg:col-span-4 space-y-4'}>
              <NemaAIChatView
                messages={chatMessages}
                loading={loading}
                parsingAttachments={parsingAttachments}
                activeDomain={activeDomain}
                farmName={farmName}
                producerName={producerName}
                fieldName={fieldName}
                cropOrPasture={cropOrPasture}
                cultivarOrForage={cultivarOrForage}
                soilType={soilType}
                pendingAttachments={pendingAttachments}
                latestResult={analysisResult}
                memoryEnabled={memoryState.enabled}
                memoryCount={memoryState.items.length}
                onOpenMemory={() => setShowMemoryDrawer(true)}
                onSendMessage={(text) => runCentralAI(text)}
                onClearChat={handleClearChat}
                onFileUpload={handleFileUpload}
                onRemoveAttachment={handleRemoveAttachment}
                onToggleConfig={() => setShowConfig(!showConfig)}
                onApplyRecommendations={onApplyRecommendations}
              />

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowExpandedResult(!showExpandedResult)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3.5 py-2 rounded-xl"
                  >
                    <Layers className="w-4 h-4" />
                    <span>
                      {showExpandedResult
                        ? 'Ocultar Painel Detalhado do Laudo'
                        : 'Abrir Painel Detalhado do Laudo Técnico'}
                    </span>
                  </button>
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

            {showHistory && (
              <div className="lg:col-span-1">
                <NemaAIHistorySidebar
                  diagnosesHistory={diagnosesHistory}
                  selectedHistoryId={selectedHistoryId}
                  memoryEnabled={memoryState.enabled}
                  memoryCount={memoryState.items.length}
                  onOpenMemory={() => setShowMemoryDrawer(true)}
                  onNewChat={handleClearChat}
                  onSelect={handleSelectHistoryItem}
                  onDelete={handleDeleteHistoryItem}
                  onClearAll={handleClearAllHistory}
                  onExportItem={handleExportHistoryItem}
                />
              </div>
            )}
          </div>

          <NemaAIMemoryDrawer
            isOpen={showMemoryDrawer}
            onClose={() => setShowMemoryDrawer(false)}
            memoryState={memoryState}
            onToggleEnabled={(enabled) => setMemoryState(toggleNemaMemory(enabled))}
            onUpdateSummary={(summary) => setMemoryState(updateSituationSummary(summary))}
            onAddManualFact={(cat: MemoryCategory, content: string) =>
              setMemoryState(addManualMemoryItem(cat, content, farmName || undefined))
            }
            onRemoveFact={(id) => setMemoryState(removeMemoryItem(id))}
            onClearAll={() => setMemoryState(clearNemaMemory())}
          />
        </>
      ) : (
        <NemaAIScoreView
          currentField={currentField}
          soilType={soilType}
          cropOrPasture={cropOrPasture}
          loading={loading}
          analysisResult={analysisResult}
          onRunAIScore={() => runCentralAI('Calcule o Nema Score fitossanitário completo do talhão atual.')}
        />
      )}
    </div>
  );
};

export default NemaAIConsole;
