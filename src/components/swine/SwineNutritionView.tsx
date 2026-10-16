import React, { useState } from 'react';
import {
  Wheat,
  Plus,
  Scale,
  Sparkles,
  Layers,
  Activity,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  SwineFeedDiet,
} from '../../types/swine';

interface SwineNutritionViewProps {
  diets: SwineFeedDiet[];
  onAddDiet: (diet: SwineFeedDiet) => void;
}

export const SwineNutritionView: React.FC<SwineNutritionViewProps> = ({
  diets,
  onAddDiet,
}) => {
  const [selectedDietId, setSelectedDietId] = useState<string>(diets[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<SwineFeedDiet['phase']>('creche');
  const [recommendedWeightRange, setRecommendedWeightRange] = useState('6 - 12 kg');
  const [crudeProtein, setCrudeProtein] = useState(19.5);
  const [energy, setEnergy] = useState(3350);
  const [lysine, setLysine] = useState(1.35);
  const [costKg, setCostKg] = useState(1.85);

  const selectedDiet = diets.find(d => d?.id === selectedDietId) || diets[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newDiet: SwineFeedDiet = {
      id: `diet_${Date.now()}`,
      name: name.trim(),
      phase,
      recommendedWeightRange,
      crudeProteinPct: Number(crudeProtein),
      metabolizableEnergyKcalKg: Number(energy),
      digestibleLysinePct: Number(lysine),
      calciumPct: 0.85,
      availablePhosphorusPct: 0.45,
      costPerKg: Number(costKg),
      ingredients: [
        { ingredientName: 'Milho Moído Fino', inclusionPct: 62.0 },
        { ingredientName: 'Farelo de Soja 46%', inclusionPct: 26.5 },
        { ingredientName: 'Núcleo / Premix Mineral Vitamínico', inclusionPct: 4.0 },
        { ingredientName: 'Óleo Vegetal Degomado', inclusionPct: 2.0 },
      ],
    };

    onAddDiet(newDiet);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-600" />
            <span>Nutrição de Precisão & Fórmulas de Ração</span>
          </h2>
          <p className="text-xs text-gray-500">
            Formulação por fase biológica, balanço de aminoácidos digestíveis (Lisina/Metionina/Treonina) e custo do kg.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Dieta</span>
        </button>
      </div>

      {/* Diets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of diets */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Dietas & Programas Cadastrados
          </h3>

          <div className="space-y-2">
            {diets.map(diet => (
              <div
                key={diet.id}
                onClick={() => setSelectedDietId(diet.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedDiet?.id === diet.id
                    ? 'bg-amber-50/50 border-amber-500 shadow-xs'
                    : 'bg-white border-gray-200 hover:border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900">{diet.name}</span>
                  <span className="text-xs font-bold text-amber-700">R$ {diet.costPerKg.toFixed(2)}/kg</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>PB: {diet.crudeProteinPct}% • Lisina: {diet.digestibleLysinePct}%</span>
                  <span className="font-bold text-gray-700">{diet.recommendedWeightRange}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Diet Formulation Details */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          {selectedDiet ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{selectedDiet.name}</h3>
                  <p className="text-xs text-gray-500">
                    Fase: {selectedDiet.phase.toUpperCase()} • Faixa de Peso: {selectedDiet.recommendedWeightRange}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block font-medium">Custo por Quilo</span>
                  <span className="text-2xl font-black text-amber-600">
                    R$ {selectedDiet.costPerKg.toFixed(2)} / kg
                  </span>
                </div>
              </div>

              {/* Nutritional Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold block">Proteína Bruta (PB)</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{selectedDiet.crudeProteinPct}%</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold block">Energia Metabolizável</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{selectedDiet.metabolizableEnergyKcalKg} kcal/kg</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold block">Lisina Digestível</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{selectedDiet.digestibleLysinePct}%</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-semibold block">Fósforo Disp. / Cálcio</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{selectedDiet.availablePhosphorusPct}% / {selectedDiet.calciumPct}%</span>
                </div>
              </div>

              {/* Ingredients Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Matriz de Ingredientes & Inclusão na Fórmula
                </h4>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                      <tr>
                        <th className="p-3">Ingrediente</th>
                        <th className="p-3 text-right">Inclusão (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedDiet.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-gray-50/60">
                          <td className="p-3 font-medium text-gray-800">{ing.ingredientName}</td>
                          <td className="p-3 text-right font-bold text-amber-700">{ing.inclusionPct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">Selecione uma dieta para ver detalhes.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Nova Dieta de Precisão</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome da Fórmula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Creche 1 - Lacto Start"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Fase</label>
                  <select
                    value={phase}
                    onChange={e => setPhase(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
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
                  <label className="text-xs font-bold text-gray-700 block mb-1">Faixa de Peso</label>
                  <input
                    type="text"
                    value={recommendedWeightRange}
                    onChange={e => setRecommendedWeightRange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">PB (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={crudeProtein}
                    onChange={e => setCrudeProtein(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Lisina (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lysine}
                    onChange={e => setLysine(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Custo (R$/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costKg}
                    onChange={e => setCostKg(parseFloat(e.target.value))}
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
