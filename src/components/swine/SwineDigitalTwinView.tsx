import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Scale,
  Calendar,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  FileText,
  Camera,
  Activity,
  Award,
  ChevronRight,
  Plus,
  AlertCircle,
  Baby,
  Pill,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineWeighingRecord,
  SwineHealthRecord,
  SwineReproductionRecord,
} from '../../types/swine';

interface SwineDigitalTwinViewProps {
  animals: SwineAnimal[];
  selectedAnimal?: SwineAnimal;
  onSelectAnimal: (animal: SwineAnimal) => void;
  onUpdateAnimal: (animal: SwineAnimal) => void;
}

export const SwineDigitalTwinView: React.FC<SwineDigitalTwinViewProps> = ({
  animals,
  selectedAnimal,
  onSelectAnimal,
  onUpdateAnimal,
}) => {
  const currentAnimal = selectedAnimal || animals[0];

  const [activeTab, setActiveTab] = useState<'timeline' | 'weighing' | 'reproduction' | 'health' | 'movements' | 'photos'>('timeline');

  // New weigh-in modal or inline state
  const [newWeight, setNewWeight] = useState(currentAnimal?.currentWeightKg || 220);
  const [newEcc, setNewEcc] = useState(currentAnimal?.bodyConditionScore || 3.0);
  const [newBackfat, setNewBackfat] = useState(16);

  if (!currentAnimal) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
        <Sparkles className="w-10 h-10 text-pink-600 mx-auto" />
        <h4 className="text-base font-bold text-gray-900">Nenhum animal selecionado</h4>
        <p className="text-xs text-gray-500">Cadastre um suíno para visualizar seu Gêmeo Digital.</p>
      </div>
    );
  }

  // Calculate Withdrawal Period (Carência) Status
  const activeWithdrawals = (currentAnimal.healthHistory || []).filter(h => {
    if (h.withdrawalDays === 0) return false;
    const treatDate = new Date(h.date).getTime();
    const endDate = treatDate + h.withdrawalDays * 86400000;
    return Date.now() < endDate;
  });

  const isWithdrawalActive = (activeWithdrawals || []).length > 0;

  // Add Weighing
  const handleAddWeighing = () => {
    const prevWeight = currentAnimal.currentWeightKg;
    const weighingHist = currentAnimal.weighingHistory || [];
    const lastWeighing = weighingHist[(weighingHist || []).length - 1];
    let dailyGain = 0;
    if (lastWeighing) {
      const daysDiff = Math.max(1, (Date.now() - new Date(lastWeighing.date).getTime()) / 86400000);
      dailyGain = Number(((newWeight - lastWeighing.weightKg) / daysDiff).toFixed(2));
    }

    const updatedWeighing: SwineWeighingRecord = {
      id: `w_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(newWeight),
      dailyGainKg: dailyGain,
      bodyConditionScore: Number(newEcc),
      backfatMm: Number(newBackfat),
    };

    const updatedAnimal: SwineAnimal = {
      ...currentAnimal,
      currentWeightKg: Number(newWeight),
      bodyConditionScore: Number(newEcc),
      weighingHistory: [...(currentAnimal.weighingHistory || []), updatedWeighing],
    };

    onUpdateAnimal(updatedAnimal);
  };

  return (
    <div className="space-y-6">
      {/* Top Animal Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-rose-700 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">
              Gêmeo Digital do Animal • 360° Passport
            </h3>
            <p className="text-xs text-gray-500">
              Passaporte biológico, histórico produtivo, curva de peso e rastreabilidade viva.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-gray-600 shrink-0">Selecionar Suíno:</label>
          <select
            value={currentAnimal?.id || ''}
            onChange={e => {
              const found = (animals || []).find(a => a?.id === e.target.value);
              if (found) onSelectAnimal(found);
            }}
            className="w-full sm:w-64 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-pink-500"
          >
            {(animals || []).filter(a => a && a.id).map(a => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.breed} ({a.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Bio Card of Selected Swine */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-pink-50/60 via-white to-rose-50/40 border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-800 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-pink-600/20 shrink-0">
              {currentAnimal.code.substring(0, 3)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900">{currentAnimal.code}</h2>
                {currentAnimal.name && (
                  <span className="text-sm font-semibold text-gray-600">
                    "{currentAnimal.name}"
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentAnimal.status === 'Em Lactação'
                      ? 'bg-amber-100 text-amber-800'
                      : currentAnimal.status === 'Gestante'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentAnimal.status}
                </span>
              </div>

              <p className="text-xs text-gray-600">
                <span className="font-bold text-gray-900">{currentAnimal.breed}</span> • {currentAnimal.sex} • Categoria: {currentAnimal.category}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span>Nascimento: {currentAnimal.birthDate}</span>
                <span>•</span>
                <span>Local: {currentAnimal.currentPenNumber || 'Galpão 01'}</span>
                <span>•</span>
                <span className="font-mono">{currentAnimal.rfidOrQrCode}</span>
              </div>
            </div>
          </div>

          {/* Key Vitals */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-3 bg-white rounded-2xl border border-gray-200/80 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Peso Atual</span>
              <div className="text-xl font-black text-gray-900 mt-0.5">
                {currentAnimal.currentWeightKg} kg
              </div>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200/80 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">ECC Corporal</span>
              <div className="text-xl font-black text-pink-600 mt-0.5">
                {currentAnimal.bodyConditionScore} / 5
              </div>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200/80 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Carência Carne</span>
              <div className={`text-xs font-bold mt-1.5 ${isWithdrawalActive ? 'text-red-600' : 'text-emerald-600'}`}>
                {isWithdrawalActive ? 'Em Carência' : 'Liberado (Zero)'}
              </div>
            </div>
          </div>
        </div>

        {/* Digital Twin Sub-Tabs */}
        <div className="p-2 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'timeline', label: 'Linha do Tempo 360°', icon: Clock },
            { id: 'weighing', label: 'Curva de Peso & GMD', icon: Scale },
            { id: 'reproduction', label: 'Histórico Reprodutivo', icon: Heart },
            { id: 'health', label: 'Sanidade & Medicamentos', icon: ShieldCheck },
            { id: 'movements', label: 'Movimentações de Baia', icon: MapPin },
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isTabActive
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Tab Contents */}
        <div className="p-6">
          {/* 1. Life Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Linha do Tempo da Vida Produtiva
              </h4>

              <div className="relative border-l-2 border-pink-200 pl-6 ml-3 space-y-6">
                {/* Entry event */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-pink-600 border-2 border-white shadow-xs" />
                  <span className="text-[11px] font-bold text-pink-600">{currentAnimal.entryDate}</span>
                  <h5 className="text-xs font-bold text-gray-900">Entrada no Plantel</h5>
                  <p className="text-xs text-gray-500">Origem: {currentAnimal.origin} • Peso Inicial: {currentAnimal.initialWeightKg} kg</p>
                </div>

                {/* Reproduction Events */}
                {currentAnimal.reproductionHistory.map(rep => (
                  <div key={rep.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-xs" />
                    <span className="text-[11px] font-bold text-rose-600">{rep.date}</span>
                    <h5 className="text-xs font-bold text-gray-900">{rep.eventType}</h5>
                    <p className="text-xs text-gray-600">
                      {rep.eventType === 'Parto'
                        ? `Leitões nascidos: ${rep.totalBorn} (${rep.bornAlive} vivos, ${rep.stillborn || 0} natimortos). Peso médio: ${rep.avgPigletBirthWeightKg} kg.`
                        : rep.eventType === 'Inseminação Artificial (IA)'
                        ? `IA com sêmen ${rep.boarOrSemenId} (${rep.boarBreed}). Previsão parto: ${rep.expectedFarrowingDate}.`
                        : rep.notes || 'Evento reprodutivo registrado.'}
                    </p>
                  </div>
                ))}

                {/* Health Events */}
                {currentAnimal.healthHistory.map(h => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <span className="text-[11px] font-bold text-emerald-600">{h.date}</span>
                    <h5 className="text-xs font-bold text-gray-900">{h.type}: {h.productName}</h5>
                    <p className="text-xs text-gray-600">Dose: {h.dosage} • Via: {h.route} • Aplicador: {h.veterinarianOrOperator}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Weight & BCS Growth */}
          {activeTab === 'weighing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Histórico de Pesagens & Escore Corporal
                </h4>

                {/* Inline Add Weighing */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Novo Peso (kg)"
                    value={newWeight}
                    onChange={e => setNewWeight(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="ECC"
                    value={newEcc}
                    onChange={e => setNewEcc(Number(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                  <button
                    onClick={handleAddWeighing}
                    className="px-3 py-1.5 bg-pink-600 text-white rounded-xl text-xs font-bold"
                  >
                    Registrar Peso
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentAnimal.weighingHistory.map((w, idx) => (
                  <div key={w.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold text-gray-500">{w.date} (Pesagem #{idx + 1})</span>
                    <div className="text-xl font-black text-gray-900">{w.weightKg} kg</div>
                    <div className="text-xs text-gray-600 flex justify-between">
                      <span>ECC: {w.bodyConditionScore} / 5</span>
                      {w.backfatMm && <span>P2: {w.backfatMm} mm</span>}
                    </div>
                    {w.notes && <p className="text-[11px] text-gray-500 italic mt-1">{w.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Reproduction */}
          {activeTab === 'reproduction' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Eventos Reprodutivos & Partos Registrados
              </h4>

              <div className="space-y-3">
                {currentAnimal.reproductionHistory.map(rep => (
                  <div key={rep.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{rep.eventType}</span>
                        <span className="text-[11px] text-gray-500">({rep.date})</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {rep.eventType === 'Parto'
                          ? `Total: ${rep.totalBorn} | Vivos: ${rep.bornAlive} | Natimortos: ${rep.stillborn || 0} | Peso Leitegada: ${rep.litterBirthWeightKg || 0} kg`
                          : rep.eventType === 'Inseminação Artificial (IA)'
                          ? `Sêmen: ${rep.boarOrSemenId} (${rep.boarBreed}) • Prev. Parto: ${rep.expectedFarrowingDate}`
                          : rep.notes || 'Registro concluído'}
                      </p>
                    </div>

                    <span className="text-[11px] font-bold px-3 py-1 bg-pink-100 text-pink-800 rounded-full shrink-0">
                      Auditado
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Health & Withdrawal */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Manejos Sanitários, Vacinas & Carência
              </h4>

              <div className="space-y-3">
                {currentAnimal.healthHistory.map(h => (
                  <div key={h.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{h.productName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          {h.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Dose: {h.dosage} ({h.route}) • Carência: {h.withdrawalDays} dias • Resp: {h.veterinarianOrOperator}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Movements */}
          {activeTab === 'movements' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Histórico de Transferências de Baia & Galpão
              </h4>

              <div className="space-y-2">
                {currentAnimal.movements.map(m => (
                  <div key={m.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{m.fromLocation} → {m.toLocation}</span>
                      <span className="text-gray-500 block text-[11px]">Motivo: {m.reason} • Resp: {m.operator}</span>
                    </div>
                    <span className="text-gray-500 font-medium">{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
