import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, Plus, Check, X } from 'lucide-react';
import { ContaFinanceiraRecord, SafraAgragricola } from '../../types/gestaoRural';

interface GestaoFinanceiroRuralProps {
  financeiro: ContaFinanceiraRecord[];
  safras: SafraAgragricola[];
  onAddConta: (conta: ContaFinanceiraRecord) => void;
  onUpdateStatusConta: (id: string, status: 'pago' | 'recebido' | 'pendente') => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const GestaoFinanceiroRural: React.FC<GestaoFinanceiroRuralProps> = ({
  financeiro,
  safras,
  onAddConta,
  onUpdateStatusConta,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dre' | 'pagar' | 'receber'>('dre');
  const [showModal, setShowModal] = useState(false);

  const [newConta, setNewConta] = useState<Partial<ContaFinanceiraRecord>>({
    tipo: 'despesa',
    categoria: 'Fertilizantes',
    descricao: '',
    valorR$: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    status: 'pendente',
    safraId: safras[0]?.id || '',
    fornecedorClienteNome: '',
    meioPagamento: 'PIX',
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
    const receitas = financeiro.filter(f => f.tipo === 'receita').reduce((acc, f) => acc + f.valorR$, 0);
    const despesas = financeiro.filter(f => f.tipo === 'despesa').reduce((acc, f) => acc + f.valorR$, 0);
    const saldo = receitas - despesas;
    const aPagar = financeiro
      .filter(f => f.tipo === 'despesa' && (f.status === 'pendente' || f.status === 'atrasado'))
      .reduce((acc, f) => acc + f.valorR$, 0);
    const aReceber = financeiro
      .filter(f => f.tipo === 'receita' && (f.status === 'pendente' || f.status === 'atrasado'))
      .reduce((acc, f) => acc + f.valorR$, 0);
    return { receitas, despesas, saldo, aPagar, aReceber };
  }, [financeiro]);

  const displayedList = useMemo(() => {
    if (activeSubTab === 'pagar') return financeiro.filter(f => f.tipo === 'despesa');
    if (activeSubTab === 'receber') return financeiro.filter(f => f.tipo === 'receita');
    return financeiro;
  }, [financeiro, activeSubTab]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConta.descricao?.trim()) return;
    const created: ContaFinanceiraRecord = {
      id: `fin-${Date.now()}`,
      tipo: newConta.tipo || 'despesa',
      categoria: newConta.categoria?.trim() || 'Operacional',
      descricao: newConta.descricao.trim(),
      valorR$: Number(newConta.valorR$) || 0,
      dataVencimento: newConta.dataVencimento || new Date().toISOString().split('T')[0],
      status: newConta.status || 'pendente',
      safraId: newConta.safraId || undefined,
      fornecedorClienteNome: newConta.fornecedorClienteNome?.trim() || 'Não informado',
      meioPagamento: newConta.meioPagamento || 'PIX',
    };
    onAddConta(created);
    setShowModal(false);
    setNewConta(prev => ({ ...prev, descricao: '', valorR$: 0, fornecedorClienteNome: '' }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPI STRIP */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Receitas Totais</span>
          <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatBRL(metrics.receitas)}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Despesas Totais</span>
          <span className="text-base font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
            {formatBRL(metrics.despesas)}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Resultado (DRE)</span>
          <span
            className={`text-base font-semibold tabular-nums ${
              metrics.saldo >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatBRL(metrics.saldo)}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">A Pagar</span>
          <span className="text-base font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
            {formatBRL(metrics.aPagar)}
          </span>
        </div>
        <div className="p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">A Receber</span>
          <span className="text-base font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
            {formatBRL(metrics.aReceber)}
          </span>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Financeiro Rural</span>
            </h2>
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-zinc-800 pl-4">
              {[
                { id: 'dre' as const, label: 'Todos' },
                { id: 'pagar' as const, label: 'Despesas' },
                { id: 'receber' as const, label: 'Receitas' },
              ].map(tab => {
                const active = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`text-xs font-medium cursor-pointer transition-colors ${
                      active
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lançamento</span>
          </button>
        </div>

        {displayedList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                  <th className="py-2.5 px-4">Vencimento</th>
                  <th className="py-2.5 px-4">Descrição &amp; Categoria</th>
                  <th className="py-2.5 px-4">Contraparte / Meio</th>
                  <th className="py-2.5 px-4 text-right">Valor</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                  <th className="py-2.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {displayedList.map(c => {
                  const isPaid = c.status === 'pago' || c.status === 'recebido';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                        {new Date(`${c.dataVencimento}T00:00:00`).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-zinc-100">{c.descricao}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{c.categoria}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                        <div>{c.fornecedorClienteNome}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{c.meioPagamento}</div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-semibold tabular-nums whitespace-nowrap ${
                          c.tipo === 'receita'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {c.tipo === 'receita' ? '+' : '-'} {formatBRL(c.valorR$)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-medium capitalize ${
                            isPaid
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : c.status === 'atrasado'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isPaid ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatusConta(c.id, c.tipo === 'receita' ? 'recebido' : 'pago')}
                            className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-600 dark:text-zinc-300 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Baixar</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Liquidado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum lançamento financeiro nesta visão. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Novo Lançamento</strong> para registrar receitas ou despesas.
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Novo Lançamento Financeiro</h3>
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
                <label className={LABEL_CLASS}>Tipo</label>
                <select
                  value={newConta.tipo}
                  onChange={e => setNewConta({ ...newConta, tipo: e.target.value as 'receita' | 'despesa' })}
                  className={INPUT_CLASS}
                >
                  <option value="despesa">Despesa / Saída</option>
                  <option value="receita">Receita / Entrada</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Fertilizantes, Venda de Safra"
                  value={newConta.categoria}
                  onChange={e => setNewConta({ ...newConta, categoria: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de Ureia 10 ton"
                  value={newConta.descricao}
                  onChange={e => setNewConta({ ...newConta, descricao: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newConta.valorR$}
                  onChange={e => setNewConta({ ...newConta, valorR$: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Vencimento</label>
                <input
                  type="date"
                  value={newConta.dataVencimento}
                  onChange={e => setNewConta({ ...newConta, dataVencimento: e.target.value })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Fornecedor / Cliente</label>
                <input
                  type="text"
                  placeholder="Nome da contraparte"
                  value={newConta.fornecedorClienteNome}
                  onChange={e => setNewConta({ ...newConta, fornecedorClienteNome: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Meio de Pagamento</label>
                <select
                  value={newConta.meioPagamento}
                  onChange={e => setNewConta({ ...newConta, meioPagamento: e.target.value as ContaFinanceiraRecord['meioPagamento'] })}
                  className={INPUT_CLASS}
                >
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
              {safras.length > 0 && (
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS}>Vincular à Safra (opcional)</label>
                  <select
                    value={newConta.safraId}
                    onChange={e => setNewConta({ ...newConta, safraId: e.target.value })}
                    className={INPUT_CLASS}
                  >
                    <option value="">Sem vínculo específico</option>
                    {safras.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nomeSafra} — {s.cultura} ({s.talhaoNome})
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
