import React, { useMemo, useState } from 'react';
import {
  MapPin,
  Search,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  FlaskConical,
  Check,
  X,
} from 'lucide-react';
import {
  CollectionPoint,
  CollectionPointType,
  WaterAnalysisRecord,
} from '../../types/waterAnalysis';
import { COLLECTION_POINT_TYPE_LABELS } from './waterConstants';

interface WaterCollectionPointsViewProps {
  collectionPoints: CollectionPoint[];
  analyses: WaterAnalysisRecord[];
  onCreatePoint: () => void;
  onEditPoint: (point: CollectionPoint) => void;
  onDeletePoint: (pointId: string) => void;
  onCreateSampleForPoint: (pointId: string) => void;
}

export const WaterCollectionPointsView: React.FC<WaterCollectionPointsViewProps> = ({
  collectionPoints,
  analyses,
  onCreatePoint,
  onEditPoint,
  onDeletePoint,
  onCreateSampleForPoint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CollectionPointType>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const analysisCountByPoint = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of analyses) {
      map.set(item.collectionPointId, (map.get(item.collectionPointId) ?? 0) + 1);
    }
    return map;
  }, [analyses]);

  const filteredPoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return collectionPoints.filter((pt) => {
      const matchesSearch =
        !q ||
        pt.name.toLowerCase().includes(q) ||
        pt.code.toLowerCase().includes(q) ||
        pt.propertyName.toLowerCase().includes(q) ||
        (pt.notes?.toLowerCase().includes(q) ?? false);
      const matchesType = typeFilter === 'all' || pt.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [collectionPoints, searchQuery, typeFilter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ponto por nome, código ou propriedade..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | CollectionPointType)}
            aria-label="Filtrar por tipo de manancial"
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os tipos</option>
            {(Object.keys(COLLECTION_POINT_TYPE_LABELS) as CollectionPointType[]).map((key) => (
              <option key={key} value={key}>
                {COLLECTION_POINT_TYPE_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {filteredPoints.length} {filteredPoints.length === 1 ? 'ponto' : 'pontos'}
          </span>
          <button
            type="button"
            onClick={onCreatePoint}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Ponto
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredPoints.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
          <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2.5">
            <MapPin className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            {collectionPoints.length === 0
              ? 'Nenhum ponto de coleta cadastrado'
              : 'Nenhum ponto corresponde aos filtros'}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            {collectionPoints.length === 0
              ? 'Cadastre poços, represas, nascentes e reservatórios com coordenadas GPS para rastreabilidade das coletas.'
              : 'Ajuste os filtros de busca ou tipo de manancial.'}
          </p>
          {collectionPoints.length === 0 && (
            <button
              type="button"
              onClick={onCreatePoint}
              className="mt-4 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Ponto de Coleta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPoints.map((pt) => {
            const linkedCount = analysisCountByPoint.get(pt.id) ?? 0;
            const isConfirmingDelete = pendingDeleteId === pt.id;
            const hasCoords = pt.latitude !== 0 || pt.longitude !== 0;

            return (
              <div
                key={pt.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">
                          {pt.code}
                        </span>
                        <span>•</span>
                        <span>{COLLECTION_POINT_TYPE_LABELS[pt.type]}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate mt-0.5">
                        {pt.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {pt.propertyName || 'Propriedade não informada'}
                      </p>
                    </div>

                    <span className="text-[11px] font-medium tabular-nums text-slate-600 dark:text-zinc-400 shrink-0">
                      {linkedCount} {linkedCount === 1 ? 'laudo' : 'laudos'}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-[11px] flex items-center justify-between gap-2 tabular-nums text-slate-600 dark:text-zinc-400">
                    <span className="truncate">
                      {hasCoords
                        ? `${pt.latitude.toFixed(5)}, ${pt.longitude.toFixed(5)} (${pt.altitudeMeters} m)`
                        : 'Coordenadas GPS não informadas'}
                    </span>
                    {hasCoords && (
                      <a
                        href={`https://www.google.com/maps?q=${pt.latitude},${pt.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5 shrink-0 font-medium"
                      >
                        Mapa
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {pt.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                      {pt.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  {!isConfirmingDelete ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onCreateSampleForPoint(pt.id)}
                        className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <FlaskConical className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Nova Amostra
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditPoint(pt)}
                          className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(pt.id)}
                          aria-label={`Excluir ponto ${pt.name}`}
                          className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 truncate">
                        {linkedCount > 0
                          ? `Excluir (${linkedCount} ${linkedCount === 1 ? 'laudo' : 'laudos'})?`
                          : 'Confirmar exclusão?'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeletePoint(pt.id);
                            setPendingDeleteId(null);
                          }}
                          className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          Não
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WaterCollectionPointsView;
