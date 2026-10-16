// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Tractor, Leaf, Map, Activity, 
  Droplets, Bug, AlertTriangle, Calendar, FileText,
  Clock, Plus, Search, Filter, BarChart3,
  Sun, Wind, ThermometerSun, UploadCloud, MapPin, Target,
  CheckCircle2, Circle, Layers, FlaskConical, CloudRain,
  Camera, Navigation, ChevronRight, HelpCircle, Info, X,
  Award, ShieldCheck, Globe, Download, ExternalLink,
  FileCheck2, BadgeCheck, Check, Building2, UserCheck,
  RefreshCw, FileSpreadsheet, Printer, Share2, Scale, ShieldAlert, Edit,
  Bell, Microscope, Dna, Flower2, LayoutGrid, Calculator, Thermometer,
  Package, Sparkles, Boxes, ArrowRight, Bird, Egg, Syringe, Sprout, Compass,
  Wheat, ArrowLeft, History, DollarSign, BarChart2, ChevronDown
} from 'lucide-react';
import { Farm, SoilSample, FieldPlot } from '../types/agronomy';
import { FieldOperation, Field, FieldBookSubTab } from '../types/fieldbook';
import { INITIAL_FIELDS, INITIAL_OPERATIONS, MOCK_DASHBOARD_SUMMARY, MOCK_GLOBAL_GAP_AUDIT } from '../data/fieldbookData';
import { CROPS_CATALOG } from '../data/agronomicStandards';
import { INITIAL_NEMATODE_FIELDS, NEMATODE_SPECIES_CATALOG } from '../data/nematologyData';
import { initialProductionBatches, initialGreenhouses, nurseryCropsCatalog } from '../data/nurseryData';
import { ProductionBatch, GreenhouseEnvironment } from '../types/nursery';
import { calculateLiming, calculateGypsum, calculateFertilization } from '../utils/agronomicCalculations';
import { notifyPendingTask, dispatchSWNotification } from '../utils/notificationService';

import { lazyWithRetry } from '../utils/lazyWithRetry';

// Lazy load heavy child modules with retry wrapper to avoid "Failed to fetch dynamically imported module" errors
const RecommendationModule = lazyWithRetry(() => import('./RecommendationModule').then((m: any) => ({ default: m.RecommendationModule || m.default })));
const NurseryModule = lazyWithRetry(() => import('./NurseryModule').then((m: any) => ({ default: m.NurseryModule || m.default })));
const PoultryModule = lazyWithRetry(() => import('./PoultryModule').then((m: any) => ({ default: m.PoultryModule || m.default })));
const PlantabilityModule = lazyWithRetry(() => import('./PlantabilityModule').then((m: any) => ({ default: m.PlantabilityModule || m.default })));
const HydroponicsFieldBookIntegration = lazyWithRetry(() => import('./fieldbook/HydroponicsFieldBookIntegration').then((m: any) => ({ default: m.HydroponicsFieldBookIntegration || m.default })));
const TankMixModule = lazyWithRetry(() => import('./TankMixModule').then((m: any) => ({ default: m.TankMixModule || m.default })));
const LivestockModule = lazyWithRetry(() => import('./LivestockModule').then((m: any) => ({ default: m.LivestockModule || m.default })));
const SwineModule = lazyWithRetry(() => import('./SwineModule').then((m: any) => ({ default: m.SwineModule || m.default })));
const AnimalNutritionModule = lazyWithRetry(() => import('./nutrition/AnimalNutritionModule').then((m: any) => ({ default: m.AnimalNutritionModule || m.default })));

// Centralized Technical Analysis Modules
const SoilAnalysisModule = lazyWithRetry(() => import('./SoilAnalysisModule').then((m: any) => ({ default: m.SoilAnalysisModule || m.default })));
const LeafAnalysisModule = lazyWithRetry(() => import('./LeafAnalysisModule').then((m: any) => ({ default: m.LeafAnalysisModule || m.default })));
const WaterAnalysisModule = lazyWithRetry(() => import('./WaterAnalysisModule').then((m: any) => ({ default: m.WaterAnalysisModule || m.default })));
const BrixModule = lazyWithRetry(() => import('./BrixModule').then((m: any) => ({ default: m.BrixModule || m.default })));
const PhenologyModule = lazyWithRetry(() => import('./PhenologyModule').then((m: any) => ({ default: m.PhenologyModule || m.default })));
const RainGaugeModule = lazyWithRetry(() => import('./RainGaugeModule').then((m: any) => ({ default: m.RainGaugeModule || m.default })));
const WeatherModule = lazyWithRetry(() => import('./WeatherModule').then((m: any) => ({ default: m.WeatherModule || m.default })));
const IrrigationModule = lazyWithRetry(() => import('./irrigation/IrrigationModule').then((m: any) => ({ default: m.IrrigationModule || m.default })));
const SoilDiseasesModule = lazyWithRetry(() => import('./SoilDiseasesModule').then((m: any) => ({ default: m.SoilDiseasesModule || m.default })));
const CostManagementModule = lazyWithRetry(() => import('./costs/CostManagementModule').then((m: any) => ({ default: m.CostManagementModule || m.default })));
const TechnicalReportModule = lazyWithRetry(() => import('./TechnicalReportModule').then((m: any) => ({ default: m.TechnicalReportModule || m.default })));
const HistoricalComparativeModule = lazyWithRetry(() => import('./HistoricalComparativeModule').then((m: any) => ({ default: m.HistoricalComparativeModule || m.default })));
const VeterinaryBularioModule = lazyWithRetry(() => import('./VeterinaryBularioModule').then((m: any) => ({ default: m.VeterinaryBularioModule || m.default })));
const BuffaloModule = lazyWithRetry(() => import('./BuffaloModule').then((m: any) => ({ default: m.BuffaloModule || m.default })));
const CaprineModule = lazyWithRetry(() => import('./CaprineModule').then((m: any) => ({ default: m.CaprineModule || m.default })));
const EquineModule = lazyWithRetry(() => import('./EquineModule').then((m: any) => ({ default: m.EquineModule || m.default })));
const PesticideBularioModule = lazyWithRetry(() => import('./PesticideBularioModule').then((m: any) => ({ default: m.PesticideBularioModule || m.default })));
const NematologyModule = lazyWithRetry(() => import('./NematologyModule').then((m: any) => ({ default: m.NematologyModule || m.default })));

import {
  getHydroponicSummaryMetrics,
  ensureInitialHydroponicSync,
  STORAGE_KEYS,
} from '../utils/hydroponicsFieldBookSync';
import {
  addTankMixApplicationToFieldBook,
  getTankMixSummaryMetrics,
} from '../utils/tankmixFieldBookSync';
import { getPlantabilitySummaryMetrics } from '../utils/plantabilityFieldBookSync';
import { syncLivestockToFieldBook } from '../utils/livestockFieldBookSync';
import { BovinoIcon } from './icons/BovinoIcon';
import { SuinoIcon } from './icons/SuinoIcon';
import { BubalinoIcon } from './icons/BubalinoIcon';
import { CaprinoIcon } from './icons/CaprinoIcon';
import { EquinoIcon } from './icons/EquinoIcon';

interface FieldBookModuleProps {
  farm: Farm;
  activeSubTab?: string;
  setActiveSubTab?: (tab: FieldBookSubTab) => void;
  soilSamples?: SoilSample[];
  setSoilSamples?: React.Dispatch<React.SetStateAction<SoilSample[]>>;
  leafSamples?: any[];
  setLeafSamples?: React.Dispatch<React.SetStateAction<any[]>>;
  farms?: Farm[];
  selectedFarmId?: string;
  producers?: any[];
  companies?: any[];
  agronomist?: any;
  company?: any;
  isDarkMode?: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigateToRegister?: () => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

export default function FieldBookModule({
  farm,
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  soilSamples,
  setSoilSamples,
  leafSamples,
  setLeafSamples,
  farms,
  selectedFarmId,
  producers,
  companies,
  agronomist,
  company,
  isDarkMode,
  setIsDarkMode,
  onNavigateToRegister,
  onNavigate,
}: FieldBookModuleProps) {
  const [internalTab, setInternalTab] = useState<FieldBookSubTab>('dashboard');
  const activeTab = (externalSubTab as FieldBookSubTab) || internalTab;
  const setActiveTab = (tab: FieldBookSubTab) => {
    setInternalTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const fieldBookTabs = useMemo(() => [
    // Campo & Geral
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutGrid, category: 'geral' },
    { id: 'operations', label: 'Operações & Manejo', icon: Calendar, category: 'geral' },
    { id: 'fields', label: 'Talhões & Culturas', icon: MapPin, category: 'geral' },
    { id: 'digital_twin', label: 'Gêmeo Digital 360°', icon: Target, category: 'geral' },
    { id: 'reports', label: 'Auditoria GlobalG.A.P.', icon: ShieldCheck, category: 'geral' },

    // Análises de Laboratório & Laudos
    { id: 'solos', label: 'Análise de Solo', icon: FlaskConical, category: 'analises', badge: 'Solo' },
    { id: 'foliar', label: 'Diagnose Foliar', icon: Leaf, category: 'analises', badge: 'Folha' },
    { id: 'analise_agua', label: 'Análise de Água', icon: Droplets, category: 'analises', badge: 'Água' },
    { id: 'brix', label: 'Brix Foliar', icon: Thermometer, category: 'analises', badge: 'Brix' },
    { id: 'recomendacoes', label: 'Recomendações Agronômicas', icon: Calculator, category: 'analises', badge: 'Adubação' },
    { id: 'relatorios', label: 'Laudo Oficial & ART', icon: FileText, category: 'analises', badge: 'ART' },
    { id: 'historico', label: 'Histórico & Comparativo', icon: History, category: 'analises' },

    // Manejo & Fitossanidade
    { id: 'tankmix', label: 'Tankmix (Calda & Defensivos)', icon: FlaskConical, category: 'manejo', badge: 'Calda' },
    { id: 'plantabilidade', label: 'Plantabilidade & Semeadura', icon: Compass, category: 'manejo' },
    { id: 'fenologia', label: 'Fenologia da Cultura', icon: Sprout, category: 'manejo' },
    { id: 'nematology', label: 'Nematoides & BioAS', icon: Microscope, category: 'manejo' },
    { id: 'doencas_solo', label: 'Doenças do Solo', icon: Bug, category: 'manejo' },
    { id: 'bulario', label: 'Bulário Defensivos', icon: Package, category: 'manejo' },

    // Clima & Água
    { id: 'irrigacao', label: 'Irrigação & Balanço', icon: Droplets, category: 'clima' },
    { id: 'pluviometria', label: 'Pluviometria & Chuvas', icon: CloudRain, category: 'clima' },
    { id: 'meteorologia', label: 'Climatologia & Previsão', icon: Sun, category: 'clima' },

    // Ambiente & Custos
    { id: 'producao_mudas', label: 'Viveiro & Mudas', icon: Flower2, category: 'ambiente' },
    { id: 'hidroponia', label: 'Hidroponia & Estufas', icon: Droplets, category: 'ambiente' },
    { id: 'custos', label: 'Gestão de Custos & DRE', icon: DollarSign, category: 'ambiente' },

    // Zootecnia
    { id: 'pecuaria', label: 'Bovinocultura', icon: BovinoIcon, category: 'zootecnia' },
    { id: 'avicultura', label: 'Avicultura', icon: Egg, category: 'zootecnia' },
    { id: 'suinocultura', label: 'Suinocultura', icon: SuinoIcon, category: 'zootecnia' },
    { id: 'nutricao_animal', label: 'Nutrição Animal', icon: Wheat, category: 'zootecnia' },
    { id: 'bubalinos', label: 'Bubalinos', icon: BubalinoIcon, category: 'zootecnia' },
    { id: 'caprinos', label: 'Caprinos', icon: CaprinoIcon, category: 'zootecnia' },
    { id: 'equinos', label: 'Equinos', icon: EquinoIcon, category: 'zootecnia' },
    { id: 'bulario_vet', label: 'Compêndio Veterinário', icon: Syringe, category: 'zootecnia' },
  ], []);

  const handleNavigateToRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else if (onNavigate) {
      onNavigate('cadastros', 'fazendas');
    } else {
      window.dispatchEvent(new CustomEvent('gea-navigate', { detail: { tab: 'cadastros', subTab: 'fazendas' } }));
    }
  };
  const mapPlotsToFields = (f?: Farm): Field[] => {
    if (f?.plots && Array.isArray(f.plots) && f.plots.length > 0) {
      return f.plots.map(plot => ({
        id: plot.id || `plot-${Math.random()}`,
        farmId: plot.farmId || f.id || 'farm-1',
        name: plot.name || 'Talhão',
        areaHa: plot.areaHa || 0,
        crop: plot.currentCrop || 'Não definida',
        variety: '',
        season: '2025/2026',
        soilType: plot.texture ? (plot.texture.charAt(0).toUpperCase() + plot.texture.slice(1)) : 'Argiloso',
        coordinates: [],
      }));
    }
    return [];
  };

  const [fields, setFields] = useState<Field[]>(() => mapPlotsToFields(farm));

  useEffect(() => {
    if (farm?.plots && Array.isArray(farm.plots) && farm.plots.length > 0) {
      setFields(prevFields => {
        return farm.plots.map(plot => {
          const existing = (prevFields || []).find(ef => ef?.id === plot.id);
          return {
            id: plot.id || `plot-${Math.random()}`,
            farmId: plot.farmId || farm?.id || 'farm-1',
            name: plot.name || 'Talhão',
            areaHa: plot.areaHa || 0,
            crop: plot.currentCrop || existing?.crop || 'Não definida',
            variety: existing?.variety || '',
            season: existing?.season || '2025/2026',
            soilType: plot.texture ? (plot.texture.charAt(0).toUpperCase() + plot.texture.slice(1)) : (existing?.soilType || 'Argiloso'),
            coordinates: existing?.coordinates || [],
            activeNurseryBatchId: existing?.activeNurseryBatchId,
            seedlingTransplantDate: existing?.seedlingTransplantDate,
            seedlingCount: existing?.seedlingCount,
          };
        });
      });
    } else {
      setFields(mapPlotsToFields(farm));
    }
  }, [farm, farm?.plots]);

