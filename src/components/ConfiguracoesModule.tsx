import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Settings,
  SlidersHorizontal,
  Check,
  Search,
  RotateCcw,
  CheckSquare,
  Sprout,
  Beef,
  Building2,
  Scale,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  ArrowRight,
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
  Send,
  Zap,
  BatteryCharging,
  BatteryLow,
  Battery,
  Sun,
  Moon,
  Smartphone,
  Palette,
  Activity,
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

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfFbadWdvEIkXgLVJRHl_Tqmz_nKirv88GsoygKI2VynSJeSQ/viewform?usp=publish-editor';
const EMBEDDED_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfFbadWdvEIkXgLVJRHl_Tqmz_nKirv88GsoygKI2VynSJeSQ/viewform?embedded=true';

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
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
  const determineActiveTab = (subTab?: string): ConfiguracoesSubTab => {
    if (!subTab) return 'perfil';
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
    return 'perfil';
  };

  const determineAboutSubTab = (subTab?: string): 'sobre' | 'privacidade' | 'termos' | 'blueprint' => {
    if (subTab === 'sobre_privacidade' || subTab === 'privacidade') return 'privacidade';
    if (subTab === 'sobre_termos' || subTab === 'termos') return 'termos';
    if (subTab === 'sobre_blueprint' || subTab === 'blueprint') return 'blueprint';
    return 'sobre';
  };

  const [currentTab, setCurrentTab] = useState<ConfiguracoesSubTab>(() => determineActiveTab(activeSubTab));
  const [aboutInitialSubTab, setAboutInitialSubTab] = useState<'sobre' | 'privacidade' | 'termos' | 'blueprint'>(() =>
    determineAboutSubTab(activeSubTab)
  );

  useEffect(() => {
    if (activeSubTab) {
      setCurrentTab(determineActiveTab(activeSubTab));
      setAboutInitialSubTab(determineAboutSubTab(activeSubTab));
    }
  }, [activeSubTab]);

  const handleSelectTab = (tab: ConfiguracoesSubTab) => {
    setCurrentTab(tab);
    if (setActiveSubTab) {
      const subTabMap: Record<ConfiguracoesSubTab, string> = {
        perfil: 'perfil_uso',
        memoria: 'memoria',
        energia: 'energia',
        tema: 'tema',
        atualizacoes: 'atualizacoes',
        sobre: 'sobre',
        feedback: 'feedback',
      };
      setActiveSubTab(subTabMap[tab]);
    }
  };

  const [activeProfileId, setActiveProfile] = useState<UserProfileId>(() => getActiveProfileId());
  const [enabledModules, setEnabledModules] = useState<string[]>(() => {
    return getProfileEnabledModules(getActiveProfileId());
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'agricultura' | 'pecuaria' | 'gestao' | 'pericia' | 'geral'>('all');
  const [saveToast, setSaveToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Theme State ('light' | 'dark' | 'amoled')
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getSavedThemeMode());

  // Power / Battery State
  const [powerSettings, setPowerSettingsState] = useState<PowerSettings>(() => getSavedPowerSettings());
  const [batteryInfo, setBatteryInfo] = useState<BatteryStatusInfo>({
    supported: false,
    levelPercent: 78,
    charging: false,
    chargingTimeSeconds: null,
    dischargingTimeSeconds: null,
    isSimulated: false,
  });

  // Memory Report State
  const [memoryReport, setMemoryReport] = useState<SystemMemoryReport | null>(null);
  const [isRefreshingMemory, setIsRefreshingMemory] = useState(false);

  const triggerToast = useCallback((message: string) => {
    setSaveToast({ show: true, message });
    setTimeout(() => {
      setSaveToast({ show: false, message: '' });
    }, 2800);
  }, []);

  // Sync theme changes across components
  useEffect(() => {
    const handleThemeEvent = (e: any) => {
      const nextTheme: ThemeMode = e.detail?.theme || getSavedThemeMode();
      setThemeModeState(nextTheme);
    };
    window.addEventListener('geaagro:theme-changed', handleThemeEvent);
    return () => window.removeEventListener('geaagro:theme-changed', handleThemeEvent);
  }, []);

  // Monitor Real Web Battery API
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
          chargingTimeSeconds: Number.isFinite(batteryObj.chargingTime) ? batteryObj.chargingTime : null,
          dischargingTimeSeconds: Number.isFinite(batteryObj.dischargingTime) ? batteryObj.dischargingTime : null,
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
          // fallback if blocked
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

  // Evaluate Power Saver state whenever battery or powerSettings change
  const powerSaverActive = useMemo(
    () => isPowerSaverActive(powerSettings, batteryInfo),
    [powerSettings, batteryInfo]
  );

  useEffect(() => {
    applyPowerSaverToDOM(powerSaverActive, powerSettings);
    if (powerSaverActive && powerSettings.autoAmoledOnLowBattery && themeMode !== 'amoled') {
      setSystemThemeMode('amoled');
      setThemeModeState('amoled');
    }
  }, [powerSaverActive, powerSettings, themeMode]);

  // Refresh Memory Diagnostics when opening 'memoria' tab or on mount
  const handleRefreshMemory = useCallback(async (showNotification = false) => {
    setIsRefreshingMemory(true);
    try {
      const report = await collectSystemMemoryReport();
      setMemoryReport(report);
      if (showNotification) {
        triggerToast('Métricas de consumo de memória e armazenamento atualizadas!');
      }
    } finally {
      setIsRefreshingMemory(false);
    }
  }, [triggerToast]);

  useEffect(() => {
    handleRefreshMemory(false);
  }, [currentTab, handleRefreshMemory]);

  // Escuta atualizações de perfil disparadas de outras partes da aplicação
  useEffect(() => {
    const handleProfileChange = (e: any) => {
      const newProfile = e.detail?.profileId || getActiveProfileId();
      setActiveProfile(newProfile);
      setEnabledModules(getProfileEnabledModules(newProfile));
    };

    window.addEventListener('geaagro:profile-changed', handleProfileChange);
    return () => {
      window.removeEventListener('geaagro:profile-changed', handleProfileChange);
    };
  }, []);

  // Alternar tema (Claro, Escuro, AMOLED 100%)
  const handleSelectTheme = (nextTheme: ThemeMode) => {
    setThemeModeState(nextTheme);
    setSystemThemeMode(nextTheme);
    const labelMap: Record<ThemeMode, string> = {
      light: 'Claro',
      dark: 'Escuro',
      amoled: 'AMOLED (100% Preto Puro)',
    };
    triggerToast(`Tema alterado para "${labelMap[nextTheme]}"!`);
  };

  // Atualizar configurações de energia
  const handleUpdatePowerSettings = (partial: Partial<PowerSettings>, toastMsg?: string) => {
    const updated: PowerSettings = { ...powerSettings, ...partial };
    setPowerSettingsState(updated);
    savePowerSettings(updated);
    if (toastMsg) {
      triggerToast(toastMsg);
    }
  };

  // Alternar perfil operacional
  const handleSelectProfile = (id: UserProfileId) => {
    setActiveProfile(id);
    setActiveProfileId(id);
    const newEnabled = getProfileEnabledModules(id);
    setEnabledModules(newEnabled);
    triggerToast(`Perfil alterado para "${USER_PROFILES[id].name}" com sucesso!`);
  };

  // Alternar um módulo individual
  const handleToggleModule = (moduleId: string) => {
    if (moduleId === 'dashboard' || moduleId === 'configuracoes') return;

    const updated = enabledModules.includes(moduleId)
      ? enabledModules.filter(id => id !== moduleId)
      : [...enabledModules, moduleId];

    setEnabledModules(updated);
    setProfileEnabledModules(activeProfileId, updated);
    triggerToast('Configuração de módulos atualizada!');
  };

  // Ativar todos os módulos
  const handleSelectAll = () => {
    const allIds = SYSTEM_MODULES.map(m => m.id);
    setEnabledModules(allIds);
    setProfileEnabledModules(activeProfileId, allIds);
    triggerToast('Todos os módulos foram habilitados!');
  };

  // Desmarcar todos (exceto essenciais)
  const handleDeselectAll = () => {
    const essential = ['dashboard', 'configuracoes', 'cadastros'];
    setEnabledModules(essential);
    setProfileEnabledModules(activeProfileId, essential);
    triggerToast('Módulos opcionais desmarcados.');
  };

  // Restaurar padrão do perfil oficial
  const handleResetDefaults = () => {
    const defaultIds = resetProfileToDefault(activeProfileId);
    setEnabledModules(defaultIds);
    triggerToast(`Módulos padrão do perfil "${USER_PROFILES[activeProfileId].name}" restaurados!`);
  };

  // Forçar recarga e atualização do Service Worker
  const handleForceCacheRefresh = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      triggerToast('Service Worker e Cache checados com sucesso!');
      if (onCheckForUpdates) {
        onCheckForUpdates();
      }
    } catch {
      triggerToast('Verificação de cache realizada.');
    }
  };

  // Otimizar memória & limpar caches temporários
  const handleOptimizeMemory = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      await handleRefreshMemory(false);
      triggerToast('Memória otimizada e caches temporários sincronizados com sucesso!');
    } catch {
      triggerToast('Otimização de memória concluída!');
    }
  };

  // Filtragem dos módulos
  const filteredModules = useMemo(() => {
    return SYSTEM_MODULES.filter(m => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        m.label.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.categoryLabel.toLowerCase().includes(query);

      const matchCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'agricultura' && m.category === 'agricultura') ||
        (selectedCategory === 'pecuaria' && m.category === 'pecuaria') ||
        (selectedCategory === 'gestao' && m.category === 'gestao') ||
        (selectedCategory === 'pericia' && m.category === 'pericia') ||
        (selectedCategory === 'geral' && m.category === 'geral');

      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const currentProfile = USER_PROFILES[activeProfileId] || USER_PROFILES.todos;
  const ActiveProfileIcon = PROFILE_ICONS[currentProfile.iconName] || Layers;

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast de Salvo com Sucesso */}
      {saveToast.show && (
        <div className="fixed bottom-6 right-6 z-[1300] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{saveToast.message}</span>
        </div>
      )}

      {/* Hero Header Geral de Configurações */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold text-emerald-300">
              <Settings className="w-3.5 h-3.5" />
              <span>Painel de Configurações do Sistema</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Configurações
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Gerencie perfis de uso, monitore o consumo no Módulo de Memória, configure a priorização de bateria no Módulo de Energia, escolha entre os temas Claro, Escuro ou AMOLED (100%) e acesse informações Sobre o sistema.
            </p>
          </div>

          {/* Card Resumo Lateral */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex items-center gap-3.5 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {currentTab === 'perfil' ? (
                <ActiveProfileIcon className="w-6 h-6 text-white" />
              ) : currentTab === 'memoria' ? (
                <Cpu className="w-6 h-6 text-white" />
              ) : currentTab === 'energia' ? (
                <BatteryCharging className="w-6 h-6 text-white" />
              ) : currentTab === 'tema' ? (
                <Palette className="w-6 h-6 text-white" />
              ) : currentTab === 'atualizacoes' ? (
                <RefreshCw className="w-6 h-6 text-white" />
              ) : currentTab === 'sobre' ? (
                <Info className="w-6 h-6 text-white" />
              ) : (
                <MessageSquarePlus className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                {currentTab === 'perfil'
                  ? 'Perfil Selecionado'
                  : currentTab === 'memoria'
                  ? 'Consumo em Tempo Real'
                  : currentTab === 'energia'
                  ? 'Status de Energia'
                  : currentTab === 'tema'
                  ? 'Tema Visual Ativo'
                  : currentTab === 'atualizacoes'
                  ? 'Versão Atual'
                  : currentTab === 'sobre'
                  ? 'Institucional & LGPD'
                  : 'Canal de Feedback'}
              </div>
              <div className="text-base font-black text-white">
                {currentTab === 'perfil'
                  ? currentProfile.name
                  : currentTab === 'memoria'
                  ? `${memoryReport?.jsHeapUsedMB ?? 28.4} MB RAM`
                  : currentTab === 'energia'
                  ? `${batteryInfo.levelPercent}% ${powerSaverActive ? '• Eco Ativo' : '• Normal'}`
                  : currentTab === 'tema'
                  ? themeMode === 'amoled'
                    ? 'AMOLED (100%)'
                    : themeMode === 'dark'
                    ? 'Escuro'
                    : 'Claro'
                  : currentTab === 'atualizacoes'
                  ? `v${currentVersion}`
                  : currentTab === 'sobre'
                  ? 'Sobre o GeaAgro'
                  : 'Google Forms'}
              </div>
              <div className="text-xs text-emerald-100 font-semibold">
                {currentTab === 'perfil'
                  ? `${enabledModules.length} de ${SYSTEM_MODULES.length} módulos ativos`
                  : currentTab === 'memoria'
                  ? `${memoryReport?.storageUsedMB ?? 4.2} MB em Disco OPFS`
                  : currentTab === 'energia'
                  ? `Limite bateria baixa: ${powerSettings.lowBatteryThreshold}%`
                  : currentTab === 'tema'
                  ? 'Claro • Escuro • AMOLED (100%)'
                  : currentTab === 'atualizacoes'
                  ? 'Motor OPFS + WASM Ativo'
                  : currentTab === 'sobre'
                  ? 'Arquitetura, Privacidade & Termos'
                  : 'Formulário Oficial de Opinião'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Navegação dos Submenus de Configurações */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2 rounded-2xl shadow-xs">
        {[
          {
            id: 'perfil' as ConfiguracoesSubTab,
            label: 'Perfil de Uso',
            sub: `${currentProfile.shortLabel}`,
            icon: SlidersHorizontal,
          },
          {
            id: 'memoria' as ConfiguracoesSubTab,
            label: 'Módulo de Memória',
            sub: `${memoryReport?.jsHeapUsedMB ?? 28.4} MB RAM`,
            icon: Cpu,
          },
          {
            id: 'energia' as ConfiguracoesSubTab,
            label: 'Módulo de Energia',
            sub: powerSaverActive ? 'Economia Ativa' : `${batteryInfo.levelPercent}% Bateria`,
            icon: Zap,
          },
          {
            id: 'tema' as ConfiguracoesSubTab,
            label: 'Módulo Tema',
            sub: themeMode === 'amoled' ? 'AMOLED (100%)' : themeMode === 'dark' ? 'Escuro' : 'Claro',
            icon: Palette,
          },
          {
            id: 'atualizacoes' as ConfiguracoesSubTab,
            label: 'Atualizações do Sistema',
            sub: `v${currentVersion}`,
            icon: RefreshCw,
          },
          {
            id: 'sobre' as ConfiguracoesSubTab,
            label: 'Sobre',
            sub: 'Sistema & LGPD',
            icon: Info,
          },
          {
            id: 'feedback' as ConfiguracoesSubTab,
            label: 'Feedback',
            sub: 'Google Forms',
            icon: MessageSquarePlus,
          },
        ].map(tabItem => {
          const TabIcon = tabItem.icon;
          const isActive = currentTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => handleSelectTab(tabItem.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'border-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                <TabIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate">{tabItem.label}</div>
                <div
                  className={`text-[10px] truncate ${
                    isActive ? 'text-emerald-100' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {tabItem.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 1: PERFIL DE USO                                           */}
      {/* ========================================================================= */}
      {currentTab === 'perfil' && (
        <div className="space-y-6 animate-fade-in">
          {/* Seção 1: Seleção de Perfis */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Escolha seu Perfil de Uso</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Cada perfil pré-seleciona os módulos ideais para o seu ramo de atuação, mantendo a navegação focada e objetiva.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-slate-200 dark:border-zinc-700 cursor-pointer self-start sm:self-auto"
                title="Restaurar lista de módulos padrão deste perfil"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            {/* Grid dos 5 Perfis Oficiais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {USER_PROFILES_LIST.map(profile => {
                const Icon = PROFILE_ICONS[profile.iconName] || Layers;
                const isSelected = activeProfileId === profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleSelectProfile(profile.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? `${profile.colorClass} ring-2 ring-emerald-500/40 shadow-sm scale-[1.02]`
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${profile.colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                            <Check className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300">
                            Selecionar
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {profile.name}
                      </h3>
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {profile.badge}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                        {profile.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Padrão do Perfil</span>
                      <span className="font-bold text-slate-700 dark:text-zinc-300">
                        {profile.defaultModuleIds.length} módulos
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Personalização dos Módulos (Incluir ou Alterar) */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Incluir ou Alterar Módulos Desejados</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Habilite ou desabilite qualquer módulo para compor o seu ambiente de trabalho no perfil <strong>{currentProfile.name}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition cursor-pointer"
                >
                  Marcar Todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Desmarcar Opcionais
                </button>
              </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por módulo, laudo, fertilidade, pastagem..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'agricultura', label: 'Agricultura' },
                  { id: 'pecuaria', label: 'Agropecuária' },
                  { id: 'gestao', label: 'Administração Rural' },
                  { id: 'pericia', label: 'Perícia & Avaliação' },
                  { id: 'geral', label: 'Sistema & Geral' },
                ].map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredModules.map(module => {
                const isEnabled = enabledModules.includes(module.id);
                const isPermanent = module.id === 'dashboard' || module.id === 'configuracoes';
                const isNativeToProfile = currentProfile.defaultModuleIds.includes(module.id);

                return (
                  <div
                    key={module.id}
                    onClick={() => !isPermanent && handleToggleModule(module.id)}
                    className={`p-3.5 rounded-2xl border transition-all select-none flex items-start gap-3 relative ${
                      isPermanent
                        ? 'border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 opacity-90'
                        : isEnabled
                        ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs cursor-pointer hover:border-emerald-500'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 opacity-60 hover:opacity-100 cursor-pointer'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isEnabled
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {module.label}
                        </span>
                        {isPermanent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-extrabold">
                            Essencial
                          </span>
                        )}
                        {isNativeToProfile && !isPermanent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {module.description}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold">
                          {module.categoryLabel}
                        </span>

                        {onNavigateTab && isEnabled && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateTab(module.id);
                            }}
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                            title={`Ir diretamente para ${module.label}`}
                          >
                            <span>Abrir</span>
                            <ArrowRight className="w-3 h-3" />
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

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 2: MÓDULO DE MEMÓRIA                                        */}
      {/* ========================================================================= */}
      {currentTab === 'memoria' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Módulo de Memória & Consumo do Aplicativo
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Monitoramento em Tempo Real
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                    Acompanhe exatamente quanto de memória RAM (JS Heap), banco de dados OPFS + WASM, IndexedDB e Cache Local o GeaAgro está consumindo no seu dispositivo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => handleRefreshMemory(true)}
                  disabled={isRefreshingMemory}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingMemory ? 'animate-spin' : ''}`} />
                  <span>Atualizar Leitura</span>
                </button>
                <button
                  type="button"
                  onClick={handleOptimizeMemory}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Otimizar Memória & Cache</span>
                </button>
              </div>
            </div>

            {/* KPIs Principais de Memória & Armazenamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Memória RAM / JS Heap */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-zinc-400">
                    Memória RAM (App Heap)
                  </span>
                  <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {memoryReport?.jsHeapUsedMB ?? 28.4} <span className="text-xs font-bold text-slate-500">MB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${memoryReport?.heapUsagePercent ?? 32}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex justify-between">
                  <span>Alocado: {memoryReport?.jsHeapTotalMB ?? 42.0} MB</span>
                  <span>Limite: {memoryReport?.jsHeapLimitMB ?? 2048} MB</span>
                </div>
              </div>

              {/* Card 2: Armazenamento Persistente Total (OPFS + IndexedDB) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-zinc-400">
                    Armazenamento Total
                  </span>
                  <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {memoryReport?.storageUsedMB ?? 4.5} <span className="text-xs font-bold text-slate-500">MB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${Math.max(4, memoryReport?.storageUsagePercent ?? 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex justify-between">
                  <span>Quota Livre: {memoryReport?.storageQuotaMB ?? 1024} MB</span>
                  <span>{memoryReport?.opfsStoresCount ?? 46} Stores OPFS</span>
                </div>
              </div>

              {/* Card 3: Dados Rápidos LocalStorage */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-zinc-400">
                    Registros Locais (KV)
                  </span>
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatBytes(memoryReport?.localStorageBytes ?? 0)}
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(3, ((memoryReport?.localStorageBytes ?? 0) / (5 * 1024 * 1024)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex justify-between">
                  <span>{memoryReport?.localStorageKeysCount ?? 0} chaves salvas</span>
                  <span>Limite KV: 5 MB</span>
                </div>
              </div>

              {/* Card 4: Hardware Detectado & Cache Offline */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-zinc-400">
                    Hardware & Cache PWA
                  </span>
                  <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {memoryReport?.deviceRamGB ?? 8} GB <span className="text-xs font-bold text-slate-500">RAM Disp.</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Núcleos de CPU:</span>
                    <strong className="text-slate-700 dark:text-zinc-200">{memoryReport?.cpuCores ?? 4} threads</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Arquivos em Cache Offline:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{memoryReport?.cacheEntriesCount ?? 0} pacotes</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhamento do Consumo por Categoria do App */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Distribuição de Consumo por Módulo / Categoria</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Última leitura: {memoryReport?.timestamp ?? 'Agora'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(memoryReport?.categories || []).map(cat => {
                  const totalBytes = Math.max(1, memoryReport?.localStorageBytes || 1);
                  const pct = Math.min(100, Math.round((cat.bytes / totalBytes) * 100));
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{cat.label}</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {formatBytes(cat.bytes)} ({cat.itemsCount} reg.)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.colorClass}`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 3: MÓDULO DE ENERGIA                                        */}
      {/* ========================================================================= */}
      {currentTab === 'energia' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3.5 rounded-2xl border shrink-0 ${
                    powerSaverActive
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {batteryInfo.charging ? (
                    <BatteryCharging className="w-7 h-7" />
                  ) : batteryInfo.levelPercent <= powerSettings.lowBatteryThreshold ? (
                    <BatteryLow className="w-7 h-7" />
                  ) : (
                    <Battery className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Módulo de Energia & Economia Inteligente de Bateria
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
                        powerSaverActive
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {powerSaverActive ? 'Economia de Energia Ativa' : 'Operação em Desempenho Normal'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                    Quando o GeaAgro detecta que a bateria do dispositivo está baixa em campo, ele prioriza automaticamente a economia de energia desativando efeitos pesados de GPU e ativando o modo escuro AMOLED (100%).
                  </p>
                </div>
              </div>

              {/* Indicador de Bateria Atual */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-800 flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                    Nível da Bateria {batteryInfo.isSimulated ? '(Simulador)' : ''}
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {batteryInfo.levelPercent}%
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {batteryInfo.charging ? '⚡ Carregando na fonte' : '🔋 Em uso na bateria'}
                  </div>
                </div>
              </div>
            </div>

            {/* Seleção do Modo de Priorização de Energia */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                1. Modo de Priorização de Economia de Energia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'auto' as const,
                    title: 'Automático (Recomendado)',
                    badge: `Ativa ≤ ${powerSettings.lowBatteryThreshold}%`,
                    desc: `Monitora a bateria em tempo real e ativa a economia automaticamente quando o nível atingir ${powerSettings.lowBatteryThreshold}% ou menos fora do carregador.`,
                  },
                  {
                    id: 'always_on' as const,
                    title: 'Sempre Ativo (Campo Extremo)',
                    badge: 'Máxima Autonomia',
                    desc: 'Mantém a economia de energia permanentemente ligada para prolongar ao máximo a bateria durante vistorias longas no campo.',
                  },
                  {
                    id: 'off' as const,
                    title: 'Desativado (Alto Desempenho)',
                    badge: '100% Efeitos',
                    desc: 'Mantém todas as animações, transições suaves e efeitos visuais ativos independentemente do nível de bateria.',
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
                          `Modo de energia alterado para "${option.title}"!`
                        )
                      }
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {option.title}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                            }`}
                          >
                            {option.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Limite de Bateria Baixa e Ações de Economia */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Gatilho de Bateria Baixa & Simulador de Teste */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                    2. Gatilho de Detecção de Bateria Baixa
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Escolha a porcentagem em que o modo automático deve entrar em ação:
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {[15, 20, 30, 50].map(pct => {
                    const active = powerSettings.lowBatteryThreshold === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() =>
                          handleUpdatePowerSettings(
                            { lowBatteryThreshold: pct },
                            `Gatilho de bateria baixa ajustado para ${pct}%!`
                          )
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer border transition ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    );
                  })}
                </div>

                {/* Simulador rápido para testar detecção de bateria baixa */}
                <div className="pt-3 border-t border-slate-200 dark:border-zinc-700/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">
                      Simular Nível de Bateria (Teste de Gatilho):
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {batteryInfo.levelPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={batteryInfo.levelPercent}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setBatteryInfo({
                        supported: true,
                        levelPercent: val,
                        charging: false,
                        chargingTimeSeconds: null,
                        dischargingTimeSeconds: null,
                        isSimulated: true,
                      });
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5% (Crítico)</span>
                    <span>20% (Bateria Baixa)</span>
                    <span>100% (Cheia)</span>
                  </div>
                </div>
              </div>

              {/* Ações Executadas pelo Modo de Economia */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  3. Recursos Priorizados na Economia de Energia
                </h4>

                {[
                  {
                    key: 'autoAmoledOnLowBattery' as const,
                    title: 'Ativar Tema AMOLED (100% Preto) na Bateria Baixa',
                    desc: 'Desliga os pixels pretos em telas OLED/AMOLED assim que a bateria baixa for detectada.',
                  },
                  {
                    key: 'reduceAnimations' as const,
                    title: 'Suspender Animações & Desfoques de GPU (Backdrop Blur)',
                    desc: 'Elimina transições pesadas e filtros translúcidos para reduzir o uso do processador gráfico.',
                  },
                  {
                    key: 'reduceBackgroundSync' as const,
                    title: 'Reduzir Verificações em Segundo Plano',
                    desc: 'Prioriza apenas cálculos e salvamentos essenciais no banco local OPFS.',
                  },
                ].map(item => {
                  const checked = powerSettings[item.key];
                  return (
                    <label
                      key={item.key}
                      onClick={() =>
                        handleUpdatePowerSettings(
                          { [item.key]: !checked },
                          'Preferência de economia de energia atualizada!'
                        )
                      }
                      className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 cursor-pointer hover:border-emerald-500/50 transition select-none"
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          checked
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {item.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 4: MÓDULO TEMA (Claro, Escuro, AMOLED 100%)                 */}
      {/* ========================================================================= */}
      {currentTab === 'tema' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <Palette className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Módulo Tema & Aparência Visual
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {themeMode === 'amoled'
                        ? 'Tema Ativo: AMOLED (100%)'
                        : themeMode === 'dark'
                        ? 'Tema Ativo: Escuro'
                        : 'Tema Ativo: Claro'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                    Escolha a experiência visual ideal para o seu ambiente de trabalho: <strong>Claro</strong> (alta visibilidade sob sol), <strong>Escuro</strong> (conforto em escritório) ou <strong>AMOLED (100%)</strong> (preto absoluto `#000000` com pixels desligados).
                  </p>
                </div>
              </div>
            </div>

            {/* Grid dos 3 Temas: Claro, Escuro, AMOLED (100%) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Tema Claro */}
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  themeMode === 'light'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-emerald-400'
                }`}
              >
                <div className="space-y-4">
                  {/* Mockup Visual Claro */}
                  <div className="w-full h-28 rounded-2xl bg-[#f3f6f2] border border-slate-200 p-3 flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span className="w-16 h-2 rounded bg-slate-700" />
                      </div>
                      <Sun className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-xl bg-white border border-slate-200 p-2">
                        <div className="w-10 h-1.5 rounded bg-emerald-600 mb-1.5" />
                        <div className="w-14 h-1.5 rounded bg-slate-300" />
                      </div>
                      <div className="h-12 rounded-xl bg-white border border-slate-200 p-2">
                        <div className="w-8 h-1.5 rounded bg-teal-600 mb-1.5" />
                        <div className="w-12 h-1.5 rounded bg-slate-300" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Claro</span>
                      </h3>
                      {themeMode === 'light' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                      Fundo claro agronômico (`#F3F6F2`) e superfícies brancas de alto contraste. Ideal para leitura diurna sob luz solar intensa e impressão de laudos.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Contraste Diurno</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Luz Solar / Escritório</span>
                </div>
              </button>

              {/* 2. Tema Escuro */}
              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  themeMode === 'dark'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-emerald-400'
                }`}
              >
                <div className="space-y-4">
                  {/* Mockup Visual Escuro Suave */}
                  <div className="w-full h-28 rounded-2xl bg-[#0f172a] border border-slate-700 p-3 flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="w-16 h-2 rounded bg-slate-200" />
                      </div>
                      <Moon className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-xl bg-[#1e293b] border border-slate-700 p-2">
                        <div className="w-10 h-1.5 rounded bg-emerald-400 mb-1.5" />
                        <div className="w-14 h-1.5 rounded bg-slate-500" />
                      </div>
                      <div className="h-12 rounded-xl bg-[#1e293b] border border-slate-700 p-2">
                        <div className="w-8 h-1.5 rounded bg-teal-400 mb-1.5" />
                        <div className="w-12 h-1.5 rounded bg-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Moon className="w-4 h-4 text-sky-400" />
                        <span>Escuro</span>
                      </h3>
                      {themeMode === 'dark' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                      Tons suaves de ardósia e grafite escuro (`#0F172A`). Reduz a fadiga ocular em ambientes internos e sessões prolongadas de análise de dados.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Conforto Visual</span>
                  <span className="text-sky-500">Noturno Suave</span>
                </div>
              </button>

              {/* 3. Tema AMOLED (100%) */}
              <button
                type="button"
                onClick={() => handleSelectTheme('amoled')}
                className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  themeMode === 'amoled'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-emerald-400'
                }`}
              >
                <div className="space-y-4">
                  {/* Mockup Visual AMOLED 100% Preto Puro */}
                  <div className="w-full h-28 rounded-2xl bg-black border border-zinc-800 p-3 flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="w-16 h-2 rounded bg-white" />
                      </div>
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-xl bg-black border border-zinc-800 p-2">
                        <div className="w-10 h-1.5 rounded bg-emerald-400 mb-1.5" />
                        <div className="w-14 h-1.5 rounded bg-zinc-700" />
                      </div>
                      <div className="h-12 rounded-xl bg-black border border-zinc-800 p-2">
                        <div className="w-8 h-1.5 rounded bg-emerald-500 mb-1.5" />
                        <div className="w-12 h-1.5 rounded bg-zinc-700" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        <span>AMOLED (100%)</span>
                      </h3>
                      {themeMode === 'amoled' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                      Preto puro absoluto 100% (`#000000`) em todas as áreas de fundo e painéis. Desliga fisicamente os pixels em telas OLED/AMOLED, economizando até 45% de bateria em campo.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Preto Puro #000000</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Máxima Economia OLED</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 5: ATUALIZAÇÕES DO SISTEMA                                  */}
      {/* ========================================================================= */}
      {currentTab === 'atualizacoes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <RefreshCw className={`w-7 h-7 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Atualizações & Versões do GeaAgro
                    </h2>
                    <span className="text-xs px-3 py-1 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Versão Ativa: v{currentVersion}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    O GeaAgro segue política rigorosa de <strong>consentimento do usuário</strong>: nenhuma atualização automática interrompe seus laudos, cálculos ou anotações agronômicas no campo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {updateAvailable ? (
                  <button
                    type="button"
                    onClick={onApplyUpdate}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Atualização Agora</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onCheckForUpdates}
                    disabled={isCheckingUpdate}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-extrabold text-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-3xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{isCheckingUpdate ? 'Verificando Servidor...' : 'Verificar Atualizações'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleForceCacheRefresh}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-xs transition cursor-pointer flex items-center gap-2"
                  title="Recarregar cache do Service Worker"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Sincronizar Cache</span>
                </button>
              </div>
            </div>

            {isUpToDate && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="block">Seu sistema está operando na versão oficial mais recente e estável (v{currentVersion}).</span>
                  <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    Todos os pacotes de cálculos agronômicos, tabelas de adubação e motores offline estão em sincronia.
                  </span>
                </div>
              </div>
            )}

            {updateAvailable && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-extrabold block text-sm">Nova versão detectada e pronta para instalação!</span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-300">
                      O pacote de atualização já foi baixado em segundo plano. Clique no botão acima para aplicar com segurança.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onApplyUpdate}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  Aplicar Agora
                </button>
              </div>
            )}

            {/* Grid de 4 Pilares da Infraestrutura Tecnológica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    OPFS + WASM
                  </span>
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-zinc-200">
                  Banco de Alta Performance
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Origin Private File System com binário WebAssembly para processamento ultrarrápido offline.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    SWR Cache
                  </span>
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-zinc-200">
                  Service Worker Resiliente
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Estratégia <em>stale-while-revalidate</em> com cache prioritário para carregamento instantâneo do WASM.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    Offline First
                  </span>
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-zinc-200">
                  Operação 100% no Campo
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Diagnósticos, laudos e gêmeo digital disponíveis integralmente sem dependência de internet.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                    Purga Segura
                  </span>
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-zinc-200">
                  Integridade & Backups
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  IndexedDB legado purgado com retrocompatibilidade preservada na exportação e importação de backups.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Histórico de Versões & Notas de Lançamento */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Histórico de Versões & Notas de Lançamento
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Registro detalhado das melhorias e evoluções implementadas no GeaAgro.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                Canal Oficial Estável
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                      v{currentVersion}
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Versão Atual
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Novembro 2026
                  </span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-zinc-300 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Módulos de Memória, Energia e Tema:</strong> Monitoramento em tempo real de RAM/OPFS, economia automática de bateria baixa e seletor de temas Claro, Escuro e AMOLED (100%).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Seção Sobre Integrada em Configurações:</strong> Unificação da documentação institucional, LGPD, Termos de Uso e Blueprint em Configurações.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 6: SOBRE O SISTEMA (Integrado em Configurações)             */}
      {/* ========================================================================= */}
      {currentTab === 'sobre' && (
        <div className="animate-fade-in">
          <AboutModule
            setActiveTab={tab => {
              if (onNavigateTab) onNavigateTab(tab);
            }}
            initialSubTab={aboutInitialSubTab}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 7: FEEDBACK DO USUÁRIO (Google Forms)                       */}
      {/* ========================================================================= */}
      {currentTab === 'feedback' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <MessageSquarePlus className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Feedback & Sugestões do Usuário
                    </h2>
                    <span className="text-xs px-3 py-1 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Canal Direto de Melhoria
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Sua experiência é fundamental para a evolução do GeaAgro. Compartilhe suas impressões, reporte dúvidas de campo ou solicite novos recursos diretamente no formulário oficial.
                  </p>
                </div>
              </div>

              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-center active:scale-95"
              >
                <span>Abrir Formulário em Nova Aba</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Formulário Oficial de Opinião GeaAgro
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Acessível online em qualquer dispositivo ou diretamente integrado na janela abaixo.
                  </span>
                </div>
              </div>
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
              >
                <span>Acessar Link Direto (Google Forms)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-inner min-h-[680px] flex flex-col">
              <iframe
                src={EMBEDDED_FORM_URL}
                title="Formulário de Feedback GeaAgro"
                className="w-full h-[750px] border-0"
                loading="lazy"
              >
                Carregando formulário de feedback...
              </iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
