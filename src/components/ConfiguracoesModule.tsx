import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  History,
  Terminal,
  Wifi,
  MessageSquarePlus,
  ExternalLink,
  Send,
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

const PROFILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Beef,
  Building2,
  Scale,
  Layers,
};

export type ConfiguracoesSubTab = 'perfil' | 'atualizacoes' | 'feedback';

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

export const ConfiguracoesModule: React.FC<ConfiguracoesModuleProps> = ({
  onNavigateTab,
  activeSubTab,
  setActiveSubTab,
  updateAvailable = false,
  isCheckingUpdate = false,
  isUpToDate = false,
  onCheckForUpdates,
  onApplyUpdate,
  currentVersion = '4.2.3.7',
}) => {
  // Determina a sub-aba ativa ('perfil', 'atualizacoes' ou 'feedback')
  const determineActiveTab = (subTab?: string): ConfiguracoesSubTab => {
    if (subTab === 'atualizacoes' || subTab === 'updates') {
      return 'atualizacoes';
    }
    if (subTab === 'feedback' || subTab === 'form' || subTab === 'pesquisa') {
      return 'feedback';
    }
    return 'perfil';
  };

  const [currentTab, setCurrentTab] = useState<ConfiguracoesSubTab>(() => determineActiveTab(activeSubTab));

  useEffect(() => {
    if (activeSubTab) {
      setCurrentTab(determineActiveTab(activeSubTab));
    }
  }, [activeSubTab]);

  const handleSelectTab = (tab: ConfiguracoesSubTab) => {
    setCurrentTab(tab);
    if (setActiveSubTab) {
      const subTabMap: Record<ConfiguracoesSubTab, string> = {
        perfil: 'perfil_uso',
        atualizacoes: 'atualizacoes',
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

  const triggerToast = (message: string) => {
    setSaveToast({ show: true, message });
    setTimeout(() => {
      setSaveToast({ show: false, message: '' });
    }, 2800);
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
    if (moduleId === 'dashboard' || moduleId === 'configuracoes') return; // Módulos essenciais permanentes

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
    const essential = ['dashboard', 'configuracoes', 'cadastros', 'sobre'];
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
              Gerencie seus perfis operacionais de uso, customize os módulos ativos da sua fazenda, verifique atualizações de versão ou envie seu feedback direto à equipe de desenvolvimento.
            </p>
          </div>

          {/* Card Resumo Lateral */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex items-center gap-3.5 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {currentTab === 'perfil' ? (
                <ActiveProfileIcon className="w-6 h-6 text-white" />
              ) : currentTab === 'atualizacoes' ? (
                <RefreshCw className="w-6 h-6 text-white" />
              ) : (
                <MessageSquarePlus className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                {currentTab === 'perfil'
                  ? 'Perfil Selecionado'
                  : currentTab === 'atualizacoes'
                  ? 'Versão Atual'
                  : 'Canal de Feedback'}
              </div>
              <div className="text-base font-black text-white">
                {currentTab === 'perfil'
                  ? currentProfile.name
                  : currentTab === 'atualizacoes'
                  ? `v${currentVersion}`
                  : 'Google Forms'}
              </div>
              <div className="text-xs text-emerald-100 font-semibold">
                {currentTab === 'perfil'
                  ? `${enabledModules.length} de ${SYSTEM_MODULES.length} módulos ativos`
                  : currentTab === 'atualizacoes'
                  ? 'Motor OPFS + WASM Ativo'
                  : 'Formulário Oficial de Opinião'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação Separada de Sub-Módulos (Abas: "Perfil de Uso", "Atualizações do Sistema" e "Feedback") */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2 rounded-2xl shadow-xs">
        {/* Aba 1: Perfil de Uso */}
        <button
          type="button"
          onClick={() => handleSelectTab('perfil')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
            currentTab === 'perfil'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'border-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                currentTab === 'perfil'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black flex items-center gap-2">
                <span>Perfil de Uso</span>
                {currentTab === 'perfil' && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/25 text-white uppercase">
                    Aberto
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] ${
                  currentTab === 'perfil' ? 'text-emerald-100' : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                Perfil ativo: <strong>{currentProfile.name}</strong> • Personalização de Módulos
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 hidden lg:inline-block ${
              currentTab === 'perfil'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}
          >
            {enabledModules.length} módulos
          </span>
        </button>

        {/* Aba 2: Atualizações do Sistema */}
        <button
          type="button"
          onClick={() => handleSelectTab('atualizacoes')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
            currentTab === 'atualizacoes'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'border-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 relative ${
                currentTab === 'atualizacoes'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
              {updateAvailable && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
              )}
            </div>
            <div>
              <div className="text-sm font-black flex items-center gap-2">
                <span>Atualizações do Sistema</span>
                {updateAvailable && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 uppercase">
                    Nova Versão
                  </span>
                )}
                {currentTab === 'atualizacoes' && !updateAvailable && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/25 text-white uppercase">
                    Aberto
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] ${
                  currentTab === 'atualizacoes' ? 'text-emerald-100' : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                Versão instalada: <strong>v{currentVersion}</strong> • PWA & Motor Offline
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 hidden lg:inline-block ${
              currentTab === 'atualizacoes'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}
          >
            v{currentVersion}
          </span>
        </button>

        {/* Aba 3: Feedback */}
        <button
          type="button"
          onClick={() => handleSelectTab('feedback')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
            currentTab === 'feedback'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'border-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                currentTab === 'feedback'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black flex items-center gap-2">
                <span>Feedback</span>
                {currentTab === 'feedback' && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/25 text-white uppercase">
                    Aberto
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] ${
                  currentTab === 'feedback' ? 'text-emerald-100' : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                Envie opiniões, relatos de campo e sugestões de melhoria
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 hidden lg:inline-block ${
              currentTab === 'feedback'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}
          >
            Google Forms
          </span>
        </button>
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
              {/* Busca por Nome/Descrição */}
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

              {/* Categorias */}
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
                    {/* Switch / Checkbox visual */}
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
      {/* SEÇÃO MODULAR 2: ATUALIZAÇÕES DO SISTEMA                                  */}
      {/* ========================================================================= */}
      {currentTab === 'atualizacoes' && (
        <div className="space-y-6 animate-fade-in">
          {/* Card 1: Painel de Controle de Versão & Verificação */}
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

              {/* Botões de Ação */}
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

            {/* Banners Informativos de Estado */}
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

          {/* Card 2: Histórico de Versões & Notas de Lançamento (Changelog Oficial) */}
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
              {/* Release v4.2.3.7 */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                      v4.2.3.7
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Versão Atual
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Outubro 2026
                  </span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-zinc-300 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Submódulo de Feedback Integrado:</strong> Adicionado o novo submódulo de Feedback com redirecionamento e formulário Google Forms integrado.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Módulos de Configurações Separados:</strong> Separação dedicada entre "Perfil de Uso", "Atualizações do Sistema" e "Feedback".</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Dashboard de Custos Dinâmico:</strong> Remoção de dados fictícios e cálculo 100% dinâmico do Custo Médio por Hectare conectado ao módulo de Custos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>WASM Stale-While-Revalidate:</strong> Cache otimizado no Service Worker garantindo carregamento instantâneo do motor OPFS.</span>
                  </li>
                </ul>
              </div>

              {/* Release v4.2.0 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-200">
                      v4.2.0
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                      Estável
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Setembro 2026
                  </span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>Novo motor de IA Agronômica NemaAI com histórico persistente e diagnósticos de nematóides.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>Perfis de Uso (Agricultor, Pecuarista, Administrador, Perícia e Todos) com seletor de módulos dinâmico.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO MODULAR 3: FEEDBACK DO USUÁRIO (Google Forms)                       */}
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

            {/* Card Informativo com Atalho Direto */}
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

            {/* Container com Iframe do Google Forms */}
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
