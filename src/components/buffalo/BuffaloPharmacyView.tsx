import React, { useMemo, useState } from 'react';
import { BuffaloPharmacyItem } from '../../types/buffalo';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  AlertTriangle,
  Package,
  Pencil,
} from 'lucide-react';

interface BuffaloPharmacyViewProps {
  pharmacy: BuffaloPharmacyItem[];
  onUpdatePharmacy: (items: BuffaloPharmacyItem[]) => void;
}

const CATEGORIES: BuffaloPharmacyItem['category'][] = [
  'Antibiótico',
  'Anti-inflamatório',
  'Vacina',
  'Antiparasitário',
  'Vitamina / Mineral',
  'Desinfetante / Teto',
  'Hormônio Reprodutivo',
];

const UNITS: BuffaloPharmacyItem['unit'][] = ['frascos', 'doses', 'litros', 'kg', 'ampolas'];

const STORAGE_OPTIONS: BuffaloPharmacyItem['storageConditions'][] = [
  'Temperatura Ambiente (15-30°C)',
  'Refrigerado (2-8°C)',
  'Proteger da Luz',
];

const emptyForm = (): Omit<BuffaloPharmacyItem, 'id'> => ({
  name: '',
  category: 'Antibiótico',
  activeIngredient: '',
  presentation: 'Frasco 100ml',
  stockQuantity: 10,
  minimumStock: 3,
  unit: 'frascos',
  unitCostBRL: 45,
  batchNumber: '',
  expirationDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  milkWithdrawalDays: 3,
  meatWithdrawalDays: 14,
  storageConditions: 'Temperatura Ambiente (15-30°C)',
  supplier: '',
});