  const [operations, setOperations] = useState<FieldOperation[]>(() => {
    try {
      ensureInitialHydroponicSync(farm?.id || 'farm-1');
      const stored = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
      let ops: FieldOperation[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          ops = parsed;
        }
      }
      
      // Merge with live synced animal operations if any
      const liveLivestockOps = syncLivestockToFieldBook(farm?.id || 'farm-1');
      const uniqueLiveOps = liveLivestockOps.filter(lop => !ops.some(op => op.id === lop.id));
      
      return [...ops, ...uniqueLiveOps];
    } catch (e) {
      console.error('Erro ao inicializar operações:', e);
    }
    return [];
  });

  // Sync state with localStorage & cross-tab / cross-module custom events
  useEffect(() => {
    const handleStorageOrCustomSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
        let ops: FieldOperation[] = [];
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            ops = parsed;
          }
        }
        
        const liveLivestockOps = syncLivestockToFieldBook(farm?.id || 'farm-1');
        const uniqueLiveOps = liveLivestockOps.filter(lop => !ops.some(op => op.id === lop.id));
        
        setOperations([...ops, ...uniqueLiveOps]);
      } catch (e) {
        console.error('Erro ao sincronizar operações:', e);
      }
    };

    window.addEventListener('storage', handleStorageOrCustomSync);
    window.addEventListener('geaagro-fieldbook-operations-updated', handleStorageOrCustomSync);
    window.addEventListener('geaagro-hydroponics-annotations-updated', handleStorageOrCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageOrCustomSync);
      window.removeEventListener('geaagro-fieldbook-operations-updated', handleStorageOrCustomSync);
      window.removeEventListener('geaagro-hydroponics-annotations-updated', handleStorageOrCustomSync);
    };
  }, []);

  const [selectedTwinFieldId, setSelectedTwinFieldId] = useState<string>(fields[0]?.id || '');
  const [activeLayer, setActiveLayer] = useState<'soil' | 'fertility' | 'spraying' | 'satellite' | 'nematology'>('soil');

  // Estado de Produção de Mudas & Transplante Integrado
  const [batches, setBatches] = useState<ProductionBatch[]>(initialProductionBatches);
  const [nurserySubTab, setNurserySubTab] = useState<'lotes' | 'estufas' | 'fitossanitario' | 'modulo_completo'>('lotes');
  const [selectedTransplantBatch, setSelectedTransplantBatch] = useState<ProductionBatch | null>(null);
  const [isTransplantModalOpen, setIsTransplantModalOpen] = useState(false);
  const [transplantFieldId, setTransplantFieldId] = useState<string>(fields[2]?.id || fields[0]?.id || 'fld-3');
  const [transplantSeedlingCount, setTransplantSeedlingCount] = useState<string>('7800');
  const [transplantDate, setTransplantDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transplantSpacing, setTransplantSpacing] = useState<string>('0.5m x 1.2m');
  const [transplantResponsible, setTransplantResponsible] = useState<string>('Carlos Eduardo (Coord. Campo)');
  const [transplantNotes, setTransplantNotes] = useState<string>('Transplante realizado com solo umedecido, torrão firme e enraizamento ativo. Irrigação por gotejamento acionada imediatamente.');
  const [batchSearchTerm, setBatchSearchTerm] = useState<string>('');
  const [batchStatusFilter, setBatchStatusFilter] = useState<string>('todos');
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<ProductionBatch | null>(null);
  const [isIggsModalOpen, setIsIggsModalOpen] = useState(false);
  const [isGlobalGapModalOpen, setIsGlobalGapModalOpen] = useState(false);
  const [activeGlobalGapSubTab, setActiveGlobalGapSubTab] = useState<'overview' | 'chapters' | 'mrl' | 'documents'>('overview');

  // Estado da Auditoria GlobalG.A.P. Editável
  const [globalGapAudit, setGlobalGapAudit] = useState(MOCK_GLOBAL_GAP_AUDIT);
  const [isEditGlobalGapModalOpen, setIsEditGlobalGapModalOpen] = useState(false);

  // Form state para Edição da Auditoria
  const [editCertBody, setEditCertBody] = useState(globalGapAudit.certificationBody);
  const [editAuditorName, setEditAuditorName] = useState(globalGapAudit.auditorName);
  const [editAuditDate, setEditAuditDate] = useState(globalGapAudit.auditDate);
  const [editExpiryDate, setEditExpiryDate] = useState(globalGapAudit.expiryDate);
  const [editCertificateNumber, setEditCertificateNumber] = useState(globalGapAudit.certificateNumber);
  const [editFarmName, setEditFarmName] = useState(globalGapAudit.farmName);
  const [editStandardVersion, setEditStandardVersion] = useState(globalGapAudit.standardVersion);
  const [editOverallPct, setEditOverallPct] = useState(globalGapAudit.complianceScore.overallPct.toString());
  const [editMajorMustsPct, setEditMajorMustsPct] = useState(globalGapAudit.complianceScore.majorMustsPct.toString());
  const [editMinorMustsPct, setEditMinorMustsPct] = useState(globalGapAudit.complianceScore.minorMustsPct.toString());
  const [editLabName, setEditLabName] = useState(globalGapAudit.residueAnalysis.labName);
  const [editReportNumber, setEditReportNumber] = useState(globalGapAudit.residueAnalysis.reportNumber);

  const handleOpenEditAuditModal = () => {
    setEditCertBody(globalGapAudit.certificationBody);
    setEditAuditorName(globalGapAudit.auditorName);
    setEditAuditDate(globalGapAudit.auditDate);
    setEditExpiryDate(globalGapAudit.expiryDate);
    setEditCertificateNumber(globalGapAudit.certificateNumber);
    setEditFarmName(globalGapAudit.farmName);
    setEditStandardVersion(globalGapAudit.standardVersion);
    setEditOverallPct(globalGapAudit.complianceScore.overallPct.toString());
    setEditMajorMustsPct(globalGapAudit.complianceScore.majorMustsPct.toString());
    setEditMinorMustsPct(globalGapAudit.complianceScore.minorMustsPct.toString());
    setEditLabName(globalGapAudit.residueAnalysis.labName);
    setEditReportNumber(globalGapAudit.residueAnalysis.reportNumber);
    setIsEditGlobalGapModalOpen(true);
  };

  const handleSaveAuditData = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalGapAudit(prev => ({
      ...prev,
      certificationBody: editCertBody.trim() || prev.certificationBody,
      auditorName: editAuditorName.trim() || prev.auditorName,
      auditDate: editAuditDate || prev.auditDate,
      expiryDate: editExpiryDate || prev.expiryDate,
      certificateNumber: editCertificateNumber.trim() || prev.certificateNumber,
      farmName: editFarmName.trim() || prev.farmName,
      standardVersion: editStandardVersion.trim() || prev.standardVersion,
      complianceScore: {
        ...prev.complianceScore,
        overallPct: editOverallPct ? parseFloat(editOverallPct) : prev.complianceScore.overallPct,
        majorMustsPct: editMajorMustsPct ? parseFloat(editMajorMustsPct) : prev.complianceScore.majorMustsPct,
        minorMustsPct: editMinorMustsPct ? parseFloat(editMinorMustsPct) : prev.complianceScore.minorMustsPct,
      },
      residueAnalysis: {
        ...prev.residueAnalysis,
        labName: editLabName.trim() || prev.residueAnalysis.labName,
        reportNumber: editReportNumber.trim() || prev.residueAnalysis.reportNumber,
      }
    }));

    setIsEditGlobalGapModalOpen(false);
    setSyncMessage('Dados da Auditoria GlobalG.A.P. atualizados com sucesso!');
    setTimeout(() => setSyncMessage(null), 4000);
  };

  // Modal Nova Operação & Sincronização
  const [isNewOperationModalOpen, setIsNewOperationModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form state Nova Operação
  const [opFieldId, setOpFieldId] = useState<string>(fields[0]?.id || 'f1');
  const [opType, setOpType] = useState<FieldOperation['type']>('spraying');
  const [opStatus, setOpStatus] = useState<FieldOperation['status']>('planned');
  const [opDate, setOpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [opResponsible, setOpResponsible] = useState<string>('');
  const [opNotes, setOpNotes] = useState<string>('');
  const [opMachine, setOpMachine] = useState<string>('');
  const [opProduct, setOpProduct] = useState<string>('');
  const [opDose, setOpDose] = useState<string>('');
  const [opCrop, setOpCrop] = useState<string>('Soja');
  const [opVariety, setOpVariety] = useState<string>('');
  const [opTarget, setOpTarget] = useState<string>('');

  // Form state Nova Operação - Mudas & Viveiro
  const [opNurseryBatchId, setOpNurseryBatchId] = useState<string>('');
  const [opSeedlingCount, setOpSeedlingCount] = useState<string>('');
  const [opTrayType, setOpTrayType] = useState<string>('128 células');
  const [opSubstrate, setOpSubstrate] = useState<string>('');
  const [opGreenhouseOrigin, setOpGreenhouseOrigin] = useState<string>('');

  const handleOpenNewOperation = () => {
    setIsNewOperationModalOpen(true);
  };

  const handleOpenTransplantModal = (batch: ProductionBatch) => {
    setSelectedTransplantBatch(batch);
    setTransplantSeedlingCount(batch.estimatedReadyPlants.toString());
    setTransplantFieldId(fields[2]?.id || fields[0]?.id || 'fld-3');
    setTransplantDate(new Date().toISOString().split('T')[0]);
    setIsTransplantModalOpen(true);
  };

  const handleConfirmTransplant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransplantBatch) return;

    const count = parseInt(transplantSeedlingCount) || selectedTransplantBatch.estimatedReadyPlants || 5000;
    const targetField = fields.find(f => f?.id === transplantFieldId) || fields[0];

    const newOp: FieldOperation = {
      id: `op-transplant-${Date.now()}`,
      farmId: farm?.id || 'farm-1',
      fieldId: transplantFieldId || targetField?.id || 'fld-1',
      type: 'nursery_transplant',
      status: 'completed',
      date: transplantDate,
      responsible: transplantResponsible.trim() || 'Equipe Agronômica',
      notes: transplantNotes.trim() || undefined,
      details: {
        crop: selectedTransplantBatch.cropName,
        variety: selectedTransplantBatch.cultivar,
        nurseryBatchId: selectedTransplantBatch.batchCode,
        seedlingCount: count,
        trayType: `${selectedTransplantBatch.trayType} células (${selectedTransplantBatch.trayCount} bandejas)`,
        substrateType: selectedTransplantBatch.substrateType,
        greenhouseOrigin: selectedTransplantBatch.greenhouse,
        hardeningDays: 5,
        transplantSuccessPct: 98.8,
        phytosanitaryStatus: 'Laudo de Sanidade Aprovado (Rastreabilidade RENASEM)',
        spacing: 0.5,
        depth: 5.0,
      },
      costs: {
        operation: 0,
        inputs: Math.round((selectedTransplantBatch.unitCostBrl || 0.22) * count),
        machine: 400,
        labor: 850,
        total: Math.round((selectedTransplantBatch.unitCostBrl || 0.22) * count) + 1250,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOperations(prev => [newOp, ...prev]);

    setFields(prev => prev.map(f => f.id === transplantFieldId ? {
      ...f,
      activeNurseryBatchId: selectedTransplantBatch.batchCode,
      seedlingTransplantDate: transplantDate,
      seedlingCount: count,
      crop: selectedTransplantBatch.cropName,
      variety: selectedTransplantBatch.cultivar,
    } : f));

    setBatches(prev => prev.map(b => b.id === selectedTransplantBatch.id ? {
      ...b,
      status: 'finalizado' as const,
      notes: `${b.notes || ''} [Mudas transplantadas no ${targetField.name} em ${transplantDate} - ${count.toLocaleString()} mudas]`,
    } : b));

    setIsTransplantModalOpen(false);
    setSelectedTransplantBatch(null);
    setSyncMessage(`🌱 Lote ${selectedTransplantBatch.batchCode} (${count.toLocaleString()} mudas) transplantado com sucesso para ${targetField.name}! Registrado no Caderno de Campo.`);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('Caderno de campo e telemetria sincronizados com sucesso!');
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1000);
  };

  const handleSaveOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedField = fields.find(f => f?.id === opFieldId) || fields[0];

    const newOp: FieldOperation = {
      id: `op-${Date.now()}`,
      farmId: farm?.id || 'farm-1',
      fieldId: opFieldId || selectedField?.id || 'f1',
      type: opType,
      status: opStatus,
      date: opDate || new Date().toISOString().split('T')[0],
      responsible: opResponsible.trim() || 'Equipe Agronômica',
      notes: opNotes.trim() || undefined,
      details: {
        machine: opMachine.trim() || undefined,
        product: opProduct.trim() || undefined,
        dose: opDose ? parseFloat(opDose) : undefined,
        crop: (opType === 'planting' || opType === 'nursery_transplant' || opType === 'nursery_sowing') ? opCrop : undefined,
        variety: opVariety.trim() || undefined,
        target: opTarget.trim() || undefined,
        nurseryBatchId: opNurseryBatchId.trim() || undefined,
        seedlingCount: opSeedlingCount ? parseInt(opSeedlingCount) : undefined,
        trayType: opTrayType || undefined,
        substrateType: opSubstrate.trim() || undefined,
        greenhouseOrigin: opGreenhouseOrigin.trim() || undefined,
        phytosanitaryStatus: opNurseryBatchId ? 'Certificado Fitossanitário de Viveiro Emitido' : undefined,
        transplantSuccessPct: opType === 'nursery_transplant' ? 98.8 : undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOperations(prev => [newOp, ...prev]);

    if (opNurseryBatchId) {
      setFields(prev => prev.map(f => f.id === opFieldId ? {
        ...f,
        activeNurseryBatchId: opNurseryBatchId,
        seedlingTransplantDate: opDate,
        seedlingCount: opSeedlingCount ? parseInt(opSeedlingCount) : undefined,
        crop: opCrop || f.crop,
        variety: opVariety || f.variety,
      } : f));
    }

    setIsNewOperationModalOpen(false);

    // If planned operation, dispatch push notification alert via SW
    if (opStatus === 'planned') {
      const typeLabel = opType === 'spraying' ? 'Aplicação Fitossanitária' : opType === 'fertility' ? 'Adubação' : opType === 'nursery_transplant' ? 'Transplante de Mudas' : opType === 'planting' ? 'Semeadura' : 'Operação de Campo';
      notifyPendingTask({
        title: `${typeLabel} agendada para ${newOp.date}`,
        farmName: farm.name,
        fieldName: selectedField?.name,
        dueDate: newOp.date,
        priority: 'high',
        taskId: newOp.id,
        status: opStatus
      });
    }

    // Reset form
    setOpResponsible('');
    setOpNotes('');
    setOpMachine('');
    setOpProduct('');
    setOpDose('');
    setOpVariety('');
    setOpTarget('');
    setOpNurseryBatchId('');
    setOpSeedlingCount('');
    setOpSubstrate('');
    setOpGreenhouseOrigin('');

    setSyncMessage('Nova operação cadastrada com sucesso!');
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleNotifyPendingOps = () => {
    const pending = operations.filter(op => op.status === 'planned' || op.status === 'in_progress');
    if (pending.length === 0) {
      setSyncMessage('Nenhuma tarefa pendente no momento para alertar.');
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    const first = pending[0];
    const targetField = fields.find(f => f.id === first.fieldId);
    notifyPendingTask({
      title: `${pending.length} ${pending.length === 1 ? 'Operação Pendente' : 'Operações Pendentes'}`,
      farmName: farm?.name || 'Fazenda Principal',
      fieldName: targetField?.name || 'Talhões ativos',
      dueDate: first.date,
      priority: 'high',
      taskId: first.id,
      status: first.status
    });

    setSyncMessage(`🔔 Notificação push enviada ao agrônomo sobre ${pending.length} tarefas pendentes!`);
    setTimeout(() => setSyncMessage(null), 4000);
  };


  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Property Context & Quick Action Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Propriedade Ativa
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {farm?.city ? `${farm.city} - ${farm.state || ''}` : 'Localização Cadastrada'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {farm?.name || 'Fazenda Principal'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Área Total: <strong className="text-slate-800 dark:text-zinc-200">{farm?.totalAreaHa ? farm.totalAreaHa.toLocaleString() : '1.250'} ha</strong> • Talhões Mapeados: <strong className="text-slate-800 dark:text-zinc-200">{fields.length}</strong> • Operações: <strong className="text-slate-800 dark:text-zinc-200">{operations.length}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleNavigateToRegister}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            title="Cadastrar ou gerenciar propriedades rurais, fazendas e produtores"
          >
            <Building2 className="w-4 h-4" />
            <span>Cadastrar Propriedade / Fazenda</span>
          </button>
          <button
            onClick={handleOpenNewOperation}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Nova Operação</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayOpsCount = (operations || []).filter(op => op.date === todayStr).length;
        const plannedOpsCount = (operations || []).filter(op => op.status === 'planned').length;
        const totalCultivatedArea = (fields || []).reduce((sum, f) => sum + (f?.areaHa || 0), 0);
        const totalMachineryHours = (operations || []).reduce((sum, op) => sum + (op.details?.workedHours || 0), 0);
        const iggsScore = operations.length > 0 ? Math.min(100, Math.round(75 + Math.min(25, operations.length * 2.5))) : 100;

        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-zinc-300">Hoje / Previstas</h3>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {todayOpsCount} <span className="text-sm font-normal text-slate-500">/ {plannedOpsCount}</span>
              </p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-zinc-300">Área Cultivada</h3>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {totalCultivatedArea > 0 ? totalCultivatedArea.toFixed(1) : (farm?.totalAreaHa ? farm.totalAreaHa.toLocaleString() : '0')} <span className="text-sm font-normal text-slate-500">ha</span>
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Tractor className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-zinc-300">Horas Máquina</h3>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {totalMachineryHours} <span className="text-sm font-normal text-slate-500">h</span>
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-800 transition-all">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Activity className="w-16 h-16" />
              </div>
              <div className="flex items-center justify-between mb-1 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 dark:text-zinc-300 text-sm">Índice IGGS</h3>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold block">Gestão da Safra</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsIggsModalOpen(true)}
                  className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-md transition-colors cursor-pointer"
                  title="Entenda como o IGGS é avaliado"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-baseline justify-between mt-1 relative z-10">
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {iggsScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
                </p>
                <button
                  onClick={() => setIsIggsModalOpen(true)}
                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Como é avaliado?</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* IGGS Explanation Banner Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-md border border-purple-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                <Award className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base text-white">
                O que é o Índice IGGS (Índice GeaAgro de Gestão da Safra)?
              </h3>
              <span className="text-[10px] bg-purple-500/30 text-purple-200 font-extrabold px-2 py-0.5 rounded-full border border-purple-400/30">
                Pontuação do Talhão & Safra
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O <strong className="text-purple-200">IGGS (0 a 100 pontos)</strong> é o indicador oficial de excelência operacional e rastreabilidade agrícola da fazenda. Ele avalia continuamente a conformidade do manejo, apontamentos no caderno de campo e o cumprimento de boas práticas agrícolas.
            </p>
          </div>
          <button
            onClick={() => setIsIggsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm border border-purple-400/40"
          >
            <Info className="w-4 h-4" />
            <span>Ver Regras de Avaliação</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-purple-800/40 text-xs">
          <div className="bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/30">
            <span className="text-[10px] text-purple-300 font-bold block uppercase">1. Caderno de Campo (25 pts)</span>
            <span className="text-slate-200 font-medium">Registros e rastreabilidade total de operações</span>
          </div>
          <div className="bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/30">
            <span className="text-[10px] text-purple-300 font-bold block uppercase">2. Conformidade (25 pts)</span>
            <span className="text-slate-200 font-medium">Receituários, doses, carência e reentrada</span>
          </div>
          <div className="bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/30">
            <span className="text-[10px] text-purple-300 font-bold block uppercase">3. Eficiência Maquinário (25 pts)</span>
            <span className="text-slate-200 font-medium">Horas-máquina e janelas climáticas (IJO)</span>
          </div>
          <div className="bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/30">
            <span className="text-[10px] text-purple-300 font-bold block uppercase">4. Sanidade & Solo (25 pts)</span>
            <span className="text-slate-200 font-medium">Monitoramento MIP e análises de solo/folha</span>
          </div>
        </div>
      </div>

      {/* CARD DA AUDITORIA GLOBALG.A.P. MAIS RECENTE */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30 flex items-center gap-1.5 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                GLOBALG.A.P. CERTIFIED
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-200 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                {globalGapAudit.certificateNumber}
              </span>
              <span className="text-[10px] bg-teal-500/30 text-teal-200 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                IFA v6.0 - Smart
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                Auditoria GlobalG.A.P. Mais Recente
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-emerald-400/40">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Certificado Válido até {globalGapAudit.expiryDate.includes('-') ? globalGapAudit.expiryDate.split('-').reverse().join('/') : globalGapAudit.expiryDate}
                </span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Auditoria de Renovação realizada em <strong>{globalGapAudit.auditDate.includes('-') ? globalGapAudit.auditDate.split('-').reverse().join('/') : globalGapAudit.auditDate}</strong> por <strong>{globalGapAudit.auditorName}</strong> • Organismo Certificador: <strong>{globalGapAudit.certificationBody}</strong>. Atendimento integral às exigências de rastreabilidade, LMR/MRL e sustentabilidade agrícola.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="text-left lg:text-right">
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">Conformidade Geral</span>
              <span className="text-3xl font-black text-white tracking-tight">{globalGapAudit.complianceScore.overallPct}<span className="text-lg text-emerald-300">%</span></span>
              <span className="text-[10px] text-emerald-200 block font-medium">Major Musts: {globalGapAudit.complianceScore.majorMustsPct}% | Minor Musts: {globalGapAudit.complianceScore.minorMustsPct}%</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleOpenEditAuditModal}
                className="px-3 py-2 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-emerald-700/60 cursor-pointer shadow-sm"
                title="Preencher / Editar Dados da Auditoria"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Preencher / Editar</span>
              </button>
              <button
                onClick={() => setIsGlobalGapModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ver Detalhada</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-white/20 cursor-pointer"
                title="Abrir aba dedicada de auditoria e relatórios"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Auditoria &amp; Relatórios</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CENTRAL DE ANÁLISE TÉCNICA INTEGRADA NO CADERNO DE CAMPO */}
      <div className="bg-gradient-to-b from-slate-900 via-stone-900 to-zinc-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/30 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30 flex items-center gap-1.5 text-xs font-bold">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                CENTRAL DE ANÁLISE TÉCNICA
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 font-black px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                100% Integrado ao Caderno de Campo
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Análise Laboratorial, Nutrição, Clima &amp; Sanidade Centralizados
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Todos os módulos técnicos agronômicos integrados em tempo real ao Caderno de Campo da <strong>{farm?.name || 'Fazenda Ativa'}</strong>. Acesse dados laboratoriais, diagnose, biometria e recomendações sem sair da operação.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('solos')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Análise Técnica</span>
            </button>
          </div>
        </div>

        {/* Bento Grid de Módulos Técnicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Solo & Fertilidade */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                <FlaskConical className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 font-bold px-2 py-0.5 rounded-full">
                {soilSamples?.length || 4} laudos
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-amber-300 transition-colors">Análise de Solo &amp; Fertilidade</h4>
              <p className="text-xs text-slate-400 mt-0.5">Química, pH CaCl₂, CTC, V% e teores de nutrientes nos talhões.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('solos')}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Solo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('recomendacoes')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Recomendar
              </button>
            </div>
          </div>

          {/* Card Diagnose Foliar */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 font-bold px-2 py-0.5 rounded-full">
                {leafSamples?.length || 2} amostras
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-emerald-300 transition-colors">Diagnose Foliar</h4>
              <p className="text-xs text-slate-400 mt-0.5">Teores foliares N, P, K, Ca, Mg, S, B, Cu, Fe, Mn, Zn e equilíbrio DRIS.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('foliar')}
                className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Foliar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('brix')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Ver °Brix
              </button>
            </div>
          </div>

          {/* Card Qualidade da Água */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-500/30">
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-200 font-bold px-2 py-0.5 rounded-full">
                Classif. USSL C1-S1
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-cyan-300 transition-colors">Análise de Água</h4>
              <p className="text-xs text-slate-400 mt-0.5">Índice IGA, salinidade, sodicidade RAS, dureza e compatibilidade de calda.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('analise_agua')}
                className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Água</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('irrigacao')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Irrigação
              </button>
            </div>
          </div>

          {/* Card Brix Foliar */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-500/20 text-orange-300 rounded-xl border border-orange-500/30">
                <Thermometer className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-[10px] bg-orange-500/20 text-orange-200 font-bold px-2 py-0.5 rounded-full">
                Média 12.8 °Bx
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-orange-300 transition-colors">Brix Foliar &amp; Trofobiose</h4>
              <p className="text-xs text-slate-400 mt-0.5">Teor de açúcares da seiva, imunidade contra pragas e estresse hídrico.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('brix')}
                className="text-xs font-bold text-orange-300 hover:text-orange-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Brix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-emerald-400">Excelente</span>
            </div>
          </div>

          {/* Card Irrigação & Balanço Hídrico */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30">
                <CloudRain className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-200 font-bold px-2 py-0.5 rounded-full">
                Turno 48h
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-blue-300 transition-colors">Irrigação &amp; Pluviometria</h4>
              <p className="text-xs text-slate-400 mt-0.5">Lâminas aplicadas, balanço hídrico do solo, pluviômetro e evapotranspiração.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('irrigacao')}
                className="text-xs font-bold text-blue-300 hover:text-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Irrigação</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('pluviometria')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Pluviômetros
              </button>
            </div>
          </div>

          {/* Card Fenologia & Plantabilidade */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-lime-500/20 text-lime-300 rounded-xl border border-lime-500/30">
                <Sprout className="w-5 h-5 text-lime-400" />
              </div>
              <span className="text-[10px] bg-lime-500/20 text-lime-200 font-bold px-2 py-0.5 rounded-full">
                R1 / V4
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-lime-300 transition-colors">Fenologia &amp; Curvas</h4>
              <p className="text-xs text-slate-400 mt-0.5">Acompanhamento dos estádios fenológicos, graus-dia e curvas de absorção.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('fenologia')}
                className="text-xs font-bold text-lime-300 hover:text-lime-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Fenologia</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('plantabilidade')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Plantabilidade
              </button>
            </div>
          </div>

          {/* Card Fitopatologia & Nematologia */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                <Microscope className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-200 font-bold px-2 py-0.5 rounded-full">
                Sanidade BioAS
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-purple-300 transition-colors">Doenças &amp; Nematoides</h4>
              <p className="text-xs text-slate-400 mt-0.5">Diagnóstico fitopatológico, Pratylenchus, Meloidogyne e saúde do solo.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('nematology')}
                className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Nematologia</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('doencas_solo')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Doenças Solo
              </button>
            </div>
          </div>

          {/* Card Gestão de Custos & DRE */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-500/20 text-yellow-300 rounded-xl border border-yellow-500/30">
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-200 font-bold px-2 py-0.5 rounded-full">
                DRE Safra 25/26
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-yellow-300 transition-colors">Gestão de Custo &amp; DRE</h4>
              <p className="text-xs text-slate-400 mt-0.5">Custo operacional por hectare, insumos, margem líquida e rentabilidade.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('custos')}
                className="text-xs font-bold text-yellow-300 hover:text-yellow-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Custos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('relatorios')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Laudos ART
              </button>
            </div>
          </div>

          {/* Card Avicultura de Precisão */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                <Egg className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 font-bold px-2 py-0.5 rounded-full">
                Índice IEA
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-amber-300 transition-colors">Avicultura de Precisão</h4>
              <p className="text-xs text-slate-400 mt-0.5">Gestão de lotes de corte e postura, galpões, ambiência, vacinas e IEA.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('avicultura')}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Avicultura</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('avicultura')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Gêmeo Lote
              </button>
            </div>
          </div>

          {/* Card Suinocultura & IES */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30">
                <Activity className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-[10px] bg-pink-500/20 text-pink-200 font-bold px-2 py-0.5 rounded-full">
                Índice IES
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-pink-300 transition-colors">Suinocultura &amp; Granja</h4>
              <p className="text-xs text-slate-400 mt-0.5">Maternidade, creche, terminação, conversão alimentar e biometria.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('suinocultura')}
                className="text-xs font-bold text-pink-300 hover:text-pink-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Suinocultura</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('nutricao_animal')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Rações
              </button>
            </div>
          </div>

          {/* Card Bovinocultura & Pecuária */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                <Tractor className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 font-bold px-2 py-0.5 rounded-full">
                Corte &amp; Leite
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-emerald-300 transition-colors">Bovinocultura (Pecuária)</h4>
              <p className="text-xs text-slate-400 mt-0.5">GMD de corte, produção leiteira, IATF, brinco eletrônico e sanidade.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('pecuaria')}
                className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar Pecuária</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('bulario_vet')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Bulário Vet
              </button>
            </div>
          </div>

          {/* Card Nutrição Animal */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-400/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-500/20 text-orange-300 rounded-xl border border-orange-500/30">
                <Wheat className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-[10px] bg-orange-500/20 text-orange-200 font-bold px-2 py-0.5 rounded-full">
                Mínimo Custo
              </span>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-orange-300 transition-colors">Nutrição Animal &amp; Rações</h4>
              <p className="text-xs text-slate-400 mt-0.5">Formulação de rações por algoritmo Simplex, matriz de ingredientes e premix.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('nutricao_animal')}
                className="text-xs font-bold text-orange-300 hover:text-orange-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Formular Ração</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('bulario_vet')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Fármacos
              </button>
            </div>
          </div>

          {/* Card Informações sobre Forrageiras */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 rounded-2xl p-4 transition-all space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h4 className="font-black text-white text-sm group-hover:text-emerald-300 transition-colors">Informações sobre Forrageiras</h4>
              <p className="text-xs text-slate-400 mt-0.5">Fotos reais offline, adubação V%, fenologia, bromatologia, solo e doenças.</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('forrageiras')}
                className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Forrageiras</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('forrageiras');
                  if (setActiveSubTab) setActiveSubTab('indicacao_solo');
                }}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                Por Solo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD DA INTEGRAÇÃO COM PRODUÇÃO DE MUDAS & VIVEIRO */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-teal-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-400/30 flex items-center gap-1.5 text-xs font-bold">
                <Flower2 className="w-4 h-4 text-teal-400" />
                VIVEIRO &amp; PRODUÇÃO DE MUDAS
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-200 font-extrabold px-2.5 py-0.5 rounded-full border border-teal-400/30 uppercase tracking-wider">
                Rastreabilidade Conectada ao Campo
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                Mudas em Produção &amp; Despacho para Talhões
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Integração direta entre o ambiente protegido do viveiro e os talhões da fazenda. Acompanhe a germinação, rustificação e realize o transplante direto com apontamentos no Caderno de Campo.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-teal-300 font-bold block uppercase">Mudas no Viveiro</span>
                <span className="text-lg font-black text-white">
                  {batches.filter(b => b.status !== 'finalizado').reduce((sum, b) => sum + b.totalSeedsSown, 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-teal-300 font-bold block uppercase">Lotes Ativos</span>
                <span className="text-lg font-black text-white">
                  {batches.filter(b => b.status !== 'finalizado').length} lotes
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Prontas p/ Campo</span>
                <span className="text-lg font-black text-emerald-300">
                  {batches.filter(b => b.status === 'pronto_expedicao' || b.status === 'aclimatacao').reduce((sum, b) => sum + b.estimatedReadyPlants, 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-teal-300 font-bold block uppercase">Transplantadas</span>
                <span className="text-lg font-black text-white">
                  7.800 <span className="text-xs font-normal text-slate-300">(Talhão 03)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const readyBatch = batches.find(b => b.status === 'pronto_expedicao' || b.status === 'aclimatacao') || batches[0];
                  if (readyBatch) handleOpenTransplantModal(readyBatch);
                }}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Transplantar para Talhão</span>
              </button>
              <button
                onClick={() => setActiveTab('producao_mudas')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>Abrir Produção de Mudas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD DA INTEGRAÇÃO COM HIDROPONIA & ESTUFAS CONECTADAS */}
      {(() => {
        const hydroMetrics = getHydroponicSummaryMetrics();
        return (
          <div className="bg-gradient-to-r from-blue-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-teal-600/50 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-400/30 flex items-center gap-1.5 text-xs font-bold">
                    <Droplets className="w-4 h-4 text-teal-300" />
                    HIDROPONIA &amp; ESTUFAS CONECTADAS
                  </span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-200 font-extrabold px-2.5 py-0.5 rounded-full border border-teal-400/30 uppercase tracking-wider">
                    Sincronização Ativa em Tempo Real
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                    Central de Hidroponia &amp; Apontamentos Técnicos
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Todas as bancadas NFT/DFT, leituras de pH/CE, calibrações de reservatórios e diários de estufa são consolidados automaticamente no seu Caderno de Campo.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-teal-300 font-bold block uppercase">Plantas Ativas</span>
                    <span className="text-lg font-black text-white">
                      {(hydroMetrics.totalPlants || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-teal-300 font-bold block uppercase">Bancadas &amp; Estufas</span>
                    <span className="text-lg font-black text-white">
                      {hydroMetrics.activeBenches || 0} bancadas
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-emerald-300 font-bold block uppercase">Média pH / CE</span>
                    <span className="text-lg font-black text-emerald-300">
                      {hydroMetrics.avgPH || '6.0'} <span className="text-xs font-normal text-slate-300">pH</span> • {hydroMetrics.avgEC || '1.5'} <span className="text-xs font-normal text-slate-300">mS</span>
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-blue-300 font-bold block uppercase">Anotações Caderno</span>
                    <span className="text-lg font-black text-white">
                      {hydroMetrics.totalAnnotationsCount || 0} registros
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('hidroponia')}
                    className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-teal-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Anotação de Hidroponia</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('hidroponia')}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
                  >
                    <Droplets className="w-4 h-4 text-teal-300" />
                    <span>Ver Hidroponia no Caderno</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CARD DA INTEGRAÇÃO COM TANKMIX (CALDA & DEFENSIVOS) */}
      {(() => {
        const tmMetrics = getTankMixSummaryMetrics(operations);
        return (
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-600/50 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30 flex items-center gap-1.5 text-xs font-bold">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    TANKMIX (CALDA &amp; DEFENSIVOS)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                    Ordem de Adição WALES &amp; Compatibilidade Físico-Química
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                    Gestão de Calda, Defensivos &amp; Rastreabilidade Integrada
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Cálculo da sequência exata de mistura no tanque, teste de compatibilidade ICG, qualidade da água e geração automática da ordem de pulverização no Caderno de Campo.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-emerald-300 font-bold block uppercase">Aplicações Registradas</span>
                    <span className="text-lg font-black text-white">
                      {tmMetrics.totalApplications} aplicações
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-emerald-300 font-bold block uppercase">Volume Total Aplicado</span>
                    <span className="text-lg font-black text-white">
                      {tmMetrics.totalVolumeLiters.toLocaleString('pt-BR')} L
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-teal-300 font-bold block uppercase">Média pH da Calda</span>
                    <span className="text-lg font-black text-teal-300">
                      {tmMetrics.avgPh} <span className="text-xs font-normal text-slate-300">pH</span>
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-emerald-300 font-bold block uppercase">Investimento Fitossanitário</span>
                    <span className="text-lg font-black text-white">
                      R$ {tmMetrics.totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('tankmix')}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Preparar Nova Calda / TankMix</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tankmix')}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4 text-emerald-300" />
                    <span>Abrir TankMix no Caderno</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CARD DA AVICULTURA DE PRECISÃO INTEGRADA */}
      <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-amber-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-400/30 flex items-center gap-1.5 text-xs font-bold">
                <Egg className="w-4 h-4 text-amber-400" />
                AVICULTURA DE PRECISÃO INTEGRADA
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                Manejo, Ambiência &amp; Rastreabilidade Avícola
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                Galpões de Frangos de Corte &amp; Poedeiras
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Acompanhamento zootécnico em tempo real de lotes avícolas, controle de mortalidade, conversão alimentar (CA), índice de eficiência (IEA), monitoramento de ITH e vacinação sanitária integrados ao Caderno de Campo.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-amber-300 font-bold block uppercase">Lotes Alojados</span>
                <span className="text-lg font-black text-white">3 Lotes</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-amber-300 font-bold block uppercase">Aves Ativas</span>
                <span className="text-lg font-black text-white">85.000 aves</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Conv. Alimentar (CA)</span>
                <span className="text-lg font-black text-emerald-300">1,58 kg/kg</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-amber-300 font-bold block uppercase">Produção de Ovos</span>
                <span className="text-lg font-black text-white">9.420 /dia</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('avicultura')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Bird className="w-4 h-4" />
                <span>Abrir Avicultura de Precisão</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD DA NUTRIÇÃO ANIMAL INTEGRADA */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30 flex items-center gap-1.5 text-xs font-bold">
                <Wheat className="w-4 h-4 text-emerald-400" />
                NUTRIÇÃO ANIMAL INTEGRADA
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                Fórmulas, Dietas &amp; Planejamento Forrageiro
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                Ingredientes &amp; Balanço Bromatológico de Precisão
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Formulação linear estocástica de dietas de custo mínimo, cálculo de lucro sobre alimentação (IOFC), análise nutricional de alimentos e planejamento de pastagens integrados para rastreabilidade de rebanhos.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Dietas Formuladas</span>
                <span className="text-lg font-black text-white">14 Fórmulas</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Custo Médio /kg</span>
                <span className="text-lg font-black text-white">R$ 1,45</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">IOFC (Margem)</span>
                <span className="text-lg font-black text-emerald-300">R$ 18,20 /dia</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Plano Forrageiro</span>
                <span className="text-lg font-black text-white">12 meses</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('nutricao_animal')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Wheat className="w-4 h-4" />
                <span>Abrir Nutrição Animal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD DA BOVINOCULTURA INTEGRADA */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30 flex items-center gap-1.5 text-xs font-bold">
                <BovinoIcon className="w-4 h-4 text-blue-400" />
                BOVINOCULTURA INTEGRADA (CORTE &amp; LEITE)
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-200 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-400/30 uppercase tracking-wider">
                RFID, GMD &amp; Índice ISPA de Sustentabilidade
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                Rastreabilidade de Rebanho &amp; Manejo Rotacionado
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Controle sanitário individual, ganho de peso diário (GMD) por pesagem eletrônica, gerenciamento de lotes reprodutivos IATF e monitoramento por satélite de pastagens integrados ao Caderno de Campo.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-blue-300 font-bold block uppercase">Cabeças Ativas</span>
                <span className="text-lg font-black text-white">482 cab</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-blue-300 font-bold block uppercase">Ganho Médio (GMD)</span>
                <span className="text-lg font-black text-white">1,12 kg/dia</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Taxa de Prenhez</span>
                <span className="text-lg font-black text-emerald-300">84,5%</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-blue-300 font-bold block uppercase">Índice ISPA Pasto</span>
                <span className="text-lg font-black text-white">8,9 /10</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('pecuaria')}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <BovinoIcon className="w-4 h-4" />
                <span>Abrir Bovinocultura</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD DA SUINOCULTURA INTEGRADA */}
      <div className="bg-gradient-to-r from-rose-950 via-red-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-rose-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-400/30 flex items-center gap-1.5 text-xs font-bold">
                <SuinoIcon className="w-4 h-4 text-rose-400" />
                SUINOCULTURA DE ALTA PERFORMANCE
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-200 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-400/30 uppercase tracking-wider">
                Ciclo Completo, Creche Climatizada &amp; Índice IES Biosseguro
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                Maternidade, Creche &amp; Terminação Controlada
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Gerenciamento do plantel do nascimento ao abate. Histórico de partos por matriz, creches com climatização dinâmica, acompanhamento do fluxo de pipeline e monitoramento das diretrizes sanitárias IES GeaAgro.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-rose-300 font-bold block uppercase">Matrizes Ativas</span>
                <span className="text-lg font-black text-white">120 Fêmeas</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-rose-300 font-bold block uppercase">Leitões Desmamados</span>
                <span className="text-lg font-black text-white">2.840 leitões</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Conv. Feed (CA)</span>
                <span className="text-lg font-black text-emerald-300">2,35 kg/kg</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-rose-300 font-bold block uppercase">Índice IES Saúde</span>
                <span className="text-lg font-black text-white">9,2 /10</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('suinocultura')}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <SuinoIcon className="w-4 h-4" />
                <span>Abrir Suinocultura</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD DA PLANTABILIDADE & QUALIDADE DE SEMEADURA INTEGRADA */}
      {(() => {
        const plantabilityMetrics = getPlantabilitySummaryMetrics(operations);
        return (
          <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-amber-600/50 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-400/30 flex items-center gap-1.5 text-xs font-bold">
                    <Compass className="w-4 h-4 text-amber-400" />
                    PLANTABILIDADE &amp; QUALIDADE DE SEMEADURA
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-200 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                    Singulação, Falhas, Duplas &amp; CV%
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                    Gestão de Plantabilidade Integrada ao Caderno de Campo
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Auditoria de distribuição longitudinal de sementes, velocidade de semeadura, cálculo de CV% e estande de plantas por metro diretamente sincronizados ao Caderno de Campo.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-amber-300 font-bold block uppercase">Singulação Aceitável</span>
                    <span className="text-lg font-black text-emerald-400">
                      {plantabilityMetrics.avgAcceptablePct}%
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-amber-300 font-bold block uppercase">Coef. Variação (CV)</span>
                    <span className="text-lg font-black text-amber-300">
                      {plantabilityMetrics.avgCvPct}%
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-amber-300 font-bold block uppercase">Pontos Amostrados</span>
                    <span className="text-lg font-black text-white">
                      {plantabilityMetrics.totalPointsCount} pontos
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-amber-300 font-bold block uppercase">Semeadouras Mapeadas</span>
                    <span className="text-lg font-black text-white">
                      {plantabilityMetrics.plantersCount} máquinas
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('plantabilidade')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Abrir Plantabilidade no Caderno</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Linha do Tempo Recente
            </h3>
            <button className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Ver Histórico Completo</button>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-zinc-700 before:to-transparent">
            {operations.length === 0 ? (
              <div className="text-center py-10 px-4 space-y-3 relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs rounded-xl">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Nenhuma operação registrada ainda</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Os lançamentos de preparo de solo, plantio, adubação e pulverizações da fazenda aparecerão aqui em tempo real.
                </p>
                <button
                  onClick={handleOpenNewOperation}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Primeira Operação</span>
                </button>
              </div>
            ) : (
              operations.map((op, idx) => (
                <div key={op.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    {op.type === 'soil_prep' && <Tractor className="w-4 h-4" />}
                    {op.type === 'planting' && <Sprout className="w-4 h-4" />}
                    {op.type === 'plantability_evaluation' && <Compass className="w-4 h-4 text-amber-500" />}
                    {op.type === 'nursery_transplant' && <Flower2 className="w-4 h-4 text-emerald-600" />}
                    {op.type === 'nursery_sowing' && <Sprout className="w-4 h-4 text-teal-600" />}
                    {op.type === 'nursery_hardening' && <Sun className="w-4 h-4 text-amber-600" />}
                    {op.type === 'spraying' && <Bug className="w-4 h-4" />}
                    {op.type === 'fertility' && <Leaf className="w-4 h-4" />}
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-white">
                        {op.type === 'plantability_evaluation' ? 'AVALIAÇÃO DE PLANTABILIDADE' :
                         op.type === 'nursery_transplant' ? 'TRANSPLANTE DE MUDAS (VIVEIRO)' :
                         op.type === 'nursery_sowing' ? 'SEMEADURA EM VIVEIRO' :
                         op.type === 'nursery_hardening' ? 'RUSTIFICAÇÃO EM VIVEIRO' :
                         op.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{new Date(op.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">Talhão: {fields.find(f => f.id === op.fieldId)?.name}</p>
                    
                    {op.details.nurseryBatchId && (
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 mb-1">
                        <Flower2 className="w-3.5 h-3.5"/> Lote Viveiro: {op.details.nurseryBatchId} {op.details.seedlingCount ? `(${op.details.seedlingCount.toLocaleString()} mudas)` : ''}
                      </p>
                    )}
                    {op.details.machine && <p className="text-xs text-slate-500 flex items-center gap-1"><Tractor className="w-3 h-3"/> {op.details.machine}</p>}
                    {op.details.product && <p className="text-xs text-slate-500 flex items-center gap-1"><Target className="w-3 h-3"/> {op.details.product}</p>}
                    
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        op.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                        op.status === 'planned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                      }`}>
                        {op.status}
                      </span>
                      <span className="text-xs text-slate-500">{op.responsible}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Weather */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-xl p-6 shadow-sm text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sun className="w-24 h-24" />
            </div>
            <h3 className="font-bold text-lg mb-4 relative z-10">Microclima da Fazenda</h3>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wider font-semibold">Temperatura</p>
                <p className="text-2xl font-black flex items-center gap-1"><ThermometerSun className="w-5 h-5"/> 32°C</p>
              </div>
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wider font-semibold">Umidade</p>
                <p className="text-2xl font-black flex items-center gap-1"><Droplets className="w-5 h-5"/> 45%</p>
              </div>
              <div className="col-span-2">
                <p className="text-emerald-100 text-xs uppercase tracking-wider font-semibold">Condição de Pulverização</p>
                <div className="mt-1 flex items-center gap-2 text-sm bg-black/20 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-300" />
                  Ventos acima de 12km/h. Risco de deriva.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-600" />
                Ações Rápidas
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 uppercase tracking-wider">
                Atalhos
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Card 1: Cadastrar Propriedade / Fazenda */}
              <button
                onClick={handleNavigateToRegister}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group text-left cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 block">
                      Cadastrar Propriedade / Fazenda
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                      Gerenciar fazendas, matrículas e produtores
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Card 2: Novo Registro de Operação */}
              <button
                onClick={handleOpenNewOperation}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-600 shrink-0 transition-colors">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 block">
                      Novo Registro de Operação
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                      Apontar plantio, adubação ou colheita
                    </span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all shrink-0" />
              </button>

              {/* Card 3: Talhões & Culturas */}
              <button
                onClick={() => setActiveTab('fields')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-600 shrink-0 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 block">
                      Talhões &amp; Culturas
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                      Mapeamento de área, variedades e safras
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Card 4: Monitoramento MIP & Nematologia */}
              <button
                onClick={() => setActiveTab('nematology')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-600 shrink-0 transition-colors">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 block">
                      Monitoramento Pragas &amp; MIP
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                      Nematologia, pragas-alvo e armadilhas
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Card 5: Produção de Mudas & Viveiro */}
              <button
                onClick={() => setActiveTab('producao_mudas')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 group-hover:text-teal-600 shrink-0 transition-colors">
                    <Flower2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 block">
                      Produção de Mudas (Viveiro)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                      Lotes em estufas e expedição a campo
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const [selectedNemaFieldId, setSelectedNemaFieldId] = useState<string>(fields[0]?.id || 'fld-1');

  const handleAddNematicideOperation = (fieldId: string, product: string, dosage: string) => {
    const field = fields.find(f => f?.id === fieldId) || fields[0];
    const newOp: FieldOperation = {
      id: `op-nema-${Date.now()}`,
      farmId: farm?.id || 'farm-1',
      fieldId: field?.id || 'fld-1',
      type: 'spraying',
      status: 'planned',
      date: new Date().toISOString().split('T')[0],
      responsible: 'Eng. Lucas (Agrônomo)',
      details: {
        product: product,
        dose: parseFloat(dosage) || 2,
        volume: 150,
        target: 'Controle de Fitonematoides'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOperations(prev => [newOp, ...prev]);
    setSyncMessage(`Operação de Nematicida Biológico (${product}) planejada com sucesso no Caderno de Campo para o ${field.name}!`);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const renderNematologySubTab = () => {
    const selectedField = fields.find(f => f.id === selectedNemaFieldId) || fields[0];
    if (!selectedField) return null;

    // Get specific nematode data for the chosen field
    const isField2 = selectedField.id === 'fld-2';
    
    const nematodeData = {
      fieldName: selectedField.name,
      crop: selectedField.crop,
      variety: selectedField.variety,
      risk: isField2 ? 'Alta' : 'Moderada',
      dominantSpeciesName: isField2 ? 'Meloidogyne javanica' : 'Pratylenchus brachyurus',
      dominantSpeciesCommon: isField2 ? 'Nematoides das Galhas' : 'Nematoides das Lesões Radiculares',
      populationSoil: isField2 ? 350 : 150,
      populationRoot: isField2 ? 1200 : 450,
      pi: isField2 ? 1000 : 600,
      pf: isField2 ? 1250 : 200,
      fr: isField2 ? 1.25 : 0.33,
      bionematicide: isField2 ? 'Purpureocillium lilacinum + Bacillus methylotrophicus' : 'Bacillus subtilis + Trichoderma asperellum',
      dosage: isField2 ? '3.0 L/ha' : '2.0 L/ha',
      history: [
        { date: '2026-02-15', soil: isField2 ? 280 : 110, root: isField2 ? 900 : 380, operator: 'Eng. Lucas', type: 'Solo e Raiz' },
        { date: '2026-05-10', soil: isField2 ? 350 : 150, root: isField2 ? 1200 : 450, operator: 'Eng. Lucas', type: 'Solo e Raiz' }
      ]
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header & Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Microscope className="w-6 h-6 text-emerald-600" />
              Monitoramento & Controle de Nematoides
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Integração fitossanitária de análises nematológicas com o Caderno de Campo.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 whitespace-nowrap">Filtrar Talhão:</label>
            <select
              value={selectedNemaFieldId}
              onChange={(e) => setSelectedNemaFieldId(e.target.value)}
              className="w-full md:w-64 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.crop})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status & Key Metrics Card */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/60 pb-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Diagnóstico Técnico Recente</h4>
                <p className="text-xs text-slate-400">Coleta realizada com coordenadas de GPS do talhão.</p>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                nematodeData.risk === 'Alta'
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
              }`}>
                Risco: {nematodeData.risk}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Espécie Dominante</span>
                <strong className="text-sm text-slate-800 dark:text-white italic block truncate" title={nematodeData.dominantSpeciesName}>
                  {nematodeData.dominantSpeciesName}
                </strong>
                <span className="text-[10px] text-slate-400 block">({nematodeData.dominantSpeciesCommon})</span>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">População Solo (200cm³)</span>
                <strong className="text-lg text-slate-800 dark:text-white block font-black">
                  {nematodeData.populationSoil}
                </strong>
                <span className="text-[10px] text-slate-400 block">Indivíduos Ativos</span>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:bg-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">População Raiz (10g)</span>
                <strong className="text-lg text-slate-800 dark:text-white block font-black">
                  {nematodeData.populationRoot}
                </strong>
                <span className="text-[10px] text-slate-400 block">Presença Intradérmica</span>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fator Reprodução (FR)</span>
                <strong className={`text-lg block font-black ${nematodeData.fr < 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {nematodeData.fr} {nematodeData.fr < 1 ? '📉' : '📈'}
                </strong>
                <span className="text-[10px] text-slate-400 block">
                  {nematodeData.fr < 1 ? 'População em queda' : 'População em alta'}
                </span>
              </div>
            </div>

            {/* Sampling history table */}
            <div className="space-y-3">
              <h5 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Histórico de Amostragem Georreferenciada</h5>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="py-2.5 px-4">Data da Coleta</th>
                      <th className="py-2.5 px-4">Tipo de Amostra</th>
                      <th className="py-2.5 px-4">Solo (200cm³)</th>
                      <th className="py-2.5 px-4">Raiz (10g)</th>
                      <th className="py-2.5 px-4">Responsável Técnico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {nematodeData.history.map((hist, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-zinc-800/20">
                        <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-zinc-300">{hist.date}</td>
                        <td className="py-2.5 px-4 text-slate-500">{hist.type}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{hist.soil}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{hist.root}</td>
                        <td className="py-2.5 px-4 text-slate-500">{hist.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Planner / Prescription Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-4">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Prescrição de Manejo Integrado
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Mapeamento biológico de combate ativo</p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">🌿 Sugestão Biológica Ativa</p>
                  <p className="text-[11px] leading-relaxed">
                    Aplicação no sulco de semeadura com o nematicida biológico: <strong className="text-slate-800 dark:text-white">{nematodeData.bionematicide}</strong> na dosagem recomendada de <strong>{nematodeData.dosage}</strong>.
                  </p>
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">🌾 Rotação Antagonista de Outono</p>
                  <p className="text-[11px] leading-relaxed">
                    Para quebrar o ciclo reprodutivo do nematoide dominante, planeje a semeadura de <em>Crotalaria ochroleuca</em> após a colheita da cultura principal.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/60 mt-4">
              <button
                onClick={() => handleAddNematicideOperation(selectedField.id, nematodeData.bionematicide, nematodeData.dosage)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Planejar Nematicida no Caderno</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                Adiciona a pulverização biológica planejada diretamente na folha de tarefas do Caderno de Campo.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDigitalTwin = () => {
    const selectedField = fields.find(f => f?.id === selectedTwinFieldId) || fields[0];
    if (!selectedField) return null;

    const matchingSample = (soilSamples || []).find(s => 
      farm?.id && s?.farmId === farm.id && (
        s?.plotId === selectedField?.id || 
        (selectedField?.id === 'fld-1' && s?.plotId === 'plot-1-1') ||
        (selectedField?.id === 'fld-2' && s?.plotId === 'plot-1-2') ||
        (s?.plotId && selectedField?.id && s.plotId.includes(selectedField.id)) ||
        (selectedField?.id && s?.plotId && selectedField.id.includes(s.plotId))
      )
    ) || (soilSamples || []).find(s => farm?.id && s?.farmId === farm.id);

    const plotForCalc: FieldPlot = {
      id: selectedField.id,
      name: selectedField.name,
      farmId: selectedField.farmId,
      areaHa: selectedField.areaHa,
      texture: 'medio',
      clayPercentage: matchingSample?.clayPercent || 35,
      currentCrop: selectedField.crop,
      spacingBetweenRowsMeters: 0.5,
      spacingBetweenPlantsMeters: 0.1,
      plantPopulationPerHa: 200000,
      linearMetersPerHa: 20000,
      irrigationType: 'sequeiro'
    };

    const cropTarget = CROPS_CATALOG.find(c => {
      const fieldCrop = (selectedField.crop || '').toLowerCase();
      const catalogCrop = (c?.name || '').toLowerCase();
      return catalogCrop.includes(fieldCrop) || fieldCrop.includes(catalogCrop);
    }) || CROPS_CATALOG[0];

    const limingRec = matchingSample ? calculateLiming(matchingSample, plotForCalc, cropTarget, 85, 20, 100, 'base_saturation') : null;
    const gypsumRec = matchingSample ? calculateGypsum(matchingSample, undefined, plotForCalc, cropTarget) : null;
    const fertRec = matchingSample ? calculateFertilization(matchingSample, plotForCalc, cropTarget) : null;

    const renderLayerDetails = () => {
      switch (activeLayer) {
        case 'soil':
          return (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-zinc-800 pb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Laudo de Recomendação: Correção do Solo</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Recomendação integrada de calagem e gessagem calculada em tempo real.</p>
                  </div>
                </div>
                {matchingSample && (
                  <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/30 w-fit">
                    Amostra: {matchingSample.sampleCode}
                  </span>
                )}
              </div>

              {!matchingSample ? (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
                  <p className="font-semibold text-sm">Nenhuma análise de solo vinculada a este talhão.</p>
                  <p className="text-xs mt-1">Cadastre uma análise química para gerar recomendações.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">pH CaCl₂</span>
                      <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.phCaCl2 || '-'}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">M.O. (g/dm³)</span>
                      <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.organicMatterGdm3 || '-'}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Argila (%)</span>
                      <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.clayPercent || '-'}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">P Mehlich</span>
                      <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.pMehlich1MgDm3 || '-'}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">V% Atual</span>
                      <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.vPercent || '-'}%</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">CTC (T)</span>
                      <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.ctcTotal || '-'}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                        <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          Recomendação de Calagem
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
                          V% Alvo: {cropTarget.targetVPercent}%
                        </span>
                      </div>
                      
                      {limingRec && limingRec.dose.kgPerHa > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                              {(limingRec.dose.kgPerHa / 1000).toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-slate-600 dark:text-zinc-400">t / ha</span>
                          </div>
                          
                          <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                            <p><strong>Calcário Indicado:</strong> {limingRec.limestoneTypeRecommended === 'dolomitico' ? 'Dolomítico (>12% MgO)' : limingRec.limestoneTypeRecommended === 'calcico' ? 'Calcítico' : 'Magnesiano'}</p>
                            <p><strong>Distribuição Linear:</strong> {limingRec.dose.gPerLinearMeter} g/m de sulco</p>
                            <p><strong>Justificativa:</strong> {limingRec.justification}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          Saturação por bases atual de {matchingSample?.vPercent}% é adequada para {cropTarget.name}. Calagem dispensada.
                        </p>
                      )}
                    </div>

                    <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                        <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          Recomendação de Gessagem
                        </span>
                        {gypsumRec?.isNeeded ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full">Recomendado</span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">Dispensado</span>
                        )}
                      </div>
                      
                      {gypsumRec?.isNeeded ? (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                              {(gypsumRec.dose.kgPerHa / 1000).toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-slate-600 dark:text-zinc-400">t / ha</span>
                          </div>
                          
                          <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                            <p><strong>Aplicação:</strong> {gypsumRec.applicationMode}</p>
                            <p><strong>Justificativa:</strong> {gypsumRec.justification}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          {gypsumRec?.justification || 'Subsolo livre de barreiras de alumínio tóxico ou acidez severa. Gessagem dispensada.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );

        case 'fertility':
          return (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Recomendação Nutricional NPK (Adubação de Plantio)</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Cálculo de adubação específico para a cultura {selectedField.crop}.</p>
                  </div>
                </div>
              </div>

              {!matchingSample ? (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
                  <p className="font-semibold text-sm">Nenhuma análise de solo vinculada para calibrar a adubação.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nitrogênio (N)</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                          {fertRec?.plantingFertilizer.nutrientsProvidedKgHa.n || 20}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">kg/ha</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Manejo biológico (Inoculação) + adubação de arranque.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fósforo (P₂O₅)</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                          {fertRec?.plantingFertilizer.nutrientsProvidedKgHa.p2o5 || 80}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">kg/ha</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Dose ajustada para a classe de argila do solo ({matchingSample.clayPercent}%).</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potássio (K₂O)</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                          {fertRec?.plantingFertilizer.nutrientsProvidedKgHa.k2o || 60}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">kg/ha</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Equilibra a nutrição cellular de potássio na fase de crescimento.</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
                    <h5 className="font-bold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                      <Tractor className="w-4 h-4" />
                      Sugestão de Formulação Comercial Equivalente
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 text-slate-700 dark:text-zinc-300">
                        <p><strong>Formulação Recomendada:</strong> {fertRec?.plantingFertilizer.formulaName || 'NPK 04-30-10'}</p>
                        <p><strong>Dose do Formulador Comercial:</strong> {fertRec?.plantingFertilizer.dose.kgPerHa || 300} kg/ha</p>
                      </div>
                      <div className="space-y-1 text-slate-700 dark:text-zinc-300">
                        <p><strong>Quantidade Linear de Plantio:</strong> {fertRec?.plantingFertilizer.dose.gPerLinearMeter || 15} g/metro linear</p>
                        <p><strong>Cobertura Recomendada:</strong> Cloreto de Potássio (KCl) se houver déficit severo.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );

        case 'spraying':
          return (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div className="p-2 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Janela Sanitária & Alertas de MIP</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Condições de pulverização e monitoramento integrado de pragas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                  <span className="font-extrabold text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-orange-500" />
                    Janela Climática para Pulverização
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Vento</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">8.2 km/h</strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">UR %</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">62%</strong>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Temp.</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">26.4°C</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    ✓ Condições meteorológicas ideais para aplicação com baixo risco de deriva.
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                  <span className="font-extrabold text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <Bug className="w-4 h-4 text-amber-500" />
                    Monitoramento Recente de Pragas
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-2 rounded-lg border border-slate-100 dark:border-zinc-700">
                      <span>Percevejo-marrom</span>
                      <span className="font-bold text-amber-600">0.8 ind./m (Atenção)</span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-2 rounded-lg border border-slate-100 dark:border-zinc-700">
                      <span>Lagarta-da-Soja</span>
                      <span className="font-bold text-emerald-600">Sob controle</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'satellite':
          return (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Sensoriamento NDVI & Vigor Vegetativo</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Análise espectral de vigor fotossintético e biomassa ativa.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-slate-400 block">Variação NDVI (Últimos 30 dias)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">0.78</span>
                    <span className="text-xs text-slate-400">(Vigor máximo est. 0.85)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500">Crescimento foliar uniforme e excelente atividade de clorofila.</p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-slate-400 block">Histórico de Cobertura NDVI</span>
                  <div className="text-xs space-y-1 text-slate-600 dark:text-zinc-400">
                    <p>• <strong>Há 15 dias:</strong> 0.74 (Estádio vegetativo ativo)</p>
                    <p>• <strong>Há 30 dias:</strong> 0.61 (Fechamento de entrelinhas)</p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'nematology':
          {
            // Find a nematode report matching the selected field or fallback
            const matchedNemaField = INITIAL_NEMATODE_FIELDS.find(nf => 
              nf.fieldName?.toLowerCase().includes(selectedField.name.toLowerCase()) ||
              selectedField.name.toLowerCase().includes(nf.fieldName?.toLowerCase() || '') ||
              (selectedField.id === 'fld-1' && nf.id === 'field-01')
            );

            if (!matchedNemaField) {
              return (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Microscope className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Nenhum Laudo Nematológico Cadastrado</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Não existem dados ou amostras de nematoides registradas para este talhão ({selectedField.name}). Acesse o módulo de Nematologia para cadastrar novas análises.
                  </p>
                </div>
              );
            }

            const dominantSpecies = NEMATODE_SPECIES_CATALOG.find(s => s.id === matchedNemaField.dominantSpeciesId) || NEMATODE_SPECIES_CATALOG[0];
            const fr = matchedNemaField.reproductionFactor || 0;

            return (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-zinc-800 pb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                      <Microscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Laudo de Diagnóstico & Risco Nematológico</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Análise laboratorial de fitonematoides integrada ao Caderno de Campo.</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border w-fit ${
                    matchedNemaField.currentRisk === 'Alta' || matchedNemaField.currentRisk === 'Muito Alta'
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : matchedNemaField.currentRisk === 'Moderada'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    Risco de Infestação: {matchedNemaField.currentRisk || 'Não Definido'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Espécie Dominante</span>
                    <strong className="text-xs text-slate-800 dark:text-white italic block truncate" title={dominantSpecies.scientificName}>
                      {dominantSpecies.scientificName}
                    </strong>
                    <span className="text-[9px] text-slate-400 block">({dominantSpecies.commonName})</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Solo (200cm³)</span>
                    <strong className="text-sm text-slate-800 dark:text-white block">
                      {matchedNemaField.labResults[0]?.populationSoil200cm3 || 150} nematoides
                    </strong>
                    <span className="text-[9px] text-slate-400 block">População Inicial (Pi)</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Raiz (10g)</span>
                    <strong className="text-sm text-slate-800 dark:text-white block">
                      {matchedNemaField.labResults[0]?.populationRoot10g || 450} nematoides
                    </strong>
                    <span className="text-[9px] text-slate-400 block">Dano Tecidual Direto</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Fator Reprodução (FR)</span>
                    <strong className={`text-sm block ${fr < 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {fr} {fr < 1 ? '📉' : '📈'}
                    </strong>
                    <span className="text-[9px] text-slate-400 block">
                      {fr < 1 ? 'População em declínio' : 'População em aumento'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recomendações Biológicas e de Rotação */}
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        Manejo Biológico Recomendado
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-2">
                      <p><strong>Bionematicida de escolha:</strong> <em>Bacillus subtilis</em> + <em>Trichoderma asperellum</em> no sulco de plantio.</p>
                      <p><strong>Dosagem indicada:</strong> 2,0 Litros / hectare para inoculação vigorosa e barreira protetora radicular.</p>
                      <p><strong>Modo de Ação:</strong> Coloniza a rizosfera, competindo por espaço/nutrientes e secretando metabólitos nematicidas que inativam juvenis de 2º estágio (J2).</p>
                    </div>
                  </div>

                  {/* Culturas de Rotação e Cobertura */}
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                        <Dna className="w-4 h-4 text-blue-500" />
                        Planejamento de Rotação (Anti-Nematoides)
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-2">
                      <p><strong>Planta de Cobertura Indicada:</strong> <em>Crotalaria ochroleuca</em> ou <em>Crotalaria spectabilis</em>.</p>
                      <p><strong>Efeito de Supressão:</strong> Age como planta armadilha. Os nematoides penetram nas raízes mas não conseguem completar o ciclo reprodutivo.</p>
                      <p><strong>Benefício Adicional:</strong> Fixação biológica de Nitrogênio (FBN) e aporte massivo de matéria orgânica no perfil do solo.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg text-xs flex gap-2.5 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-300 font-medium">
                    <strong>Alerta de Manejo Integrado:</strong> Evite tráfego desnecessário de maquinários pesados deste talhão para áreas livres sem prévia lavagem das rodas com jato sob pressão. Os nematoides são disseminados via partículas de solo aderidas aos pneus.
                  </p>
                </div>
              </div>
            );
          }

        default:
          return null;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header and Field Selection */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Painel do Gêmeo Digital
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">Visão integrada e histórico completo do talhão.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Talhão:</label>
            <select
              value={selectedTwinFieldId}
              onChange={(e) => setSelectedTwinFieldId(e.target.value)}
              className="flex-1 md:w-64 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.areaHa} ha)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Area (Map/Status) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              {/* Map Placeholder */}
              <div className="h-64 bg-slate-100 dark:bg-zinc-800 relative flex items-center justify-center border-b border-slate-200 dark:border-zinc-800 overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586771107445-d3af116ab85e?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30 dark:opacity-20 group-hover:opacity-40 dark:group-hover:opacity-30 transition-opacity mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <Navigation className="w-10 h-10 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-bounce" />
                  <span className="bg-emerald-900/80 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 backdrop-blur-sm">
                    Sincronizado: Hoje, 08:30
                  </span>
                </div>
                
                {/* Overlay Metrics */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                  <div>
                    <h4 className="text-white font-black text-2xl drop-shadow-md">{selectedField?.name || 'Talhão'}</h4>
                    <p className="text-emerald-300 font-bold text-sm drop-shadow-md">{selectedField?.crop || 'Cultura'} • {selectedField?.variety || 'Variedade'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs uppercase tracking-wider font-bold drop-shadow-md">Área</p>
                    <p className="text-white font-black text-xl drop-shadow-md">{selectedField?.areaHa || 0} ha</p>
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-zinc-800/50 text-center">
                <div className="p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Fase Fenológica</p>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">V4 (Vegetativo)</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Índice de Vigor (NDVI)</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">0.78 (Alto)</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Umidade do Solo</p>
                  <p className="font-bold text-orange-600 dark:text-orange-400 text-sm">42% (Atenção)</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Produtividade Est.</p>
                  <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm">72 sc/ha</p>
                </div>
              </div>
            </div>

            {/* Layer Details & Integrated Agronomic Recommendations */}
            {renderLayerDetails()}

            {/* Timline/History */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
               <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-emerald-600" />
                 Histórico Operacional (Safra {selectedField.season})
               </h4>
               <div className="space-y-4 pl-2">
                 {operations.filter(o => o.fieldId === selectedField.id).length === 0 ? (
                   <p className="text-sm text-slate-500 text-center py-4">Nenhuma operação registrada para este talhão.</p>
                 ) : (
                   operations.filter(o => o.fieldId === selectedField.id).map(op => (
                     <div key={op.id} className="flex gap-4 items-start relative before:absolute before:left-5 before:top-10 before:bottom-[-16px] before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-900/40 last:before:hidden">
                       <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border-2 border-white dark:border-zinc-900 z-10 text-emerald-600 dark:text-emerald-500 shadow-sm">
                         {op.type === 'soil_prep' && <Tractor className="w-4 h-4" />}
                         {op.type === 'planting' && <Sprout className="w-4 h-4" />}
                         {op.type === 'spraying' && <Bug className="w-4 h-4" />}
                         {op.type === 'fertility' && <FlaskConical className="w-4 h-4" />}
                       </div>
                       <div className="flex-1 bg-slate-50 dark:bg-zinc-800/30 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors cursor-pointer">
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">{op.type.replace('_', ' ')}</span>
                           <span className="text-xs font-mono text-slate-500 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-zinc-800">{new Date(op.date).toLocaleDateString('pt-BR')}</span>
                         </div>
                         <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-3">{op.details.machine || op.details.product}</p>
                         <div className="flex gap-2">
                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                             op.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                             op.status === 'planned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                             'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                           }`}>
                             {op.status}
                           </span>
                           {op.costs && (
                             <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded font-bold uppercase">
                               R$ {(op.costs.total ?? 0).toLocaleString()}
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>

          {/* Side Panels (Layers & Costs) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                 <Layers className="w-5 h-5 text-emerald-600" />
                 Camadas do Gêmeo
              </h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveLayer('soil')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all group ${
                    activeLayer === 'soil' 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${activeLayer === 'soil' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'}`}>
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Análises de Solo</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>

                <button 
                  onClick={() => setActiveLayer('fertility')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all group ${
                    activeLayer === 'fertility' 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${activeLayer === 'fertility' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'}`}>
                      <Leaf className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Adubações & Fertilidade</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>

                <button 
                  onClick={() => setActiveLayer('spraying')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all group ${
                    activeLayer === 'spraying' 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${activeLayer === 'spraying' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'}`}>
                      <Bug className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Pulverizações & MIP</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>

                <button 
                  onClick={() => setActiveLayer('satellite')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all group ${
                    activeLayer === 'satellite' 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${activeLayer === 'satellite' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'}`}>
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Fotografias & Satélite</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>

                <button 
                  onClick={() => setActiveLayer('nematology')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all group ${
                    activeLayer === 'nematology' 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${activeLayer === 'nematology' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'}`}>
                      <Microscope className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Nematologia & Sanidade</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-emerald-600" />
                 Custos & Fechamento
              </h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-600 dark:text-zinc-400">Insumos Aplicados</span>
                    <span className="font-bold text-slate-800 dark:text-white">R$ 45.000,00</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-600 dark:text-zinc-400">Horas Máquina</span>
                    <span className="font-bold text-slate-800 dark:text-white">R$ 12.500,00</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Custo Consolidado por Hectare</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">R$ 3.250<span className="text-sm font-bold text-slate-400">,00</span><span className="text-xs font-semibold text-slate-500 ml-1">/ha</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGlobalGapAudit = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Banner do Certificado GlobalG.A.P. */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/60 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/40 text-xs font-black flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  GLOBALG.A.P. CERTIFIED (IFA v6.0 - Smart)
                </span>
                <span className="px-3 py-1 bg-white/10 text-white font-mono font-bold text-xs rounded-full border border-white/20">
                  {globalGapAudit.certificateNumber}
                </span>
                <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  CERTIFICADO VÁLIDO
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Auditoria de Boas Práticas Agrícolas e Rastreabilidade
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Propriedade: <strong className="text-white">{globalGapAudit.farmName}</strong> • Organismo Certificador: <strong className="text-white">{globalGapAudit.certificationBody}</strong>
                </p>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Auditoria de Renovação realizada em <strong>{globalGapAudit.auditDate.includes('-') ? globalGapAudit.auditDate.split('-').reverse().join('/') : globalGapAudit.auditDate}</strong> por <strong>{globalGapAudit.auditorName}</strong> • Válido até <strong>{globalGapAudit.expiryDate.includes('-') ? globalGapAudit.expiryDate.split('-').reverse().join('/') : globalGapAudit.expiryDate}</strong>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {globalGapAudit.scope.map((item, idx) => (
                  <span key={idx} className="text-[11px] bg-emerald-950/80 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-800/60 font-medium">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Score Box */}
            <div className="bg-emerald-950/80 p-5 rounded-2xl border border-emerald-600/40 text-center lg:text-right shrink-0 min-w-[240px] shadow-inner space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-extrabold block">Conformidade Consolidada</span>
              <div className="text-4xl font-black text-white tracking-tight">
                {globalGapAudit.complianceScore.overallPct}<span className="text-2xl text-emerald-400">%</span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium space-y-0.5 border-t border-emerald-800/60 pt-2">
                <div className="flex justify-between gap-2">
                  <span className="text-emerald-300 font-bold">Major Musts:</span>
                  <span className="font-bold text-white">{globalGapAudit.complianceScore.majorMustsPct}% (Exigido: 100%)</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-teal-300 font-bold">Minor Musts:</span>
                  <span className="font-bold text-white">{globalGapAudit.complianceScore.minorMustsPct}% (Exigido: 95%)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleOpenEditAuditModal}
                  className="w-full py-2 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 font-bold text-xs rounded-xl transition-all border border-emerald-600/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-emerald-400" />
                  <span>Preencher / Editar Dados</span>
                </button>
                <button
                  onClick={() => setIsGlobalGapModalOpen(true)}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Relatório Executivo PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Abas Internas da Auditoria GlobalG.A.P. */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveGlobalGapSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeGlobalGapSubTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Visão Geral &amp; Módulos</span>
          </button>

          <button
            onClick={() => setActiveGlobalGapSubTab('chapters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeGlobalGapSubTab === 'chapters'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Capítulos Auditados IFA ({(globalGapAudit?.chapters || []).length})</span>
          </button>

          <button
            onClick={() => setActiveGlobalGapSubTab('mrl')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeGlobalGapSubTab === 'mrl'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Varredura de Resíduos LMR/MRL</span>
            <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">ISO 17025</span>
          </button>

          <button
            onClick={() => setActiveGlobalGapSubTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeGlobalGapSubTab === 'documents'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Validação GGN &amp; Documentos</span>
          </button>
        </div>

        {/* Sub-Aba: Visão Geral */}
        {activeGlobalGapSubTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Pontos de Controle Auditados</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {globalGapAudit.summaryStats.totalControlPoints} <span className="text-xs text-emerald-600 font-bold">Verificados</span>
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                  ✓ {globalGapAudit.summaryStats.compliantPoints} itens em conformidade
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Não-Conformidades Críticas (Major)</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  0 <span className="text-xs text-slate-500 font-normal">Ocorrências</span>
                </p>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  Aprovação de 100% nas exigências maiores
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Observações Menores Sanadas</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  4 <span className="text-xs text-slate-500 font-normal">PACs Concluídos</span>
                </p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
                  Evidências enviadas e aprovadas em 12 dias
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-extrabold uppercase">Laboratório de Resíduos</span>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                  {globalGapAudit.residueAnalysis.labName.split(' ')[0]} ISO 17025
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                  100% dos ativos abaixo do LMR
                </span>
              </div>
            </div>

            {/* Resumo dos Módulos */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Desempenho por Capítulo do Padrão GLOBALG.A.P. IFA v6.0</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Resumo do grau de conformidade técnica por área de gestão na propriedade
                  </p>
                </div>
                <button
                  onClick={() => setActiveGlobalGapSubTab('chapters')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Detalhes do Checklist</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalGapAudit.chapters.map((ch) => (
                  <div key={ch.id} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                          {ch.code}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {ch.title}
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {ch.scorePct}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {ch.description}
                    </p>

                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${ch.scorePct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sub-Aba: Capítulos Auditados */}
        {activeGlobalGapSubTab === 'chapters' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base border-b pb-3 border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Checklist Completo de Verificação - Padrão IFA v6.0</span>
              </span>
              <span className="text-xs text-slate-500 font-normal">8 Módulos Verificados</span>
            </h4>

            <div className="space-y-4">
              {globalGapAudit.chapters.map((ch) => (
                <div key={ch.id} className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-black bg-emerald-600 text-white px-2.5 py-1 rounded-md">
                        {ch.code}
                      </span>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {ch.title}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ch.mustType === 'Major' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        Requisito {ch.mustType} Must
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {ch.verifiedCount}/{ch.totalCount} itens ok ({ch.scorePct}%)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {ch.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auditoria de campo presencial com evidências fotográficas e validação documental do caderno de campo.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Aba: Varredura de Resíduos LMR/MRL */}
        {activeGlobalGapSubTab === 'mrl' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    Laudo Laboratorial de Análise de Resíduos de Pesticidas (LMR / MRL)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Laboratório: <strong>{globalGapAudit.residueAnalysis.labName}</strong> • Relatório N° <strong>{globalGapAudit.residueAnalysis.reportNumber}</strong>
                </p>
              </div>

              <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% APROVADO PARA EXPORTAÇÃO E MERCADO INTERNO
              </span>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-zinc-300 space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                🧪 Amostragem de Pré-Colheita Realizada em {globalGapAudit.residueAnalysis.sampleDate.includes('-') ? globalGapAudit.residueAnalysis.sampleDate.split('-').reverse().join('/') : globalGapAudit.residueAnalysis.sampleDate}
              </span>
              <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                A varredura cromatográfica (LC-MS/MS e GC-MS/MS) comprovou que todos os princípios ativos aplicados durante a safra respeitaram integralmente os prazos de carência (PHI) do caderno de campo e encontram-se exponencialmente abaixo dos limites máximos permitidos pela ANVISA, Codex Alimentarius e União Europeia.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-extrabold text-[10px]">
                    <th className="pb-3 pl-2">Princípio Ativo Testado</th>
                    <th className="pb-3">Concentração Detectada (mg/kg)</th>
                    <th className="pb-3">Limite Máximo LMR (mg/kg)</th>
                    <th className="pb-3">Padrão de Referência</th>
                    <th className="pb-3 text-right pr-2">Status Sanitário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {globalGapAudit.residueAnalysis.substances.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white">
                        {sub.ingredient}
                      </td>
                      <td className="py-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        {sub.detectedValueMgKg} mg/kg
                      </td>
                      <td className="py-3 font-mono text-slate-600 dark:text-zinc-400">
                        {sub.mrlAllowedMgKg} mg/kg
                      </td>
                      <td className="py-3 text-slate-500 dark:text-zinc-400 font-medium">
                        {sub.mrlSource}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-black uppercase">
                          ✓ DENTRO DO LMR
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-Aba: Validação GGN & Documentos */}
        {activeGlobalGapSubTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-base border-b pb-3 border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Validação Pública GGN no Portal Oficial GLOBALG.A.P.</span>
                </span>
                <span className="text-xs text-emerald-600 font-bold">Base de Dados Global Ativa</span>
              </h4>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Número de Registro GGN (GLOBALG.A.P. Number)</span>
                    <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                      {globalGapAudit.certificateNumber}
                    </span>
                  </div>
                  <a
                    href="https://www.globalgap.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 w-fit"
                  >
                    <span>Consultar no Database GLOBALG.A.P.</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Qualquer comprador internacional ou trading de exportação pode verificar a autenticidade deste certificado diretamente na base de dados oficial utilizando o número GGN acima.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFields = () => {
    const totalArea = (fields || []).reduce((sum, f) => sum + (f?.areaHa || 0), 0);
    const nurseryFields = (fields || []).filter(f => f?.activeNurseryBatchId || f?.seedlingTransplantDate);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header da Aba Talhões */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Talhões &amp; Áreas da Fazenda ({(fields || []).length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Mapeamento de área produtiva, cultivares instaladas e rastreabilidade de transplante de viveiro
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('producao_mudas')}
              className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Flower2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Ver Viveiro &amp; Mudas</span>
            </button>
            <button
              onClick={handleOpenNewOperation}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Operação</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Área Total Mapeada</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalArea.toFixed(1)}</span>
              <span className="text-xs font-bold text-slate-500">hectares</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">{(fields || []).length} talhões cadastrados</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Talhões com Mudas de Viveiro</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{nurseryFields.length}</span>
              <span className="text-xs font-bold text-slate-500">de {(fields || []).length} talhões</span>
            </div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block mt-1">Rastreabilidade RENASEM ativa</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Total de Operações Registradas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{operations.length}</span>
              <span className="text-xs font-bold text-slate-500">apontamentos</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Sincronizados com o Caderno Digital</span>
          </div>
        </div>

        {/* Grade de Talhões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fields.length === 0 ? (
            <div className="col-span-full py-12 px-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base">Nenhum talhão cadastrado</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Cadastre os talhões e divisões de plantio da sua fazenda para habilitar o rastreamento, apontamentos e laudos agronômicos.
              </p>
              <button
                onClick={handleNavigateToRegister}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Cadastrar Talhões na Fazenda</span>
              </button>
            </div>
          ) : (
            fields.map(f => {
              const fieldOps = operations.filter(op => op.fieldId === f.id);
              const hasNursery = Boolean(f.activeNurseryBatchId || f.seedlingTransplantDate);

              return (
                <div
                  key={f.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                            {f.code || f.id}
                          </span>
                          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {f.name}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-0.5">
                          {f.areaHa} ha • Solo {f.soilType}
                        </span>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-lg">
                        {f.crop}
                      </span>
                    </div>

                    {/* Informações da Cultura */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
                      <div className="flex justify-between">
                        <span className="font-medium">Variedade / Híbrido:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{f.variety || 'N/D'}</span>
                      </div>
                      {f.plantingDate && (
                        <div className="flex justify-between">
                          <span className="font-medium">Data de Plantio:</span>
                          <span className="font-mono">{new Date(f.plantingDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">Operações no Talhão:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{fieldOps.length} registros</span>
                      </div>
                    </div>

                    {/* Badge de Rastreabilidade de Mudas (se houver) */}
                    {hasNursery ? (
                      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1">
                            <Flower2 className="w-3.5 h-3.5 text-teal-600" />
                            Origem: Viveiro de Mudas
                          </span>
                          <span className="text-[10px] bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 font-mono font-bold px-2 py-0.5 rounded">
                            {f.activeNurseryBatchId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                          {f.seedlingCount && (
                            <p className="flex items-center justify-between">
                              <span className="text-slate-500">Mudas Transplantadas:</span>
                              <strong className="text-slate-900 dark:text-white">{(f.seedlingCount ?? 0).toLocaleString()} mudas</strong>
                            </p>
                          )}
                          {f.seedlingTransplantDate && (
                            <p className="flex items-center justify-between">
                              <span className="text-slate-500">Data Transplante:</span>
                              <span className="font-mono text-slate-800 dark:text-white">{new Date(f.seedlingTransplantDate).toLocaleDateString('pt-BR')}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center">
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">Sem lote de viveiro vinculado</span>
                      </div>
                    )}
                  </div>

                  {/* Ações do Talhão */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        const batch = batches.find(b => b.status === 'pronto_expedicao' || b.status === 'aclimatacao') || batches[0];
                        if (batch) {
                          setSelectedTransplantBatch(batch);
                          setTransplantFieldId(f.id);
                          setTransplantSeedlingCount(batch.estimatedReadyPlants.toString());
                          setIsTransplantModalOpen(true);
                        }
                      }}
                      className="flex-1 py-2 px-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Flower2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Transplantar</span>
                    </button>

                    <button
                      onClick={() => {
                        setOpFieldId(f.id);
                        handleOpenNewOperation();
                      }}
                      className="flex-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Apontar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderProducaoMudas = () => {
    // Totals calculations
    const activeBatches = (batches || []).filter(b => b?.status !== 'finalizado');
    const totalSeedsInNursery = activeBatches.reduce((sum, b) => sum + (b?.totalSeedsSown || 0), 0);
    const readyBatches = (batches || []).filter(b => b?.status === 'pronto_expedicao' || b?.status === 'aclimatacao');
    const totalReadySeedlings = readyBatches.reduce((sum, b) => sum + (b?.estimatedReadyPlants || 0), 0);
    const finalizedBatches = (batches || []).filter(b => b?.status === 'finalizado');
    const transplantedCount = 7800 + (finalizedBatches.length > 1 ? (finalizedBatches.length - 1) * 5000 : 0);

    const filteredBatches = (batches || []).filter(b => {
      if (!b) return false;
      if (batchStatusFilter === 'pronto' && b.status !== 'pronto_expedicao' && b.status !== 'aclimatacao') return false;
      if (batchStatusFilter === 'desenvolvimento' && b.status !== 'desenvolvimento') return false;
      if (batchStatusFilter === 'semeadura' && b.status !== 'semeadura' && b.status !== 'germinacao') return false;
      if (batchStatusFilter === 'finalizado' && b.status !== 'finalizado') return false;
      if (!batchSearchTerm.trim()) return true;
      const term = batchSearchTerm.toLowerCase();
      return (
        (b.batchCode || '').toLowerCase().includes(term) ||
        (b.cropName || '').toLowerCase().includes(term) ||
        (b.cultivar || '').toLowerCase().includes(term) ||
        (b.greenhouse || '').toLowerCase().includes(term) ||
        (b.trayType || '').toLowerCase().includes(term)
      );
    });

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header do Módulo de Mudas */}
        <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl border border-teal-700/50 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-400/30 flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide">
                  <Flower2 className="w-4 h-4 text-teal-400" />
                  Viveiro de Produção &amp; Propagação
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  RENASEM RS-04821/2026
                </span>
              </div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Produção de Mudas &amp; Rastreabilidade de Transplante
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Acompanhamento ciclo a ciclo desde a semeadura em bandejas termoformadas, microclima das estufas, rustificação e liberação com laudo fitossanitário para o Caderno de Campo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const readyBatch = batches.find(b => b.status === 'pronto_expedicao' || b.status === 'aclimatacao') || batches[0];
                  if (readyBatch) handleOpenTransplantModal(readyBatch);
                }}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Transplantar Lote p/ Campo</span>
              </button>

              <button
                onClick={() => {
                  setOpType('nursery_sowing');
                  handleOpenNewOperation();
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>Nova Semeadura</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPIs de Destaque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Mudas no Viveiro</span>
              <Boxes className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {totalSeedsInNursery.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              {activeBatches.length} lotes em fases ativas
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Prontas p/ Transplante</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {totalReadySeedlings.toLocaleString()}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              {readyBatches.length} lotes em aclimatação/expedição
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Transplantadas no Campo</span>
              <Sprout className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-2">
              {transplantedCount.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Talhão 03 (Tomate Italiano)
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <span>Taxa Média Germinação</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              95.4<span className="text-lg text-emerald-600">%</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
              Perdas descartadas &lt; 2.2%
            </span>
          </div>
        </div>

        {/* Sub-Aba Interna do Viveiro */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setNurserySubTab('lotes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              nurserySubTab === 'lotes'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Lotes &amp; Transplante ({batches.length})
          </button>
          <button
            onClick={() => setNurserySubTab('estufas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              nurserySubTab === 'estufas'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Estufas &amp; Microclima
          </button>
          <button
            onClick={() => setNurserySubTab('fitossanitario')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              nurserySubTab === 'fitossanitario'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            MIP Viveiro &amp; Sanidade
          </button>
          <button
            onClick={() => setNurserySubTab('modulo_completo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              nurserySubTab === 'modulo_completo'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Módulo Completo (Visão Avançada)
          </button>
        </div>

        {/* CONTEÚDO SUB-ABA LOTES */}
        {nurserySubTab === 'lotes' && (
          <div className="space-y-4">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'todos', label: 'Todos os Lotes' },
                  { key: 'pronto', label: 'Prontas p/ Transplante' },
                  { key: 'desenvolvimento', label: 'Em Desenvolvimento' },
                  { key: 'semeadura', label: 'Semeadura / Germinação' },
                  { key: 'finalizado', label: 'Transplantados no Campo' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setBatchStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      batchStatusFilter === tab.key
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={batchSearchTerm}
                  onChange={(e) => setBatchSearchTerm(e.target.value)}
                  placeholder="Buscar lote, cultivar..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Grid dos Lotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBatches.map(batch => {
                const isReady = batch.status === 'pronto_expedicao' || batch.status === 'aclimatacao';
                const isFinished = batch.status === 'finalizado';

                return (
                  <div
                    key={batch.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                              {batch.batchCode}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isFinished ? 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400' :
                              isReady ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {batch.status === 'pronto_expedicao' ? 'Pronto p/ Expedição' :
                               batch.status === 'aclimatacao' ? 'Em Aclimatação' :
                               batch.status === 'desenvolvimento' ? 'Desenvolvimento' :
                               batch.status === 'semeadura' ? 'Semeadura Recente' :
                               batch.status === 'finalizado' ? 'Transplantado no Campo' : batch.status}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                            {batch.cropName} • <span className="font-semibold text-slate-600 dark:text-zinc-400">{batch.cultivar}</span>
                          </h4>
                        </div>
                      </div>

                      {/* Métricas e Ficha Técnica do Lote */}
                      <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl space-y-2 text-xs border border-slate-100 dark:border-zinc-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Localização:</span>
                          <strong className="text-slate-800 dark:text-white">{batch.greenhouse} ({batch.bench})</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bandeja &amp; Células:</span>
                          <span className="text-slate-700 dark:text-zinc-300 font-medium">{batch.trayType} células ({batch.trayCount} bandejas)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Substrato:</span>
                          <span className="text-slate-700 dark:text-zinc-300">{batch.substrateType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Data Semeadura:</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">{new Date(batch.sowingDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Germinação:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{batch.germinationRatePct}%</span>
                        </div>
                        {/* Barra de Germinação */}
                        <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(batch.germinationRatePct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-zinc-700">
                          <span className="font-bold text-slate-700 dark:text-zinc-300">Mudas Estimadas Prontas:</span>
                          <strong className="text-sm font-black text-teal-600 dark:text-teal-400">
                            {(batch.estimatedReadyPlants ?? 0).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {batch.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                          {batch.notes}
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {isReady ? (
                        <button
                          onClick={() => handleOpenTransplantModal(batch)}
                          className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Flower2 className="w-4 h-4" />
                          <span>Transplantar para Talhão</span>
                        </button>
                      ) : isFinished ? (
                        <div className="w-full py-2 px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Transplantado com Sucesso</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenTransplantModal(batch)}
                          className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-teal-600" />
                          <span>Agendar Transplante</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTEÚDO SUB-ABA ESTUFAS */}
        {nurserySubTab === 'estufas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {initialGreenhouses.map(g => (
                <div
                  key={g.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{g.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">{g.type.replace('_', ' ')} • {g.activeBatchesCount} Lotes Ativos</span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-black rounded-md ${
                      g.alerts && g.alerts.length > 0
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {g.alerts && g.alerts.length > 0 ? `${g.alerts.length} Alerta(s)` : 'Operacional'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500 block">Temperatura</span>
                      <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{g.currentTemp}°C</span>
                      <span className="text-[10px] text-emerald-600">VPD: {g.currentVpdKpa} kPa</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500 block">Umidade Relativa</span>
                      <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{g.currentHumidity}%</span>
                      <span className="text-[10px] text-emerald-600">Nebulização: {g.foggingStatus}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800/60 text-xs space-y-1">
                    <span className="font-bold text-teal-900 dark:text-teal-200 block">Capacidade &amp; Ocupação</span>
                    <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                      Ocupação: <strong>{(g.currentOccupiedTrays ?? 0).toLocaleString()}</strong> de <strong>{(g.totalCapacityTrays ?? 0).toLocaleString()} bandejas</strong> ({Math.round(((g.currentOccupiedTrays || 0) / (g.totalCapacityTrays || 1)) * 100)}%).
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO SUB-ABA FITOSSANITÁRIO */}
        {nurserySubTab === 'fitossanitario' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-zinc-800">
              <div className="p-2.5 bg-teal-500/20 text-teal-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Guia Fitossanitário do Viveirista &amp; MIP em Ambiente Protegido
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Protocolos rigorosos para garantia de sanidade vegetal de mudas antes do transplante a campo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Controle Físico */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
                <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  1. Controle Físico &amp; Higienização
                </span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  • <strong>Telas Antiafídeos (50 mesh):</strong> Blindagem mecânica das estufas contra vetores de viroses (tripes, mosca-branca e pulgões).<br />
                  • <strong>Desinfecção de Bandejas:</strong> Imersão prévia em solução de amônia quaternária a 2% ou hipoclorito de sódio.<br />
                  • <strong>Pedilúvio na Entrada:</strong> Caixa desinfetante com cal virgem e sanitizante obrigatório para operadores.
                </p>
              </div>

              {/* Controle Cultural */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
                <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  2. Controle Cultural &amp; Rustificação
                </span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  • <strong>Manejo da Irrigação:</strong> Molhamento matinal para que as folhas sequem até a tarde, mitigando tombamento (damping-off por <em>Pythium</em> e <em>Rhizoctonia</em>).<br />
                  • <strong>Aclimatação pré-transplante:</strong> Redução gradativa de rega e exposição solar de 3 a 5 dias para espessamento da cutícula foliar.<br />
                  • <strong>Bancadas Suspensas:</strong> Altura mínima de 80 cm do solo para auto-poda radicular aérea e drenagem total.
                </p>
              </div>

              {/* Controle Biológico */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
                <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <Bug className="w-4 h-4 text-teal-600" />
                  3. Controle Biológico Aplicado
                </span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  • <strong>Trichoderma harzianum:</strong> Inoculação direta no substrato garantindo colonização radicular e proteção contra patógenos de solo.<br />
                  • <strong>Bacillus subtilis:</strong> Pulverização foliar preventiva competindo por espaço e inibindo esporulação de oídios e míldios.<br />
                  • <strong>Beauveria bassiana:</strong> Bioinseticida para supressão biológica de mosca-branca nas bancadas de solanáceas.
                </p>
              </div>

              {/* Controle Químico & Rastreabilidade */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
                <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  4. Controle Químico Racional &amp; LMR
                </span>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                  • <strong>Defensivos Registrados:</strong> Uso estrito de produtos com registro no MAPA para viveiros/mudas.<br />
                  • <strong>Apontamento Rastreável:</strong> Toda e qualquer aplicação é vinculada diretamente ao lote no Caderno de Campo com carência (PHI) zero residual no transplante.<br />
                  • <strong>Certificado Fitossanitário de Origem (CFO):</strong> Emissão do laudo com RT agronômica para atendimento ao GlobalG.A.P.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO SUB-ABA MÓDULO COMPLETO */}
        {nurserySubTab === 'modulo_completo' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
            <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Viveiro Inteligente...</div>}>
              <NurseryModule />
            </React.Suspense>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* CABEÇALHO INTEGRADO EM UMA UI ÚNICA COM LISTA SUSPENSA (DROPDOWN) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identidade do Caderno de Campo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Caderno de Campo</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Central Integrada
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Gestão agronômica, rastreabilidade e análises técnicas centralizadas</p>
            </div>
          </div>

          {/* Navegação por Lista Suspensa & Ações de Operação */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lista Suspensa dos Módulos Integrados */}
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none text-emerald-600 dark:text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <select
                id="fieldbook-module-select"
                value={activeTab === 'nematologia' ? 'nematology' : activeTab === 'global_gap' ? 'reports' : activeTab}
                onChange={(e) => setActiveTab(e.target.value as FieldBookSubTab)}
                className="pl-9 pr-9 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 font-bold text-xs rounded-xl shadow-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all cursor-pointer appearance-none min-w-[220px] sm:min-w-[270px]"
                aria-label="Selecionar módulo ou análise técnica do Caderno de Campo"
              >
                <optgroup label="🌾 Campo & Manejo">
                  <option value="dashboard">📊 Dashboard Geral</option>
                  <option value="operations">📅 Operações & Manejo</option>
                  <option value="fields">📍 Talhões & Culturas</option>
                  <option value="digital_twin">🎯 Gêmeo Digital 360°</option>
                  <option value="reports">🛡️ Auditoria GlobalG.A.P.</option>
                </optgroup>
                <optgroup label="🧪 Análises de Laboratório & Laudos">
                  <option value="solos">⚗️ Análise de Solo (Físico-Química)</option>
                  <option value="foliar">🍃 Diagnose Foliar</option>
                  <option value="analise_agua">💧 Análise de Água</option>
                  <option value="brix">🌡️ Brix Foliar & Açúcares</option>
                  <option value="recomendacoes">📐 Recomendações & Adubação</option>
                  <option value="relatorios">📄 Laudo Oficial & ART</option>
                  <option value="historico">📜 Histórico & Comparativo</option>
                </optgroup>
                <optgroup label="🛡️ Manejo Fitossanitário & Proteção">
                  <option value="tankmix">🧪 Tankmix (Calda & Defensivos)</option>
                  <option value="plantabilidade">🧭 Plantabilidade & Semeadura</option>
                  <option value="fenologia">🌱 Fenologia da Cultura</option>
                  <option value="nematology">🔬 Nematoides & BioAS</option>
                  <option value="doencas_solo">🐛 Doenças do Solo</option>
                  <option value="bulario">📦 Bulário Defensivos & MAPA</option>
                </optgroup>
                <optgroup label="⛅ Climatologia & Recursos Hídricos">
                  <option value="irrigacao">🚿 Irrigação & Balanço Hídrico</option>
                  <option value="pluviometria">🌧️ Pluviometria & Chuvas</option>
                  <option value="meteorologia">☀️ Climatologia & Previsão</option>
                </optgroup>
                <optgroup label="🌱 Ambiente Protegido & Custos">
                  <option value="producao_mudas">🌸 Viveiro & Produção de Mudas</option>
                  <option value="hidroponia">🌿 Hidroponia & Estufas</option>
                  <option value="custos">💰 Gestão de Custos & DRE</option>
                </optgroup>
                <optgroup label="🐄 Zootecnia & Sanidade Animal">
                  <option value="pecuaria">🥩 Bovinocultura</option>
                  <option value="avicultura">🥚 Avicultura</option>
                  <option value="suinocultura">🐖 Suinocultura</option>
                  <option value="nutricao_animal">🌾 Nutrição Animal</option>
                  <option value="bubalinos">🐃 Bubalinos</option>
                  <option value="caprinos">🐐 Caprinos</option>
                  <option value="equinos">🐎 Equinos</option>
                  <option value="bulario_vet">💉 Compêndio Veterinário</option>
                </optgroup>
              </select>
              <div className="absolute right-2.5 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Atalhos Rápidos e Ações */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeTab !== 'dashboard' && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-zinc-700 shadow-2xs"
                  title="Retornar ao Dashboard Geral"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              )}

              <button
                onClick={handleNavigateToRegister}
                className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Cadastrar e gerenciar propriedades e fazendas"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Cadastrar Fazenda</span>
              </button>

              <button 
                onClick={handleNotifyPendingOps}
                className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Enviar Notificação Push das tarefas pendentes"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden md:inline">Notificar</span>
              </button>

              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                title="Sincronizar dados com o dispositivo"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-emerald-600' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>

              <button 
                onClick={handleOpenNewOperation}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Operação</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {syncMessage && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'dashboard' && renderDashboard()}
      
      {activeTab === 'digital_twin' && renderDigitalTwin()}

      {activeTab === 'nematology' && renderNematologySubTab()}

      {activeTab === 'recomendacoes' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Recomendador de Adubação...</div>}>
            <RecommendationModule
              soilSamples={soilSamples || []}
              selectedFarm={farm}
              initialSelectedSampleId={undefined}
              onGenerateReport={() => {}}
              activeSubTab={undefined}
              setActiveSubTab={undefined}
              agronomist={agronomist}
              company={company}
              onNavigateToSolos={() => {}}
            />
          </React.Suspense>
        </div>
      )}

      {(activeTab === 'global_gap' || activeTab === 'reports') && renderGlobalGapAudit()}
      
      {activeTab === 'operations' && (
         <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm min-h-[400px]">
           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
             <div>
               <h3 className="text-lg font-bold text-slate-800 dark:text-white">Todas as Operações ({operations.length})</h3>
               <p className="text-xs text-slate-500">Histórico de intervenções agronômicas e registros de campo</p>
             </div>
             <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar operação, talhão..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                <button 
                  onClick={handleOpenNewOperation}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Operação</span>
                </button>
             </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="pb-3 font-semibold pl-2">Data</th>
                    <th className="pb-3 font-semibold">Talhão</th>
                    <th className="pb-3 font-semibold">Operação</th>
                    <th className="pb-3 font-semibold">Detalhes</th>
                    <th className="pb-3 font-semibold">Responsável</th>
                    <th className="pb-3 font-semibold text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {operations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Calendar className="w-8 h-8 text-slate-400 dark:text-zinc-600" />
                          <p className="font-semibold text-sm text-slate-700 dark:text-zinc-300">Nenhum lançamento encontrado</p>
                          <p className="text-xs text-slate-400">Clique em "Nova Operação" acima para registrar intervenções no caderno.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    operations
                      .filter(op => {
                        if (!searchTerm.trim()) return true;
                        const term = searchTerm.toLowerCase();
                        const fieldName = fields.find(f => f.id === op.fieldId)?.name?.toLowerCase() || '';
                        const opTypeStr = op.type.toLowerCase();
                        const machine = (op.details.machine || '').toLowerCase();
                        const product = (op.details.product || '').toLowerCase();
                        const resp = (op.responsible || '').toLowerCase();
                        return fieldName.includes(term) || opTypeStr.includes(term) || machine.includes(term) || product.includes(term) || resp.includes(term);
                      })
                      .map(op => (
                        <tr key={op.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3 pl-2 text-sm text-slate-700 dark:text-zinc-300 whitespace-nowrap font-mono">
                            {new Date(op.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 text-sm text-slate-900 dark:text-white font-bold">
                            {fields.find(f => f.id === op.fieldId)?.name || 'Talhão Geral'}
                          </td>
                        <td className="py-3 text-sm text-slate-700 dark:text-zinc-300 uppercase tracking-wide text-xs font-bold">
                          {op.type === 'soil_prep' && 'Preparo do Solo'}
                          {op.type === 'planting' && 'Plantio'}
                          {op.type === 'nursery_transplant' && (
                            <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                              <Flower2 className="w-3.5 h-3.5" /> Transplante Viveiro
                            </span>
                          )}
                          {op.type === 'nursery_sowing' && (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Leaf className="w-3.5 h-3.5" /> Semeadura Viveiro
                            </span>
                          )}
                          {op.type === 'nursery_hardening' && (
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Boxes className="w-3.5 h-3.5" /> Rustificação
                            </span>
                          )}
                          {op.type === 'hydroponics_planting' && (
                            <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                              <Sprout className="w-3.5 h-3.5" /> Transplante Hidropônico
                            </span>
                          )}
                          {op.type === 'hydroponics_nutrient' && (
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Droplets className="w-3.5 h-3.5" /> Solução Nutritiva / Correção
                            </span>
                          )}
                          {op.type === 'hydroponics_harvest' && (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Colheita Hidropônica
                            </span>
                          )}
                          {op.type === 'hydroponics_ph_ec' && (
                            <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5" /> Medição pH / CE
                            </span>
                          )}
                          {op.type === 'hydroponics_sanitation' && (
                            <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Sanitização Perfis
                            </span>
                          )}
                          {op.type === 'hydroponics_diary' && (
                            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> Diário Hidropônico
                            </span>
                          )}
                          {op.type === 'tankmix_application' && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <FlaskConical className="w-3.5 h-3.5" /> Aplicação TankMix (Calda)
                            </span>
                          )}
                          {op.type === 'buffalo_milking' && (
                            <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                              🐃 Búfalos: C. Leiteiro
                            </span>
                          )}
                          {op.type === 'buffalo_sanitary' && (
                            <span className="text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1">
                              🛡️ Búfalos: Sanitário
                            </span>
                          )}
                          {op.type === 'caprine_vaccination' && (
                            <span className="text-red-700 dark:text-red-400 font-bold flex items-center gap-1">
                              🐐 Caprinos: Vacinação
                            </span>
                          )}
                          {op.type === 'caprine_milk' && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                              🥛 Caprinos: C. Leiteiro
                            </span>
                          )}
                          {op.type === 'equine_farriery' && (
                            <span className="text-orange-700 dark:text-orange-400 font-bold flex items-center gap-1">
                              🐴 Equinos: Casqueamento
                            </span>
                          )}
                          {op.type === 'equine_vaccination' && (
                            <span className="text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1">
                              🏥 Equinos: Vacina/Exame
                            </span>
                          )}
                          {op.type === 'swine_weaning' && (
                            <span className="text-pink-700 dark:text-pink-400 font-bold flex items-center gap-1">
                              🐖 Suínos: Desmame
                            </span>
                          )}
                          {op.type === 'swine_feeding' && (
                            <span className="text-yellow-700 dark:text-yellow-500 font-bold flex items-center gap-1">
                              🌽 Suínos: Alimentação
                            </span>
                          )}
                          {op.type === 'spraying' && 'Pulverização'}
                          {op.type === 'fertility' && 'Adubação'}
                          {op.type === 'irrigation' && 'Irrigação'}
                          {op.type === 'harvest' && 'Colheita'}
                          {op.type === 'monitoring' && 'Monitoramento'}
                          {op.type === 'other' && 'Outros'}
                        </td>
                        <td className="py-3 text-sm text-slate-600 dark:text-zinc-400">
                          {op.details.sprayOrderCode ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono">
                                  Ordem #{op.details.sprayOrderCode}
                                </span>
                                <span>{op.details.product || 'Calda TankMix'}</span>
                              </span>
                              {op.details.tankMixProducts && op.details.tankMixProducts.length > 0 && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {op.details.tankMixProducts.length} defensivos • pH {op.details.waterPh || '5.8'} • {op.details.volume || 0} L total
                                </span>
                              )}
                              {op.notes && (
                                <span className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1 italic">
                                  "{op.notes}"
                                </span>
                              )}
                            </div>
                          ) : op.details.benchCode ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 font-bold text-xs">
                                <span className="bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                                  {op.details.benchCode}
                                </span>
                                <span>{op.details.crop || 'Cultivo'} {op.details.variety ? `(${op.details.variety})` : ''}</span>
                              </span>
                              {(op.details.phMeasured !== undefined || op.details.ecMeasured !== undefined) && (
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                                  {op.details.phMeasured !== undefined && `pH: ${op.details.phMeasured}`}
                                  {op.details.phMeasured !== undefined && op.details.ecMeasured !== undefined && ' • '}
                                  {op.details.ecMeasured !== undefined && `CE: ${op.details.ecMeasured} mS/cm`}
                                </span>
                              )}
                              {op.notes && (
                                <span className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1 italic">
                                  "{op.notes}"
                                </span>
                              )}
                            </div>
                          ) : op.details.nurseryBatchId ? (
                            <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 font-semibold text-xs">
                              Lote {op.details.nurseryBatchId} ({op.details.seedlingCount?.toLocaleString() || 0} mudas)
                            </span>
                          ) : (
                            op.details.machine || op.details.product || op.details.crop || op.notes || 'N/A'
                          )}
                        </td>
                        <td className="py-3 text-sm text-slate-600 dark:text-zinc-400 font-medium">
                          {op.responsible}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            op.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                            op.status === 'planned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                          }`}>
                            {op.status === 'completed' ? 'CONCLUÍDO' : op.status === 'planned' ? 'PLANEJADO' : 'EM ANDAMENTO'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
           </div>
         </div>
      )}

      {activeTab === 'fields' && renderFields()}

      {activeTab === 'producao_mudas' && renderProducaoMudas()}

      {activeTab === 'hidroponia' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Hidroponia...</div>}>
            <HydroponicsFieldBookIntegration
              onNavigateToOperations={() => setActiveTab('operations')}
              farmId={farm?.id || 'farm-1'}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'avicultura' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Avicultura...</div>}>
            <PoultryModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'nutricao_animal' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Nutrição Animal...</div>}>
            <AnimalNutritionModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'pecuaria' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Bovinocultura...</div>}>
            <LivestockModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'suinocultura' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Suinocultura...</div>}>
            <SwineModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'tankmix' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 shrink-0">
                <FlaskConical className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">Sincronização Ativa</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Tankmix (Calda &amp; Defensivos)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sequência WALES de mistura, teste ICG de compatibilidade, correções de pH/dureza e emissão de ordem de pulverização conectada ao Caderno de Campo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('operations')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Ver Operações no Caderno</span>
            </button>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Tankmix...</div>}>
            <TankMixModule
              farmName={farm?.name || 'Fazenda Modelo'}
              activeFarm={farm}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'plantabilidade' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-slate-900 text-white p-5 rounded-2xl border border-amber-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 shrink-0">
                <Compass className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold">Sincronização Ativa</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Plantabilidade &amp; Qualidade de Semeadura</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Avaliação de singulação, estande de plantas, falhas, duplas, CV% e regulagem de semeadouras associadas diretamente aos talhões no Caderno de Campo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('operations')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Ver Operações no Caderno</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
            <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Plantabilidade...</div>}>
              <PlantabilityModule />
            </React.Suspense>
          </div>
        </div>
      )}

      {activeTab === 'solos' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-slate-900 text-white p-5 rounded-2xl border border-amber-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 shrink-0">
                <FlaskConical className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold">Laboratório &amp; Laudos</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Análise de Solo &amp; Fertilidade Química</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gerenciamento de laudos de fertilidade, interpretação química (pH, CTC, V%, macro e micronutrientes) sincronizado diretamente com a fazenda {farm?.name || 'ativa'}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('recomendacoes')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calculator className="w-4 h-4" />
                <span>Gerar Recomendação</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Análise de Solo...</div>}>
            <SoilAnalysisModule
              soilSamples={soilSamples || []}
              setSoilSamples={setSoilSamples}
              selectedFarm={farm}
              onSelectSampleForRecommendation={() => setActiveTab('recomendacoes')}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'foliar' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 shrink-0">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">Diagnose Foliar DRIS</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Diagnose Foliar &amp; Nutrição Vegetal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Avaliação nutricional de folhas, índices DRIS, faixa crítica de suficiência e identificação de carências minerais na cultura.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('brix')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Thermometer className="w-4 h-4" />
                <span>Brix Foliar</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Diagnose Foliar...</div>}>
            <LeafAnalysisModule
              leafSamples={leafSamples || []}
              setLeafSamples={setLeafSamples}
              selectedFarm={farm}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'analise_agua' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-cyan-950 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border border-cyan-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-500/30 shrink-0">
                <Droplets className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded-full border border-cyan-400/30 font-bold">Classificação USSL &amp; IGA</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Análise de Água para Irrigação &amp; Calda</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Avaliação da qualidade hídrica, risco de salinidade e sodicidade (RAS), dureza e adequação físico-química para pulverização.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('irrigacao')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Droplets className="w-4 h-4" />
                <span>Manejo de Irrigação</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Análise de Água...</div>}>
            <WaterAnalysisModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'brix' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900 text-white p-5 rounded-2xl border border-orange-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/20 text-orange-300 rounded-xl border border-orange-500/30 shrink-0">
                <Thermometer className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-orange-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded-full border border-orange-400/30 font-bold">Refratometria &amp; Trofobiose</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Brix Foliar &amp; Imunidade Vegetal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monitoramento refratométrico do suco celular da planta, correlação com resistência a insetos sugadores e estresse fisiológico.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('foliar')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Leaf className="w-4 h-4" />
                <span>Diagnose Foliar</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Brix Foliar...</div>}>
            <BrixModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'fenologia' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-lime-950 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-lime-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-lime-500/20 text-lime-300 rounded-xl border border-lime-500/30 shrink-0">
                <Sprout className="w-6 h-6 text-lime-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-lime-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-lime-500/30 text-lime-200 px-2 py-0.5 rounded-full border border-lime-400/30 font-bold">Estádios &amp; Curvas</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Fenologia &amp; Curvas de Absorção Nutricional</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Acompanhamento dos estádios vegetativos e reprodutivos, acúmulo de biomassa e cronograma de exigência de nutrientes por fase.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('plantabilidade')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Plantabilidade</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Fenologia...</div>}>
            <PhenologyModule
              selectedFarm={farm}
              farms={farms || [farm]}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'irrigacao' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-blue-950 via-cyan-950 to-slate-900 text-white p-5 rounded-2xl border border-blue-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30 shrink-0">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-blue-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30 font-bold">Balanço Hídrico Climatológico</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Irrigação &amp; Manejo Hídrico de Precisão</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cálculo de evapotranspiração de referência (ETo/ETc), lâminas líquidas e brutas, turnos de rega e histórico de irrigação nos talhões.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('pluviometria')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CloudRain className="w-4 h-4" />
                <span>Pluviometria</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Irrigação...</div>}>
            <IrrigationModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'pluviometria' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-blue-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30 shrink-0">
                <CloudRain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-blue-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30 font-bold">Rede Pluviométrica</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Pluviometria &amp; Histórico de Chuvas</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monitoramento diário de precipitação, pluviômetros digitais e convencionais distribuídos pela propriedade.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('meteorologia')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sun className="w-4 h-4" />
                <span>Climatologia</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Pluviometria...</div>}>
            <RainGaugeModule selectedFarm={farm} />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'meteorologia' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white p-5 rounded-2xl border border-indigo-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 shrink-0">
                <Sun className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30 font-bold">Previsão &amp; Janela Operacional</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Climatologia &amp; Previsão Agroclimática</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Condições meteorológicas em tempo real, velocidade e direção do vento, umidade relativa e índice de janela de pulverização (IJO).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('tankmix')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FlaskConical className="w-4 h-4" />
                <span>TankMix &amp; Pulverização</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Climatologia...</div>}>
            <WeatherModule activeFarm={farm} />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'doencas_solo' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-red-950 via-stone-900 to-slate-900 text-white p-5 rounded-2xl border border-red-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 shrink-0">
                <Bug className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-red-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-red-500/30 text-red-200 px-2 py-0.5 rounded-full border border-red-400/30 font-bold">Fitopatologia Radicular</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Doenças do Solo &amp; Fungos Habitantes</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monitoramento e manejo integrado de patógenos edáficos (Fusarium, Macrophomina, Rhizoctonia, Sclerotinia) e bioindicadores.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('nematology')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Microscope className="w-4 h-4" />
                <span>Nematoides</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Doenças do Solo...</div>}>
            <SoilDiseasesModule
              selectedFarmId={farm?.id || 'farm-1'}
              setActiveTab={(tab: any) => setActiveTab(tab)}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'custos' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-yellow-950 via-stone-900 to-slate-900 text-white p-5 rounded-2xl border border-yellow-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500/20 text-yellow-300 rounded-xl border border-yellow-500/30 shrink-0">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-yellow-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded-full border border-yellow-400/30 font-bold">DRE &amp; Economia 360°</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Gestão de Custo &amp; Rentabilidade Agrícola</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Custo Operacional Efetivo (COE), Custo Operacional Total (COT), margens de contribuição e demonstrativo financeiro da safra.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('historico')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <History className="w-4 h-4" />
                <span>Histórico da Safra</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Gestão de Custos...</div>}>
            <CostManagementModule selectedFarmId={farm?.id || 'farm-1'} />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'relatorios' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30 font-bold">Documento Oficial</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Laudo Técnico Oficial &amp; ART Agronômica</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Emissão de laudo pericial e agronômico com Anotação de Responsabilidade Técnica (ART/CREA), assinatura digital e carimbo de rastreabilidade.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('reports')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Auditoria GlobalG.A.P.</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Laudo Técnico...</div>}>
            <TechnicalReportModule selectedFarm={farm} />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-stone-900 via-slate-900 to-zinc-900 text-white p-5 rounded-2xl border border-stone-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-stone-500/20 text-stone-300 rounded-xl border border-stone-500/30 shrink-0">
                <History className="w-6 h-6 text-stone-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-stone-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-stone-500/30 text-stone-200 px-2 py-0.5 rounded-full border border-stone-400/30 font-bold">Série Histórica</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Histórico &amp; Comparativo Multissafras</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evolução temporal da fertilidade do solo, produtividade histórica dos talhões e comparação lado a lado entre safras passadas.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Histórico...</div>}>
            <HistoricalComparativeModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'bulario' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl border border-teal-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30 shrink-0">
                <Package className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-teal-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full border border-teal-400/30 font-bold">Agrofit / MAPA</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Bulário de Defensivos &amp; Insumos Agrícolas</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Consulta de ingredientes ativos, doses registradas, período de carência (intervalo de segurança) e limites máximos de resíduos (LMR).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('tankmix')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Preparar TankMix</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Bulário de Defensivos...</div>}>
            <PesticideBularioModule
              farmName={farm?.name}
              activeFarm={farm}
              farms={farms || [farm]}
              setActiveTab={(tab: any) => setActiveTab(tab)}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'bulario_vet' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 text-white p-5 rounded-2xl border border-red-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 shrink-0">
                <Syringe className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-red-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-red-500/30 text-red-200 px-2 py-0.5 rounded-full border border-red-400/30 font-bold">Sanidade Animal</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Compêndio Veterinário &amp; Farmácia Animal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Medicamentos veterinários, posologias, vias de administração, carência para abate e leite conforme normas do MAPA.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('pecuaria')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BovinoIcon className="w-4 h-4" />
                <span>Bovinocultura</span>
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Compêndio Veterinário...</div>}>
            <VeterinaryBularioModule
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              companies={companies || []}
              farms={farms || [farm]}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'bubalinos' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-amber-950 text-white p-5 rounded-2xl border border-stone-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-stone-500/20 text-amber-300 rounded-xl border border-stone-500/30 shrink-0">
                <BubalinoIcon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold">Bubalinocultura</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Gestão de Rebanho Bubalino</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Controle zootécnico de búfalos, produção leiteira A2/A2, reprodução, vacinações e pesagens.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Bubalinocultura...</div>}>
            <BuffaloModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'caprinos' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-stone-900 via-zinc-900 to-orange-950 text-white p-5 rounded-2xl border border-orange-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/20 text-orange-300 rounded-xl border border-orange-500/30 shrink-0">
                <CaprinoIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-orange-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded-full border border-orange-400/30 font-bold">Caprinocultura</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Gestão de Rebanho Caprino &amp; Ovino</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Controle de rebanho de caprinos e ovinos, manejo de pastagens rotacionadas, FAMACHA e produção de leite e carne.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Caprinocultura...</div>}>
            <CaprineModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'equinos' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-stone-900 via-slate-900 to-amber-950 text-white p-5 rounded-2xl border border-amber-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 shrink-0">
                <EquinoIcon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Módulo Integrado ao Caderno de Campo</span>
                  <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold">Equinocultura</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Manejo de Tropa &amp; Equinos de Trabalho</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gestão da tropa da fazenda, vacinação (Mormo, AIE), ferrageamento, escore de condição corporal e alimentação.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('operations')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Operações</span>
              </button>
            </div>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Equinocultura...</div>}>
            <EquineModule />
          </React.Suspense>
        </div>
      )}
      {/* MODAL DE EXPLICAÇÃO DO ÍNDICE IGGS */}
      {isIggsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-purple-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Índice IGGS</h3>
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 font-extrabold px-2 py-0.5 rounded-full border border-purple-400/30 uppercase tracking-wide">
                      0 a 100 Pontos
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 font-medium">
                    Índice GeaAgro de Gestão da Safra • Avaliação &amp; Rastreabilidade Agronômica
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsIggsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 dark:text-zinc-300">
              {/* O que é o IGGS */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-2">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
                  <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>O que significa esta pontuação?</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  O <strong>IGGS (Índice GeaAgro de Gestão da Safra)</strong> é o indicador consolidado que mede o grau de eficiência gerencial, conformidade agronômica e rastreabilidade técnica dos talhões de uma propriedade rural.
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Ele atua como um <strong>selo de conformidade de campo</strong> para auditorias sanitárias, certificações socioambientais, bancos e cooperativas (acesso a crédito verde) e atendimento ao MAPA e ANVISA em relação ao controle de resíduos de pesticidas e rastreabilidade da produção.
                </p>
              </div>

              {/* Como é avaliado (4 Pilares) */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-zinc-800">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Como o IGGS é Avaliado? (4 Pilares de 25 Pontos Cada)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Pilar 1 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        1. Rastreabilidade &amp; Apontamentos
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Avalia o lançamento regular e tempestivo das operações de campo no caderno digital: preparo, dessecação, plantio, adubação, tratamentos fitossanitários e colheita por talhão com responsável técnico e data.
                    </p>
                  </div>

                  {/* Pilar 2 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        2. Conformidade e Receituário
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Mede o cumprimento das receitas agronômicas oficiais, observando dosagem/ha recomendada, intervalo de segurança (carência antes da colheita), prazo de reentrada no talhão e rotação de grupos químicos (FRAC, IRAC, HRAC).
                    </p>
                  </div>

                  {/* Pilar 3 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Tractor className="w-3.5 h-3.5 text-blue-600" />
                        3. Eficiência Operacional &amp; Clima
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Analisa a produtividade da frota agrícola, horas-máquina trabalhadas x ociosas, consumo de combustível e a realização de pulverizações dentro da Janela Operacional Ideal (IJO: vento 3-10 km/h, umidade &gt; 55%, temp &lt; 30°C).
                    </p>
                  </div>

                  {/* Pilar 4 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5 text-amber-600" />
                        4. Monitoramento MIP &amp; Solo
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                        Até 25 pts
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Acompanha a periodicidade das vistorias de pragas e doenças no talhão (MIP), estande de plantas e a presença de laudos químicos, físicos e foliares de solo vinculados ao histórico do talhão no GeaAgro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Faixas de Classificação */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-zinc-800">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Níveis de Classificação do IGGS</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>90 a 100 pts</span>
                    </div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[11px] block">🟢 Nível Ouro</span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Excelência gerencial, rastreabilidade auditável completa.</p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-blue-800 dark:text-blue-300 font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>75 a 89 pts</span>
                    </div>
                    <span className="font-bold text-blue-900 dark:text-blue-200 text-[11px] block">🔵 Nível Prata</span>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400">Boa gestão agronômica com pequenas pendências de registro.</p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-extrabold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>60 a 74 pts</span>
                    </div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-[11px] block">🟡 Nível Bronze</span>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">Regularidade mediana, requer mais pontualidade nas entradas.</p>
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-red-800 dark:text-red-300 font-extrabold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Abaixo de 60 pts</span>
                    </div>
                    <span className="font-bold text-red-900 dark:text-red-200 text-[11px] block">🔴 Nível Crítico</span>
                    <p className="text-[10px] text-red-700 dark:text-red-400">Risco regulatório e lacunas na rastreabilidade dos tratamentos.</p>
                  </div>
                </div>
              </div>

              {/* Dicas para Elevar a Nota */}
              <div className="p-4 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  💡 Como aumentar a pontuação IGGS da sua fazenda?
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-300 text-[11px]">
                  <li>Registre diariamente no <strong>Caderno de Campo</strong> cada operação realizada com data, máquina e operador.</li>
                  <li>Emita sempre o <strong>Receituário Agronômico</strong> antes das aplicações e vincule o número do laudo ao talhão.</li>
                  <li>Consulte o módulo de <strong>Clima &amp; Pluviol</strong> antes da pulverização para garantir IJO dentro dos parâmetros.</li>
                  <li>Mantenha as análises químicas do solo e laudos foliares atualizados na aba de <strong>Análise de Solo</strong>.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-zinc-900 p-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsIggsModalOpen(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AUDITORIA GLOBALG.A.P. */}
      {isGlobalGapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Relatório de Auditoria GLOBALG.A.P.</h3>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wide">
                      IFA v6.0 - Smart
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 font-medium">
                    {globalGapAudit.certificateNumber} • {globalGapAudit.farmName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsGlobalGapModalOpen(false);
                    handleOpenEditAuditModal();
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Auditoria</span>
                </button>
                <button
                  onClick={() => setIsGlobalGapModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 dark:text-zinc-300">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Conformidade Consolidada</span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                    {globalGapAudit.complianceScore.overallPct}%
                  </p>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Selo de Qualidade Aprovado</span>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block">Obrigatórias Maiores (Major Musts)</span>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-200">
                    {globalGapAudit.complianceScore.majorMustsPct}%
                  </p>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 block">100% em conformidade total</span>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase block">Validade do Certificado</span>
                  <p className="text-sm font-black text-purple-900 dark:text-purple-200 mt-1">
                    Até {globalGapAudit.expiryDate.includes('-') ? globalGapAudit.expiryDate.split('-').reverse().join('/') : globalGapAudit.expiryDate}
                  </p>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 block">Auditoria Anual de Renovação</span>
                </div>
              </div>

              {/* Organismo e Auditor */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs space-y-2">
                <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-zinc-700">
                  <span className="font-bold text-slate-900 dark:text-white">Organismo Certificador Credenciado:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{globalGapAudit.certificationBody}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-zinc-700">
                  <span className="font-bold text-slate-900 dark:text-white">Auditor Responsável:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{globalGapAudit.auditorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Data da Auditoria de Renovação:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{globalGapAudit.auditDate.includes('-') ? globalGapAudit.auditDate.split('-').reverse().join('/') : globalGapAudit.auditDate}</span>
                </div>
              </div>

              {/* Tabela dos 8 Módulos */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2 border-slate-200 dark:border-zinc-800">
                  Resumo dos Módulos Verificados na Propriedade
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {globalGapAudit.chapters.map((ch) => (
                    <div key={ch.id} className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-lg border border-slate-200 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-[11px]">{ch.code} - {ch.title}</span>
                        <span className="text-[10px] text-slate-500">{ch.verifiedCount}/{ch.totalCount} pontos em conformidade</span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">{ch.scorePct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-zinc-900 p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Auditoria registrada no Caderno Digital GeaAgro.
              </span>
              <button
                onClick={() => setIsGlobalGapModalOpen(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA OPERAÇÃO */}
      {isNewOperationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Nova Operação Agronômica</h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Cadastrar intervenção de campo e manejo agronômico
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewOperationModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveOperation} className="p-6 space-y-4 text-xs text-slate-700 dark:text-zinc-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Talhão */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Talhão Alvo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={opFieldId}
                    onChange={(e) => setOpFieldId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.areaHa} ha - {f.crop})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Operação */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Tipo de Operação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={opType}
                    onChange={(e) => setOpType(e.target.value as FieldOperation['type'])}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="soil_prep">Preparo do Solo (Gradagem / Subsolagem)</option>
                    <option value="planting">Plantio / Semeadura</option>
                    <option value="fertility">Adubação / Nutrição de Solo</option>
                    <option value="spraying">Pulverização / Defensivos</option>
                    <option value="irrigation">Irrigação / Manejo Hídrico</option>
                    <option value="harvest">Colheita</option>
                    <option value="monitoring">Monitoramento de Pragas (MIP)</option>
                    <optgroup label="🐃 Bovinocultura & Bubalinos">
                      <option value="buffalo_milking">Bubalino - Controle Leiteiro</option>
                      <option value="buffalo_sanitary">Bubalino - Vacinação e Controle Sanitário</option>
                    </optgroup>
                    <optgroup label="🐐 Caprinocultura">
                      <option value="caprine_vaccination">Caprino - Vacinação Estratégica</option>
                      <option value="caprine_milk">Caprino - Controle Leiteiro / Pesagem</option>
                    </optgroup>
                    <optgroup label="🐴 Equinocultura">
                      <option value="equine_farriery">Equino - Casqueamento e Ferrageamento</option>
                      <option value="equine_vaccination">Equino - Vacinação e Exames</option>
                    </optgroup>
                    <optgroup label="🐖 Suinocultura">
                      <option value="swine_weaning">Suíno - Desmame de Lotes</option>
                      <option value="swine_feeding">Suíno - Manejo Alimentar / Ração</option>
                    </optgroup>
                    <option value="other">Outra Intervenção</option>
                  </select>
                </div>

                {/* Data */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Data da Operação <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={opDate}
                    onChange={(e) => setOpDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Status da Operação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={opStatus}
                    onChange={(e) => setOpStatus(e.target.value as FieldOperation['status'])}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="completed">Concluído (Realizada)</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="planned">Planejado (Agendada)</option>
                  </select>
                </div>

                {/* Responsável */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Responsável / Operador <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={opResponsible}
                    onChange={(e) => setOpResponsible(e.target.value)}
                    placeholder="Ex: João Silva (Tratorista)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Máquina / Equipamento */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Máquina / Maquinário
                  </label>
                  <input
                    type="text"
                    value={opMachine}
                    onChange={(e) => setOpMachine(e.target.value)}
                    placeholder="Ex: John Deere 8320R, Uniport 3030..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Insumo / Produto */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    {opType === 'planting' ? 'Semente / Cultivar' : opType === 'fertility' ? 'Fertilizante / Adubo' : 'Insumo / Defensivo'}
                  </label>
                  <input
                    type="text"
                    value={opProduct}
                    onChange={(e) => setOpProduct(e.target.value)}
                    placeholder="Ex: Glifosato 480, NPK 04-14-08, Monsoy 8349..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Dose */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Dose / Taxa de Aplicação
                  </label>
                  <input
                    type="text"
                    value={opDose}
                    onChange={(e) => setOpDose(e.target.value)}
                    placeholder="Ex: 2.5 L/ha, 300 kg/ha..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Alvo / Objetivo Agronômico */}
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">
                  Alvo ou Objetivo Agronômico
                </label>
                <input
                  type="text"
                  value={opTarget}
                  onChange={(e) => setOpTarget(e.target.value)}
                  placeholder="Ex: Dessecação pré-plantio, controle de Spodoptera, adubação de cobertura..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">
                  Observações Técnicas / Rastreabilidade
                </label>
                <textarea
                  value={opNotes}
                  onChange={(e) => setOpNotes(e.target.value)}
                  rows={3}
                  placeholder="Registre prazos de carência (PHI), condições climáticas ou detalhes de rastreabilidade para auditoria..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewOperationModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar Operação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR AUDITORIA GLOBALG.A.P. */}
      {isEditGlobalGapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                  <Edit className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Preencher / Editar Auditoria GLOBALG.A.P.</h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Atualize os dados do organismo certificador, auditor e prazos de validade
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditGlobalGapModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAuditData} className="p-6 space-y-4 text-xs text-slate-700 dark:text-zinc-300 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4">
                {/* Organismo Certificador */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Organismo Certificador Credenciado
                  </label>
                  <input
                    type="text"
                    value={editCertBody}
                    onChange={(e) => setEditCertBody(e.target.value)}
                    placeholder="Ex: Control Union Certifications B.V. (ISO 17065)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Entidade de certificação parceira credenciada no IAE / Inmetro.
                  </p>
                </div>

                {/* Auditor Responsável */}
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Auditor Cadastrado GLOBALG.A.P.
                  </label>
                  <input
                    type="text"
                    value={editAuditorName}
                    onChange={(e) => setEditAuditorName(e.target.value)}
                    placeholder="Ex: Eng. Agrônomo Roberto Carlos Mendes (Auditor Cadastrado GLOBALG.A.P.)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Datas: Auditoria e Validade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Data da Auditoria de Renovação
                    </label>
                    <input
                      type="date"
                      value={editAuditDate}
                      onChange={(e) => setEditAuditDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Validade do Certificado
                    </label>
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Certificado GGN e Nome Propriedade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Número GGN (GLOBALG.A.P. Number)
                    </label>
                    <input
                      type="text"
                      value={editCertificateNumber}
                      onChange={(e) => setEditCertificateNumber(e.target.value)}
                      placeholder="Ex: GGN 4063487291034"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Nome da Propriedade / Fazenda
                    </label>
                    <input
                      type="text"
                      value={editFarmName}
                      onChange={(e) => setEditFarmName(e.target.value)}
                      placeholder="Ex: Fazenda Santa Maria - Sede"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Prazos / Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Conformidade Geral (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editOverallPct}
                      onChange={(e) => setEditOverallPct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Major Musts (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editMajorMustsPct}
                      onChange={(e) => setEditMajorMustsPct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Minor Musts (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editMinorMustsPct}
                      onChange={(e) => setEditMinorMustsPct(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Laboratório de Resíduos LMR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Laboratório de Análise LMR
                    </label>
                    <input
                      type="text"
                      value={editLabName}
                      onChange={(e) => setEditLabName(e.target.value)}
                      placeholder="Ex: Eurofins AgroAnalítica do Brasil"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      Nº do Laudo / Relatório LMR
                    </label>
                    <input
                      type="text"
                      value={editReportNumber}
                      onChange={(e) => setEditReportNumber(e.target.value)}
                      placeholder="Ex: LA-2026-88492-MRL"
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditGlobalGapModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Dados da Auditoria</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE TRANSPLANTE DE MUDAS DO VIVEIRO PARA TALHÃO */}
      {isTransplantModalOpen && selectedTransplantBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-teal-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                  <Flower2 className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Transplante de Mudas de Viveiro para Campo
                  </h3>
                  <p className="text-xs text-teal-200">
                    Rastreabilidade Integrada: Lote {selectedTransplantBatch.batchCode} → Caderno de Campo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTransplantModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmTransplant} className="p-6 space-y-4 text-xs">
              {/* Resumo do Lote de Origem */}
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[11px]">
                    Lote Selecionado: {selectedTransplantBatch.batchCode}
                  </span>
                  <span className="px-2 py-0.5 bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 font-bold rounded text-[10px]">
                    {selectedTransplantBatch.status === 'pronto_expedicao' ? 'Pronto p/ Expedição' : 'Em Aclimatação'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-zinc-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cultura / Cultivar:</span>
                    <strong>{selectedTransplantBatch.cropName} ({selectedTransplantBatch.cultivar})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Estufa / Bancada:</span>
                    <strong>{selectedTransplantBatch.greenhouse} ({selectedTransplantBatch.bench})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Mudas Prontas:</span>
                    <strong className="text-teal-600 dark:text-teal-400 font-black">{(selectedTransplantBatch.estimatedReadyPlants ?? 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tipo de Bandeja:</span>
                    <strong>{selectedTransplantBatch.trayType} células</strong>
                  </div>
                </div>
              </div>

              {/* Destino no Campo: Seleção de Talhão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Talhão de Destino *
                  </label>
                  <select
                    value={transplantFieldId}
                    onChange={(e) => setTransplantFieldId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.areaHa} ha - Solo {f.soilType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Quantidade de Mudas a Transplantar *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={transplantSeedlingCount}
                    onChange={(e) => setTransplantSeedlingCount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500"
                    placeholder="Ex: 5000"
                  />
                </div>
              </div>

              {/* Data do Transplante e Espaçamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Data do Transplante *
                  </label>
                  <input
                    type="date"
                    value={transplantDate}
                    onChange={(e) => setTransplantDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1">
                    Espaçamento de Plantio (Linha x Planta)
                  </label>
                  <input
                    type="text"
                    value={transplantSpacing}
                    onChange={(e) => setTransplantSpacing(e.target.value)}
                    placeholder="Ex: 0.50m x 1.20m (16.600 pl/ha)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Responsável Técnico */}
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">
                  Agrônomo / Técnico Responsável pelo Transplante
                </label>
                <input
                  type="text"
                  value={transplantResponsible}
                  onChange={(e) => setTransplantResponsible(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Observações e Condições de Campo */}
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">
                  Condições de Plantio &amp; Observações Técnicas
                </label>
                <textarea
                  rows={2}
                  value={transplantNotes}
                  onChange={(e) => setTransplantNotes(e.target.value)}
                  placeholder="Ex: Solo subsolado e gradeado, adubação de base incorporada, irrigação por gotejamento acionada 2h antes do transplante para saturação da leira."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Ações */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransplantModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar &amp; Apontar no Caderno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { FieldBookModule };
