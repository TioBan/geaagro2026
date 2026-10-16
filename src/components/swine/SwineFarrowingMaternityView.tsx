import React, { useState } from 'react';
import {
  Baby,
  Heart,
  Scale,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  FarrowingLitter,
  SwineAnimal,
} from '../../types/swine';

interface SwineFarrowingMaternityViewProps {
  litters: FarrowingLitter[];
  onAddLitter: (litter: FarrowingLitter) => void;
  onUpdateLitter: (litter: FarrowingLitter) => void;
  animals: SwineAnimal[];
}

export const SwineFarrowingMaternityView: React.FC<SwineFarrowingMaternityViewProps> = ({
  litters,
  onAddLitter,
  onUpdateLitter,
  animals,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [sowCode, setSowCode] = useState('MTZ-1042');
  const [farrowingDate, setFarrowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [penNumber, setPenNumber] = useState('Maternidade 05');
  const [bornAlive, setBornAlive] = useState(15);
  const [stillborn, setStillborn] = useState(1);
  const [mummified, setMummified] = useState(0);
  const [avgBirthWeight, setAvgBirthWeight] = useState(1.45);
  const [uniformityCv, setUniformityCv] = useState(8.5);
  const [colostrumChecked, setColostrumChecked] = useState(true);
  const [splitNursing, setSplitNursing] = useState(true);

  const totalPigletsInMaternity = litters.reduce(
    (acc, l) => acc + (l.status === 'Em Lactação' ? l.currentPigletsCount : 0),
    0
  );

  const totalBornAlive = (litters || []).reduce((acc, l) => acc + (l?.bornAlive || 0), 0);
  const totalStillborn = (litters || []).reduce((acc, l) => acc + (l?.stillborn || 0), 0);
  const avgBirthWeightGlobal =
    (litters || []).length > 0
      ? ((litters || []).reduce((acc, l) => acc + (l?.avgBirthWeightKg || 0), 0) / (litters || []).length).toFixed(2)
      : '1.45';

  const handleSaveLitter = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(bornAlive) + Number(stillborn) + Number(mummified);
    const newLitter: FarrowingLitter = {
      id: `lit_${Date.now()}`,
      sowId: `sow_${Date.now()}`,
      sowCode: sowCode.trim(),
      farrowingDate,
      penNumber,
      totalBorn: total,
      bornAlive: Number(bornAlive),
      stillborn: Number(stillborn),
      mummified: Number(mummified),
      avgBirthWeightKg: Number(avgBirthWeight),
      litterUniformityCvPct: Number(uniformityCv),
      colostrumIntakeChecked: colostrumChecked,
      splitNursingApplied: splitNursing,
      crossFosteredIn: 0,
      crossFosteredOut: 0,
      currentPigletsCount: Number(bornAlive),
      preWeaningMortalityCount: 0,
      status: 'Em Lactação',
    };

    onAddLitter(newLitter);
    setIsModalOpen(false);
  };

  const handleApplyCrossFostering = (litterId: string, direction: 'in' | 'out') => {
    const target = (litters || []).find(l => l?.id === litterId);
    if (!target) return;

    const updated: FarrowingLitter = {
      ...target,
      crossFosteredIn: direction === 'in' ? target.crossFosteredIn + 1 : target.crossFosteredIn,
      crossFosteredOut: direction === 'out' ? target.crossFosteredOut + 1 : target.crossFosteredOut,
      currentPigletsCount:
        direction === 'in' ? target.currentPigletsCount + 1 : Math.max(0, target.currentPigletsCount - 1),
    };
    onUpdateLitter(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-amber-600" />
            <span>Setor de Maternidade & Manejo de Leitegadas</span>
          </h2>
          <p className="text-xs text-gray-500">
            Controle de partos, peso ao nascer, uniformidade (CV%), ingestão de colostro, adoções cruzadas e desmame.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Parto na Maternidade</span>
        </button>
      </div>

      {/* Maternity KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Leitões Lactantes</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalPigletsInMaternity}</div>
          <span className="text-[11px] text-gray-500 font-medium">nas baias de maternidade</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Nascidos Vivos (Total)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalBornAlive}</div>
          <span className="text-[11px] text-gray-500 font-medium">{totalStillborn} natimortos</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Peso Médio ao Nascer</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{avgBirthWeightGlobal} kg</div>
          <span className="text-[11px] text-emerald-600 font-medium">Meta &gt; 1.35 kg</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Uniformidade Média</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">CV 9.8%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Lotes uniformes (&lt; 12%)</span>
        </div>
      </div>

      {/* Litters in Lactation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {litters.map(litter => (
          <div
            key={litter.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4 hover:border-amber-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-gray-900">{litter.sowCode}</h3>
                  <span className="text-xs font-bold text-gray-500">({litter.penNumber})</span>
                </div>
                <span className="text-xs text-gray-500 block">
                  Parto: {litter.farrowingDate}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {litter.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Vivos</span>
                <span className="font-bold text-emerald-700">{litter.bornAlive}</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Natimortos</span>
                <span className="font-bold text-gray-700">{litter.stillborn}</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Peso Méd.</span>
                <span className="font-bold text-gray-900">{litter.avgBirthWeightKg} kg</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Atual</span>
                <span className="font-black text-amber-600">{litter.currentPigletsCount}</span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs space-y-1 text-gray-700">
              <div className="flex items-center justify-between">
                <span>Ingestão de Colostro Monitorada:</span>
                <span className="font-bold text-emerald-700">
                  {litter.colostrumIntakeChecked ? ' Sim (100%)' : ' Pendente'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Manejo de Mamada Intermitente (Split Nursing):</span>
                <span className="font-bold text-gray-900">
                  {litter.splitNursingApplied ? ' Aplicado' : ' Não necessário'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Adoções / Transferências:</span>
                <span className="font-bold text-gray-900">
                  +{litter.crossFosteredIn} / -{litter.crossFosteredOut}
                </span>
              </div>
            </div>

            {/* Cross Fostering Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-medium">Manejo de Adoção:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplyCrossFostering(litter.id, 'in')}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors"
                >
                  + Adotar Leitão
                </button>
                <button
                  onClick={() => handleApplyCrossFostering(litter.id, 'out')}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors"
                >
                  - Doar Leitão
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Novo Parto na Maternidade</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSaveLitter} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Brinco da Matriz *</label>
                  <input
                    type="text"
                    required
                    value={sowCode}
                    onChange={e => setSowCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Baia da Maternidade</label>
                  <input
                    type="text"
                    value={penNumber}
                    onChange={e => setPenNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Nascidos Vivos *</label>
                  <input
                    type="number"
                    value={bornAlive}
                    onChange={e => setBornAlive(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Natimortos</label>
                  <input
                    type="number"
                    value={stillborn}
                    onChange={e => setStillborn(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Mumificados</label>
                  <input
                    type="number"
                    value={mummified}
                    onChange={e => setMummified(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Peso Médio ao Nascer (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={avgBirthWeight}
                    onChange={e => setAvgBirthWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Uniformidade (CV %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={uniformityCv}
                    onChange={e => setUniformityCv(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colostrumChecked}
                    onChange={e => setColostrumChecked(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>Ingestão de Colostro garantida nas primeiras 2 horas</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitNursing}
                    onChange={e => setSplitNursing(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>Aplicar mamada dividida (Split Nursing) para leitões mais leves</span>
                </label>
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
                  Salvar Parto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
