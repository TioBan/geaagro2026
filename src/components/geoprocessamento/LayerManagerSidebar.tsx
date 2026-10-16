import React, { useState } from 'react';
import {
  GripVertical,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Layers,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { OverlayLayerItem, INITIAL_OVERLAY_LAYERS } from '../../types/geoprocessamentoLayers';

interface LayerManagerSidebarProps {
  layers: OverlayLayerItem[];
  onLayersChange: (updatedLayers: OverlayLayerItem[]) => void;
  onResetLayers?: () => void;
  className?: string;
}

export const LayerManagerSidebar: React.FC<LayerManagerSidebarProps> = ({
  layers,
  onLayersChange,
  onResetLayers,
  className = ''
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeOpacityPopoverId, setActiveOpacityPopoverId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Toggle layer visibility with state preservation
  const handleToggleVisibility = (layerId: string) => {
    const updated = layers.map(l => {
      if (l.id === layerId) {
        return { ...l, visible: !l.visible };
      }
      return l;
    });
    onLayersChange(updated);
  };

  // Change layer opacity
  const handleChangeOpacity = (layerId: string, newOpacity: number) => {
    const updated = layers.map(l => {
      if (l.id === layerId) {
        return { ...l, opacity: Math.max(0.1, Math.min(1.0, newOpacity)) };
      }
      return l;
    });
    onLayersChange(updated);
  };

  // Drag-and-drop HTML5 event handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...layers];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, movedItem);

    // Recompute order index so highest visual priority (top in list) has higher order value
    const updatedWithOrder = reordered.map((item, idx) => ({
      ...item,
      order: reordered.length - idx
    }));

    setDraggedIndex(null);
    setDragOverIndex(null);
    onLayersChange(updatedWithOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Manual Move Up / Down (Accessible keyboard/touch alternative to drag and drop)
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;

    const reordered = [...layers];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updatedWithOrder = reordered.map((item, idx) => ({
      ...item,
      order: reordered.length - idx
    }));

    onLayersChange(updatedWithOrder);
  };

  const visibleCount = layers.filter(l => l.visible).length;

  // Filtered layers for display
  const displayedLayers = layers.filter(l => {
    if (filterCategory === 'all') return true;
    return l.category === filterCategory;
  });

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header with Title and Stats */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Gerenciador de Camadas</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold">
                {visibleCount}/{layers.length}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-zinc-400">
              Arraste para reordenar a prioridade visual sobreposta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onResetLayers && (
            <button
              type="button"
              onClick={onResetLayers}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Restaurar Ordem Padrão das Camadas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={isCollapsed ? "Expandir Painel" : "Recolher Painel"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold scrollbar-none">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'multispectral', label: 'NDVI/Espectral' },
              { id: 'stress', label: 'Estresse & MIP' },
              { id: 'soil_nutrients', label: 'Solo' },
              { id: 'operational', label: 'Vistorias' },
              { id: 'vectors', label: 'Talhões' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 ${
                  filterCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Helper Drag Instruction Banner */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <GripVertical className="w-3 h-3 text-emerald-500" />
              <span>Topo = Sobreposição superior (maior prioridade)</span>
            </span>
            <span className="font-mono text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
              Drag &amp; Drop Ativo
            </span>
          </div>

          {/* Drag and Drop Layer List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {displayedLayers.map((layer, index) => {
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;
              const isPopoverOpen = activeOpacityPopoverId === layer.id;

              return (
                <div
                  key={layer.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative p-3 rounded-2xl border transition-all duration-200 select-none ${
                    isDragging
                      ? 'opacity-40 border-dashed border-emerald-500 bg-emerald-50/20'
                      : isOver
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/40 ring-2 ring-emerald-400/40'
                      : layer.visible
                      ? 'bg-slate-50/70 dark:bg-zinc-850/50 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      : 'bg-slate-100/40 dark:bg-zinc-900/40 border-slate-200/50 dark:border-zinc-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Drag Handle & Icon */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition"
                        title="Clique e arraste para reordenar"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <span className="text-base shrink-0">{layer.icon}</span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-black truncate ${
                            layer.visible ? 'text-slate-900 dark:text-white' : 'text-slate-500 line-through'
                          }`}>
                            {layer.name}
                          </span>
                          {layer.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300">
                              {layer.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                          {layer.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Tools: Up/Down Buttons, Opacity Slider Popover, Eye Toggle */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Priority Up/Down arrow shortcuts */}
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Subir prioridade (trazer para frente)"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === displayedLayers.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Descer prioridade (enviar para trás)"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Opacity Controller Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setActiveOpacityPopoverId(isPopoverOpen ? null : layer.id)}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          isPopoverOpen
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-2xs'
                            : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                        }`}
                        title="Ajustar Opacidade desta Camada"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span className="font-mono text-[9px]">{Math.round(layer.opacity * 100)}%</span>
                      </button>

                      {/* Visibility Toggle Eye */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(layer.id)}
                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                          layer.visible
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-200 dark:border-zinc-700'
                        }`}
                        title={layer.visible ? "Ocultar camada" : "Exibir camada"}
                      >
                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Opacity and Details Sub-Panel */}
                  {isPopoverOpen && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80 space-y-2 animate-fade-in text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
                          Transparência da Camada:
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                          {Math.round(layer.opacity * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={layer.opacity}
                          onChange={(e) => handleChangeOpacity(layer.id, parseFloat(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-1.5"
                        />
                      </div>

                      {/* Quick Opacity Presets */}
                      <div className="flex items-center gap-1 pt-1">
                        {[0.25, 0.50, 0.75, 1.0].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleChangeOpacity(layer.id, val)}
                            className={`flex-1 py-0.5 rounded-lg text-[9px] font-mono font-bold transition cursor-pointer border ${
                              Math.abs(layer.opacity - val) < 0.05
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                            }`}
                          >
                            {Math.round(val * 100)}%
                          </button>
                        ))}
                      </div>

                      {/* Optional Color Gradient Legend for Spectral Layers */}
                      {layer.legendGradient && (
                        <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                            Gradiente Temático:
                          </span>
                          <div
                            className="h-2 w-full rounded-full overflow-hidden shadow-2xs"
                            style={{
                              background: `linear-gradient(to right, ${layer.legendGradient.join(', ')})`
                            }}
                          />
                          {layer.legendLabels && (
                            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1">
                              <span>{layer.legendLabels.min}</span>
                              <span>{layer.legendLabels.mid}</span>
                              <span>{layer.legendLabels.max}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Summary Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Estado e ordem salvos no navegador</span>
            </span>
            <span className="font-bold text-slate-600 dark:text-zinc-300">
              Ordem: #{layers[0]?.order || 1} no Topo
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default LayerManagerSidebar;
