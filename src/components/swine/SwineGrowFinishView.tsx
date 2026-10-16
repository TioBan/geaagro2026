import React, { useState } from 'react';
import {
  Scale,
  TrendingUp,
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  Calendar,
} from 'lucide-react';
import {
  SwineBatch,
} from '../../types/swine';

interface SwineGrowFinishViewProps {
  batches: SwineBatch[];
  onAddBatch: (batch: SwineBatch) => void;
  onUpdateBatch: (batch: SwineBatch) => void;
}

export const SwineGrowFinishView: React.FC<SwineGrowFinishViewProps> = ({
  batches,
  onAddBatch,
  onUpdateBatch,
}) => {
  const growFinishBatches = batches.filter(
    b => b.stage === 'crescimento' || b.stage === 'terminacao'
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(growFinishBatches[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [code, setCode] = useState(`LOTE-TERM-${new Date().getFullYear()}-03`);
  const [stage, setStage] = useState<'crescimento' | 'terminacao'>('terminacao');
  const [shedName, setShedName] = useState('Galpão 05 - Terminação Turbo');
  const [animalsCount, setAnimalsCount] = useState(350);
  const [currentWeight, setCurrentWeight] = useState(114.2);
  const [gmd, setGmd] = useState(960);
  const [ca, setCa] = useState(2.65);

  const selectedBatch = growFinishBatches.find(b => b?.id === selectedBatchId) || growFinishBatches[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: SwineBatch = {
      id: `batch_gf_${Date.now()}`,
      code: code.trim(),
      stage,
      lineage: 'Topigs Norsvin (TN70)',
      shedId: 'shed_05',
      shedName,
      startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      initialAnimalsCount: Number(animalsCount),
      currentAnimalsCount: Number(animalsCount),
      mortalityCount: 0,
      initialAvgWeightKg: stage === 'terminacao' ? 70 : 25,
      currentAvgWeightKg: Number(currentWeight),
      targetWeightKg: stage === 'terminacao' ? 125 : 70,
      totalFeedConsumedKg: 45000,
      totalWaterConsumedL: 120000,
      feedConversionRatio: Number(ca),
      averageDailyGainG: Number(gmd),
      dailyFeedCostPerAnimal: 3.80,
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
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>Crescimento & Terminação de Suínos</span>
          </h2>
          <p className="text-xs text-gray-500">
            Acompanhamento de engorda final (25 a 130 kg), GMD, CA, dias de cocho e liberação para abate.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Lote de Engorda</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Suínos em Terminação</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {growFinishBatches.reduce((acc, b) => acc + b.currentAnimalsCount, 0)}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">animais em engorda</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Ganho Médio Diário (GMD)</span>
          <div className="text-2xl font-black text-gray-900 mt-1">960 g/dia</div>
          <span className="text-[11px] text-emerald-600 font-medium">Meta &gt; 900 g/dia</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Conversão Alimentar (CA)</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">2.65</div>
          <span className="text-[11px] text-emerald-600 font-medium">Meta &lt; 2.75 kg/kg</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Peso Médio Atual</span>
          <div className="text-2xl font-black text-pink-600 mt-1">114.2 kg</div>
          <span className="text-[11px] text-gray-500 font-medium">Meta Abate: 125 kg</span>
        </div>
      </div>

      {/* Batches Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {growFinishBatches.map(batch => (
          <div
            key={batch.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4 hover:border-emerald-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900">{batch.code}</h3>
                <span className="text-xs text-gray-500 block">
                  Fase: {batch.stage.toUpperCase()} • {batch.shedName}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
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
                <span className="font-bold text-emerald-700">{batch.currentAvgWeightKg} kg</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">GMD</span>
                <span className="font-bold text-gray-900">{batch.averageDailyGainG} g</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block">CA</span>
                <span className="font-black text-indigo-700">{batch.feedConversionRatio}</span>
              </div>
            </div>

            {/* Checklist for slaughter */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-1 text-emerald-900">
              <div className="flex items-center justify-between">
                <span>Período de Carência Medicamentosa:</span>
                <span className="font-bold text-emerald-700">✓ 100% Liberado</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Previsão de Embarque para Frigorífico:</span>
                <span className="font-bold text-gray-900">{batch.expectedEndDate}</span>
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
              <h3 className="text-base font-black text-gray-900">Novo Lote de Engorda</h3>
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
                  <label className="text-xs font-bold text-gray-700 block mb-1">Fase</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  >
                    <option value="crescimento">Crescimento (25-70 kg)</option>
                    <option value="terminacao">Terminação (70-130 kg)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Galpão</label>
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
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Peso Médio (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentWeight}
                    onChange={e => setCurrentWeight(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">GMD Estimado (g)</label>
                  <input
                    type="number"
                    value={gmd}
                    onChange={e => setGmd(Number(e.target.value))}
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
