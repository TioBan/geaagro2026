import React, { useState } from 'react';
import { CaprineFeedItem, CaprineFeedCategory } from '../../types/caprine';
import { Wheat, Plus, Calculator, Layers, X } from 'lucide-react';

interface Props {
  feeds: CaprineFeedItem[];
  onSaveFeed: (feed: CaprineFeedItem) => void;
}

const FEED_CATEGORIES: CaprineFeedCategory[] = [
  'Pastagem',
  'Palma Forrageira',
  'Silagem',
  'Feno',
  'Concentrado',
  'Mineral',
  'Aditivo'
];

export const CaprineNutritionView: React.FC<Props> = ({ feeds, onSaveFeed }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newFeed, setNewFeed] = useState<Partial<CaprineFeedItem>>({});

  // NRC Requirements Simulator State
  const [goatWeight, setGoatWeight] = useState<number>(60);
  const [milkTarget, setMilkTarget] = useState<number>(4.0);
  const [goatCategory, setGoatCategory] = useState<string>('Lactação Alta');

  // NRC Caprinos calculations responding to category, body weight, and milk target
  const isLactating = goatCategory.includes('Lactação');
  const cmsPctPv = isLactating
    ? goatCategory === 'Lactação Alta'
      ? 4.2
      : 3.6
    : goatCategory === 'Gestação Final'
    ? 3.4
    : 3.2;

  const baseCmsKg = goatWeight * (cmsPctPv / 100);
  const milkCmsBonus = isLactating ? Math.max(0, milkTarget - 2.0) * 0.18 : 0;
  const totalCmsKg = baseCmsKg + milkCmsBonus;
  const pbPctTarget = isLactating ? 0.16 : goatCategory === 'Crescimento / Recria' ? 0.15 : 0.12;
  const ndtPctTarget = isLactating ? 0.68 : 0.62;

  const pbRequiredKg = totalCmsKg * pbPctTarget;
  const ndtRequiredKg = totalCmsKg * ndtPctTarget;
  const avgFeedCost =
    feeds.length > 0
      ? feeds.reduce((acc, f) => acc + f.costPerKgBrl, 0) / feeds.length
      : 1.35;
  const estimatedDailyCostBrl = totalCmsKg * avgFeedCost;

  const handleOpenModal = () => {
    setFormError('');
    setNewFeed({
      id: `feed-${Date.now()}`,
      name: '',
      category: 'Concentrado',
      dryMatterPct: 88,
      crudeProteinPct: 18,
      ndtPct: 72,
      costPerKgBrl: 1.8,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeed.name?.trim()) {
      setFormError('Informe o nome do alimento.');
      return;
    }
    onSaveFeed({
      id: newFeed.id || `feed-${Date.now()}`,
      name: newFeed.name.trim(),
      category: (newFeed.category as CaprineFeedCategory) || 'Concentrado',
      dryMatterPct: newFeed.dryMatterPct ?? 88,
      crudeProteinPct: newFeed.crudeProteinPct ?? 18,
      ndtPct: newFeed.ndtPct ?? 72,
      costPerKgBrl: newFeed.costPerKgBrl ?? 1.5,
      notes: newFeed.notes
    });
    setIsModalOpen(false);
    setFormError('');
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Nutrição Caprina &amp; Exigências NRC
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Calculadora de CMS (% PV), PB, NDT e catálogo bromatológico de volumosos e concentrados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Alimento
        </button>
      </div>

      {/* NRC Calculator Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Calculadora de Exigências Nutricionais (NRC Caprinos)
          </h2>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Referência NRC Goat
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Categoria do Caprino
            </label>
            <select
              value={goatCategory}
              onChange={e => setGoatCategory(e.target.value)}
              className={inputCls}
            >
              <option value="Lactação Alta">Matriz Lactante (Pico &gt; 3,5 L)</option>
              <option value="Lactação Média">Matriz Lactante Média (2,0 L)</option>
              <option value="Gestação Final">Matriz Gestante (Último terço)</option>
              <option value="Crescimento / Recria">Cabrita / Cabrito em Recria</option>
              <option value="Reprodutor Bode">Reprodutor (Estação de Monta)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Peso Vivo (kg)
            </label>
            <input
              type="number"
              min="10"
              max="150"
              value={goatWeight}
              onChange={e => setGoatWeight(parseFloat(e.target.value) || 0)}
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Meta Produção Leite (L/dia)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              disabled={!isLactating}
              value={isLactating ? milkTarget : 0}
              onChange={e => setMilkTarget(parseFloat(e.target.value) || 0)}
              className={`${inputCls} tabular-nums disabled:opacity-50`}
            />
          </div>
        </div>

        {/* Hairline Results Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-200 dark:border-zinc-800 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Consumo MS (CMS)
            </span>
            <span className="text-base font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {totalCmsKg.toFixed(2)}{' '}
              <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">
                kg MS/d
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              {cmsPctPv}% do peso vivo
            </span>
          </div>

          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Proteína Bruta (PB)
            </span>
            <span className="text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {pbRequiredKg.toFixed(2)}{' '}
              <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">kg/d</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              Meta {Math.round(pbPctTarget * 100)}% PB na dieta
            </span>
          </div>

          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Energia (NDT)
            </span>
            <span className="text-base font-semibold tabular-nums text-sky-600 dark:text-sky-400">
              {ndtRequiredKg.toFixed(2)}{' '}
              <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">kg/d</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              Meta {Math.round(ndtPctTarget * 100)}% NDT na dieta
            </span>
          </div>

          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Custo Estimado
            </span>
            <span className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
              R$ {estimatedDailyCostBrl.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              por animal / dia
            </span>
          </div>
        </div>
      </div>

      {/* Feedstuffs Catalog */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Banco de Alimentos &amp; Bromatologia
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {feeds.length} alimento(s)
          </span>
        </div>

        {feeds.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum alimento cadastrado. Adicione volumosos, palma forrageira ou concentrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 divide-slate-100 dark:divide-zinc-800 p-4 gap-4">
            {feeds.map(feed => (
              <div
                key={feed.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      {feed.category}
                    </span>
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate mt-0.5">
                      {feed.name}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 shrink-0">
                    R$ {feed.costPerKgBrl.toFixed(2)}/kg
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs tabular-nums">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">MS</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {feed.dryMatterPct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">PB</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {feed.crudeProteinPct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">NDT</span>
                    <span className="font-medium text-sky-600 dark:text-sky-400">
                      {feed.ndtPct}%
                    </span>
                  </div>
                </div>

                {feed.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1.5 border-t border-slate-100 dark:border-zinc-800">
                    {feed.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Feed Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Novo Alimento Caprino
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Nome do Alimento *
                </label>
                <input
                  type="text"
                  required
                  value={newFeed.name || ''}
                  onChange={e => setNewFeed({ ...newFeed, name: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Silagem de Sorgo, Feno de Leucena..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={newFeed.category || 'Concentrado'}
                    onChange={e =>
                      setNewFeed({ ...newFeed, category: e.target.value as CaprineFeedCategory })
                    }
                    className={inputCls}
                  >
                    {FEED_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Custo / kg (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newFeed.costPerKgBrl ?? 1.5}
                    onChange={e =>
                      setNewFeed({ ...newFeed, costPerKgBrl: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    MS (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFeed.dryMatterPct ?? 88}
                    onChange={e =>
                      setNewFeed({ ...newFeed, dryMatterPct: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    PB (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFeed.crudeProteinPct ?? 18}
                    onChange={e =>
                      setNewFeed({ ...newFeed, crudeProteinPct: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    NDT (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFeed.ndtPct ?? 70}
                    onChange={e =>
                      setNewFeed({ ...newFeed, ndtPct: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  value={newFeed.notes || ''}
                  onChange={e => setNewFeed({ ...newFeed, notes: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Fornecer picado no cocho com fibra longa"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
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
