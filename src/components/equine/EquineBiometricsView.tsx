import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  Ruler,
  Calculator,
  Plus,
  X,
  Activity,
} from 'lucide-react';
import { EquineAnimal, EquineBiometricsRecord } from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals: EquineAnimal[];
  selectedAnimalId?: string;
  biometricsRecords: EquineBiometricsRecord[];
  onAddBiometrics: (record: EquineBiometricsRecord) => void;
}

const HENNEKE_SCALE = [
  { score: 1, title: 'Emaciado', desc: 'Costelas, coluna e garupa extremamente proeminentes; sem tecido adiposo.' },
  { score: 2, title: 'Muito Magro', desc: 'Cobertura mínima sobre vértebras; ossos do quadril bem evidentes.' },
  { score: 3, title: 'Magro', desc: 'Costelas facilmente visíveis; pescoço e cernelha acentuados.' },
  { score: 4, title: 'Moderadamente Magro', desc: 'Contorno discreto das costelas; ligeira cobertura na garupa.' },
  { score: 5, title: 'Moderado (Ideal)', desc: 'Costelas palpáveis sem serem visíveis; dorso nivelado.' },
  { score: 6, title: 'Moderadamente Gordo', desc: 'Gordura suave sobre costelas e inserção da cauda; excelente para esportes.' },
  { score: 7, title: 'Gordo', desc: 'Depósitos de gordura palpáveis nas costelas, pescoço e cernelha.' },
  { score: 8, title: 'Muito Gordo', desc: 'Sulco dorsal aparente; espessamento nítido de pescoço; risco de laminite.' },
  { score: 9, title: 'Obeso', desc: 'Acúmulo severo em crista do pescoço e garupa; alto risco metabólico.' },
];

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineBiometricsView: React.FC<Props> = ({
  animals,
  selectedAnimalId,
  biometricsRecords,
  onAddBiometrics,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const [currentId, setCurrentId] = useState<string>(selectedAnimalId || safeAnimals[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [calcHeartGirth, setCalcHeartGirth] = useState<number>(178);
  const [calcBodyLength, setCalcBodyLength] = useState<number>(165);

  const [formData, setFormData] = useState<Partial<EquineBiometricsRecord>>({
    date: new Date().toISOString().split('T')[0],
    weightKg: 450,
    heightM: 1.52,
    chestCircumferenceCm: 178,
    bodyLengthCm: 165,
    shinCircumferenceCm: 19.5,
    bodyScore: 6,
    measuredBy: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedAnimalId && safeAnimals.some(a => a.id === selectedAnimalId)) {
      setCurrentId(selectedAnimalId);
    } else if (!safeAnimals.some(a => a.id === currentId)) {
      setCurrentId(safeAnimals[0]?.id || '');
    }
  }, [selectedAnimalId, safeAnimals, currentId]);

  const animal = safeAnimals.find(a => a.id === currentId) || safeAnimals[0];

  useEffect(() => {
    if (animal) {
      setCalcHeartGirth(animal.chestCircumferenceCm || 178);
      setCalcBodyLength(animal.bodyLengthCm || 165);
      setFormData(prev => ({
        ...prev,
        weightKg: animal.weightKg || 450,
        heightM: animal.heightM || 1.52,
        chestCircumferenceCm: animal.chestCircumferenceCm || 178,
        bodyLengthCm: animal.bodyLengthCm || 165,
        bodyScore: animal.bodyScore || 5,
      }));
    }
  }, [animal?.id]);

  // Hall & Carroll formula: Peso (kg) = (PT^2 * CC) / 11877
  const estimatedWeightKg = Math.round((calcHeartGirth * calcHeartGirth * calcBodyLength) / 11877);

  const animalHistory = useMemo(
    () =>
      (biometricsRecords || [])
        .filter(r => r && r.animalId === animal?.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [biometricsRecords, animal?.id]
  );

  const handleOpenModalFromCalc = () => {
    setFormData(prev => ({
      ...prev,
      weightKg: estimatedWeightKg,
      estimatedWeightKg,
      chestCircumferenceCm: calcHeartGirth,
      bodyLengthCm: calcBodyLength,
    }));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal) return;

    const newRecord: EquineBiometricsRecord = {
      id: `bio-${Date.now()}`,
      animalId: animal.id,
      date: formData.date || new Date().toISOString().split('T')[0],
      weightKg: Number(formData.weightKg) || estimatedWeightKg,
      heightM: Number(formData.heightM) || animal.heightM || 1.5,
      chestCircumferenceCm: Number(formData.chestCircumferenceCm) || calcHeartGirth,
      bodyLengthCm: formData.bodyLengthCm ? Number(formData.bodyLengthCm) : calcBodyLength,
      shinCircumferenceCm: formData.shinCircumferenceCm ? Number(formData.shinCircumferenceCm) : undefined,
      estimatedWeightKg,
      bodyScore: Number(formData.bodyScore) || 5,
      measuredBy: formData.measuredBy?.trim() || 'Responsável Técnico',
      notes: formData.notes || '',
    };

    onAddBiometrics(newRecord);
    setIsModalOpen(false);
  };

  if (!animal) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
          <EquinoIcon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum equino cadastrado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cadastre um animal no Plantel para registrar pesagens, medidas morfométricas e escore Henneke.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Biometria, Pesagem & Escala Henneke</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Estimativa barimétrica de peso vivo (Hall &amp; Carroll), alçada e evolução corporal do plantel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={animal.id}
            onChange={e => setCurrentId(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            {safeAnimals.map((a, idx) => (
              <option key={a.id || idx} value={a.id}>
                {a.name} ({a.breed})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Medição</span>
          </button>
        </div>
      </div>

      {/* Unified Current Measurements Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Peso Atual</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {animal.weightKg} kg
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Altura de Cernelha</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {animal.heightM.toFixed(2)} m
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Perímetro Torácico</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {animal.chestCircumferenceCm || '—'} cm
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Escore Henneke</span>
            <span className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
              {animal.bodyScore} / 9
            </span>
          </div>
        </div>
      </div>

      {/* Barimetric Calculator + Henneke Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Calculadora Barimétrica (Hall &amp; Carroll)</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Peso (kg) = (Perímetro Torácico² × Comprimento Corporal) ÷ 11.877
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  Perímetro Torácico (PT)
                </span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {calcHeartGirth} cm
                </span>
              </div>
              <input
                type="range"
                min={120}
                max={220}
                value={calcHeartGirth}
                onChange={e => setCalcHeartGirth(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  Comprimento Corporal — Ponta da Espádua ao Ísquio (CC)
                </span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {calcBodyLength} cm
                </span>
              </div>
              <input
                type="range"
                min={110}
                max={200}
                value={calcBodyLength}
                onChange={e => setCalcBodyLength(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Peso Vivo Estimado
              </span>
              <span className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {estimatedWeightKg} kg
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenModalFromCalc}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Lançar esta Medição</span>
            </button>
          </div>
        </div>

        {/* Henneke 1-9 Reference */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Escala de Escore Corporal Henneke (1–9)</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Faixa ideal para atletas e matrizes: 5,0 a 6,0
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              Atual: {animal.bodyScore}/9
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-60 overflow-y-auto pr-1">
            {HENNEKE_SCALE.map(item => {
              const isCurrent = Math.round(animal.bodyScore || 5) === item.score;
              return (
                <div
                  key={item.score}
                  className={`py-2 px-2 rounded-md flex items-start gap-2.5 text-xs ${
                    isCurrent ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded text-[11px] font-semibold flex items-center justify-center shrink-0 tabular-nums ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.score}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {item.title}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Measurements Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Histórico Biométrico — {animal.name}
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {animalHistory.length} registro{animalHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        {animalHistory.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma medição histórica registrada para este animal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Data</th>
                  <th className="px-4 py-2.5 font-medium">Peso (kg)</th>
                  <th className="px-4 py-2.5 font-medium">Cernelha</th>
                  <th className="px-4 py-2.5 font-medium">Perím. Torácico</th>
                  <th className="px-4 py-2.5 font-medium">Canela</th>
                  <th className="px-4 py-2.5 font-medium">Henneke</th>
                  <th className="px-4 py-2.5 font-medium">Avaliador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                {animalHistory.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                      {new Date(rec.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-zinc-100">
                      {rec.weightKg} kg
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">
                      {rec.heightM.toFixed(2)} m
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">
                      {rec.chestCircumferenceCm} cm
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">
                      {rec.shinCircumferenceCm ? `${rec.shinCircumferenceCm} cm` : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      {rec.bodyScore}/9
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400">
                      {rec.measuredBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Biometric Measurement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Registrar Avaliação Biométrica — {animal.name}
                </h3>
              </div>
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
                <div>
                  <label className={labelCls}>Data da Medição</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Peso Vivo (kg) *</label>
                  <input
                    type="number"
                    required
                    value={formData.weightKg}
                    onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Cernelha (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.heightM}
                    onChange={e => setFormData({ ...formData, heightM: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Escore Henneke (1–9)</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    step={0.5}
                    value={formData.bodyScore}
                    onChange={e => setFormData({ ...formData, bodyScore: Number(e.target.value) || 5 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Perímetro Torácico (cm)</label>
                  <input
                    type="number"
                    value={formData.chestCircumferenceCm}
                    onChange={e => setFormData({ ...formData, chestCircumferenceCm: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Comprimento Corporal (cm)</label>
                  <input
                    type="number"
                    value={formData.bodyLengthCm}
                    onChange={e => setFormData({ ...formData, bodyLengthCm: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Perímetro de Canela (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.shinCircumferenceCm ?? ''}
                    onChange={e => setFormData({ ...formData, shinCircumferenceCm: Number(e.target.value) || undefined })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Avaliador / Responsável</label>
                  <input
                    type="text"
                    value={formData.measuredBy || ''}
                    onChange={e => setFormData({ ...formData, measuredBy: e.target.value })}
                    placeholder="Zootecnista / Veterinário"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
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
                  Salvar Medição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
