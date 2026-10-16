import React, { useState } from 'react';
import {
  Scale,
  TrendingUp,
  Plus,
  Calculator,
  Calendar,
  User,
  Sparkles,
  Info,
  X,
  CheckCircle2,
} from 'lucide-react';
import { EquineAnimal, EquineBiometricsRecord } from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  selectedAnimalId?: string;
  biometricsRecords: EquineBiometricsRecord[];
  onAddBiometrics: (record: EquineBiometricsRecord) => void;
  onUpdateAnimal: (animal: EquineAnimal) => void;
}

export const EquineBiometricsView: React.FC<Props> = ({
  animals,
  selectedAnimalId,
  biometricsRecords,
  onAddBiometrics,
  onUpdateAnimal,
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedAnimalId || (animals[0]?.id ?? ''));
  const animal = animals.find(a => a?.id === currentId) || animals[0];

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Barimetric Calculator state
  const [calcChestCm, setCalcChestCm] = useState<number>(animal?.chestCircumferenceCm || 184);
  const [calcLengthCm, setCalcLengthCm] = useState<number>(animal?.bodyLengthCm || 156);

  // Hall's Barimetric Equation for Equines: (Chest^2 * Length) / 11877
  const estimatedWeightKg = Math.round((Math.pow(calcChestCm, 2) * calcLengthCm) / 11877);

  // Form State for new measurement
  const [formData, setFormData] = useState<Partial<EquineBiometricsRecord>>({
    animalId: animal?.id || '',
    date: new Date().toISOString().split('T')[0],
    weightKg: animal?.weightKg || 450,
    heightM: animal?.heightM || 1.52,
    bodyScore: animal?.bodyScore || 6,
    chestCircumferenceCm: animal?.chestCircumferenceCm || 180,
    shinCircumferenceCm: animal?.shinCircumferenceCm || 19.5,
    bodyLengthCm: animal?.bodyLengthCm || 152,
    measuredBy: 'Dr. Fernando Campos - CRMV 14920',
    notes: '',
  });

  const animalRecords = biometricsRecords
    .filter(b => b.animalId === currentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal) return;

    const newRecord: EquineBiometricsRecord = {
      ...(formData as EquineBiometricsRecord),
      id: `bio-${Date.now()}`,
      animalId: animal.id,
      estimatedWeightKg: Math.round(
        (Math.pow(formData.chestCircumferenceCm || 180, 2) * (formData.bodyLengthCm || 152)) / 11877
      ),
    };

    onAddBiometrics(newRecord);

    // Update animal's current physical parameters
    const updatedAnimal: EquineAnimal = {
      ...animal,
      weightKg: formData.weightKg || animal.weightKg,
      heightM: formData.heightM || animal.heightM,
      chestCircumferenceCm: formData.chestCircumferenceCm || animal.chestCircumferenceCm,
      bodyScore: formData.bodyScore || animal.bodyScore,
      updatedAt: new Date().toISOString(),
    };
    onUpdateAnimal(updatedAnimal);

    setIsModalOpen(false);
  };

  const hennekeScores = [
    { score: '1-2', label: 'Muito Magro / Caquético', desc: 'Ossos das costelas e garupa extremamente salientes.', color: 'text-red-700 bg-red-50' },
    { score: '3-4', label: 'Magro / Abaixo do Peso', desc: 'Costelas facilmente visíveis, pouca cobertura de gordura.', color: 'text-amber-700 bg-amber-50' },
    { score: '5-6', label: 'Escore Ideal (Atleta/Manejo)', desc: 'Costelas facilmente palpáveis mas não visíveis. Dorso nivelado.', color: 'text-emerald-800 bg-emerald-50' },
    { score: '7-8', label: 'Sobrepeso / Gordo', desc: 'Depósitos de gordura ao longo do pescoço, garupa e cernelha.', color: 'text-amber-800 bg-amber-50' },
    { score: '9', label: 'Extremamente Obeso', desc: 'Pescoço abaulado com crista dura, calha dorsal profunda.', color: 'text-red-800 bg-red-50' },
  ];

  if (!animal) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
        <span className="text-4xl">🐎</span>
        <h3 className="text-base font-black text-stone-900 mt-2">Nenhum animal selecionado</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-amber-700" /> Biometria, Resenha Morfológica & Escore Corporal
          </div>
          <h2 className="text-xl font-black text-stone-900">{animal.name}</h2>
          <div className="text-xs text-stone-500 font-mono mt-0.5">
            Registro: <strong>{animal.registrationNumber}</strong> • Categoria: <strong>{animal.category}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentId}
            onChange={e => {
              setCurrentId(e.target.value);
              const found = animals.find(a => a?.id === e.target.value);
              if (found) {
                setCalcChestCm(found.chestCircumferenceCm || 184);
                setCalcLengthCm(found.bodyLengthCm || 156);
              }
            }}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-amber-600"
          >
            {animals.map(a => (
              <option key={a?.id || Math.random()} value={a?.id || ''}>
                {a?.name} ({a?.breed})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFormData({
                animalId: animal.id,
                date: new Date().toISOString().split('T')[0],
                weightKg: animal.weightKg,
                heightM: animal.heightM,
                bodyScore: animal.bodyScore,
                chestCircumferenceCm: animal.chestCircumferenceCm,
                shinCircumferenceCm: animal.shinCircumferenceCm || 19.5,
                bodyLengthCm: animal.bodyLengthCm || 152,
                measuredBy: 'Dr. Fernando Campos - CRMV 14920',
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Aferição</span>
          </button>
        </div>
      </div>

      {/* Current Physical Status KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Peso Balança</span>
          <span className="text-2xl font-black text-stone-900 font-mono">{animal.weightKg} kg</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Balança oficial</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Altura Cernelha</span>
          <span className="text-2xl font-black text-stone-900 font-mono">{animal.heightM} m</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Hipômetro rígido</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Perímetro Torácico</span>
          <span className="text-2xl font-black text-stone-900 font-mono">{animal.chestCircumferenceCm} cm</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Atrás da cernelha</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Escore Henneke</span>
          <span className="text-2xl font-black text-emerald-800 font-mono">{animal.bodyScore} / 9</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Ideal atlético</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Fita Barimétrica</span>
          <span className="text-2xl font-black text-amber-900 font-mono">{estimatedWeightKg} kg</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Fórmula de Hall</span>
        </div>
      </div>

      {/* 2 Cols: Barimetric Calculator & Henneke Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Barimetric Weight Calculator */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>Calculadora Barimétrica de Peso (Equação de Hall)</span>
              </h3>
              <p className="text-xs text-stone-500">Estimativa rápida de peso quando não houver balança de plataforma</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                Perímetro Torácico (PT em cm):
              </label>
              <input
                type="number"
                value={calcChestCm}
                onChange={e => setCalcChestCm(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold font-mono"
              />
              <span className="text-[10px] text-stone-400 block">Medir logo atrás da cernelha</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                Comprimento Corporal (CC em cm):
              </label>
              <input
                type="number"
                value={calcLengthCm}
                onChange={e => setCalcLengthCm(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold font-mono"
              />
              <span className="text-[10px] text-stone-400 block">Ponta da espádua à tuberosidade isquiática</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-amber-100 block">Peso Estimado pela Fita</span>
              <div className="text-2xl font-black font-mono">{estimatedWeightKg} kg</div>
            </div>
            <div className="text-right text-[11px] text-amber-100 font-mono">
              Fórmula: <br />
              (PT² × CC) ÷ 11877
            </div>
          </div>
        </div>

        {/* Henneke Body Condition Scale Guide */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>Escala Henneke de Escore Corporal (1 a 9)</span>
              </h3>
              <p className="text-xs text-stone-500">Padrão internacional de avaliação de gordura corporal equina</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {hennekeScores.map(h => (
              <div key={h.score} className={`p-2.5 rounded-xl border border-stone-200 flex items-start gap-2.5 ${h.color}`}>
                <span className="font-black text-xs font-mono px-2 py-0.5 rounded-md bg-white shadow-xs shrink-0">
                  {h.score}
                </span>
                <div>
                  <div className="font-black text-xs">{h.label}</div>
                  <div className="text-[11px] opacity-80">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Biometrics Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
          Histórico de Pesagens e Medições de {animal.name}
        </h3>

        {animalRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Peso Real (kg)</th>
                  <th className="p-3">Altura (m)</th>
                  <th className="p-3">P. Torácico (cm)</th>
                  <th className="p-3">Escore Henneke</th>
                  <th className="p-3">Aferido por</th>
                  <th className="p-3">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {animalRecords.map(r => (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">
                      {new Date(r.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-bold font-mono text-stone-900">{r.weightKg} kg</td>
                    <td className="p-3 font-mono">{r.heightM} m</td>
                    <td className="p-3 font-mono">{r.chestCircumferenceCm} cm</td>
                    <td className="p-3 font-bold text-emerald-800">{r.bodyScore} / 9</td>
                    <td className="p-3 text-stone-600">{r.measuredBy}</td>
                    <td className="p-3 text-stone-500 italic">{r.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-stone-400 text-xs italic">
            Nenhuma medição cadastrada ainda.
          </div>
        )}
      </div>

      {/* Add Biometric Measurement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">Registrar Aferição Biométrica</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Data da Pesagem</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Peso Balança (kg) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.weightKg}
                    onChange={e => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Altura Cernelha (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.heightM}
                    onChange={e => setFormData({ ...formData, heightM: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">P. Torácico (cm)</label>
                  <input
                    type="number"
                    value={formData.chestCircumferenceCm}
                    onChange={e => setFormData({ ...formData, chestCircumferenceCm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Comprimento Corporal (cm)</label>
                  <input
                    type="number"
                    value={formData.bodyLengthCm}
                    onChange={e => setFormData({ ...formData, bodyLengthCm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Escore Henneke (1-9)</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    step="0.5"
                    value={formData.bodyScore}
                    onChange={e => setFormData({ ...formData, bodyScore: parseFloat(e.target.value) || 6 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Responsável / Veterinário</label>
                <input
                  type="text"
                  value={formData.measuredBy || ''}
                  onChange={e => setFormData({ ...formData, measuredBy: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Observações</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Ótimo tônus muscular dorsal..."
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
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md cursor-pointer"
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
