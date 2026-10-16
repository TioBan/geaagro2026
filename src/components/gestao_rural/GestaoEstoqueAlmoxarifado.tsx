import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { ItemEstoqueRural, FornecedorRural, CompraInsumoRecord } from '../../types/gestaoRural';

interface GestaoEstoqueAlmoxarifadoProps {
  estoque: ItemEstoqueRural[];
  fornecedores: FornecedorRural[];
  compras: CompraInsumoRecord[];
  onAddEstoqueItem: (item: ItemEstoqueRural) => void;
  onAddMovimentacao: (
    itemId: string,
    tipo: 'entrada' | 'saida',
    quantidade: number,
    motivo: string
  ) => void;
}

export const GestaoEstoqueAlmoxarifado: React.FC<GestaoEstoqueAlmoxarifadoProps> = ({
  estoque,
  fornecedores,
  compras,
  onAddEstoqueItem,
  onAddMovimentacao,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const [newItem, setNewItem] = useState<Partial<ItemEstoqueRural>>({
    codigo: `INS-0${estoque.length + 1}`,
    nome: '',
    categoria: 'Fertilizantes',
    lote: 'LT-2026-01',
    dataValidade: '2027-12-31',
    fornecedorNome: fornecedores[0]?.nomeEmpresa || 'Fornecedor Padrão',
    quantidadeAtual: 1000,
    unidadeMedida: 'kg',
    precoUnitarioR$: 3.5,
    estoqueMinimo: 200,
    localArmazenamento: 'Galpão Principal A',
    statusAlerta: 'normal',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nome || !newItem.quantidadeAtual) return;

    const created: ItemEstoqueRural = {
      id: `est-${Date.now()}`,
      codigo: newItem.codigo || `INS-${Date.now()}`,
      nome: newItem.nome,
      categoria: (newItem.categoria as any) || 'Fertilizantes',
      lote: newItem.lote || 'LOTE-DEFAULT',
      dataValidade: newItem.dataValidade || '2027-12-31',
      fornecedorNome: newItem.fornecedorNome || 'Fornecedor Padrão',
      quantidadeAtual: Number(newItem.quantidadeAtual) || 0,
      unidadeMedida: (newItem.unidadeMedida as any) || 'kg',
      precoUnitarioR$: Number(newItem.precoUnitarioR$) || 0,
      estoqueMinimo: Number(newItem.estoqueMinimo) || 100,
      localArmazenamento: newItem.localArmazenamento || 'Almoxarifado Sede',
      statusAlerta: 'normal',
      historicoMovimentacao: [
        {
          id: `m-${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          tipo: 'entrada',
          quantidade: Number(newItem.quantidadeAtual) || 0,
          motivo: 'Cadastro Inicial no Sistema ERP',
        },
      ],
    };

    onAddEstoqueItem(created);
    setShowAddModal(false);
  };

  const CATEGORIAS = [
    'TODOS',
    'Fertilizantes',
    'Defensivos',
    'Sementes',
    'Combustíveis',
    'Lubrificantes',
    'Peças',
    'EPIs',
    'Ferramentas',
  ];

  const filteredEstoque = estoque.filter(item => {
    const matchesCat = selectedCategory === 'TODOS' || item.categoria === selectedCategory;
    const matchesSearch =
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lote.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const valorTotalEstoque = estoque.reduce(
    (acc, i) => acc + i.quantidadeAtual * i.precoUnitarioR$,
    0
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <Package className="w-4 h-4" />
            Módulo 5 & 6 • Estoque Agrícola, Almoxarifado & Compras
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Gestão de Almoxarifado, Lotes & Fornecedores
          </h2>
          <p className="text-slate-500">
            Controle de sementes, adubos, defensivos e combustível com rastreabilidade de validade e saldo mínimo
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto / Insumo</span>
        </button>
      </div>

      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Valor Total em Estoque
          </span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
            R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500">{estoque.length} Itens Mapeados</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Alertas de Estoque Mínimo
          </span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">
            {estoque.filter(e => e.quantidadeAtual <= e.estoqueMinimo).length} Produtos
          </span>
          <span className="text-[10px] text-slate-500">Reposição recomendada</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Lotes Próximos do Vencimento
          </span>
          <span className="text-lg font-black text-red-600 dark:text-red-400 block">
            {estoque.filter(e => e.statusAlerta === 'vencendo' || e.statusAlerta === 'vencido').length} Lotes
          </span>
          <span className="text-[10px] text-slate-500">Validade sob auditoria</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Fornecedores Homologados
          </span>
          <span className="text-lg font-black text-blue-600 dark:text-blue-400 block">
            {fornecedores.length} Empresas
          </span>
          <span className="text-[10px] text-slate-500">Cotação & Compras</span>
        </div>
      </div>

      {/* FILTER CATEGORY TABS & SEARCH */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, nome ou lote..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* STOCK TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                <th className="p-3">Código / Categoria</th>
                <th className="p-3">Produto Insumo</th>
                <th className="p-3">Lote & Validade</th>
                <th className="p-3">Localização</th>
                <th className="p-3 text-right">Saldo Atual</th>
                <th className="p-3 text-right">Preço Unit.</th>
                <th className="p-3 text-right">Valor Total (R$)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredEstoque.map(i => {
                const isMin = i.quantidadeAtual <= i.estoqueMinimo;
                const valorTotal = i.quantidadeAtual * i.precoUnitarioR$;
                return (
                  <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="p-3">
                      <span className="font-mono font-bold block text-slate-900 dark:text-white">
                        {i.codigo}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{i.categoria}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-zinc-100">
                      {i.nome}
                      <span className="text-[10px] text-slate-400 font-normal block">
                        Forn: {i.fornecedorNome}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-xs block">{i.lote}</span>
                      <span className="text-[10px] text-slate-500 block">Val: {i.dataValidade}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400">
                      {i.localArmazenamento}
                    </td>
                    <td className="p-3 text-right font-bold font-mono">
                      <span className={isMin ? 'text-amber-600 dark:text-amber-400 font-black' : ''}>
                        {i.quantidadeAtual.toLocaleString('pt-BR')} {i.unidadeMedida}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Mínimo: {i.estoqueMinimo} {i.unidadeMedida}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">
                      R$ {i.precoUnitarioR$.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                      R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isMin
                            ? 'bg-amber-100 text-amber-800'
                            : i.statusAlerta === 'vencendo'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isMin ? 'Estoque Mínimo' : i.statusAlerta}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Cadastrar Insumo no Estoque</h3>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold">Categoria</label>
                <select
                  value={newItem.categoria}
                  onChange={e => setNewItem({ ...newItem, categoria: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                >
                  <option value="Fertilizantes">Fertilizantes</option>
                  <option value="Defensivos">Defensivos</option>
                  <option value="Sementes">Sementes</option>
                  <option value="Combustíveis">Combustíveis</option>
                  <option value="Lubrificantes">Lubrificantes</option>
                  <option value="Peças">Peças</option>
                  <option value="EPIs">EPIs</option>
                  <option value="Ferramentas">Ferramentas</option>
                </select>
              </div>

              <div>
                <label className="block font-bold">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Adubo NPK 04-14-08"
                  value={newItem.nome}
                  onChange={e => setNewItem({ ...newItem, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div>
                <label className="block font-bold">Quantidade Inicial</label>
                <input
                  type="number"
                  value={newItem.quantidadeAtual}
                  onChange={e => setNewItem({ ...newItem, quantidadeAtual: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div>
                <label className="block font-bold">Unidade</label>
                <select
                  value={newItem.unidadeMedida}
                  onChange={e => setNewItem({ ...newItem, unidadeMedida: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                >
                  <option value="kg">Quilogramas (kg)</option>
                  <option value="L">Litros (L)</option>
                  <option value="sc">Sacas (sc)</option>
                  <option value="un">Unidades (un)</option>
                  <option value="ton">Toneladas (ton)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.precoUnitarioR$}
                  onChange={e => setNewItem({ ...newItem, precoUnitarioR$: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div>
                <label className="block font-bold">Estoque Mínimo</label>
                <input
                  type="number"
                  value={newItem.estoqueMinimo}
                  onChange={e => setNewItem({ ...newItem, estoqueMinimo: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
