import React, { useState, useEffect } from 'react';
import { PropertyCropSeason, ProductionSystem } from '../../types/costs';
import { formatCostDate } from '../../utils/costStorage';
import { Plus, Edit2, Trash2, Wheat, X } from 'lucide-react';

interface SeasonPlanningViewProps {
  seasons: PropertyCropSeason[];
  onAddSeason: (season: PropertyCropSeason) => void;
  onUpdateSeason: (season: PropertyCropSeason) => void;
  onDeleteSeason: (id: string) => void;
  selectedFarmId: string;
}

export const SeasonPlanningView: React.FC<SeasonPlanningViewProps> = ({
  seasons,
  onAddSeason,
  onUpdateSeason,
  onDeleteSeason,
  selectedFarmId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<PropertyCropSeason | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [seasonName, setSeasonName] = useState('');
  const [crop, setCrop] = useState('');
  const [cultivar, setCultivar] = useState('');
  const [plantedAreaHa, setPlantedAreaHa] = useState<number | ''>('');
  const [productionSystem, setProductionSystem] = useState<ProductionSystem>('Plantio Direto');
  const [targetYieldBagsHa, setTargetYieldBagsHa] = useState<number | ''>('');
  const [targetCostPerHa, setTargetCostPerHa] = useState<number | ''>('');
  const [targetProfitabilityPct, setTargetProfitabilityPct] = useState<number | ''>('');
  const [plannedBudgetTotal, setPlannedBudgetTotal] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'Planejada' | 'Em Andamento' | 'Encerrada'>('Planejada');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const handleOpenModal = (season?: PropertyCropSeason) => {
    if (season) {
      setEditingSeason(season);
      setSeasonName(season.seasonName);
      setCrop(season.crop);
      setCultivar(season.cultivar);
      setPlantedAreaHa(season.plantedAreaHa);
      setProductionSystem(season.productionSystem);
      setTargetYieldBagsHa(season.targetYieldBagsHa);
      setTargetCostPerHa(season.targetCostPerHa);
      setTargetProfitabilityPct(season.targetProfitabilityPct);
      setPlannedBudgetTotal(season.plannedBudgetTotal);
      setStartDate(season.startDate);
      setEndDate(season.endDate);
      setStatus(season.status);
      setNotes(season.notes || '');
    } else {
      setEditingSeason(null);
      setSeasonName('');
      setCrop('');
      setCultivar('');
      setPlantedAreaHa('');
      setProductionSystem('Plantio Direto');
      setTargetYieldBagsHa('');
      setTargetCostPerHa('');
      setTargetProfitabilityPct('');
      setPlannedBudgetTotal('');
      setStartDate('');
      setEndDate('');
      setStatus('Planejada');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seasonData: PropertyCropSeason = {
      id: editingSeason ? editingSeason.id : `season-${Date.now()}`,
      farmId: selectedFarmId || 'farm-1',
      farmName: editingSeason?.farmName || 'Propriedade Agrícola',
      seasonName,
      crop,
      cultivar,
      plantedAreaHa: Number(plantedAreaHa) || 1,
      productionSystem,
      targetYieldBagsHa: Number(targetYieldBagsHa) || 0,
      targetCostPerHa: Number(targetCostPerHa) || 0,
      targetProfitabilityPct: Number(targetProfitabilityPct) || 0,
      plannedBudgetTotal: Number(plannedBudgetTotal) || 0,
      startDate,
      endDate,
      status,
      notes,
    };

    if (editingSeason) {
      onUpdateSeason(seasonData);
    } else {
      onAddSeason(seasonData);
    }
    setIsModalOpen(false);
  };

  const getStatusClass = (s: PropertyCropSeason['status']) => {
    if (s === 'Em Andamento') return 'text-emerald-600 dark:text-emerald-400';
    if (s === 'Planejada') return 'text-blue-600 dark:text-blue-400';
    return 'text-slate-500 dark:text-zinc-400';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Planejamento de Safras &amp; Propriedade
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastre áreas, culturas, orçamento inicial, calendário agrícola e metas de rentabilidade.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Safra
        </button>
      </div>

      {(!seasons || seasons.length === 0) ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-8 text-center space-y-3">
          <Wheat className="w-7 h-7 text-slate-300 dark:text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Nenhuma safra cadastrada</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Crie seu primeiro planejamento de safra para acompanhar custos por hectare, operações, estoque e DRE.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar Primeira Safra
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3.5 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className={`text-[11px] font-semibold ${getStatusClass(s.status)}`}>{s.status}</div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5 truncate">
                    {s.seasonName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 truncate">
                    {s.crop} · {s.cultivar || 'Cultivar não informada'}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {confirmDeleteId === s.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteSeason(s.id);
                          setConfirmDeleteId(null);
                        }}
                        className="h-7 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-7 px-2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px]"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(s)}
                        aria-label={`Editar ${s.seasonName}`}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(s.id)}
                        aria-label={`Excluir ${s.seasonName}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs border-t border-slate-100 dark:border-zinc-800">
                <div className="pt-2 space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Área &amp; Sistema</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block tabular-nums">
                    {s.plantedAreaHa.toLocaleString('pt-BR')} ha
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                    {s.productionSystem}
                  </span>
                </div>

                <div className="pt-2 space-y-0.5 border-l border-slate-100 dark:border-zinc-800 pl-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Metas</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block tabular-nums">
                    {s.targetYieldBagsHa} sc/ha
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
                    R$ {s.targetCostPerHa.toLocaleString('pt-BR')}/ha
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg text-[11px] space-y-1 border border-slate-200/70 dark:border-zinc-800">
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Orçamento Previsto</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    R$ {s.plannedBudgetTotal.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-zinc-400 tabular-nums">
                  <span>Período</span>
                  <span>
                    {formatCostDate(s.startDate)} a {formatCostDate(s.endDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastro/Edição de Safra */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full p-5 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                {editingSeason ? 'Editar Safra' : 'Nova Safra Agrícola'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Nome da Safra</label>
                  <input
                    type="text"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                    placeholder="Ex: Safra 2025/2026"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Cultura</label>
                  <input
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                    placeholder="Ex: Soja, Milho, Algodão"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Cultivar / Híbrido</label>
                  <input
                    type="text"
                    value={cultivar}
                    onChange={(e) => setCultivar(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                    placeholder="Ex: TMG 7062 IPRO"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Área Plantada (ha)
                  </label>
                  <input
                    type="number"
                    value={plantedAreaHa}
                    onChange={(e) => setPlantedAreaHa(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    min={1}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Sistema de Produção
                  </label>
                  <select
                    value={productionSystem}
                    onChange={(e) => setProductionSystem(e.target.value as ProductionSystem)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Plantio Direto">Plantio Direto</option>
                    <option value="Convencional">Convencional</option>
                    <option value="Irrigado (Pivô)">Irrigado (Pivô)</option>
                    <option value="Orgânico">Orgânico</option>
                    <option value="Integração Lavoura-Pectuária (ILP)">Integração Lavoura-Pecuária (ILP)</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Status da Safra</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PropertyCropSeason['status'])}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Planejada">Planejada</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Encerrada">Encerrada</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Meta Produtividade (sc/ha)
                  </label>
                  <input
                    type="number"
                    value={targetYieldBagsHa}
                    onChange={(e) => setTargetYieldBagsHa(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Orçamento Planejado (R$)
                  </label>
                  <input
                    type="number"
                    value={plannedBudgetTotal}
                    onChange={(e) => setPlannedBudgetTotal(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Meta Custo por Ha (R$)
                  </label>
                  <input
                    type="number"
                    value={targetCostPerHa}
                    onChange={(e) => setTargetCostPerHa(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Meta Rentabilidade (%)
                  </label>
                  <input
                    type="number"
                    value={targetProfitabilityPct}
                    onChange={(e) => setTargetProfitabilityPct(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Início do Plantio
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Fim da Colheita</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingSeason ? 'Salvar Alterações' : 'Criar Safra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