export const BuffaloPharmacyView: React.FC<BuffaloPharmacyViewProps> = ({
  pharmacy,
  onUpdatePharmacy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BuffaloPharmacyItem, 'id'>>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const nowTs = Date.now();

  const metrics = useMemo(() => {
    let totalValue = 0;
    let lowStockCount = 0;
    let expiringCount = 0;

    for (const item of pharmacy) {
      totalValue += item.stockQuantity * item.unitCostBRL;
      if (item.stockQuantity <= item.minimumStock) lowStockCount += 1;
      const expTs = Date.parse(item.expirationDate);
      if (!Number.isNaN(expTs) && expTs <= nowTs + 60 * 86400000) {
        expiringCount += 1;
      }
    }

    return {
      totalItems: pharmacy.length,
      totalValue,
      lowStockCount,
      expiringCount,
    };
  }, [pharmacy, nowTs]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return pharmacy.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.activeIngredient.toLowerCase().includes(q) ||
        item.batchNumber.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'todas' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [pharmacy, searchTerm, categoryFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: BuffaloPharmacyItem) => {
    setEditingId(item.id);
    const { id: _id, ...rest } = item;
    setForm(rest);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.activeIngredient.trim()) {
      setFormError('Informe o nome comercial e o princípio ativo do insumo.');
      return;
    }

    if (editingId) {
      onUpdatePharmacy(
        pharmacy.map((item) => (item.id === editingId ? { ...form, id: editingId } : item))
      );
    } else {
      const newItem: BuffaloPharmacyItem = {
        ...form,
        id: `pharm-${Date.now()}`,
      };
      onUpdatePharmacy([newItem, ...pharmacy]);
    }
    setIsModalOpen(false);
  };

  const handleAdjustStock = (id: string, delta: number) => {
    onUpdatePharmacy(
      pharmacy.map((item) =>
        item.id === id ? { ...item, stockQuantity: Math.max(0, item.stockQuantity + delta) } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    onUpdatePharmacy(pharmacy.filter((item) => item.id !== id));
    setConfirmDeleteId(null);
  };

  const getExpirationStatus = (dateStr: string) => {
    const expTs = Date.parse(dateStr);
    if (Number.isNaN(expTs)) return 'ok';
    if (expTs < nowTs) return 'expired';
    if (expTs <= nowTs + 60 * 86400000) return 'soon';
    return 'ok';
  };

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Itens em Farmácia</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {metrics.totalItems}
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Capital em Estoque</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {metrics.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Estoque Mínimo / Baixo</span>
          <p
            className={`text-lg font-semibold tabular-nums mt-0.5 ${
              metrics.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {metrics.lowStockCount}
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Validade Crítica (&le;60d)</span>
          <p
            className={`text-lg font-semibold tabular-nums mt-0.5 ${
              metrics.expiringCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {metrics.expiringCount}
          </p>
        </div>
      </div>

      {/* Barra de Busca e Ações */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar medicamento, princípio ativo, lote ou fornecedor..."
              className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
          >
            <option value="todas">Todas as categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Insumo
        </button>
      </div>

      {/* Tabela de Estoque */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhum item de farmácia encontrado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  <th className="py-2.5 px-3.5">Medicamento / Insumo</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Estoque</th>
                  <th className="py-2.5 px-3">Lote &amp; Validade</th>
                  <th className="py-2.5 px-3">Carência (Leite / Carne)</th>
                  <th className="py-2.5 px-3 text-right">Custo Unit.</th>
                  <th className="py-2.5 px-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {filteredItems.map((item) => {
                  const isLow = item.stockQuantity <= item.minimumStock;
                  const expStatus = getExpirationStatus(item.expirationDate);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-2.5 px-3.5">
                        <p className="font-semibold text-slate-900 dark:text-zinc-100">{item.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {item.activeIngredient} • {item.presentation}
                        </p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] rounded">
                          {item.category}
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          {item.storageConditions}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(item.id, -1)}
                            className="h-6 w-6 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                            title="Baixar 1 unidade"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            className={`min-w-[4.5rem] text-center font-semibold ${
                              isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-zinc-100'
                            }`}
                          >
                            {item.stockQuantity} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(item.id, 1)}
                            className="h-6 w-6 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                            title="Adicionar 1 unidade"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          Mínimo: {item.minimumStock} {item.unit}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">
                        <p className="text-slate-800 dark:text-zinc-200">Lote: {item.batchNumber || '—'}</p>
                        <p
                          className={`text-[11px] inline-flex items-center gap-1 ${
                            expStatus === 'expired'
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : expStatus === 'soon'
                              ? 'text-amber-600 dark:text-amber-400 font-medium'
                              : 'text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {(expStatus === 'expired' || expStatus === 'soon') && (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          Val.: {item.expirationDate}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-700 dark:text-zinc-300">
                        <span>{item.milkWithdrawalDays}d leite</span>
                        <span className="text-slate-300 dark:text-zinc-700 mx-1">/</span>
                        <span>{item.meatWithdrawalDays}d carne</span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium text-slate-900 dark:text-zinc-100">
                        {item.unitCostBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                            title="Editar item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteId === item.id ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium cursor-pointer"
                            >
                              Confirmar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center justify-center text-slate-500 dark:text-zinc-400 cursor-pointer"
                              title="Excluir item"
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

      {/* Modal Novo / Editar Insumo */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-xl w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {editingId ? 'Editar Insumo Veterinário' : 'Cadastrar Insumo Veterinário'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3">
              {formError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Nome Comercial *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Oxitetraciclina LA 20%"
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Princípio Ativo *
                  </label>
                  <input
                    type="text"
                    value={form.activeIngredient}
                    onChange={(e) => setForm({ ...form, activeIngredient: e.target.value })}
                    placeholder="Ex: Oxitetraciclina"
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as BuffaloPharmacyItem['category'] })
                    }
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Apresentação
                  </label>
                  <input
                    type="text"
                    value={form.presentation}
                    onChange={(e) => setForm({ ...form, presentation: e.target.value })}
                    placeholder="Frasco 100ml"
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Unidade
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value as BuffaloPharmacyItem['unit'] })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Qtd. Atual
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Estoque Mín.
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minimumStock}
                    onChange={(e) => setForm({ ...form, minimumStock: Number(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Custo Unit. (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.unitCostBRL}
                    onChange={(e) => setForm({ ...form, unitCostBRL: Number(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Validade
                  </label>
                  <input
                    type="date"
                    value={form.expirationDate}
                    onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Lote
                  </label>
                  <input
                    type="text"
                    value={form.batchNumber}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                    placeholder="LT-2026-01"
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Carência Leite (d)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.milkWithdrawalDays}
                    onChange={(e) => setForm({ ...form, milkWithdrawalDays: Number(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Carência Carne (d)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.meatWithdrawalDays}
                    onChange={(e) => setForm({ ...form, meatWithdrawalDays: Number(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    placeholder="Agropecuária"
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Armazenamento
                </label>
                <select
                  value={form.storageConditions}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      storageConditions: e.target.value as BuffaloPharmacyItem['storageConditions'],
                    })
                  }
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                >
                  {STORAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg cursor-pointer"
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
