import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  Layers,
  Box,
  Thermometer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Trash2,
  X,
  Printer,
} from 'lucide-react';
import {
  TraceabilityHarvestItem,
  TraceabilityPallet,
  TraceabilityLot,
  CommercialClass,
} from '../../types/traceability';

interface HarvestPackingProps {
  lots: TraceabilityLot[];
  harvests: TraceabilityHarvestItem[];
  pallets: TraceabilityPallet[];
  onSaveHarvest: (harvest: TraceabilityHarvestItem) => void;
  onSavePallet: (pallet: TraceabilityPallet) => void;
  onDeleteHarvest: (id: string) => void;
  onDeletePallet: (id: string) => void;
  onOpenLabels: (lot: TraceabilityLot) => void;
}

export const TraceabilityHarvestPacking: React.FC<HarvestPackingProps> = ({
  lots,
  harvests,
  pallets,
  onSaveHarvest,
  onSavePallet,
  onDeleteHarvest,
  onDeletePallet,
  onOpenLabels,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'colheitas' | 'pallets'>('colheitas');
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('all');
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);

  // Form State for Harvest
  const [harvestForm, setHarvestForm] = useState<{
    lotId: string;
    date: string;
    harvesterTeam: string;
    boxesCount: number;
    boxWeightKg: number;
    netWeightKg: number;
    commercialClass: CommercialClass;
    brixDegrees: number;
    firmnessPressure: number;
    destinationPackingHouse: string;
  }>({
    lotId: lots[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    harvesterTeam: 'Equipe Colheita A - 6 Pessoas',
    boxesCount: 150,
    boxWeightKg: 20.0,
    netWeightKg: 3000.0,
    commercialClass: 'Extra AA',
    brixDegrees: 6.8,
    firmnessPressure: 4.5,
    destinationPackingHouse: 'Packing House Central - Fazenda Santa Helena',
  });

  // Form State for Pallet
  const [palletForm, setPalletForm] = useState<{
    lotId: string;
    palletCode: string;
    boxesCount: number;
    totalNetWeightKg: number;
    commercialClass: CommercialClass;
    coldChamberLocation: string;
    storageTemperatureCelsius: number;
  }>({
    lotId: lots[0]?.id || '',
    palletCode: `PLT-${new Date().getFullYear()}-00${pallets.length + 1}`,
    boxesCount: 50,
    totalNetWeightKg: 1000.0,
    commercialClass: 'Extra AA',
    coldChamberLocation: 'Câmara Fria 01 - HF',
    storageTemperatureCelsius: 12.5,
  });

  const filteredHarvests = harvests.filter(h => {
    return selectedLotFilter === 'all' || h.lotId === selectedLotFilter;
  });

  const filteredPallets = pallets.filter(p => {
    return selectedLotFilter === 'all' || p.lotId === selectedLotFilter;
  });

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === harvestForm.lotId) || lots[0];

    const newHarvest: TraceabilityHarvestItem = {
      id: `harv-${Date.now()}`,
      lotId: lotObj.id,
      lotCode: lotObj.lotCode,
      date: harvestForm.date,
      harvesterTeam: harvestForm.harvesterTeam,
      boxesCount: Number(harvestForm.boxesCount),
      boxWeightKg: Number(harvestForm.boxWeightKg),
      netWeightKg: Number(harvestForm.boxesCount) * Number(harvestForm.boxWeightKg),
      commercialClass: harvestForm.commercialClass,
      brixDegrees: harvestForm.brixDegrees ? Number(harvestForm.brixDegrees) : undefined,
      firmnessPressure: harvestForm.firmnessPressure ? Number(harvestForm.firmnessPressure) : undefined,
      destinationPackingHouse: harvestForm.destinationPackingHouse,
      createdAt: new Date().toISOString(),
    };

    onSaveHarvest(newHarvest);
    setIsHarvestModalOpen(false);
  };

  const handlePalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === palletForm.lotId) || lots[0];

    const newPallet: TraceabilityPallet = {
      id: `plt-${Date.now()}`,
      palletCode: palletForm.palletCode,
      lotId: lotObj.id,
      lotCode: lotObj.lotCode,
      cropName: lotObj.cropName,
      cultivarName: lotObj.cultivarName,
      boxesCount: Number(palletForm.boxesCount),
      totalNetWeightKg: Number(palletForm.totalNetWeightKg),
      commercialClass: palletForm.commercialClass,
      assemblyDate: new Date().toISOString().split('T')[0],
      coldChamberLocation: palletForm.coldChamberLocation,
      storageTemperatureCelsius: Number(palletForm.storageTemperatureCelsius),
      status: 'estocado_camara',
    };

    onSavePallet(newPallet);
    setIsPalletModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              Colheita, Classificação Comercial & Packing House
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Controle de pesagem, Brix/Firmeza, classificação e montagem de pallets com controle de câmara fria
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLotFilter}
              onChange={e => setSelectedLotFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold"
            >
              <option value="all">Todos os Lotes ({lots.length})</option>
              {lots.map(l => (
                <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName}</option>
              ))}
            </select>

            {activeSubTab === 'colheitas' ? (
              <button
                onClick={() => setIsHarvestModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Registrar Colheita
              </button>
            ) : (
              <button
                onClick={() => setIsPalletModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Montar Novo Pallet
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pt-2">
          <button
            onClick={() => setActiveSubTab('colheitas')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'colheitas'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Lançamentos de Colheita ({filteredHarvests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('pallets')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'pallets'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Gestão de Pallets & Câmaras Frias ({filteredPallets.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'colheitas' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3">Caixas</th>
                  <th className="py-2.5 px-3">Peso Líquido</th>
                  <th className="py-2.5 px-3">Classificação</th>
                  <th className="py-2.5 px-3">ºBrix / Firmeza</th>
                  <th className="py-2.5 px-3">Packing House / Equipe</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredHarvests.map(h => {
                  const lotObj = lots.find(l => l.id === h.lotId);

                  return (
                    <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-zinc-200">
                        {new Date(h.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {h.lotCode}
                      </td>
                      <td className="py-3 px-3 font-bold">
                        {h.boxesCount} cx
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {h.netWeightKg.toLocaleString('pt-BR')} kg
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {h.commercialClass}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-zinc-400">
                        {h.brixDegrees ? `${h.brixDegrees} ºBrix` : '--'} • {h.firmnessPressure ? `${h.firmnessPressure} lb` : '--'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-zinc-400">
                        {h.destinationPackingHouse}
                        <span className="block text-[10px] text-slate-400">{h.harvesterTeam}</span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {lotObj && (
                          <button
                            onClick={() => onOpenLabels(lotObj)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                            title="Imprimir Etiquetas para esta Colheita"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteHarvest(h.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPallets.map(pallet => (
            <div
              key={pallet.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {pallet.palletCode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                    {pallet.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {pallet.cropName} <span className="font-normal text-xs text-slate-500">({pallet.cultivarName})</span>
                  </h4>
                  <p className="text-xs font-mono text-emerald-600 font-bold">Lote: {pallet.lotCode}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Caixas:</span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">{pallet.boxesCount} cx</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Peso Líquido:</span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">{pallet.totalNetWeightKg} kg</strong>
                  </div>
                  <div className="col-span-2 pt-1 flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                    <Thermometer className="w-3.5 h-3.5" />
                    {pallet.coldChamberLocation} ({pallet.storageTemperatureCelsius} °C)
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Montagem: {new Date(pallet.assemblyDate).toLocaleDateString('pt-BR')}</span>
                <button
                  onClick={() => onDeletePallet(pallet.id)}
                  className="p-1 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Colheita */}
      {isHarvestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                Registrar Lançamento de Colheita
              </h3>
              <button onClick={() => setIsHarvestModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHarvestSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Lote *</label>
                  <select
                    value={harvestForm.lotId}
                    onChange={e => setHarvestForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    {lots.map(l => (
                      <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Data da Colheita *</label>
                  <input
                    type="date"
                    value={harvestForm.date}
                    onChange={e => setHarvestForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Qtd Caixas *</label>
                  <input
                    type="number"
                    value={harvestForm.boxesCount}
                    onChange={e => setHarvestForm(prev => ({ ...prev, boxesCount: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Peso por Caixa (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={harvestForm.boxWeightKg}
                    onChange={e => setHarvestForm(prev => ({ ...prev, boxWeightKg: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Classificação</label>
                  <select
                    value={harvestForm.commercialClass}
                    onChange={e => setHarvestForm(prev => ({ ...prev, commercialClass: e.target.value as CommercialClass }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    <option value="Extra AA">Extra AA</option>
                    <option value="Extra A">Extra A</option>
                    <option value="Especial">Especial</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Refugo">Refugo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Grau ºBrix (Açúcar)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={harvestForm.brixDegrees}
                    onChange={e => setHarvestForm(prev => ({ ...prev, brixDegrees: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Firmeza da Polpa (lb/cm²)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={harvestForm.firmnessPressure}
                    onChange={e => setHarvestForm(prev => ({ ...prev, firmnessPressure: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Packing House / Destino</label>
                <input
                  type="text"
                  value={harvestForm.destinationPackingHouse}
                  onChange={e => setHarvestForm(prev => ({ ...prev, destinationPackingHouse: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsHarvestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Salvar Colheita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pallet */}
      {isPalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Montar e Identificar Pallet
              </h3>
              <button onClick={() => setIsPalletModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePalletSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Código do Pallet *</label>
                  <input
                    type="text"
                    value={palletForm.palletCode}
                    onChange={e => setPalletForm(prev => ({ ...prev, palletCode: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Lote de Origem *</label>
                  <select
                    value={palletForm.lotId}
                    onChange={e => setPalletForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-semibold"
                  >
                    {lots.map(l => (
                      <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Quantidade de Caixas</label>
                  <input
                    type="number"
                    value={palletForm.boxesCount}
                    onChange={e => setPalletForm(prev => ({
                      ...prev,
                      boxesCount: Number(e.target.value),
                      totalNetWeightKg: Number(e.target.value) * 20,
                    }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Peso Total Líquido (kg)</label>
                  <input
                    type="number"
                    value={palletForm.totalNetWeightKg}
                    onChange={e => setPalletForm(prev => ({ ...prev, totalNetWeightKg: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Local na Câmara Fria</label>
                  <input
                    type="text"
                    value={palletForm.coldChamberLocation}
                    onChange={e => setPalletForm(prev => ({ ...prev, coldChamberLocation: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Temperatura Alvo (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={palletForm.storageTemperatureCelsius}
                    onChange={e => setPalletForm(prev => ({ ...prev, storageTemperatureCelsius: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPalletModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Salvar Pallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
