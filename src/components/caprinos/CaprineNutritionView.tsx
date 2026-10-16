import React, { useState } from 'react';
import { CaprineFeedItem } from '../../types/caprine';
import { Wheat, Plus, DollarSign, Calculator, Layers, Flame, X } from 'lucide-react';

interface Props {
  feeds: CaprineFeedItem[];
  onSaveFeed: (feed: CaprineFeedItem) => void;
}

export const CaprineNutritionView: React.FC<Props> = ({ feeds, onSaveFeed }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeed, setNewFeed] = useState<Partial<CaprineFeedItem>>({
    id: `feed-${Date.now()}`,
    name: '',
    category: 'Concentrado',
    dryMatterPct: 88,
    crudeProteinPct: 18,
    ndtPct: 72,
    costPerKgBrl: 1.80
  });

  // NRC Requirements Simulator State
  const [goatWeight, setGoatWeight] = useState<number>(60);
  const [milkTarget, setMilkTarget] = useState<number>(4.0);
  const [goatCategory, setGoatCategory] = useState<string>('Lactação Alta');

  // NRC Caprinos calculations
  const cmsPctPv = goatCategory.includes('Lactação') ? 4.2 : 3.2; // % Consumo de Matéria Seca em relação ao Peso Vivo
  const totalCmsKg = (goatWeight * (cmsPctPv / 100)).toFixed(2);
  const pbRequiredKg = ((parseFloat(totalCmsKg) * 0.16)).toFixed(2); // ~16% PB
  const ndtRequiredKg = ((parseFloat(totalCmsKg) * 0.68)).toFixed(2); // ~68% NDT
  const estimatedDailyCostBrl = (parseFloat(totalCmsKg) * 1.35).toFixed(2);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeed.name) {
      alert('Informe o nome do alimento.');
      return;
    }
    onSaveFeed(newFeed as CaprineFeedItem);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Wheat className="w-6 h-6 text-amber-600" />
            Nutrição Caprina & Exigências (Tabela NRC Caprinos)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Cadastro de alimentos (Palma, Feno, Silagem, Concentrados), cálculo de Consumo de Matéria Seca (CMS % PV), Proteína Bruta (PB), NDT e Custo Diário.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Alimento
        </button>
      </div>

      {/* NRC Diet Calculator Card */}
      <div className="bg-gradient-to-r from-stone-900 via-zinc-900 to-amber-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-base font-extrabold flex items-center gap-2 text-amber-400">
            <Calculator className="w-5 h-5" />
            Calculadora de Exigências Nutricionais NRC Caprinos
          </h2>
          <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-400/30">
            Padrão NRC Goat
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-stone-300 font-bold mb-1">Categoria do Caprino:</label>
            <select
              value={goatCategory}
              onChange={e => setGoatCategory(e.target.value)}
              className="w-full p-2.5 bg-white/10 text-white rounded-xl border border-white/20 font-bold focus:bg-zinc-800"
            >
              <option value="Lactação Alta" className="text-stone-900">Matriz Lactante (Pico &gt; 3.5L)</option>
              <option value="Lactação Média" className="text-stone-900">Matriz Lactante Média (2.0L)</option>
              <option value="Gestação Final" className="text-stone-900">Matriz Gestante (Último terço)</option>
              <option value="Crescimento / Recria" className="text-stone-900">Cabrita / Cabrito em Recria</option>
              <option value="Reprodutor Bode" className="text-stone-900">Reprodutor (Estação de Monta)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-300 font-bold mb-1">Peso Vivo (PV em kg):</label>
            <input
              type="number"
              value={goatWeight}
              onChange={e => setGoatWeight(parseFloat(e.target.value) || 50)}
              className="w-full p-2.5 bg-white/10 text-white font-black rounded-xl border border-white/20"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-bold mb-1">Meta Produção Leite (L/dia):</label>
            <input
              type="number"
              step="0.5"
              value={milkTarget}
              onChange={e => setMilkTarget(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-white/10 text-white font-black rounded-xl border border-white/20 text-amber-400"
            />
          </div>
        </div>

        {/* NRC Results Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 text-center">
          <div>
            <span className="text-[10px] text-stone-400 uppercase block">Consumo MS (CMS)</span>
            <span className="text-xl font-black text-amber-400">{totalCmsKg} <span className="text-xs font-normal">kg MS/dia</span></span>
            <span className="text-[9px] text-stone-400 block mt-0.5">{cmsPctPv}% do Peso Vivo</span>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 uppercase block">Proteína Bruta (PB)</span>
            <span className="text-xl font-black text-emerald-400">{pbRequiredKg} <span className="text-xs font-normal">kg/dia</span></span>
            <span className="text-[9px] text-stone-400 block mt-0.5">Teor ~16% PB na dieta</span>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 uppercase block">Energia (NDT)</span>
            <span className="text-xl font-black text-sky-400">{ndtRequiredKg} <span className="text-xs font-normal">kg/dia</span></span>
            <span className="text-[9px] text-stone-400 block mt-0.5">Teor ~68% NDT na dieta</span>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 uppercase block">Custo Estimado R$</span>
            <span className="text-xl font-black text-amber-300">R$ {estimatedDailyCostBrl}</span>
            <span className="text-[9px] text-stone-400 block mt-0.5">por cabra / dia</span>
          </div>
        </div>
      </div>

      {/* Feedstuffs Catalog Grid */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-600" />
          Banco de Alimentos Caprinos & Bromatologia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeds.map(feed => (
            <div
              key={feed.id}
              className="bg-stone-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 space-y-2 hover:border-amber-500 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                    {feed.category}
                  </span>
                  <h3 className="font-extrabold text-sm text-stone-900 dark:text-white mt-1">{feed.name}</h3>
                </div>
                <span className="font-mono text-xs font-black text-amber-600">
                  R$ {feed.costPerKgBrl.toFixed(2)}/kg
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[11px] bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-stone-200/50 dark:border-zinc-800 text-center">
                <div>
                  <span className="text-[9px] text-stone-400 block">MS %</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{feed.dryMatterPct}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block">PB %</span>
                  <span className="font-bold text-emerald-600">{feed.crudeProteinPct}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block">NDT %</span>
                  <span className="font-bold text-sky-600">{feed.ndtPct}%</span>
                </div>
              </div>

              {feed.notes && (
                <p className="text-[11px] text-stone-500 italic">{feed.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Feed */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Wheat className="w-5 h-5 text-amber-600" />
                Novo Alimento Caprino
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome do Alimento *</label>
                <input
                  type="text"
                  required
                  value={newFeed.name || ''}
                  onChange={e => setNewFeed({ ...newFeed, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Silagem de Sorgo, Feno de Leucena..."
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Categoria *</label>
                <select
                  value={newFeed.category || 'Concentrado'}
                  onChange={e => setNewFeed({ ...newFeed, category: e.target.value as any })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                >
                  <option value="Pastagem">Pastagem</option>
                  <option value="Palma Forrageira">Palma Forrageira</option>
                  <option value="Silagem">Silagem</option>
                  <option value="Feno">Feno</option>
                  <option value="Concentrado">Concentrado</option>
                  <option value="Mineral">Mineral</option>
                  <option value="Aditivo">Aditivo</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">MS (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFeed.dryMatterPct || 88}
                    onChange={e => setNewFeed({ ...newFeed, dryMatterPct: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">PB (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFeed.crudeProteinPct || 18}
                    onChange={e => setNewFeed({ ...newFeed, crudeProteinPct: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">NDT (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFeed.ndtPct || 70}
                    onChange={e => setNewFeed({ ...newFeed, ndtPct: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Custo por kg (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newFeed.costPerKgBrl || 1.50}
                  onChange={e => setNewFeed({ ...newFeed, costPerKgBrl: parseFloat(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold"
                >
                  Salvar Alimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
