import React, { useState, useEffect, Suspense, lazy } from 'react';
import { SoilCoordinatesProvider } from './context/SoilCoordinatesContext';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { LgpdConsentModal } from './components/LgpdConsentModal';
import { AgroEasterEggModal } from './components/AgroEasterEggModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { useAppUpdate } from './hooks/useAppUpdate';
import { AppUpdateModal } from './components/common/AppUpdateModal';
import {
  Layers,
  Moon,
  Sun,
  Smartphone,
  Wifi,
  WifiOff,
  X,
  ArrowUpRight,
  Bell,
  Building2,
  Tractor,
  Warehouse,
  FlaskConical,
  Calculator,
  Leaf,
  BarChart2,
  Sprout,
  ShieldCheck,
  Scale,
  RotateCcw,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronRight,
  Sparkles,
  Bug,
  CloudSun,
  QrCode,
  DollarSign,
  Droplets,
  FileCheck2,
  Gauge,
  Beef,
  Info,
  Calendar,
  GraduationCap,
  Compass,
  Settings,
} from 'lucide-react';

export const TAB_METADATA: Record<string, { title: string; category: string; icon: any }> = {
  dashboard: { title: 'Dashboard Geral', category: 'Visão Geral', icon: Warehouse },
  configuracoes: { title: 'Configurações', category: 'Principal', icon: Settings },
  nema_ia: { title: 'Nema IA', category: 'Inteligência Artificial', icon: Sparkles },
  caderno_campo: { title: 'Caderno de Campo Digital', category: 'Operações de Campo', icon: Calendar },
  cadastros: { title: 'Gestão de Cadastros', category: 'Estrutura & Propriedades', icon: Building2 },
  sobre: { title: 'Sobre o Sistema', category: 'Institucional', icon: Info },
  rastreabilidade: { title: 'Rastreabilidade Vegetal', category: 'Conformidade & Lotes', icon: QrCode },
  geoprocessamento: { title: 'SIG & Geoprocessamento', category: 'Geoprocessamento', icon: Compass },
  custos: { title: 'Gestão de Custos & DRE', category: 'Econômico & Financeiro', icon: DollarSign },
  solos: { title: 'Laudos de Análise de Solo', category: 'Solos & Laboratório', icon: FlaskConical },
  recomendacoes: { title: 'Manejo & Recomendações', category: 'Nutrição de Plantas', icon: Tractor },
  foliar: { title: 'Diagnose Foliar & DRIS', category: 'Nutrição de Plantas', icon: Leaf },
  pragas: { title: 'MIP - Monitoramento de Pragas', category: 'Proteção Vegetal', icon: Bug },
  bulario: { title: 'Bulário de Defensivos MAPA', category: 'Proteção Vegetal', icon: ShieldCheck },
  meteorologia: { title: 'Clima & Previsão do Tempo', category: 'Meteorologia', icon: CloudSun },
  pluviometro: { title: 'Pluviometria & Balanço Hídrico', category: 'Meteorologia', icon: Droplets },
  plantabilidade: { title: 'Plantabilidade & Sementes', category: 'Engenharia Agrícola', icon: Sprout },
  fertirrigacao: { title: 'Fertirrigação & Tankmix', category: 'Engenharia Agrícola', icon: Droplets },
  historico: { title: 'Histórico & Comparativos', category: 'Analytics de Solos', icon: BarChart2 },
  laudo: { title: 'Laudos Técnicos Oficiais', category: 'Documentos & ART', icon: FileCheck2 },
  fertilizantes: { title: 'Catálogo de Fertilizantes', category: 'Nutrição & Insumos', icon: Layers },
  pulverizacao: { title: 'Calculadora de Pulverização', category: 'Operações & Tecnologia', icon: Gauge },
  pecuaria: { title: 'Pecuária & Zootecnia', category: 'Produção Animal', icon: Beef },
  pericia_rural: { title: 'Perícia Rural & Laudos', category: 'Perícias & Vistorias', icon: Scale },
  zarc_risco: { title: 'ZARC & Risco Climático', category: 'Planejamento & Risco', icon: CloudSun },
  gestao_rural: { title: 'Administração & Gestão Rural', category: 'ERP Agrícola 360°', icon: Building2 },
  forrageiras: { title: 'Informações sobre Forrageiras', category: 'Pastagens & Zootecnia', icon: Leaf },
  geaagro_edu: { title: 'GeaAgro Edu', category: 'Educação & Conteúdo', icon: GraduationCap },
};
import {
  Company,
  Agronomist,
  RuralProducer,
  Farm,
  SoilSample,
  LeafSample,
  CropNutritionalTarget,
} from './types/agronomy';
import {
  INITIAL_COMPANIES,
  INITIAL_AGRONOMISTS,
  INITIAL_PRODUCERS,
  INITIAL_FARMS,
  INITIAL_SOIL_SAMPLES,
  INITIAL_LEAF_SAMPLES,
} from './utils/sampleData';
import { CROPS_CATALOG } from './data/agronomicStandards';
import { INITIAL_OPERATIONS } from './data/fieldbookData';
import { getNotificationHistory, checkAndNotifyDueTasks } from './utils/notificationService';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { DashboardQuickAccessSection } from './components/dashboard/DashboardQuickAccessSection';
import { DigitalFoodPassportModal } from './components/traceability/DigitalFoodPassportModal';
import {
  INITIAL_TRACEABILITY_PROPERTY,
  INITIAL_TRACEABILITY_LOTS,
  INITIAL_TRACEABILITY_OPERATIONS,
  INITIAL_TRACEABILITY_HARVESTS,
  INITIAL_TRACEABILITY_PHOTO_DIARY,
} from './data/traceabilityData';
import { TraceabilityLot, TraceabilityProperty, TraceabilityOperation, TraceabilityHarvestItem, TraceabilityPhotoDiaryItem } from './types/traceability';

