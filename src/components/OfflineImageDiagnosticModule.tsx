// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Camera,
  UploadCloud,
  FileText,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  Sliders,
  Sprout,
  Droplets,
  Bug,
  Info,
  Check,
  ArrowRight,
  Database,
  WifiOff,
  Zap,
  Image as ImageIcon,
  ZoomIn,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import {
  OfflineDiagnosticRecord,
  VisualCharacteristicsFeatures,
  DiagnosticComparisonResult,
} from '../types/offlineDiagnostic';
import {
  dichotomousQuestionsList,
  offlineDiagnosticDatabase,
  runOfflineDiagnosticComparison,
} from '../data/offlineDiagnosticDatabase';
import { nurseryCropsCatalog } from '../data/nurseryData';

interface OfflineImageDiagnosticModuleProps {
  onAttachToBatch?: (diagnosisName: string, correctiveAction: string) => void;
}

export const OfflineImageDiagnosticModule: React.FC<OfflineImageDiagnosticModuleProps> = ({
  onAttachToBatch,
}) => {
  const [diagnosticMode, setDiagnosticMode] = useState<'chave_visual' | 'foto_checklist'>('chave_visual');

  // Input states
  const [selectedCrop, setSelectedCrop] = useState<string>('Alface');
  const [selectedStage, setSelectedStage] = useState<string>('segundo_terceiro_par');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);

  // Dichotomous Key Answers (questionId -> boolean)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Checklist Features state
  const [observedFeatures, setObservedFeatures] = useState<VisualCharacteristicsFeatures>({
    leafColor: 'verde_normal',
    veinColor: 'verde',
    leafBurnMargin: false,
    hasSpots: false,
    hasDampingOff: false,
    hasMoldOrMycelium: false,
    visibleInsects: false,
    rootColor: 'branco_brilhante',
    substrateCondition: 'ideal_drenado',
  });

  // Selected Result for deep inspection modal
  const [selectedResult, setSelectedResult] = useState<DiagnosticComparisonResult | null>(null);
  const [modalActivePhotoIndex, setModalActivePhotoIndex] = useState<number>(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  // Precaching diagnostic photos
  useEffect(() => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    const precache = async () => {
      try {
        const cache = await caches.open('geaagro-cache-v13');
        const urlsToCache: string[] = [];
        offlineDiagnosticDatabase.forEach(item => {
          if (item.realPhotoUrl) urlsToCache.push(item.realPhotoUrl);
          if (item.realPhotos) {
            item.realPhotos.forEach(p => {
              if (p.url) urlsToCache.push(p.url);
            });
          }
        });
        const uniqueUrls = Array.from(new Set(urlsToCache));
        for (const url of uniqueUrls) {
          try {
            const match = await cache.match(url);
            if (!match) {
              const resp = await fetch(url);
              if (resp.ok) await cache.put(url, resp);
            }
          } catch {
            // ignore fetch errors
          }
        }
      } catch (e) {
        console.warn('Diagnostic cache error:', e);
      }
    };
    precache();
  }, []);

  const handleImageError = (url: string) => {
    setImageErrorMap(prev => ({ ...prev, [url]: true }));
  };

  // Run real-time offline matching calculation
  const diagnosticResults: DiagnosticComparisonResult[] = useMemo(() => {
    return runOfflineDiagnosticComparison(
      selectedCrop,
      selectedStage,
      observedFeatures,
      answeredQuestions
    );
  }, [selectedCrop, selectedStage, observedFeatures, answeredQuestions]);

  const topMatch = diagnosticResults[0];

  // Preset sample photo simulation for quick testing
  const presetSamples = [
    {
      name: 'Tombamento (Pythium)',
      crop: 'Alface',
      stage: 'cotiledones',
      features: {
        leafColor: 'verde_normal' as const,
        veinColor: 'verde' as const,
        hasDampingOff: true,
        hasWilting: true,
        rootColor: 'marrom_escuro' as const,
        substrateCondition: 'encharcado' as const,
      },
      answers: { q_damping_off: true, q_dark_roots: true, q_leaf_yellow: false },
    },
    {
      name: 'Mofo-Cinzento (Botrytis)',
      crop: 'Tomate',
      stage: 'segundo_terceiro_par',
      features: {
        hasMoldOrMycelium: true,
        moldColor: 'cinzento' as const,
        hasSpots: true,
        spotType: 'irregular_aquosa' as const,
        hasNecrosis: true,
        leafColor: 'verde_normal' as const,
      },
      answers: { q_mold_mycelium: true, q_spots_lesions: true, q_visible_insects: false },
    },
    {
      name: 'Deficiência de Ferro (pH Alto)',
      crop: 'Petúnia',
      stage: 'segundo_terceiro_par',
      features: {
        leafColor: 'amarelo_internerval' as const,
        veinColor: 'verde' as const,
        leafBurnMargin: false,
        rootColor: 'branco_brilhante' as const,
      },
      answers: { q_leaf_yellow: true, q_interveinal_chlorosis: true, q_leaf_burn: false },
    },
    {
      name: 'Tip-Burn (Falta de Cálcio)',
      crop: 'Tomate',
      stage: 'segundo_terceiro_par',
      features: {
        leafColor: 'verde_normal' as const,
        leafBurnMargin: true,
        leafShape: 'em_copo_ou_gancho' as const,
      },
      answers: { q_leaf_burn: true, q_leaf_shape_deformed: true, q_spots_lesions: false },
    },
    {
      name: 'Ataque de Tripes (Prateamento)',
      crop: 'Pimentão',
      stage: 'segundo_terceiro_par',
      photoUrl: '/nursery_thrips_damage.jpg',
      features: {
        visibleInsects: true,
        hasSpots: true,
        leafShape: 'encarquilhada' as const,
      },
      answers: { q_visible_insects: true, q_leaf_shape_deformed: true, q_spots_lesions: true },
    },
    {
      name: 'Míldio de Plântulas (Bremia)',
      crop: 'Alface',
      stage: 'segundo_terceiro_par',
      photoUrl: '/nursery_downy_mildew.jpg',
      features: {
        hasSpots: true,
        hasMoldOrMycelium: true,
        moldColor: 'esbranquicado' as const,
        leafColor: 'verde_normal' as const,
      },
      answers: { q_spots_lesions: true, q_mold_mycelium: true, q_visible_insects: false },
    },
    {
      name: 'Oídio em Mudas (Pó Branco)',
      crop: 'Pepino',
      stage: 'cotiledones',
      photoUrl: '/nursery_powdery_mildew.jpg',
      features: {
        hasMoldOrMycelium: true,
        moldColor: 'esbranquicado' as const,
        leafColor: 'verde_normal' as const,
      },
      answers: { q_mold_mycelium: true, q_spots_lesions: false, q_leaf_yellow: false },
    },
    {
      name: 'Requeima / Fitóftora',
      crop: 'Tomate',
      stage: 'segundo_terceiro_par',
      photoUrl: '/nursery_phytophthora.jpg',
      features: {
        hasDampingOff: true,
        hasWilting: true,
        hasNecrosis: true,
        rootColor: 'marrom_escuro' as const,
      },
      answers: { q_damping_off: true, q_dark_roots: true, q_leaf_yellow: false },
    },
    {
      name: 'Mancha-Bacteriana (Xanthomonas)',
      crop: 'Pimentão',
      stage: 'segundo_terceiro_par',
      photoUrl: '/nursery_xanthomonas.jpg',
      features: {
        hasSpots: true,
        spotType: 'circular_com_halo' as const,
        leafColor: 'verde_normal' as const,
      },
      answers: { q_spots_lesions: true, q_leaf_yellow: false, q_mold_mycelium: false },
    },
    {
      name: 'Mosca-Branca em Mudas',
      crop: 'Tomate',
      stage: 'segundo_terceiro_par',
      photoUrl: '/nursery_whitefly_adults.jpg',
      features: {
        visibleInsects: true,
        hasSpots: false,
        leafColor: 'verde_normal' as const,
      },
      answers: { q_visible_insects: true, q_leaf_yellow: false, q_damping_off: false },
    },
    {
      name: 'Fungus Gnat / Larva do Substrato',
      crop: 'Eucalipto',
      stage: 'germinacao_radicula',
      photoUrl: '/nursery_fungus_gnat.jpg',
      features: {
        visibleInsects: true,
        rootColor: 'marrom_escuro' as const,
        rootDevelopment: 'apodrecido_na_ponta' as const,
        substrateCondition: 'encharcado' as const,
      },
      answers: { q_visible_insects: true, q_dark_roots: true, q_damping_off: true },
    },
    {
      name: 'Pulgão-Verde em Broto',
      crop: 'Alface',
      stage: 'segundo_terceiro_par',
      photoUrl: '/nursery_aphids_colony.jpg',
      features: {
        visibleInsects: true,
        leafShape: 'encarquilhada' as const,
      },
      answers: { q_visible_insects: true, q_leaf_shape_deformed: true },
    },
    {
      name: 'Ácaro-Rajado & Teias',
      crop: 'Morango',
      stage: 'segundo_terceiro_par',
      photoUrl: '/nursery_spider_mite.jpg',
      features: {
        visibleInsects: true,
        hasSpots: true,
        leafColor: 'amarelo_uniforme' as const,
      },
      answers: { q_visible_insects: true, q_leaf_yellow: true, q_leaf_burn: true },
    },
    {
      name: 'Lagarta Cortadora (Dano no Colo)',
      crop: 'Couve',
      stage: 'cotiledones',
      photoUrl: '/nursery_cutworm_stem.jpg',
      features: {
        hasDampingOff: true,
        visibleInsects: true,
      },
      answers: { q_damping_off: true, q_visible_insects: true },
    },
  ];

  const handleApplyPreset = (preset: (typeof presetSamples)[0]) => {
    setSelectedCrop(preset.crop);
    setSelectedStage(preset.stage);
    setObservedFeatures(preset.features);
    setAnsweredQuestions(preset.answers);
    setPhotoFileName(`amostra_${preset.name.toLowerCase().replace(/[\s\(\)\/\-]+/g, '_')}.jpg`);
    if ('photoUrl' in preset && preset.photoUrl) {
      setPhotoPreview(preset.photoUrl);
    } else if (preset.name.includes('Pythium')) {
      setPhotoPreview('/pythium_damping_off.jpg');
    } else if (preset.name.includes('Botrytis')) {
      setPhotoPreview('/botrytis_cinerea_leaf.jpg');
    } else if (preset.name.includes('Ferro')) {
      setPhotoPreview('/iron_chlorosis_leaf.jpg');
    } else {
      setPhotoPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setAnsweredQuestions({});
    setCurrentQuestionIndex(0);
    setPhotoPreview(null);
    setPhotoFileName(null);
    setObservedFeatures({
      leafColor: 'verde_normal',
      veinColor: 'verde',
      leafBurnMargin: false,
      hasSpots: false,
      hasDampingOff: false,
      hasMoldOrMycelium: false,
      visibleInsects: false,
      rootColor: 'branco_brilhante',
      substrateCondition: 'ideal_drenado',
    });
  };

  const currentQ = dichotomousQuestionsList[currentQuestionIndex];
  const totalQuestions = dichotomousQuestionsList.length;
  const answeredCount = Object.keys(answeredQuestions).length;

  return (
    <div className="space-y-6">
      {/* Offline Header & Transparency Badge */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                100% Offline & Local
              </span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3" />
                Sistema Especialista Agronômico
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-emerald-400" />
              Diagnóstico Visual de Mudas por Banco de Dados (Sem IA)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-3xl">
              Mecanismo de inferência determinístico que compara características visuais, sintomas foliares e radiculares com registros cadastrados na base local. Sem consumo de internet, sem geração por IA, com rastreabilidade técnica total.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar Análise
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-2 rounded-xl shadow-2xs">
        <div className="flex gap-1 w-full sm:w-auto">
          <button
            onClick={() => setDiagnosticMode('chave_visual')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              diagnosticMode === 'chave_visual'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            1. Chave de Diagnóstico Visual (Perguntas Guiadas)
          </button>

          <button
            onClick={() => setDiagnosticMode('foto_checklist')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              diagnosticMode === 'foto_checklist'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            2. Foto & Checklist Completo de Características
          </button>
        </div>

        {/* Preset Quick Loader */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Amostras Prontas:
          </span>
          {presetSamples.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 text-slate-700 dark:text-zinc-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Inputs (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Controls & Questions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Crop & Stage Selector */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Parâmetros da Muda em Análise
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Cultura / Espécie
                </label>
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:outline-none"
                >
                  {nurseryCropsCatalog.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.scientificName})
                    </option>
                  ))}
                  <option value="Outra">Outra / Espécie Genérica</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Estágio de Desenvolvimento
                </label>
                <select
                  value={selectedStage}
                  onChange={e => setSelectedStage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="cotiledones">Cotilédones / Emergência inicial</option>
                  <option value="primeiro_par">1º Par de folhas verdadeiras</option>
                  <option value="segundo_terceiro_par">2º a 3º Par de folhas (Desenvolvimento)</option>
                  <option value="aclimatacao">Aclimatação / Pré-expedição</option>
                  <option value="qualquer_fase">Qualquer fase do viveiro</option>
                </select>
              </div>
            </div>
          </div>

          {/* MODE 1: CHAVE DICOTÔMICA (PERGUNTAS GUIADAS) */}
          {diagnosticMode === 'chave_visual' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Chave Dicotômica Passo a Passo
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Pergunta {currentQuestionIndex + 1} de {totalQuestions}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                  {answeredCount} respondidas
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 dark:bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Active Question Box */}
              {currentQ && (
                <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
                  <p className="font-bold text-base text-slate-900 dark:text-zinc-100">
                    {currentQ.questionText}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{currentQ.helpTip}</span>
                  </p>

                  {/* Answers Buttons (Sim / Não / Não sei) */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        setAnsweredQuestions(prev => ({ ...prev, [currentQ.id]: true }));
                        // Update observed features accordingly
                        if (currentQ.id === 'q_damping_off') setObservedFeatures(f => ({ ...f, hasDampingOff: true, hasWilting: true }));
                        if (currentQ.id === 'q_leaf_burn') setObservedFeatures(f => ({ ...f, leafBurnMargin: true }));
                        if (currentQ.id === 'q_leaf_yellow') setObservedFeatures(f => ({ ...f, leafColor: 'amarelo_uniforme' }));
                        if (currentQ.id === 'q_interveinal_chlorosis') setObservedFeatures(f => ({ ...f, leafColor: 'amarelo_internerval', veinColor: 'verde' }));
                        if (currentQ.id === 'q_mold_mycelium') setObservedFeatures(f => ({ ...f, hasMoldOrMycelium: true }));
                        if (currentQ.id === 'q_visible_insects') setObservedFeatures(f => ({ ...f, visibleInsects: true }));
                        if (currentQ.id === 'q_dark_roots') setObservedFeatures(f => ({ ...f, rootColor: 'marrom_escuro' }));
                        if (currentQ.id === 'q_substrate_white_crust') setObservedFeatures(f => ({ ...f, substrateCondition: 'salinizacao_branca_superficie' }));

                        if (currentQuestionIndex < totalQuestions - 1) {
                          setCurrentQuestionIndex(i => i + 1);
                        }
                      }}
                      className={`py-3 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        answeredQuestions[currentQ.id] === true
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                          : 'bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-emerald-500'
                      }`}
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                      SIM
                    </button>

                    <button
                      onClick={() => {
                        setAnsweredQuestions(prev => ({ ...prev, [currentQ.id]: false }));
                        if (currentQ.id === 'q_damping_off') setObservedFeatures(f => ({ ...f, hasDampingOff: false }));
                        if (currentQ.id === 'q_leaf_burn') setObservedFeatures(f => ({ ...f, leafBurnMargin: false }));
                        if (currentQ.id === 'q_mold_mycelium') setObservedFeatures(f => ({ ...f, hasMoldOrMycelium: false }));
                        if (currentQ.id === 'q_visible_insects') setObservedFeatures(f => ({ ...f, visibleInsects: false }));

                        if (currentQuestionIndex < totalQuestions - 1) {
                          setCurrentQuestionIndex(i => i + 1);
                        }
                      }}
                      className={`py-3 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        answeredQuestions[currentQ.id] === false
                          ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400'
                          : 'bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-red-500'
                      }`}
                    >
                      <X className="w-4 h-4 text-red-500" />
                      NÃO
                    </button>

                    <button
                      onClick={() => {
                        if (currentQuestionIndex < totalQuestions - 1) {
                          setCurrentQuestionIndex(i => i + 1);
                        }
                      }}
                      className="py-3 px-3 rounded-lg font-semibold text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Pular / Não sei
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation buttons between questions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>

                <div className="flex gap-1">
                  {dichotomousQuestionsList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-5 h-5 rounded-full text-[10px] font-bold transition-colors ${
                        idx === currentQuestionIndex
                          ? 'bg-emerald-600 text-white'
                          : answeredQuestions[dichotomousQuestionsList[idx]?.id] !== undefined
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  onClick={() => setCurrentQuestionIndex(i => Math.min(totalQuestions - 1, i + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  Próxima <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: FOTOGRAFIA & CHECKLIST DETALHADO */}
          {diagnosticMode === 'foto_checklist' && (
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                Fotografia da Muda & Checklist de Características Visuais
              </h3>

              {/* Photo Upload / Active Photo Area */}
              {photoPreview ? (
                <div className="relative border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-28 h-24 rounded-lg overflow-hidden shrink-0 border border-emerald-400/40 shadow-xs group cursor-pointer"
                    onClick={() => setLightboxPhoto({ url: photoPreview, title: photoFileName || 'Foto da Muda' })}>
                    <img
                      src={photoPreview}
                      alt="Foto da muda analisada"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Foto em Análise
                      </span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate">
                        {photoFileName || 'Foto da muda'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Utilize o checklist abaixo para confirmar as características visuais identificadas na foto.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        onClick={() => setLightboxPhoto({ url: photoPreview, title: photoFileName || 'Foto da Muda' })}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        Ampliar Foto
                      </button>
                      <span className="text-slate-300 dark:text-zinc-700">•</span>
                      <label htmlFor="plant-photo-input-change" className="text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:underline cursor-pointer">
                        Trocar Foto
                      </label>
                      <input
                        type="file"
                        id="plant-photo-input-change"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFileName(null);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Remover foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    id="plant-photo-input"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="plant-photo-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 hover:text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {photoFileName ? photoFileName : 'Carregar foto da muda ou arrastar arquivo aqui'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      A imagem permanece 100% no seu navegador/dispositivo local para comparação de características.
                    </span>
                  </label>
                </div>
              )}

              {/* Checklist form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Cor Dominante das Folhas
                  </label>
                  <select
                    value={observedFeatures.leafColor}
                    onChange={e => setObservedFeatures(f => ({ ...f, leafColor: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="verde_normal">Verde normal saudável</option>
                    <option value="amarelo_uniforme">Amarelo uniforme (clorose generalizada)</option>
                    <option value="amarelo_internerval">Amarelo internerval (nervuras verdes)</option>
                    <option value="arroxeado">Arroxeado / Púrpura (antocianina)</option>
                    <option value="bronzeado">Bronzeado / Queimado</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Cor / Estado das Raízes
                  </label>
                  <select
                    value={observedFeatures.rootColor}
                    onChange={e => setObservedFeatures(f => ({ ...f, rootColor: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="branco_brilhante">Branco brilhante com pelos</option>
                    <option value="marrom_escuro">Marrom escuro / Apodrecido</option>
                    <option value="preto_gelatinoso">Preto gelatinoso</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Condição do Substrato
                  </label>
                  <select
                    value={observedFeatures.substrateCondition}
                    onChange={e => setObservedFeatures(f => ({ ...f, substrateCondition: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="ideal_drenado">Ideal, úmido e aerado</option>
                    <option value="encharcado">Encharcado / Asfixiante</option>
                    <option value="salinizacao_branca_superficie">Crosta branca de sais na superfície</option>
                    <option value="presenca_algas_musgos">Presença de algas verdes e musgo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Formato das Folhas
                  </label>
                  <select
                    value={observedFeatures.leafShape || 'normal'}
                    onChange={e => setObservedFeatures(f => ({ ...f, leafShape: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="normal">Normal plano</option>
                    <option value="em_copo_ou_gancho">Em forma de copo / gancho para baixo</option>
                    <option value="encarquilhada">Encarquilhada / Deformada</option>
                  </select>
                </div>
              </div>

              {/* Toggles Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                {[
                  { key: 'hasDampingOff', label: 'Tombamento no colo' },
                  { key: 'leafBurnMargin', label: 'Queima de bordas (tip-burn)' },
                  { key: 'hasSpots', label: 'Manchas / Lesões' },
                  { key: 'hasMoldOrMycelium', label: 'Mofo / Micélio' },
                  { key: 'visibleInsects', label: 'Insetos visíveis' },
                  { key: 'hasWilting', label: 'Murchamento' },
                ].map(item => {
                  const val = !!(observedFeatures as any)[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() =>
                        setObservedFeatures(f => ({
                          ...f,
                          [item.key]: !val,
                        }))
                      }
                      className={`p-2 rounded-lg text-left text-xs font-semibold border flex items-center justify-between transition-colors cursor-pointer ${
                        val
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          val ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME MATCHING RESULTS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Resultados do Banco Local
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Diagnósticos Mais Compatíveis
                </h3>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold px-2.5 py-1 rounded-full">
                {diagnosticResults.length} registros
              </span>
            </div>

            {/* Top Match Hero Card */}
            {topMatch && (
              <div className="bg-slate-50 dark:bg-zinc-900/70 border-2 border-emerald-500/80 rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                      Compatibilidade: {topMatch.compatibilityPercent}%
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {topMatch.record.problemName}
                    </h4>
                    <p className="text-[11px] italic text-slate-500 dark:text-zinc-400">
                      {topMatch.record.scientificNameOrCause}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      topMatch.record.severity === 'critico'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : topMatch.record.severity === 'severo'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    Severidade: {topMatch.record.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {topMatch.record.technicalDescription}
                </p>

                {/* Real Photographic Atlas Preview (if available) */}
                {topMatch.record.realPhotos && topMatch.record.realPhotos.length > 0 && (
                  <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        Registro Fotográfico Real de Campo:
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {topMatch.record.realPhotos.length} fotos reais
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {topMatch.record.realPhotos.slice(0, 2).map((photo, pIdx) => {
                        const isError = imageErrorMap[photo.url];
                        return (
                          <div
                            key={pIdx}
                            onClick={() => !isError && setLightboxPhoto({ url: photo.url, title: photo.title, caption: photo.caption })}
                            className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-900 cursor-pointer aspect-4/3 flex items-center justify-center"
                          >
                            {isError ? (
                              <div className="w-full h-full p-2 flex flex-col justify-between text-white bg-slate-900">
                                <span className="text-[9px] font-extrabold uppercase bg-emerald-700 text-white px-1.5 py-0.5 rounded w-fit">
                                  {photo.tag}
                                </span>
                                <div className="text-center py-1">
                                  <ImageIcon className="w-4 h-4 mx-auto text-emerald-400 mb-0.5" />
                                  <span className="text-[10px] font-bold block truncate leading-tight">{photo.title}</span>
                                </div>
                                <span className="text-[9px] text-emerald-300 text-center font-bold">Modo Offline</span>
                              </div>
                            ) : (
                              <>
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  onError={() => handleImageError(photo.url)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5 text-white">
                                  <span className="text-[9px] font-extrabold uppercase bg-emerald-600/90 text-white px-1.5 py-0.5 rounded w-fit mb-0.5">
                                    {photo.tag}
                                  </span>
                                  <span className="text-[10px] font-bold truncate leading-tight">
                                    {photo.title}
                                  </span>
                                </div>
                                <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-xs p-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Maximize2 className="w-3 h-3" />
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Matched Features Tags */}
                <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] block">
                    Características Confirmadas no Banco:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {topMatch.matchedFeatures.map((feat, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setSelectedResult(topMatch)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Ver Laudo Técnico & Ações Corretivas
                  </button>
                </div>
              </div>
            )}

            {/* Other Matching Candidates */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                Outras Ocorrências Comparadas:
              </span>
              {diagnosticResults.slice(1, 4).map((res, idx) => (
                <div
                  key={res.record.id}
                  onClick={() => setSelectedResult(res)}
                  className="bg-slate-50/70 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {res.record.problemName}
                    </h5>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Categoria: {res.record.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-slate-700 dark:text-zinc-300">
                      {res.compatibilityPercent}%
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Compatível</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FULL TECHNICAL DETAIL MODAL */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                    Código: {selectedResult.record.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                    Compatibilidade: {selectedResult.compatibilityPercent}%
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                  {selectedResult.record.problemName}
                </h3>
                <p className="text-xs italic text-slate-500 dark:text-zinc-400">
                  {selectedResult.record.scientificNameOrCause}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Technical Breakdown */}
            <div className="space-y-4 text-xs">
              {/* Real Photographic Atlas Section (if photos exist) */}
              {selectedResult.record.realPhotos && selectedResult.record.realPhotos.length > 0 && (
                <div className="bg-slate-50 dark:bg-zinc-900/80 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Atlas Fotográfico Real & Sintomatologia de Campo
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      Fotos de Diagnóstico
                    </span>
                  </div>

                  {/* Photo Switcher Tabs */}
                  {selectedResult.record.realPhotos.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {selectedResult.record.realPhotos.map((p, pIndex) => (
                        <button
                          key={pIndex}
                          onClick={() => setModalActivePhotoIndex(pIndex)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                            modalActivePhotoIndex === pIndex
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                          }`}
                        >
                          {p.tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Photo Container */}
                  {(() => {
                    const activePhoto = selectedResult.record.realPhotos[modalActivePhotoIndex] || selectedResult.record.realPhotos[0];
                    const isError = imageErrorMap[activePhoto.url];
                    return (
                      <div className="space-y-2">
                        <div
                          onClick={() => !isError && setLightboxPhoto({ url: activePhoto.url, title: activePhoto.title, caption: activePhoto.caption })}
                          className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-900 cursor-pointer group aspect-16/9 sm:aspect-21/9 flex items-center justify-center"
                        >
                          {isError ? (
                            <div className="w-full h-full bg-linear-to-br from-slate-900 to-zinc-900 p-4 flex flex-col justify-between text-white">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                                  {activePhoto.tag}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md">
                                  <WifiOff className="w-3 h-3" />
                                  Modo Offline
                                </span>
                              </div>
                              <div className="text-center py-2">
                                <ImageIcon className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                                <h4 className="font-bold text-xs sm:text-sm text-white">{activePhoto.title}</h4>
                                <p className="text-[11px] text-slate-300 mt-0.5 max-w-md mx-auto line-clamp-2">{activePhoto.caption}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageErrorMap(prev => ({ ...prev, [activePhoto.url]: false }));
                                }}
                                className="self-center text-[10px] font-bold text-emerald-300 hover:text-emerald-100 flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-md cursor-pointer border border-emerald-500/30"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Recarregar Imagem
                              </button>
                            </div>
                          ) : (
                            <>
                              <img
                                src={activePhoto.url}
                                alt={activePhoto.title}
                                onError={() => handleImageError(activePhoto.url)}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                                    {activePhoto.tag}
                                  </span>
                                  <span className="text-[11px] font-semibold bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1 text-emerald-300">
                                    <ZoomIn className="w-3 h-3" />
                                    Clique para ampliar
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">
                                  {activePhoto.title}
                                </h4>
                                <p className="text-[11px] text-slate-200/90 mt-0.5 line-clamp-2">
                                  {activePhoto.caption}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">
                  Descrição Técnica da Ocorrência:
                </strong>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                  {selectedResult.record.technicalDescription}
                </p>
              </div>

              {/* Symptoms & Reference */}
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1.5">
                  Sintomas Visuais Cadastrados no Banco:
                </strong>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedResult.record.visualSymptomsList.map((sym, i) => (
                    <li
                      key={i}
                      className="bg-slate-50 dark:bg-zinc-900/40 p-2 rounded border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 flex items-start gap-1.5"
                    >
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Possible Causes */}
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1.5">
                  Possíveis Causas Registradas:
                </strong>
                <ul className="space-y-1">
                  {selectedResult.record.possibleCauses.map((cause, i) => (
                    <li key={i} className="text-slate-600 dark:text-zinc-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preventive Measures */}
              <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3.5 rounded-xl space-y-1.5">
                <strong className="text-blue-950 dark:text-blue-300 font-bold block">
                  Medidas Preventivas Recomendadas:
                </strong>
                <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                  {selectedResult.record.preventiveMeasures.map((prev, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Corrective Measures */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3.5 rounded-xl space-y-1.5">
                <strong className="text-emerald-950 dark:text-emerald-300 font-bold block">
                  Medidas Corretivas Imediatas:
                </strong>
                <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                  {selectedResult.record.correctiveMeasures.map((corr, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{corr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recovery Time & Severity */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block">Tempo Estimado de Recuperação</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {selectedResult.record.recoveryTimeEstimated}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block">Grau de Severidade</span>
                  <span className="font-bold uppercase text-slate-800 dark:text-zinc-200">
                    {selectedResult.record.severity}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Processado 100% no dispositivo (Sem IA / Sem Internet)
              </span>
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PHOTO INSPECTOR */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm truncate">{lightboxPhoto.title}</h4>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image viewer */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg border border-zinc-800"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Caption */}
            {lightboxPhoto.caption && (
              <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-300">
                <span className="font-bold text-emerald-400 mr-1.5">Nota Agronômica:</span>
                {lightboxPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
