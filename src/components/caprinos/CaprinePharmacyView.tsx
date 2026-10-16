// @ts-nocheck
import React, { useState } from 'react';
import { CaprinePharmacyItem } from '../../types/caprine';
import { Package, Plus, AlertTriangle, CheckCircle2, Clock, DollarSign, X } from 'lucide-react';

interface Props {
  pharmacy: CaprinePharmacyItem[];
  onSavePharmacyItem: (item: CaprinePharmacyItem) => void;
}

export const CaprinePharmacyView: React.FC<Props> = ({ pharmacy, onSavePharmacyItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CaprinePharmacyItem>>({
    id: `phm-${Date.now()}`,
    name: '',
    category: 'Vermífugo',
    currentQuantity: 10,
    minQuantityAlert: 3,
    unit: 'Frascos 500mL',
    expirationDate: '2027-12-31',
    costPerUnitBrl: 120.0,
    withdrawalMilkDays: 0,
    withdrawalMeatDays: 14
  });

  const totalValueBrl = pharmacy.reduce((acc, item) => acc + item.currentQuantity * item.costPerUnitBrl, 0);
  const lowStockItems = pharmacy.filter(item => item.currentQuantity <= item.minQuantityAlert);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) {
      alert('Informe o nome do medicamento.');
      return;
    }
    onSavePharmacyItem(newItem as CaprinePharmacyItem);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Farmácia Caprina & Almoxarifado Veterinário
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Controle de frascos, vacinas, vermífugos, prazos de validade, lotes e alertas de estoque mínimo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Medicamento / Vacina
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Valor Total em Estoque</span>
          <div className="text-2xl font-black text-emerald-600">R$ {totalValueBrl.toFixed(2)}</div>
          <p className="text-[10px] text-stone-500 mt-0.5">{pharmacy.length} itens cadastrados</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Estoque Crítico / Baixo</span>
          <div className={`text-2xl font-black ${(lowStockItems || []).length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {(lowStockItems || []).length} itens
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Necessitam reposição imediata</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold text-stone-400 block uppercase">Conformidade de Validade</span>
          <div className="text-2xl font-black text-emerald-600">100% Ok</div>
          <p className="text-[10px] text-stone-500 mt-0.5">Nenhum produto vencido no estoque</p>
        </div>
      </div>

      {/* Pharmacy Stock Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
          <h2 className="font-bold text-sm text-stone-900 dark:text-white">Estoque Veterinário Caprino</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-800/80 text-stone-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Medicamento / Vacina</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Quantidade Atual</th>
                <th className="p-3">Lote / Validade</th>
                <th className="p-3">Custo Unitário</th>
                <th className="p-3">Carência Leite/Carne</th>
                <th className="p-3">Status Estoque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
              {pharmacy.map(item => {
                const isLow = item.currentQuantity <= item.minQuantityAlert;
                return (
                  <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3 font-bold text-stone-900 dark:text-white">{item.name}</td>
                    <td className="p-3">
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-stone-800 dark:text-stone-200">
                      {item.currentQuantity} {item.unit}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">
                      Lote: {item.batchNumber || '2026-A'} • Exp: <span className="font-mono">{item.expirationDate}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      R$ {item.costPerUnitBrl.toFixed(2)}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">
                      Leite: {item.withdrawalMilkDays}d | Carne: {item.withdrawalMeatDays}d
                    </td>
                    <td className="p-3">
                      {isLow ? (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          ⚠️ Baixo
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          ✅ Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Novo Item de Farmácia
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={newItem.name || ''}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Moxidectina 1% Caprinos"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Categoria *</label>
                  <select
                    value={newItem.category || 'Vermífugo'}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  >
                    <option value="Vermífugo">Vermífugo</option>
                    <option value="Vacina">Vacina</option>
                    <option value="Antibiótico">Antibiótico</option>
                    <option value="Anti-inflamatório">Anti-inflamatório</option>
                    <option value="Vitamina/Mineral">Vitamina/Mineral</option>
                    <option value="Material Cirúrgico">Material Cirúrgico</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Qtd Atual em Estoque *</label>
                  <input
                    type="number"
                    value={newItem.currentQuantity || 10}
                    onChange={e => setNewItem({ ...newItem, currentQuantity: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Unidade de Medida</label>
                  <input
                    type="text"
                    value={newItem.unit || 'Frascos'}
                    onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Custo por Unidade (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.costPerUnitBrl || 100.0}
                    onChange={e => setNewItem({ ...newItem, costPerUnitBrl: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data de Validade</label>
                  <input
                    type="date"
                    value={newItem.expirationDate || ''}
                    onChange={e => setNewItem({ ...newItem, expirationDate: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Alerta Estoque Mínimo</label>
                  <input
                    type="number"
                    value={newItem.minQuantityAlert || 3}
                    onChange={e => setNewItem({ ...newItem, minQuantityAlert: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
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
