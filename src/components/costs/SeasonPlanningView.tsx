import React, { useState } from 'react';
import { PropertyCropSeason, ProductionSystem } from '../../types/costs';
import { Plus, Edit2, Trash2, Calendar, Wheat, Target, DollarSign, Building2, Check, X } from 'lucide-react';

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
      farmName: 'Sua Propriedade',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Planejamento de Safras & Propriedade
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastre áreas, culturas, orçamento inicial, calendário de plantio e metas de rentabilidade
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Safra / Planejamento
        </button>
      </div>

      {/* Cards de Safras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(seasons || []).map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.status === 'Em Andamento' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : s.status === 'Planejada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                  {s.status}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">{s.seasonName}</h4>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{s.crop} ({s.cultivar || 'Cultivar não inf.'})</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(s)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteSeason(s.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs divide-x divide-slate-100 dark:divide-zinc-800">
              <div className="space-y-1 pr-2">
                <span className="text-slate-500 dark:text-zinc-400 block">Área & Sistema</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 block">{s.plantedAreaHa} ha</span>
                <span className="text-[11px] text-slate-500 block">{s.productionSystem}</span>
              </div>

              <div className="space-y-1 pl-3">
                <span className="text-slate-500 dark:text-zinc-400 block">Metas de Produtividade</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{s.targetYieldBagsHa} sacas / ha</span>
                <span className="text-[11px] text-slate-500 block">Meta R$ {s.targetCostPerHa}/ha</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-zinc-800">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Orçamento Inicial Previsto:</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100">R$ {s.plannedBudgetTotal.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Período Agrícola:</span>
                <span>{new Date(s.startDate).toLocaleDateString('pt-BR')} a {new Date(s.endDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cadastro/Edição de Safra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                {editingSeason ? 'Editar Safra' : 'Nova Safra Agrícola'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Nome da Safra</label>
                  <input
                    type="text"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                    placeholder="Ex: Safra 2025/2026"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Cultura</label>
                  <input
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                    placeholder="Ex: Soja, Milho, Algodão"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Cultivar / Híbrido</label>
                  <input
                    type="text"
                    value={cultivar}
                    onChange={(e) => setCultivar(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                    placeholder="Ex: TMG 7062 IPRO"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Área Plantada (Hectares)</label>
                  <input
                    type="number"
                    value={plantedAreaHa}
                    onChange={(e) => setPlantedAreaHa(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Sistema de Produção</label>
                  <select
                    value={productionSystem}
                    onChange={(e) => setProductionSystem(e.target.value as ProductionSystem)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="Plantio Direto">Plantio Direto</option>
                    <option value="Convencional">Convencional</option>
                    <option value="Irrigado (Pivô)">Irrigado (Pivô)</option>
                    <option value="Orgânico">Orgânico</option>
                    <option value="Integração Lavoura-Pectuária (ILP)">Integração Lavoura-Pecuária (ILP)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Meta de Produtividade (sacas/ha)</label>
                  <input
                    type="number"
                    value={targetYieldBagsHa}
                    onChange={(e) => setTargetYieldBagsHa(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Orçamento Total Planejado (R$)</label>
                  <input
                    type="number"
                    value={plannedBudgetTotal}
                    onChange={(e) => setPlannedBudgetTotal(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Meta Custo por Ha (R$)</label>
                  <input
                    type="number"
                    value={targetCostPerHa}
                    onChange={(e) => setTargetCostPerHa(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Data Início Plantio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Data Fim Colheita</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
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
