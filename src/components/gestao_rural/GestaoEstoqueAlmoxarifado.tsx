import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Search, X } from 'lucide-react';
import { ItemEstoqueRural, FornecedorRural, CompraInsumoRecord } from '../../types/gestaoRural';

interface GestaoEstoqueAlmoxarifadoProps {
  estoque: ItemEstoqueRural[];
  fornecedores: FornecedorRural[];
  compras: CompraInsumoRecord[];
  onAddEstoqueItem: (item: ItemEstoqueRural) => void;
  onAddMovimentacao?: (itemId: string, tipo: 'entrada' | 'saida', qtd: number, motivo: string) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const CATEGORIES: Array<'Todas' | ItemEstoqueRural['categoria']> = [
  'Todas',
  'Fertilizantes',
  'Defensivos',
  'Sementes',
  'Combustíveis',
  'Lubrificantes',
  'Peças',
  'EPIs',
  'Ferramentas',
];

const ALERTA_MAP: Record<ItemEstoqueRural['statusAlerta'], { label: string; cls: string }> = {
  normal: { label: 'Normal', cls: 'text-emerald-700 dark:text-emerald-400' },
  minimo: { label: 'Estoque mínimo', cls: 'text-amber-700 dark:text-amber-400' },
  vencendo: { label: 'Vencendo', cls: 'text-amber-700 dark:text-amber-400' },
  vencido: { label: 'Vencido', cls: 'text-rose-600 dark:text-rose-400' },
};

export const GestaoEstoqueAlmoxarifado: React.FC<GestaoEstoqueAlmoxarifadoProps> = ({
  estoque,
  fornecedores,
  onAddEstoqueItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<'Todas' | ItemEstoqueRural['categoria']>('Todas');
  const [showModal, setShowModal] = useState(false);

  const [newItem, setNewItem] = useState<Partial<ItemEstoqueRural>>({
    codigo: `EST-${String(estoque.length + 1).padStart(3, '0')}`,
    nome: '',
    categoria: 'Fertilizantes',
    lote: '',
    dataValidade: '',
    fornecedorNome: fornecedores[0]?.nomeFantasia || '',
    quantidadeAtual: 0,
    unidadeMedida: 'kg',
    precoUnitarioR$: 0,
    estoqueMinimo: 10,
    localArmazenamento: 'Galpão Principal',
  });

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  const metrics = useMemo(() => {
    const valorImobilizado = estoque.reduce((acc, i) => acc + i.quantidadeAtual * i.precoUnitarioR$, 0);
    const criticos = estoque.filter(i => i.statusAlerta === 'minimo' || i.quantidadeAtual <= i.estoqueMinimo).length;
    const vencimento = estoque.filter(i => i.statusAlerta === 'vencendo' || i.statusAlerta === 'vencido').length;
    return { valorImobilizado, criticos, vencimento };
  }, [estoque]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return estoque.filter(i => {
      const matchCat = selectedCat === 'Todas' || i.categoria === selectedCat;
      const matchSearch =
        !q ||
        i.nome.toLowerCase().includes(q) ||
        i.codigo.toLowerCase().includes(q) ||
        i.lote.toLowerCase().includes(q) ||
        i.fornecedorNome.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [estoque, searchTerm, selectedCat]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nome?.trim()) return;
    const qtd = Number(newItem.quantidadeAtual) || 0;
    const min = Number(newItem.estoqueMinimo) || 0;
    const created: ItemEstoqueRural = {
      id: `est-${Date.now()}`,
      codigo: newItem.codigo || `EST-${String(estoque.length + 1).padStart(3, '0')}`,
      nome: newItem.nome.trim(),
      categoria: newItem.categoria || 'Fertilizantes',
      lote: newItem.lote?.trim() || 'Lote Padrão',
      dataValidade: newItem.dataValidade || '',
      fornecedorNome: newItem.fornecedorNome?.trim() || 'Não informado',
      quantidadeAtual: qtd,
      unidadeMedida: newItem.unidadeMedida || 'kg',
      precoUnitarioR$: Number(newItem.precoUnitarioR$) || 0,
      estoqueMinimo: min,
      localArmazenamento: newItem.localArmazenamento?.trim() || 'Almoxarifado',
      statusAlerta: qtd <= min ? 'minimo' : 'normal',
      historicoMovimentacao: [
        {
          id: `mov-${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          tipo: 'entrada',
          quantidade: qtd,
          motivo: 'Saldo inicial cadastrado',
        },
      ],
    };
    onAddEstoqueItem(created);
    setShowModal(false);
    setNewItem(prev => ({
      ...prev,
      codigo: `EST-${String(estoque.length + 2).padStart(3, '0')}`,
      nome: '',
      lote: '',
      quantidadeAtual: 0,
      precoUnitarioR$: 0,
    }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPI STRIP */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Valor Imobilizado</span>
          <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            R$ {metrics.valorImobilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Itens Cadastrados</span>
          <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">{estoque.length}</span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Abaixo do Mínimo</span>
          <span className={`text-base font-semibold tabular-nums ${metrics.criticos > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-zinc-100'}`}>
            {metrics.criticos}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Alertas de Validade</span>
          <span className={`text-base font-semibold tabular-nums ${metrics.vencimento > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-zinc-100'}`}>
            {metrics.vencimento}
          </span>
        </div>
      </div>

      {/* TABLE & FILTERS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Estoque &amp; Almoxarifado</span>
          </h2>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Insumo</span>
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-50/50 dark:bg-zinc-950/30">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar insumo, código, lote ou fornecedor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value as 'Todas' | ItemEstoqueRural['categoria'])}
            className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 focus:outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c === 'Todas' ? 'Todas as categorias' : c}
              </option>
            ))}
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                  <th className="py-2.5 px-4">Insumo / Código</th>
                  <th className="py-2.5 px-4">Categoria &amp; Local</th>
                  <th className="py-2.5 px-4">Lote / Validade</th>
                  <th className="py-2.5 px-4 text-right">Saldo</th>
                  <th className="py-2.5 px-4 text-right">Valor Total</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filtered.map(item => {
                  const st = ALERTA_MAP[item.statusAlerta] || ALERTA_MAP.normal;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">{item.nome}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                          {item.codigo} · {item.fornecedorNome}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                        <div>{item.categoria}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{item.localArmazenamento}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 tabular-nums">
                        <div>{item.lote}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                          {item.dataValidade ? new Date(`${item.dataValidade}T00:00:00`).toLocaleDateString('pt-BR') : 'Sem validade'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                        {item.quantidadeAtual.toLocaleString('pt-BR')} {item.unidadeMedida}
                        <span className="block text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                          Mín: {item.estoqueMinimo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                        R$ {(item.quantidadeAtual * item.precoUnitarioR$).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className={`font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum insumo encontrado no estoque. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Novo Insumo</strong> para cadastrar.
          </div>
        )}
      </div>

      {/* ADD INSUMO MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Cadastrar Novo Insumo</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Nome do Insumo</label>
                <input
                  type="text"
                  placeholder="Ex: NPK 08-28-16"
                  value={newItem.nome}
                  onChange={e => setNewItem({ ...newItem, nome: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Categoria</label>
                <select
                  value={newItem.categoria}
                  onChange={e => setNewItem({ ...newItem, categoria: e.target.value as ItemEstoqueRural['categoria'] })}
                  className={INPUT_CLASS}
                >
                  {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Quantidade Atual</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.quantidadeAtual}
                  onChange={e => setNewItem({ ...newItem, quantidadeAtual: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Unidade</label>
                <select
                  value={newItem.unidadeMedida}
                  onChange={e => setNewItem({ ...newItem, unidadeMedida: e.target.value as ItemEstoqueRural['unidadeMedida'] })}
                  className={INPUT_CLASS}
                >
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="sc">sc</option>
                  <option value="ton">ton</option>
                  <option value="un">un</option>
                  <option value="m3">m³</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.precoUnitarioR$}
                  onChange={e => setNewItem({ ...newItem, precoUnitarioR$: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Estoque Mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.estoqueMinimo}
                  onChange={e => setNewItem({ ...newItem, estoqueMinimo: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Lote</label>
                <input
                  type="text"
                  placeholder="Ex: LT-2026-A"
                  value={newItem.lote}
                  onChange={e => setNewItem({ ...newItem, lote: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Validade</label>
                <input
                  type="date"
                  value={newItem.dataValidade}
                  onChange={e => setNewItem({ ...newItem, dataValidade: e.target.value })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Fornecedor</label>
                <input
                  type="text"
                  placeholder="Nome do fornecedor"
                  value={newItem.fornecedorNome}
                  onChange={e => setNewItem({ ...newItem, fornecedorNome: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Local de Armazenamento</label>
                <input
                  type="text"
                  value={newItem.localArmazenamento}
                  onChange={e => setNewItem({ ...newItem, localArmazenamento: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Cadastrar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
