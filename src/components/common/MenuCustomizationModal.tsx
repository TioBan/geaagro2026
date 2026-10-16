import React, { useState } from 'react';
import { NavItem } from '../Navbar';
import {
  MenuPreferences,
  MenuItemCustomization,
  MENU_PRESETS,
  generatePresetPreferences,
} from '../../utils/menuCustomizationStorage';
import {
  X,
  Sliders,
  Sparkles,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  Search,
  Star,
  Edit2,
  Save,
  Undo2,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface MenuCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultItems: NavItem[];
  currentPreferences: MenuPreferences;
  onSavePreferences: (newPreferences: MenuPreferences) => void;
}

export const MenuCustomizationModal: React.FC<MenuCustomizationModalProps> = ({
  isOpen,
  onClose,
  defaultItems = [],
  currentPreferences,
  onSavePreferences,
}) => {
  const [preferences, setPreferences] = useState<MenuPreferences>(() => {
    // Clone deep
    return JSON.parse(JSON.stringify(currentPreferences));
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  if (!isOpen) return null;

  // Map default items by id
  const defaultItemsMap = new Map<string, NavItem>();
  defaultItems.forEach(item => defaultItemsMap.set(item.id, item));

  // Determine current ordered list of all IDs (including any missing items)
  const allOrderedIds = [...(preferences.customOrder || [])];
  defaultItems.forEach(item => {
    if (!allOrderedIds.includes(item.id)) {
      allOrderedIds.push(item.id);
    }
  });

  // Filter items based on search and tab filter
  const filteredIds = allOrderedIds.filter(id => {
    const defaultItem = defaultItemsMap.get(id);
    if (!defaultItem) return false;

    const custom = preferences.items[id];
    const isHidden = !!custom?.hidden;
    const currentName = custom?.customLabel || defaultItem.label;

    // Search filter
    const matchesSearch = currentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defaultItem.label.toLowerCase().includes(searchTerm.toLowerCase());

    // Tab filter
    if (activeTabFilter === 'visible' && isHidden) return false;
    if (activeTabFilter === 'hidden' && !isHidden) return false;

    return matchesSearch;
  });

  // Toggle Hidden
  const handleToggleHide = (id: string) => {
    setPreferences(prev => {
      const currentItem = prev.items[id] || { id, hidden: false, pinned: false };
      const updatedItems = {
        ...prev.items,
        [id]: {
          ...currentItem,
          hidden: !currentItem.hidden,
        },
      };
      return {
        ...prev,
        preset: 'custom',
        items: updatedItems,
      };
    });
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setPreferences(prev => {
      const currentItem = prev.items[id] || { id, hidden: false, pinned: false };
      const isPinned = !currentItem.pinned;
      
      const updatedItems = {
        ...prev.items,
        [id]: {
          ...currentItem,
          pinned: isPinned,
        },
      };

      let newOrder = [...prev.customOrder];
      if (isPinned) {
        // Move to the very top
        newOrder = [id, ...newOrder.filter(itemId => itemId !== id)];
      }

      return {
        ...prev,
        preset: 'custom',
        customOrder: newOrder,
        items: updatedItems,
      };
    });
  };

  // Move Item Up
  const handleMoveUp = (id: string) => {
    setPreferences(prev => {
      const order = [...prev.customOrder];
      const index = order.indexOf(id);
      if (index <= 0) return prev;

      const temp = order[index - 1];
      order[index - 1] = order[index];
      order[index] = temp;

      return {
        ...prev,
        preset: 'custom',
        customOrder: order,
      };
    });
  };

  // Move Item Down
  const handleMoveDown = (id: string) => {
    setPreferences(prev => {
      const order = [...prev.customOrder];
      const index = order.indexOf(id);
      if (index === -1 || index >= order.length - 1) return prev;

      const temp = order[index + 1];
      order[index + 1] = order[index];
      order[index] = temp;

      return {
        ...prev,
        preset: 'custom',
        customOrder: order,
      };
    });
  };

  // Start Editing Label
  const handleStartEditing = (id: string) => {
    const defaultItem = defaultItemsMap.get(id);
    const custom = preferences.items[id];
    setEditingItemId(id);
    setTempLabel(custom?.customLabel || defaultItem?.label || '');
  };

  // Save Custom Label
  const handleSaveLabel = (id: string) => {
    setPreferences(prev => {
      const currentItem = prev.items[id] || { id, hidden: false, pinned: false };
      return {
        ...prev,
        preset: 'custom',
        items: {
          ...prev.items,
          [id]: {
            ...currentItem,
            customLabel: tempLabel.trim() || undefined,
          },
        },
      };
    });
    setEditingItemId(null);
  };

  // Reset Individual Label
  const handleResetLabel = (id: string) => {
    setPreferences(prev => {
      const currentItem = prev.items[id] || { id, hidden: false, pinned: false };
      return {
        ...prev,
        preset: 'custom',
        items: {
          ...prev.items,
          [id]: {
            ...currentItem,
            customLabel: undefined,
          },
        },
      };
    });
    setEditingItemId(null);
  };

  // Apply Preset
  const handleApplyPreset = (presetKey: string) => {
    const newPrefs = generatePresetPreferences(presetKey, defaultItems);
    setPreferences(newPrefs);
  };

  // Restore Default
  const handleResetToDefault = () => {
    const defaultPrefs = generatePresetPreferences('default', defaultItems);
    setPreferences(defaultPrefs);
  };

  // Save and Close
  const handleSaveAndApply = () => {
    onSavePreferences(preferences);
    onClose();
  };

  // Counts
  const totalItemsCount = allOrderedIds.length;
  const visibleCount = allOrderedIds.filter(id => !preferences.items[id]?.hidden).length;
  const hiddenCount = totalItemsCount - visibleCount;

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] border border-slate-200 dark:border-zinc-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100">
                Personalizar Menu "Análise Técnica"
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Reorganize a ordem, oculte módulos que não utiliza e renomeie as opções conforme o seu gosto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin">
          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Perfis Rápidos de Menu (Presets Prontos)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(MENU_PRESETS).map(([key, preset]) => {
                const isSelected = preferences.preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-1 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{preset.iconEmoji}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="font-bold text-xs">{preset.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar módulo (ex: Solo, Custos, Bovinocultura)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setActiveTabFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTabFilter === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                Todos ({totalItemsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('visible')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTabFilter === 'visible'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                Visíveis ({visibleCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('hidden')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTabFilter === 'hidden'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                Ocultos ({hiddenCount})
              </button>
            </div>
          </div>

          {/* Module List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1">
              <span>Módulo & Ordem</span>
              <span>Ações & Visibilidade</span>
            </div>

            <div className="space-y-2 divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredIds.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Nenhum módulo encontrado para os filtros aplicados.
                </div>
              ) : (
                filteredIds.map((id, index) => {
                  const defaultItem = defaultItemsMap.get(id);
                  if (!defaultItem) return null;

                  const custom = preferences.items[id];
                  const isHidden = !!custom?.hidden;
                  const isPinned = !!custom?.pinned;
                  const hasCustomLabel = !!custom?.customLabel && custom.customLabel !== defaultItem.label;
                  const displayName = custom?.customLabel || defaultItem.label;
                  const Icon = defaultItem.icon;
                  const isEditingThis = editingItemId === id;
                  const subItemCount = (defaultItem.subItems || []).length;

                  return (
                    <div
                      key={id}
                      className={`pt-2 flex items-center justify-between gap-3 p-2.5 rounded-2xl transition ${
                        isHidden
                          ? 'opacity-50 bg-slate-50 dark:bg-zinc-900/40'
                          : isPinned
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50'
                          : 'bg-white dark:bg-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800'
                      }`}
                    >
                      {/* Left: Icon, Name & Reorder Buttons */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(id)}
                            disabled={index === 0}
                            title="Mover para Cima"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-20 transition"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(id)}
                            disabled={index === allOrderedIds.length - 1}
                            title="Mover para Baixo"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-20 transition"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Icon */}
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isHidden
                            ? 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Item Name / Inline Edit */}
                        <div className="flex-1 min-w-0">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={tempLabel}
                                onChange={(e) => setTempLabel(e.target.value)}
                                autoFocus
                                className="px-2 py-1 text-xs rounded-lg border border-emerald-500 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-bold outline-none flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveLabel(id)}
                                className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                title="Salvar Nome"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate">
                                {displayName}
                              </span>
                              {hasCustomLabel && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                  Personalizado
                                </span>
                              )}
                              {subItemCount > 0 && (
                                <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                                  ({subItemCount} {subItemCount === 1 ? 'submódulo' : 'submódulos'})
                                </span>
                              )}
                            </div>
                          )}

                          {hasCustomLabel && !isEditingThis && (
                            <div className="text-[10px] text-slate-400 truncate">
                              Original: {defaultItem.label}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Pin as Favorite */}
                        <button
                          type="button"
                          onClick={() => handleTogglePin(id)}
                          title={isPinned ? 'Desafixar dos Favoritos' : 'Fixar no Topo como Favorito'}
                          className={`p-1.5 rounded-xl transition ${
                            isPinned
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400' : ''}`} />
                        </button>

                        {/* Rename Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEditing(id)}
                          title="Editar Nome do Módulo"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Reset Label if modified */}
                        {hasCustomLabel && (
                          <button
                            type="button"
                            onClick={() => handleResetLabel(id)}
                            title="Restaurar Nome Original"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Visibility Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleHide(id)}
                          title={isHidden ? 'Exibir Módulo no Menu' : 'Ocultar Módulo do Menu'}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isHidden
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                          }`}
                        >
                          {isHidden ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                              <span>Oculto</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Visível</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão de Fábrica
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar & Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
