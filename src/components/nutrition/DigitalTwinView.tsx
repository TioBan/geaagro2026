import React, { useState } from 'react';
import { DietFormulation, DigitalTwinValidation } from '../../types/animalNutrition';
import { getSpeciesLabel } from './nutritionConstants';
import { Plus, Calendar, ClipboardList, X } from 'lucide-react';

interface Props {
  formulation: DietFormulation | null;
  formulations: DietFormulation[];
  onSelectFormulation: (dietId: string) => void;
  onAddValidation: (dietId: string, validation: DigitalTwinValidation) => void;
  onNavigateFormulator?: () => void;
}

export const DigitalTwinView: React.FC<Props> = ({
  formulation,
  formulations,
  onSelectFormulation,
  onAddValidation,
  onNavigateFormulator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observedMilkLiters, setObservedMilkLiters] = useState<number>(33.8);
  const [observedAdgKg, setObservedAdgKg] = useState<number>(1.52);
  const [feedRefusalPct, setFeedRefusalPct] = useState<number>(3.5);
  const [fecalScore, setFecalScore] = useState<number>(3.0);
  const [dryMatterIntakeKg, setDryMatterIntakeKg] = useState<number>(
    formulation?.totalDmiKgPerAnimal || 20
  );
  const [notes, setNotes] = useState('');

  if (!formulation) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Nenhuma dieta selecionada para validação de campo
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Crie uma formulação primeiro para registrar sobras de cocho, escore fecal e comparar produção real com o projetado.
        </p>
        {onNavigateFormulator && (
          <button
            type="button"
            onClick={onNavigateFormulator}
            className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Abrir Formulador
          </button>
        )}
      </div>
    );
  }

  const isDairy = formulation.species === 'bovinos_leite';
  const expectedTarget =
    formulation.igen?.expectedGain && formulation.igen.expectedGain > 0
      ? formulation.igen.expectedGain
      : isDairy
      ? 34.0
      : 1.5;

  const validations: DigitalTwinValidation[] = formulation.digitalTwin || [];

  const openModal = () => {
    setDryMatterIntakeKg(formulation.totalDmiKgPerAnimal);
    setObservedMilkLiters(isDairy ? expectedTarget : 33.8);
    setObservedAdgKg(!isDairy ? expectedTarget : 1.5);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const observedValue = isDairy ? observedMilkLiters : observedAdgKg;
    const deviation = Math.round((observedValue - expectedTarget) * 100) / 100;

    let recommendedAdjustments = 'Dieta em equilíbrio fisiológico e produtivo.';
    if (feedRefusalPct < 1.0) {
      recommendedAdjustments =
        'Sobras baixas (<2%). Risco de restrição alimentar no cocho. Elevar oferta diária em 3 a 5%.';
    } else if (feedRefusalPct > 8.0) {
      recommendedAdjustments =
        'Sobras excessivas (>8%). Ajustar volume da batelada para reduzir desperdício e fermentação no cocho.';
    } else if (fecalScore < 2.5) {
      recommendedAdjustments =
        'Fezes fluidas (escore < 2,5), indicativo de passagem rápida ou risco de SARA. Aumentar fibra fisicamente efetiva (peNDF).';
    } else if (fecalScore > 3.8) {
      recommendedAdjustments =
        'Fezes firmes/ressecadas (escore > 3,8). Avaliar digestibilidade da fibra e teor de proteína degradável no rúmen.';
    }

    const newValidation: DigitalTwinValidation = {
      id: `val_${Date.now()}`,
      date,
      formulationVersion: formulation.version,
      observedMilkLiters: isDairy ? observedMilkLiters : undefined,
      observedAdgKg: !isDairy ? observedAdgKg : undefined,
      milkDeviation: deviation,
      feedRefusalPct,
      fecalScore,
      dryMatterIntakeKg,
      notes: notes.trim(),
      recommendedAdjustments,
    };

    onAddValidation(formulation.id, newValidation);
    setIsModalOpen(false);
  };

  const inputCls =
    'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

  return (
    <div id="digital-twin-view" className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Gêmeo Digital da Dieta & Validação de Campo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare o desempenho projetado com medições reais de cocho, escore fecal e produção do lote
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {formulations.length > 1 && (
            <select
              value={formulation.id}
              onChange={(e) => onSelectFormulation(e.target.value)}
              className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {formulations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({getSpeciesLabel(f.species)})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={openModal}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Aferição
          </button>
        </div>
      </div>

      {/* Unified 3-KPI Hairline Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Meta Projetada</span>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {isDairy ? `${expectedTarget.toFixed(1)} L / vaca / dia` : `${expectedTarget.toFixed(2)} kg GMD / dia`}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Consumo previsto: {formulation.totalDmiKgPerAnimal.toFixed(1)} kg MS
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Última Aferição de Campo</span>
          <div className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {validations.length > 0
              ? `${validations[0].observedMilkLiters ?? validations[0].observedAdgKg ?? 0} ${
                  isDairy ? 'L/dia' : 'kg/dia'
                }`
              : 'Sem aferição'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Sobras de cocho: {validations.length > 0 ? `${validations[0].feedRefusalPct}%` : '—'}
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Último Escore Fecal</span>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {validations.length > 0 ? `${validations[0].fecalScore} / 5.0` : '—'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Faixa ideal de referência: 2,8 a 3,5
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Histórico de Aferições ({validations.length})
        </h4>

        {validations.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhuma aferição registrada para esta dieta. Clique em &ldquo;Registrar Aferição&rdquo; para iniciar a calibração em campo.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {validations.map((v) => {
              const unit = isDairy ? 'L' : 'kg';
              const dev = v.milkDeviation ?? 0;

              return (
                <div key={v.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-900 dark:text-white">{v.date}</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        · Dieta v{v.formulationVersion}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 tabular-nums">
                      <span>
                        Sobras: <strong className="text-slate-900 dark:text-white">{v.feedRefusalPct}%</strong>
                      </span>
                      <span>
                        Escore Fecal: <strong className="text-slate-900 dark:text-white">{v.fecalScore}</strong>
                      </span>
                      <span>
                        Consumo: <strong className="text-slate-900 dark:text-white">{v.dryMatterIntakeKg} kg MS</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums">
                    <span>
                      Produção real:{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        {v.observedMilkLiters !== undefined
                          ? `${v.observedMilkLiters} L/vaca/d`
                          : `${v.observedAdgKg ?? 0} kg GMD/d`}
                      </strong>
                    </span>
                    <span>
                      Desvio:{' '}
                      <strong className={dev >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                        {dev >= 0 ? `+${dev}` : dev} {unit}
                      </strong>
                    </span>
                  </div>

                  {v.recommendedAdjustments && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-md text-[11px] text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">Diagnóstico técnico:</strong>{' '}
                      {v.recommendedAdjustments}
                      {v.notes && <span className="block mt-1 text-slate-500 dark:text-slate-400">Obs.: {v.notes}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-lg my-6 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Registrar Aferição de Campo
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Data da Aferição</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    {isDairy ? 'Leite Real (L/cab)' : 'GMD Real (kg/dia)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={isDairy ? observedMilkLiters : observedAdgKg}
                    onChange={(e) =>
                      isDairy
                        ? setObservedMilkLiters(Number(e.target.value))
                        : setObservedAdgKg(Number(e.target.value))
                    }
                    className={`${inputCls} font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums`}
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    Sobras Cocho (% meta 3–5%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={feedRefusalPct}
                    onChange={(e) => setFeedRefusalPct(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Escore Fecal (1 a 5)</label>
                  <select
                    value={fecalScore}
                    onChange={(e) => setFecalScore(Number(e.target.value))}
                    className={inputCls}
                  >
                    <option value="1">1.0 - Líquida / Diarreia</option>
                    <option value="2">2.0 - Mole / Sem Forma</option>
                    <option value="3">3.0 - Ideal (Pastosa / Anéis)</option>
                    <option value="4">4.0 - Firme / Espessa</option>
                    <option value="5">5.0 - Seca / Bolas duras</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Consumo Real (kg MS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dryMatterIntakeKg}
                    onChange={(e) => setDryMatterIntakeKg(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Observações da Batelada / Lote
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Temperatura elevada, mistura homogênea no vagão..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md"
                >
                  Salvar Aferição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
