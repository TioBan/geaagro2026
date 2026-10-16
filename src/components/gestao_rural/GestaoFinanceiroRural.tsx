import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  PieChart as PieIcon,
  Search,
} from 'lucide-react';
import { ContaFinanceiraRecord, SafraAgragricola } from '../../types/gestaoRural';

interface GestaoFinanceiroRuralProps {
  financeiro: ContaFinanceiraRecord[];
  safras: SafraAgragricola[];
  onAddConta: (conta: ContaFinanceiraRecord) => void;
  onUpdateStatusConta: (id: string, status: 'pago' | 'recebido' | 'pendente') => void;
}

export const GestaoFinanceiroRural: React.FC<GestaoFinanceiroRuralProps> = ({
  financeiro,
  safras,
  onAddConta,
  onUpdateStatusConta,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dre' | 'fluxo' | 'pagar' | 'receber'>('dre');

  const [form, setForm] = useState<Partial<ContaFinanceiraRecord>>({
    tipo: 'despesa',
    categoria: 'Fertilizantes',
    descricao: '',
    valorR$: 1000,
    dataVencimento: new Date().toISOString().split('T')[0],
    status: 'pendente',
    fornecedorClienteNome: '',
    meioPagamento: 'PIX',
  });

  const receitas = financeiro.filter(f => f.tipo === 'receita');
  const despesas = financeiro.filter(f => f.tipo === 'despesa');

  const totalReceita = receitas.reduce((acc, f) => acc + f.valorR$, 0);
  const totalDespesa = despesas.reduce((acc, f) => acc + f.valorR$, 0);
  const lucroLiquido = totalReceita - totalDespesa;
  const margemLucroPct = totalReceita > 0 ? (lucroLiquido / totalReceita) * 100 : 0;
  const roiPct = totalDespesa > 0 ? (lucroLiquido / totalDespesa) * 100 : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valorR$) return;

    const created: ContaFinanceiraRecord = {
      id: `fin-${Date.now()}`,
      tipo: form.tipo || 'despesa',
      categoria: form.categoria || 'Geral',
      descricao: form.descricao,
      valorR$: Number(form.valorR$) || 0,
      dataVencimento: form.dataVencimento || new Date().toISOString().split('T')[0],
      status: (form.status as any) || 'pendente',
      fornecedorClienteNome: form.fornecedorClienteNome || 'Fornecedor/Cliente',
      meioPagamento: form.meioPagamento || 'PIX',
    };

    onAddConta(created);
    setShowAddModal(false);
    setForm({
      tipo: 'despesa',
      categoria: 'Fertilizantes',
      descricao: '',
      valorR$: 1000,
      dataVencimento: new Date().toISOString().split('T')[0],
      status: 'pendente',
      fornecedorClienteNome: '',
      meioPagamento: 'PIX',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <DollarSign className="w-4 h-4" />
            Módulo 4 • ERP Financeiro Rural & DRE Agrícola
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Gestão Financeira, Fluxo de Caixa & Rentabilidade
          </h2>
          <p className="text-slate-500">
            Plano de contas agrícola, controle de contas a pagar/receber e apuração de ROI da safra
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Receita / Despesa</span>
        </button>
      </div>

      {/* DRE SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Receita Bruta Total
          </span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
            R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500">
            {receitas.length} Lançamentos de Vendas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Despesas Totais
          </span>
          <span className="text-lg font-black text-red-600 dark:text-red-400 block">
            R$ {totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500">Insumos & Operações</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Lucro Líquido
          </span>
          <span className="text-lg font-black text-blue-600 dark:text-blue-400 block">
            R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">
            Margem: {margemLucroPct.toFixed(1)}%
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            ROI da Safra
          </span>
          <span className="text-lg font-black text-purple-600 dark:text-purple-400 block">
            {roiPct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500">Retorno sobre Investimento</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Custo por Saca
          </span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">
            R$ 44,79 / sc
          </span>
          <span className="text-[10px] text-slate-500">Preço Venda: R$ 138.50</span>
        </div>
      </div>

      {/* SUB TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('dre')}
          className={`px-4 py-2 font-bold rounded-xl cursor-pointer ${
            activeTab === 'dre'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          DRE & Destaques
        </button>
        <button
          onClick={() => setActiveTab('pagar')}
          className={`px-4 py-2 font-bold rounded-xl cursor-pointer ${
            activeTab === 'pagar'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          Contas a Pagar ({despesas.filter(d => d.status === 'pendente').length})
        </button>
        <button
          onClick={() => setActiveTab('receber')}
          className={`px-4 py-2 font-bold rounded-xl cursor-pointer ${
            activeTab === 'receber'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          Contas a Receber ({receitas.filter(r => r.status === 'pendente').length})
        </button>
      </div>

      {/* FINANCIAL TABLE LIST */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                <th className="p-3">Tipo</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Descrição / Pessoa</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3 text-right">Valor (R$)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {financeiro.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black ${
                        f.tipo === 'receita'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {f.tipo}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">
                    {f.categoria}
                  </td>
                  <td className="p-3">
                    <span className="font-bold block text-slate-900 dark:text-white">
                      {f.descricao}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {f.fornecedorClienteNome} • {f.meioPagamento}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-zinc-400">
                    {f.dataVencimento}
                  </td>
                  <td className="p-3 text-right font-black font-mono">
                    <span
                      className={
                        f.tipo === 'receita'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      R$ {f.valorR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        f.status === 'pago' || f.status === 'recebido'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {f.status === 'pendente' && (
                      <button
                        onClick={() =>
                          onUpdateStatusConta(
                            f.id,
                            f.tipo === 'receita' ? 'recebido' : 'pago'
                          )
                        }
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Baixar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD FINANCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Lançamento Financeiro</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  >
                    <option value="receita">Receita (Entrada)</option>
                    <option value="despesa">Despesa (Saída)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold">Categoria</label>
                  <input
                    type="text"
                    value={form.categoria}
                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold">Descrição do Lançamento</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de Sementes de Milho N/F 108"
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorR$}
                    onChange={e => setForm({ ...form, valorR$: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold">Vencimento</label>
                  <input
                    type="date"
                    value={form.dataVencimento}
                    onChange={e => setForm({ ...form, dataVencimento: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
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
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