// Lazy load modules with high resilience to keep the initial load extremely lightweight and secure
const DashboardModule = lazyWithRetry(() => import('./components/DashboardModule').then((m: any) => ({ default: m.DashboardModule || m.default })));
const RegistrationModule = lazyWithRetry(() => import('./components/RegistrationModule').then((m: any) => ({ default: m.RegistrationModule || m.default })));
const SoilAnalysisModule = lazyWithRetry(() => import('./components/SoilAnalysisModule').then((m: any) => ({ default: m.SoilAnalysisModule || m.default })));
const RecommendationModule = lazyWithRetry(() => import('./components/RecommendationModule').then((m: any) => ({ default: m.RecommendationModule || m.default })));
const LeafAnalysisModule = lazyWithRetry(() => import('./components/LeafAnalysisModule').then((m: any) => ({ default: m.LeafAnalysisModule || m.default })));
const HistoricalComparativeModule = lazyWithRetry(() => import('./components/HistoricalComparativeModule').then((m: any) => ({ default: m.HistoricalComparativeModule || m.default })));
const TechnicalReportModule = lazyWithRetry(() => import('./components/TechnicalReportModule').then((m: any) => ({ default: m.TechnicalReportModule || m.default })));
const NurseryModule = lazyWithRetry(() => import('./components/NurseryModule').then((m: any) => ({ default: m.NurseryModule || m.default })));
const HydroponicsModule = lazyWithRetry(() => import('./components/HydroponicsModule').then((m: any) => ({ default: m.HydroponicsModule || m.default })));
const WeatherModule = lazyWithRetry(() => import('./components/WeatherModule').then((m: any) => ({ default: m.WeatherModule || m.default })));
const RainGaugeModule = lazyWithRetry(() => import('./components/RainGaugeModule').then((m: any) => ({ default: m.RainGaugeModule || m.default })));
const PhenologyModule = lazyWithRetry(() => import('./components/PhenologyModule').then((m: any) => ({ default: m.PhenologyModule || m.default })));
const FertigationModule = lazyWithRetry(() => import('./components/FertigationModule').then((m: any) => ({ default: m.FertigationModule || m.default })));
const TankMixModule = lazyWithRetry(() => import('./components/TankMixModule').then((m: any) => ({ default: m.TankMixModule || m.default })));
const WaterAnalysisModule = lazyWithRetry(() => import('./components/WaterAnalysisModule').then((m: any) => ({ default: m.WaterAnalysisModule || m.default })));
const BrixModule = lazyWithRetry(() => import('./components/BrixModule').then((m: any) => ({ default: m.BrixModule || m.default })));
const AgronomicCalculationsModule = lazyWithRetry(() => import('./components/AgronomicCalculationsModule').then((m: any) => ({ default: m.AgronomicCalculationsModule || m.default })));
const SeedAnalysisModule = lazyWithRetry(() => import('./components/SeedAnalysisModule').then((m: any) => ({ default: m.SeedAnalysisModule || m.default })));
const PlantabilityModule = lazyWithRetry(() => import('./components/PlantabilityModule').then((m: any) => ({ default: m.PlantabilityModule || m.default })));
const NematologyModule = lazyWithRetry(() => import('./components/NematologyModule').then((m: any) => ({ default: m.NematologyModule || m.default })));
const SoilDiseasesModule = lazyWithRetry(() => import('./components/SoilDiseasesModule').then((m: any) => ({ default: m.SoilDiseasesModule || m.default })));
const PestMonitoringModule = lazyWithRetry(() => import('./components/PestMonitoringModule').then((m: any) => ({ default: m.PestMonitoringModule || m.default })));
const PesticideBularioModule = lazyWithRetry(() => import('./components/PesticideBularioModule').then((m: any) => ({ default: m.PesticideBularioModule || m.default })));
const VeterinaryBularioModule = lazyWithRetry(() => import('./components/VeterinaryBularioModule').then((m: any) => ({ default: m.VeterinaryBularioModule || m.default })));
const LivestockModule = lazyWithRetry(() => import('./components/LivestockModule').then((m: any) => ({ default: m.LivestockModule || m.default })));
const BuffaloModule = lazyWithRetry(() => import('./components/BuffaloModule').then((m: any) => ({ default: m.BuffaloModule || m.default })));
const CaprineModule = lazyWithRetry(() => import('./components/CaprineModule').then((m: any) => ({ default: m.CaprineModule || m.default })));
const EquineModule = lazyWithRetry(() => import('./components/EquineModule').then((m: any) => ({ default: m.EquineModule || m.default })));
const SwineModule = lazyWithRetry(() => import('./components/SwineModule').then((m: any) => ({ default: m.SwineModule || m.default })));
const PoultryModule = lazyWithRetry(() => import('./components/PoultryModule').then((m: any) => ({ default: m.PoultryModule || m.default })));
const AnimalNutritionModule = lazyWithRetry(() => import('./components/nutrition/AnimalNutritionModule').then((m: any) => ({ default: m.AnimalNutritionModule || m.default })));
const FieldBookModule = lazyWithRetry(() => import('./components/FieldBookModule').then((m: any) => ({ default: m.FieldBookModule || m.default })));
const NemaAIConsole = lazyWithRetry(() => import('./components/NemaAIConsole').then((m: any) => ({ default: m.NemaAIConsole || m.default })));
const AboutModule = lazyWithRetry(() => import('./components/AboutModule').then((m: any) => ({ default: m.AboutModule || m.default })));
const BackupModule = lazyWithRetry(() => import('./components/BackupModule').then((m: any) => ({ default: m.BackupModule || m.default })));
const CostManagementModule = lazyWithRetry(() => import('./components/costs/CostManagementModule').then((m: any) => ({ default: m.CostManagementModule || m.default })));
const IrrigationModule = lazyWithRetry(() => import('./components/irrigation/IrrigationModule').then((m: any) => ({ default: m.IrrigationModule || m.default })));
const TraceabilityModule = lazyWithRetry(() => import('./components/TraceabilityModule').then((m: any) => ({ default: m.TraceabilityModule || m.default })));
const PericiaModule = lazyWithRetry(() => import('./components/pericia/PericiaModule').then((m: any) => ({ default: m.PericiaModule || m.default })));
const GeoprocessamentoModule = lazyWithRetry(() => import('./components/GeoprocessamentoModule').then((m: any) => ({ default: m.GeoprocessamentoModule || m.default })));
const ZarcRiscoModule = lazyWithRetry(() => import('./components/ZarcRiscoModule').then((m: any) => ({ default: m.ZarcRiscoModule || m.default })));
const GestaoRuralModule = lazyWithRetry(() => import('./components/GestaoRuralModule').then((m: any) => ({ default: m.GestaoRuralModule || m.default })));
const ForageCatalogModule = lazyWithRetry(() => import('./components/ForageCatalogModule').then((m: any) => ({ default: m.ForageCatalogModule || m.default })));
const GeaAgroEduModule = lazyWithRetry(() => import('./components/GeaAgroEduModule').then((m: any) => ({ default: m.GeaAgroEduModule || m.default })));
const ConfiguracoesModule = lazyWithRetry(() => import('./components/ConfiguracoesModule').then((m: any) => ({ default: m.ConfiguracoesModule || m.default })));

