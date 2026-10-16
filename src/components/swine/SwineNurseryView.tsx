import React, { useState } from 'react';
import {
  Activity,
  TrendingUp,
  Scale,
  Plus,
  ArrowRight,
  Boxes,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  SwineBatch,
} from '../../types/swine';

interface SwineNurseryViewProps {
  batches: SwineBatch[];
  onAddBatch: (batch: SwineBatch) => void;
  onUpdateBatch: (batch: SwineBatch) => void;
}

export const SwineNurseryView: React.FC<SwineNurseryViewProps> = ({
  batches,
  onAddBatch,
  onUpdateBatch,
}) => {
  const nurseryBatches = batches.filter(b => b.stage === 'creche');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [code, setCode] = useState(`LOTE-CR-${new Date().getFullYear()}-05`);
  const [lineage, setLineage] = useState('Camborough (Agroceres PIC)');
  const [shedName, setShedName] = useState('Galpão 03 - Creche Climatizada');
  const [animalsCount, setAnimalsCount] = useState(220);
  const [initialWeight, setInitialWeight] = useState(6.8);
  const [targetWeight, setTargetWeight] = useState(28.0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: SwineBatch = {
      id: `batch_cr_${Date.now()}`,
      code: code.trim(),
      stage: 'creche',
      lineage: lineage as any,
      shedId: 'shed_03',
      shedName,
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 42 * 86400000).toISOString().split('T')[0],
      initialAnimalsCount: Number(animalsCount),
      currentAnimalsCount: Number(animalsCount),
      mortalityCount: 0,
      initialAvgWeightKg: Number(initialWeight),
      currentAvgWeightKg: Number(initialWeight),
      targetWeightKg: Number(targetWeight),
      totalFeedConsumedKg: 0,
      totalWaterConsumedL: 0,
      feedConversionRatio: 1.25,
      averageDailyGainG: 440,
      dailyFeedCostPerAnimal: 1.80,
      status: 'Ativo',
    };

    onAddBatch(newBatch);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>Creche Suinícola Climatizada</span>
          </h2>
          <p className="text-xs text-gray-500">
            Acompanhamento zootécnico de lotes pós-desmame (6 a 28 kg), conversão alimentar e ganho de peso diário.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Alojamento de Novo Lote de Creche</span>
        </button>
      </div>

      {/* Nursery KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Lotes Ativos</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{(nurseryBatches || []).length} lotes</div>
          <span className="text-[11px] text-gray-500 font-medium">em desenvolvimento</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Conversão Alimentar (CA)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">1.25</div>
          <span className="text-[11px] text-emerald-600 font-medium">Meta &lt; 1.35 kg/kg</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Ganho Médio Diário</span>
          <div className="text-2xl font-black text-gray-900 mt-1">440 g/dia</div>
          <span className="text-[11px] text-gray-500 font-medium">GMD Creche</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Mortalidade Fase</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">1.4%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Padrão Ouro (&lt; 2.0%)</span>
        </div>
      </div>

      {/* Batches Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nurseryBatches.map(batch => (
          <div
            key={batch.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4 hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900">{batch.code}</h3>
                <span className="text-xs text-gray-500 block">
                  {batch.lineage} • {batch.shedName}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                {batch.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Animais</span>
                <span className="font-bold text-gray-900">{batch.currentAnimalsCount}</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Peso Méd.</span>
                <span className="font-bold text-indigo-700">{batch.currentAvgWeightKg} kg</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">GMD</span>
                <span className="font-bold text-emerald-700">{batch.averageDailyGainG} g</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">CA</span>
                <span className="font-black text-gray-900">{batch.feedConversionRatio}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>Início do Lote:</span>
                <span className="font-bold text-gray-800">{batch.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Previsão de Saída para Crescimento:</span>
                <span className="font-bold text-indigo-700">{batch.expectedEndDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Consumo Total de Ração:</span>
                <span className="font-bold text-gray-900">{batch.totalFeedConsumedKg} kg</span>
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
              <h3 className="text-base font-black text-gray-900">Alojamento de Lote de Creche</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Código do Lote *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Linhagem</label>
                  <select
                    value={lineage}
                    onChange={e => setLineage(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  >
                    <option value="Camborough (Agroceres PIC)">Camborough (PIC)</option>
                    <option value="Topigs Norsvin (TN70)">Topigs Norsvin</option>
                    <option value="DanBred">DanBred</option>
                    <option value="Landrace">Landrace</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Galpão de Creche</label>
                  <input
                    type="text"
                    value={shedName}
                    onChange={e => setShedName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={animalsCount}
                    onChange={e => setAnimalsCount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Peso Entrada (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={initialWeight}
                    onChange={e => setInitialWeight(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Peso Meta (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetWeight}
                    onChange={e => setTargetWeight(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
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
                  Salvar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
