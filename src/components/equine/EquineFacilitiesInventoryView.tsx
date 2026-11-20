import React, { useState, useMemo } from 'react';
import {
  Building2,
  Package,
  Plus,
  AlertTriangle,
  X,
  CheckCircle2,
  Minus,
} from 'lucide-react';
import {
  EquineFacility,
  EquineInventoryItem,
  EquineAnimal,
} from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals: EquineAnimal[];
  facilities: EquineFacility[];
  inventory: EquineInventoryItem[];
  onAddFacility: (facility: EquineFacility) => void;
  onUpdateFacility: (facility: EquineFacility) => void;
  onAddInventoryItem: (item: EquineInventoryItem) => void;
  onUpdateInventoryItem: (item: EquineInventoryItem) => void;
}

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineFacilitiesInventoryView: React.FC<Props> = ({
  animals,
  facilities,
  inventory,
  onAddFacility,
  onUpdateFacility,
  onAddInventoryItem,
  onUpdateInventoryItem,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeFacilities = useMemo(() => (facilities || []).filter(f => f && f.id), [facilities]);
  const safeInventory = useMemo(() => (inventory || []).filter(i => i && i.id), [inventory]);

  const [activeTab, setActiveTab] = useState<'facilities' | 'inventory'>('facilities');
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'Baia Individual',
    dimensionsMeters: '4.0m x 4.0m',
    beddingType: 'Maravalha de Pinus',
    occupantId: '',
    hygieneStatus: 'Limpo / Desinfetado',
    notes: '',
  });

  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'Feno / Volumoso',
    quantity: 50,
    unit: 'fardos',
    minThreshold: 15,
    unitCostBrl: 45,
    location: 'Galpão Principal',
    expiryDate: '',
  });

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.name.trim()) return;

    const newFacility: EquineFacility = {
      id: `fac-${Date.now()}`,
      name: facilityForm.name.trim(),
      type: facilityForm.type,
      dimensionsMeters: facilityForm.dimensionsMeters,
      beddingType: facilityForm.beddingType,
      currentAnimalIds: facilityForm.occupantId ? [facilityForm.occupantId] : [],
      currentOccupantAnimalId: facilityForm.occupantId || undefined,
      capacityAnimals: 1,
      currentOccupancy: facilityForm.occupantId ? 1 : 0,
      status: facilityForm.occupantId ? 'Ocupado' : 'Disponível / Livre',
      hygieneStatus: facilityForm.hygieneStatus,
      lastCleanedDate: new Date().toISOString().split('T')[0],
      notes: facilityForm.notes,
    };

    onAddFacility(newFacility);
    setFacilityForm({ ...facilityForm, name: '', notes: '' });
    setIsFacilityModalOpen(false);
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.name.trim()) return;

    const newItem: EquineInventoryItem = {
      id: `inv-${Date.now()}`,
      name: inventoryForm.name.trim(),
      category: inventoryForm.category,
      quantity: Number(inventoryForm.quantity) || 0,
      unit: inventoryForm.unit.trim() || 'unidade',
      minThreshold: Number(inventoryForm.minThreshold) || 0,
      unitCostBrl: Number(inventoryForm.unitCostBrl) || 0,
      location: inventoryForm.location.trim() || 'Almoxarifado',
      expiryDate: inventoryForm.expiryDate || undefined,
    };

    onAddInventoryItem(newItem);
    setInventoryForm({ ...inventoryForm, name: '' });
    setIsInventoryModalOpen(false);
  };

  const handleMarkCleaned = (fac: EquineFacility) => {
    onUpdateFacility({
      ...fac,
      hygieneStatus: 'Limpo / Desinfetado',
      lastCleanedDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleAdjustStock = (item: EquineInventoryItem, delta: number) => {
    onUpdateInventoryItem({
      ...item,
      quantity: Math.max(0, Number((item.quantity + delta).toFixed(2))),
    });
  };

  const lowStockItems = safeInventory.filter(i => {
    const min = i.minThreshold ?? i.minimumQuantity ?? 0;
    return i.quantity <= min;
  });

  const totalInventoryValue = safeInventory.reduce((sum, i) => {
    const unitCost = i.unitCostBrl ?? i.costPerUnitBrl ?? 0;
    return sum + i.quantity * unitCost;
  }, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Instalações, Baias & Almoxarifado</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Alocação de animais, higienização de baias, feno, ração e farmácia veterinária
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'facilities' ? (
            <button
              type="button"
              onClick={() => setIsFacilityModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Instalação</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsInventoryModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Item de Estoque</span>
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Reposição necessária:</strong> {lowStockItems.length} item(ns) no limite mínimo (ex.: {lowStockItems[0]?.name}).
            </span>
          </div>
          {activeTab !== 'inventory' && (
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="h-7 px-2.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium shrink-0 cursor-pointer"
            >
              Ver Estoque
            </button>
          )}
        </div>
      )}

      {/* Switcher */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('facilities')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'facilities'
              ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
              : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Baias & Piquetes ({safeFacilities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
              : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Almoxarifado & Farmácia ({safeInventory.length})</span>
        </button>
      </div>

      {/* View 1: Facilities */}
      {activeTab === 'facilities' && (
        <>
          {safeFacilities.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma baia, piquete ou instalação cadastrada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeFacilities.map(fac => {
                const occupantId = fac.currentAnimalIds?.[0] || fac.currentOccupantAnimalId;
                const occupant = safeAnimals.find(a => a.id === occupantId);
                const hygiene = fac.hygieneStatus || fac.status || 'Limpo / Desinfetado';

                return (
                  <div
                    key={fac.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                        <div className="min-w-0">
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {fac.type}
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                            {fac.name}
                          </h3>
                        </div>
                        <span
                          className={`text-[11px] font-medium shrink-0 ${
                            hygiene.includes('Limpo') || hygiene.includes('Disponível')
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {hygiene}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 dark:text-zinc-400">Dimensões</span>
                          <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                            {fac.dimensionsMeters || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 dark:text-zinc-400">Cama</span>
                          <span className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                            {fac.beddingType || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 dark:text-zinc-400">Última Limpeza</span>
                          <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                            {fac.lastCleanedDate
                              ? new Date(fac.lastCleanedDate).toLocaleDateString('pt-BR')
                              : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1">
                          Animal Alocado
                        </span>
                        {occupant ? (
                          <div className="flex items-center gap-2">
                            <EquinoIcon className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                                {occupant.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                {occupant.breed}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-500">Baia livre / disponível</span>
                        )}
                      </div>

                      {fac.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">{fac.notes}</p>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleMarkCleaned(fac)}
                        className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Registrar Higienização</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* View 2: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Insumos, Volumosos & Farmácia Veterinária
            </h3>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-300 tabular-nums">
              Valor em Estoque:{' '}
              <strong className="text-slate-900 dark:text-zinc-100">
                R$ {totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          {safeInventory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum item de estoque cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Item / Fármaco</th>
                    <th className="px-4 py-2.5 font-medium">Categoria</th>
                    <th className="px-4 py-2.5 font-medium">Local</th>
                    <th className="px-4 py-2.5 font-medium">Saldo</th>
                    <th className="px-4 py-2.5 font-medium">Mínimo</th>
                    <th className="px-4 py-2.5 font-medium">Validade</th>
                    <th className="px-4 py-2.5 font-medium text-right">Custo Unit.</th>
                    <th className="px-4 py-2.5 font-medium text-right">Ajuste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                  {safeInventory.map(item => {
                    const min = item.minThreshold ?? item.minimumQuantity ?? 0;
                    const unitCost = item.unitCostBrl ?? item.costPerUnitBrl ?? 0;
                    const isLow = item.quantity <= min;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                          {item.name}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400">
                          {item.category}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400">
                          {item.location}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`font-semibold ${
                              isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-zinc-100'
                            }`}
                          >
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400">
                          {min} {item.unit}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-zinc-100">
                          R$ {unitCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(item, -1)}
                              title="Baixar 1 unidade"
                              className="h-6 w-6 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(item, 1)}
                              title="Adicionar 1 unidade"
                              className="h-6 w-6 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
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
      )}

      {/* Modal: New Facility */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Instalação / Baia
              </h3>
              <button
                type="button"
                onClick={() => setIsFacilityModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Identificação *</label>
                  <input
                    type="text"
                    required
                    value={facilityForm.name}
                    onChange={e => setFacilityForm({ ...facilityForm, name: e.target.value })}
                    placeholder="Ex: Baia 05 — Garanhões"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Tipo</label>
                  <select
                    value={facilityForm.type}
                    onChange={e => setFacilityForm({ ...facilityForm, type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Baia Individual">Baia Individual</option>
                    <option value="Baia Maternidade">Baia Maternidade</option>
                    <option value="Piquete com Pastagem">Piquete com Pastagem</option>
                    <option value="Redondel">Redondel</option>
                    <option value="Pista de Treinamento">Pista de Treinamento</option>
                    <option value="Duchador / Lavador">Duchador / Lavador</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Dimensões</label>
                  <input
                    type="text"
                    value={facilityForm.dimensionsMeters}
                    onChange={e => setFacilityForm({ ...facilityForm, dimensionsMeters: e.target.value })}
                    placeholder="Ex: 4.0m x 4.0m"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Tipo de Cama</label>
                  <input
                    type="text"
                    value={facilityForm.beddingType}
                    onChange={e => setFacilityForm({ ...facilityForm, beddingType: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Animal Alocado</label>
                  <select
                    value={facilityForm.occupantId}
                    onChange={e => setFacilityForm({ ...facilityForm, occupantId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Nenhum (Livre)</option>
                    {safeAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <input
                  type="text"
                  value={facilityForm.notes}
                  onChange={e => setFacilityForm({ ...facilityForm, notes: e.target.value })}
                  placeholder="Bebedouro automático, cocho, ventilação..."
                  className={inputCls}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFacilityModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Instalação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Inventory Item */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Adicionar Item ao Estoque
              </h3>
              <button
                type="button"
                onClick={() => setIsInventoryModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Nome do Item / Medicamento *</label>
                  <input
                    type="text"
                    required
                    value={inventoryForm.name}
                    onChange={e => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                    placeholder="Ex: Feno Tifton 85 (Fardos 12 kg)"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Categoria</label>
                  <select
                    value={inventoryForm.category}
                    onChange={e => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Ração / Concentrado">Ração / Concentrado</option>
                    <option value="Feno / Volumoso">Feno / Volumoso</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Vacina / Soro">Vacina / Soro</option>
                    <option value="Suplemento / Mineral">Suplemento / Mineral</option>
                    <option value="Ferradura / Cravo">Ferradura / Cravo</option>
                    <option value="Arreio / Equipamento">Arreio / Equipamento</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Localização</label>
                  <input
                    type="text"
                    value={inventoryForm.location}
                    onChange={e => setInventoryForm({ ...inventoryForm, location: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Quantidade Atual</label>
                  <input
                    type="number"
                    value={inventoryForm.quantity}
                    onChange={e => setInventoryForm({ ...inventoryForm, quantity: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Unidade</label>
                  <input
                    type="text"
                    value={inventoryForm.unit}
                    onChange={e => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    placeholder="kg, fardos, frascos..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Estoque Mínimo</label>
                  <input
                    type="number"
                    value={inventoryForm.minThreshold}
                    onChange={e => setInventoryForm({ ...inventoryForm, minThreshold: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inventoryForm.unitCostBrl}
                    onChange={e => setInventoryForm({ ...inventoryForm, unitCostBrl: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Data de Validade (Opcional)</label>
                  <input
                    type="date"
                    value={inventoryForm.expiryDate}
                    onChange={e => setInventoryForm({ ...inventoryForm, expiryDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
