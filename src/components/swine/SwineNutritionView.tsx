import React, { useState } from 'react';
import { Wheat, Plus, X } from 'lucide-react';
import { SwineFeedDiet } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  formatCurrencyBRL,
  useEscapeClose,
} from './swineUi';

interface SwineNutritionViewProps {
  diets: SwineFeedDiet[];
  onAddDiet: (diet: SwineFeedDiet) => void;
}

const PHASE_LABELS: Record<SwineFeedDiet['phase'], string> = {
  reproducao: 'Reprodução',
  gestacao: 'Gestação',
  lactacao: 'Lactação',
  maternidade: 'Maternidade',
  marrans: 'Marrãs',
  creche: 'Creche',
  crescimento: 'Crescimento',
  terminacao: 'Terminação',
  comercializacao: 'Pré-Abate',
};

export const SwineNutritionView: React.FC<SwineNutritionViewProps> = ({
  diets,
  onAddDiet,
}) => {
  const [selectedDietId, setSelectedDietId] = useState<string>(diets[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<SwineFeedDiet['phase']>('creche');
  const [recommendedWeightRange, setRecommendedWeightRange] = useState('6 – 12 kg');
  const [crudeProtein, setCrudeProtein] = useState(19.5);
  const [energy, setEnergy] = useState(3350);
  const [lysine, setLysine] = useState(1.35);
  const [costKg, setCostKg] = useState(1.85);

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const selectedDiet = diets.find(d => d.id === selectedDietId) ?? diets[0] ?? null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newDiet: SwineFeedDiet = {
      id: `diet_${Date.now()}`,
      name: name.trim(),
      phase,
      recommendedWeightRange: recommendedWeightRange.trim() || 'Conforme fase',
      crudeProteinPct: Number(crudeProtein) || 0,
      metabolizableEnergyKcalKg: Number(energy) || 0,
      digestibleLysinePct: Number(lysine) || 0,
      calciumPct: 0.85,
      availablePhosphorusPct: 0.45,
      costPerKg: Number(costKg) || 0,
      ingredients: [
        { ingredientName: 'Milho Moído Fino', inclusionPct: 62.0 },
        { ingredientName: 'Farelo de Soja 46%', inclusionPct: 26.5 },
        { ingredientName: 'Núcleo / Premix Mineral Vitamínico', inclusionPct: 4.0 },
        { ingredientName: 'Óleo Vegetal Degomado', inclusionPct: 2.0 },
        { ingredientName: 'Aminoácidos / Aditivos', inclusionPct: 5.5 },
      ],
    };

    onAddDiet(newDiet);
    setSelectedDietId(newDiet.id);
    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Nutrição de Precisão & Fórmulas de Ração</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Formulação por fase, proteína bruta, energia metabolizável, lisina digestível e custo por quilo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Dieta</span>
        </button>
      </div>

      {/* Main Content */}
      {diets.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
          <Wheat className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Nenhuma dieta cadastrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastre fórmulas de ração por fase para acompanhar composição nutricional e custo/kg.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Diet List */}
          <div className="space-y-2">
            {diets.map(diet => {
              const isSelected = selectedDiet?.id === diet.id;
              return (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => setSelectedDietId(diet.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {diet.name}
                    </span>
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0 tabular-nums">
                      {formatCurrencyBRL(diet.costPerKg)}/kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 tabular-nums">
                    <span>
                      PB {diet.crudeProteinPct}% · Lisina {diet.digestibleLysinePct}%
                    </span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {diet.recommendedWeightRange}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Diet Details */}
          <div className={`lg:col-span-2 ${SWINE_CARD_CLASS} p-4 space-y-4`}>
            {selectedDiet && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                      {selectedDiet.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Fase: {PHASE_LABELS[selectedDiet.phase] ?? selectedDiet.phase} · Faixa:{' '}
                      {selectedDiet.recommendedWeightRange}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Custo por Quilo
                    </span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {formatCurrencyBRL(selectedDiet.costPerKg)} / kg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Proteína Bruta
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {selectedDiet.crudeProteinPct}%
                    </span>
                  </div>
                  <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Energia Metab.
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {selectedDiet.metabolizableEnergyKcalKg} kcal/kg
                    </span>
                  </div>
                  <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Lisina Digestível
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {selectedDiet.digestibleLysinePct}%
                    </span>
                  </div>
                  <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      P Disp. / Cálcio
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {selectedDiet.availablePhosphorusPct}% / {selectedDiet.calciumPct}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                    Matriz de Ingredientes
                  </h4>
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                        <tr>
                          <th className="px-3 py-2">Ingrediente</th>
                          <th className="px-3 py-2 text-right">Inclusão (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {selectedDiet.ingredients.map(ing => (
                          <tr
                            key={ing.ingredientName}
                            className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                          >
                            <td className="px-3 py-2 text-slate-800 dark:text-zinc-200">
                              {ing.ingredientName}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                              {ing.inclusionPct}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Nova Dieta de Precisão
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
                <label className={SWINE_LABEL_CLASS}>Nome da Fórmula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Creche 1 — Pré-Inicial"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Fase</label>
                  <select
                    value={phase}
                    onChange={e => setPhase(e.target.value as SwineFeedDiet['phase'])}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="creche">Creche</option>
                    <option value="crescimento">Crescimento</option>
                    <option value="terminacao">Terminação</option>
                    <option value="gestacao">Gestação</option>
                    <option value="lactacao">Lactação</option>
                    <option value="marrans">Marrãs</option>
                  </select>
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Faixa de Peso</label>
                  <input
                    type="text"
                    value={recommendedWeightRange}
                    onChange={e => setRecommendedWeightRange(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>PB (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={crudeProtein}
                    onChange={e => setCrudeProtein(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>EM (kcal/kg)</label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={energy}
                    onChange={e => setEnergy(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Lisina (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lysine}
                    onChange={e => setLysine(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Custo (R$/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costKg}
                    onChange={e => setCostKg(Number(e.target.value))}
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
                  Salvar Fórmula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
