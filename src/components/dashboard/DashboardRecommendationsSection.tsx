import React, { useState, useEffect, useMemo } from 'react';
import {
  Leaf,
  Layers,
  Activity,
  Calendar,
  Check,
  CheckCircle2,
  Sliders,
  CheckSquare,
  RotateCcw,
  Award,
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
  // Local state to manage pending/applied recommendations interactively
  const [recommendations, setRecommendations] = useState<PendingRecommendation[]>(() => {
    try {
      const saved = localStorage.getItem('agronutri_dashboard_recommendations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Exclude any legacy mock items
          return parsed.filter(
            (r: any) => r && typeof r === 'object' && r.id && !['rec-1', 'rec-2', 'rec-3', 'rec-4'].includes(r.id)
          );
        }
      }
    } catch {}
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agronutri_dashboard_recommendations', JSON.stringify(recommendations));
    } catch {}
  }, [recommendations]);

  // Filter states
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterFarmId, setFilterFarmId] = useState<string>('todas');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // Status update handler
  const handleUpdateStatus = (id: string, newStatus: 'aplicada' | 'revisada') => {
    setRecommendations(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, status: newStatus } : rec))
    );
    const updatedItem = recommendations.find(r => r.id === id);
    if (updatedItem) {
      const typeLabel =
        updatedItem.type === 'adubacao' ? 'Adubação' : updatedItem.type === 'calagem' ? 'Calagem' : 'Gessagem';
      onShowToast(
        `Recomendação de ${typeLabel} foi marcada como ${newStatus === 'aplicada' ? 'Aplicada com sucesso!' : 'Revisada!'}`
      );
    }
  };

  // Reset handler
  const handleResetRecommendations = () => {
    setRecommendations([]);
    try {
      localStorage.removeItem('agronutri_dashboard_recommendations');
    } catch {}
    onShowToast('Lista de recomendações limpa.');
  };

  // Pre-index farms by ID for fast lookup
  const farmsById = useMemo(() => {
    const map = new Map<string, Farm>();
    for (const f of farms) {
      if (f?.id) map.set(f.id, f);
    }
    return map;
  }, [farms]);

  // Filter recommendations based on selected criteria
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchType = filterType === 'todos' || rec.type === filterType;
      const matchFarm = filterFarmId === 'todas' || rec.farmId === filterFarmId;
      const matchStatus = showCompleted || (rec.status !== 'aplicada' && rec.status !== 'revisada');
      return matchType && matchFarm && matchStatus;
    });
  }, [recommendations, filterType, filterFarmId, showCompleted]);

  // Statistics for recommendations
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

    return { total, pending, inReview, applied, reviewed, adoptionEfficiency };
  }, [recommendations]);

  return (
    <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Recomendações Pendentes de Campo
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Gerencie, revise e controle a aplicação de Calcário, Gesso e Fertilizantes de forma integrada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter controls */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                filterType === 'todos'
                  ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('calagem')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                filterType === 'calagem'
                  ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Calagem
            </button>
            <button
              onClick={() => setFilterType('gessagem')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                filterType === 'gessagem'
                  ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Gessagem
            </button>
            <button
              onClick={() => setFilterType('adubacao')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                filterType === 'adubacao'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Adubação
            </button>
          </div>

          <select
            aria-label="Filtrar por Fazenda"
            value={filterFarmId}
            onChange={e => setFilterFarmId(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas as Fazendas</option>
            {farms.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
              showCompleted
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
                : 'border-slate-200 dark:border-zinc-700 text-slate-500'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {showCompleted ? 'Exibindo Aplicadas' : 'Ocultar Concluídas'}
          </button>

          <button
            onClick={handleResetRecommendations}
            title="Limpar recomendações"
            className="p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic recommendation counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-900 text-center">
          <span className="text-[9px] text-slate-400 block font-bold">Total Pendentes</span>
          <strong className="text-base text-amber-600 font-black">{recStats.pending + recStats.inReview}</strong>
        </div>
        <div className="p-3 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-900 text-center">
          <span className="text-[9px] text-slate-400 block font-bold">Aguardando Revisão</span>
          <strong className="text-base text-blue-500 font-black">{recStats.inReview}</strong>
        </div>
        <div className="p-3 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-900 text-center">
          <span className="text-[9px] text-slate-400 block font-bold">Aplicadas (Campanha)</span>
          <strong className="text-base text-emerald-600 dark:text-emerald-400 font-black">{recStats.applied}</strong>
        </div>
        <div className="p-3 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-900 text-center">
          <span className="text-[9px] text-slate-400 block font-bold">Eficiência de Adoção</span>
          <strong className="text-base text-emerald-600 dark:text-emerald-400 font-black">
            {recStats.adoptionEfficiency}%
          </strong>
        </div>
      </div>

      {/* Recommendation Cards Stack */}
      <div className="space-y-3">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(rec => {
            const recFarm = farmsById.get(rec.farmId);
            const recPlot = recFarm?.plots?.find(p => p?.id === rec.plotId);

            // Define visual parameters based on recommendation type
            let typeIcon = <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
            let typeLabel = 'Adubação de Nutrientes';
            let typeBadgeStyle =
              'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20';

            if (rec.type === 'calagem') {
              typeIcon = <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
              typeLabel = 'Calagem (Corretivos)';
              typeBadgeStyle =
                'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-100 dark:border-amber-900/20';
            } else if (rec.type === 'gessagem') {
              typeIcon = <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
              typeLabel = 'Gessagem (Condicionador)';
              typeBadgeStyle =
                'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border-blue-100 dark:border-blue-900/20';
            }

            // Status styles
            let statusText = 'Pendente';
            let statusStyle =
              'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30';

            if (rec.status === 'em_revisao') {
              statusText = 'Sob Revisão';
              statusStyle =
                'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30';
            } else if (rec.status === 'aplicada') {
              statusText = 'Aplicada no Campo';
              statusStyle =
                'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-850';
            } else if (rec.status === 'revisada') {
              statusText = 'Revisada & Aprovada';
              statusStyle =
                'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-850';
            }

            return (
              <div
                key={rec.id}
                className={`border rounded-xl p-4 sm:p-5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  rec.status === 'aplicada' || rec.status === 'revisada'
                    ? 'bg-slate-50/40 dark:bg-zinc-900/30 border-slate-100 dark:border-zinc-900 opacity-75'
                    : 'bg-white dark:bg-zinc-950 border-slate-100 dark:border-zinc-800/80 hover:border-slate-200 dark:hover:border-zinc-700 shadow-3xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shrink-0">
                    {typeIcon}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${typeBadgeStyle}`}>
                        {typeLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Prescrita em:{' '}
                        {new Date(rec.dateCreated).toLocaleDateString('pt-BR')}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusStyle}`}>
                        {statusText}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100">
                      {rec.product}{' '}
                      <span className="text-emerald-600 dark:text-emerald-400">— Dose: {rec.dosage}</span>
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-normal max-w-2xl">
                      {rec.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500 font-bold">
                      <span className="text-slate-600 dark:text-zinc-300">{recFarm?.name || 'Fazenda'}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {recPlot?.name || 'Talhão'}
                      </span>
                      <span>•</span>
                      <span>Cultura: {rec.crop}</span>
                    </div>
                  </div>
                </div>

                {/* Operational Controls */}
                <div className="flex items-center gap-2 md:self-center self-end shrink-0">
                  {rec.status !== 'aplicada' && rec.status !== 'revisada' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(rec.id, 'revisada')}
                        className="px-3 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-extrabold text-slate-700 dark:text-zinc-300 cursor-pointer transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rec.id, 'aplicada')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-3xs"
                      >
                        <Check className="w-4 h-4 text-emerald-100 shrink-0" /> Aplicar
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Concluído
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedFarmId(rec.farmId);
                      setActiveTab('recomendacoes');
                    }}
                    className="p-2 border border-slate-100 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 cursor-pointer"
                    title="Ver e ajustar parâmetros"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 border border-dashed border-slate-200 dark:border-zinc-850 rounded-xl text-center text-slate-400 dark:text-zinc-500 space-y-2">
            <Award className="w-10 h-10 mx-auto text-emerald-500" />
            <h5 className="font-extrabold text-sm text-slate-700 dark:text-zinc-300">
              Nenhuma recomendação pendente encontrada
            </h5>
            <p className="text-xs max-w-sm mx-auto text-slate-400 dark:text-zinc-500">
              Altere seus filtros de busca ou cadastre novas análises de solo para gerar mais recomendações.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
