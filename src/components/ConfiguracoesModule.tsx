import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  SlidersHorizontal,
  Check,
  Search,
  RotateCcw,
  Sprout,
  Beef,
  Building2,
  Scale,
  Layers,
  Info,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Database,
  CheckCircle2,
  RefreshCw,
  Download,
  Cpu,
  HardDrive,
  History,
  Wifi,
  MessageSquarePlus,
  ExternalLink,
  Zap,
  BatteryCharging,
  BatteryLow,
  Battery,
  Sun,
  Moon,
  Smartphone,
  Palette,
  Gauge,
} from 'lucide-react';
import {
  UserProfileId,
  USER_PROFILES,
  USER_PROFILES_LIST,
  SYSTEM_MODULES,
  getActiveProfileId,
  setActiveProfileId,
  getProfileEnabledModules,
  setProfileEnabledModules,
  resetProfileToDefault,
} from '../utils/userProfilesStorage';
import {
  ThemeMode,
  PowerSettings,
  BatteryStatusInfo,
  SystemMemoryReport,
  getSavedThemeMode,
  setSystemThemeMode,
  getSavedPowerSettings,
  savePowerSettings,
  isPowerSaverActive,
  applyPowerSaverToDOM,
  collectSystemMemoryReport,
} from '../utils/systemPreferences';
import { AboutModule } from './AboutModule';

const PROFILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Beef,
  Building2,
  Scale,
  Layers,
};

export type ConfiguracoesSubTab = 'perfil' | 'memoria' | 'energia' | 'tema' | 'atualizacoes' | 'sobre' | 'feedback';

type AboutSubTab = 'sobre' | 'privacidade' | 'termos' | 'blueprint';

const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfFbadWdvEIkXgLVJRHl_Tqmz_nKirv88GsoygKI2VynSJeSQ/viewform?usp=publish-editor';
const EMBEDDED_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfFbadWdvEIkXgLVJRHl_Tqmz_nKirv88GsoygKI2VynSJeSQ/viewform?embedded=true';

interface ConfiguracoesModuleProps {
  onNavigateTab?: (tab: string, subTab?: string) => void;
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  updateAvailable?: boolean;
  isCheckingUpdate?: boolean;
  isUpToDate?: boolean;
  onCheckForUpdates?: () => void;
  onApplyUpdate?: () => void;
  currentVersion?: string;
}

const SUBTAB_TO_EXTERNAL: Record<ConfiguracoesSubTab, string> = {
  perfil: 'perfil_uso',
  memoria: 'memoria',
  energia: 'energia',
  tema: 'tema',
  atualizacoes: 'atualizacoes',
  sobre: 'sobre',
  feedback: 'feedback',
};

const MODULE_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'agricultura', label: 'Agricultura' },
  { id: 'pecuaria', label: 'Agropecuária' },
  { id: 'gestao', label: 'Administração Rural' },
  { id: 'pericia', label: 'Perícia & Avaliação' },
  { id: 'geral', label: 'Sistema & Geral' },
] as const;

function determineActiveTab(subTab?: string): ConfiguracoesSubTab | null {
  if (!subTab || subTab === 'hub' || subTab === 'inicio' || subTab === 'dashboard' || subTab === 'configuracoes') {
    return null;
  }
  if (
    subTab === 'perfil' ||
    subTab === 'perfil_uso' ||
    ['agricultor', 'pecuarista', 'administrador', 'pericia', 'todos'].includes(subTab)
  ) {
    return 'perfil';
  }
  if (subTab === 'memoria' || subTab === 'memory') return 'memoria';
  if (subTab === 'energia' || subTab === 'bateria' || subTab === 'power') return 'energia';
  if (subTab === 'tema' || subTab === 'theme' || subTab === 'aparencia') return 'tema';
  if (subTab === 'atualizacoes' || subTab === 'updates') return 'atualizacoes';
  if (
    subTab === 'sobre' ||
    subTab === 'sobre_privacidade' ||
    subTab === 'sobre_termos' ||
    subTab === 'sobre_blueprint' ||
    subTab === 'privacidade' ||
    subTab === 'termos' ||
    subTab === 'blueprint'
  ) {
    return 'sobre';
  }
  if (subTab === 'feedback' || subTab === 'form' || subTab === 'pesquisa') return 'feedback';
  return null;
}

