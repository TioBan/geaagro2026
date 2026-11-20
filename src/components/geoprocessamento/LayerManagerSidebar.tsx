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
  ChevronDown,
  ChevronUp,
  Leaf,
  Droplets,
  FlaskConical,
  Bug,
  MapPin,
  Square
} from 'lucide-react';
import { OverlayLayerItem } from '../../types/geoprocessamentoLayers';

interface LayerManagerSidebarProps {
  layers: OverlayLayerItem[];
  onLayersChange: (updatedLayers: OverlayLayerItem[]) => void;
  onResetLayers?: () => void;
  className?: string;
}

const getLayerIcon = (layer: OverlayLayerItem) => {
  switch (layer.id) {
    case 'ndvi_multispectral':
      return Leaf;
    case 'water_stress_ndwi':
      return Droplets;
    case 'soil_fertility':
      return FlaskConical;
    case 'pests_alerts':
      return Bug;
    case 'inspection_points':
      return MapPin;
    case 'plots_boundary':
      return Square;
    default:
      return Layers;
  }
};

export const LayerManagerSidebar: React.FC<LayerManagerSidebarProps> = ({
  layers,
  onLayersChange,
  onResetLayers,
  className = ''
}) => {
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [activeOpacityPopoverId, setActiveOpacityPopoverId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleToggleVisibility = (layerId: string) => {
    const updated = layers.map(l => (l.id === layerId ? { ...l, visible: !l.visible } : l));
    onLayersChange(updated);
  };

  const handleChangeOpacity = (layerId: string, newOpacity: number) => {
    const updated = layers.map(l =>
      l.id === layerId ? { ...l, opacity: Math.max(0.1, Math.min(1.0, newOpacity)) } : l
    );
    onLayersChange(updated);
  };

  const reorderByIds = (sourceId: string, targetId: string) => {
    const fromIdx = layers.findIndex(l => l.id === sourceId);
    const toIdx = layers.findIndex(l => l.id === targetId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

    const reordered = [...layers];
    const [movedItem] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, movedItem);

    const updatedWithOrder = reordered.map((item, idx) => ({
      ...item,
      order: reordered.length - idx
    }));
    onLayersChange(updatedWithOrder);
  };

  const handleDragStart = (layerId: string) => {
    setDraggedLayerId(layerId);
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    if (!draggedLayerId || draggedLayerId === layerId) return;
    setDragOverLayerId(layerId);
  };

  const handleDragLeave = () => {
    setDragOverLayerId(null);
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    if (draggedLayerId && draggedLayerId !== targetLayerId) {
      reorderByIds(draggedLayerId, targetLayerId);
    }
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const handleDragEnd = () => {
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const handleMove = (layerId: string, direction: 'up' | 'down') => {
    const displayedIdx = displayedLayers.findIndex(l => l.id === layerId);
    const targetDisplayedIdx = direction === 'up' ? displayedIdx - 1 : displayedIdx + 1;
    if (displayedIdx === -1 || targetDisplayedIdx < 0 || targetDisplayedIdx >= displayedLayers.length) return;
    reorderByIds(layerId, displayedLayers[targetDisplayedIdx].id);
  };

  const visibleCount = layers.filter(l => l.visible).length;

  const displayedLayers = layers.filter(l => {
    if (filterCategory === 'all') return true;
    return l.category === filterCategory;
  });

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span className="truncate">Camadas do Mapa</span>
              <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold">
                {visibleCount}/{layers.length}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              Arraste para definir a ordem de sobreposição
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onResetLayers && (
            <button
              type="button"
              onClick={onResetLayers}
              className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Restaurar ordem padrão"
              aria-label="Restaurar ordem padrão das camadas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir painel' : 'Recolher painel'}
            aria-label={isCollapsed ? 'Expandir painel' : 'Recolher painel'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Category Filter Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'multispectral', label: 'Espectral' },
              { id: 'stress', label: 'Estresse & MIP' },
              { id: 'soil_nutrients', label: 'Solo' },
              { id: 'operational', label: 'Vistorias' },
              { id: 'vectors', label: 'Talhões' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={`h-7 px-2.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  filterCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Drag Instruction */}
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <GripVertical className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Topo = maior prioridade visual</span>
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
              Arrastar ou setas
            </span>
          </div>

          {/* Layer List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
            {displayedLayers.map((layer, index) => {
              const isDragging = draggedLayerId === layer.id;
              const isOver = dragOverLayerId === layer.id;
              const isPopoverOpen = activeOpacityPopoverId === layer.id;
              const LayerIcon = getLayerIcon(layer);

              return (
                <div
                  key={layer.id}
                  draggable
                  onDragStart={() => handleDragStart(layer.id)}
                  onDragOver={(e) => handleDragOver(e, layer.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, layer.id)}
                  onDragEnd={handleDragEnd}
                  className={`relative p-2.5 rounded-lg border transition-colors select-none ${
                    isDragging
                      ? 'opacity-40 border-dashed border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : isOver
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30'
                        : layer.visible
                          ? 'bg-slate-50/60 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                          : 'bg-slate-100/40 dark:bg-zinc-900/40 border-slate-200/50 dark:border-zinc-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
                        title="Arraste para reordenar"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10"
                        style={{ backgroundColor: `${layer.color}18`, color: layer.color }}
                      >
                        <LayerIcon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`text-xs font-semibold truncate ${
                              layer.visible ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-500 line-through'
                            }`}
                          >
                            {layer.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {layer.badge ? `${layer.badge} · ` : ''}{layer.description}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(layer.id, 'up')}
                          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
                          title="Subir prioridade"
                          aria-label={`Subir prioridade de ${layer.name}`}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === displayedLayers.length - 1}
                          onClick={() => handleMove(layer.id, 'down')}
                          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
                          title="Descer prioridade"
                          aria-label={`Descer prioridade de ${layer.name}`}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveOpacityPopoverId(isPopoverOpen ? null : layer.id)}
                        className={`h-7 px-2 rounded-md border text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 tabular-nums ${
                          isPopoverOpen
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Ajustar opacidade"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span className="font-mono">{Math.round(layer.opacity * 100)}%</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(layer.id)}
                        className={`h-7 w-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          layer.visible
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-200 dark:border-zinc-700'
                        }`}
                        title={layer.visible ? 'Ocultar camada' : 'Exibir camada'}
                        aria-label={layer.visible ? `Ocultar ${layer.name}` : `Exibir ${layer.name}`}
                      >
                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Opacity & Legend Drawer */}
                  {isPopoverOpen && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-zinc-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          Opacidade da camada
                        </span>
                        <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          {Math.round(layer.opacity * 100)}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={layer.opacity}
                        onChange={(e) => handleChangeOpacity(layer.id, parseFloat(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer h-1.5"
                      />

                      <div className="grid grid-cols-4 gap-1">
                        {[0.25, 0.5, 0.75, 1.0].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleChangeOpacity(layer.id, val)}
                            className={`h-6 rounded-md text-[10px] font-mono tabular-nums font-medium transition-colors cursor-pointer border ${
                              Math.abs(layer.opacity - val) < 0.05
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {Math.round(val * 100)}%
                          </button>
                        ))}
                      </div>

                      {layer.legendGradient && (
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                          <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 block mb-1">
                            Escala temática
                          </span>
                          <div
                            className="h-2 w-full rounded-sm overflow-hidden"
                            style={{
                              background: `linear-gradient(to right, ${layer.legendGradient.join(', ')})`
                            }}
                          />
                          {layer.legendLabels && (
                            <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
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

          {/* Summary Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Preferências salvas localmente</span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-zinc-300 font-medium">
              Topo #{layers[0]?.order || 1}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default LayerManagerSidebar;
