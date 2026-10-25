import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
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
} from 'lucide-react';
import {
  UserProfileId,
  USER_PROFILES,
  SYSTEM_MODULES,
  SystemModuleMetadata,
  getActiveProfileId,
  setActiveProfileId,
  getProfileEnabledModules,
  setProfileEnabledModules,
  resetProfileToDefault,
} from '../../utils/userProfilesStorage';

interface UserProfileCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profileId: UserProfileId, enabledModules: string[]) => void;
}

const PROFILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Beef,
  Building2,
  Scale,
  Layers,
};

export const UserProfileCustomizationModal: React.FC<UserProfileCustomizationModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<UserProfileId>(() => getActiveProfileId());
  const [enabledModules, setEnabledModules] = useState<string[]>(() => {
    return getProfileEnabledModules(getActiveProfileId());
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'agricultura' | 'pecuaria' | 'gestao' | 'pericia'>('all');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sincroniza quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const current = getActiveProfileId();
      setSelectedProfileId(current);
      setEnabledModules(getProfileEnabledModules(current));
      setSearchQuery('');
      setSavedFeedback(false);
    }
  }, [isOpen]);

  // Quando o usuário troca de perfil dentro do modal
  const handleSwitchProfileInModal = (newProfile: UserProfileId) => {
    setSelectedProfileId(newProfile);
    setEnabledModules(getProfileEnabledModules(newProfile));
  };

  // Alterna ativação de um módulo
  const handleToggleModule = (moduleId: string) => {
    if (moduleId === 'dashboard') return; // Dashboard é permanente
    setEnabledModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Marcar todos os módulos visíveis ou da categoria
  const handleSelectAll = () => {
    const allIds = SYSTEM_MODULES.map(m => m.id);
    setEnabledModules(allIds);
  };

  // Desmarcar todos (exceto essenciais)
  const handleDeselectAll = () => {
    setEnabledModules(['dashboard', 'cadastros', 'sobre']);
  };

  // Restaurar padrão do perfil oficial
  const handleResetToProfileDefaults = () => {
    const defaultIds = resetProfileToDefault(selectedProfileId);
    setEnabledModules(defaultIds);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  // Salvar alterações
  const handleSaveAndApply = () => {
    setActiveProfileId(selectedProfileId);
    setProfileEnabledModules(selectedProfileId, enabledModules);
    if (onProfileUpdated) {
      onProfileUpdated(selectedProfileId, enabledModules);
    }
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 400);
  };

  // Filtragem dos módulos
  const filteredModules = useMemo(() => {
    return SYSTEM_MODULES.filter(m => {
      const matchSearch =
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        activeCategory === 'all' ||
        (activeCategory === 'agricultura' && m.category === 'agricultura') ||
        (activeCategory === 'pecuaria' && m.category === 'pecuaria') ||
        (activeCategory === 'gestao' && m.category === 'gestao') ||
        (activeCategory === 'pericia' && (m.category === 'pericia' || m.category === 'geral'));

      return matchSearch && matchCategory;
    });
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  const currentProfileInfo = USER_PROFILES[selectedProfileId] || USER_PROFILES.todos;
  const ProfileIcon = PROFILE_ICONS[currentProfileInfo.iconName] || Layers;

  return (
    <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <SlidersHorizontal className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Configurações: Módulos &amp; Perfis
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Escolha o perfil operacional (Agricultor, Pecuarista, Administrador, Perícia ou Todos) e inclua ou altere os módulos desejados.
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Perfis de Uso (Segmented Tabs) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center justify-between">
            <span>Perfil Selecionado:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold lowercase">
              {enabledModules.length} de {SYSTEM_MODULES.length} módulos ativos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(USER_PROFILES) as UserProfileId[]).map(id => {
              const p = USER_PROFILES[id];
              const Icon = PROFILE_ICONS[p.iconName] || Layers;
              const isSelected = selectedProfileId === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSwitchProfileInModal(id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? `${p.colorClass} shadow-xs ring-2 ring-emerald-500/30 font-bold scale-[1.02]`
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 shrink-0" />
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-[10px] opacity-75 truncate">{p.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Banner explicativo do perfil ativo */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{currentProfileInfo.description}</span>
            </div>
            <button
              type="button"
              onClick={handleResetToProfileDefaults}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
              title="Restaurar lista de módulos recomendada para este perfil"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Padrão do Perfil</span>
            </button>
          </div>
        </div>

        {/* Filtros e Busca de Módulos */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar módulo ou funcionalidade..."
              className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Categorias Rápidas */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'agricultura', label: 'Agricultura' },
              { id: 'pecuaria', label: 'Pecuária' },
              { id: 'gestao', label: 'Gestão Rural' },
              { id: 'pericia', label: 'Perícia' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Ações em Lote */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-emerald-600 cursor-pointer flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Marcar Todos</span>
            </button>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-rose-600 cursor-pointer flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Desmarcar</span>
            </button>
          </div>
        </div>

        {/* Lista de Módulos com Checkboxes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredModules.map(module => {
            const isChecked = enabledModules.includes(module.id);
            const isDashboard = module.id === 'dashboard';

            return (
              <div
                key={module.id}
                onClick={() => !isDashboard && handleToggleModule(module.id)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3 select-none ${
                  isDashboard
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 opacity-80 cursor-default'
                    : isChecked
                    ? 'border-emerald-400/80 dark:border-emerald-600/80 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-500 cursor-pointer shadow-2xs'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700 opacity-60 hover:opacity-100 cursor-pointer'
                }`}
              >
                {/* Custom Checkbox */}
                <div className="pt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {module.label}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        module.category === 'agricultura'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : module.category === 'pecuaria'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : module.category === 'gestao'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          : module.category === 'pericia'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {module.categoryLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com Confirmação e Ação */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left">
            {savedFeedback ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Preferências salvas com sucesso no seu perfil!
              </span>
            ) : (
              <span>
                As alterações se aplicam imediatamente ao menu lateral, atalhos da dashboard e busca.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar e Aplicar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
