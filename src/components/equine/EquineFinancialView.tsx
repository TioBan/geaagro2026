import React, { useState, useMemo } from 'react';
import { DollarSign, Plus, X } from 'lucide-react';
import {
  EquineAnimal,
  EquineExpenseRecord,
  EquineExpenseCategory,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  expenses: EquineExpenseRecord[];
  onAddExpense: (record: EquineExpenseRecord) => void;
}

const EXPENSE_CATEGORIES: EquineExpenseCategory[] = [
  'Alimentação & Feno',
  'Veterinário & Clínico',
  'Medicamentos & Vacinas',
  'Ferrageamento & Casqueamento',
  'Odontologia',
  'Treinamento & Doma',
  'Inscrições em Provas & Competições',
  'Transporte & Fretes',
  'Reprodução & Sêmen',
  'Instalações & Manutenção',
  'Arreios & Materiais',
  'Seguro Animal',
  'Receitas de Premiações (Entrada)',
  'Venda de Coberturas (Entrada)',
  'Venda de Animal (Entrada)',
  'Outros',
];

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineFinancialView: React.FC<Props> = ({
  animals,
  expenses,
  onAddExpense,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeRecords = useMemo(() => (expenses || []).filter(e => e && e.id), [expenses]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<{
    animalId: string;
    date: string;
    type: 'Despesa' | 'Receita';
    category: EquineExpenseCategory;
    description: string;
    amountBrl: number;
    payeeOrRecipient: string;
    notes: string;
  }>({
    animalId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Despesa',
    category: 'Alimentação & Feno',
    description: '',
    amountBrl: 0,
    payeeOrRecipient: '',
    notes: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amountBrl) return;

    const newRecord: EquineExpenseRecord = {
      id: `exp-${Date.now()}`,
      animalId: formData.animalId || undefined,
      date: formData.date,
      type: formData.type,
      category: formData.category,
      description: formData.description.trim(),
      amountBrl: Number(formData.amountBrl) || 0,
      payeeOrRecipient: formData.payeeOrRecipient.trim() || 'Haras',
      notes: formData.notes.trim() || undefined,
    };

    onAddExpense(newRecord);
    setFormData({ ...formData, description: '', amountBrl: 0, notes: '' });
    setIsModalOpen(false);
  };

  const filteredRecords = safeRecords.filter(e => {
    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchAnimal = selectedAnimalFilter === 'all' || e.animalId === selectedAnimalFilter;
    return matchCat && matchAnimal;
  });

  const summary = useMemo(() => {
    const onlyExpenses = safeRecords.filter(r => r.type !== 'Receita');
    const onlyRevenues = safeRecords.filter(r => r.type === 'Receita');

    const totalExpense = onlyExpenses.reduce((sum, e) => sum + (e.amountBrl || 0), 0);
    const totalRevenue = onlyRevenues.reduce((sum, e) => sum + (e.amountBrl || 0), 0);
    const avgCostPerHorse = safeAnimals.length > 0 ? totalExpense / safeAnimals.length : 0;

    const byCategory: Record<string, number> = {};
    onlyExpenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + (e.amountBrl || 0);
    });

    const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topEntry ? topEntry[0] : '—';
    const topCategoryPct =
      topEntry && totalExpense > 0 ? Math.round((topEntry[1] / totalExpense) * 100) : 0;

    return {
      totalExpense,
      totalRevenue,
      avgCostPerHorse,
      topCategory,
      topCategoryPct,
    };
  }, [safeRecords, safeAnimals.length]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Custos & Financeiro do Haras</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Rateio de despesas por cavalo, receitas de premiações/coberturas e centros de custo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Total de Despesas</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              R$ {summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Receitas / Entradas</span>
            <span className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
              R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Custo Médio / Cavalo</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              R$ {summary.avgCostPerHorse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
              R$ {(summary.avgCostPerHorse / 30).toFixed(2)} / dia
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Maior Centro de Custo</span>
            <span className="mt-1 text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate block">
              {summary.topCategory}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {summary.topCategoryPct > 0 ? `${summary.topCategoryPct}% das despesas` : 'Sem lançamentos'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as categorias</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedAnimalFilter}
              onChange={e => setSelectedAnimalFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos os cavalos / Geral</option>
              {safeAnimals.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {filteredRecords.length} lançamento{filteredRecords.length === 1 ? '' : 's'}
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum lançamento financeiro encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Data</th>
                  <th className="px-4 py-2.5 font-medium">Descrição</th>
                  <th className="px-4 py-2.5 font-medium">Categoria</th>
                  <th className="px-4 py-2.5 font-medium">Animal / Rateio</th>
                  <th className="px-4 py-2.5 font-medium text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                {filteredRecords.map(exp => {
                  const animal = safeAnimals.find(a => a.id === exp.animalId);
                  const isRevenue = exp.type === 'Receita';

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-900 dark:text-zinc-100">
                          {exp.description}
                        </div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400">
                        {exp.category}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">
                        {animal ? animal.name : exp.costCenter || 'Geral do Haras'}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${
                          isRevenue
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-zinc-100'
                        }`}
                      >
                        {isRevenue ? '+' : '-'} R${' '}
                        {exp.amountBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Financial Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Lançamento Financeiro
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Descrição *</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Feno Tifton 85 (100 fardos)"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Natureza</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as 'Despesa' | 'Receita' })}
                    className={inputCls}
                  >
                    <option value="Despesa">Despesa (Saída)</option>
                    <option value="Receita">Receita (Entrada)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amountBrl || ''}
                    onChange={e => setFormData({ ...formData, amountBrl: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as EquineExpenseCategory })}
                    className={inputCls}
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Cavalo (Opcional)</label>
                  <select
                    value={formData.animalId}
                    onChange={e => setFormData({ ...formData, animalId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Geral do Haras (Rateio)</option>
                    {safeAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Fornecedor / Pagador</label>
                  <input
                    type="text"
                    value={formData.payeeOrRecipient}
                    onChange={e => setFormData({ ...formData, payeeOrRecipient: e.target.value })}
                    placeholder="Nome do fornecedor"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
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
