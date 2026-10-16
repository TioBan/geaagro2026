import React, { useState, useMemo, useEffect } from 'react';
import {
  Droplets,
  FlaskConical,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  FileText,
  Thermometer,
  ShieldAlert,
  Sliders,
  Check,
  X,
  Printer,
  ChevronDown,
  Info,
  MapPin,
  Sprout,
  Activity,
  Gauge,
  Calendar,
  User,
  Building2,
  Trash2,
  Eye,
  RefreshCw,
  Pencil,
  Edit3,
  Scale,
  FileSpreadsheet,
  Beaker,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  ShieldCheck,
  Droplet,
  LocateFixed,
  ExternalLink,
  Navigation,
  Compass,
} from 'lucide-react';
import {
  WaterAnalysisRecord,
  CollectionPoint,
  CollectionPointType,
  CropSalinityTolerance,
  WaterPurpose,
  WaterPhysicalParams,
  WaterChemicalParams,
  WaterHeavyMetals,
  WaterBiologicalParams,
} from '../types/waterAnalysis';
import {
  WATER_ANALYSIS_DATABASE,
  COLLECTION_POINTS_DATABASE,
  CROP_SALINITY_DATABASE,
  calculateWaterIndices,
  generateWaterCorrectionPlan,
  DEFAULT_BLANK_ANALYSIS,
  DEFAULT_BLANK_POINT,
} from '../data/waterAnalysisData';
import {
  evaluateConamaCompliance,
  evaluateFaoAgronomicStandards,
  calculateFertigationCredits,
  calculateAcidNeutralization,
  evaluateFertigationCompatibility,
} from '../utils/waterInterpretationUtils';

export type WaterAnalysisSubTab =
  | 'dashboard_iga'
  | 'laboratorio_amostras'
  | 'interpretacao_agronomica'
  | 'assistente_correcao'
  | 'pontos_coleta'
  | 'banco_culturas'
  | 'laudo_oficial';

interface WaterAnalysisModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: WaterAnalysisSubTab) => void;
}