function determineAboutSubTab(subTab?: string): AboutSubTab {
  if (subTab === 'sobre_privacidade' || subTab === 'privacidade') return 'privacidade';
  if (subTab === 'sobre_termos' || subTab === 'termos') return 'termos';
  if (subTab === 'sobre_blueprint' || subTab === 'blueprint') return 'blueprint';
  return 'sobre';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export const ConfiguracoesModule: React.FC<ConfiguracoesModuleProps> = ({
  onNavigateTab,
  activeSubTab,
  setActiveSubTab,
  updateAvailable = false,
  isCheckingUpdate = false,
  isUpToDate = false,
  onCheckForUpdates,
  onApplyUpdate,
  currentVersion = '4.2.3.8',
}) => {
  const [currentTab, setCurrentTab] = useState<ConfiguracoesSubTab | null>(() =>
    determineActiveTab(activeSubTab)
  );
  const [aboutInitialSubTab, setAboutInitialSubTab] = useState<AboutSubTab>(() =>
    determineAboutSubTab(activeSubTab)
  );

  useEffect(() => {
    setCurrentTab(determineActiveTab(activeSubTab));
    setAboutInitialSubTab(determineAboutSubTab(activeSubTab));
  }, [activeSubTab]);

  const handleSelectTab = useCallback(
    (tab: ConfiguracoesSubTab | null) => {
      setCurrentTab(tab);
      if (setActiveSubTab) {
        setActiveSubTab(tab ? SUBTAB_TO_EXTERNAL[tab] : 'hub');
      }
    },
    [setActiveSubTab]
  );

  // Perfil de uso
  const [activeProfileId, setActiveProfile] = useState<UserProfileId>(() => getActiveProfileId());
  const [enabledModules, setEnabledModules] = useState<string[]>(() =>
    getProfileEnabledModules(getActiveProfileId())
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'agricultura' | 'pecuaria' | 'gestao' | 'pericia' | 'geral'
  >('all');

  // Toast com cleanup seguro
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const triggerToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Tema ('light' | 'dark' | 'amoled')
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getSavedThemeMode());

  // Energia / Bateria
  const [powerSettings, setPowerSettingsState] = useState<PowerSettings>(() =>
    getSavedPowerSettings()
  );
  const [batteryInfo, setBatteryInfo] = useState<BatteryStatusInfo>({
    supported: false,
    levelPercent: 78,
    charging: false,
    chargingTimeSeconds: null,
    dischargingTimeSeconds: null,
    isSimulated: false,
  });

  // Memória
  const [memoryReport, setMemoryReport] = useState<SystemMemoryReport | null>(null);
  const [isRefreshingMemory, setIsRefreshingMemory] = useState(false);

  // Sync tema externo
  useEffect(() => {
    const handleThemeEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const nextTheme: ThemeMode = detail?.theme || getSavedThemeMode();
      setThemeModeState(nextTheme);
    };
    window.addEventListener('geaagro:theme-changed', handleThemeEvent);
    return () => window.removeEventListener('geaagro:theme-changed', handleThemeEvent);
  }, []);

  // Monitoramento real da Web Battery API
  useEffect(() => {
    let batteryObj: any = null;
    let isMounted = true;

    const updateFromBattery = () => {
      if (!batteryObj || !isMounted) return;
      setBatteryInfo(prev => {
        if (prev.isSimulated) return prev;
        return {
          supported: true,
          levelPercent: Math.round((batteryObj.level ?? 0.78) * 100),
          charging: Boolean(batteryObj.charging),
          chargingTimeSeconds: Number.isFinite(batteryObj.chargingTime)
            ? batteryObj.chargingTime
            : null,
          dischargingTimeSeconds: Number.isFinite(batteryObj.dischargingTime)
            ? batteryObj.dischargingTime
            : null,
          isSimulated: false,
        };
      });
    };

    if (typeof navigator !== 'undefined' && typeof (navigator as any).getBattery === 'function') {
      (navigator as any)
        .getBattery()
        .then((bat: any) => {
          if (!isMounted) return;
          batteryObj = bat;
          updateFromBattery();
          bat.addEventListener('levelchange', updateFromBattery);
          bat.addEventListener('chargingchange', updateFromBattery);
        })
        .catch(() => {
          // Navegador não expõe Battery API
        });
    }

    return () => {
      isMounted = false;
      if (batteryObj) {
        batteryObj.removeEventListener?.('levelchange', updateFromBattery);
        batteryObj.removeEventListener?.('chargingchange', updateFromBattery);
      }
    };
  }, []);

  const powerSaverActive = useMemo(
    () => isPowerSaverActive(powerSettings, batteryInfo),
    [powerSettings, batteryInfo]
  );

  // Aplica classe power-saver e ativa AMOLED apenas na transição de ativação (sem travar escolha manual de tema)
  const prevPowerSaverRef = useRef(false);
  useEffect(() => {
    applyPowerSaverToDOM(powerSaverActive, powerSettings);
    const justActivated = powerSaverActive && !prevPowerSaverRef.current;
    prevPowerSaverRef.current = powerSaverActive;

    if (justActivated && powerSettings.autoAmoledOnLowBattery && getSavedThemeMode() !== 'amoled') {
      setSystemThemeMode('amoled');
      setThemeModeState('amoled');
    }
  }, [powerSaverActive, powerSettings]);

  const handleRefreshMemory = useCallback(
    async (showNotification = false) => {
      setIsRefreshingMemory(true);
      try {
        const report = await collectSystemMemoryReport();
        setMemoryReport(report);
        if (showNotification) {
          triggerToast('Leitura de memória e armazenamento atualizada.');
        }
      } finally {
        setIsRefreshingMemory(false);
      }
    },
    [triggerToast]
  );

  // Coleta inicial para exibir resumo real no hub e ao abrir o módulo de memória
  useEffect(() => {
    if (currentTab === null || currentTab === 'memoria') {
      handleRefreshMemory(false);
    }
  }, [currentTab, handleRefreshMemory]);

  // Escuta trocas externas de perfil
  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const newProfile: UserProfileId = detail?.profileId || getActiveProfileId();
      setActiveProfile(newProfile);
      setEnabledModules(getProfileEnabledModules(newProfile));
    };
    window.addEventListener('geaagro:profile-changed', handleProfileChange);
    return () => window.removeEventListener('geaagro:profile-changed', handleProfileChange);
  }, []);

  const handleSelectTheme = (nextTheme: ThemeMode) => {
    setThemeModeState(nextTheme);
    setSystemThemeMode(nextTheme);
    const labelMap: Record<ThemeMode, string> = {
      light: 'Claro',
      dark: 'Escuro',
      amoled: 'AMOLED (100%)',
    };
    triggerToast(`Tema alterado para ${labelMap[nextTheme]}.`);
  };

  const handleUpdatePowerSettings = (partial: Partial<PowerSettings>, toastMsg?: string) => {
    const updated: PowerSettings = { ...powerSettings, ...partial };
    setPowerSettingsState(updated);
    savePowerSettings(updated);
    if (toastMsg) triggerToast(toastMsg);
  };

  const handleSelectProfile = (id: UserProfileId) => {
    setActiveProfile(id);
    setActiveProfileId(id);
    setEnabledModules(getProfileEnabledModules(id));
    triggerToast(`Perfil alterado para "${USER_PROFILES[id].name}".`);
  };

  const handleToggleModule = (moduleId: string) => {
    if (moduleId === 'dashboard' || moduleId === 'configuracoes') return;
    const updated = enabledModules.includes(moduleId)
      ? enabledModules.filter(id => id !== moduleId)
      : [...enabledModules, moduleId];
    setEnabledModules(updated);
    setProfileEnabledModules(activeProfileId, updated);
    triggerToast('Configuração de módulos atualizada.');
  };

  const handleSelectAll = () => {
    const allIds = SYSTEM_MODULES.map(m => m.id);
    setEnabledModules(allIds);
    setProfileEnabledModules(activeProfileId, allIds);
    triggerToast('Todos os módulos foram habilitados.');
  };

  const handleDeselectAll = () => {
    const essential = ['dashboard', 'configuracoes', 'cadastros'];
    setEnabledModules(essential);
    setProfileEnabledModules(activeProfileId, essential);
    triggerToast('Módulos opcionais desmarcados.');
  };

  const handleResetDefaults = () => {
    const defaultIds = resetProfileToDefault(activeProfileId);
    setEnabledModules(defaultIds);
    triggerToast(`Módulos padrão do perfil "${USER_PROFILES[activeProfileId].name}" restaurados.`);
  };

  const handleForceCacheRefresh = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      triggerToast('Cache do Service Worker sincronizado.');
      onCheckForUpdates?.();
    } catch {
      triggerToast('Verificação de cache concluída.');
    }
  };

  const handleOptimizeMemory = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      await handleRefreshMemory(false);
      triggerToast('Memória otimizada e caches temporários sincronizados.');
    } catch {
      triggerToast('Otimização de memória concluída.');
    }
  };

  const filteredModules = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return SYSTEM_MODULES.filter(m => {
      const matchSearch =
        !query ||
        m.label.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.categoryLabel.toLowerCase().includes(query);
      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const currentProfile = USER_PROFILES[activeProfileId] || USER_PROFILES.todos;
  const themeLabel =
    themeMode === 'amoled' ? 'AMOLED (100%)' : themeMode === 'dark' ? 'Escuro' : 'Claro';

  const settingsOptions: Array<{
    id: ConfiguracoesSubTab;
    label: string;
    description: string;
    status: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'perfil',
      label: 'Perfil de Uso',
      description: 'Escolha seu perfil operacional e personalize os módulos exibidos no menu.',
      status: `${currentProfile.name} · ${enabledModules.length}/${SYSTEM_MODULES.length} ativos`,
      icon: SlidersHorizontal,
    },
    {
      id: 'memoria',
      label: 'Módulo de Memória',
      description: 'Monitore o uso de RAM, banco OPFS + WASM, registros locais e cache offline.',
      status: memoryReport
        ? `${memoryReport.jsHeapUsedMB} MB RAM · ${memoryReport.storageUsedMB} MB disco`
        : 'Analisando consumo...',
      icon: Cpu,
    },
    {
      id: 'energia',
      label: 'Módulo de Energia',
      description: 'Configure a economia automática de bateria e priorização de recursos em campo.',
      status: `${batteryInfo.levelPercent}% · ${powerSaverActive ? 'Economia ativa' : 'Normal'}`,
      icon: Zap,
    },
    {
      id: 'tema',
      label: 'Módulo Tema',
      description: 'Alterne a aparência entre Claro, Escuro e AMOLED (100%) preto puro.',
      status: themeLabel,
      icon: Palette,
    },
    {
      id: 'atualizacoes',
      label: 'Atualizações do Sistema',
      description: 'Verifique versões, sincronize o cache PWA e consulte as notas de lançamento.',
      status: updateAvailable ? 'Atualização pronta' : `v${currentVersion} · Estável`,
      icon: RefreshCw,
    },
    {
      id: 'sobre',
      label: 'Sobre',
      description: 'Informações institucionais, instalação offline, LGPD, Termos de Uso e Blueprint.',
      status: 'Sistema, LGPD e Termos',
      icon: Info,
    },
    {
      id: 'feedback',
      label: 'Feedback',
      description: 'Envie sugestões, relate melhorias ou avalie sua experiência pelo formulário oficial.',
      status: 'Google Forms',
      icon: MessageSquarePlus,
    },
  ];

  const activeOption = settingsOptions.find(opt => opt.id === currentTab) || null;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 pb-10 space-y-5">
      {/* Toast compacto */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[1300] bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-2.5 rounded-lg border border-slate-800 dark:border-zinc-300 shadow-lg flex items-center gap-2 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabeçalho compacto e leve */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="min-w-0">
          {currentTab ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectTab(null)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Configurações</span>
              </button>
              <span className="text-slate-300 dark:text-zinc-700 text-sm" aria-hidden="true">
                /
              </span>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                {activeOption?.label}
              </h1>
            </div>
          ) : (
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Configurações
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Selecione uma opção abaixo para gerenciar o perfil, desempenho, aparência e preferências do sistema.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 tabular-nums shrink-0">
          <span>{currentProfile.shortLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{themeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>v{currentVersion}</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VISÃO INICIAL: OPÇÕES DISPONÍVEIS DE CONFIGURAÇÕES                        */}
      {/* ========================================================================= */}
      {currentTab === null && (
        <section aria-label="Opções de Configurações" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {settingsOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectTab(option.id)}
                  className="group text-left p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-colors cursor-pointer flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {option.label}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    <span className="truncate">{option.status}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap ml-2">
                      Abrir
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Barra compacta de troca rápida quando uma opção está aberta */}
      {currentTab !== null && (
        <nav
          aria-label="Alternar seção de configurações"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-zinc-800"
        >
          {settingsOptions.map(option => {
            const Icon = option.icon;
            const isActive = currentTab === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectTab(option.id)}
                className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ========================================================================= */}
      {/* 1. PERFIL DE USO                                                          */}
      {/* ========================================================================= */}
      {currentTab === 'perfil' && (
        <div className="space-y-6">
          {/* Seleção de Perfis */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  1. Escolha seu Perfil de Uso
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Pré-seleciona os módulos essenciais para o seu fluxo de trabalho no menu lateral.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
                title="Restaurar lista de módulos padrão deste perfil"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {USER_PROFILES_LIST.map(profile => {
                const Icon = PROFILE_ICONS[profile.iconName] || Layers;
                const isSelected = activeProfileId === profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleSelectProfile(profile.id)}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/25'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected ? (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                            Selecionar
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                          {profile.name}
                        </h3>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {profile.badge}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {profile.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      <span>Padrão</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {profile.defaultModuleIds.length} módulos
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Personalização dos Módulos */}
          <section className="pt-5 border-t border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  2. Incluir ou Alterar Módulos Desejados
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                  {enabledModules.length} de {SYSTEM_MODULES.length} módulos habilitados no perfil{' '}
                  <strong className="font-medium text-slate-700 dark:text-zinc-200">
                    {currentProfile.name}
                  </strong>
                  .
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="h-8 px-3 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Marcar Todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Desmarcar Opcionais
                </button>
              </div>
            </div>

            {/* Busca e Filtro por Categoria */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar módulo por nome, função ou categoria..."
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-x-auto no-scrollbar">
                {MODULE_CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Módulos */}
            {filteredModules.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhum módulo encontrado para os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredModules.map(module => {
                  const isEnabled = enabledModules.includes(module.id);
                  const isPermanent = module.id === 'dashboard' || module.id === 'configuracoes';
                  const isNativeToProfile = currentProfile.defaultModuleIds.includes(module.id);

                  return (
                    <div
                      key={module.id}
                      onClick={() => !isPermanent && handleToggleModule(module.id)}
                      className={`p-3 rounded-xl border transition-colors select-none flex items-start gap-2.5 ${
                        isPermanent
                          ? 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40'
                          : isEnabled
                          ? 'border-emerald-500/50 bg-white dark:bg-zinc-900 cursor-pointer hover:border-emerald-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 opacity-65 hover:opacity-100 cursor-pointer'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                          isEnabled
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {module.label}
                          </span>
                          {onNavigateTab && isEnabled && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                onNavigateTab(module.id);
                              }}
                              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                              title={`Abrir ${module.label}`}
                            >
                              <span>Abrir</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {module.description}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                          <span>{module.categoryLabel}</span>
                          {isPermanent && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-600 dark:text-zinc-300 font-medium">
                                Essencial
                              </span>
                            </>
                          )}
                          {isNativeToProfile && !isPermanent && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                Padrão
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MÓDULO DE MEMÓRIA                                                      */}
      {/* ========================================================================= */}
      {currentTab === 'memoria' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Consumo de Memória e Armazenamento Local
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Diagnóstico de RAM (JS Heap), banco OPFS + WASM, registros locais e cache offline do dispositivo.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRefreshMemory(true)}
                disabled={isRefreshingMemory}
                className="h-8 px-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMemory ? 'animate-spin' : ''}`} />
                <span>Atualizar Leitura</span>
              </button>
              <button
                type="button"
                onClick={handleOptimizeMemory}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Otimizar Cache</span>
              </button>
            </div>
          </div>

          {/* Faixa de KPIs de Memória (Single-Elevation Hairline Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Memória RAM (Heap)</span>
                <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                {memoryReport?.jsHeapUsedMB ?? 0}{' '}
                <span className="text-xs font-normal text-slate-500">MB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${memoryReport?.heapUsagePercent ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                <span>Alocado: {memoryReport?.jsHeapTotalMB ?? 0} MB</span>
                <span>Limite: {memoryReport?.jsHeapLimitMB ?? 0} MB</span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Armazenamento OPFS</span>
                <HardDrive className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                {memoryReport?.storageUsedMB ?? 0}{' '}
                <span className="text-xs font-normal text-slate-500">MB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all"
                  style={{ width: `${Math.max(2, memoryReport?.storageUsagePercent ?? 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                <span>Quota: {memoryReport?.storageQuotaMB ?? 0} MB</span>
                <span>{memoryReport?.opfsStoresCount ?? 0} stores</span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Registros Locais (KV)</span>
                <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                {formatBytes(memoryReport?.localStorageBytes ?? 0)}
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(2, ((memoryReport?.localStorageBytes ?? 0) / (5 * 1024 * 1024)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                <span>{memoryReport?.localStorageKeysCount ?? 0} chaves</span>
                <span>Limite: 5 MB</span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Hardware e Cache PWA</span>
                <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                {memoryReport?.deviceRamGB ?? 0}{' '}
                <span className="text-xs font-normal text-slate-500">GB RAM</span>
              </div>
              <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200">
                    {memoryReport?.cpuCores ?? 0} threads
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cache offline:</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {memoryReport?.cacheEntriesCount ?? 0} pacotes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Distribuição por Categoria */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                Distribuição de Armazenamento por Categoria
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                Atualizado: {memoryReport?.timestamp ?? '--:--:--'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(memoryReport?.categories || []).map(cat => {
                const totalBytes = Math.max(1, memoryReport?.localStorageBytes || 1);
                const pct = Math.min(100, Math.round((cat.bytes / totalBytes) * 100));
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-700 dark:text-zinc-200 font-medium truncate">
                        {cat.label}
                      </span>
                      <span className="text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap shrink-0">
                        {formatBytes(cat.bytes)} · {cat.itemsCount} reg.
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.colorClass}`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MÓDULO DE ENERGIA                                                      */}
      {/* ========================================================================= */}
      {currentTab === 'energia' && (
        <div className="space-y-5">
          {/* Status de Bateria */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                  powerSaverActive
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {batteryInfo.charging ? (
                  <BatteryCharging className="w-4 h-4" />
                ) : batteryInfo.levelPercent <= powerSettings.lowBatteryThreshold ? (
                  <BatteryLow className="w-4 h-4" />
                ) : (
                  <Battery className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Economia Inteligente de Bateria
                  </h2>
                  <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                    ·
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      powerSaverActive
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {powerSaverActive ? 'Economia ativa' : 'Desempenho normal'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
                  Reduz efeitos visuais de GPU e ativa o modo AMOLED (100%) quando a bateria estiver baixa em campo.
                </p>
              </div>
            </div>

            <div className="sm:text-right tabular-nums shrink-0 pl-12 sm:pl-0">
              <div className="text-xl font-semibold text-slate-900 dark:text-white">
                {batteryInfo.levelPercent}%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                {batteryInfo.charging ? 'Carregando na fonte' : 'Em uso na bateria'}
                {batteryInfo.isSimulated ? ' · Simulado' : ''}
              </div>
            </div>
          </div>

          {/* Modo de Priorização */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              1. Modo de Priorização de Energia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'auto' as const,
                  title: 'Automático (Recomendado)',
                  meta: `Ativa ≤ ${powerSettings.lowBatteryThreshold}%`,
                  desc: `Ativa a economia automaticamente quando a bateria atingir ${powerSettings.lowBatteryThreshold}% ou menos fora do carregador.`,
                },
                {
                  id: 'always_on' as const,
                  title: 'Sempre Ativo (Campo Extremo)',
                  meta: 'Máxima autonomia',
                  desc: 'Mantém a economia ligada permanentemente para prolongar o uso em vistorias longas.',
                },
                {
                  id: 'off' as const,
                  title: 'Desativado (Alto Desempenho)',
                  meta: 'Efeitos completos',
                  desc: 'Mantém todas as transições e efeitos visuais ativos independentemente da bateria.',
                },
              ].map(option => {
                const isSelected = powerSettings.mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleUpdatePowerSettings(
                        { mode: option.id },
                        `Modo de energia alterado para "${option.title}".`
                      )
                    }
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/25'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {option.title}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {option.meta}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {option.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Gatilho & Ações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  2. Gatilho de Bateria Baixa
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Porcentagem de bateria para acionamento automático da economia:
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[15, 20, 30, 50].map(pct => {
                  const active = powerSettings.lowBatteryThreshold === pct;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() =>
                        handleUpdatePowerSettings(
                          { lowBatteryThreshold: pct },
                          `Gatilho ajustado para ${pct}%.`
                        )
                      }
                      className={`h-8 px-3 rounded-lg text-xs font-medium tabular-nums cursor-pointer border transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-zinc-300 font-medium">
                    Simular nível de bateria
                  </span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {batteryInfo.levelPercent}%
                    </span>
                    {batteryInfo.isSimulated && (
                      <button
                        type="button"
                        onClick={() =>
                          setBatteryInfo(prev => ({
                            ...prev,
                            levelPercent: 78,
                            isSimulated: false,
                          }))
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 underline cursor-pointer"
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={batteryInfo.levelPercent}
                  onChange={e =>
                    setBatteryInfo({
                      supported: true,
                      levelPercent: Number(e.target.value),
                      charging: false,
                      chargingTimeSeconds: null,
                      dischargingTimeSeconds: null,
                      isSimulated: true,
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                  <span>5% Crítico</span>
                  <span>20% Baixa</span>
                  <span>100% Cheia</span>
                </div>
              </div>
            </section>

            <section className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                3. Recursos Priorizados na Economia
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {[
                  {
                    key: 'autoAmoledOnLowBattery' as const,
                    title: 'Ativar Tema AMOLED (100%) na Bateria Baixa',
                    desc: 'Desliga os pixels pretos em telas OLED/AMOLED ao atingir o limite.',
                  },
                  {
                    key: 'reduceAnimations' as const,
                    title: 'Suspender Animações e Desfoques de GPU',
                    desc: 'Desativa transições e filtros translúcidos para reduzir uso gráfico.',
                  },
                  {
                    key: 'reduceBackgroundSync' as const,
                    title: 'Reduzir Verificações em Segundo Plano',
                    desc: 'Prioriza cálculos e gravações essenciais no banco local OPFS.',
                  },
                ].map(item => {
                  const checked = powerSettings[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        handleUpdatePowerSettings(
                          { [item.key]: !checked },
                          'Preferência de energia atualizada.'
                        )
                      }
                      className="w-full py-2.5 first:pt-1 last:pb-0 flex items-start gap-2.5 text-left cursor-pointer"
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                          checked
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MÓDULO TEMA (Claro, Escuro, AMOLED 100%)                               */}
      {/* ========================================================================= */}
      {currentTab === 'tema' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Aparência Visual do Aplicativo
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Escolha o tema ideal para leitura sob sol, escritório ou economia máxima em telas OLED.
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Tema ativo:{' '}
              <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                {themeLabel}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'light' as ThemeMode,
                title: 'Claro',
                subtitle: 'Luz solar e escritório',
                desc: 'Fundo claro neutro com alto contraste diurno para leitura em campo e impressão de laudos.',
                icon: Sun,
                iconColor: 'text-amber-500',
                previewBg: 'bg-[#f3f6f2] border-slate-200',
                previewCard: 'bg-white border-slate-200',
                previewBar1: 'bg-emerald-600',
                previewBar2: 'bg-slate-300',
                previewHeader: 'bg-slate-700',
              },
              {
                id: 'dark' as ThemeMode,
                title: 'Escuro',
                subtitle: 'Conforto visual noturno',
                desc: 'Tons suaves de grafite escuro que reduzem fadiga ocular em sessões prolongadas de análise.',
                icon: Moon,
                iconColor: 'text-sky-500',
                previewBg: 'bg-[#0f172a] border-slate-700',
                previewCard: 'bg-[#1e293b] border-slate-700',
                previewBar1: 'bg-emerald-400',
                previewBar2: 'bg-slate-500',
                previewHeader: 'bg-slate-200',
              },
              {
                id: 'amoled' as ThemeMode,
                title: 'AMOLED (100%)',
                subtitle: 'Preto puro #000000',
                desc: 'Preto absoluto em painéis e fundos. Desliga pixels em telas OLED, economizando bateria em campo.',
                icon: Smartphone,
                iconColor: 'text-emerald-500',
                previewBg: 'bg-black border-zinc-800',
                previewCard: 'bg-black border-zinc-800',
                previewBar1: 'bg-emerald-400',
                previewBar2: 'bg-zinc-700',
                previewHeader: 'bg-white',
              },
            ].map(theme => {
              const ThemeIcon = theme.icon;
              const isSelected = themeMode === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/35 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Miniatura limpa */}
                    <div
                      className={`w-full h-20 rounded-lg border p-2.5 flex flex-col justify-between ${theme.previewBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-1.5 rounded ${theme.previewHeader}`} />
                        <ThemeIcon className={`w-3.5 h-3.5 ${theme.iconColor}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className={`h-8 rounded border p-1.5 ${theme.previewCard}`}>
                          <div className={`w-8 h-1 rounded mb-1 ${theme.previewBar1}`} />
                          <div className={`w-11 h-1 rounded ${theme.previewBar2}`} />
                        </div>
                        <div className={`h-8 rounded border p-1.5 ${theme.previewCard}`}>
                          <div className={`w-6 h-1 rounded mb-1 ${theme.previewBar1}`} />
                          <div className={`w-9 h-1 rounded ${theme.previewBar2}`} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {theme.title}
                        </h3>
                        {isSelected && (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Selecionado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {theme.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                    {theme.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ATUALIZAÇÕES DO SISTEMA                                                */}
      {/* ========================================================================= */}
      {currentTab === 'atualizacoes' && (
        <div className="space-y-5">
          {/* Cabeçalho da Versão e Ações */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Atualizações & Versões do GeaAgro
                </h2>
                <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                  v{currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                Política de consentimento do usuário: nenhuma atualização interrompe seus laudos ou cálculos sem sua confirmação.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {updateAvailable ? (
                <button
                  type="button"
                  onClick={onApplyUpdate}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar Atualização</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCheckForUpdates}
                  disabled={isCheckingUpdate}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  <span>{isCheckingUpdate ? 'Verificando...' : 'Verificar Atualizações'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleForceCacheRefresh}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                title="Recarregar cache do Service Worker"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sincronizar Cache</span>
              </button>
            </div>
          </div>

          {isUpToDate && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Sistema operando na versão estável mais recente (v{currentVersion}). Todos os motores offline estão sincronizados.
              </span>
            </div>
          )}

          {updateAvailable && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>
                Nova versão baixada em segundo plano e pronta para instalação segura.
              </span>
              <button
                type="button"
                onClick={onApplyUpdate}
                className="h-8 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                Aplicar Agora
              </button>
            </div>
          )}

          {/* Infraestrutura Tecnológica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
            {[
              {
                icon: Database,
                tag: 'OPFS + WASM',
                title: 'Banco de Alta Performance',
                desc: 'Origin Private File System com binário WebAssembly para processamento offline.',
              },
              {
                icon: RefreshCw,
                tag: 'SWR Cache',
                title: 'Service Worker Resiliente',
                desc: 'Estratégia stale-while-revalidate com carregamento prioritário do WASM.',
              },
              {
                icon: Wifi,
                tag: 'Offline First',
                title: 'Operação 100% no Campo',
                desc: 'Diagnósticos, laudos e gêmeos digitais disponíveis sem conexão.',
              },
              {
                icon: ShieldCheck,
                tag: 'Purga Segura',
                title: 'Integridade e Backups',
                desc: 'Retrocompatibilidade preservada na exportação e restauração de backups.',
              },
            ].map(pillar => {
              const PillarIcon = pillar.icon;
              return (
                <div key={pillar.tag} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <span>{pillar.tag}</span>
                    <PillarIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {pillar.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Histórico de Versões */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Histórico de Versões & Notas de Lançamento
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Canal oficial estável
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-xs tabular-nums">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  v{currentVersion} · Versão Atual
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Novembro 2026</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300 leading-relaxed list-disc list-inside">
                <li>
                  <strong className="font-medium text-slate-800 dark:text-zinc-100">
                    Módulos de Memória, Energia e Tema:
                  </strong>{' '}
                  Monitoramento de RAM/OPFS, economia automática em bateria baixa e seletor Claro, Escuro e AMOLED (100%).
                </li>
                <li>
                  <strong className="font-medium text-slate-800 dark:text-zinc-100">
                    Central de Configurações Modular:
                  </strong>{' '}
                  Abertura direta em grade de opções com acesso rápido a Perfil de Uso, Atualizações, Sobre e Feedback.
                </li>
              </ul>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SOBRE O SISTEMA                                                        */}
      {/* ========================================================================= */}
      {currentTab === 'sobre' && (
        <AboutModule
          setActiveTab={tab => {
            if (onNavigateTab) onNavigateTab(tab);
          }}
          initialSubTab={aboutInitialSubTab}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. FEEDBACK DO USUÁRIO                                                    */}
      {/* ========================================================================= */}
      {currentTab === 'feedback' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Feedback & Sugestões do Usuário
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
                Compartilhe sua experiência de campo, reporte dúvidas ou sugira novos recursos pelo formulário oficial do GeaAgro.
              </p>
            </div>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              <span>Abrir em Nova Aba</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[640px]">
            <iframe
              src={EMBEDDED_FORM_URL}
              title="Formulário de Feedback GeaAgro"
              className="w-full h-[720px] border-0"
              loading="lazy"
            >
              Carregando formulário de feedback...
            </iframe>
          </div>
        </div>
      )}
    </div>
  );
};
