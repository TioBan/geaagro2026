import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Bird,
  BookOpen,
  Bug,
  Building2,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CloudRain,
  Compass,
  DollarSign,
  Droplets,
  Edit,
  Egg,
  ExternalLink,
  FileText,
  FlaskConical,
  Flower2,
  HelpCircle,
  History,
  Info,
  Layers,
  LayoutGrid,
  Leaf,
  Map,
  MapPin,
  Microscope,
  Package,
  Plus,
  ShieldCheck,
  Sprout,
  Sun,
  Syringe,
  Target,
  Thermometer,
  ThermometerSun,
  Tractor,
  UploadCloud,
  Wheat,
  X,
} from 'lucide-react';
import { Agronomist, Company, Farm, LeafSample, RuralProducer, SoilSample } from '../types/agronomy';
import { Field, FieldBookSubTab, FieldOperation, GlobalGapAuditData } from '../types/fieldbook';
import { FIELDBOOK_TAB_GROUPS, MOCK_GLOBAL_GAP_AUDIT } from '../data/fieldbookData';
import { CROPS_CATALOG } from '../data/agronomicStandards';
import { ProductionBatch } from '../types/nursery';
import { notifyPendingTask } from '../utils/notificationService';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import {
  ensureInitialHydroponicSync,
  getHydroponicSummaryMetrics,
  STORAGE_KEYS,
} from '../utils/hydroponicsFieldBookSync';
import { syncLivestockToFieldBook } from '../utils/livestockFieldBookSync';
import { getTankMixSummaryMetrics } from '../utils/tankmixFieldBookSync';
import { getPlantabilitySummaryMetrics } from '../utils/plantabilityFieldBookSync';
import { BovinoIcon } from './icons/BovinoIcon';
import { BubalinoIcon } from './icons/BubalinoIcon';
import { CaprinoIcon } from './icons/CaprinoIcon';
import { EquinoIcon } from './icons/EquinoIcon';
import { SuinoIcon } from './icons/SuinoIcon';
import type { NewOperationInput, TransplantConfirmPayload } from './fieldbook/FieldBookModals';

// Lazy-loaded internal FieldBook sub-views & modals
const FieldBookDigitalTwinView = lazyWithRetry(() =>
  import('./fieldbook/FieldBookDigitalTwinView').then((m: any) => ({ default: m.FieldBookDigitalTwinView || m.default }))
);
const FieldBookNematologyView = lazyWithRetry(() =>
  import('./fieldbook/FieldBookNematologyView').then((m: any) => ({ default: m.FieldBookNematologyView || m.default }))
);
const FieldBookGlobalGapView = lazyWithRetry(() =>
  import('./fieldbook/FieldBookGlobalGapView').then((m: any) => ({ default: m.FieldBookGlobalGapView || m.default }))
);
const FieldBookFieldsView = lazyWithRetry(() =>
  import('./fieldbook/FieldBookFieldsView').then((m: any) => ({ default: m.FieldBookFieldsView || m.default }))
);
const FieldBookNurseryView = lazyWithRetry(() =>
  import('./fieldbook/FieldBookNurseryView').then((m: any) => ({ default: m.FieldBookNurseryView || m.default }))
);
const FieldBookOperationsView = lazyWithRetry(() =>
  import('./fieldbook/FieldBookOperationsView').then((m: any) => ({ default: m.FieldBookOperationsView || m.default }))
);
const TechnicalReportModule = lazyWithRetry(() =>
  import('./TechnicalReportModule').then((m: any) => ({ default: m.TechnicalReportModule || m.default }))
);
const FieldBookModals = lazyWithRetry(() =>
  import('./fieldbook/FieldBookModals').then((m: any) => ({ default: m.FieldBookModals || m.default }))
);

// Lazy-loaded integrated modules
const RecommendationModule = lazyWithRetry(() =>
  import('./RecommendationModule').then((m: any) => ({ default: m.RecommendationModule || m.default }))
);
const PoultryModule = lazyWithRetry(() =>
  import('./PoultryModule').then((m: any) => ({ default: m.PoultryModule || m.default }))
);
const PlantabilityModule = lazyWithRetry(() =>
  import('./PlantabilityModule').then((m: any) => ({ default: m.PlantabilityModule || m.default }))
);
const HydroponicsFieldBookIntegration = lazyWithRetry(() =>
  import('./fieldbook/HydroponicsFieldBookIntegration').then((m: any) => ({
    default: m.HydroponicsFieldBookIntegration || m.default,
  }))
);
const TankMixModule = lazyWithRetry(() =>
  import('./TankMixModule').then((m: any) => ({ default: m.TankMixModule || m.default }))
);
const LivestockModule = lazyWithRetry(() =>
  import('./LivestockModule').then((m: any) => ({ default: m.LivestockModule || m.default }))
);
const SwineModule = lazyWithRetry(() =>
  import('./SwineModule').then((m: any) => ({ default: m.SwineModule || m.default }))
);
const AnimalNutritionModule = lazyWithRetry(() =>
  import('./nutrition/AnimalNutritionModule').then((m: any) => ({
    default: m.AnimalNutritionModule || m.default,
  }))
);
const SoilAnalysisModule = lazyWithRetry(() =>
  import('./SoilAnalysisModule').then((m: any) => ({ default: m.SoilAnalysisModule || m.default }))
);
const LeafAnalysisModule = lazyWithRetry(() =>
  import('./LeafAnalysisModule').then((m: any) => ({ default: m.LeafAnalysisModule || m.default }))
);
const WaterAnalysisModule = lazyWithRetry(() =>
  import('./WaterAnalysisModule').then((m: any) => ({ default: m.WaterAnalysisModule || m.default }))
);
const BrixModule = lazyWithRetry(() =>
  import('./BrixModule').then((m: any) => ({ default: m.BrixModule || m.default }))
);
const PhenologyModule = lazyWithRetry(() =>
  import('./PhenologyModule').then((m: any) => ({ default: m.PhenologyModule || m.default }))
);
const RainGaugeModule = lazyWithRetry(() =>
  import('./RainGaugeModule').then((m: any) => ({ default: m.RainGaugeModule || m.default }))
);
const WeatherModule = lazyWithRetry(() =>
  import('./WeatherModule').then((m: any) => ({ default: m.WeatherModule || m.default }))
);
const IrrigationModule = lazyWithRetry(() =>
  import('./irrigation/IrrigationModule').then((m: any) => ({ default: m.IrrigationModule || m.default }))
);
const SoilDiseasesModule = lazyWithRetry(() =>
  import('./SoilDiseasesModule').then((m: any) => ({ default: m.SoilDiseasesModule || m.default }))
);
const CostManagementModule = lazyWithRetry(() =>
  import('./costs/CostManagementModule').then((m: any) => ({ default: m.CostManagementModule || m.default }))
);
const HistoricalComparativeModule = lazyWithRetry(() =>
  import('./HistoricalComparativeModule').then((m: any) => ({
    default: m.HistoricalComparativeModule || m.default,
  }))
);
const VeterinaryBularioModule = lazyWithRetry(() =>
  import('./VeterinaryBularioModule').then((m: any) => ({ default: m.VeterinaryBularioModule || m.default }))
);
const BuffaloModule = lazyWithRetry(() =>
  import('./BuffaloModule').then((m: any) => ({ default: m.BuffaloModule || m.default }))
);
const CaprineModule = lazyWithRetry(() =>
  import('./CaprineModule').then((m: any) => ({ default: m.CaprineModule || m.default }))
);
const EquineModule = lazyWithRetry(() =>
  import('./EquineModule').then((m: any) => ({ default: m.EquineModule || m.default }))
);
const PesticideBularioModule = lazyWithRetry(() =>
  import('./PesticideBularioModule').then((m: any) => ({ default: m.PesticideBularioModule || m.default }))
);

