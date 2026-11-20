import React, { useState } from 'react';
import { CaprinePharmacyItem, CaprinePharmacyCategory } from '../../types/caprine';
import { Package, Plus, Minus, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface Props {
  pharmacy: CaprinePharmacyItem[];
  onSavePharmacyItem: (item: CaprinePharmacyItem) => void;
}

const PHARMACY_CATEGORIES: CaprinePharmacyCategory[] = [
  'Vermífugo',
  'Vacina',
  'Antibiótico',
  'Anti-inflamatório',
  'Vitamina/Mineral',
  'Material Cirúrgico'
];

function getQty(item: CaprinePharmacyItem): number {
  return item.currentQuantity ?? item.quantity ?? 0;
}

function getMinAlert(item: CaprinePharmacyItem): number {
  return item.minQuantityAlert ?? item.minStock ?? 0;
}

function getExpiry(item: CaprinePharmacyItem): string {
  return item.expirationDate || item.expiryDate || '';
}

export const CaprinePharmacyView: React.FC<Props> = ({ pharmacy, onSavePharmacyItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newItem, setNewItem] = useState<Partial<CaprinePharmacyItem>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  const totalValueBrl = pharmacy.reduce(
    (acc, item) => acc + getQty(item) * (item.costPerUnitBrl || 0),
    0
  );
  const lowStockItems = pharmacy.filter(item => getQty(item) <= getMinAlert(item));
  const expiredItems = pharmacy.filter(item => {
    const exp = getExpiry(item);
    return exp !== '' && exp < todayStr;
  });

  const handleOpenModal = () => {
    setFormError('');
    setNewItem({
      id: `phm-${Date.now()}`,
      name: '',
      category: 'Vermífugo',
      currentQuantity: 10,
      minQuantityAlert: 3,
      unit: 'Frascos 500mL',
      batchNumber: '',
      expirationDate: '2027-12-31',
      costPerUnitBrl: 120.0,
      withdrawalMilkDays: 0,
      withdrawalMeatDays: 14
    });
    setIsModalOpen(true);
  };

  const handleAdjustStock = (item: CaprinePharmacyItem, delta: number) => {
    const nextQty = Math.max(0, getQty(item) + delta);
    onSavePharmacyItem({
      ...item,
      currentQuantity: nextQty,
      quantity: nextQty
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name?.trim()) {
      setFormError('Informe o nome do medicamento ou vacina.');
      return;
    }
    const qty = newItem.currentQuantity ?? 0;
    const minAlert = newItem.minQuantityAlert ?? 3;
    const exp = newItem.expirationDate || '2027-12-31';

    onSavePharmacyItem({
      id: newItem.id || `phm-${Date.now()}`,
      name: newItem.name.trim(),
      category: (newItem.category as CaprinePharmacyCategory) || 'Vermífugo',
      currentQuantity: qty,
      quantity: qty,
      minQuantityAlert: minAlert,
      minStock: minAlert,
      unit: newItem.unit || 'Frascos',
      batchNumber: newItem.batchNumber || undefined,
      expirationDate: exp,
      expiryDate: exp,
      costPerUnitBrl: newItem.costPerUnitBrl ?? 0,
      withdrawalMilkDays: newItem.withdrawalMilkDays ?? 0,
      withdrawalMeatDays: newItem.withdrawalMeatDays ?? 0
    });
    setIsModalOpen(false);
    setFormError('');
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
            Farmácia Caprina &amp; Almoxarifado
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Controle de frascos, vacinas, vermífugos, lotes, validade e alertas de estoque mínimo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Item
        </button>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Valor em Estoque
          </span>
          <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            R$ {totalValueBrl.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {pharmacy.length} item(ns) cadastrado(s)
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Estoque Baixo
          </span>
          <div
            className={`text-lg font-semibold tabular-nums mt-0.5 ${
              lowStockItems.length > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {lowStockItems.length}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">
              item(ns)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Abaixo ou no limite mínimo
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Validade do Estoque
          </span>
          <div
            className={`text-lg font-semibold tabular-nums mt-0.5 ${
              expiredItems.length > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {expiredItems.length > 0 ? `${expiredItems.length} vencido(s)` : 'Em conformidade'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Verificação automática por data
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Estoque Veterinário
          </h2>
        </div>

        {pharmacy.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum medicamento ou vacina cadastrado na farmácia.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium">
                <tr>
                  <th className="px-4 py-2.5">Produto</th>
                  <th className="px-4 py-2.5">Categoria</th>
                  <th className="px-4 py-2.5">Quantidade</th>
                  <th className="px-4 py-2.5">Lote / Validade</th>
                  <th className="px-4 py-2.5 text-right">Custo Unit.</th>
                  <th className="px-4 py-2.5">Carência</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {pharmacy.map(item => {
                  const qty = getQty(item);
                  const isLow = qty <= getMinAlert(item);
                  const exp = getExpiry(item);
                  const isExpired = exp !== '' && exp < todayStr;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                        {item.name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400">
                        {item.category}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="inline-flex items-center gap-1.5 tabular-nums">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(item, -1)}
                            className="w-6 h-6 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                            title="Reduzir 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-medium text-slate-900 dark:text-zinc-100 min-w-[2.5rem] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(item, 1)}
                            className="w-6 h-6 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                            title="Adicionar 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {item.unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {item.batchNumber ? `Lote ${item.batchNumber} · ` : ''}
                        <span className={`font-mono ${isExpired ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}`}>
                          {exp || '--'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-zinc-100">
                        R$ {(item.costPerUnitBrl || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                        L: {item.withdrawalMilkDays}d · C: {item.withdrawalMeatDays}d
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Vencido
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Novo Item de Farmácia
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.name || ''}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Moxidectina 1% Caprinos"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={newItem.category || 'Vermífugo'}
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        category: e.target.value as CaprinePharmacyCategory
                      })
                    }
                    className={inputCls}
                  >
                    {PHARMACY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Qtd Atual *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.currentQuantity ?? 10}
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        currentQuantity: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={newItem.unit || ''}
                    onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                    className={inputCls}
                    placeholder="Frascos 500mL"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Custo Unit. (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.costPerUnitBrl ?? 0}
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        costPerUnitBrl: parseFloat(e.target.value) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Validade
                  </label>
                  <input
                    type="date"
                    value={newItem.expirationDate || ''}
                    onChange={e => setNewItem({ ...newItem, expirationDate: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minQuantityAlert ?? 3}
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        minQuantityAlert: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Lote
                  </label>
                  <input
                    type="text"
                    value={newItem.batchNumber || ''}
                    onChange={e => setNewItem({ ...newItem, batchNumber: e.target.value })}
                    className={`${inputCls} font-mono`}
                    placeholder="2026-A"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Car. Leite (d)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.withdrawalMilkDays ?? 0}
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        withdrawalMilkDays: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Car. Carne (d)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.withdrawalMeatDays ?? 0}
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        withdrawalMeatDays: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
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