// Error boundary to catch any runtime exceptions during module hydration or rendering
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModuleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ModuleErrorBoundary] Caught component error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm my-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <X className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {this.props.fallbackTitle || 'Módulo indisponível temporariamente'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Ocorreu uma instabilidade pontual ao renderizar os componentes da visualização. Seus dados permanecem salvos e seguros no banco local.
            </p>
            {this.state.error && (
              <p className="text-[11px] font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg max-w-lg mx-auto overflow-x-auto text-left">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recarregar Módulo</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Client-side direct URL and Query parser for seamless routing
export function parseRouteFromUrl(): { tab: string; subTab: string } {
  if (typeof window === 'undefined') {
    return { tab: 'dashboard', subTab: 'dashboard' };
  }

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const queryTab = searchParams.get('tab');
    const querySubTab = searchParams.get('subTab') || searchParams.get('subtab') || searchParams.get('view');
    const queryLot = searchParams.get('lote') || searchParams.get('lot') || searchParams.get('lotCode') || searchParams.get('passaporte');

    // Direct Traceability / Passaporte QR Code links (e.g. ?lote=GA-TOM-2027-EST01-0001)
    if (queryLot) {
      return { tab: 'rastreabilidade', subTab: querySubTab || 'passaporte' };
    }

    // Parse pathname (e.g. /operacoes, /fieldbook/operations, /caderno_campo/operacoes)
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const routeStr = rawPath || rawHash;
    const parts = routeStr.split('/').filter(Boolean);
    const rootSegment = parts[0] || '';
    const subSegment = parts[1] || '';

    // Direct Operations / Manejo Routes
    if (
      rootSegment === 'operacoes' ||
      rootSegment === 'operations' ||
      rootSegment === 'operacoes-manejo' ||
      rootSegment === 'manejo' ||
      queryTab === 'operacoes' ||
      queryTab === 'operations'
    ) {
      return { tab: 'caderno_campo', subTab: 'operations' };
    }

    // Direct Traceability Routes
    if (
      rootSegment === 'rastreabilidade' ||
      rootSegment === 'rastrear' ||
      rootSegment === 'passaporte' ||
      rootSegment === 'lote' ||
      rootSegment === 'etiquetas'
    ) {
      return { tab: 'rastreabilidade', subTab: subSegment || querySubTab || 'dashboard' };
    }

    if (queryTab) {
      let normalizedTab = queryTab.toLowerCase();
      let normalizedSub = querySubTab?.toLowerCase() || 'dashboard';

      if (['fieldbook', 'caderno-de-campo', 'cadernodecampo', 'caderno_campo'].includes(normalizedTab)) {
        normalizedTab = 'caderno_campo';
        if (['operacoes', 'operations', 'manejo'].includes(normalizedSub)) normalizedSub = 'operations';
      }
      return { tab: normalizedTab, subTab: normalizedSub };
    }

    if (['caderno_campo', 'caderno-de-campo', 'cadernodecampo', 'fieldbook'].includes(rootSegment)) {
      let sub = subSegment || 'dashboard';
      if (['operacoes', 'operations', 'manejo'].includes(sub)) sub = 'operations';
      return { tab: 'caderno_campo', subTab: sub };
    }

    if (rootSegment) {
      const tabMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'painel': 'dashboard',
        'nema_ia': 'nema_ia',
        'ia': 'nema_ia',
        'solos': 'solos',
        'solo': 'solos',
        'soil': 'solos',
        'recomendacoes': 'recomendacoes',
        'foliar': 'foliar',
        'folhas': 'foliar',
        'historico': 'historico',
        'laudo': 'laudo',
        'cadastros': 'cadastros',
        'sementes': 'analise_sementes',
        'analise_sementes': 'analise_sementes',
        'plantabilidade': 'plantabilidade',
        'nematologia': 'nematologia',
        'pragas': 'pragas',
        'mip': 'pragas',
        'bulario': 'bulario',
        'defensivos': 'bulario',
        'bulario_vet': 'bulario_vet',
        'bulario_veterinario': 'bulario_vet',
        'clima': 'meteorologia',
        'meteorologia': 'meteorologia',
        'pluviometria': 'pluviometria',
        'fenologia': 'fenologia',
        'fertirrigacao': 'fertirrigacao',
        'tankmix': 'tankmix',
        'tanque': 'tankmix',
        'analise_agua': 'analise_agua',
        'agua': 'analise_agua',
        'brix': 'brix',
        'calculos': 'calculos_agronomicos',
        'calculos_agronomicos': 'calculos_agronomicos',
        'pecuaria': 'pecuaria',
        'bubalinos': 'bubalinos',
        'caprinos': 'caprinos',
        'equinos': 'equinos',
        'suinocultura': 'suinocultura',
        'suinos': 'suinocultura',
        'avicultura': 'avicultura',
        'nutricao_animal': 'nutricao_animal',
        'custos': 'custos',
        'irrigacao': 'irrigacao',
        'geoprocessamento': 'geoprocessamento',
        'sig': 'geoprocessamento',
        'zarc': 'zarc_risco',
        'zarc_risco': 'zarc_risco',
        'risco': 'zarc_risco',
        'configuracoes': 'configuracoes',
        'configuracao': 'configuracoes',
        'settings': 'configuracoes',
        'config': 'configuracoes',
        'perfil': 'configuracoes',
        'perfis': 'configuracoes',
        'backup': 'backup',
        'sobre': 'sobre',
      };

      if (tabMap[rootSegment]) {
        return { tab: tabMap[rootSegment], subTab: subSegment || 'dashboard' };
      }
    }
  } catch (e) {
    console.warn('[Routing] Failed to parse route from URL:', e);
  }

  return { tab: 'dashboard', subTab: 'dashboard' };
}

// Robust and premium shimmer loading skeleton
function ModuleLoader() {
  return (
    <div className="w-full space-y-6 animate-pulse p-4">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-48 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="h-4 w-72 bg-slate-100 dark:bg-zinc-900 rounded-md"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-96 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-6"></div>
        <div className="h-96 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-6"></div>
      </div>
    </div>
  );
}

function EmptyFarmPrompt({
  icon: Icon,
  title,
  description,
  onNavigateToRegister,
  onNavigate,
}: {
  icon: any;
  title: string;
  description: string;
  onNavigateToRegister: () => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto my-4 sm:my-8 space-y-8 animate-fade-in">
      {/* Welcome Banner Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100/60 dark:border-emerald-800/40 shadow-2xs">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed max-w-lg mx-auto">{description}</p>
        
        <button
          onClick={onNavigateToRegister}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-emerald-600/20 cursor-pointer"
        >
          <Building2 className="w-4 h-4" /> Cadastrar Propriedade / Fazenda
        </button>
      </div>

      {/* Expanded Comprehensive Quick Access Grid */}
      {onNavigate && (
        <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <DashboardQuickAccessSection
            onNavigate={onNavigate}
            title="Acesso Rápido às Funcionalidades"
            description="Explore as ferramentas de solos, nutrição, operações de campo, rastreabilidade e defensivos"
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agronutri_authenticated') === 'true';
    }
    return false;
  });

  // Theme State: Dark Mode AMOLED
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agronutri_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Desktop Sidebar Collapsed State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agronutri_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
    }
  }, [isSidebarCollapsed]);

  // Notification Center Modal & Counter
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  // PWA and Online States
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  // Controlled App Update Management Hook
  const {
    updateAvailable,
    isChecking: isCheckingUpdate,
    isUpToDate,
    showUpdateModal,
    currentVersion,
    checkForUpdates,
    applyUpdate,
    deferUpdate,
  } = useAppUpdate();


  // Sync HTML root element class with theme state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('agronutri_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('agronutri_theme', 'light');
    }
  }, [isDarkMode]);

  // Handle Online/Offline Status and PWA installation prompt
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      console.log('[PWA] GeaAgro instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Update Notification unread counter & listen to Service Worker push clicks
  useEffect(() => {
    const updateUnread = () => {
      const history = getNotificationHistory();
      const unread = (history || []).filter(h => h && !h.read).length;
      setUnreadNotifications(unread);
    };

    updateUnread();
    const interval = setInterval(updateUnread, 4000);

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION_CLICKED') {
        const payload = event.data.data;
        if (payload?.tab) {
          setActiveTab(payload.tab);
          if (payload.subTab) {
            setActiveSubTab(payload.subTab);
          }
        }
        updateUnread();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    return () => {
      clearInterval(interval);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Escolha do usuário para instalação: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Navigation & Farm Context initialized from direct URL or query parameters
  const initialRoute = parseRouteFromUrl();
  const [activeTab, setActiveTab] = useState<string>(initialRoute.tab);
  const [activeSubTab, setActiveSubTab] = useState<string>(initialRoute.subTab);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(INITIAL_FARMS[0]?.id || '');

  // Listen for browser popstate (back/forward history navigation) and custom app navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromUrl();
      setActiveTab(route.tab);
      setActiveSubTab(route.subTab);
    };

    const handleCustomNavigate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.tab) {
        setActiveTab(detail.tab);
        if (detail.subTab) {
          setActiveSubTab(detail.subTab);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('gea-navigate', handleCustomNavigate);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('gea-navigate', handleCustomNavigate);
    };
  }, []);

  // Synchronize activeTab and activeSubTab into browser URL for direct link sharing & refresh resilience
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      const currentTab = url.searchParams.get('tab');
      const currentSubTab = url.searchParams.get('subTab') || url.searchParams.get('subtab');

      if (currentTab !== activeTab || (activeSubTab && currentSubTab !== activeSubTab)) {
        if (activeTab === 'dashboard' && activeSubTab === 'dashboard') {
          url.searchParams.delete('tab');
          url.searchParams.delete('subTab');
          url.searchParams.delete('subtab');
        } else {
          url.searchParams.set('tab', activeTab);
          if (activeSubTab && activeSubTab !== 'dashboard') {
            url.searchParams.set('subTab', activeSubTab);
          } else {
            url.searchParams.delete('subTab');
            url.searchParams.delete('subtab');
          }
        }
        window.history.replaceState({ tab: activeTab, subTab: activeSubTab }, '', url.toString());
      }
    } catch (e) {
      console.warn('[Routing] Failed to update URL state:', e);
    }
  }, [activeTab, activeSubTab]);

  // Master Data State with LocalStorage Persistence
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_companies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && typeof c === 'object' && c.id && c.id !== 'comp-1');
        }
      }
      return INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });
  const [agronomists, setAgronomists] = useState<Agronomist[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_agronomists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: any) => a && typeof a === 'object' && a.id && a.id !== 'agronomo-1' && a.id !== 'agronomo-2');
        }
      }
      return INITIAL_AGRONOMISTS;
    } catch {
      return INITIAL_AGRONOMISTS;
    }
  });
  const [producers, setProducers] = useState<RuralProducer[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_producers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => p && typeof p === 'object' && p.id && !p.id.includes('test') && !p.id.startsWith('prod-'));
        }
      }
      return INITIAL_PRODUCERS;
    } catch {
      return INITIAL_PRODUCERS;
    }
  });
  const [farms, setFarms] = useState<Farm[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_farms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((f: any) => f && typeof f === 'object' && f.id && !f.id.includes('test') && f.id !== 'farm-1' && f.id !== 'farm-2');
        }
      }
      return INITIAL_FARMS;
    } catch {
      return INITIAL_FARMS;
    }
  });
  const [soilSamples, setSoilSamples] = useState<SoilSample[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_soil_samples');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s: any) => s && typeof s === 'object' && s.id && !s.id.startsWith('soil-'));
        }
      }
      return INITIAL_SOIL_SAMPLES;
    } catch {
      return INITIAL_SOIL_SAMPLES;
    }
  });
  const [leafSamples, setLeafSamples] = useState<LeafSample[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_leaf_samples');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((l: any) => l && typeof l === 'object' && l.id && !l.id.startsWith('foliar-') && !l.id.startsWith('leaf-'));
        }
      }
      return INITIAL_LEAF_SAMPLES;
    } catch {
      return INITIAL_LEAF_SAMPLES;
    }
  });

  useEffect(() => {
    localStorage.setItem('agronutri_companies', JSON.stringify(companies));
  }, [companies]);
  useEffect(() => {
    localStorage.setItem('agronutri_agronomists', JSON.stringify(agronomists));
  }, [agronomists]);
  useEffect(() => {
    localStorage.setItem('agronutri_producers', JSON.stringify(producers));
  }, [producers]);
  useEffect(() => {
    localStorage.setItem('agronutri_farms', JSON.stringify(farms));
    if (!selectedFarmId && (farms || []).length > 0 && farms[0]?.id) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);
  useEffect(() => {
    localStorage.setItem('agronutri_soil_samples', JSON.stringify(soilSamples));
  }, [soilSamples]);
  useEffect(() => {
    localStorage.setItem('agronutri_leaf_samples', JSON.stringify(leafSamples));
  }, [leafSamples]);

  // Recommendation & Report Context
  const [selectedSampleForRec, setSelectedSampleForRec] = useState<string>(() => soilSamples[0]?.id || '');
  const [selectedCropForReport, setSelectedCropForReport] = useState<CropNutritionalTarget>(CROPS_CATALOG[0]);
  const [targetYieldForReport, setTargetYieldForReport] = useState<number>(75);
  const [limingPrntForReport, setLimingPrntForReport] = useState<number>(85);
  const [depthForReport, setDepthForReport] = useState<number>(20);

  // Derived Active Contexts
  const currentFarm: Farm | undefined = (farms || []).find(f => f?.id === selectedFarmId) || farms?.[0];
  const currentProducer: RuralProducer | undefined = (producers || []).find(p => p?.id === currentFarm?.producerId) || producers?.[0];
  const currentAgronomist: Agronomist | undefined = (agronomists || []).find(a => a?.id === (currentFarm?.agronomistId || (currentFarm as any)?.responsibleAgronomistId)) || agronomists?.[0];
  const currentCompany: Company | undefined = (companies || []).find(c => c?.id === currentAgronomist?.companyId) || companies?.[0];

  // Trigger due task checks when farm changes
  useEffect(() => {
    if (currentFarm) {
      checkAndNotifyDueTasks(INITIAL_OPERATIONS, currentFarm.name);
    }
  }, [currentFarm?.id]);

  // Callback when clicking "Gerar Laudo / Calcular" from Soil table
  const handleSelectSampleForRecommendation = (sample: SoilSample) => {
    setSelectedSampleForRec(sample.id);
    setActiveTab('recomendacoes');
  };

  // Callback when transitioning to official report
  const handleGenerateReport = (
    sample: SoilSample,
    crop: CropNutritionalTarget,
    targetYield: number,
    limingPRNT: number,
    depth: number
  ) => {
    setSelectedSampleForRec(sample.id);
    setSelectedCropForReport(crop);
    setTargetYieldForReport(targetYield);
    setLimingPrntForReport(limingPRNT);
    setDepthForReport(depth);
    setActiveTab('relatorios');
  };

  const handleNavigateFromNotification = (tab: string, subTab?: string) => {
    setActiveTab(tab);
    if (subTab) setActiveSubTab(subTab);
    setIsNotificationCenterOpen(false);
  };


  const activeSoilSample = (soilSamples || []).find(s => s?.id === selectedSampleForRec) || soilSamples?.[0];
  const activeLeafSample = (leafSamples || []).find(l => l?.farmId === currentFarm?.id && l?.plotId === activeSoilSample?.plotId) || leafSamples?.[0];

  // Check if unauthenticated visitor or consumer is accessing a public traceability QR code passport
  const [publicPassportDismissed, setPublicPassportDismissed] = useState<boolean>(false);

  const getPublicTraceabilityData = () => {
    if (typeof window === 'undefined' || publicPassportDismissed) return null;
    const searchParams = new URLSearchParams(window.location.search);
    const queryLot = searchParams.get('lote') || searchParams.get('lot') || searchParams.get('lotCode') || searchParams.get('passaporte');
    const path = window.location.pathname.toLowerCase();
    const isPassportPath = path.includes('passaporte') || path.includes('rastreabilidade');

    if (queryLot || isPassportPath) {
      try {
        let savedLots: TraceabilityLot[] = INITIAL_TRACEABILITY_LOTS;
        const storedLots = localStorage.getItem('geaagro_traceability_lots');
        if (storedLots) {
          const parsed = JSON.parse(storedLots);
          if (Array.isArray(parsed) && parsed.length > 0) savedLots = parsed;
        }

        const targetLot = queryLot
          ? (savedLots.find(l => l.lotCode.toLowerCase() === queryLot.toLowerCase() || l.id.toLowerCase() === queryLot.toLowerCase()) || savedLots[0])
          : savedLots[0];

        let savedProperty: TraceabilityProperty = INITIAL_TRACEABILITY_PROPERTY;
        const storedProp = localStorage.getItem('geaagro_traceability_property');
        if (storedProp) {
          try { savedProperty = JSON.parse(storedProp); } catch {}
        }

        let savedOps: TraceabilityOperation[] = INITIAL_TRACEABILITY_OPERATIONS;
        const storedOps = localStorage.getItem('geaagro_traceability_operations');
        if (storedOps) {
          try { savedOps = JSON.parse(storedOps); } catch {}
        }

        let savedHarvs: TraceabilityHarvestItem[] = INITIAL_TRACEABILITY_HARVESTS;
        const storedHarvs = localStorage.getItem('geaagro_traceability_harvests');
        if (storedHarvs) {
          try { savedHarvs = JSON.parse(storedHarvs); } catch {}
        }

        let savedPhotos: TraceabilityPhotoDiaryItem[] = INITIAL_TRACEABILITY_PHOTO_DIARY;
        const storedPhotos = localStorage.getItem('geaagro_traceability_photos');
        if (storedPhotos) {
          try { savedPhotos = JSON.parse(storedPhotos); } catch {}
        }

        if (targetLot) {
          return {
            lot: targetLot,
            property: savedProperty,
            operations: savedOps,
            harvests: savedHarvs,
            photos: savedPhotos,
          };
        }
      } catch (e) {
        console.warn('Erro ao carregar dados do passaporte público:', e);
      }
    }
    return null;
  };

  const publicPassportData = getPublicTraceabilityData();

  if (!isAuthenticated) {
    if (publicPassportData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 text-slate-100">
          <div className="w-full max-w-3xl mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Consulta Pública de Rastreabilidade • MAPA / ANVISA
              </span>
            </div>
            <button
              onClick={() => setPublicPassportDismissed(true)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              Acessar Sistema GeaAgro
            </button>
          </div>
          <DigitalFoodPassportModal
            lot={publicPassportData.lot}
            property={publicPassportData.property}
            operations={publicPassportData.operations}
            harvests={publicPassportData.harvests}
            photos={publicPassportData.photos}
            onClose={() => setPublicPassportDismissed(true)}
          />
        </div>
      );
    }

    return (
      <LoginScreen
        onLogin={() => {
          setIsAuthenticated(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('agronutri_authenticated', 'true');
          }
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    );
  }

  return (
    <SoilCoordinatesProvider>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0b110d] text-zinc-100' : 'bg-[#f3f6f2] text-slate-800'} flex flex-col lg:flex-row font-sans antialiased transition-colors duration-200`}>
      {/* Responsive Sidebar Navigation & Mobile Drawer */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        farms={farms}
        producers={producers}
        agronomists={agronomists}
        company={currentCompany}
        selectedFarmId={selectedFarmId}
        setSelectedFarmId={setSelectedFarmId}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={(openOrFn) => {
          setIsMobileMenuOpen(prev => {
            const nextVal = typeof openOrFn === 'function' ? openOrFn(prev) : openOrFn;
            if (nextVal) {
              setIsNotificationCenterOpen(false);
            }
            return nextVal;
          });
        }}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onOpenNotifications={() => {
          setIsMobileMenuOpen(false);
          setIsNotificationCenterOpen(true);
        }}
        unreadNotificationsCount={unreadNotifications}
        onLogout={() => {
          setIsAuthenticated(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('agronutri_authenticated', 'false');
          }
        }}
      />

      {/* Main Content Viewport */}
      <div className={`flex-1 flex flex-col min-w-0 ${isSidebarCollapsed ? '' : 'lg:pl-68'} transition-all duration-300`}>
        {/* Desktop Top Header Bar (Desktop only, mobile/tablet uses Navbar header) */}
        <header className="hidden lg:flex h-16 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 items-center justify-between sticky top-0 z-[100] print:hidden transition-colors shadow-2xs">
          {/* Left: Sidebar toggle + Dynamic Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-900 transition-all cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            
            {/* Unified Breadcrumb */}
            {(() => {
              const meta = TAB_METADATA[activeTab] || {
                title: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
                category: 'Módulo Agronômico',
                icon: Layers,
              };
              const IconComp = meta.icon;

              return (
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="text-slate-400 dark:text-zinc-500 font-semibold truncate hidden xl:inline">
                    {meta.category}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-700 shrink-0 hidden xl:inline" />
                  <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white bg-slate-100/80 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-zinc-800">
                    <IconComp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{meta.title}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Center/Right: Farm Selector + Online Indicator + Company + Notifications + Dark Mode */}
          <div className="flex items-center gap-3 text-xs">
            {/* Unified Farm Selector Card */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 shadow-2xs">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:inline">
                Fazenda:
              </span>
              <select
                aria-label="Selecionar fazenda ativa"
                value={selectedFarmId}
                onChange={e => setSelectedFarmId(e.target.value)}
                disabled={(farms || []).length === 0}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 max-w-[200px] xl:max-w-xs truncate"
              >
                {(farms || []).length === 0 ? (
                  <option value="">Nenhuma fazenda cadastrada</option>
                ) : (
                  (farms || []).filter(f => f && f.id).map(f => {
                    const prod = producers.find(p => p?.id === f.producerId);
                    return (
                      <option key={f.id} value={f.id} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">
                        {f.name} ({f.city}/{f.state}) - {prod?.name || 'Produtor'}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Online Status Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/40'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/40'
              }`}
              title={isOnline ? 'Conexão ativa' : 'Modo offline local ativo (IndexedDB)'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isOnline ? 'Online' : 'Local DB'}</span>
            </div>



            {/* Desktop Right Header: Company Name */}
            {currentCompany && (currentCompany.tradingName || currentCompany.name) && (
              <div className="hidden 2xl:flex items-center gap-2 bg-slate-100/60 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-zinc-300 font-semibold truncate max-w-[180px]">
                  {currentCompany.tradingName || currentCompany.name}
                </span>
              </div>
            )}

            {/* Notification Bell in Top Bar */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsNotificationCenterOpen(true);
              }}
              aria-label="Central de notificações"
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
              title="Notificações"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-zinc-200" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-xs ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              aria-label="Alternar modo escuro"
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
              title={isDarkMode ? 'Mudar para Modo Claro' : 'Ativar Modo Escuro'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </header>


        {/* Dynamic Module Content Viewport with Smartphone Bottom Spacing */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 w-full space-y-6 pb-24 sm:pb-10 transition-all duration-300">
          {/* Offline Warning Alert Banner */}
          {!isOnline && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs animate-fade-in print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-red-800 dark:text-red-400">Modo Local Ativo</h4>
                  <p className="text-[11px] text-red-600/90 dark:text-red-400/80 mt-0.5">Sem conexão com a internet. Os dados estão sendo lidos e gravados com segurança no banco local do seu celular (IndexedDB).</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/20 tracking-wider">IndexedDB</span>
            </div>
          )}

          {/* PWA Install Banner */}
          {showInstallBanner && (
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-xl p-4 sm:p-5 shadow-md border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in print:hidden">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-white">Instalar GeaAgro no seu dispositivo</h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">Acesse como um aplicativo nativo diretamente da tela inicial, com desempenho super rápido sem a necessidade de internet</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-800/40 rounded-lg text-xs transition-colors cursor-pointer"
                  aria-label="Ignorar instalação"
                >
                  Agora Não
                </button>
                <button
                  onClick={handleInstallClick}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  Instalar App <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}


          <ModuleErrorBoundary key={activeTab} fallbackTitle="Erro ao carregar o módulo solicitado">
            <Suspense fallback={<ModuleLoader />}>
              {activeTab === 'dashboard' && (
              currentFarm ? (
                <DashboardModule
                  farm={currentFarm}
                  farms={farms}
                  producer={currentProducer}
                  producers={producers}
                  agronomist={currentAgronomist}
                  company={currentCompany}
                  soilSamples={soilSamples}
                  leafSamples={leafSamples}
                  setActiveTab={setActiveTab}
                  setSelectedFarmId={setSelectedFarmId}
                  setActiveSubTab={setActiveSubTab}
                />
              ) : (
                <EmptyFarmPrompt
                  icon={Warehouse}
                  title="Pronto para a sua Produção"
                  description="A GeaAgro CRM está configurado e pronto para suas operações. Cadastre sua primeira propriedade rural para iniciar a gestão agronômica, laudos de solo e manejo das lavouras."
                  onNavigateToRegister={() => setActiveTab('cadastros')}
                  onNavigate={(tab, subTab) => {
                    setActiveTab(tab);
                    if (subTab) {
                      setActiveSubTab(subTab);
                    }
                  }}
                />
              )
            )}

            {activeTab === 'nema_ia' && (
              <NemaAIConsole
                currentFarm={currentFarm}
                currentProducer={currentProducer}
                currentAgronomist={currentAgronomist}
                soilSamples={soilSamples}
                leafSamples={leafSamples}
                initialSubModule={activeSubTab === 'nema_ia_score' ? 'score' : 'conversa'}
              />
            )}

            {activeTab === 'caderno_campo' && (
              <FieldBookModule
                farm={currentFarm || farms?.[0] || INITIAL_FARMS[0]}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                soilSamples={soilSamples}
                agronomist={currentAgronomist}
                company={currentCompany}
                onNavigateToRegister={() => {
                  setActiveTab('cadastros');
                  setActiveSubTab('fazendas');
                }}
                onNavigate={(tab, subTab) => {
                  setActiveTab(tab as any);
                  if (subTab) setActiveSubTab(subTab as any);
                }}
              />
            )}

            {activeTab === 'cadastros' && (
              <RegistrationModule
                companies={companies}
                setCompanies={setCompanies}
                agronomists={agronomists}
                setAgronomists={setAgronomists}
                producers={producers}
                setProducers={setProducers}
                farms={farms}
                setFarms={setFarms}
                selectedFarmId={selectedFarmId}
                setSelectedFarmId={setSelectedFarmId}
                setActiveTab={setActiveTab}
                setActiveSubTab={setActiveSubTab}
              />
            )}

            {activeTab === 'analise_sementes' && (
              <SeedAnalysisModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'nematologia' && (
              <NematologyModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'doencas_solo' && (
              <SoilDiseasesModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                selectedFarmId={selectedFarmId}
                setActiveTab={setActiveTab}
                onNavigateToBackup={() => setActiveTab('backup')}
              />
            )}

            {activeTab === 'pragas' && (
              <PestMonitoringModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'bulario' && (
              <PesticideBularioModule
                farmName={currentFarm?.name}
                activeFarm={currentFarm}
                activeProducer={currentProducer}
                activeAgronomist={currentAgronomist}
                activeCompany={currentCompany}
                farms={farms}
                producers={producers}
                selectedFarmId={selectedFarmId}
                setSelectedFarmId={setSelectedFarmId}
                setFarms={setFarms}
                setProducers={setProducers}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'rastreabilidade' && (
              <TraceabilityModule
                farms={farms}
                currentFarm={currentFarm}
                producers={producers}
                agronomists={agronomists}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
              />
            )}

            {activeTab === 'geoprocessamento' && (
              <GeoprocessamentoModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                currentFarm={currentFarm}
                currentCompany={currentCompany}
                currentAgronomist={currentAgronomist}
                currentProducer={currentProducer}
                companies={companies}
                agronomists={agronomists}
                farms={farms}
                producers={producers}
              />
            )}

            {activeTab === 'zarc_risco' && (
              <ZarcRiscoModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                currentFarm={currentFarm}
                currentProducer={currentProducer}
                currentAgronomist={currentAgronomist}
                currentCompany={currentCompany}
                farms={farms}
                producers={producers}
              />
            )}

            {activeTab === 'custos' && (
              <CostManagementModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                selectedFarmId={selectedFarmId}
              />
            )}

            {activeTab === 'irrigacao' && (
              <IrrigationModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
              />
            )}

            {activeTab === 'pecuaria' && (
              <LivestockModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'bulario_vet' && (
              <VeterinaryBularioModule
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                companies={companies}
                farms={farms}
                producers={producers}
                agronomists={agronomists}
                setAgronomists={setAgronomists}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'bubalinos' && (
              <BuffaloModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'caprinos' && (
              <CaprineModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'equinos' && (
              <EquineModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'suinocultura' && (
              <SwineModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                onNavigateToTankMix={() => setActiveTab('tankmix')}
                onNavigateToPoultry={() => setActiveTab('avicultura')}
                onNavigateToBuffalo={() => setActiveTab('bubalinos')}
              />
            )}

            {activeTab === 'nutricao_animal' && (
              <AnimalNutritionModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'avicultura' && (
              <PoultryModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'plantabilidade' && (
              <PlantabilityModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
              />
            )}

            {activeTab === 'calculos_agronomicos' && (
              <AgronomicCalculationsModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'brix' && (
              <BrixModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'analise_agua' && (
              <WaterAnalysisModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'fertirrigacao' && (
              <FertigationModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'tankmix' && (
              <TankMixModule
                farmName={currentFarm?.name}
                activeFarm={currentFarm}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
              />
            )}

            {activeTab === 'fenologia' && (
              <PhenologyModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                selectedFarm={currentFarm}
                farms={farms}
              />
            )}

            {activeTab === 'pluviometria' && (
              <RainGaugeModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} selectedFarm={currentFarm} />
            )}

            {activeTab === 'meteorologia' && (
              <WeatherModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} activeFarm={currentFarm} />
            )}

            {activeTab === 'hidroponia' && (
              <HydroponicsModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'viveiros' && (
              <NurseryModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'solos' && (
              currentFarm ? (
                <SoilAnalysisModule
                  soilSamples={soilSamples}
                  setSoilSamples={setSoilSamples}
                  selectedFarm={currentFarm}
                  onSelectSampleForRecommendation={handleSelectSampleForRecommendation}
                  activeSubTab={activeSubTab}
                  setActiveSubTab={setActiveSubTab}
                />
              ) : (
                <EmptyFarmPrompt
                  icon={FlaskConical}
                  title="Análise de Solo"
                  description="Cadastre ou selecione uma propriedade rural para lançar e gerenciar laudos laboratoriais de fertilidade do solo, CTC e saturação por bases."
                  onNavigateToRegister={() => setActiveTab('cadastros')}
                />
              )
            )}

            {activeTab === 'recomendacoes' && (
              currentFarm ? (
                <RecommendationModule
                  soilSamples={soilSamples}
                  selectedFarm={currentFarm}
                  initialSelectedSampleId={selectedSampleForRec}
                  onGenerateReport={handleGenerateReport}
                  activeSubTab={activeSubTab}
                  setActiveSubTab={setActiveSubTab}
                  agronomist={currentAgronomist}
                  company={currentCompany}
                  onNavigateToSolos={(subTab) => {
                    setActiveTab('solos');
                    if (subTab && setActiveSubTab) setActiveSubTab(subTab);
                  }}
                />
              ) : (
                <EmptyFarmPrompt
                  icon={Calculator}
                  title="Recomendações Agronômicas"
                  description="Cadastre uma propriedade rural e importe laudos de análise de solo para calcular doses agronômicas de calagem (PRNT), gessagem e adubação N-P-K."
                  onNavigateToRegister={() => setActiveTab('cadastros')}
                />
              )
            )}

            {activeTab === 'foliar' && (
              currentFarm ? (
                <LeafAnalysisModule
                  activeSubTab={activeSubTab}
                  setActiveSubTab={setActiveSubTab}
                  leafSamples={leafSamples}
                  setLeafSamples={setLeafSamples}
                  farm={currentFarm}
                />
              ) : (
                <EmptyFarmPrompt
                  icon={Leaf}
                  title="Diagnose Foliar (DRIS & CND)"
                  description="Cadastre uma propriedade rural para lançar teores foliares de macro e micronutrientes e obter diagnósticos de desequilíbrio nutricional."
                  onNavigateToRegister={() => setActiveTab('cadastros')}
                />
              )
            )}

            {activeTab === 'historico' && (
              currentFarm ? (
                <HistoricalComparativeModule
                  farm={currentFarm}
                  soilSamples={soilSamples}
                  leafSamples={leafSamples}
                />
              ) : (
                <EmptyFarmPrompt
                  icon={BarChart2}
                  title="Histórico e Evolução Agronômica"
                  description="Cadastre uma propriedade rural para acompanhar gráficos temporais de fertilidade, teores de matéria orgânica e histórico das safras."
                  onNavigateToRegister={() => setActiveTab('cadastros')}
                />
              )
            )}

            {activeTab === 'relatorios' && (
              currentFarm && activeSoilSample ? (
                <TechnicalReportModule
                  farm={currentFarm}
                  producer={currentProducer}
                  agronomist={currentAgronomist}
                  company={currentCompany}
                  soilSample={activeSoilSample}
                  crop={selectedCropForReport}
                  targetYield={targetYieldForReport}
                  leafSample={activeLeafSample}
                  limingPrnt={limingPrntForReport}
                  incorporationDepth={depthForReport}
                />
              ) : (
                <EmptyFarmPrompt
                  icon={FlaskConical}
                  title="Laudos Técnicos e Relatórios"
                  description="Cadastre uma propriedade rural e realize análises de fertilidade para emitir laudos agronômicos completos com ART e assinatura técnica."
                  onNavigateToRegister={() => setActiveTab('cadastros')}
                />
              )
            )}

            {activeTab === 'backup' && (
              <BackupModule activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
            )}

            {activeTab === 'sobre' && (
              <AboutModule setActiveTab={setActiveTab} initialSubTab={activeSubTab} />
            )}

            {activeTab === 'gestao_rural' && (
              <GestaoRuralModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                onNavigateToRegister={() => {
                  setActiveTab('cadastros');
                  setActiveSubTab('fazendas');
                }}
                onNavigate={(tab, subTab) => {
                  setActiveTab(tab as any);
                  if (subTab) setActiveSubTab(subTab as any);
                }}
              />
            )}

            {activeTab === 'pericia_rural' && (
              <PericiaModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
              />
            )}

            {activeTab === 'forrageiras' && (
              <ForageCatalogModule
                initialSubTab={activeSubTab}
                onNavigateSubTab={setActiveSubTab}
              />
            )}

            {activeTab === 'geaagro_edu' && (
              <GeaAgroEduModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                onNavigateTab={(tab, subTab) => {
                  setActiveTab(tab as any);
                  if (subTab) setActiveSubTab(subTab as any);
                }}
              />
            )}

            {activeTab === 'configuracoes' && (
              <ConfiguracoesModule
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                updateAvailable={updateAvailable}
                isCheckingUpdate={isCheckingUpdate}
                isUpToDate={isUpToDate}
                onCheckForUpdates={checkForUpdates}
                onApplyUpdate={applyUpdate}
                currentVersion={currentVersion}
              />
            )}
          </Suspense>
        </ModuleErrorBoundary>
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md py-3.5 px-4 sm:px-8 text-xs text-slate-500 dark:text-zinc-400 mt-auto select-none shrink-0">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            {/* Branding & Version */}
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span className="font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                GeaAgro CRM <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-300 dark:border-emerald-800/80">v4.2.3.5</span>
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
              <span className="text-slate-600 dark:text-zinc-400 text-[11px] font-medium">Plataforma de Inteligência Agronômica</span>
            </div>

            {/* LGPD & Terms Separate Badges */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                id="btn-footer-privacy"
                data-testid="btn-footer-privacy"
                onClick={() => {
                  setActiveTab('sobre');
                  if (setActiveSubTab) setActiveSubTab('privacidade');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold text-[11px] border border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Política de Privacidade (LGPD)</span>
              </button>
              <button
                id="btn-footer-terms"
                data-testid="btn-footer-terms"
                onClick={() => {
                  setActiveTab('sobre');
                  if (setActiveSubTab) setActiveSubTab('termos');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold text-[11px] border border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer shadow-2xs"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Termos de Uso</span>
              </button>
            </div>


            {/* Developers Credit */}
            <div className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium flex items-center justify-center gap-1 flex-wrap">
              <span>🌱 Desenvolvido por</span>
              <a
                href="https://www.instagram.com/fatiima.leao/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-zinc-200 font-semibold hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                title="Instagram: @fatiima.leao"
              >
                Fátima Leão
              </a>
              <span>&amp;</span>
              <a
                href="https://www.instagram.com/lucas.agrobr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-zinc-200 font-semibold hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                title="Instagram: @lucas.agrobr"
              >
                Lucas Mendes
              </a>
              <span>❤️</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mandatory LGPD Compliance Consent Modal for First Access */}
      <LgpdConsentModal />

      {/* Special Easter Egg: 20 Agro Quotes on 7 clicks on GeaAgro Icon */}
      <AgroEasterEggModal />

      {/* Global Push Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => {
          setIsNotificationCenterOpen(false);
          const history = getNotificationHistory();
          setUnreadNotifications((history || []).filter(h => h && !h.read).length);
        }}
        onNavigate={handleNavigateFromNotification}
        activeFarmName={currentFarm?.name}
      />

      {/* User Controlled App Update Modal */}
      <AppUpdateModal
        isOpen={showUpdateModal}
        onClose={deferUpdate}
        onApplyUpdate={applyUpdate}
        currentVersion={currentVersion}
        isChecking={isCheckingUpdate}
      />
      </div>
    </SoilCoordinatesProvider>
  );
}

