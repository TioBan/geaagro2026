import React, { useState, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  Sliders,
  CheckSquare,
  RotateCcw,
} from 'lucide-react';
import { Farm } from '../../types/agronomy';
import { PendingRecommendation } from './dashboardTypes';

interface DashboardRecommendationsSectionProps {
  farms: Farm[];
  setSelectedFarmId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  onShowToast: (message: string) => void;
}

export const DashboardRecommendationsSection: React.FC<DashboardRecommendationsSectionProps> = ({
  farms = [],
  setSelectedFarmId,
  setActiveTab,
  onShowToast,
}) => {
  const [recommendations, setRecommendations] = useState<PendingRecommendation[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_dashboard_recommendations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(
            (r: unknown): r is PendingRecommendation =>
              typeof r === 'object' && r !== null && typeof (r as PendingRecommendation).id === 'string'
          );
        }
      }
    } catch {
      // Fallback para lista vazia
    }
    return [];
  });

  const persistRecommendations = (next: PendingRecommendation[]) => {
    try {
      localStorage.setItem('agronutri_dashboard_recommendations', JSON.stringify(next));
    } catch {
      // Ignora erro de cota
    }
  };

  const [filterType, setFilterType] = useState<string>('todos');
  const [filterFarmId, setFilterFarmId] = useState<string>('todas');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  const handleUpdateStatus = (id: string, newStatus: 'aplicada' | 'revisada') => {
    const updatedItem = recommendations.find(r => r.id === id);
    setRecommendations(prev => {
      const next = prev.map(rec => (rec.id === id ? { ...rec, status: newStatus } : rec));
      persistRecommendations(next);
      return next;
    });
    if (updatedItem) {
      const typeLabel =
        updatedItem.type === 'adubacao'
          ? 'Adubação'
          : updatedItem.type === 'calagem'
            ? 'Calagem'
            : 'Gessagem';
      onShowToast(
        `Recomendação de ${typeLabel} marcada como ${newStatus === 'aplicada' ? 'Aplicada' : 'Revisada'}.`
      );
    }
  };

  const handleResetRecommendations = () => {
    setRecommendations([]);
    try {
      localStorage.removeItem('agronutri_dashboard_recommendations');
    } catch {
      // Ignora erro
    }
    onShowToast('Lista de recomendações limpa.');
  };

  const farmsById = useMemo(() => {
    const map = new Map<string, Farm>();
    for (const f of farms) {
      if (f?.id) map.set(f.id, f);
    }
    return map;
  }, [farms]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchType = filterType === 'todos' || rec.type === filterType;
      const matchFarm = filterFarmId === 'todas' || rec.farmId === filterFarmId;
      const matchStatus = showCompleted || (rec.status !== 'aplicada' && rec.status !== 'revisada');
      return matchType && matchFarm && matchStatus;
    });
  }, [recommendations, filterType, filterFarmId, showCompleted]);

  const recStats = useMemo(() => {
    const total = recommendations.length;
    let pending = 0;
    let inReview = 0;
    let applied = 0;
    let reviewed = 0;

    for (const r of recommendations) {
      if (r.status === 'pendente') pending++;
      else if (r.status === 'em_revisao') inReview++;
      else if (r.status === 'aplicada') applied++;
      else if (r.status === 'revisada') reviewed++;
    }

    const adoptionEfficiency = total > 0 ? Math.round(((applied + reviewed) / total) * 100) : 0;
    return { pending, inReview, applied, adoptionEfficiency };
  }, [recommendations]);

  return (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Cabeçalho e Filtros */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Recomendações pendentes de campo
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Acompanhe aprovação e aplicação de calagem, gessagem e adubação por talhão.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'calagem', label: 'Calagem' },
                { id: 'gessagem', label: 'Gessagem' },
                { id: 'adubacao', label: 'Adubação' },
              ] as const
            ).map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterType(item.id)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filterType === item.id
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Filtrar por Fazenda"
            value={filterFarmId}
            onChange={e => setFilterFarmId(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas as fazendas</option>
            {farms.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              showCompleted
                ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{showCompleted ? 'Com concluídas' : 'Só pendentes'}</span>
          </button>

          {recommendations.length > 0 && (
            <button
              type="button"
              onClick={handleResetRecommendations}
              title="Limpar recomendações"
              aria-label="Limpar recomendações"
              className="h-8 w-8 inline-flex items-center justify-center border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contadores em Faixa Única */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800 tabular-nums">
        <div className="px-4 py-3">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pendentes</span>
          <strong className="text-base font-semibold text-amber-600 dark:text-amber-400">
            {recStats.pending + recStats.inReview}
          </strong>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Em revisão</span>
          <strong className="text-base font-semibold text-sky-600 dark:text-sky-400">
            {recStats.inReview}
          </strong>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Aplicadas</span>
          <strong className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
            {recStats.applied}
          </strong>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Adoção</span>
          <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            {recStats.adoptionEfficiency}%
          </strong>
        </div>
      </div>

      {/* Lista de Recomendações */}
      {filteredRecommendations.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {filteredRecommendations.map(rec => {
            const recFarm = farmsById.get(rec.farmId);
            const recPlot = recFarm?.plots?.find(p => p?.id === rec.plotId);

            const typeLabel =
              rec.type === 'calagem'
                ? 'Calagem'
                : rec.type === 'gessagem'
                  ? 'Gessagem'
                  : 'Adubação';

            const statusMeta =
              rec.status === 'aplicada'
                ? { label: 'Aplicada', cls: 'text-emerald-700 dark:text-emerald-400' }
                : rec.status === 'revisada'
                  ? { label: 'Revisada', cls: 'text-emerald-700 dark:text-emerald-400' }
                  : rec.status === 'em_revisao'
                    ? { label: 'Em revisão', cls: 'text-sky-700 dark:text-sky-400' }
                    : { label: 'Pendente', cls: 'text-amber-700 dark:text-amber-400' };

            const isDone = rec.status === 'aplicada' || rec.status === 'revisada';

            return (
              <div
                key={rec.id}
                className={`px-4 sm:px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isDone ? 'opacity-75' : ''
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {typeLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-medium ${statusMeta.cls}`}>{statusMeta.label}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(rec.dateCreated).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    {rec.product}{' '}
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      — {rec.dosage}
                    </span>
                  </p>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl">
                    {rec.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="text-slate-700 dark:text-zinc-300">
                      {recFarm?.name || 'Fazenda'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{recPlot?.name || 'Talhão'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rec.crop}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!isDone ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rec.id, 'revisada')}
                        className="h-7 px-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rec.id, 'aplicada')}
                        className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aplicar</span>
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluído
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFarmId(rec.farmId);
                      setActiveTab('recomendacoes');
                    }}
                    className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                    title="Ver e ajustar parâmetros"
                    aria-label="Ver e ajustar parâmetros"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-8 text-center space-y-2">
          <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            Nenhuma recomendação pendente encontrada
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Ajuste os filtros ou gere recomendações de calagem e adubação a partir das análises de solo.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('recomendacoes')}
            className="mt-1 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Abrir módulo de recomendações
          </button>
        </div>
      )}
    </section>
  );
};
