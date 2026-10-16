import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Package,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Search,
} from 'lucide-react';
import {
  SwineFeedInventoryItem,
} from '../../types/swine';

interface SwineInventoryViewProps {
  items: SwineFeedInventoryItem[];
  onAddItem: (item: SwineFeedInventoryItem) => void;
  onUpdateItem: (item: SwineFeedInventoryItem) => void;
}

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
  const [costPerUnit, setCostPerUnit] = useState(85.0);
  const [storageLocation, setStorageLocation] = useState('Farmácia Veterinária');
  const [supplier, setSupplier] = useState('Bayer Animal Health');
  const [expirationDate, setExpirationDate] = useState('2026-12-31');

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockItems = items.filter(i => i.currentStock <= i.minimumStock);
  const totalStockValue = items.reduce((acc, i) => acc + i.currentStock * i.costPerUnit, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: SwineFeedInventoryItem = {
      id: `inv_${Date.now()}`,
      name: name.trim(),
      category,
      currentStock: Number(currentStock),
      unit,
      minimumStock: Number(minimumStock),
      costPerUnit: Number(costPerUnit),
      supplier,
      storageLocation,
      expirationDate,
    };

    onAddItem(newItem);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <span>Almoxarifado, Farmácia & Insumos da Granja</span>
          </h2>
          <p className="text-xs text-gray-500">
            Controle de estoque de rações, doses de sêmen, medicamentos veterinários, vacinas e desinfetantes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Insumo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Total de Itens</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{(items || []).length}</div>
          <span className="text-[11px] text-gray-400">Produtos cadastrados</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Alertas de Reposição</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{(lowStockItems || []).length}</div>
          <span className="text-[11px] text-amber-600 font-medium">Abaixo do estoque mínimo</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Valor Imobilizado</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Patrimônio em estoque</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Status Sanitário</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">100% OK</div>
          <span className="text-[11px] text-gray-400">Validades vigentes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do insumo ou fornecedor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">Todas as Categorias</option>
          <option value="Ração Pronta">Rações</option>
          <option value="Medicamento">Medicamentos</option>
          <option value="Vacina">Vacinas</option>
          <option value="Desinfetante">Desinfetantes</option>
          <option value="Dose de Sêmen">Doses de Sêmen</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Insumo</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Estoque Atual</th>
                <th className="p-3.5">Mínimo</th>
                <th className="p-3.5">Custo Unitário</th>
                <th className="p-3.5">Localização</th>
                <th className="p-3.5">Validade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map(item => {
                const isLow = item.currentStock <= item.minimumStock;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="p-3.5 font-bold text-gray-900">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{item.supplier}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-bold text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">
                        {item.currentStock} {item.unit}
                      </div>
                      {isLow && (
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Estoque Baixo
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-gray-600">
                      {item.minimumStock} {item.unit}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">
                      R$ {item.costPerUnit.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-gray-600">{item.storageLocation}</td>
                    <td className="p-3.5 text-gray-600">{item.expirationDate || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Cadastrar Insumo / Produto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tulatromicina 100mg"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Medicamento">Medicamento</option>
                    <option value="Vacina">Vacina</option>
                    <option value="Ração Pronta">Ração Pronta</option>
                    <option value="Milho / Grão">Milho / Grão</option>
                    <option value="Farelo de Soja">Farelo de Soja</option>
                    <option value="Núcleo / Premix">Núcleo / Premix</option>
                    <option value="Desinfetante">Desinfetante</option>
                    <option value="Dose de Sêmen">Dose de Sêmen</option>
                    <option value="Material de Manejo">Material de Manejo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Unidade</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Qtd Atual</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={e => setCurrentStock(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={e => setMinimumStock(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPerUnit}
                    onChange={e => setCostPerUnit(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Fornecedor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Localização</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={e => setStorageLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
