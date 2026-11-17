import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Layers,
  Save,
  FileText,
  Pencil,
  RotateCcw,
} from 'lucide-react';
import {
  Company,
  Agronomist,
  RuralProducer,
  Farm,
  FieldPlot,
  SoilTexture,
} from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';

export interface DeleteTargetPayload {
  type: 'farm' | 'plot' | 'producer' | 'agronomist' | 'company';
  id: string;
  name: string;
  extraId?: string;
  warningText?: string;
}

interface FarmsPlotsTabProps {
  farms: Farm[];
  setFarms: React.Dispatch<React.SetStateAction<Farm[]>>;
  producers: RuralProducer[];
  agronomists: Agronomist[];
  companies: Company[];
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  selectedFarm?: Farm;
  setActiveTab?: (tab: string) => void;
  setActiveSubTab?: (subTab: string) => void;
  onEditFarm: (farm: Farm) => void;
  onEditPlot: (plot: FieldPlot) => void;
  onRequestDelete: (target: DeleteTargetPayload) => void;
  onNotify: (msg: string) => void;
}

export const FarmsPlotsTab: React.FC<FarmsPlotsTabProps> = ({
  farms,
  setFarms,
  producers,
  agronomists,
  companies,
  selectedFarmId,
  setSelectedFarmId,
  selectedFarm,
  setActiveTab,
  setActiveSubTab,
  onEditFarm,
  onEditPlot,
  onRequestDelete,
  onNotify,
}) => {
  // State for new Farm form
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmCity, setNewFarmCity] = useState('');
  const [newFarmState, setNewFarmState] = useState('');
  const [newFarmTotalArea, setNewFarmTotalArea] = useState<number | ''>('');
  const [newFarmCultivatedArea, setNewFarmCultivatedArea] = useState<number | ''>('');
  const [newFarmCar, setNewFarmCar] = useState('');
  const [newFarmSoilType, setNewFarmSoilType] = useState('');
  const [newFarmHistory, setNewFarmHistory] = useState('');
  const [newFarmProducerId, setNewFarmProducerId] = useState('');
  const [newFarmAgronomistId, setNewFarmAgronomistId] = useState('');
  const [newFarmCompanyId, setNewFarmCompanyId] = useState('');

  // State for new Plot form
  const [newPlotName, setNewPlotName] = useState('');
  const [newPlotArea, setNewPlotArea] = useState<number | ''>('');
  const [newPlotTexture, setNewPlotTexture] = useState<SoilTexture>('argiloso');
  const [newPlotClay, setNewPlotClay] = useState<number | ''>('');
  const [newPlotCrop, setNewPlotCrop] = useState('');
  const [newPlotRowSpacing, setNewPlotRowSpacing] = useState<number | ''>('');
  const [newPlotPlantSpacing, setNewPlotPlantSpacing] = useState<number | ''>('');
  const [newPlotIrrigationType, setNewPlotIrrigationType] = useState<
    'sequeiro' | 'pivo_central' | 'gotejamento' | 'aspersao'
  >('sequeiro');

  const resetFarmForm = () => {
    setNewFarmName('');
    setNewFarmCity('');
    setNewFarmState('');
    setNewFarmTotalArea('');
    setNewFarmCultivatedArea('');
    setNewFarmCar('');
    setNewFarmSoilType('');
    setNewFarmHistory('');
    setNewFarmProducerId('');
    setNewFarmAgronomistId('');
    setNewFarmCompanyId('');
  };

  const resetPlotForm = () => {
    setNewPlotName('');
    setNewPlotArea('');
    setNewPlotTexture('argiloso');
    setNewPlotClay('');
    setNewPlotCrop('');
    setNewPlotRowSpacing('');
    setNewPlotPlantSpacing('');
    setNewPlotIrrigationType('sequeiro');
  };

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName) return;

    const totalHa = Number(newFarmTotalArea) || 0;
    const cultHa = Number(newFarmCultivatedArea) || 0;
    const historyList = newFarmHistory.trim()
      ? newFarmHistory.split('->').map(s => s.trim()).filter(Boolean)
      : [];

    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      name: newFarmName,
      producerId: newFarmProducerId || '',
      agronomistId: newFarmAgronomistId || '',
      companyId: newFarmCompanyId || companies[0]?.id || '',
      carRegister: newFarmCar,
      totalAreaHa: totalHa,
      cultivatedAreaHa: cultHa,
      city: newFarmCity,
      state: newFarmState,
      soilGeneralType: newFarmSoilType,
      cropHistory: historyList,
      plots: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFarms(prev => [...prev, newFarm]);
    setSelectedFarmId(newFarm.id);
    resetFarmForm();
    onNotify(`Fazenda "${newFarm.name}" cadastrada com sucesso!`);
  };

  const handleAddPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotName || !selectedFarm) return;

    const area = Number(newPlotArea) || 0;
    const clay = Number(newPlotClay) || 0;
    const safeRow = Number(newPlotRowSpacing) || 0;
    const safePlant = Number(newPlotPlantSpacing) || 0;
    const population = safeRow > 0 && safePlant > 0 ? Math.round(10000 / (safeRow * safePlant)) : 0;
    const linearMeters = safeRow > 0 ? Math.round(10000 / safeRow) : 0;

    const newPlot: FieldPlot = {
      id: `plot-${Date.now()}`,
      name: newPlotName.trim(),
      farmId: selectedFarm.id,
      areaHa: area,
      texture: newPlotTexture,
      clayPercentage: clay,
      currentCrop: newPlotCrop.trim() || 'Não informada',
      spacingBetweenRowsMeters: safeRow,
      spacingBetweenPlantsMeters: safePlant,
      plantPopulationPerHa: population,
      linearMetersPerHa: linearMeters,
      irrigationType: newPlotIrrigationType,
    };

    setFarms(prev =>
      prev.map(f =>
        f?.id === selectedFarm.id
          ? { ...f, plots: [...(f.plots || []), newPlot] }
          : f
      )
    );

    resetPlotForm();
    onNotify(`Talhão "${newPlot.name}" adicionado à ${selectedFarm.name}!`);
  };

  const validFarms = (farms || []).filter(f => f && f.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: List of Farms & Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Fazendas Cadastradas
          </h3>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {validFarms.length === 0 ? (
              <div className="p-5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
                <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhuma fazenda cadastrada</p>
                <p>Preencha o formulário abaixo para registrar sua primeira propriedade rural.</p>
              </div>
            ) : (
              validFarms.map(f => {
                const prod = (producers || []).find(p => p?.id === f?.producerId);
                const isSelected = f?.id === selectedFarmId;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFarmId(f.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{f.name}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {f.city}/{f.state} • {f.totalAreaHa} ha totais ({f.cultivatedAreaHa} ha agrícolas)
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                          Produtor: {prod?.name || 'Não vinculado'} {prod?.document ? `(CPF/CNPJ: ${prod.document})` : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onEditFarm(f);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                            title="Editar fazenda"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onRequestDelete({
                                type: 'farm',
                                id: f.id,
                                name: f.name,
                                warningText: `Esta ação excluirá a fazenda e todos os seus ${f.plots?.length || 0} talhões mapeados.`,
                              });
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Excluir fazenda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded font-semibold border border-slate-200 dark:border-zinc-700">
                            {f.plots?.length || 0} talhões
                          </span>
                        </div>
                        {setActiveTab && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedFarmId(f.id);
                              setActiveTab('bulario');
                              if (setActiveSubTab) setActiveSubTab('receituario');
                            }}
                            className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 px-2 py-1 rounded-md border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="Emitir Receituário Agronômico para esta fazenda"
                          >
                            <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Receituário</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* New Farm Form */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Nova Propriedade Rural
          </h3>
          <form onSubmit={handleAddFarm} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome da Fazenda *</label>
              <input
                type="text"
                required
                placeholder="Ex: Fazenda Santa Cruz"
                value={newFarmName}
                onChange={e => setNewFarmName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Município</label>
                <input
                  type="text"
                  placeholder="Ex: Sorriso"
                  value={newFarmCity}
                  onChange={e => setNewFarmCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">UF</label>
                <select
                  aria-label="UF da Fazenda"
                  value={newFarmState}
                  onChange={e => setNewFarmState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                >
                  <option value="">Selecione UF</option>
                  {BRAZIL_STATES.map(st => (
                    <option key={st.uf} value={st.uf}>
                      {st.uf} - {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Área Total (ha)</label>
                <input
                  type="number"
                  placeholder="Ex: 500"
                  value={newFarmTotalArea}
                  onChange={e => setNewFarmTotalArea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Área Cultivada (ha)</label>
                <input
                  type="number"
                  placeholder="Ex: 450"
                  value={newFarmCultivatedArea}
                  onChange={e => setNewFarmCultivatedArea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Produtor Proprietário (opcional)</label>
              <select
                aria-label="Produtor Proprietário"
                value={newFarmProducerId}
                onChange={e => setNewFarmProducerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="">Não vinculado (opcional)</option>
                {(producers || []).filter(p => p && p.id).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.document})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Responsável Técnico (RT) (opcional)</label>
              <select
                aria-label="Responsável Técnico da Fazenda"
                value={newFarmAgronomistId}
                onChange={e => setNewFarmAgronomistId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="">Não vinculado (opcional)</option>
                {(agronomists || []).filter(a => a && a.id).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} • {a.profession || 'Eng. Agrônomo'} ({a.councilType || 'CREA'}-{a.creaState || 'MT'} {a.crea})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Registro CAR (opcional)</label>
              <input
                type="text"
                placeholder="Código CAR da propriedade"
                value={newFarmCar}
                onChange={e => setNewFarmCar(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Tipo Geral de Solo</label>
              <input
                type="text"
                placeholder="Ex: Latossolo Vermelho Distrófico (opcional)"
                value={newFarmSoilType}
                onChange={e => setNewFarmSoilType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Histórico de Culturas</label>
              <textarea
                rows={2}
                placeholder="Ex: Soja 2024/25 -> Milho Safrinha 2025 (opcional)"
                value={newFarmHistory}
                onChange={e => setNewFarmHistory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={resetFarmForm}
                className="px-3.5 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Limpar campos preenchidos deste formulário"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Cadastro da Fazenda
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Selected Farm Details & Field Plots Manager */}
      <div className="lg:col-span-7 space-y-6">
        {selectedFarm ? (
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Propriedade Selecionada
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">{selectedFarm.name}</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  {selectedFarm.city} - {selectedFarm.state} • Tipo de Solo:{' '}
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedFarm.soilGeneralType}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Área Mapeada</p>
                  <p className="text-base font-bold text-slate-800 dark:text-zinc-200">
                    {(selectedFarm?.plots || []).reduce((acc, p) => acc + (p?.areaHa || 0), 0)} ha /{' '}
                    {selectedFarm?.cultivatedAreaHa || 0} ha
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => onEditFarm(selectedFarm)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Editar dados da fazenda"
                  >
                    <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onRequestDelete({
                        type: 'farm',
                        id: selectedFarm.id,
                        name: selectedFarm.name,
                        warningText: `Todos os ${selectedFarm.plots?.length || 0} talhões desta fazenda também serão removidos.`,
                      })
                    }
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Excluir fazenda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Field Plots Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Talhões e Parâmetros de Plantio
                </h4>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {(selectedFarm?.plots || []).length} talhões
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900 font-semibold text-slate-700 dark:text-zinc-300">
                    <tr>
                      <th className="px-3 py-2 text-left">Talhão</th>
                      <th className="px-3 py-2 text-right">Área</th>
                      <th className="px-3 py-2 text-left">Textura</th>
                      <th className="px-3 py-2 text-left">Cultura</th>
                      <th className="px-3 py-2 text-center">Espaçamento</th>
                      <th className="px-3 py-2 text-right">População</th>
                      <th className="px-3 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                    {(selectedFarm?.plots || []).filter(plot => plot && plot.id).map(plot => (
                      <tr key={plot.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                        <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-zinc-100">{plot.name}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-700 dark:text-zinc-300">
                          {plot?.areaHa || 0} ha
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="capitalize font-medium text-slate-800 dark:text-zinc-200">{plot.texture}</span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-1">({plot.clayPercentage}%)</span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 dark:text-zinc-300">
                          {plot.currentCrop || 'Não definida'}
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono text-slate-600 dark:text-zinc-400">
                          {plot.spacingBetweenRowsMeters > 0 && plot.spacingBetweenPlantsMeters > 0
                            ? `${plot.spacingBetweenRowsMeters}m x ${plot.spacingBetweenPlantsMeters}m`
                            : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-emerald-800 dark:text-emerald-400">
                          {plot.plantPopulationPerHa > 0
                            ? `${plot.plantPopulationPerHa.toLocaleString('pt-BR')} pl/ha`
                            : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              aria-label="Editar talhão"
                              onClick={() => onEditPlot(plot)}
                              className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors p-1.5 rounded cursor-pointer"
                              title="Editar talhão"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Remover talhão"
                              onClick={() =>
                                onRequestDelete({
                                  type: 'plot',
                                  id: plot.id,
                                  name: plot.name,
                                  extraId: selectedFarm.id,
                                  warningText: `Área de ${plot.areaHa} ha com cultura ${plot.currentCrop || 'não definida'}.`,
                                })
                              }
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors p-1.5 rounded cursor-pointer"
                              title="Remover talhão"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Plot Inline Form */}
            <div className="bg-slate-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Adicionar Novo Talhão à Fazenda
              </h4>

              <form onSubmit={handleAddPlot} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Identificação do Talhão *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Talhão 04 - Pivô Sul"
                    value={newPlotName}
                    onChange={e => setNewPlotName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Cultura Planejada / Atual</label>
                  <input
                    type="text"
                    value={newPlotCrop}
                    onChange={e => setNewPlotCrop(e.target.value)}
                    placeholder="Ex: Soja, Milho, Café"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Área (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 50"
                    value={newPlotArea}
                    onChange={e => setNewPlotArea(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Argila (%)</label>
                  <input
                    type="number"
                    placeholder="Ex: 42"
                    value={newPlotClay}
                    onChange={e => setNewPlotClay(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Textura</label>
                  <select
                    aria-label="Textura do Solo"
                    value={newPlotTexture}
                    onChange={e => setNewPlotTexture(e.target.value as SoilTexture)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="arenoso">Arenoso (&lt;15%)</option>
                    <option value="medio">Médio (15-35%)</option>
                    <option value="argiloso">Argiloso (35-60%)</option>
                    <option value="muito_argiloso">Muito Argiloso (&gt;60%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Sistema de Irrigação</label>
                  <select
                    aria-label="Sistema de Irrigação"
                    value={newPlotIrrigationType}
                    onChange={e =>
                      setNewPlotIrrigationType(
                        e.target.value as 'sequeiro' | 'pivo_central' | 'gotejamento' | 'aspersao'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="sequeiro">Sequeiro (sem irrigação)</option>
                    <option value="pivo_central">Pivô Central</option>
                    <option value="gotejamento">Gotejamento</option>
                    <option value="aspersao">Aspersão Convencional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Espaçamento Linhas (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.50"
                    value={newPlotRowSpacing}
                    onChange={e => setNewPlotRowSpacing(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Espaçamento Plantas (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.07"
                    value={newPlotPlantSpacing}
                    onChange={e => setNewPlotPlantSpacing(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="sm:col-span-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">Cálculo Automático de Estande:</p>
                  <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                    <span>População Estimada:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {Number(newPlotRowSpacing) > 0 && Number(newPlotPlantSpacing) > 0
                        ? `${Math.round(10000 / (Number(newPlotRowSpacing) * Number(newPlotPlantSpacing))).toLocaleString('pt-BR')} pl/ha`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                    <span>Metros Lineares:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                      {Number(newPlotRowSpacing) > 0
                        ? `${Math.round(10000 / Number(newPlotRowSpacing)).toLocaleString('pt-BR')} m/ha`
                        : '-'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors hover:shadow-sm cursor-pointer min-h-[40px]"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Adicionar Talhão à Fazenda
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-8 border border-dashed border-slate-200 dark:border-zinc-800 shadow-xs text-center text-slate-400 dark:text-zinc-500 space-y-2">
            <MapPin className="w-10 h-10 mx-auto text-emerald-500/60" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Nenhuma fazenda selecionada</h4>
            <p className="text-xs max-w-sm mx-auto">
              Cadastre uma propriedade rural no formulário ao lado ou selecione uma existente para gerenciar seus talhões e culturas agrícolas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmsPlotsTab;
