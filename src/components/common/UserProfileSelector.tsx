import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Beef,
  Building2,
  Scale,
  Layers,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  UserProfileId,
  USER_PROFILES,
  getActiveProfileId,
  setActiveProfileId,
  getProfileEnabledModules,
} from '../../utils/userProfilesStorage';

interface UserProfileSelectorProps {
  isCollapsed?: boolean;
  onOpenCustomizer: () => void;
  onNavigateToConfig?: () => void;
  className?: string;
}

const PROFILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Beef,
  Building2,
  Scale,
  Layers,
};

export const UserProfileSelector: React.FC<UserProfileSelectorProps> = ({
  isCollapsed = false,
  onOpenCustomizer,
  onNavigateToConfig,
  className = '',
}) => {
  const [activeProfileId, setActiveProfile] = useState<UserProfileId>(() => getActiveProfileId());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [enabledCount, setEnabledCount] = useState<number>(() => {
    return getProfileEnabledModules(getActiveProfileId()).length;
  });

  // Escuta mudanças de perfil disparadas em outras partes da aplicação
  useEffect(() => {
    const handleProfileChange = (e: any) => {
      const newProfile = e.detail?.profileId || getActiveProfileId();
      setActiveProfile(newProfile);
      setEnabledCount(getProfileEnabledModules(newProfile).length);
    };

    window.addEventListener('geaagro:profile-changed', handleProfileChange);
    return () => {
      window.removeEventListener('geaagro:profile-changed', handleProfileChange);
    };
  }, []);

  const currentProfile = USER_PROFILES[activeProfileId] || USER_PROFILES.todos;
  const ActiveIcon = PROFILE_ICONS[currentProfile.iconName] || Layers;

  const handleSelectProfile = (id: UserProfileId) => {
    setActiveProfile(id);
    setActiveProfileId(id);
    setEnabledCount(getProfileEnabledModules(id).length);
    setIsDropdownOpen(false);
  };

  if (isCollapsed) {
    return (
      <div className={`relative flex flex-col items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(prev => !prev)}
          title={`Configurações: ${currentProfile.name} (${enabledCount} módulos) - Clique para alternar`}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${currentProfile.colorClass} hover:scale-105`}
        >
          <ActiveIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onOpenCustomizer}
          title="Configurar Módulos do Sistema"
          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown Compacto */}
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute left-12 top-0 z-50 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 space-y-1 animate-fade-in">
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Configurações
                </span>
              </div>
              {(Object.keys(USER_PROFILES) as UserProfileId[]).map(id => {
                const profile = USER_PROFILES[id];
                const Icon = PROFILE_ICONS[profile.iconName] || Layers;
                const isSelected = activeProfileId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectProfile(id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{profile.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
              <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenCustomizer();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Configurar Módulos</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-50/90 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-2.5 shadow-2xs ${className}`}>
      {/* Cabeçalho de Configurações */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Configurações
        </span>
        <button
          type="button"
          onClick={onOpenCustomizer}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
          title="Incluir, alterar ou ocultar módulos deste perfil"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Personalizar</span>
        </button>
      </div>

      {/* Botão de Troca de Perfil (Dropdown) */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-2 bg-white dark:bg-zinc-800/90 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-left transition-all cursor-pointer shadow-2xs group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${currentProfile.colorClass}`}>
            <ActiveIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              <span>{currentProfile.name}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
              {enabledCount} módulos ativos
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>

      {/* Dropdown com os 5 Perfis Oficiais */}
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 space-y-1 animate-fade-in">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Selecione o Perfil
            </div>

            {(Object.keys(USER_PROFILES) as UserProfileId[]).map(id => {
              const profile = USER_PROFILES[id];
              const Icon = PROFILE_ICONS[profile.iconName] || Layers;
              const isSelected = activeProfileId === id;
              const count = getProfileEnabledModules(id).length;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectProfile(id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${profile.colorClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                        <span>{profile.name}</span>
                        {isSelected && (
                          <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                        {profile.badge} • {count} módulos
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-slate-400 hover:text-slate-600">Usar</span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenCustomizer();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Incluir / Alterar Módulos</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
