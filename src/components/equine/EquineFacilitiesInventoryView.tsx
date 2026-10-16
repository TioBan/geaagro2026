// @ts-nocheck
import React, { useState } from 'react';
import {
  Building2,
  Package,
  Sparkles,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  Layers,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  EquineFacility,
  EquineInventoryItem,
  EquineAnimal,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  facilities: EquineFacility[];
  inventory: EquineInventoryItem[];
  onAddFacility: (facility: EquineFacility) => void;
  onUpdateFacility: (facility: EquineFacility) => void;
  onAddInventoryItem: (item: EquineInventoryItem) => void;
  onUpdateInventoryItem: (item: EquineInventoryItem) => void;
}

export const EquineFacilitiesInventoryView: React.FC<Props> = ({
  animals,
  facilities,
  inventory,
  onAddFacility,
  onUpdateFacility,
  onAddInventoryItem,
  onUpdateInventoryItem,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'inventory'>('facilities');
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Facility Form State
  const [facilityForm, setFacilityForm] = useState<Partial<EquineFacility>>({
    name: 'Baia 05 - Garanhões',
    type: 'Baia Individual',
    dimensionsMeters: '4.0m x 4.0m (16m²)',
    beddingType: 'Maravalha de Pinus Tratada',
    currentOccupantAnimalId: '',
    hygieneStatus: 'Limpo / Desinfetado',
    lastCleanedDate: new Date().toISOString().split('T')[0],
    notes: 'Bebedouro automático e cocho em inox.',
  });

  // Inventory Form State
  const [inventoryForm, setInventoryForm] = useState<Partial<EquineInventoryItem>>({
    name: 'Feno Tifton 85 Especial (Fardos 12kg)',
    category: 'Feno & Volumoso',
    quantity: 120,
    unit: 'fardos',
    minimumQuantity: 30,
    costPerUnitBrl: 45,
    location: 'Galpão de Feno 01',
    expiryDate: '2026-12-31',
  });

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.name) return;

    const newFacility: EquineFacility = {
      ...(facilityForm as EquineFacility),
      id: `fac-${Date.now()}`,
    };
    onAddFacility(newFacility);
    setIsFacilityModalOpen(false);
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.name) return;

    const newItem: EquineInventoryItem = {
      ...(inventoryForm as EquineInventoryItem),
      id: `inv-${Date.now()}`,
    };
    onAddInventoryItem(newItem);
    setIsInventoryModalOpen(false);
  };

  const lowStockItems = inventory.filter(i => i.quantity <= i.minimumQuantity);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-700" /> Infraestrutura do Haras & Farmácia Veterinária
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Baias, Piquetes, Estoque de Insumos & Medicamentos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manejo de camas, desinfecção de instalações, saldo de ração, feno e farmácia equina
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'facilities' ? (
            <button
              onClick={() => setIsFacilityModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Instalação / Baia</span>
            </button>
          ) : (
            <button
              onClick={() => setIsInventoryModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Item de Estoque</span>
            </button>
          )}
        </div>
      </div>

      {/* Low stock warning banner */}
      {(lowStockItems || []).length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Atenção de Reposição:</strong> Existem <strong>{(lowStockItems || []).length} itens</strong> com estoque abaixo do nível mínimo de segurança (Ex: {lowStockItems[0]?.name}).
            </span>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg shrink-0 cursor-pointer"
          >
            Ver Almoxarifado
          </button>
        </div>
      )}

      {/* Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'facilities' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Instalações, Baias & Piquetes ({facilities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'inventory' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Almoxarifado & Farmácia Veterinária ({inventory.length})</span>
        </button>
      </div>

      {/* View 1: Facilities Grid */}
      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(fac => {
            const occupant = animals.find(a => a.id === fac.currentOccupantAnimalId);

            return (
              <div
                key={fac.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                      {fac.type}
                    </span>
                    <h3 className="font-black text-stone-900 text-sm">{fac.name}</h3>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    fac.hygieneStatus === 'Limpo / Desinfetado' ? 'bg-emerald-100 text-emerald-900' :
                    fac.hygieneStatus === 'Necessita Troca de Cama' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                  }`}>
                    {fac.hygieneStatus}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dimensões:</span>
                    <strong className="font-mono">{fac.dimensionsMeters}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Tipo de Cama:</span>
                    <strong className="truncate max-w-[160px]">{fac.beddingType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Última Higienização:</span>
                    <span className="font-mono">{new Date(fac.lastCleanedDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Occupant card */}
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Animal Alocado:</span>
                  {occupant ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">🐎</span>
                      <div>
                        <strong className="text-stone-900 block">{occupant.name}</strong>
                        <span className="text-[10px] text-stone-500">{occupant.breed} ({occupant.category})</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-stone-400 italic mt-0.5 block">Baia livre / Disponível</span>
                  )}
                </div>

                {fac.notes && (
                  <p className="text-[11px] text-stone-500 italic bg-amber-50/50 p-2 rounded-lg">
                    {fac.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Inventory Listing */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Catálogo de Produtos, Insumos & Farmácia
            </h3>
            <span className="text-xs font-bold text-stone-500">
              Valor Total em Estoque: R$ {inventory.reduce((sum, i) => sum + (i.quantity * i.costPerUnitBrl), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b">
                <tr>
                  <th className="p-3">Item / Fármaco</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Localização</th>
                  <th className="p-3">Saldo Atual</th>
                  <th className="p-3">Mínimo</th>
                  <th className="p-3">Validade</th>
                  <th className="p-3 text-right">Custo Unitário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventory.map(item => {
                  const isLow = item.quantity <= item.minimumQuantity;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="p-3 font-bold text-stone-900">
                        {item.name}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-800 border">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-stone-600">{item.location}</td>
                      <td className="p-3">
                        <span className={`font-mono font-black ${isLow ? 'text-red-700 bg-red-50 px-2 py-0.5 rounded-md' : 'text-stone-900'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-stone-500">{item.minimumQuantity} {item.unit}</td>
                      <td className="p-3 font-mono text-stone-600">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="p-3 text-right font-black font-mono text-stone-900">
                        R$ {item.costPerUnitBrl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Facility */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">Cadastrar Instalação / Baia</h3>
              </div>
              <button onClick={() => setIsFacilityModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Identificação da Instalação *</label>
                  <input
                    type="text"
                    required
                    value={facilityForm.name || ''}
                    onChange={e => setFacilityForm({ ...facilityForm, name: e.target.value })}
                    placeholder="Ex: Baia 05 - Garanhões"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tipo de Instalação</label>
                  <select
                    value={facilityForm.type}
                    onChange={e => setFacilityForm({ ...facilityForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Baia Individual">Baia Individual</option>
                    <option value="Baia Maternidade">Baia Maternidade</option>
                    <option value="Piquete de Lazer / Pasto">Piquete de Lazer / Pasto</option>
                    <option value="Redondel">Redondel</option>
                    <option value="Pista de Prova">Pista de Prova</option>
                    <option value="Ducha / Lavador">Ducha / Lavador</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dimensões (m²)</label>
                  <input
                    type="text"
                    value={facilityForm.dimensionsMeters || ''}
                    onChange={e => setFacilityForm({ ...facilityForm, dimensionsMeters: e.target.value })}
                    placeholder="Ex: 4.0m x 4.0m"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tipo de Cama</label>
                  <input
                    type="text"
                    value={facilityForm.beddingType || ''}
                    onChange={e => setFacilityForm({ ...facilityForm, beddingType: e.target.value })}
                    placeholder="Ex: Maravalha de Pinus"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Animal Alocado</label>
                  <select
                    value={facilityForm.currentOccupantAnimalId || ''}
                    onChange={e => setFacilityForm({ ...facilityForm, currentOccupantAnimalId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="">Nenhum (Baia Livre)</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Observações & Estrutura</label>
                <input
                  type="text"
                  value={facilityForm.notes || ''}
                  onChange={e => setFacilityForm({ ...facilityForm, notes: e.target.value })}
                  placeholder="Ex: Bebedouro tipo concha automático..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFacilityModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm">Adicionar Item ao Estoque</h3>
              </div>
              <button onClick={() => setIsInventoryModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Nome do Item / Medicamento *</label>
                  <input
                    type="text"
                    required
                    value={inventoryForm.name || ''}
                    onChange={e => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Categoria</label>
                  <select
                    value={inventoryForm.category}
                    onChange={e => setInventoryForm({ ...inventoryForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Ração Concentrada">Ração Concentrada</option>
                    <option value="Feno & Volumoso">Feno & Volumoso</option>
                    <option value="Medicamento & Sanidade">Medicamento & Sanidade</option>
                    <option value="Vacina">Vacina</option>
                    <option value="Ferradura & Podologia">Ferradura & Podologia</option>
                    <option value="Suplemento & Mineral">Suplemento & Mineral</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Localização no Haras</label>
                  <input
                    type="text"
                    value={inventoryForm.location || ''}
                    onChange={e => setInventoryForm({ ...inventoryForm, location: e.target.value })}
                    placeholder="Ex: Farmácia / Geladeira"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Quantidade em Estoque</label>
                  <input
                    type="number"
                    value={inventoryForm.quantity}
                    onChange={e => setInventoryForm({ ...inventoryForm, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Unidade de Medida</label>
                  <input
                    type="text"
                    value={inventoryForm.unit || ''}
                    onChange={e => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    placeholder="Ex: kg, frascos, fardos"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Estoque Mínimo de Segurança</label>
                  <input
                    type="number"
                    value={inventoryForm.minimumQuantity}
                    onChange={e => setInventoryForm({ ...inventoryForm, minimumQuantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inventoryForm.costPerUnitBrl}
                    onChange={e => setInventoryForm({ ...inventoryForm, costPerUnitBrl: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md cursor-pointer"
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