export const WaterAnalysisModule: React.FC<WaterAnalysisModuleProps> = ({
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<WaterAnalysisSubTab>('dashboard_iga');
  const activeSubTab = (externalSubTab as WaterAnalysisSubTab) || internalSubTab;
  const setActiveSubTab = (tab: WaterAnalysisSubTab) => {
    setInternalSubTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  const WATER_STORAGE_KEY = 'agronutri_water_analyses_v2';
  const COLLECTION_POINTS_STORAGE_KEY = 'agronutri_water_collection_points_v2';

  const [analyses, setAnalyses] = useState<WaterAnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem(WATER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return WATER_ANALYSIS_DATABASE;
  });

  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    analyses[0]?.id || WATER_ANALYSIS_DATABASE[0]?.id || 'blank-template'
  );
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>(() => {
    try {
      const saved = localStorage.getItem(COLLECTION_POINTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return COLLECTION_POINTS_DATABASE;
  });

  // Search & Filters in Laboratory Tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPurposeFilter, setSelectedPurposeFilter] = useState<string>('todos');

  // Search & Filters in Crop Salinity Tab
  const [searchCropQuery, setSearchCropQuery] = useState<string>('');
  const [selectedCropCategoryFilter, setSelectedCropCategoryFilter] = useState<string>('todas');
  const [selectedCropSensitivityFilter, setSelectedCropSensitivityFilter] = useState<string>('todas');
  const [cropSimulatedEc, setCropSimulatedEc] = useState<number>(1.2);

  // Collection Points Tab State & Modal
  const [isPointModalOpen, setIsPointModalOpen] = useState<boolean>(false);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [searchPointQuery, setSearchPointQuery] = useState<string>('');
  const [selectedPointTypeFilter, setSelectedPointTypeFilter] = useState<string>('todos');
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);

  // Form Fields for Collection Point
  const [pointFormName, setPointFormName] = useState<string>('');
  const [pointFormCode, setPointFormCode] = useState<string>('');
  const [pointFormType, setPointFormType] = useState<CollectionPointType>('poco_artesiano');
  const [pointFormPropertyName, setPointFormPropertyName] = useState<string>('');
  const [pointFormLatitude, setPointFormLatitude] = useState<string>('-21.1767');
  const [pointFormLongitude, setPointFormLongitude] = useState<string>('-47.8103');
  const [pointFormAltitudeMeters, setPointFormAltitudeMeters] = useState<string>('580');
  const [pointFormNotes, setPointFormNotes] = useState<string>('');

  // Interpretation View Modes & Interactive Filters
  const [interpretationViewMode, setInterpretationViewMode] = useState<
    'agronomico_fao' | 'conama_357' | 'calculadora_fertirrigacao' | 'diagrama_riverside'
  >('agronomico_fao');
  const [fertigationLaminaMm, setFertigationLaminaMm] = useState<number>(100);
  const [fertigationTargetResidualHco3, setFertigationTargetResidualHco3] = useState<number>(35);
  const [conamaFilterCategory, setConamaFilterCategory] = useState<
    'todos' | 'microbiologico' | 'fisico' | 'quimico_inorganico' | 'metais_pesados'
  >('todos');
  const [conamaSelectedClass, setConamaSelectedClass] = useState<
    'todas' | 'classe_1' | 'classe_2' | 'classe_3'
  >('todas');

  // Modal for New Analysis / Edit Analysis
  const [isNewAnalysisModalOpen, setIsNewAnalysisModalOpen] = useState<boolean>(false);
  const [editingAnalysisId, setEditingAnalysisId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'geral' | 'fisicoquimica' | 'micro_obs'>('geral');

  // Form Fields for Create / Edit
  const [formSampleCode, setFormSampleCode] = useState<string>('');
  const [formClientName, setFormClientName] = useState<string>('');
  const [formPropertyName, setFormPropertyName] = useState<string>('');
  const [formPointId, setFormPointId] = useState<string>('');
  const [formCollectionDate, setFormCollectionDate] = useState<string>('');
  const [formCollectionTime, setFormCollectionTime] = useState<string>('10:00');
  const [formResponsibleTechnician, setFormResponsibleTechnician] = useState<string>('');
  const [formCreaCrq, setFormCreaCrq] = useState<string>('');
  const [formReferenceStandard, setFormReferenceStandard] = useState<'FAO_29' | 'MS_888' | 'CONAMA_357' | 'HIDROPONIA_PRO'>('FAO_29');
  const [formPurposes, setFormPurposes] = useState<WaterPurpose[]>(['irrigacao', 'fertirrigacao']);

  // Chemical & Physical
  const [formPh, setFormPh] = useState<number>(7.4);
  const [formCe, setFormCe] = useState<number>(650);
  const [formTurbidity, setFormTurbidity] = useState<number>(4.5);
  const [formBicarbonates, setFormBicarbonates] = useState<number>(140);
  const [formCalcium, setFormCalcium] = useState<number>(35);
  const [formMagnesium, setFormMagnesium] = useState<number>(14);
  const [formSodium, setFormSodium] = useState<number>(28);
  const [formPotassium, setFormPotassium] = useState<number>(4.0);
  const [formChlorides, setFormChlorides] = useState<number>(25.0);
  const [formSulfates, setFormSulfates] = useState<number>(18.0);
  const [formNitrate, setFormNitrate] = useState<number>(10.0);
  const [formIron, setFormIron] = useState<number>(0.35);
  const [formManganese, setFormManganese] = useState<number>(0.05);
  const [formBoron, setFormBoron] = useState<number>(0.2);
  const [formEColi, setFormEColi] = useState<number>(0);
  const [formTotalColiforms, setFormTotalColiforms] = useState<number>(0);
  const [formTechnicalNotes, setFormTechnicalNotes] = useState<string>('');

  // Persist analyses and collection points to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(analyses));
    } catch (e) {
      console.warn('Erro ao salvar análises no localStorage', e);
    }
  }, [analyses]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLECTION_POINTS_STORAGE_KEY, JSON.stringify(collectionPoints));
    } catch (e) {
      console.warn('Erro ao salvar pontos de coleta no localStorage', e);
    }
  }, [collectionPoints]);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const currentAnalysis = useMemo(() => {
    return analyses.find(a => a.id === selectedAnalysisId) || analyses[0] || WATER_ANALYSIS_DATABASE[0] || DEFAULT_BLANK_ANALYSIS;
  }, [analyses, selectedAnalysisId]);

  const currentPoint = useMemo(() => {
    if (!currentAnalysis) return DEFAULT_BLANK_POINT;
    return collectionPoints.find(p => p.id === currentAnalysis.collectionPointId) || collectionPoints[0] || DEFAULT_BLANK_POINT;
  }, [collectionPoints, currentAnalysis]);

  // Agronomic and Environmental Evaluations
  const conamaEvaluation = useMemo(() => {
    return evaluateConamaCompliance(currentAnalysis);
  }, [currentAnalysis]);

  const faoEvaluation = useMemo(() => {
    return evaluateFaoAgronomicStandards(currentAnalysis);
  }, [currentAnalysis]);

  const fertigationCredits = useMemo(() => {
    return calculateFertigationCredits(currentAnalysis, fertigationLaminaMm);
  }, [currentAnalysis, fertigationLaminaMm]);

  const acidRequirements = useMemo(() => {
    return calculateAcidNeutralization(currentAnalysis, fertigationTargetResidualHco3);
  }, [currentAnalysis, fertigationTargetResidualHco3]);

  const fertigationAlerts = useMemo(() => {
    return evaluateFertigationCompatibility(currentAnalysis);
  }, [currentAnalysis]);

  // Overall Statistics for Dashboard
  const stats = useMemo(() => {
    const totalAnalyses = analyses.length;
    const avgIga = Math.round(analyses.reduce((acc, a) => acc + a.calculated.igaScore, 0) / (totalAnalyses || 1));
    const avgPh = Math.round((analyses.reduce((acc, a) => acc + a.chemical.ph, 0) / (totalAnalyses || 1)) * 10) / 10;
    const avgCe = Math.round(analyses.reduce((acc, a) => acc + a.physical.electricalConductivityMicroS, 0) / (totalAnalyses || 1));
    const avgSar = Math.round((analyses.reduce((acc, a) => acc + a.calculated.sar, 0) / (totalAnalyses || 1)) * 10) / 10;
    const avgTurbidity = Math.round((analyses.reduce((acc, a) => acc + a.physical.turbidityNtu, 0) / (totalAnalyses || 1)) * 10) / 10;

    const criticalCount = analyses.filter(a => a.correctionPlan.riskLevel === 'critico' || a.correctionPlan.riskLevel === 'alto').length;

    return {
      totalAnalyses,
      avgIga,
      avgPh,
      avgCe,
      avgSar,
      avgTurbidity,
      criticalCount,
    };
  }, [analyses]);

  const handleOpenNewAnalysis = () => {
    setEditingAnalysisId(null);
    setModalTab('geral');
    setFormSampleCode(`AGUA-2026-00${analyses.length + 1}`);
    setFormClientName('Fazenda Boa Esperança');
    setFormPropertyName('Fazenda Boa Esperança');
    setFormPointId(collectionPoints[0]?.id || 'p-01');
    setFormCollectionDate(new Date().toISOString().split('T')[0]);
    setFormCollectionTime('10:00');
    setFormResponsibleTechnician('Eng. Agr. Responsável Técnico');
    setFormCreaCrq('CREA-SP 506921/D');
    setFormReferenceStandard('FAO_29');
    setFormPurposes(['irrigacao', 'fertirrigacao']);
    setFormPh(7.4);
    setFormCe(650);
    setFormTurbidity(4.5);
    setFormBicarbonates(140);
    setFormCalcium(35);
    setFormMagnesium(14);
    setFormSodium(28);
    setFormPotassium(4.0);
    setFormChlorides(25.0);
    setFormSulfates(18.0);
    setFormNitrate(10.0);
    setFormIron(0.35);
    setFormManganese(0.05);
    setFormBoron(0.2);
    setFormEColi(0);
    setFormTotalColiforms(0);
    setFormTechnicalNotes('Análise cadastrada via aplicativo com cálculo automático de IGA, SAR e plano de correção.');
    setIsNewAnalysisModalOpen(true);
  };

  const handleOpenEditAnalysis = (a: WaterAnalysisRecord) => {
    setEditingAnalysisId(a.id);
    setModalTab('geral');
    setFormSampleCode(a.sampleCode);
    setFormClientName(a.clientName);
    setFormPropertyName(a.propertyName);
    setFormPointId(a.collectionPointId);
    setFormCollectionDate(a.collectionDate);
    setFormCollectionTime(a.collectionTime || '10:00');
    setFormResponsibleTechnician(a.responsibleTechnician);
    setFormCreaCrq(a.creaCrq);
    setFormReferenceStandard(a.referenceStandard);
    setFormPurposes(a.purposes && a.purposes.length > 0 ? a.purposes : ['irrigacao']);
    setFormPh(a.chemical.ph);
    setFormCe(a.physical.electricalConductivityMicroS);
    setFormTurbidity(a.physical.turbidityNtu);
    setFormBicarbonates(a.chemical.bicarbonatesHco3MgL);
    setFormCalcium(a.chemical.calciumCaMgL);
    setFormMagnesium(a.chemical.magnesiumMgL);
    setFormSodium(a.chemical.sodiumNaMgL);
    setFormPotassium(a.chemical.potassiumKMgL ?? 4.0);
    setFormChlorides(a.chemical.chloridesClMgL ?? 25.0);
    setFormSulfates(a.chemical.sulfatesSo4MgL ?? 18.0);
    setFormNitrate(a.chemical.nitrateNo3MgL ?? 10.0);
    setFormIron(a.chemical.ironFeMgL);
    setFormManganese(a.chemical.manganeseMnMgL ?? 0.05);
    setFormBoron(a.chemical.boronBMgL ?? 0.2);
    setFormEColi(a.biological.escherichiaColiNmp100ml);
    setFormTotalColiforms(a.biological.totalColiformsNmp100ml);
    setFormTechnicalNotes(a.technicalNotes || '');
    setIsNewAnalysisModalOpen(true);
  };

  const handleSaveAnalysis = () => {
    const phys: WaterPhysicalParams = {
      waterTempCelsius: 22.5,
      colorPtCo: 5,
      turbidityNtu: Number(formTurbidity) || 2,
      electricalConductivityMicroS: Number(formCe) || 200,
      salinityPpt: (Number(formCe) || 200) / 1500,
      totalDissolvedSolidsMgL: (Number(formCe) || 200) * 0.64,
      totalSuspendedSolidsMgL: (Number(formTurbidity) || 2) * 1.5,
      odor: 'inodoro',
      taste: 'insipido',
    };

    const chem: WaterChemicalParams = {
      ph: Number(formPh) || 7.0,
      totalAlkalinityMgCaCO3: (Number(formBicarbonates) || 50) * 0.8,
      totalHardnessMgCaCO3: ((Number(formCalcium) || 20) * 2.5) + ((Number(formMagnesium) || 10) * 4.12),
      carbonatesCo3MgL: (Number(formPh) || 7.0) > 8.2 ? 6.0 : 0.0,
      bicarbonatesHco3MgL: Number(formBicarbonates) || 50,
      chloridesClMgL: Number(formChlorides) || 25.0,
      sulfatesSo4MgL: Number(formSulfates) || 18.0,
      nitrateNo3MgL: Number(formNitrate) || 10.0,
      nitriteNo2MgL: 0.02,
      ammoniumNh4MgL: 0.05,
      totalNitrogenMgL: 2.5,
      phosphorusPMgL: 0.05,
      potassiumKMgL: Number(formPotassium) || 4.0,
      calciumCaMgL: Number(formCalcium) || 20,
      magnesiumMgL: Number(formMagnesium) || 10,
      sodiumNaMgL: Number(formSodium) || 15,
      ironFeMgL: Number(formIron) || 0,
      manganeseMnMgL: Number(formManganese) || 0.05,
      zincZnMgL: 0.08,
      copperCuMgL: 0.02,
      aluminumAlMgL: 0.04,
      boronBMgL: Number(formBoron) || 0.2,
      residualChlorineMgL: 0.0,
      fluorideFMgL: 0.5,
      dissolvedOxygenMgL: 6.0,
      bod5MgL: 1.5,
      codMgL: 5.0,
    };

    const heavy: WaterHeavyMetals = {
      arsenicAsMgL: 0.001,
      cadmiumCdMgL: 0.0005,
      leadPbMgL: 0.002,
      totalChromiumCrMgL: 0.003,
      mercuryHgMgL: 0.0001,
      nickelNiMgL: 0.002,
      seleniumSeMgL: 0.001,
    };

    const bio: WaterBiologicalParams = {
      totalColiformsNmp100ml: Number(formTotalColiforms) || (Number(formEColi) > 0 ? Number(formEColi) * 3 : 0),
      escherichiaColiNmp100ml: Number(formEColi) || 0,
      enterococciNmp100ml: 0,
      salmonellaPresent: false,
      cyanobacteriaCellsMl: 0,
      algaeDetected: false,
    };

    const calc = calculateWaterIndices(chem, phys, bio);
    const plan = generateWaterCorrectionPlan(chem, phys, bio, calc);

    if (editingAnalysisId) {
      setAnalyses(prev =>
        prev.map(item => {
          if (item.id === editingAnalysisId) {
            return {
              ...item,
              sampleCode: formSampleCode || item.sampleCode,
              clientName: formClientName || item.clientName,
              propertyName: formPropertyName || item.propertyName,
              collectionPointId: formPointId || item.collectionPointId,
              collectionDate: formCollectionDate || item.collectionDate,
              collectionTime: formCollectionTime || item.collectionTime,
              responsibleTechnician: formResponsibleTechnician || item.responsibleTechnician,
              creaCrq: formCreaCrq || item.creaCrq,
              referenceStandard: formReferenceStandard,
              purposes: formPurposes,
              physical: phys,
              chemical: chem,
              heavyMetals: heavy,
              biological: bio,
              calculated: calc,
              correctionPlan: plan,
              technicalNotes: formTechnicalNotes || item.technicalNotes,
              status: 'concluido',
            };
          }
          return item;
        })
      );
      setSelectedAnalysisId(editingAnalysisId);
      setIsNewAnalysisModalOpen(false);
      showNotification(`Análise ${formSampleCode} atualizada e recalculada com sucesso! IGA: ${calc.igaScore}/100.`);
    } else {
      const newRecord: WaterAnalysisRecord = {
        id: `ana-${Date.now()}`,
        sampleCode: formSampleCode || `AGUA-2026-00${analyses.length + 1}`,
        collectionDate: formCollectionDate || new Date().toISOString().split('T')[0],
        collectionTime: formCollectionTime || '10:00',
        responsibleTechnician: formResponsibleTechnician || 'Eng. Agr. Responsável Técnico',
        creaCrq: formCreaCrq || 'CREA-SP 506921/D',
        clientName: formClientName || 'Fazenda Boa Esperança',
        propertyName: formPropertyName || 'Fazenda Boa Esperança',
        collectionPointId: formPointId || collectionPoints[0]?.id || 'p-01',
        purposes: formPurposes,
        referenceStandard: formReferenceStandard,
        physical: phys,
        chemical: chem,
        heavyMetals: heavy,
        biological: bio,
        calculated: calc,
        correctionPlan: plan,
        technicalNotes: formTechnicalNotes || 'Análise cadastrada via aplicativo com cálculo automático de IGA, SAR e plano de correção.',
        status: 'concluido',
      };
      setAnalyses(prev => [newRecord, ...prev]);
      setSelectedAnalysisId(newRecord.id);
      setIsNewAnalysisModalOpen(false);
      showNotification(`Análise ${newRecord.sampleCode} cadastrada e interpretada com sucesso! IGA: ${calc.igaScore}/100.`);
    }
  };

  const handleDeleteAnalysis = (id: string) => {
    const toDelete = analyses.find(a => a.id === id);
    if (!toDelete) return;
    if (analyses.length <= 1) {
      showNotification('Não é possível excluir a única amostra do catálogo.');
      return;
    }
    const updated = analyses.filter(a => a.id !== id);
    setAnalyses(updated);
    if (selectedAnalysisId === id) {
      setSelectedAnalysisId(updated[0]?.id || '');
    }
    showNotification(`Amostra ${toDelete.sampleCode} removida com sucesso.`);
  };

  const handleViewInterpretation = (id: string) => {
    setSelectedAnalysisId(id);
    setActiveSubTab('interpretacao_agronomica');
  };

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(a => {
      const matchesSearch =
        a.sampleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPurpose = selectedPurposeFilter === 'todos' || a.purposes.includes(selectedPurposeFilter as any);
      return matchesSearch && matchesPurpose;
    });
  }, [analyses, searchQuery, selectedPurposeFilter]);

  const filteredCrops = useMemo(() => {
    const q = searchCropQuery.toLowerCase().trim();
    return CROP_SALINITY_DATABASE.filter(c => {
      const matchesSearch =
        !q ||
        c.cropName.toLowerCase().includes(q) ||
        (c.scientificName && c.scientificName.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q) ||
        c.specialRecommendations.toLowerCase().includes(q);

      const matchesCategory =
        selectedCropCategoryFilter === 'todas' || c.category === selectedCropCategoryFilter;

      const matchesSensitivity =
        selectedCropSensitivityFilter === 'todas' || c.sensitivityRating === selectedCropSensitivityFilter;

      return matchesSearch && matchesCategory && matchesSensitivity;
    });
  }, [searchCropQuery, selectedCropCategoryFilter, selectedCropSensitivityFilter]);

  const COLLECTION_POINT_TYPE_LABELS: Record<
    CollectionPointType,
    { label: string; bg: string; text: string; border: string; desc: string }
  > = {
    poco_artesiano: {
      label: 'Poço Artesiano',
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-800',
      desc: 'Captação profunda em lençol confinado',
    },
    poco_semiartesiano: {
      label: 'Poço Semi-Artesiano',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800',
      desc: 'Captação freática com bombeamento',
    },
    rio: {
      label: 'Rio / Córrego',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      desc: 'Água superficial corrente',
    },
    represa: {
      label: 'Represa',
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-800',
      desc: 'Armazenamento artificial de grande porte',
    },
    acude: {
      label: 'Açude',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      desc: 'Barramento de pequeno a médio porte',
    },
    nascente: {
      label: 'Nascente / Mina',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      desc: 'Afloramento natural de água subterrânea',
    },
    lago: {
      label: 'Lago / Lagoa',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800',
      desc: 'Corpo d\'água natural estagnado',
    },
    reservatorio: {
      label: 'Reservatório / Tanque',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      desc: 'Tanque suspenso, australiano ou geomembrana',
    },
    canal_irrigacao: {
      label: 'Canal de Irrigação',
      bg: 'bg-lime-50 dark:bg-lime-950/60',
      text: 'text-lime-700 dark:text-lime-300',
      border: 'border-lime-200 dark:border-lime-800',
      desc: 'Canal adutor ou distribuição',
    },
    cisterna: {
      label: 'Cisterna / Pluvial',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      desc: 'Captação e acúmulo de águas pluviais',
    },
    rede_publica: {
      label: 'Rede Pública',
      bg: 'bg-slate-50 dark:bg-slate-800/60',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      desc: 'Abastecimento tratado municipal/concessionária',
    },
    outro: {
      label: 'Outro Manancial',
      bg: 'bg-zinc-50 dark:bg-zinc-800/60',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-200 dark:border-zinc-700',
      desc: 'Outra fonte de captação hídrica',
    },
  };

  const filteredCollectionPoints = useMemo(() => {
    return collectionPoints.filter(p => {
      const matchesSearch =
        searchPointQuery === '' ||
        p.name.toLowerCase().includes(searchPointQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchPointQuery.toLowerCase()) ||
        p.propertyName.toLowerCase().includes(searchPointQuery.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchPointQuery.toLowerCase()));
      const matchesType =
        selectedPointTypeFilter === 'todos' || p.type === selectedPointTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [collectionPoints, searchPointQuery, selectedPointTypeFilter]);

  const handleOpenCreatePointModal = () => {
    setEditingPointId(null);
    setPointFormName('');
    setPointFormCode(`PT-00${collectionPoints.length + 1}`);
    setPointFormType('poco_artesiano');
    setPointFormPropertyName(analyses[0]?.propertyName || 'Fazenda Principal');
    setPointFormLatitude('-21.1767');
    setPointFormLongitude('-47.8103');
    setPointFormAltitudeMeters('580');
    setPointFormNotes('');
    setIsPointModalOpen(true);
  };

  const handleOpenEditPointModal = (p: CollectionPoint) => {
    setEditingPointId(p.id);
    setPointFormName(p.name);
    setPointFormCode(p.code);
    setPointFormType(p.type);
    setPointFormPropertyName(p.propertyName);
    setPointFormLatitude(String(p.latitude));
    setPointFormLongitude(String(p.longitude));
    setPointFormAltitudeMeters(String(p.altitudeMeters));
    setPointFormNotes(p.notes || '');
    setIsPointModalOpen(true);
  };

  const handleSavePoint = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pointFormName.trim()) {
      showNotification('Por favor, informe o nome do ponto de coleta.');
      return;
    }
    const lat = parseFloat(pointFormLatitude) || 0;
    const lon = parseFloat(pointFormLongitude) || 0;
    const alt = parseFloat(pointFormAltitudeMeters) || 0;

    if (editingPointId) {
      setCollectionPoints(prev =>
        prev.map(p =>
          p.id === editingPointId
            ? {
                ...p,
                name: pointFormName.trim(),
                code: pointFormCode.trim() || p.code,
                type: pointFormType,
                propertyName: pointFormPropertyName.trim() || p.propertyName,
                latitude: lat,
                longitude: lon,
                altitudeMeters: alt,
                notes: pointFormNotes.trim(),
              }
            : p
        )
      );
      showNotification(`Ponto "${pointFormName.trim()}" atualizado com sucesso!`);
    } else {
      const newPoint: CollectionPoint = {
        id: `pt-${Date.now()}`,
        name: pointFormName.trim(),
        code: pointFormCode.trim() || `PT-00${collectionPoints.length + 1}`,
        type: pointFormType,
        propertyName: pointFormPropertyName.trim() || 'Fazenda Principal',
        latitude: lat,
        longitude: lon,
        altitudeMeters: alt,
        notes: pointFormNotes.trim(),
      };
      setCollectionPoints(prev => [...prev, newPoint]);
      showNotification(`Ponto "${newPoint.name}" cadastrado com sucesso!`);
    }
    setIsPointModalOpen(false);
  };

  const handleDeletePoint = (pointId: string) => {
    const p = collectionPoints.find(item => item.id === pointId);
    if (!p) return;
    if (collectionPoints.length <= 1) {
      showNotification('Não é possível excluir o único ponto de coleta.');
      return;
    }
    const linkedAnalyses = analyses.filter(a => a.collectionPointId === pointId);
    const confirmMsg =
      linkedAnalyses.length > 0
        ? `Excluir o ponto "${p.name}"? Existem ${linkedAnalyses.length} amostra(s) vinculadas a este ponto.`
        : `Deseja realmente excluir o ponto de coleta "${p.name}"?`;

    if (window.confirm(confirmMsg)) {
      const updated = collectionPoints.filter(item => item.id !== pointId);
      setCollectionPoints(updated);
      showNotification(`Ponto de coleta "${p.name}" excluído.`);
    }
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocalização não suportada neste navegador.');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPointFormLatitude(pos.coords.latitude.toFixed(6));
        setPointFormLongitude(pos.coords.longitude.toFixed(6));
        if (pos.coords.altitude) {
          setPointFormAltitudeMeters(Math.round(pos.coords.altitude).toString());
        }
        setIsCapturingGps(false);
        showNotification('Coordenadas GPS capturadas com sucesso!');
      },
      err => {
        setIsCapturingGps(false);
        showNotification('Não foi possível obter localização GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleCreateAnalysisForPoint = (pointId: string) => {
    handleOpenNewAnalysis();
    setFormPointId(pointId);
    const pt = collectionPoints.find(p => p.id === pointId);
    if (pt) {
      setFormPropertyName(pt.propertyName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: AquaAgro Pro & Análise de Água */}
      <div className="bg-gradient-to-r from-blue-950 via-cyan-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-cyan-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              Módulo de Análise e Qualidade da Água
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 max-w-3xl">
              Interpretação laboratorial completa (Físico-Química e Microbiológica), cálculo do Índice Geral da Água (IGA), classificação USSL (Riverside), RAS/SAR, risco de entupimento de emissores e Assistente de Correção da Água.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenNewAnalysis}
              className="bg-cyan-500 hover:bg-cyan-400 text-blue-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Análise Laboratorial
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-cyan-800/60 text-xs">
          <div className="bg-cyan-900/40 p-2.5 rounded-xl border border-cyan-700/40">
            <span className="text-[10px] text-cyan-300/80 block">Índice Geral Médio (IGA)</span>
            <strong className="text-base text-cyan-300 font-black">{stats.avgIga}/100</strong>
            <span className="text-[10px] text-cyan-200 block">Classificação Geral</span>
          </div>

          <div className="bg-cyan-900/40 p-2.5 rounded-xl border border-cyan-700/40">
            <span className="text-[10px] text-cyan-300/80 block">Análises Realizadas</span>
            <strong className="text-base text-white font-black">{stats.totalAnalyses} Laudos</strong>
            <span className="text-[10px] text-cyan-200 block">{collectionPoints.length} Pontos Coleta</span>
          </div>

          <div className="bg-cyan-900/40 p-2.5 rounded-xl border border-cyan-700/40">
            <span className="text-[10px] text-cyan-300/80 block">pH Médio da Água</span>
            <strong className="text-base text-teal-300 font-black">{stats.avgPh}</strong>
            <span className="text-[10px] text-cyan-200 block">Faixa Neutra</span>
          </div>

          <div className="bg-cyan-900/40 p-2.5 rounded-xl border border-cyan-700/40">
            <span className="text-[10px] text-cyan-300/80 block">Condutividade Média</span>
            <strong className="text-base text-amber-300 font-black">{stats.avgCe} µS/cm</strong>
            <span className="text-[10px] text-cyan-200 block">Salinidade</span>
          </div>

          <div className="bg-cyan-900/40 p-2.5 rounded-xl border border-cyan-700/40">
            <span className="text-[10px] text-cyan-300/80 block">RAS / SAR Médio</span>
            <strong className="text-base text-emerald-300 font-black">{stats.avgSar}</strong>
            <span className="text-[10px] text-cyan-200 block">Risco de Sodicidade</span>
          </div>

          <div className="bg-cyan-900/40 p-2.5 rounded-xl border border-cyan-700/40">
            <span className="text-[10px] text-cyan-300/80 block">Alertas de Risco</span>
            <strong
              className={`text-sm font-black block truncate ${
                stats.criticalCount > 0 ? 'text-rose-400' : 'text-emerald-300'
              }`}
            >
              {stats.criticalCount > 0 ? `⚠️ ${stats.criticalCount} Críticos` : '✓ Sem Desvios'}
            </strong>
            <span className="text-[10px] text-cyan-200 block">Tratamento Necessário</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-cyan-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white hover:text-cyan-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}




      {/* Sample Selector Bar across Technical Tabs */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-3 sm:px-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
            <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Amostra em Foco:</span>
          </div>
          <select
            value={selectedAnalysisId}
            onChange={e => setSelectedAnalysisId(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 font-bold text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500/40 truncate max-w-xs cursor-pointer shadow-2xs"
          >
            {analyses.map(a => (
              <option key={a.id} value={a.id}>
                {a.sampleCode} - {a.propertyName} ({a.calculated.igaClassification.toUpperCase()} • IGA {a.calculated.igaScore})
              </option>
            ))}
          </select>
          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
            currentAnalysis.calculated.igaClassification === 'excelente' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' :
            currentAnalysis.calculated.igaClassification === 'boa' ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300' :
            currentAnalysis.calculated.igaClassification === 'regular' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300' :
            'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
          }`}>
            IGA {currentAnalysis.calculated.igaScore} • {currentAnalysis.calculated.igaClassification.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-400 text-[11px] flex-wrap">
          <span className="flex items-center gap-1">
            <span className="text-slate-400">Coleta:</span>
            <strong className="text-slate-800 dark:text-zinc-200">{currentAnalysis.collectionDate}</strong>
          </span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400">Ponto:</span>
            <strong className="text-slate-800 dark:text-zinc-200">{currentPoint.name}</strong>
          </span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-lg font-extrabold text-[10px]">
            {currentAnalysis.referenceStandard}
          </span>
        </div>
      </div>


      {/* ========================================================= */}
      {/* 1. DASHBOARD & IGA (ÍNDICE GERAL DA ÁGUA)                  */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard_iga' && (
        <div className="space-y-6 animate-fade-in">
          {analyses.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex gap-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Nenhuma Amostra de Água Cadastrada</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                    Inicie cadastrando os pontos de captação de sua propriedade e adicione as análises laboratoriais para visualizar os índices e recomendações.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('laboratorio_amostras')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto text-center justify-center shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Amostra
              </button>
            </div>
          )}

          {/* IGA Hero Card with Speedometer / Gauge */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Gauge Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Índice Geral da Água (IGA)
                </span>

                {/* Circular Gauge Score */}
                <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-8 border-cyan-500 bg-white dark:bg-black shadow-inner">
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {currentAnalysis.calculated.igaScore}
                    </span>
                    <span className="text-xs text-slate-400 block font-bold">/ 100</span>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                      currentAnalysis.calculated.igaScore >= 85
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : currentAnalysis.calculated.igaScore >= 70
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                        : currentAnalysis.calculated.igaScore >= 50
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    Qualidade {currentAnalysis.calculated.igaClassification.replace('_', ' ')}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Ponderação: Física (20%) + Química (30%) + Biológica (20%) + Uso (20%) + Histórico (10%)
                  </p>
                </div>
              </div>

              {/* Breakdown & Indicators (7 cols) */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Parâmetros Críticos da Amostra {currentAnalysis.sampleCode}
                  </h3>
                  <span className="text-[11px] text-slate-400">Ponto: {currentPoint.name}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block font-bold">Potencial Hidrogeniônico</span>
                    <strong className="text-sm text-slate-900 dark:text-white">pH {currentAnalysis.chemical.ph}</strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">Ideal: 6.0 - 7.5</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block font-bold">Condutividade Elétrica</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{currentAnalysis.physical.electricalConductivityMicroS} µS/cm</strong>
                    <span className="text-[10px] text-slate-500 block font-semibold">Salinidade Classe {currentAnalysis.calculated.salinityClass}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block font-bold">Relação Adsorção Sódio</span>
                    <strong className="text-sm text-slate-900 dark:text-white">RAS {currentAnalysis.calculated.sar}</strong>
                    <span className="text-[10px] text-slate-500 block font-semibold">Sodicidade {currentAnalysis.calculated.sodicityClass}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block font-bold">Bicarbonatos (HCO₃⁻)</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{currentAnalysis.chemical.bicarbonatesHco3MgL} mg/L</strong>
                    <span className={`text-[10px] block font-semibold ${currentAnalysis.chemical.bicarbonatesHco3MgL > 120 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {currentAnalysis.chemical.bicarbonatesHco3MgL > 120 ? 'Elevado (>120 mg/L)' : 'Normal'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block font-bold">Ferro Total (Fe)</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{currentAnalysis.chemical.ironFeMgL} mg/L</strong>
                    <span className={`text-[10px] block font-semibold ${currentAnalysis.chemical.ironFeMgL > 0.3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {currentAnalysis.chemical.ironFeMgL > 0.3 ? 'Risco Obstrução' : 'Baixo Risco'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block font-bold">Escherichia coli</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{currentAnalysis.biological.escherichiaColiNmp100ml} NMP/100mL</strong>
                    <span className={`text-[10px] block font-semibold ${currentAnalysis.biological.escherichiaColiNmp100ml > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {currentAnalysis.biological.escherichiaColiNmp100ml > 0 ? 'Contaminação' : 'Ausente (0 NMP)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. LABORATÓRIO & AMOSTRAS                                 */}
      {/* ========================================================= */}
      {activeSubTab === 'laboratorio_amostras' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Header with Search, Filters and New Sample Button */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar amostra por código, cliente ou fazenda..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedPurposeFilter}
                  onChange={e => setSelectedPurposeFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold"
                >
                  <option value="todos">Todas as Finalidades</option>
                  <option value="irrigacao">Irrigação Agrícola</option>
                  <option value="fertirrigacao">Fertirrigação</option>
                  <option value="hidroponia">Hidroponia</option>
                  <option value="consumo_humano">Consumo Humano</option>
                  <option value="pulverizacao">Pulverização</option>
                </select>

                <button
                  onClick={handleOpenNewAnalysis}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova Amostra
                </button>
              </div>
            </div>

            {/* List of Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnalyses.map(a => {
                const point = collectionPoints.find(p => p.id === a.collectionPointId);
                const isSelected = a.id === selectedAnalysisId;

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAnalysisId(a.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20 shadow-xs ring-1 ring-cyan-500/30'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900 dark:text-white">{a.sampleCode}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">({a.collectionDate})</span>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-zinc-400 block mt-0.5">
                          {a.propertyName} • {point?.name || 'Ponto Coleta'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                          IGA {a.calculated.igaScore}
                        </span>
                        <span className="text-[9px] uppercase font-bold block text-slate-400">
                          {a.calculated.igaClassification}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                      <div>
                        <span className="text-[9px] text-slate-400 block">pH</span>
                        <strong className="text-slate-800 dark:text-zinc-200">{a.chemical.ph}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">CE (µS)</span>
                        <strong className="text-slate-800 dark:text-zinc-200">{a.physical.electricalConductivityMicroS}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">RAS</span>
                        <strong className="text-slate-800 dark:text-zinc-200">{a.calculated.sar}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Entupimento</span>
                        <strong className="text-slate-800 dark:text-zinc-200 uppercase text-[10px]">{a.calculated.emitterCloggingRisk}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                      <span className="text-slate-500 dark:text-zinc-400 text-[11px] truncate max-w-[150px]">
                        Resp: {a.responsibleTechnician}
                      </span>
                      
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditAnalysis(a);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
                          title="Editar dados desta análise de água"
                        >
                          <Pencil className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInterpretation(a.id);
                          }}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          title="Ver interpretação agronômica completa e USSL"
                        >
                          Ver Interpretação <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {analyses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Deseja remover a análise ${a.sampleCode}?`)) {
                                handleDeleteAnalysis(a.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                            title="Excluir amostra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. INTERPRETAÇÃO PARA IRRIGAÇÃO E FERTIRRIGAÇÃO (CONAMA & FAO 29)   */}
      {/* ==================================================================== */}
      {activeSubTab === 'interpretacao_agronomica' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card & View Mode Selector */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Resoluções Legais & Agronomia de Precisão
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Amostra: <strong className="text-slate-800 dark:text-zinc-200">{currentAnalysis.sampleCode}</strong>
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Interpretação para Irrigação e Fertirrigação
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Avaliação comparativa e regulatória conforme a <strong>Resolução CONAMA nº 357/2005</strong> e os padrões agronômicos <strong>FAO 29 (Ayers & Westcot)</strong>, com créditos de fertirrigação e neutralização de bicarbonatos.
                </p>
              </div>

              {/* View Mode Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setInterpretationViewMode('agronomico_fao')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    interpretationViewMode === 'agronomico_fao'
                      ? 'bg-white dark:bg-zinc-800 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                  Uso Agrícola (FAO 29)
                </button>

                <button
                  type="button"
                  onClick={() => setInterpretationViewMode('conama_357')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    interpretationViewMode === 'conama_357'
                      ? 'bg-white dark:bg-zinc-800 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-500" />
                  Resolução CONAMA 357
                </button>

                <button
                  type="button"
                  onClick={() => setInterpretationViewMode('calculadora_fertirrigacao')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    interpretationViewMode === 'calculadora_fertirrigacao'
                      ? 'bg-white dark:bg-zinc-800 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Beaker className="w-3.5 h-3.5 text-amber-500" />
                  Calculadora Fertirrigação
                </button>

                <button
                  type="button"
                  onClick={() => setInterpretationViewMode('diagrama_riverside')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    interpretationViewMode === 'diagrama_riverside'
                      ? 'bg-white dark:bg-zinc-800 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  Diagrama USSL Riverside
                </button>
              </div>
            </div>

            {/* Quick KPI Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Enquadramento Legal</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {conamaEvaluation.recommendedClass === 'classe_1'
                      ? 'Classe 1 (Nobre)'
                      : conamaEvaluation.recommendedClass === 'classe_2'
                      ? 'Classe 2 (Frutíferas)'
                      : conamaEvaluation.recommendedClass === 'classe_3'
                      ? 'Classe 3 (Grãos/Forragens)'
                      : 'Inconforme'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 block">
                  {conamaEvaluation.complianceByClass.classe_1.compliancePercentage}% conf. Cl. 1 • {conamaEvaluation.complianceByClass.classe_2.compliancePercentage}% conf. Cl. 2
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Classificação Agronômica</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    USSL {currentAnalysis.calculated.salinityClass}-{currentAnalysis.calculated.sodicityClass}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 block">
                  CE: {currentAnalysis.physical.electricalConductivityMicroS} µS/cm | RAS: {currentAnalysis.calculated.sar}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Restrição de Uso (FAO 29)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`font-extrabold capitalize ${
                      faoEvaluation.overallRestriction === 'nenhuma'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : faoEvaluation.overallRestriction === 'moderada'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {faoEvaluation.overallRestriction === 'nenhuma'
                      ? 'Sem Restrição'
                      : faoEvaluation.overallRestriction === 'moderada'
                      ? 'Restrição Moderada'
                      : 'Restrição Severa'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 block">
                  Lixiviação recomendada: {faoEvaluation.leachingFractionRequired}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Risco Emissores & Gotejo</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`font-extrabold uppercase ${
                      currentAnalysis.calculated.emitterCloggingRisk === 'baixo'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : currentAnalysis.calculated.emitterCloggingRisk === 'moderado'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {currentAnalysis.calculated.emitterCloggingRisk}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 block">
                  ISL: {currentAnalysis.calculated.langelierIndex} ({currentAnalysis.calculated.langelierInterpretation})
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* MODO 1: RESOLUÇÃO CONAMA Nº 357/2005 (CLASSES 1, 2 E 3)           */}
          {/* ================================================================= */}
          {interpretationViewMode === 'conama_357' && (
            <div className="space-y-6">
              {/* Legal Framing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Classe 1 */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    conamaEvaluation.suitability.rawVegetables
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">
                        Classe 1 • Águas Doces
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        Hortaliças Cruas & Frutas
                      </h4>
                    </div>
                    {conamaEvaluation.suitability.rawVegetables ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Irrigação de hortaliças que são consumidas cruas e de frutas que se desenvolvam rentes ao solo e que sejam ingeridas cruas sem remoção de película.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Conformidade:</span>
                    <strong
                      className={`font-black ${
                        conamaEvaluation.complianceByClass.classe_1.compliancePercentage >= 90
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {conamaEvaluation.complianceByClass.classe_1.compliancePercentage}% (
                      {conamaEvaluation.complianceByClass.classe_1.compliantCount}/{conamaEvaluation.complianceByClass.classe_1.totalEvaluated})
                    </strong>
                  </div>
                </div>

                {/* Classe 2 */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    conamaEvaluation.suitability.fruitTreesAndParks
                      ? 'bg-cyan-500/5 border-cyan-500/30'
                      : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">
                        Classe 2 • Águas Doces
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        Frutíferas & Áreas Públicas
                      </h4>
                    </div>
                    {conamaEvaluation.suitability.fruitTreesAndParks ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Irrigação de hortaliças, plantas frutíferas e de parques, jardins, campos de esporte e lazer, com os quais o público possa vir a ter contato direto.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Conformidade:</span>
                    <strong
                      className={`font-black ${
                        conamaEvaluation.complianceByClass.classe_2.compliancePercentage >= 90
                          ? 'text-cyan-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {conamaEvaluation.complianceByClass.classe_2.compliancePercentage}% (
                      {conamaEvaluation.complianceByClass.classe_2.compliantCount}/{conamaEvaluation.complianceByClass.classe_2.totalEvaluated})
                    </strong>
                  </div>
                </div>

                {/* Classe 3 */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    conamaEvaluation.suitability.grainsAndForages
                      ? 'bg-indigo-500/5 border-indigo-500/30'
                      : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">
                        Classe 3 • Águas Doces
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        Grãos, Forrageiras & Arbóreas
                      </h4>
                    </div>
                    {conamaEvaluation.suitability.grainsAndForages ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Irrigação de culturas arbóreas, forrageiras para alimentação animal, grãos, cana-de-açúcar e culturas industriais.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Conformidade:</span>
                    <strong
                      className={`font-black ${
                        conamaEvaluation.complianceByClass.classe_3.compliancePercentage >= 90
                          ? 'text-indigo-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {conamaEvaluation.complianceByClass.classe_3.compliancePercentage}% (
                      {conamaEvaluation.complianceByClass.classe_3.compliantCount}/{conamaEvaluation.complianceByClass.classe_3.totalEvaluated})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Critical Deviations Banner if any */}
              {(conamaEvaluation?.criticalDeviations || []).length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Desvios e Restrições Ambientais Identificados para Enquadramento Legal:</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 dark:text-zinc-300 pl-6 list-disc text-[11px]">
                    {conamaEvaluation.criticalDeviations.map((dev, idx) => (
                      <li key={idx}>
                        <strong>{dev.parameter}</strong>: {dev.description} (Valor medido: <strong>{dev.value}</strong> vs Limite: <strong>{dev.limit}</strong>).
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Table of CONAMA 357 Parameters */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-500" />
                      Tabela Comparativa de Parâmetros da Resolução CONAMA nº 357/2005
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Valores Máximos Permitidos (VMP) para corpos hídricos de Água Doce destinados à Irrigação
                    </p>
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Filtrar Categoria:</span>
                    <select
                      value={conamaFilterCategory}
                      onChange={e => setConamaFilterCategory(e.target.value as any)}
                      className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-zinc-200"
                    >
                      <option value="todos">Todas as Categorias</option>
                      <option value="microbiologico">Microbiológico (E. coli, Coliformes)</option>
                      <option value="fisico">Físico-Químico (pH, Turbidez, TDS)</option>
                      <option value="quimico_inorganico">Íons e Nutrientes (N, Cl, SO4, B)</option>
                      <option value="metais_pesados">Metais Pesados (Fe, Mn, Al, Pb, Cd)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-[11px] text-slate-600 dark:text-zinc-400">
                        <th className="py-2.5 px-3 font-bold">Parâmetro Avaliado</th>
                        <th className="py-2.5 px-3 font-bold">Categoria</th>
                        <th className="py-2.5 px-3 font-bold">Valor Medido</th>
                        <th className="py-2.5 px-3 font-bold">VMP Classe 1</th>
                        <th className="py-2.5 px-3 font-bold">VMP Classe 2</th>
                        <th className="py-2.5 px-3 font-bold">VMP Classe 3</th>
                        <th className="py-2.5 px-3 font-bold">Parecer & Exigência Legal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {conamaEvaluation.parameters
                        .filter(p => conamaFilterCategory === 'todos' || p.category === conamaFilterCategory)
                        .map((param) => {
                          const getStatusBadge = (status: 'conforme' | 'atencao' | 'inconforme') => {
                            if (status === 'conforme') {
                              return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">✓ Conf.</span>;
                            }
                            if (status === 'atencao') {
                              return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">⚠️ Atenção</span>;
                            }
                            return <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded">✕ Inconf.</span>;
                          };

                          return (
                            <tr key={param.key} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                {param.parameterName}
                                <span className="text-[10px] text-slate-400 block font-normal">({param.unit})</span>
                              </td>
                              <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-zinc-400 text-[11px]">
                                {param.category.replace('_', ' ')}
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                                {param.measuredValue} <span className="text-[10px] font-normal text-slate-500">{param.unit}</span>
                              </td>
                              <td className="py-2.5 px-3 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <span>{param.class1Limit || '—'}</span>
                                  {param.class1Status && getStatusBadge(param.class1Status)}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <span>{param.class2Limit || '—'}</span>
                                  {param.class2Status && getStatusBadge(param.class2Status)}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <span>{param.class3Limit || '—'}</span>
                                  {param.class3Status && getStatusBadge(param.class3Status)}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-zinc-400 max-w-xs">
                                {param.notes}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODO 2: PADRÃO USO AGRÍCOLA (FAO 29 / AYERS & WESTCOT)            */}
          {/* ================================================================= */}
          {interpretationViewMode === 'agronomico_fao' && (
            <div className="space-y-6">
              {/* 4 Pillars Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Salinidade */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">1. Salinidade</span>
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <strong className="text-base text-slate-900 dark:text-white block font-black">
                    CE: {currentAnalysis.physical.electricalConductivityMicroS} µS/cm
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Sólidos Totais Dissolvidos (STD): <strong>{currentAnalysis.physical.totalDissolvedSolidsMgL} mg/L</strong>. 
                    Potencial osmótico reduz a disponibilidade de água para as raízes da planta.
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[10px] font-bold">
                    <span>Fração de Lixiviação:</span>
                    <span className="text-amber-600">{faoEvaluation.leachingFractionRequired}% requerida</span>
                  </div>
                </div>

                {/* 2. Infiltração */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">2. Infiltração</span>
                    <Droplets className="w-4 h-4 text-cyan-500" />
                  </div>
                  <strong className="text-base text-slate-900 dark:text-white block font-black">
                    RAS: {currentAnalysis.calculated.sar}
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Risco de redução de infiltração na matriz do solo avaliado pelo binômio RAS × Condutividade Elétrica ({currentAnalysis.calculated.infiltrationRisk.replace('_', ' ')}).
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[10px] font-bold">
                    <span>Manejo Físico:</span>
                    <span className="text-cyan-600">Gessagem / Matéria Orgânica</span>
                  </div>
                </div>

                {/* 3. Toxicidade de Íons */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">3. Toxicidade Íons</span>
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                  </div>
                  <strong className="text-base text-slate-900 dark:text-white block font-black">
                    Cl: {currentAnalysis.chemical.chloridesClMgL} | Na: {currentAnalysis.chemical.sodiumNaMgL} mg/L
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Boro: <strong>{currentAnalysis.chemical.boronBMgL || 0} mg/L</strong>. Risco de queima de bordos e necrose foliar, especialmente com irrigação por aspersão nas horas quentes.
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[10px] font-bold">
                    <span>Aspersão Noturna:</span>
                    <span className="text-rose-600">Recomendada</span>
                  </div>
                </div>

                {/* 4. Efeitos Diversos */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">4. Efeitos Diversos</span>
                    <Beaker className="w-4 h-4 text-emerald-500" />
                  </div>
                  <strong className="text-base text-slate-900 dark:text-white block font-black">
                    HCO₃: {currentAnalysis.chemical.bicarbonatesHco3MgL} mg/L
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    pH: <strong>{currentAnalysis.chemical.ph}</strong> | Ferro: <strong>{currentAnalysis.chemical.ironFeMgL || 0} mg/L</strong>.
                    Formação de crostas calcárias e biofilme bacteriano nos labirintos de gotejadores.
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[10px] font-bold">
                    <span>Acidificação Requerida:</span>
                    <span className="text-emerald-600">{acidRequirements.acidDoses.find(a => a.acidName.includes('Fosfórico'))?.volumeMlM3 || 0} mL/m³</span>
                  </div>
                </div>
              </div>

              {/* Detailed FAO 29 Table */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Diretrizes de Interpretação da Qualidade da Água para Irrigação (FAO 29 / Ayers & Westcot)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Classificação dos problemas potenciais da água de irrigação em 3 níveis de restrição de uso
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-[11px] text-slate-600 dark:text-zinc-400">
                        <th className="py-2.5 px-3 font-bold">Problema Potencial de Irrigação</th>
                        <th className="py-2.5 px-3 font-bold">Valor Medido</th>
                        <th className="py-2.5 px-3 font-bold">Nenhuma Restrição</th>
                        <th className="py-2.5 px-3 font-bold">Restrição Moderada</th>
                        <th className="py-2.5 px-3 font-bold">Restrição Severa</th>
                        <th className="py-2.5 px-3 font-bold">Status Atual</th>
                        <th className="py-2.5 px-3 font-bold">Impacto & Medida Mitigadora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {faoEvaluation.parameters.map((param) => {
                        const getRestrictionBadge = (r: 'nenhuma' | 'moderada' | 'severa') => {
                          if (r === 'nenhuma') {
                            return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Sem Restrição</span>;
                          }
                          if (r === 'moderada') {
                            return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">⚠️ Moderada</span>;
                          }
                          return <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">⛔ Severa</span>;
                        };

                        return (
                          <tr key={param.key} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                              {param.parameterName}
                              <span className="text-[10px] text-slate-400 block font-normal">{param.category} ({param.unit})</span>
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                              {param.measuredValue} <span className="text-[10px] font-normal text-slate-500">{param.unit}</span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-zinc-400">
                              {param.noRestrictionRange}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-zinc-400">
                              {param.moderateRestrictionRange}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-zinc-400">
                              {param.severeRestrictionRange}
                            </td>
                            <td className="py-2.5 px-3">
                              {getRestrictionBadge(param.currentRestriction)}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-zinc-400 max-w-xs">
                              {param.agronomicImpact}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Agronomic Recommendations Box */}
              <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Diretrizes Agronômicas & Manejo Recomendado para esta Amostra
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-zinc-300">
                  <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                    <strong className="text-slate-900 dark:text-white block mb-1">Manejo de Irrigação & Lixiviação:</strong>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Aplicar fração de lixiviação mínima de <strong>{faoEvaluation.leachingFractionRequired}%</strong> sobre a lâmina de evapotranspiração para evitar acúmulo de sais na rizosfera. Em solos pesados, realizar irrigações mais frequentes com lâminas menores.
                    </p>
                  </div>

                  <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                    <strong className="text-slate-900 dark:text-white block mb-1">Proteção do Sistema de Gotejamento:</strong>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {(currentAnalysis.chemical.bicarbonatesHco3MgL ?? 0) > 120
                        ? `Bicarbonatos elevados (${currentAnalysis.chemical.bicarbonatesHco3MgL} mg/L). Manter injeção contínua ou periódica de ácido fosfórico ou nítrico para tamponar o pH da calda entre 5,5 e 6,2 e evitar incrustações de CaCO3.`
                        : 'Bicarbonatos em níveis moderados. Monitorar a retrolavagem dos filtros de disco/areia quinzenalmente.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODO 3: CALCULADORA DE FERTIRRIGAÇÃO (APORTE & ACIDIFICAÇÃO)       */}
          {/* ================================================================= */}
          {interpretationViewMode === 'calculadora_fertirrigacao' && (
            <div className="space-y-6">
              {/* Lamina Slider & Simulation Control */}
              <div className="p-5 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border border-amber-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-amber-500" />
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Simulador de Aporte Nutricional Carreado pela Água de Irrigação
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                    A água de irrigação carrega nutrientes solúveis gratuitos (Ca, Mg, K, N, S). Descontar esses aportes reduz os custos da adubação comercial e evita desbalanços na nutrição foliar.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">Lâmina Acumulada</span>
                    <strong className="text-sm text-cyan-600 dark:text-cyan-400">{fertigationLaminaMm} mm ({fertigationLaminaMm * 10} m³/ha)</strong>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="600"
                    step="10"
                    value={fertigationLaminaMm}
                    onChange={e => setFertigationLaminaMm(Number(e.target.value))}
                    className="w-32 accent-cyan-600"
                  />
                  <div className="flex gap-1">
                    {[50, 100, 200, 300].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFertigationLaminaMm(val)}
                        className={`px-2 py-1 text-[10px] font-bold rounded ${
                          fertigationLaminaMm === val
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {val}mm
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutrients Credit Table */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Créditos de Nutrientes Solúveis Fornecidos pela Água
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Cálculo estequiométrico baseado na concentração analítica da amostra e na lâmina de {fertigationLaminaMm} mm
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-[11px] text-slate-600 dark:text-zinc-400">
                        <th className="py-2.5 px-3 font-bold">Nutriente Carreado</th>
                        <th className="py-2.5 px-3 font-bold">Concentração na Água</th>
                        <th className="py-2.5 px-3 font-bold">Aporte por 1.000 m³</th>
                        <th className="py-2.5 px-3 font-bold">Aporte Total na Lâmina ({fertigationLaminaMm} mm)</th>
                        <th className="py-2.5 px-3 font-bold">Fertilizante Comercial Equivalente Economizado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {fertigationCredits.map((credit, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {credit.nutrientName} ({credit.element})
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                            <strong>{credit.concentrationMgL}</strong> mg/L
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                            {credit.kgPer1000m3} kg/1.000 m³
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                            {credit.kgPerHectareAtLamina} kg/ha
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-zinc-200">
                            {credit.commercialFertilizerEquivalent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Acidification & Bicarbonate Neutralization Calculator */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                      Calculadora de Acidificação da Água & Neutralização de Bicarbonatos (HCO₃⁻)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Determina a injeção exata de ácidos para rebaixar o pH para a faixa ideal (5,5 – 6,2) e neutralizar o excesso de bicarbonatos
                    </p>
                  </div>

                  {/* Target Residual HCO3 Setting */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 p-2 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-slate-500">HCO₃⁻ Alvo Residual:</span>
                    <input
                      type="number"
                      min="10"
                      max="80"
                      step="5"
                      value={fertigationTargetResidualHco3}
                      onChange={e => setFertigationTargetResidualHco3(Number(e.target.value))}
                      className="w-16 bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 rounded px-2 py-1 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                    <span className="text-[10px] text-slate-400">mg/L</span>
                  </div>
                </div>

                {/* Acid Neutralization Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Bicarbonatos Atuais</span>
                    <strong className="text-base text-slate-900 dark:text-white block font-black">
                      {acidRequirements.currentHco3MgL} mg/L ({acidRequirements.currentHco3MeqL} meq/L)
                    </strong>
                    <span className="text-[10px] text-slate-500 block">pH inicial: {acidRequirements.currentPh}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black">HCO₃⁻ a Neutralizar</span>
                    <strong className="text-base text-amber-600 dark:text-amber-400 block font-black">
                      {acidRequirements.hco3ToNeutralizeMgL} mg/L ({acidRequirements.hco3ToNeutralizeMeqL} meq/L)
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Margem de segurança mantida: {acidRequirements.targetResidualHco3MgL} mg/L</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black">pH Final Estimado na Calda</span>
                    <strong className="text-base text-emerald-600 dark:text-emerald-400 block font-black">
                      {acidRequirements.estimatedFinalPh}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Faixa ideal para fertirrigação: 5,5 a 6,2</span>
                  </div>
                </div>

                {/* Acid Options Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-[11px] text-slate-600 dark:text-zinc-400">
                        <th className="py-2.5 px-3 font-bold">Opção de Ácido Comercial</th>
                        <th className="py-2.5 px-3 font-bold">Fórmula & Pureza</th>
                        <th className="py-2.5 px-3 font-bold">Injeção por m³ de Água</th>
                        <th className="py-2.5 px-3 font-bold">Volume por 100 m³</th>
                        <th className="py-2.5 px-3 font-bold">Aporte de Nutrientes Secundários</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {acidRequirements.acidDoses.map((acid, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {acid.acidName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                            {acid.formula} ({acid.purityPercentage}%)
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-cyan-600 dark:text-cyan-400 text-sm">
                            {acid.volumeMlM3} mL/m³
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-zinc-200">
                            {acid.volumeLPer100m3} Litros
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                            +{acid.nutrientAddedValue} g/m³ de {acid.nutrientAddedType}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-slate-700 dark:text-zinc-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Regra de Segurança Química:</strong> Sempre adicione o <strong>ácido sobre a água</strong> (nunca a água sobre o ácido concentrado) no tanque de injeção C para evitar reações exotérmicas violentas e projeção de vapores.
                  </span>
                </div>
              </div>

              {/* Chemical Compatibility & Tank Separation */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-500" />
                    Diagnóstico de Compatibilidade Química & Separação de Tanques A, B e C
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Evite entupimento maciço de emissores por precipitados insolúveis de sulfato de cálcio (gesso) e fosfato dicálcico
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tanque A */}
                  <div className="p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        TANQUE A (Cálcio & Ferro)
                      </strong>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                        Sem Fosfatos / Sulfatos
                      </span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1 pl-4 list-disc text-[11px]">
                      <li>Nitrato de Cálcio</li>
                      <li>Cloreto de Cálcio</li>
                      <li>Nitrato de Potássio (fração)</li>
                      <li>Quelatos de Ferro (Fe-EDDHA / Fe-DTPA)</li>
                    </ul>
                  </div>

                  {/* Tanque B */}
                  <div className="p-4 rounded-2xl border bg-cyan-500/5 border-cyan-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="font-black text-cyan-700 dark:text-cyan-400 text-sm">
                        TANQUE B (Fósforo, Magnésio & Sulfatos)
                      </strong>
                      <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 px-2 py-0.5 rounded">
                        Sem Cálcio Livre
                      </span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1 pl-4 list-disc text-[11px]">
                      <li>MAP Purificado / MKP</li>
                      <li>Sulfato de Magnésio / Sulfato de Potássio</li>
                      <li>Nitrato de Magnésio</li>
                      <li>Micronutrientes (Boro, Zn, Mn, Cu, Mo)</li>
                    </ul>
                  </div>

                  {/* Tanque C */}
                  <div className="p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="font-black text-amber-700 dark:text-amber-400 text-sm">
                        TANQUE C (Acidificação)
                      </strong>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                        pH & Limpeza
                      </span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1 pl-4 list-disc text-[11px]">
                      <li>Ácido Fosfórico 85%</li>
                      <li>Ácido Nítrico 58%</li>
                      <li>Ácido Sulfúrico 98% (se necessário)</li>
                      <li>Agentes de limpeza / Peróxido de Hidrogênio</li>
                    </ul>
                  </div>
                </div>

                {/* Compatibility Alerts if any */}
                {fertigationAlerts.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {fertigationAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          alert.severity === 'alto'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block">{alert.title}</strong>
                          <span className="text-[11px] leading-relaxed block">{alert.description}</span>
                          <span className="text-[10px] font-semibold mt-1 block">Recomendação: {alert.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODO 4: DIAGRAMA USSL RIVERSIDE (SALINIDADE X SODICIDADE)         */}
          {/* ================================================================= */}
          {interpretationViewMode === 'diagrama_riverside' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    Classificação pelo Diagrama de Riverside (US Salinity Laboratory - USSL)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Mapeamento bidimensional do Risco de Salinização (C1 a C4) × Risco de Sodificação e Dispersão de Argilas (S1 a S4)
                  </p>
                </div>

                {/* USSL Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { code: 'C1', title: 'Baixa Salinidade (< 250 µS/cm)', desc: 'Água segura para irrigação na maioria dos solos e culturas sem risco de salinização.' },
                    { code: 'C2', title: 'Média Salinidade (250 - 750 µS/cm)', desc: 'Pode ser usada com lixiviação moderada e culturas com tolerância média a sais.' },
                    { code: 'C3', title: 'Alta Salinidade (750 - 2250 µS/cm)', desc: 'Exige drenagem eficiente, lavagem periódica de sais e culturas tolerantes.' },
                    { code: 'C4', title: 'Muito Alta Salinidade (> 2250 µS/cm)', desc: 'Inadequada para irrigação sob condições normais; exige manejo altamente especializado.' },
                  ].map(sal => {
                    const isCurrentSalinity = currentAnalysis.calculated.salinityClass === sal.code;
                    return (
                      <div
                        key={sal.code}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrentSalinity
                            ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                            : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-black text-slate-900 dark:text-white">
                            Classe {sal.code}
                          </strong>
                          {isCurrentSalinity && (
                            <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                              Sua Amostra
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 block mt-0.5">{sal.title}</span>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{sal.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Sodicidade Classes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { code: 'S1', title: 'Baixo Sódio (RAS < 10)', desc: 'Pode ser usada na quase totalidade dos solos sem risco de impermeabilização.' },
                    { code: 'S2', title: 'Médio Sódio (RAS 10 - 18)', desc: 'Risco moderado em solos de textura argilosa fina. Recomendado aplicar gesso.' },
                    { code: 'S3', title: 'Alto Sódio (RAS 18 - 26)', desc: 'Provoca dispersão de argilas e formação de crostas superficiais. Exige gessagem constante.' },
                    { code: 'S4', title: 'Muito Alto Sódio (RAS > 26)', desc: 'Geralmente inadequada para irrigação devido à degradação severa da permeabilidade.' },
                  ].map(sod => {
                    const isCurrentSodicity = currentAnalysis.calculated.sodicityClass === sod.code;
                    return (
                      <div
                        key={sod.code}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrentSodicity
                            ? 'bg-cyan-500/15 border-cyan-500 ring-2 ring-cyan-500/30'
                            : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-black text-slate-900 dark:text-white">
                            Classe {sod.code}
                          </strong>
                          {isCurrentSodicity && (
                            <span className="bg-cyan-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                              Sua Amostra
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 block mt-0.5">{sod.title}</span>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{sod.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Synthesis Box */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Parecer USSL Riverside: Amostra Classe {currentAnalysis.calculated.salinityClass}-{currentAnalysis.calculated.sodicityClass}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      CSR: <strong>{currentAnalysis.calculated.rscMeqL} meq/L</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                    A água em análise possui Condutividade Elétrica de <strong>{currentAnalysis.physical.electricalConductivityMicroS} µS/cm</strong> e Relação de Adsorção de Sódio (RAS) de <strong>{currentAnalysis.calculated.sar}</strong>.
                    {currentAnalysis.calculated.salinityClass === 'C1' && currentAnalysis.calculated.sodicityClass === 'S1'
                      ? ' Trata-se de uma água de excelente qualidade agronômica (C1-S1), permitindo fertirrigação contínua de hortaliças e frutíferas sem risco de acúmulo salino.'
                      : currentAnalysis.calculated.salinityClass === 'C2'
                      ? ' Apresenta salinidade moderada (C2), sendo recomendado monitoramento semestral da condutividade do extrato de saturação do solo e uso de fração de lixiviação.'
                      : ' Requer manejo rigoroso de sais e controle estrito da concentração de fertilizantes injetados.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ASSISTENTE DE CORREÇÃO DA ÁGUA (O GRANDE DIFERENCIAL)   */}
      {/* ========================================================= */}
      {activeSubTab === 'assistente_correcao' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Módulo Exclusivo
                  </span>
                  <span className="text-xs text-slate-400 font-bold">• Plano de Tratamento e Manejo</span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                  Assistente de Correção e Tratamento da Água
                </h3>
              </div>

              <span
                className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                  currentAnalysis.correctionPlan.riskLevel === 'critico'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : currentAnalysis.correctionPlan.riskLevel === 'alto'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                Nível de Risco: {currentAnalysis.correctionPlan.riskLevel}
              </span>
            </div>

            {/* Diagnosed Problems & Expected Impacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
                <strong className="font-bold text-rose-900 dark:text-rose-300 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Problemas Técnicos Diagnosticados:
                </strong>
                <ul className="space-y-1 text-slate-700 dark:text-zinc-300 text-[11px]">
                  {currentAnalysis.correctionPlan.diagnosedProblems.map((prob, i) => (
                    <li key={i}>• {prob}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
                <strong className="font-bold text-amber-900 dark:text-amber-300 block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Impactos Esperados na Produção e Equipamentos:
                </strong>
                <ul className="space-y-1 text-slate-700 dark:text-zinc-300 text-[11px]">
                  {currentAnalysis.correctionPlan.expectedImpacts.map((imp, i) => (
                    <li key={i}>• {imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prescribed Technologies */}
            <div className="space-y-3">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                Tecnologias de Tratamento Recomendadas:
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentAnalysis.correctionPlan.treatmentRecommendations.map((t, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border space-y-1.5">
                    <div className="flex justify-between items-start">
                      <strong className="font-bold text-slate-900 dark:text-white">{t.technology}</strong>
                      {t.dosageOrSpec && (
                        <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          {t.dosageOrSpec}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SIMULADOR ANTES VS DEPOIS */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-cyan-50/50 dark:from-zinc-900 dark:to-cyan-950/20 border border-cyan-200 dark:border-cyan-900 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  Simulação Comparativa: Água Bruta vs. Água Após Tratamento Proposto
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">pH da Água</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-slate-500 line-through">{currentAnalysis.chemical.ph}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-600" />
                    <strong className="text-emerald-600 font-bold">{currentAnalysis.correctionPlan.simulatedAfterTreatment.expectedPh}</strong>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Bicarbonatos (mg/L)</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-slate-500 line-through">{currentAnalysis.chemical.bicarbonatesHco3MgL}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-600" />
                    <strong className="text-emerald-600 font-bold">{currentAnalysis.correctionPlan.simulatedAfterTreatment.expectedBicarbonates}</strong>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">E. coli (NMP)</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-slate-500 line-through">{currentAnalysis.biological.escherichiaColiNmp100ml}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-600" />
                    <strong className="text-emerald-600 font-bold">0 NMP (100% Inativo)</strong>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-black rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">Índice Geral (IGA)</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-slate-500 line-through">{currentAnalysis.calculated.igaScore}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-600" />
                    <strong className="text-emerald-600 font-black text-sm">{currentAnalysis.correctionPlan.simulatedAfterTreatment.expectedIgaScore}/100</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. PONTOS DE COLETA & CAPTAÇÃO                             */}
      {/* ========================================================= */}
      {activeSubTab === 'pontos_coleta' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-5">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  Pontos de Coleta & Captação Hídrica
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Gerenciamento e alteração de dados dos mananciais, coordenadas GPS, altitude e histórico de amostras.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCreatePointModal}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Novo Ponto de Coleta
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar ponto por nome, código, fazenda ou observações..."
                  value={searchPointQuery}
                  onChange={e => setSearchPointQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 font-medium"
                />
              </div>

              <div className="sm:w-64">
                <select
                  value={selectedPointTypeFilter}
                  onChange={e => setSelectedPointTypeFilter(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium"
                >
                  <option value="todos">Todos os Tipos de Manancial</option>
                  <option value="poco_artesiano">Poço Artesiano</option>
                  <option value="poco_semiartesiano">Poço Semi-Artesiano</option>
                  <option value="rio">Rio / Córrego</option>
                  <option value="represa">Represa</option>
                  <option value="acude">Açude</option>
                  <option value="nascente">Nascente / Mina</option>
                  <option value="lago">Lago / Lagoa</option>
                  <option value="reservatorio">Reservatório / Tanque</option>
                  <option value="canal_irrigacao">Canal de Irrigação</option>
                  <option value="cisterna">Cisterna / Pluvial</option>
                  <option value="rede_publica">Rede Pública</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Count summary banner */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
              <span>
                Exibindo <strong>{filteredCollectionPoints.length}</strong> de <strong>{collectionPoints.length}</strong> pontos de captação
              </span>
              {searchPointQuery || selectedPointTypeFilter !== 'todos' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPointQuery('');
                    setSelectedPointTypeFilter('todos');
                  }}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold text-xs"
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>

            {/* Points Grid */}
            {filteredCollectionPoints.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900 border border-dashed rounded-2xl space-y-3">
                <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-zinc-300 text-sm">
                  Nenhum ponto de coleta encontrado
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tente alterar seus termos de busca ou cadastre um novo ponto de captação hídrica para a propriedade.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreatePointModal}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Ponto Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCollectionPoints.map(p => {
                  const typeInfo = COLLECTION_POINT_TYPE_LABELS[p.type] || COLLECTION_POINT_TYPE_LABELS.outro;
                  const pointAnalyses = analyses.filter(a => a.collectionPointId === p.id);

                  return (
                    <div
                      key={p.id}
                      className="p-5 bg-slate-50/70 dark:bg-zinc-900/90 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 hover:border-cyan-400/60 dark:hover:border-cyan-600/60 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-black text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-900">
                                {p.code}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <h4 className="font-black text-base text-slate-900 dark:text-white mt-1.5 leading-snug">
                              {p.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPointModal(p)}
                              title="Alterar dados do ponto de coleta"
                              className="p-2 text-slate-600 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:shadow-xs transition-all cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePoint(p.id)}
                              title="Excluir ponto de coleta"
                              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:shadow-xs transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Information */}
                        <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400 bg-white dark:bg-black p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Propriedade: <strong className="text-slate-800 dark:text-zinc-200">{p.propertyName}</strong></span>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-zinc-900">
                            <div className="flex items-center gap-2">
                              <Compass className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 font-semibold">
                                {p.latitude}, {p.longitude}
                              </span>
                              <span className="text-[11px] text-slate-400">({p.altitudeMeters}m alt)</span>
                            </div>

                            <a
                              href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Ver no Mapa
                            </a>
                          </div>

                          {p.notes && (
                            <div className="pt-2 border-t border-slate-100 dark:border-zinc-900">
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                                "{p.notes}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-cyan-600" />
                          {pointAnalyses.length} análise(s) vinculada(s)
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPointModal(p)}
                            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-cyan-500 text-slate-700 dark:text-zinc-200 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-cyan-600" />
                            Alterar Dados
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateAnalysisForPoint(p.id)}
                            className="px-3 py-1.5 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Nova Amostra
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. BANCO DE CULTURAS & TOLERÂNCIA                         */}
      {/* ========================================================= */}
      {activeSubTab === 'banco_culturas' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner & Summary Stats */}
          <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-cyan-900/90 text-white rounded-2xl p-6 shadow-md border border-emerald-700/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-200">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Banco Agronômico Integrado • 253 Culturas Cadastradas</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">
                  Tolerância à Salinidade, Boro e Sódio
                </h3>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Modelagem matemática baseada nas diretrizes FAO 29 (Ayers & Westcot), equação linear de Maas & Hoffman (1977) e publicações técnicas da Embrapa / IAC para todas as 253 culturas do ecossistema AgroNutri.
                </p>
              </div>

              {/* Simulation Quick Control */}
              <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3 min-w-[280px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-300" />
                    Simulador de CE da Água
                  </span>
                  <button
                    type="button"
                    onClick={() => setCropSimulatedEc(Math.round((currentAnalysis.physical.electricalConductivityMicroS / 1000) * 100) / 100)}
                    className="text-[10px] text-cyan-300 hover:text-white underline font-semibold cursor-pointer"
                  >
                    Usar Amostra ({Math.round((currentAnalysis.physical.electricalConductivityMicroS / 1000) * 100) / 100} dS/m)
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.2"
                    max="8.0"
                    step="0.1"
                    value={cropSimulatedEc}
                    onChange={e => setCropSimulatedEc(parseFloat(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-sm font-black font-mono text-cyan-300 bg-white/10 px-2 py-0.5 rounded-md min-w-[70px] text-center">
                    {cropSimulatedEc.toFixed(1)} dS/m
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/70">
                  {cropSimulatedEc <= 0.7
                    ? 'Água de excelente qualidade osmótica (sem restrições gerais).'
                    : cropSimulatedEc <= 3.0
                    ? 'Salinidade moderada: culturas sensíveis sofrem perdas graduais.'
                    : 'Salinidade severa: recomendada apenas para culturas tolerantes.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6 pt-5 border-t border-white/10 text-xs">
              <div className="bg-white/5 p-2.5 rounded-lg">
                <span className="text-[10px] text-emerald-200/80 block font-bold">Total no Sistema</span>
                <span className="text-lg font-black text-white">{CROP_SALINITY_DATABASE.length} culturas</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg">
                <span className="text-[10px] text-emerald-300 block font-bold">Tolerantes</span>
                <span className="text-lg font-black text-emerald-300">
                  {CROP_SALINITY_DATABASE.filter(c => c.sensitivityRating === 'tolerante').length}
                </span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg">
                <span className="text-[10px] text-teal-300 block font-bold">Mod. Tolerantes</span>
                <span className="text-lg font-black text-teal-300">
                  {CROP_SALINITY_DATABASE.filter(c => c.sensitivityRating === 'moderadamente_tolerante').length}
                </span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg">
                <span className="text-[10px] text-amber-300 block font-bold">Mod. Sensíveis</span>
                <span className="text-lg font-black text-amber-300">
                  {CROP_SALINITY_DATABASE.filter(c => c.sensitivityRating === 'moderadamente_sensivel').length}
                </span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg">
                <span className="text-[10px] text-rose-300 block font-bold">Sensíveis</span>
                <span className="text-lg font-black text-rose-300">
                  {CROP_SALINITY_DATABASE.filter(c => c.sensitivityRating === 'sensivel').length}
                </span>
              </div>
            </div>
          </div>

          {/* Main Filter & Explorer Card */}
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-5">
            {/* Search Input & Category Pills */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar cultura por nome comum, nome científico (ex: Glycine max, Zea mays, Persea americana) ou manejo..."
                    value={searchCropQuery}
                    onChange={e => setSearchCropQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  {searchCropQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchCropQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                    Exibindo <strong>{filteredCrops.length}</strong> de <strong>{CROP_SALINITY_DATABASE.length}</strong>
                  </span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  { id: 'todas', label: 'Todas as Categorias' },
                  { id: 'graos', label: 'Grãos & Cereais' },
                  { id: 'hortalicas', label: 'Hortaliças & Raízes' },
                  { id: 'frutiferas', label: 'Frutíferas' },
                  { id: 'pastagens', label: 'Pastagens & Forragens' },
                  { id: 'industriais', label: 'Culturas Industriais' },
                  { id: 'florestais', label: 'Florestais & Madeiras' },
                  { id: 'medicinais', label: 'Medicinais & Aromáticas' },
                  { id: 'ornamentais', label: 'Ornamentais & Paisagismo' },
                ].map(cat => {
                  const isSelected = selectedCropCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCropCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Sensitivity Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Sensibilidade:</span>
                {[
                  { id: 'todas', label: 'Todas as Sensibilidades' },
                  { id: 'tolerante', label: 'Tolerante (CE ≥ 4.0)', color: 'emerald' },
                  { id: 'moderadamente_tolerante', label: 'Mod. Tolerante (CE 2.5 - 4.0)', color: 'teal' },
                  { id: 'moderadamente_sensivel', label: 'Mod. Sensível (CE 1.4 - 2.5)', color: 'amber' },
                  { id: 'sensivel', label: 'Sensível (CE ≤ 1.3)', color: 'rose' },
                ].map(sens => {
                  const isSelected = selectedCropSensitivityFilter === sens.id;
                  return (
                    <button
                      key={sens.id}
                      type="button"
                      onClick={() => setSelectedCropSensitivityFilter(sens.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
                      }`}
                    >
                      {sens.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Table */}
            {filteredCrops.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 space-y-2">
                <Sprout className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Nenhuma cultura encontrada</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tente alterar os termos de busca ou remover os filtros de categoria e sensibilidade.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchCropQuery('');
                    setSelectedCropCategoryFilter('todas');
                    setSelectedCropSensitivityFilter('todas');
                  }}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-lg mt-2 cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Cultura / Nome Científico</th>
                      <th className="py-3 px-3">Categoria</th>
                      <th className="py-3 px-3">Sensibilidade Salina</th>
                      <th className="py-3 px-3 text-center">Limiar CE (dS/m)</th>
                      <th className="py-3 px-3 text-center">Perda (% por dS/m)</th>
                      <th className="py-3 px-3 text-center">Perda Estimada ({cropSimulatedEc} dS/m)</th>
                      <th className="py-3 px-3 text-center">Máx. Boro (mg/L)</th>
                      <th className="py-3 px-3 text-center">Tol. Sódio</th>
                      <th className="py-3 px-4">Manejo Agronômico & Diretrizes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 bg-white dark:bg-black">
                    {filteredCrops.map((c, i) => {
                      // Maas & Hoffman Yield Loss calculation: Perda (%) = max(0, (CE - Limiar) * PerdaPorDsM)
                      const diffEc = Math.max(0, cropSimulatedEc - c.thresholdEcDeciSiemensM);
                      const estimatedYieldLoss = Math.min(100, Math.round(diffEc * c.yieldLossPercentPerUnitEc * 10) / 10);
                      const relativeYield = Math.max(0, 100 - estimatedYieldLoss);

                      const sensBadgeClasses: Record<string, string> = {
                        tolerante: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                        moderadamente_tolerante: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
                        moderadamente_sensivel: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                        sensivel: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                      };

                      const sodiumBadgeClasses: Record<string, string> = {
                        alta: 'text-emerald-600 dark:text-emerald-400 font-bold',
                        moderada: 'text-amber-600 dark:text-amber-400 font-bold',
                        baixa: 'text-rose-600 dark:text-rose-400 font-bold',
                      };

                      return (
                        <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                          {/* Crop Name & Sci Name */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-[13px]">
                              {c.cropName}
                            </div>
                            {c.scientificName && (
                              <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 italic">
                                {c.scientificName}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400 capitalize bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              {c.category}
                            </span>
                          </td>

                          {/* Sensitivity */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${sensBadgeClasses[c.sensitivityRating] || ''}`}>
                              {c.sensitivityRating.replace(/_/g, ' ')}
                            </span>
                          </td>

                          {/* Threshold CE */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="font-mono font-black text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-900">
                              {c.thresholdEcDeciSiemensM.toFixed(1)} dS/m
                            </span>
                          </td>

                          {/* Yield Loss Slope */}
                          <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-bold text-rose-600 dark:text-rose-400">
                            {c.yieldLossPercentPerUnitEc.toFixed(1)}%
                          </td>

                          {/* Simulated Yield Loss for Selected EC */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {estimatedYieldLoss === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                                <CheckCircle2 className="w-3 h-3" />
                                100% (Sem perda)
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className={`inline-block text-[11px] font-black font-mono px-2 py-0.5 rounded-md border ${
                                  estimatedYieldLoss < 15
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                                }`}>
                                  -{estimatedYieldLoss}% ({relativeYield}% prod.)
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Max Boron */}
                          <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-semibold text-slate-700 dark:text-zinc-300">
                            {c.maxBoronMgL.toFixed(2)} mg/L
                          </td>

                          {/* Sodium Tolerance */}
                          <td className="py-3 px-3 text-center whitespace-nowrap text-[11px]">
                            <span className={`capitalize ${sodiumBadgeClasses[c.sodiumToleranceRating] || ''}`}>
                              {c.sodiumToleranceRating}
                            </span>
                          </td>

                          {/* Recommendations */}
                          <td className="py-3 px-4 max-w-sm">
                            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">
                              {c.specialRecommendations}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. LAUDO OFICIAL DE QUALIDADE DA ÁGUA                     */}
      {/* ========================================================= */}
      {activeSubTab === 'laudo_oficial' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header of Report */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-zinc-800 pb-5 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider">
                  Documento Técnico Oficial • AquaAgro Pro
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Laudo de Análise e Qualidade da Água
                </h3>
                <span className="text-xs text-slate-500 font-mono">Código da Amostra: {currentAnalysis.sampleCode}</span>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Laudo Oficial
              </button>
            </div>

            {/* Client & Collection Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Cliente / Produtor</span>
                <strong className="text-slate-900 dark:text-white">{currentAnalysis.clientName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Propriedade / Fazenda</span>
                <strong className="text-slate-900 dark:text-white">{currentAnalysis.propertyName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Ponto de Coleta</span>
                <strong className="text-slate-900 dark:text-white">{currentPoint.name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Responsável Técnico</span>
                <strong className="text-slate-900 dark:text-white">{currentAnalysis.responsibleTechnician}</strong>
                <span className="text-[10px] text-slate-500 block">{currentAnalysis.creaCrq}</span>
              </div>
            </div>

            {/* Results Table */}
            <div className="space-y-2">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                Resultados Laboratoriais e Índices Calculados:
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">pH (25°C)</span>
                  <strong className="text-sm">{currentAnalysis.chemical.ph}</strong>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Condutividade Elétrica</span>
                  <strong className="text-sm">{currentAnalysis.physical.electricalConductivityMicroS} µS/cm</strong>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">RAS / SAR</span>
                  <strong className="text-sm">{currentAnalysis.calculated.sar}</strong>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Índice Geral IGA</span>
                  <strong className="text-sm text-cyan-600 font-black">{currentAnalysis.calculated.igaScore}/100 ({currentAnalysis.calculated.igaClassification})</strong>
                </div>
              </div>
            </div>

            {/* Technical Conclusion */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border space-y-2 text-xs">
              <strong className="font-bold text-slate-900 dark:text-white block">
                Parecer Técnico & Diretrizes de Manejo:
              </strong>
              <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                {currentAnalysis.technicalNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVA ANÁLISE OU EDIÇÃO DE ANÁLISE                  */}
      {/* ========================================================= */}
      {isNewAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400">
                  {editingAnalysisId ? <Pencil className="w-5 h-5" /> : <FlaskConical className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {editingAnalysisId ? 'Editar Análise Laboratorial' : 'Cadastrar Nova Análise de Água'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {editingAnalysisId
                      ? `Editando laudo ${formSampleCode} • Recálculo automático de IGA e USSL`
                      : 'Insira os parâmetros laboratoriais para cálculo automático de IGA, SAR e manejo'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAnalysisModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-tabs */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalTab('geral')}
                className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                  modalTab === 'geral'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                1. Identificação & Coleta
              </button>
              <button
                type="button"
                onClick={() => setModalTab('fisicoquimica')}
                className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                  modalTab === 'fisicoquimica'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                2. Físico-Química (Cátions/Ânions)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('micro_obs')}
                className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                  modalTab === 'micro_obs'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                3. Microbio & Observações
              </button>
            </div>

            {/* Form Body */}
            <div className="text-xs max-h-[60vh] overflow-y-auto pr-1 space-y-4">
              {/* TAB 1: IDENTIFICAÇÃO */}
              {modalTab === 'geral' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Código do Laudo / Amostra:</label>
                      <input
                        type="text"
                        value={formSampleCode}
                        onChange={e => setFormSampleCode(e.target.value)}
                        placeholder="Ex: AGUA-2026-001"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Ponto de Coleta:</label>
                      <select
                        value={formPointId}
                        onChange={e => setFormPointId(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold"
                      >
                        {collectionPoints.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Propriedade / Fazenda:</label>
                      <input
                        type="text"
                        value={formPropertyName}
                        onChange={e => setFormPropertyName(e.target.value)}
                        placeholder="Nome da fazenda"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Cliente / Solicitante:</label>
                      <input
                        type="text"
                        value={formClientName}
                        onChange={e => setFormClientName(e.target.value)}
                        placeholder="Nome do produtor ou empresa"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Data da Coleta:</label>
                      <input
                        type="date"
                        value={formCollectionDate}
                        onChange={e => setFormCollectionDate(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Responsável Técnico:</label>
                      <input
                        type="text"
                        value={formResponsibleTechnician}
                        onChange={e => setFormResponsibleTechnician(e.target.value)}
                        placeholder="Eng. Agrônomo / Químico"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Registro CREA / CRQ:</label>
                      <input
                        type="text"
                        value={formCreaCrq}
                        onChange={e => setFormCreaCrq(e.target.value)}
                        placeholder="Ex: CREA-SP 506921/D"
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Padrão de Referência:</label>
                      <select
                        value={formReferenceStandard}
                        onChange={e => setFormReferenceStandard(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold"
                      >
                        <option value="FAO_29">FAO 29 (Qualidade Agrícola / Irrigação)</option>
                        <option value="MS_888">Portaria GM/MS nº 888 (Potabilidade)</option>
                        <option value="CONAMA_357">CONAMA 357 (Classe 1/2 Águas Doces)</option>
                        <option value="HIDROPONIA_PRO">Padrão Hidroponia & Fertirrigação</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700 dark:text-zinc-300 block">Finalidades de Uso:</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'irrigacao', label: 'Irrigação' },
                        { id: 'fertirrigacao', label: 'Fertirrigação' },
                        { id: 'hidroponia', label: 'Hidroponia' },
                        { id: 'pulverizacao', label: 'Calda / Pulverização' },
                        { id: 'consumo_humano', label: 'Consumo Humano' },
                      ].map(item => {
                        const active = formPurposes.includes(item.id as WaterPurpose);
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => {
                              if (active) {
                                if (formPurposes.length > 1) {
                                  setFormPurposes(formPurposes.filter(p => p !== item.id));
                                }
                              } else {
                                setFormPurposes([...formPurposes, item.id as WaterPurpose]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              active
                                ? 'bg-cyan-600 text-white border-cyan-600'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FÍSICO-QUÍMICA */}
              {modalTab === 'fisicoquimica' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-cyan-50/50 dark:bg-cyan-950/20 p-3 rounded-xl border border-cyan-200/50 dark:border-cyan-800/30 text-[11px] text-cyan-800 dark:text-cyan-300">
                    💡 Os índices de <strong>Salinidade (USSL)</strong>, <strong>Sodicidade (RAS/SAR)</strong>, <strong>Dureza</strong>, <strong>CSR</strong> e <strong>IGA</strong> são recalculados automaticamente ao salvar.
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">pH (25°C):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formPh}
                        onChange={e => setFormPh(parseFloat(e.target.value) || 7)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">CE (µS/cm):</label>
                      <input
                        type="number"
                        step="10"
                        value={formCe}
                        onChange={e => setFormCe(parseFloat(e.target.value) || 200)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Turbidez (NTU):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formTurbidity}
                        onChange={e => setFormTurbidity(parseFloat(e.target.value) || 2)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2">Cátions Principais (mg/L):</span>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-600 dark:text-zinc-400">Cálcio Ca²⁺:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formCalcium}
                          onChange={e => setFormCalcium(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-600 dark:text-zinc-400">Magnésio Mg²⁺:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formMagnesium}
                          onChange={e => setFormMagnesium(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-600 dark:text-zinc-400">Sódio Na⁺:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formSodium}
                          onChange={e => setFormSodium(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-600 dark:text-zinc-400">Potássio K⁺:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formPotassium}
                          onChange={e => setFormPotassium(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2">Ânions Principais (mg/L):</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-600 dark:text-zinc-400">Bicarbonatos HCO₃⁻:</label>
                        <input
                          type="number"
                          step="1"
                          value={formBicarbonates}
                          onChange={e => setFormBicarbonates(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-600 dark:text-zinc-400">Cloretos Cl⁻:</label>
                        <input
                          type="number"
                          step="0.5"
                          value={formChlorides}
                          onChange={e => setFormChlorides(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-600 dark:text-zinc-400">Sulfatos SO₄²⁻:</label>
                        <input
                          type="number"
                          step="0.5"
                          value={formSulfates}
                          onChange={e => setFormSulfates(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MICROBIO & OBSERVAÇÕES */}
              {modalTab === 'micro_obs' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Ferro Fe (mg/L):</label>
                      <input
                        type="number"
                        step="0.05"
                        value={formIron}
                        onChange={e => setFormIron(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Manganês Mn (mg/L):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formManganese}
                        onChange={e => setFormManganese(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Boro B (mg/L):</label>
                      <input
                        type="number"
                        step="0.05"
                        value={formBoron}
                        onChange={e => setFormBoron(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-zinc-800 pt-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Escherichia coli (NMP/100mL):</label>
                      <input
                        type="number"
                        value={formEColi}
                        onChange={e => setFormEColi(parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-bold"
                      />
                      <span className="text-[10px] text-slate-400 block">Padrão potabilidade: 0 NMP/100mL</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Coliformes Totais (NMP/100mL):</label>
                      <input
                        type="number"
                        value={formTotalColiforms}
                        onChange={e => setFormTotalColiforms(parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 dark:border-zinc-800 pt-2">
                    <label className="font-bold text-slate-700 dark:text-zinc-300">Parecer Técnico & Recomendações:</label>
                    <textarea
                      rows={3}
                      value={formTechnicalNotes}
                      onChange={e => setFormTechnicalNotes(e.target.value)}
                      placeholder="Observações complementares do responsável técnico..."
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border rounded-lg font-medium resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="text-[11px] text-slate-400">
                {modalTab === 'geral' && 'Etapa 1 de 3'}
                {modalTab === 'fisicoquimica' && 'Etapa 2 de 3'}
                {modalTab === 'micro_obs' && 'Etapa 3 de 3'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAnalysisModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAnalysis}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingAnalysisId ? 'Atualizar & Recalcular' : 'Salvar & Interpretar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR / EDITAR PONTO DE COLETA                     */}
      {/* ========================================================= */}
      {isPointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {editingPointId ? 'Alterar Dados do Ponto de Coleta' : 'Novo Ponto de Coleta'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {editingPointId
                      ? 'Atualize as informações cadastrais e geográficas do manancial'
                      : 'Cadastre um novo manancial ou local de captação de água na propriedade'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPointModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePoint} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Nome do Ponto / Manancial *
                  </label>
                  <input
                    type="text"
                    required
                    value={pointFormName}
                    onChange={e => setPointFormName(e.target.value)}
                    placeholder="Ex: Poço Artesiano Sede - Aquífero Guarani"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Código Identificador
                  </label>
                  <input
                    type="text"
                    value={pointFormCode}
                    onChange={e => setPointFormCode(e.target.value)}
                    placeholder="Ex: PT-AR-001"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono uppercase font-bold text-cyan-600 dark:text-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Tipo de Captação / Manancial
                  </label>
                  <select
                    value={pointFormType}
                    onChange={e => setPointFormType(e.target.value as CollectionPointType)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                  >
                    <option value="poco_artesiano">Poço Artesiano (Profundo)</option>
                    <option value="poco_semiartesiano">Poço Semi-Artesiano (Freático)</option>
                    <option value="rio">Rio / Córrego (Superficial)</option>
                    <option value="represa">Represa / Açude Grande</option>
                    <option value="acude">Açude Pequeno</option>
                    <option value="nascente">Nascente / Mina d'água</option>
                    <option value="lago">Lago / Lagoa</option>
                    <option value="reservatorio">Reservatório / Tanque / Geomembrana</option>
                    <option value="canal_irrigacao">Canal de Irrigação</option>
                    <option value="cisterna">Cisterna / Água de Chuva</option>
                    <option value="rede_publica">Rede Pública / Concessionária</option>
                    <option value="outro">Outro Manancial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Propriedade / Fazenda
                  </label>
                  <input
                    type="text"
                    value={pointFormPropertyName}
                    onChange={e => setPointFormPropertyName(e.target.value)}
                    placeholder="Ex: Fazenda Santa Maria"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Georreferenciamento */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-600" />
                    Georreferenciamento & Altimetria
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isCapturingGps}
                    className="px-2.5 py-1 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    {isCapturingGps ? 'Obtendo GPS...' : 'Capturar GPS Atual'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">Latitude:</label>
                    <input
                      type="text"
                      value={pointFormLatitude}
                      onChange={e => setPointFormLatitude(e.target.value)}
                      placeholder="-21.1767"
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">Longitude:</label>
                    <input
                      type="text"
                      value={pointFormLongitude}
                      onChange={e => setPointFormLongitude(e.target.value)}
                      placeholder="-47.8103"
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">Altitude (m):</label>
                    <input
                      type="number"
                      value={pointFormAltitudeMeters}
                      onChange={e => setPointFormAltitudeMeters(e.target.value)}
                      placeholder="580"
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Observações / Notas */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Observações & Características Operacionais
                </label>
                <textarea
                  rows={2}
                  value={pointFormNotes}
                  onChange={e => setPointFormNotes(e.target.value)}
                  placeholder="Ex: Bomba submersa de 15 CV, vazão média de 45 m³/h, filtro de disco instalado..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPointModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingPointId ? 'Salvar Alterações' : 'Cadastrar Ponto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
