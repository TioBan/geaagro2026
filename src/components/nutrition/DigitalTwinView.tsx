import React, { useState } from 'react';
import { DietFormulation, DigitalTwinValidation } from '../../types/animalNutrition';
import {
  Activity,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Scale,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface Props {
  formulation: DietFormulation;
  onAddValidation: (dietId: string, validation: DigitalTwinValidation) => void;
}

export const DigitalTwinView: React.FC<Props> = ({ formulation, onAddValidation }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observedMilkLiters, setObservedMilkLiters] = useState<number>(33.8);
  const [observedAdgKg, setObservedAdgKg] = useState<number>(1.52);
  const [feedRefusalPct, setFeedRefusalPct] = useState<number>(3.5); // % sobras no cocho
  const [fecalScore, setFecalScore] = useState<number>(3.0); // 1 a 5
  const [dryMatterIntakeKg, setDryMatterIntakeKg] = useState<number>(formulation.totalDmiKgPerAnimal);
  const [notes, setNotes] = useState('');

  const validations = formulation.digitalTwin || [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Check deviation
    const expectedMilk = 34.0;
    const milkDeviation = observedMilkLiters ? Math.round((observedMilkLiters - expectedMilk) * 10) / 10 : 0;
    
    // Auto recommendation
    let recommendedAdjustments = 'Dieta em equilíbrio fisiológico e produtivo.';
    if (feedRefusalPct < 1.0) {
      recommendedAdjustments = 'Sobras baixas (<2%). Risco de subalimentação do lote. Recomenda-se aumentar fornecimento em 3 a 5%.';
    } else if (feedRefusalPct > 8.0) {
      recommendedAdjustments = 'Sobras excessivas (>8%). Ajustar batelada para evitar desperdício e acidificação do cocho.';
    } else if (fecalScore < 2.5) {
      recommendedAdjustments = 'Fezes líquidas / escore < 2.5 (sinal de trânsito rápido ou SARA). Elevar FDN fisicamente efetivo (peNDF).';
    } else if (fecalScore > 3.8) {
      recommendedAdjustments = 'Fezes ressecadas / aneladas. Avaliar digestibilidade da fibra ou excesso de lignina.';
    }

    const newValidation: DigitalTwinValidation = {
      id: `val_${Date.now()}`,
      date,
      formulationVersion: formulation.version,
      observedMilkLiters,
      observedAdgKg,
      milkDeviation,
      feedRefusalPct,
      fecalScore,
      dryMatterIntakeKg,
      notes,
      recommendedAdjustments,
    };

    onAddValidation(formulation.id, newValidation);
    setIsModalOpen(false);
  };

  return (
    <div id="digital-twin-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Gêmeo Digital da Dieta & Validação de Campo
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare o projetado no software vs o executado e observado nos animais (sobras de cocho, escore de fezes, leite real e GMD)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
        >
          <Plus className="w-4 h-4" />
          Registrar Aferição de Campo
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Meta Projetada no Software</span>
          <div className="mt-2 text-xl font-bold text-white">
            {formulation.species === 'bovinos_leite' ? '34.0 L / vaca / dia' : '1.50 kg GMD / dia'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consumo esperado: {formulation.totalDmiKgPerAnimal} kg MS</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Última Média de Campo Observada</span>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            {validations.length > 0
              ? `${validations[0].observedMilkLiters || validations[0].observedAdgKg} ${
                  formulation.species === 'bovinos_leite' ? 'L/dia' : 'kg/dia'
                }`
              : 'Sem aferição recente'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sobras médias: {validations.length > 0 ? `${validations[0].feedRefusalPct}%` : '3.5%'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Escore Fecal Médio</span>
          <div className="mt-2 text-xl font-bold text-amber-400">
            {validations.length > 0 ? `${validations[0].fecalScore} / 5.0` : '3.0 (Ideal)'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Referência: Escore 3.0 = consistência ótima</p>
        </div>
      </div>

      {/* Field Validations History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-400" />
          Histórico de Aferições e Calibração da Dieta
        </h4>

        {validations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhuma aferição de campo registrada ainda. Clique em "Registrar Aferição de Campo" para calibrar o Gêmeo Digital.
          </div>
        ) : (
          <div className="space-y-3">
            {validations.map((v) => (
              <div
                key={v.id}
                className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <strong className="text-white font-bold">{v.date}</strong>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                      Versão Dieta: v{v.formulationVersion}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      Sobras no Cocho: <strong className="text-white">{v.feedRefusalPct}%</strong>
                    </span>
                    <span className="text-slate-400">
                      Escore Fecal: <strong className="text-amber-400">{v.fecalScore}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Produção Observada</span>
                    <strong className="text-emerald-400 text-sm">
                      {v.observedMilkLiters ? `${v.observedMilkLiters} L/vaca/dia` : `${v.observedAdgKg} kg GMD/dia`}
                    </strong>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Desvio vs Projetado</span>
                    <strong className={`text-sm ${v.milkDeviation && v.milkDeviation >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {v.milkDeviation && v.milkDeviation >= 0 ? `+${v.milkDeviation}` : v.milkDeviation} L
                    </strong>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block">Consumo Efetivo Aferido</span>
                    <strong className="text-white text-sm">{v.dryMatterIntakeKg} kg MS/dia</strong>
                  </div>
                </div>

                {v.recommendedAdjustments && (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-300 text-[11px] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Diagnóstico & Recomendação GeaAgro:</strong>
                      <span>{v.recommendedAdjustments}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for adding validation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Registrar Aferição no Campo
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Data da Aferição</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">
                    {formulation.species === 'bovinos_leite' ? 'Leite Real (L/cab)' : 'GMD Real (kg/dia)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formulation.species === 'bovinos_leite' ? observedMilkLiters : observedAdgKg}
                    onChange={(e) =>
                      formulation.species === 'bovinos_leite'
                        ? setObservedMilkLiters(Number(e.target.value))
                        : setObservedAdgKg(Number(e.target.value))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Sobras no Cocho (% Alvo 3-5%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={feedRefusalPct}
                    onChange={(e) => setFeedRefusalPct(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Escore Fecal (1 a 5)</label>
                  <select
                    value={fecalScore}
                    onChange={(e) => setFecalScore(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="1">1.0 - Líquida / Diarreia</option>
                    <option value="2">2.0 - Mole / Sem Forma</option>
                    <option value="3">3.0 - Ideal (Pastosa / Anéis)</option>
                    <option value="4">4.0 - Firme / Espessa</option>
                    <option value="5">5.0 - Seca / Bolas duras</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Consumo Real (kg MS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dryMatterIntakeKg}
                    onChange={(e) => setDryMatterIntakeKg(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observações da Batelada / Lote</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Clima muito quente no dia, mistura homogênea no vagão..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg"
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