interface FieldBookModuleProps {
  farm: Farm;
  activeSubTab?: string;
  setActiveSubTab?: (tab: FieldBookSubTab) => void;
  soilSamples?: SoilSample[];
  setSoilSamples?: React.Dispatch<React.SetStateAction<SoilSample[]>>;
  leafSamples?: LeafSample[];
  setLeafSamples?: React.Dispatch<React.SetStateAction<LeafSample[]>>;
  farms?: Farm[];
  producer?: RuralProducer;
  producers?: RuralProducer[];
  companies?: Company[];
  agronomist?: Agronomist;
  company?: Company;
  isDarkMode?: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigateToRegister?: () => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

const DEFAULT_COMPANY: Company = {
  id: 'default-company',
  name: 'Consultoria Agronômica',
  tradingName: 'Consultoria Agronômica',
  cnpj: '00.000.000/0001-00',
  stateRegistration: 'Isento',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  creaRegister: '',
  createdAt: '',
};

const DEFAULT_AGRONOMIST: Agronomist = {
  id: 'default-agronomist',
  name: 'Engenheiro Agrônomo Responsável',
  profession: 'Engenheiro Agrônomo',
  councilType: 'CREA',
  crea: 'A preencher',
  creaState: '',
  rnp: '',
  cpf: '',
  email: '',
  phone: '',
  companyId: 'default-company',
  specialty: 'Agronomia',
  createdAt: '',
};

const DEFAULT_PRODUCER: RuralProducer = {
  id: 'default-producer',
  name: 'Produtor Rural',
  document: '',
  documentType: 'CPF',
  stateRegistration: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  companyId: 'default-company',
  createdAt: '',
};

interface IntegratedModuleAction {
  label: string;
  btnClass: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface IntegratedModuleWrapperProps {
  gradientClass: string;
  borderClass: string;
  iconBoxClass: string;
  eyebrowClass: string;
  badgeClass: string;
  badgeText: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  primaryAction?: IntegratedModuleAction;
  operationsButtonLabel?: string;
  operationsButtonIcon?: React.ReactNode;
  onOpenOperations: () => void;
  fallbackLabel: string;
  cardContainer?: boolean;
  children: React.ReactNode;
}

const LazyFallback: React.FC<{ label: string }> = ({ label }) => (
  <div className="p-8 text-center text-xs text-slate-500 font-bold">{label}</div>
);

const IntegratedModuleWrapper: React.FC<IntegratedModuleWrapperProps> = ({
  gradientClass,
  borderClass,
  iconBoxClass,
  eyebrowClass,
  badgeClass,
  badgeText,
  title,
  description,
  icon,
  primaryAction,
  operationsButtonLabel = 'Operações',
  operationsButtonIcon,
  onOpenOperations,
  fallbackLabel,
  cardContainer = false,
  children,
}) => (
  <div className="animate-fade-in space-y-6">
    <div
      className={`bg-gradient-to-r ${gradientClass} text-white p-5 rounded-2xl border ${borderClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 ${iconBoxClass} rounded-xl border shrink-0`}>{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase ${eyebrowClass} tracking-wider`}>
              Módulo Integrado ao Caderno de Campo
            </span>
            <span className={`text-[10px] ${badgeClass} px-2 py-0.5 rounded-full border font-bold`}>
              {badgeText}
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-0.5">{title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className={`px-4 py-2 ${primaryAction.btnClass} text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs`}
          >
            {primaryAction.icon}
            <span>{primaryAction.label}</span>
          </button>
        )}
        <button
          onClick={onOpenOperations}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {operationsButtonIcon || <Calendar className="w-4 h-4 text-emerald-400" />}
          <span>{operationsButtonLabel}</span>
        </button>
      </div>
    </div>

    {cardContainer ? (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
        <React.Suspense fallback={<LazyFallback label={fallbackLabel} />}>{children}</React.Suspense>
      </div>
    ) : (
      <React.Suspense fallback={<LazyFallback label={fallbackLabel} />}>{children}</React.Suspense>
    )}
  </div>
);

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
      soilType: plot.texture ? plot.texture.charAt(0).toUpperCase() + plot.texture.slice(1) : 'Argiloso',
      coordinates: [],
    }));
  }
  return [];
};

export default function FieldBookModule({
  farm,
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab,
  soilSamples,
  setSoilSamples,
  leafSamples,
  setLeafSamples,
  farms,
  producer,
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
  const rawTab = (externalSubTab as FieldBookSubTab) || internalTab;
  const activeTab: FieldBookSubTab =
    rawTab === 'nematologia' ? 'nematology' : rawTab === 'global_gap' ? 'reports' : rawTab;

  const setActiveTab = (tab: FieldBookSubTab) => {
    setInternalTab(tab);
    if (setExternalSubTab) {
      setExternalSubTab(tab);
    }
  };

  const handleNavigateToForage = (subTab?: string) => {
    if (onNavigate) {
      onNavigate('forrageiras', subTab);
    } else {
      window.dispatchEvent(new CustomEvent('gea-navigate', { detail: { tab: 'forrageiras', subTab } }));
    }
  };

  const handleNavigateToRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else if (onNavigate) {
      onNavigate('cadastros', 'fazendas');
    } else {
      window.dispatchEvent(new CustomEvent('gea-navigate', { detail: { tab: 'cadastros', subTab: 'fazendas' } }));
    }
  };

  const [fields, setFields] = useState<Field[]>(() => mapPlotsToFields(farm));

  useEffect(() => {
    if (farm?.plots && Array.isArray(farm.plots) && farm.plots.length > 0) {
      setFields(prevFields =>
        farm.plots.map(plot => {
          const existing = (prevFields || []).find(ef => ef?.id === plot.id);
          return {
            id: plot.id || `plot-${Math.random()}`,
            farmId: plot.farmId || farm?.id || 'farm-1',
            name: plot.name || 'Talhão',
            areaHa: plot.areaHa || 0,
            crop: plot.currentCrop || existing?.crop || 'Não definida',
            variety: existing?.variety || '',
            season: existing?.season || '2025/2026',
            soilType: plot.texture
              ? plot.texture.charAt(0).toUpperCase() + plot.texture.slice(1)
              : existing?.soilType || 'Argiloso',
            coordinates: existing?.coordinates || [],
            activeNurseryBatchId: existing?.activeNurseryBatchId,
            seedlingTransplantDate: existing?.seedlingTransplantDate,
            seedlingCount: existing?.seedlingCount,
          };
        })
      );
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

      const liveLivestockOps = syncLivestockToFieldBook(farm?.id || 'farm-1');
      const uniqueLiveOps = liveLivestockOps.filter(lop => !ops.some(op => op.id === lop.id));

      return [...ops, ...uniqueLiveOps];
    } catch (e) {
      console.error('Erro ao inicializar operações:', e);
    }
    return [];
  });

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
  }, [farm?.id]);

  // Produção de Mudas & Modais
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [selectedTransplantBatch, setSelectedTransplantBatch] = useState<ProductionBatch | null>(null);
  const [initialTransplantFieldId, setInitialTransplantFieldId] = useState<string | undefined>(undefined);
  const [isTransplantModalOpen, setIsTransplantModalOpen] = useState(false);

  const [isIggsModalOpen, setIsIggsModalOpen] = useState(false);
  const [isGlobalGapModalOpen, setIsGlobalGapModalOpen] = useState(false);
  const [isEditGlobalGapModalOpen, setIsEditGlobalGapModalOpen] = useState(false);
  const [globalGapAudit, setGlobalGapAudit] = useState<GlobalGapAuditData>(MOCK_GLOBAL_GAP_AUDIT);

  const [isNewOperationModalOpen, setIsNewOperationModalOpen] = useState(false);
  const [initialOpFieldId, setInitialOpFieldId] = useState<string | undefined>(undefined);
  const [initialOpType, setInitialOpType] = useState<FieldOperation['type']>('spraying');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncProgressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSyncToast = (msg: string, durationMs = 4000) => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    setSyncMessage(msg);
    syncTimerRef.current = setTimeout(() => {
      setSyncMessage(null);
      syncTimerRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      if (syncProgressTimerRef.current) clearTimeout(syncProgressTimerRef.current);
    };
  }, []);

  const handleOpenNewOperation = (fieldId?: string, opType: FieldOperation['type'] = 'spraying') => {
    setInitialOpFieldId(fieldId);
    setInitialOpType(opType);
    setIsNewOperationModalOpen(true);
  };

  const handleOpenTransplantModal = (batch: ProductionBatch, fieldId?: string) => {
    setSelectedTransplantBatch(batch);
    setInitialTransplantFieldId(fieldId);
    setIsTransplantModalOpen(true);
  };

  const handleCreateOperation = (input: NewOperationInput) => {
    const selectedField = fields.find(f => f?.id === input.fieldId) || fields[0];
    const newOp: FieldOperation = {
      id: `op-${Date.now()}`,
      farmId: farm?.id || 'farm-1',
      fieldId: input.fieldId || selectedField?.id || '',
      type: input.type,
      status: input.status,
      date: input.date,
      responsible: input.responsible,
      notes: input.notes,
      details: {
        machine: input.machine,
        product: input.product,
        dose: input.dose,
        target: input.target,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOperations(prev => [newOp, ...prev]);
    setIsNewOperationModalOpen(false);

    if (input.status === 'planned') {
      const typeLabel =
        input.type === 'spraying'
          ? 'Aplicação Fitossanitária'
          : input.type === 'fertility'
          ? 'Adubação'
          : input.type === 'nursery_transplant'
          ? 'Transplante de Mudas'
          : input.type === 'planting'
          ? 'Semeadura'
          : 'Operação de Campo';
      notifyPendingTask({
        title: `${typeLabel} agendada para ${newOp.date}`,
        farmName: farm.name,
        fieldName: selectedField?.name,
        dueDate: newOp.date,
        priority: 'high',
        taskId: newOp.id,
        status: input.status,
      });
    }

    showSyncToast('Nova operação cadastrada com sucesso!');
  };

  const handleConfirmTransplant = ({
    batch,
    fieldId,
    seedlingCount,
    transplantDate,
    responsible,
    notes,
    spacing,
  }: TransplantConfirmPayload) => {
    const targetField = fields.find(f => f?.id === fieldId) || fields[0];
    const parsedSpacing = spacing ? parseFloat(spacing.replace(',', '.')) : NaN;

    const newOp: FieldOperation = {
      id: `op-transplant-${Date.now()}`,
      farmId: farm?.id || 'farm-1',
      fieldId: fieldId || targetField?.id || '',
      type: 'nursery_transplant',
      status: 'completed',
      date: transplantDate,
      responsible,
      notes: notes || undefined,
      details: {
        crop: batch.cropName,
        variety: batch.cultivar,
        nurseryBatchId: batch.batchCode,
        seedlingCount,
        trayType: `${batch.trayType} células (${batch.trayCount} bandejas)`,
        substrateType: batch.substrateType,
        greenhouseOrigin: batch.greenhouse,
        hardeningDays: 5,
        transplantSuccessPct: 98.8,
        phytosanitaryStatus: 'Laudo de Sanidade Aprovado (Rastreabilidade RENASEM)',
        spacing: Number.isFinite(parsedSpacing) ? parsedSpacing : 0.5,
        depth: 5.0,
      },
      costs: {
        operation: 0,
        inputs: Math.round((batch.unitCostBrl || 0) * seedlingCount),
        machine: 0,
        labor: 0,
        total: Math.round((batch.unitCostBrl || 0) * seedlingCount),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOperations(prev => [newOp, ...prev]);

    setFields(prev =>
      prev.map(f =>
        f.id === fieldId
          ? {
              ...f,
              activeNurseryBatchId: batch.batchCode,
              seedlingTransplantDate: transplantDate,
              seedlingCount,
              crop: batch.cropName,
              variety: batch.cultivar,
            }
          : f
      )
    );

    setBatches(prev =>
      prev.map(b =>
        b.id === batch.id
          ? {
              ...b,
              status: 'entregue' as const,
              notes: `${b.notes || ''} [Mudas transplantadas no ${targetField?.name || 'Talhão'} em ${transplantDate} - ${seedlingCount.toLocaleString()} mudas]`,
            }
          : b
      )
    );

    setIsTransplantModalOpen(false);
    setSelectedTransplantBatch(null);
    showSyncToast(
      `🌱 Lote ${batch.batchCode} (${seedlingCount.toLocaleString()} mudas) transplantado com sucesso para ${targetField?.name || 'Talhão'}! Registrado no Caderno de Campo.`,
      5000
    );
  };

  const handleSaveGlobalGapAudit = (updatedAudit: GlobalGapAuditData) => {
    setGlobalGapAudit(updatedAudit);
    setIsEditGlobalGapModalOpen(false);
    showSyncToast('Dados da Auditoria GlobalG.A.P. atualizados com sucesso!');
  };

  const handleAddNematicideOperation = (fieldId: string, product: string, dosage: string) => {
    const field = fields.find(f => f?.id === fieldId) || fields[0];
    const newOp: FieldOperation = {
      id: `op-nema-${Date.now()}`,
      farmId: farm?.id || 'farm-1',
      fieldId: field?.id || '',
      type: 'spraying',
      status: 'planned',
      date: new Date().toISOString().split('T')[0],
      responsible: agronomist?.name || 'Não informado',
      details: {
        product,
        dose: parseFloat(dosage) || 2,
        volume: 150,
        target: 'Controle de Fitonematoides',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOperations(prev => [newOp, ...prev]);
    showSyncToast(
      `Operação de Nematicida Biológico (${product}) planejada com sucesso no Caderno de Campo${field?.name ? ` para o ${field.name}` : ''}!`,
      5000
    );
  };

  const handleSync = () => {
    setIsSyncing(true);
    if (syncProgressTimerRef.current) clearTimeout(syncProgressTimerRef.current);
    syncProgressTimerRef.current = setTimeout(() => {
      setIsSyncing(false);
      syncProgressTimerRef.current = null;
      showSyncToast('Caderno de campo e telemetria sincronizados com sucesso!');
    }, 1000);
  };

  const handleNotifyPendingOps = () => {
    const pending = operations.filter(op => op.status === 'planned' || op.status === 'in_progress');
    if (pending.length === 0) {
      showSyncToast('Nenhuma tarefa pendente no momento para alertar.', 3000);
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
      status: first.status,
    });

    showSyncToast(`🔔 Notificação push enviada ao agrônomo sobre ${pending.length} tarefas pendentes!`);
  };

  const resolvedProducer = producer || producers?.find(p => p.id === farm?.producerId) || producers?.[0];

  const anyModalOpen =
    isIggsModalOpen ||
    isGlobalGapModalOpen ||
    isNewOperationModalOpen ||
    isEditGlobalGapModalOpen ||
    (isTransplantModalOpen && Boolean(selectedTransplantBatch));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* CABEÇALHO INTEGRADO EM UMA UI ÚNICA COM LISTA SUSPENSA */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Gestão agronômica, rastreabilidade e análises técnicas centralizadas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none text-emerald-600 dark:text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <select
                id="fieldbook-module-select"
                value={activeTab}
                onChange={e => setActiveTab(e.target.value as FieldBookSubTab)}
                className="pl-9 pr-9 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 font-bold text-xs rounded-xl shadow-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all cursor-pointer appearance-none min-w-[220px] sm:min-w-[270px]"
                aria-label="Selecionar módulo ou análise técnica do Caderno de Campo"
              >
                {FIELDBOOK_TAB_GROUPS.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-2.5 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

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
                onClick={() => handleOpenNewOperation()}
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
          <button
            onClick={() => setSyncMessage(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'dashboard' && (() => {
        const totalAreaHa = fields.reduce((acc, f) => acc + (f.areaHa || 0), 0);
        const totalCost = operations.reduce((acc, op) => acc + (op.costs?.total || 0), 0);
        const pendingOpsCount = operations.filter(op => op.status === 'planned' || op.status === 'in_progress').length;
        const completedOpsCount = operations.filter(op => op.status === 'completed').length;
        const iggsScore = operations.length > 0 ? Math.min(100, Math.round((completedOpsCount / operations.length) * 85 + 15)) : 0;

        const hydroMetrics = getHydroponicSummaryMetrics();
        const tankMixMetrics = getTankMixSummaryMetrics(operations);
        const plantabilityMetrics = getPlantabilitySummaryMetrics(operations);

        const techCards: Array<{
          tab: FieldBookSubTab | 'forrageiras';
          title: string;
          subtitle: string;
          badge: string;
          badgeClass: string;
          icon: React.ReactNode;
          onClick: () => void;
        }> = [
          {
            tab: 'solos',
            title: 'Análise de Solo',
            subtitle: `${soilSamples?.length || 0} laudo(s) registrado(s)`,
            badge: 'Fertilidade',
            badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
            icon: <FlaskConical className="w-5 h-5 text-amber-600" />,
            onClick: () => setActiveTab('solos'),
          },
          {
            tab: 'foliar',
            title: 'Diagnose Foliar',
            subtitle: `${leafSamples?.length || 0} amostra(s) DRIS`,
            badge: 'Nutrição',
            badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
            icon: <Leaf className="w-5 h-5 text-emerald-600" />,
            onClick: () => setActiveTab('foliar'),
          },
          {
            tab: 'recomendacoes',
            title: 'Recomendações',
            subtitle: 'Calagem, Gessagem & NPK',
            badge: 'Cálculo',
            badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
            icon: <Calculator className="w-5 h-5 text-teal-600" />,
            onClick: () => setActiveTab('recomendacoes'),
          },
          {
            tab: 'analise_agua',
            title: 'Análise de Água',
            subtitle: 'USSL, RAS & Calda',
            badge: 'Qualidade',
            badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
            icon: <Droplets className="w-5 h-5 text-cyan-600" />,
            onClick: () => setActiveTab('analise_agua'),
          },
          {
            tab: 'brix',
            title: 'Brix Foliar',
            subtitle: 'Refratometria & Trofobiose',
            badge: 'Imunidade',
            badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
            icon: <Thermometer className="w-5 h-5 text-orange-600" />,
            onClick: () => setActiveTab('brix'),
          },
          {
            tab: 'fenologia',
            title: 'Fenologia & Absorção',
            subtitle: 'Estádios e curvas nutricionais',
            badge: 'Ciclo',
            badgeClass: 'bg-lime-100 text-lime-800 dark:bg-lime-950/60 dark:text-lime-300',
            icon: <Sprout className="w-5 h-5 text-lime-600" />,
            onClick: () => setActiveTab('fenologia'),
          },
          {
            tab: 'irrigacao',
            title: 'Irrigação & ETo/ETc',
            subtitle: 'Balanço hídrico de precisão',
            badge: 'Manejo',
            badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
            icon: <Droplets className="w-5 h-5 text-blue-600" />,
            onClick: () => setActiveTab('irrigacao'),
          },
          {
            tab: 'pluviometria',
            title: 'Pluviometria',
            subtitle: 'Rede de pluviômetros',
            badge: 'Chuvas',
            badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
            icon: <CloudRain className="w-5 h-5 text-sky-600" />,
            onClick: () => setActiveTab('pluviometria'),
          },
          {
            tab: 'meteorologia',
            title: 'Climatologia',
            subtitle: 'Janela operacional & vento',
            badge: 'Clima',
            badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
            icon: <ThermometerSun className="w-5 h-5 text-indigo-600" />,
            onClick: () => setActiveTab('meteorologia'),
          },
          {
            tab: 'nematology',
            title: 'Nematoides',
            subtitle: 'Mapeamento fitonematológico',
            badge: 'Fitossanidade',
            badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
            icon: <Microscope className="w-5 h-5 text-purple-600" />,
            onClick: () => setActiveTab('nematology'),
          },
          {
            tab: 'doencas_solo',
            title: 'Doenças do Solo',
            subtitle: 'Patógenos edáficos & manejo',
            badge: 'Patologia',
            badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
            icon: <Bug className="w-5 h-5 text-red-600" />,
            onClick: () => setActiveTab('doencas_solo'),
          },
          {
            tab: 'forrageiras',
            title: 'Forrageiras & Pastagens',
            subtitle: 'Cultivares e manejo de pastejo',
            badge: 'Pastagem',
            badgeClass: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
            icon: <Wheat className="w-5 h-5 text-green-600" />,
            onClick: () => handleNavigateToForage(),
          },
          {
            tab: 'custos',
            title: 'Custos & Rentabilidade',
            subtitle: 'COE, COT e margens da safra',
            badge: 'DRE',
            badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300',
            icon: <DollarSign className="w-5 h-5 text-yellow-600" />,
            onClick: () => setActiveTab('custos'),
          },
        ];

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Active Farm Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 border border-emerald-800/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-300 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Propriedade Ativa
                    </span>
                    {farm?.city && (
                      <span className="text-xs text-slate-300">
                        {farm.city}{farm.state ? ` / ${farm.state}` : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black mt-1">{farm?.name || 'Fazenda não selecionada'}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {fields.length} talhão(ões) mapeado(s) • {totalAreaHa.toLocaleString('pt-BR')} ha ativos no Caderno de Campo
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleNavigateToRegister}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Gerenciar Propriedade</span>
                </button>
                <button
                  onClick={() => setActiveTab('digital_twin')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Gêmeo Digital 360°</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                  <span>Área Cultivada</span>
                  <Map className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {totalAreaHa.toLocaleString('pt-BR')} ha
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{fields.length} talhões ativos</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                  <span>Operações Registradas</span>
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{operations.length}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  {pendingOpsCount} pendente(s) • {completedOpsCount} concluída(s)
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                  <span>Custo Apontado</span>
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Acumulado em operações</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                  <span>Índice IGGS Safra</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{iggsScore}</p>
                  <span className="text-xs text-slate-400 font-bold">/ 100 pts</span>
                </div>
                <button
                  onClick={() => setIsIggsModalOpen(true)}
                  className="mt-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Ver metodologia IGGS</span>
                </button>
              </div>
            </div>

            {/* IGGS & GlobalG.A.P. Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-purple-700/50 flex flex-col justify-between gap-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Gestão & Conformidade Agronômica
                    </span>
                    <h4 className="text-lg font-black mt-0.5 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-300" />
                      <span>Índice GeaAgro de Gestão da Safra (IGGS)</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Pontuação calculada a partir dos apontamentos em campo, rastreabilidade de insumos e cumprimento de prazos.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xl font-black text-purple-300">{iggsScore}</span>
                    <span className="block text-[10px] text-slate-400">de 100</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsIggsModalOpen(true)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Detalhar Critérios IGGS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('relatorios')}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Laudo & ART</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 border border-emerald-700/50 flex flex-col justify-between gap-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      Certificação & Rastreabilidade
                    </span>
                    <h4 className="text-lg font-black mt-0.5 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-300" />
                      <span>Auditoria GlobalG.A.P. (IFA v6.0)</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {globalGapAudit.certificateNumber
                        ? `Certificado ${globalGapAudit.certificateNumber} • Conformidade ${globalGapAudit.complianceScore.overallPct}%`
                        : 'Configure os dados da auditoria, LMRs e capítulos de conformidade da propriedade.'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-xs font-black border border-emerald-400/30 shrink-0">
                    {globalGapAudit.complianceScore.overallPct}%
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Painel GlobalG.A.P.</span>
                  </button>
                  <button
                    onClick={() => setIsGlobalGapModalOpen(true)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Resumo Executivo</span>
                  </button>
                  <button
                    onClick={() => setIsEditGlobalGapModalOpen(true)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Central de Análise Técnica Bento Grid */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-emerald-600" />
                    <span>Central de Análise Técnica & Agronômica</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Acesso rápido a todos os módulos técnicos integrados ao Caderno de Campo
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
                  13 especialidades conectadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {techCards.map(card => (
                  <button
                    key={card.tab}
                    onClick={card.onClick}
                    className="group text-left p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/50 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                        {card.icon}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{card.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{card.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Integrated Production & Livestock Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-600">
                      <Flower2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">Viveiro & Produção de Mudas</h5>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{batches.length} lote(s) ativo(s)</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('producao_mudas')}
                    className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Abrir Viveiro
                  </button>
                  {batches[0] && (
                    <button
                      onClick={() => handleOpenTransplantModal(batches[0])}
                      className="px-3 py-2 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-800 cursor-pointer"
                    >
                      Transplantar
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-50 dark:bg-cyan-950/60 rounded-xl text-cyan-600">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Cultivo Hidropônico</h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {hydroMetrics.totalAnnotationsCount || 0} registro(s) • {hydroMetrics.totalBenches || 0} bancada(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('hidroponia')}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Abrir Hidroponia
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">TankMix (Calda & Defensivos)</h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {tankMixMetrics.totalApplications || 0} calda(s) • WALES & compatibilidade
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('tankmix')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Abrir TankMix
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Plantabilidade & Semeadura</h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {plantabilityMetrics.totalPointsCount || 0} avaliação(ões) • CV% e estande
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('plantabilidade')}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Abrir Plantabilidade
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-50 dark:bg-orange-950/60 rounded-xl text-orange-600">
                    <Bird className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Avicultura & Nutrição Animal</h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Lotes de corte/postura e formulação NRC</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('avicultura')}
                    className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <Egg className="w-3.5 h-3.5" />
                    <span>Avicultura</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('nutricao_animal')}
                    className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Nutrição
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-stone-100 dark:bg-stone-900 rounded-xl text-stone-700 dark:text-stone-300">
                    <BovinoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Bovinocultura & Suinocultura</h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Rebanhos, pesagens, sanidade e creche</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('pecuaria')}
                    className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <BovinoIcon className="w-3.5 h-3.5" />
                    <span>Bovinos</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('suinocultura')}
                    className="flex-1 px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <SuinoIcon className="w-3.5 h-3.5" />
                    <span>Suínos</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Timeline, Microclimate, Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Linha do Tempo Recente</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('operations')}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Histórico Completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {operations.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center text-xs text-slate-500">
                    Nenhuma operação apontada ainda. Clique em <strong>Nova Operação</strong> para registrar o primeiro evento.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {operations.slice(0, 5).map(op => {
                      const fName = fields.find(f => f.id === op.fieldId)?.name || 'Talhão / Área';
                      return (
                        <div
                          key={op.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-800 dark:text-zinc-100">
                              {op.details?.product || op.details?.crop || op.type} • {fName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                              {op.date} • Resp.: {op.responsible}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              op.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {op.status === 'completed' ? 'Concluída' : 'Planejada'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Microclima & Janela</span>
                    </h5>
                    <button
                      onClick={() => setActiveTab('meteorologia')}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Previsão
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Consulte condições de temperatura, umidade, vento e pluviometria antes das aplicações.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-2.5">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Tractor className="w-4 h-4 text-emerald-600" />
                    <span>Ações Rápidas</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleOpenNewOperation()}
                      className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Apontar Operação</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('fields')}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Gerenciar Talhões
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'digital_twin' && (
        <React.Suspense fallback={<LazyFallback label="Carregando Gêmeo Digital 360°..." />}>
          <FieldBookDigitalTwinView
            farm={farm}
            fields={fields}
            operations={operations}
            soilSamples={soilSamples}
            handleNavigateToRegister={handleNavigateToRegister}
          />
        </React.Suspense>
      )}

      {activeTab === 'nematology' && (
        <React.Suspense fallback={<LazyFallback label="Carregando Monitoramento de Nematoides..." />}>
          <FieldBookNematologyView
            fields={fields}
            handleNavigateToRegister={handleNavigateToRegister}
            handleAddNematicideOperation={handleAddNematicideOperation}
          />
        </React.Suspense>
      )}

      {activeTab === 'recomendacoes' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<LazyFallback label="Carregando Recomendador de Adubação..." />}>
            <RecommendationModule
              soilSamples={soilSamples || []}
              selectedFarm={farm}
              agronomist={agronomist}
              company={company}
              onNavigateToSolos={() => setActiveTab('solos')}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'reports' && (
        <React.Suspense fallback={<LazyFallback label="Carregando Auditoria GlobalG.A.P..." />}>
          <FieldBookGlobalGapView
            globalGapAudit={globalGapAudit}
            onOpenEditModal={() => setIsEditGlobalGapModalOpen(true)}
            onOpenDetailModal={() => setIsGlobalGapModalOpen(true)}
          />
        </React.Suspense>
      )}

      {activeTab === 'operations' && (
        <React.Suspense fallback={<LazyFallback label="Carregando Operações..." />}>
          <FieldBookOperationsView
            operations={operations}
            fields={fields}
            onOpenNewOperation={() => handleOpenNewOperation()}
          />
        </React.Suspense>
      )}

      {activeTab === 'fields' && (
        <React.Suspense fallback={<LazyFallback label="Carregando Talhões..." />}>
          <FieldBookFieldsView
            fields={fields}
            operations={operations}
            batches={batches}
            onSetActiveTab={setActiveTab}
            onOpenNewOperation={fieldId => handleOpenNewOperation(fieldId)}
            onNavigateToRegister={handleNavigateToRegister}
            onOpenTransplantForField={(batch, fieldId) => handleOpenTransplantModal(batch, fieldId)}
          />
        </React.Suspense>
      )}

      {activeTab === 'producao_mudas' && (
        <React.Suspense fallback={<LazyFallback label="Carregando Produção de Mudas..." />}>
          <FieldBookNurseryView
            batches={batches}
            operations={operations}
            onOpenTransplantModal={batch => handleOpenTransplantModal(batch)}
            onOpenNewSowingOperation={() => handleOpenNewOperation(undefined, 'nursery_sowing')}
          />
        </React.Suspense>
      )}

      {activeTab === 'hidroponia' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<LazyFallback label="Carregando Hidroponia..." />}>
            <HydroponicsFieldBookIntegration
              onNavigateToOperations={() => setActiveTab('operations')}
              farmId={farm?.id || 'farm-1'}
            />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'avicultura' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<LazyFallback label="Carregando Avicultura..." />}>
            <PoultryModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'nutricao_animal' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<LazyFallback label="Carregando Nutrição Animal..." />}>
            <AnimalNutritionModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'pecuaria' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<LazyFallback label="Carregando Bovinocultura..." />}>
            <LivestockModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'suinocultura' && (
        <div className="animate-fade-in space-y-6">
          <React.Suspense fallback={<LazyFallback label="Carregando Suinocultura..." />}>
            <SwineModule />
          </React.Suspense>
        </div>
      )}

      {activeTab === 'tankmix' && (
        <IntegratedModuleWrapper
          gradientClass="from-emerald-950 via-teal-950 to-slate-900"
          borderClass="border-emerald-700/50"
          iconBoxClass="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          eyebrowClass="text-emerald-400"
          badgeClass="bg-emerald-500/30 text-emerald-200 border-emerald-400/30"
          badgeText="Sincronização Ativa"
          title="Tankmix (Calda & Defensivos)"
          description="Sequência WALES de mistura, teste ICG de compatibilidade, correções de pH/dureza e emissão de ordem de pulverização conectada ao Caderno de Campo."
          icon={<FlaskConical className="w-6 h-6 text-emerald-400" />}
          operationsButtonLabel="Ver Operações no Caderno"
          operationsButtonIcon={<FileText className="w-4 h-4 text-emerald-400" />}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Tankmix..."
        >
          <TankMixModule farmName={farm?.name || ''} activeFarm={farm} />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'plantabilidade' && (
        <IntegratedModuleWrapper
          gradientClass="from-amber-950 via-yellow-900 to-slate-900"
          borderClass="border-amber-600/50"
          iconBoxClass="bg-amber-500/20 text-amber-300 border-amber-500/30"
          eyebrowClass="text-amber-400"
          badgeClass="bg-amber-500/30 text-amber-200 border-amber-400/30"
          badgeText="Sincronização Ativa"
          title="Plantabilidade & Qualidade de Semeadura"
          description="Avaliação de singulação, estande de plantas, falhas, duplas, CV% e regulagem de semeadouras associadas diretamente aos talhões no Caderno de Campo."
          icon={<Compass className="w-6 h-6 text-amber-400" />}
          operationsButtonLabel="Ver Operações no Caderno"
          operationsButtonIcon={<FileText className="w-4 h-4 text-amber-400" />}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Plantabilidade..."
          cardContainer
        >
          <PlantabilityModule />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'solos' && (
        <IntegratedModuleWrapper
          gradientClass="from-amber-950 via-stone-900 to-slate-900"
          borderClass="border-amber-600/50"
          iconBoxClass="bg-amber-500/20 text-amber-300 border-amber-500/30"
          eyebrowClass="text-amber-400"
          badgeClass="bg-amber-500/30 text-amber-200 border-amber-400/30"
          badgeText="Laboratório & Laudos"
          title="Análise de Solo & Fertilidade Química"
          description={`Gerenciamento de laudos de fertilidade, interpretação química (pH, CTC, V%, macro e micronutrientes) sincronizado diretamente com a fazenda ${farm?.name || 'ativa'}.`}
          icon={<FlaskConical className="w-6 h-6 text-amber-400" />}
          primaryAction={{
            label: 'Gerar Recomendação',
            btnClass: 'bg-emerald-600 hover:bg-emerald-500',
            icon: <Calculator className="w-4 h-4" />,
            onClick: () => setActiveTab('recomendacoes'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Análise de Solo..."
        >
          <SoilAnalysisModule
            soilSamples={soilSamples || []}
            setSoilSamples={setSoilSamples || (() => {})}
            selectedFarm={farm}
            onSelectSampleForRecommendation={() => setActiveTab('recomendacoes')}
          />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'foliar' && (
        <IntegratedModuleWrapper
          gradientClass="from-emerald-950 via-teal-950 to-slate-900"
          borderClass="border-emerald-600/50"
          iconBoxClass="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          eyebrowClass="text-emerald-400"
          badgeClass="bg-emerald-500/30 text-emerald-200 border-emerald-400/30"
          badgeText="Diagnose Foliar DRIS"
          title="Diagnose Foliar & Nutrição Vegetal"
          description="Avaliação nutricional de folhas, índices DRIS, faixa crítica de suficiência e identificação de carências minerais na cultura."
          icon={<Leaf className="w-6 h-6 text-emerald-400" />}
          primaryAction={{
            label: 'Brix Foliar',
            btnClass: 'bg-amber-600 hover:bg-amber-500',
            icon: <Thermometer className="w-4 h-4" />,
            onClick: () => setActiveTab('brix'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Diagnose Foliar..."
        >
          <LeafAnalysisModule
            leafSamples={leafSamples || []}
            setLeafSamples={setLeafSamples}
            farm={farm}
          />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'analise_agua' && (
        <IntegratedModuleWrapper
          gradientClass="from-cyan-950 via-teal-950 to-slate-900"
          borderClass="border-cyan-600/50"
          iconBoxClass="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
          eyebrowClass="text-cyan-400"
          badgeClass="bg-cyan-500/30 text-cyan-200 border-cyan-400/30"
          badgeText="Classificação USSL & IGA"
          title="Análise de Água para Irrigação & Calda"
          description="Avaliação da qualidade hídrica, risco de salinidade e sodicidade (RAS), dureza e adequação físico-química para pulverização."
          icon={<Droplets className="w-6 h-6 text-cyan-400" />}
          primaryAction={{
            label: 'Manejo de Irrigação',
            btnClass: 'bg-cyan-600 hover:bg-cyan-500',
            icon: <Droplets className="w-4 h-4" />,
            onClick: () => setActiveTab('irrigacao'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Análise de Água..."
        >
          <WaterAnalysisModule />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'brix' && (
        <IntegratedModuleWrapper
          gradientClass="from-orange-950 via-amber-950 to-slate-900"
          borderClass="border-orange-600/50"
          iconBoxClass="bg-orange-500/20 text-orange-300 border-orange-500/30"
          eyebrowClass="text-orange-400"
          badgeClass="bg-orange-500/30 text-orange-200 border-orange-400/30"
          badgeText="Refratometria & Trofobiose"
          title="Brix Foliar & Imunidade Vegetal"
          description="Monitoramento refratométrico do suco celular da planta, correlação com resistência a insetos sugadores e estresse fisiológico."
          icon={<Thermometer className="w-6 h-6 text-orange-400" />}
          primaryAction={{
            label: 'Diagnose Foliar',
            btnClass: 'bg-emerald-600 hover:bg-emerald-500',
            icon: <Leaf className="w-4 h-4" />,
            onClick: () => setActiveTab('foliar'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Brix Foliar..."
        >
          <BrixModule />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'fenologia' && (
        <IntegratedModuleWrapper
          gradientClass="from-lime-950 via-emerald-950 to-slate-900"
          borderClass="border-lime-600/50"
          iconBoxClass="bg-lime-500/20 text-lime-300 border-lime-500/30"
          eyebrowClass="text-lime-400"
          badgeClass="bg-lime-500/30 text-lime-200 border-lime-400/30"
          badgeText="Estádios & Curvas"
          title="Fenologia & Curvas de Absorção Nutricional"
          description="Acompanhamento dos estádios vegetativos e reprodutivos, acúmulo de biomassa e cronograma de exigência de nutrientes por fase."
          icon={<Sprout className="w-6 h-6 text-lime-400" />}
          primaryAction={{
            label: 'Plantabilidade',
            btnClass: 'bg-amber-600 hover:bg-amber-500',
            icon: <Compass className="w-4 h-4" />,
            onClick: () => setActiveTab('plantabilidade'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Fenologia..."
        >
          <PhenologyModule selectedFarm={farm} farms={farms || [farm]} />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'irrigacao' && (
        <IntegratedModuleWrapper
          gradientClass="from-blue-950 via-cyan-950 to-slate-900"
          borderClass="border-blue-600/50"
          iconBoxClass="bg-blue-500/20 text-blue-300 border-blue-500/30"
          eyebrowClass="text-blue-400"
          badgeClass="bg-blue-500/30 text-blue-200 border-blue-400/30"
          badgeText="Balanço Hídrico Climatológico"
          title="Irrigação & Manejo Hídrico de Precisão"
          description="Cálculo de evapotranspiração de referência (ETo/ETc), lâminas líquidas e brutas, turnos de rega e histórico de irrigação nos talhões."
          icon={<Droplets className="w-6 h-6 text-blue-400" />}
          primaryAction={{
            label: 'Pluviometria',
            btnClass: 'bg-cyan-600 hover:bg-cyan-500',
            icon: <CloudRain className="w-4 h-4" />,
            onClick: () => setActiveTab('pluviometria'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Irrigação..."
        >
          <IrrigationModule />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'pluviometria' && (
        <IntegratedModuleWrapper
          gradientClass="from-blue-950 via-slate-900 to-indigo-950"
          borderClass="border-blue-600/50"
          iconBoxClass="bg-blue-500/20 text-blue-300 border-blue-500/30"
          eyebrowClass="text-blue-400"
          badgeClass="bg-blue-500/30 text-blue-200 border-blue-400/30"
          badgeText="Rede Pluviométrica"
          title="Pluviometria & Histórico de Chuvas"
          description="Monitoramento diário de precipitação, pluviômetros digitais e convencionais distribuídos pela propriedade."
          icon={<CloudRain className="w-6 h-6 text-blue-400" />}
          primaryAction={{
            label: 'Climatologia',
            btnClass: 'bg-indigo-600 hover:bg-indigo-500',
            icon: <Sun className="w-4 h-4" />,
            onClick: () => setActiveTab('meteorologia'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Pluviometria..."
        >
          <RainGaugeModule selectedFarm={farm} />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'meteorologia' && (
        <IntegratedModuleWrapper
          gradientClass="from-indigo-950 via-slate-900 to-sky-950"
          borderClass="border-indigo-600/50"
          iconBoxClass="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
          eyebrowClass="text-indigo-400"
          badgeClass="bg-indigo-500/30 text-indigo-200 border-indigo-400/30"
          badgeText="Previsão & Janela Operacional"
          title="Climatologia & Previsão Agroclimática"
          description="Condições meteorológicas em tempo real, velocidade e direção do vento, umidade relativa e índice de janela de pulverização (IJO)."
          icon={<Sun className="w-6 h-6 text-indigo-400" />}
          primaryAction={{
            label: 'TankMix & Pulverização',
            btnClass: 'bg-emerald-600 hover:bg-emerald-500',
            icon: <FlaskConical className="w-4 h-4" />,
            onClick: () => setActiveTab('tankmix'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Climatologia..."
        >
          <WeatherModule activeFarm={farm} />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'doencas_solo' && (
        <IntegratedModuleWrapper
          gradientClass="from-red-950 via-stone-900 to-slate-900"
          borderClass="border-red-600/50"
          iconBoxClass="bg-red-500/20 text-red-300 border-red-500/30"
          eyebrowClass="text-red-400"
          badgeClass="bg-red-500/30 text-red-200 border-red-400/30"
          badgeText="Fitopatologia Radicular"
          title="Doenças do Solo & Fungos Habitantes"
          description="Monitoramento e manejo integrado de patógenos edáficos (Fusarium, Macrophomina, Rhizoctonia, Sclerotinia) e bioindicadores."
          icon={<Bug className="w-6 h-6 text-red-400" />}
          primaryAction={{
            label: 'Nematoides',
            btnClass: 'bg-purple-600 hover:bg-purple-500',
            icon: <Microscope className="w-4 h-4" />,
            onClick: () => setActiveTab('nematology'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Doenças do Solo..."
        >
          <SoilDiseasesModule
            selectedFarmId={farm?.id || 'farm-1'}
            setActiveTab={(tab: string) => setActiveTab(tab as FieldBookSubTab)}
          />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'custos' && (
        <IntegratedModuleWrapper
          gradientClass="from-yellow-950 via-stone-900 to-slate-900"
          borderClass="border-yellow-600/50"
          iconBoxClass="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
          eyebrowClass="text-yellow-400"
          badgeClass="bg-yellow-500/30 text-yellow-200 border-yellow-400/30"
          badgeText="DRE & Economia 360°"
          title="Gestão de Custo & Rentabilidade Agrícola"
          description="Custo Operacional Efetivo (COE), Custo Operacional Total (COT), margens de contribuição e demonstrativo financeiro da safra."
          icon={<DollarSign className="w-6 h-6 text-yellow-400" />}
          primaryAction={{
            label: 'Histórico da Safra',
            btnClass: 'bg-teal-600 hover:bg-teal-500',
            icon: <History className="w-4 h-4" />,
            onClick: () => setActiveTab('historico'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Gestão de Custos..."
        >
          <CostManagementModule selectedFarmId={farm?.id || 'farm-1'} />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'relatorios' && (
        <IntegratedModuleWrapper
          gradientClass="from-slate-900 via-indigo-950 to-slate-900"
          borderClass="border-indigo-600/50"
          iconBoxClass="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
          eyebrowClass="text-indigo-400"
          badgeClass="bg-indigo-500/30 text-indigo-200 border-indigo-400/30"
          badgeText="Documento Oficial"
          title="Laudo Técnico Oficial & ART Agronômica"
          description="Emissão de laudo pericial e agronômico com Anotação de Responsabilidade Técnica (ART/CREA), assinatura digital e carimbo de rastreabilidade."
          icon={<FileText className="w-6 h-6 text-indigo-400" />}
          primaryAction={{
            label: 'Auditoria GlobalG.A.P.',
            btnClass: 'bg-emerald-600 hover:bg-emerald-500',
            icon: <ShieldCheck className="w-4 h-4" />,
            onClick: () => setActiveTab('reports'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Laudo Técnico..."
        >
          {(() => {
            const safeSoilSamples = soilSamples || [];
            const safeLeafSamples = leafSamples || [];
            const farmSoilSamples = safeSoilSamples.filter(s => !farm?.id || s.farmId === farm.id);
            const activeSoilSample = farmSoilSamples[0] || safeSoilSamples[0];

            if (!activeSoilSample) {
              return (
                <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">
                      Nenhuma análise de solo vinculada para gerar o Laudo Técnico
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Cadastre ou importe ao menos um laudo laboratorial de solo para habilitar a emissão do Laudo Técnico Oficial e ART Agronômica de{' '}
                      <strong>{farm?.name || 'propriedade ativa'}</strong>.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('solos')}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>Ir para Análise de Solo</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar ao Dashboard</span>
                    </button>
                  </div>
                </div>
              );
            }

            const matchedPlot =
              farm?.plots?.find(p => p.id === activeSoilSample.plotId) ||
              fields.find(f => f.id === activeSoilSample.plotId);
            const cropNameRaw =
              (matchedPlot &&
                ('currentCrop' in matchedPlot
                  ? matchedPlot.currentCrop
                  : 'crop' in matchedPlot
                  ? matchedPlot.crop
                  : undefined)) ||
              farm?.cropHistory?.[0] ||
              '';
            const cropTarget =
              CROPS_CATALOG.find(c => {
                const normalized = cropNameRaw.toLowerCase();
                return normalized && (c.name.toLowerCase().includes(normalized) || normalized.includes(c.name.toLowerCase()));
              }) || CROPS_CATALOG[0];
            const activeLeafSample =
              safeLeafSamples.find(l => l.farmId === farm?.id && l.plotId === activeSoilSample.plotId) ||
              safeLeafSamples.find(l => l.farmId === farm?.id) ||
              safeLeafSamples[0];

            return (
              <TechnicalReportModule
                farm={farm}
                producer={resolvedProducer || DEFAULT_PRODUCER}
                agronomist={agronomist || DEFAULT_AGRONOMIST}
                company={company || companies?.[0] || DEFAULT_COMPANY}
                soilSample={activeSoilSample}
                crop={cropTarget}
                targetYield={cropTarget.defaultYieldTarget}
                leafSample={activeLeafSample}
              />
            );
          })()}
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'historico' && (
        <IntegratedModuleWrapper
          gradientClass="from-stone-900 via-slate-900 to-zinc-900"
          borderClass="border-stone-600/50"
          iconBoxClass="bg-stone-500/20 text-stone-300 border-stone-500/30"
          eyebrowClass="text-stone-400"
          badgeClass="bg-stone-500/30 text-stone-200 border-stone-400/30"
          badgeText="Série Histórica"
          title="Histórico & Comparativo Multissafras"
          description="Evolução temporal da fertilidade do solo, produtividade histórica dos talhões e comparação lado a lado entre safras passadas."
          icon={<History className="w-6 h-6 text-stone-400" />}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Histórico..."
        >
          <HistoricalComparativeModule />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'bulario' && (
        <IntegratedModuleWrapper
          gradientClass="from-teal-950 via-slate-900 to-emerald-950"
          borderClass="border-teal-600/50"
          iconBoxClass="bg-teal-500/20 text-teal-300 border-teal-500/30"
          eyebrowClass="text-teal-400"
          badgeClass="bg-teal-500/30 text-teal-200 border-teal-400/30"
          badgeText="Agrofit / MAPA"
          title="Bulário de Defensivos & Insumos Agrícolas"
          description="Consulta de ingredientes ativos, doses registradas, período de carência (intervalo de segurança) e limites máximos de resíduos (LMR)."
          icon={<Package className="w-6 h-6 text-teal-400" />}
          primaryAction={{
            label: 'Preparar TankMix',
            btnClass: 'bg-emerald-600 hover:bg-emerald-500',
            icon: <FlaskConical className="w-4 h-4" />,
            onClick: () => setActiveTab('tankmix'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Bulário de Defensivos..."
        >
          <PesticideBularioModule
            farmName={farm?.name}
            activeFarm={farm}
            farms={farms || [farm]}
            setActiveTab={(tab: string) => setActiveTab(tab as FieldBookSubTab)}
          />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'bulario_vet' && (
        <IntegratedModuleWrapper
          gradientClass="from-red-950 via-slate-900 to-rose-950"
          borderClass="border-red-600/50"
          iconBoxClass="bg-red-500/20 text-red-300 border-red-500/30"
          eyebrowClass="text-red-400"
          badgeClass="bg-red-500/30 text-red-200 border-red-400/30"
          badgeText="Sanidade Animal"
          title="Compêndio Veterinário & Farmácia Animal"
          description="Medicamentos veterinários, posologias, vias de administração, carência para abate e leite conforme normas do MAPA."
          icon={<Syringe className="w-6 h-6 text-red-400" />}
          primaryAction={{
            label: 'Bovinocultura',
            btnClass: 'bg-amber-600 hover:bg-amber-500',
            icon: <BovinoIcon className="w-4 h-4" />,
            onClick: () => setActiveTab('pecuaria'),
          }}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Compêndio Veterinário..."
        >
          <VeterinaryBularioModule
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            companies={companies || []}
            farms={farms || [farm]}
          />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'bubalinos' && (
        <IntegratedModuleWrapper
          gradientClass="from-slate-900 via-stone-900 to-amber-950"
          borderClass="border-stone-600/50"
          iconBoxClass="bg-stone-500/20 text-amber-300 border-stone-500/30"
          eyebrowClass="text-amber-400"
          badgeClass="bg-amber-500/30 text-amber-200 border-amber-400/30"
          badgeText="Bubalinocultura"
          title="Gestão de Rebanho Bubalino"
          description="Controle zootécnico de búfalos, produção leiteira A2/A2, reprodução, vacinações e pesagens."
          icon={<BubalinoIcon className="w-6 h-6 text-amber-400" />}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Bubalinocultura..."
        >
          <BuffaloModule />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'caprinos' && (
        <IntegratedModuleWrapper
          gradientClass="from-stone-900 via-zinc-900 to-orange-950"
          borderClass="border-orange-600/50"
          iconBoxClass="bg-orange-500/20 text-orange-300 border-orange-500/30"
          eyebrowClass="text-orange-400"
          badgeClass="bg-orange-500/30 text-orange-200 border-orange-400/30"
          badgeText="Caprinocultura"
          title="Gestão de Rebanho Caprino & Ovino"
          description="Controle de rebanho de caprinos e ovinos, manejo de pastagens rotacionadas, FAMACHA e produção de leite e carne."
          icon={<CaprinoIcon className="w-6 h-6 text-orange-400" />}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Caprinocultura..."
        >
          <CaprineModule />
        </IntegratedModuleWrapper>
      )}

      {activeTab === 'equinos' && (
        <IntegratedModuleWrapper
          gradientClass="from-stone-900 via-slate-900 to-amber-950"
          borderClass="border-amber-600/50"
          iconBoxClass="bg-amber-500/20 text-amber-300 border-amber-500/30"
          eyebrowClass="text-amber-400"
          badgeClass="bg-amber-500/30 text-amber-200 border-amber-400/30"
          badgeText="Equinocultura"
          title="Manejo de Tropa & Equinos de Trabalho"
          description="Gestão da tropa da fazenda, vacinação (Mormo, AIE), ferrageamento, escore de condição corporal e alimentação."
          icon={<EquinoIcon className="w-6 h-6 text-amber-400" />}
          onOpenOperations={() => setActiveTab('operations')}
          fallbackLabel="Carregando Equinocultura..."
        >
          <EquineModule />
        </IntegratedModuleWrapper>
      )}

      {anyModalOpen && (
        <React.Suspense fallback={null}>
          <FieldBookModals
            farm={farm}
            fields={fields}
            globalGapAudit={globalGapAudit}
            isIggsModalOpen={isIggsModalOpen}
            onCloseIggsModal={() => setIsIggsModalOpen(false)}
            isGlobalGapModalOpen={isGlobalGapModalOpen}
            onCloseGlobalGapModal={() => setIsGlobalGapModalOpen(false)}
            onSwitchToEditGlobalGapModal={() => setIsEditGlobalGapModalOpen(true)}
            isNewOperationModalOpen={isNewOperationModalOpen}
            initialOpFieldId={initialOpFieldId}
            initialOpType={initialOpType}
            onCloseNewOperationModal={() => setIsNewOperationModalOpen(false)}
            onCreateOperation={handleCreateOperation}
            isEditGlobalGapModalOpen={isEditGlobalGapModalOpen}
            onCloseEditGlobalGapModal={() => setIsEditGlobalGapModalOpen(false)}
            onSaveGlobalGapAudit={handleSaveGlobalGapAudit}
            isTransplantModalOpen={isTransplantModalOpen}
            selectedTransplantBatch={selectedTransplantBatch}
            initialTransplantFieldId={initialTransplantFieldId}
            onCloseTransplantModal={() => setIsTransplantModalOpen(false)}
            onConfirmTransplant={handleConfirmTransplant}
          />
        </React.Suspense>
      )}
    </div>
  );
}

export { FieldBookModule };
