import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  SlidersHorizontal,
  Check,
  Search,
  RotateCcw,
  CheckSquare,
  Square,
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
  ExternalLink,
  Save,
  Laptop,
  CheckCircle2,
  Filter,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  UserProfileId,
  USER_PROFILES,
  USER_PROFILES_LIST,
  SYSTEM_MODULES,
  SystemModuleMetadata,
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
  updateAvailable = false,
  isCheckingUpdate = false,
  isUpToDate = false,
  onCheckForUpdates,
  onApplyUpdate,
  currentVersion = '4.2.3.5',
}) => {
  const [activeProfileId, setActiveProfile] = useState<UserProfileId>(() => getActiveProfileId());
  const [enabledModules, setEnabledModules] = useState<string[]>(() => {
    return getProfileEnabledModules(getActiveProfileId());
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'agricultura' | 'pecuaria' | 'gestao' | 'pericia' | 'geral'>('all');
  const [saveToast, setSaveToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Escuta atualizações de perfil disparadas de outras partes
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

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold text-emerald-300">
              <Settings className="w-3.5 h-3.5" />
              <span>Módulo Principal • Configurações do Sistema</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Configurações
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Personalize a experiência do GeaAgro escolhendo seu perfil de atuação (Agricultor, Pecuarista, Administrador, Perícia ou Todos) e incluindo ou alterando livremente os módulos desejados.
            </p>
          </div>

          {/* Card Resumo do Perfil Ativo */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex items-center gap-3.5 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ActiveProfileIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                Perfil Ativo
              </div>
              <div className="text-base font-black text-white">{currentProfile.name}</div>
              <div className="text-xs text-emerald-100 font-semibold">
                {enabledModules.length} de {SYSTEM_MODULES.length} módulos ativos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Atualização e Controle de Versão */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <RefreshCw className={`w-6 h-6 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Atualizações do Sistema
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  v{currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                Você tem controle total sobre as atualizações do GeaAgro. O sistema detecta novas versões e solicita seu consentimento antes de aplicar, garantindo estabilidade nas suas operações no campo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            {updateAvailable ? (
              <button
                type="button"
                onClick={onApplyUpdate}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Atualização Agora</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCheckForUpdates}
                disabled={isCheckingUpdate}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Verificando...' : 'Verificar Atualizações'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Feedback Banner */}
        {isUpToDate && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Sua aplicação já está executando a versão mais recente e estável (v{currentVersion}).</span>
          </div>
        )}

        {updateAvailable && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Uma nova versão foi baixada! Clique em <strong>Instalar Atualização Agora</strong> para aplicar com segurança.</span>
            </div>
          </div>
        )}
      </div>

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
  );
};
