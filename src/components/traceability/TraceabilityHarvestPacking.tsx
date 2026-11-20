import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Plus,
  Layers,
  Thermometer,
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
  const [confirmDeleteHarvestId, setConfirmDeleteHarvestId] = useState<string | null>(null);
  const [confirmDeletePalletId, setConfirmDeletePalletId] = useState<string | null>(null);

  const [harvestForm, setHarvestForm] = useState<{
    lotId: string;
    date: string;
    harvesterTeam: string;
    boxesCount: number;
    boxWeightKg: number;
    commercialClass: CommercialClass;
    brixDegrees: number;
    firmnessPressure: number;
    destinationPackingHouse: string;
  }>({
    lotId: lots[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    harvesterTeam: '',
    boxesCount: 150,
    boxWeightKg: 20.0,
    commercialClass: 'Extra AA',
    brixDegrees: 6.8,
    firmnessPressure: 4.5,
    destinationPackingHouse: '',
  });

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
    palletCode: `PL-${new Date().getFullYear()}-${String(pallets.length + 1).padStart(3, '0')}`,
    boxesCount: 50,
    totalNetWeightKg: 1000.0,
    commercialClass: 'Extra AA',
    coldChamberLocation: 'Câmara Fria 01',
    storageTemperatureCelsius: 12.5,
  });

  useEffect(() => {
    if (!isHarvestModalOpen && !isPalletModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHarvestModalOpen(false);
        setIsPalletModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHarvestModalOpen, isPalletModalOpen]);

  const filteredHarvests = harvests.filter(h => selectedLotFilter === 'all' || h.lotId === selectedLotFilter);
  const filteredPallets = pallets.filter(p => selectedLotFilter === 'all' || p.lotId === selectedLotFilter);

  const handleOpenHarvestModal = () => {
    setHarvestForm(prev => ({ ...prev, lotId: prev.lotId || lots[0]?.id || '' }));
    setIsHarvestModalOpen(true);
  };

  const handleOpenPalletModal = () => {
    setPalletForm(prev => ({
      ...prev,
      lotId: prev.lotId || lots[0]?.id || '',
      palletCode: `PL-${new Date().getFullYear()}-${String(pallets.length + 1).padStart(3, '0')}`,
    }));
    setIsPalletModalOpen(true);
  };

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === harvestForm.lotId) || lots[0];

    const newHarvest: TraceabilityHarvestItem = {
      id: `colheita-${Date.now()}`,
      lotId: lotObj?.id || 'geral',
      lotCode: lotObj?.lotCode || 'GERAL',
      date: harvestForm.date,
      harvesterTeam: harvestForm.harvesterTeam || 'Equipe de Campo',
      boxesCount: Number(harvestForm.boxesCount),
      boxWeightKg: Number(harvestForm.boxWeightKg),
      netWeightKg: Number(harvestForm.boxesCount) * Number(harvestForm.boxWeightKg),
      commercialClass: harvestForm.commercialClass,
      brixDegrees: harvestForm.brixDegrees ? Number(harvestForm.brixDegrees) : undefined,
      firmnessPressure: harvestForm.firmnessPressure ? Number(harvestForm.firmnessPressure) : undefined,
      destinationPackingHouse: harvestForm.destinationPackingHouse || 'Packing House Central',
      createdAt: new Date().toISOString(),
    };

    onSaveHarvest(newHarvest);
    setIsHarvestModalOpen(false);
  };

  const handlePalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === palletForm.lotId) || lots[0];

    const newPallet: TraceabilityPallet = {
      id: `pallet-${Date.now()}`,
      palletCode: palletForm.palletCode,
      lotId: lotObj?.id || 'geral',
      lotCode: lotObj?.lotCode || 'GERAL',
      cropName: lotObj?.cropName || 'Cultura Diversa',
      cultivarName: lotObj?.cultivarName || 'Padrão',
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
    <div className="space-y-4">
      {/* Header & Sub-tab Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Colheita, Classificação Comercial & Packing House
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Controle de pesagem, °Brix/firmeza, classificação e montagem de pallets em câmara fria
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLotFilter}
              onChange={e => setSelectedLotFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="all">Todos os Lotes ({lots.length})</option>
              {lots.map(l => (
                <option key={l.id} value={l.id}>
                  {l.lotCode} - {l.cropName}
                </option>
              ))}
            </select>

            {activeSubTab === 'colheitas' ? (
              <button
                type="button"
                onClick={handleOpenHarvestModal}
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Colheita
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenPalletModal}
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Montar Novo Pallet
              </button>
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('colheitas')}
            className={`h-8 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
              activeSubTab === 'colheitas'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Lançamentos de Colheita ({filteredHarvests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('pallets')}
            className={`h-8 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
              activeSubTab === 'pallets'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Pallets & Câmaras Frias ({filteredPallets.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'colheitas' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          {filteredHarvests.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <PackageCheck className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Nenhum lançamento de colheita registrado.
              </p>
              <button
                type="button"
                onClick={handleOpenHarvestModal}
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Primeira Colheita
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3.5">Data</th>
                    <th className="py-2.5 px-3.5">Lote</th>
                    <th className="py-2.5 px-3.5">Caixas</th>
                    <th className="py-2.5 px-3.5">Peso Líquido</th>
                    <th className="py-2.5 px-3.5">Classificação</th>
                    <th className="py-2.5 px-3.5">°Brix / Firmeza</th>
                    <th className="py-2.5 px-3.5">Packing House / Equipe</th>
                    <th className="py-2.5 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800">
                  {filteredHarvests.map(h => {
                    const lotObj = lots.find(l => l.id === h.lotId);
                    const isConfirming = confirmDeleteHarvestId === h.id;

                    return (
                      <tr key={h.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                        <td className="py-2.5 px-3.5 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap tabular-nums">
                          {new Date(h.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {h.lotCode}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold whitespace-nowrap tabular-nums">
                          {h.boxesCount} cx
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-zinc-100 whitespace-nowrap tabular-nums">
                          {h.netWeightKg.toLocaleString('pt-BR')} kg
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60">
                            {h.commercialClass}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                          {h.brixDegrees ? `${h.brixDegrees} °Brix` : '--'} •{' '}
                          {h.firmnessPressure ? `${h.firmnessPressure} lb` : '--'}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600 dark:text-zinc-400">
                          {h.destinationPackingHouse}
                          {h.harvesterTeam && (
                            <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{h.harvesterTeam}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            {lotObj && (
                              <button
                                type="button"
                                onClick={() => onOpenLabels(lotObj)}
                                className="h-7 w-7 inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md cursor-pointer"
                                title="Imprimir Etiquetas"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isConfirming ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteHarvest(h.id);
                                    setConfirmDeleteHarvestId(null);
                                  }}
                                  className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-medium cursor-pointer"
                                >
                                  Excluir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteHarvestId(null)}
                                  className="h-7 px-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-md text-[11px] font-medium cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteHarvestId(h.id)}
                                className="h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md cursor-pointer"
                                title="Excluir Colheita"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : filteredPallets.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
          <Layers className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Nenhum pallet montado ou estocado em câmara fria.
          </p>
          <button
            type="button"
            onClick={handleOpenPalletModal}
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Montar Primeiro Pallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPallets.map(pallet => {
            const isConfirming = confirmDeletePalletId === pallet.id;
            return (
              <div
                key={pallet.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800/60">
                      {pallet.palletCode}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 capitalize">
                      {pallet.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {pallet.cropName}{' '}
                      <span className="font-normal text-xs text-slate-500 dark:text-zinc-400">({pallet.cultivarName})</span>
                    </h4>
                    <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                      Lote: {pallet.lotCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300 p-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 tabular-nums">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Caixas</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100">{pallet.boxesCount} cx</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Peso Líquido</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {pallet.totalNetWeightKg.toLocaleString('pt-BR')} kg
                      </strong>
                    </div>
                    <div className="col-span-2 pt-1 flex items-center gap-1.5 text-[11px] text-sky-700 dark:text-sky-400 font-medium">
                      <Thermometer className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {pallet.coldChamberLocation || 'Câmara Fria'} ({pallet.storageTemperatureCelsius ?? '--'} °C)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  <span>Montagem: {new Date(pallet.assemblyDate).toLocaleDateString('pt-BR')}</span>
                  {isConfirming ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeletePallet(pallet.id);
                          setConfirmDeletePalletId(null);
                        }}
                        className="h-6 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-medium cursor-pointer"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePalletId(null)}
                        className="h-6 px-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-md text-[10px] font-medium cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePalletId(pallet.id)}
                      className="h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md cursor-pointer"
                      title="Excluir Pallet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Colheita */}
      {isHarvestModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsHarvestModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-xl w-full p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 my-6 text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Registrar Lançamento de Colheita
              </h3>
              <button
                type="button"
                onClick={() => setIsHarvestModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHarvestSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Lote</label>
                  <select
                    value={harvestForm.lotId}
                    onChange={e => setHarvestForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    {lots.length === 0 ? (
                      <option value="">Colheita Geral</option>
                    ) : (
                      lots.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.lotCode} - {l.cropName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Data da Colheita *</label>
                  <input
                    type="date"
                    value={harvestForm.date}
                    onChange={e => setHarvestForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Qtd Caixas *</label>
                  <input
                    type="number"
                    min={1}
                    value={harvestForm.boxesCount}
                    onChange={e => setHarvestForm(prev => ({ ...prev, boxesCount: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Peso / Caixa (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={harvestForm.boxWeightKg}
                    onChange={e => setHarvestForm(prev => ({ ...prev, boxWeightKg: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Classificação</label>
                  <select
                    value={harvestForm.commercialClass}
                    onChange={e => setHarvestForm(prev => ({ ...prev, commercialClass: e.target.value as CommercialClass }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    <option value="Extra AA">Extra AA</option>
                    <option value="Extra A">Extra A</option>
                    <option value="Especial">Especial</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Refugo">Refugo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Grau °Brix (Açúcar)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={harvestForm.brixDegrees}
                    onChange={e => setHarvestForm(prev => ({ ...prev, brixDegrees: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Firmeza da Polpa (lb/cm²)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={harvestForm.firmnessPressure}
                    onChange={e => setHarvestForm(prev => ({ ...prev, firmnessPressure: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Packing House / Destino</label>
                  <input
                    type="text"
                    value={harvestForm.destinationPackingHouse}
                    onChange={e => setHarvestForm(prev => ({ ...prev, destinationPackingHouse: e.target.value }))}
                    placeholder="Ex: Packing House Central"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Equipe de Colheita</label>
                  <input
                    type="text"
                    value={harvestForm.harvesterTeam}
                    onChange={e => setHarvestForm(prev => ({ ...prev, harvesterTeam: e.target.value }))}
                    placeholder="Ex: Equipe A - 6 pessoas"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsHarvestModalOpen(false)}
                  className="h-9 px-3.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
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
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsPalletModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-xl w-full p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 my-6 text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Montar e Identificar Pallet
              </h3>
              <button
                type="button"
                onClick={() => setIsPalletModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePalletSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Código do Pallet *</label>
                  <input
                    type="text"
                    value={palletForm.palletCode}
                    onChange={e => setPalletForm(prev => ({ ...prev, palletCode: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-mono font-semibold text-slate-900 dark:text-zinc-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Lote de Origem</label>
                  <select
                    value={palletForm.lotId}
                    onChange={e => setPalletForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    {lots.length === 0 ? (
                      <option value="">Pallet Geral</option>
                    ) : (
                      lots.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.lotCode} - {l.cropName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Quantidade de Caixas</label>
                  <input
                    type="number"
                    min={1}
                    value={palletForm.boxesCount}
                    onChange={e =>
                      setPalletForm(prev => ({
                        ...prev,
                        boxesCount: Number(e.target.value),
                        totalNetWeightKg: Number(e.target.value) * 20,
                      }))
                    }
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Peso Total Líquido (kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={palletForm.totalNetWeightKg}
                    onChange={e => setPalletForm(prev => ({ ...prev, totalNetWeightKg: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Local na Câmara Fria</label>
                  <input
                    type="text"
                    value={palletForm.coldChamberLocation}
                    onChange={e => setPalletForm(prev => ({ ...prev, coldChamberLocation: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Temperatura Alvo (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={palletForm.storageTemperatureCelsius}
                    onChange={e => setPalletForm(prev => ({ ...prev, storageTemperatureCelsius: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPalletModalOpen(false)}
                  className="h-9 px-3.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
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
