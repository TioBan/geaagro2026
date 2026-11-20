import React, { useMemo, useState } from 'react';
import { Boxes, Plus, AlertTriangle, Search, Minus, X } from 'lucide-react';
import { SwineFeedInventoryItem } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  formatBrDate,
  formatCurrencyBRL,
  useEscapeClose,
} from './swineUi';

interface SwineInventoryViewProps {
  items: SwineFeedInventoryItem[];
  onAddItem: (item: SwineFeedInventoryItem) => void;
  onUpdateItem: (item: SwineFeedInventoryItem) => void;
}

const INVENTORY_CATEGORIES: SwineFeedInventoryItem['category'][] = [
  'Ração Pronta',
  'Milho / Grão',
  'Farelo de Soja',
  'Núcleo / Premix',
  'Medicamento',
  'Vacina',
  'Desinfetante',
  'Dose de Sêmen',
  'Material de Manejo',
];

export const SwineInventoryView: React.FC<SwineInventoryViewProps> = ({
  items,
  onAddItem,
  onUpdateItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SwineFeedInventoryItem['category']>('Medicamento');
  const [currentStock, setCurrentStock] = useState(10);
  const [unit, setUnit] = useState<SwineFeedInventoryItem['unit']>('frascos');
  const [minimumStock, setMinimumStock] = useState(5);
  const [costPerUnit, setCostPerUnit] = useState(85);
  const [storageLocation, setStorageLocation] = useState('Farmácia Veterinária');
  const [supplier, setSupplier] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter(i => {
      const matchesSearch =
        !term ||
        i.name.toLowerCase().includes(term) ||
        i.supplier.toLowerCase().includes(term);
      const matchesCat = selectedCategory === 'all' || i.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [items, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    const lowStock = items.filter(i => i.currentStock <= i.minimumStock).length;
    const totalValue = items.reduce((acc, i) => acc + i.currentStock * i.costPerUnit, 0);
    const today = Date.now();
    const expired = items.filter(i => {
      if (!i.expirationDate) return false;
      const exp = new Date(i.expirationDate).getTime();
      return Number.isFinite(exp) && exp < today;
    }).length;
    return { lowStock, totalValue, expired };
  }, [items]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newItem: SwineFeedInventoryItem = {
      id: `inv_${Date.now()}`,
      name: name.trim(),
      category,
      currentStock: Math.max(0, Number(currentStock) || 0),
      unit,
      minimumStock: Math.max(0, Number(minimumStock) || 0),
      costPerUnit: Math.max(0, Number(costPerUnit) || 0),
      supplier: supplier.trim() || 'Fornecedor não informado',
      storageLocation: storageLocation.trim() || 'Almoxarifado',
      expirationDate: expirationDate || undefined,
    };

    onAddItem(newItem);
    setName('');
    setSupplier('');
    setExpirationDate('');
    setIsModalOpen(false);
  };

  const adjustStock = (item: SwineFeedInventoryItem, delta: number) => {
    onUpdateItem({
      ...item,
      currentStock: Math.max(0, Number((item.currentStock + delta).toFixed(2))),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Boxes className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Almoxarifado, Farmácia & Insumos</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Estoque de rações, medicamentos, vacinas, doses de sêmen e desinfetantes com alertas de reposição.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Insumo</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Total de Itens
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {items.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">produtos cadastrados</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Alertas de Reposição
          </span>
          <div
            className={`text-xl font-bold mt-0.5 tabular-nums ${
              stats.lowStock > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {stats.lowStock}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">no estoque mínimo</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Valor em Estoque
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {formatCurrencyBRL(stats.totalValue)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">capital imobilizado</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Validade
          </span>
          <div
            className={`text-xl font-bold mt-0.5 tabular-nums ${
              stats.expired > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {items.length === 0 ? '—' : stats.expired > 0 ? `${stats.expired} venc.` : 'Regular'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">controle de vencimento</span>
        </div>
      </div>

      {/* Filters */}
      <div className={`${SWINE_CARD_CLASS} p-3 flex flex-col sm:flex-row gap-2.5`}>
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar insumo ou fornecedor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`${SWINE_INPUT_CLASS} pl-8`}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className={`${SWINE_INPUT_CLASS} sm:w-52`}
        >
          <option value="all">Todas as categorias</option>
          {INVENTORY_CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={`${SWINE_CARD_CLASS} overflow-hidden`}>
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center space-y-1.5">
            <Boxes className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhum insumo encontrado
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Cadastre rações, medicamentos ou vacinas para controlar entradas e estoque mínimo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
                <tr>
                  <th className="px-3.5 py-2.5">Insumo</th>
                  <th className="px-3.5 py-2.5">Categoria</th>
                  <th className="px-3.5 py-2.5">Estoque</th>
                  <th className="px-3.5 py-2.5">Mínimo</th>
                  <th className="px-3.5 py-2.5">Custo Unit.</th>
                  <th className="px-3.5 py-2.5">Local / Validade</th>
                  <th className="px-3.5 py-2.5 text-right">Ajuste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredItems.map(item => {
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium text-slate-900 dark:text-zinc-100">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {item.supplier}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-medium text-slate-700 dark:text-zinc-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                          {item.currentStock} {item.unit}
                        </div>
                        {isLow && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Baixo
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 dark:text-zinc-400 tabular-nums">
                        {item.minimumStock} {item.unit}
                      </td>
                      <td className="px-3.5 py-2.5 font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatCurrencyBRL(item.costPerUnit)}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 dark:text-zinc-400">
                        <div>{item.storageLocation}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                          Val.: {item.expirationDate ? formatBrDate(item.expirationDate) : '—'}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => adjustStock(item, -1)}
                            className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                            title="Baixar 1 unidade"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustStock(item, 1)}
                            className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 cursor-pointer"
                            title="Adicionar 1 unidade"
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

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Insumo / Produto
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={SWINE_LABEL_CLASS}>Nome do Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tulatromicina 100 mg"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Categoria</label>
                  <select
                    value={category}
                    onChange={e =>
                      setCategory(e.target.value as SwineFeedInventoryItem['category'])
                    }
                    className={SWINE_INPUT_CLASS}
                  >
                    {INVENTORY_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Unidade</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as SwineFeedInventoryItem['unit'])}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="frascos">Frascos</option>
                    <option value="kg">kg</option>
                    <option value="ton">Toneladas</option>
                    <option value="doses">Doses</option>
                    <option value="L">Litros</option>
                    <option value="unidades">Unidades</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Qtd Atual</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={currentStock}
                    onChange={e => setCurrentStock(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Estoque Mín.</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={minimumStock}
                    onChange={e => setMinimumStock(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Custo Unit. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPerUnit}
                    onChange={e => setCostPerUnit(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Fornecedor</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Localização</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={e => setStorageLocation(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Validade</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={e => setExpirationDate(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={SWINE_SECONDARY_BTN_CLASS}
                >
                  Cancelar
                </button>
                <button type="submit" className={SWINE_PRIMARY_BTN_CLASS}>
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
