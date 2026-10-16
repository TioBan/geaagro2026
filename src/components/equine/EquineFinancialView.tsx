// @ts-nocheck
import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  PieChart,
  Filter,
  X,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
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

export const EquineFinancialView: React.FC<Props> = ({
  animals,
  expenses,
  onAddExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<EquineExpenseRecord>>({
    animalId: animals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    category: 'Alimentação & Volumoso',
    description: 'Feno Tifton 85 Premium (100 fardos)',
    amountBrl: 4500,
    costCenter: 'Nutrição do Plantel',
    notes: 'Fornecedor AgroFeno SP.',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amountBrl) return;

    const newRecord: EquineExpenseRecord = {
      ...(formData as EquineExpenseRecord),
      id: `exp-${Date.now()}`,
    };

    onAddExpense(newRecord);
    setIsModalOpen(false);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchAnimal = selectedAnimalFilter === 'all' || e.animalId === selectedAnimalFilter;
    return matchCat && matchAnimal;
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amountBrl, 0);
  const avgCostPerHorse = animals.length > 0 ? totalExpense / animals.length : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Custos de Manutenção, Haras & DRE Zootécnico
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Controle Financeiro da Tropa de Equinos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Rateio de despesas por animal, alimentação, sanidade, ferrageamento e inscrições esportivas
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Despesa / Custo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Custo Total da Tropa</span>
          <span className="text-2xl font-black text-stone-900 font-mono">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Período consolidado</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">Custo Médio / Cavalo</span>
          <span className="text-2xl font-black text-emerald-900 font-mono">
            R$ {avgCostPerHorse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Base no plantel ativo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Custo Diário Estimado</span>
          <span className="text-2xl font-black text-stone-900 font-mono">
            R$ {(avgCostPerHorse / 30).toFixed(2)} / dia
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Alimentação + Manejo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">Maior Centro de Custo</span>
          <span className="text-base font-black text-blue-950 mt-1 block">Alimentação & Volumoso</span>
          <span className="text-[11px] text-stone-500 block">58% do orçamento</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-b pb-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Alimentação & Volumoso">Alimentação & Volumoso</option>
              <option value="Sanidade & Veterinário">Sanidade & Veterinário</option>
              <option value="Ferrageamento & Casqueamento">Ferrageamento</option>
              <option value="Treinador & Pista">Treinador & Pista</option>
              <option value="Inscrições & Provas">Inscrições & Provas</option>
              <option value="Instalações & Cama de Baia">Instalações & Cama</option>
              <option value="Genética & Reprodução">Genética & Reprodução</option>
            </select>

            <select
              value={selectedAnimalFilter}
              onChange={e => setSelectedAnimalFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
            >
              <option value="all">Rateio Todos os Cavalos</option>
              {animals.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <span className="text-stone-500 font-bold">
            {filteredExpenses.length} lançamentos encontrados
          </span>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Descrição da Despesa</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Cavalo / Centro de Custo</th>
                <th className="p-3 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map(exp => {
                const animal = animals.find(a => a.id === exp.animalId);

                return (
                  <tr key={exp.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">
                      {new Date(exp.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-bold text-stone-900">
                      {exp.description}
                      {exp.notes && <span className="block text-[10px] text-stone-500 font-normal">{exp.notes}</span>}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-800 border">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-stone-700">
                      {animal ? animal.name : exp.costCenter || 'Geral do Haras'}
                    </td>
                    <td className="p-3 text-right font-black font-mono text-stone-900">
                      R$ {exp.amountBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm">Lançar Despesa da Tropa</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Descrição do Custo *</label>
                  <input
                    type="text"
                    required
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Feno Tifton 85 (Carga fechada)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Categoria de Custo</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as EquineExpenseCategory })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="Alimentação & Volumoso">Alimentação & Volumoso</option>
                    <option value="Sanidade & Veterinário">Sanidade & Veterinário</option>
                    <option value="Ferrageamento & Casqueamento">Ferrageamento & Casqueamento</option>
                    <option value="Odontologia">Odontologia</option>
                    <option value="Treinador & Pista">Treinador & Pista</option>
                    <option value="Inscrições & Provas">Inscrições & Provas</option>
                    <option value="Instalações & Cama de Baia">Instalações & Cama de Baia</option>
                    <option value="Genética & Reprodução">Genética & Reprodução</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amountBrl}
                    onChange={e => setFormData({ ...formData, amountBrl: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Data do Pagamento</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cavalo Específico (Opcional)</label>
                  <select
                    value={formData.animalId || ''}
                    onChange={e => setFormData({ ...formData, animalId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="">Geral do Haras (Rateio)</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Observações & Fornecedor</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
