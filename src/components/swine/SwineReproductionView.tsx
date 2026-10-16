import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Baby,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineReproductionRecord,
} from '../../types/swine';

interface SwineReproductionViewProps {
  animals: SwineAnimal[];
  onUpdateAnimal: (animal: SwineAnimal) => void;
}

export const SwineReproductionView: React.FC<SwineReproductionViewProps> = ({
  animals,
  onUpdateAnimal,
}) => {
  const sows = animals.filter(
    a => a.category.includes('Matriz') || a.category.includes('Marrã')
  );

  const [selectedSowId, setSelectedSowId] = useState<string>(sows[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [eventType, setEventType] = useState<SwineReproductionRecord['eventType']>('Inseminação Artificial (IA)');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [boarOrSemen, setBoarOrSemen] = useState('SEM-DUROC-709');
  const [boarBreed, setBoarBreed] = useState('Duroc');
  const [inseminator, setInseminator] = useState('Marcos Rezende');
  const [dgResult, setDgResult] = useState<'Positivo (Gestante)' | 'Negativo (Vazia)' | 'Duvidoso'>('Positivo (Gestante)');
  const [totalBorn, setTotalBorn] = useState(15);
  const [bornAlive, setBornAlive] = useState(14);
  const [stillborn, setStillborn] = useState(1);
  const [mummified, setMummified] = useState(0);
  const [avgBirthWeight, setAvgBirthWeight] = useState(1.45);
  const [weanPiglets, setWeanPiglets] = useState(13);
  const [weanWeight, setWeanWeight] = useState(6.8);
  const [idcDays, setIdcDays] = useState(4);
  const [notes, setNotes] = useState('');

  const selectedSow = (sows || []).find(s => s?.id === selectedSowId) || sows?.[0] || null;

  // Gestation calculation (114 days average)
  const calculateExpectedFarrowing = (iaDate: string) => {
    const d = new Date(iaDate);
    d.setDate(d.getDate() + 114);
    return d.toISOString().split('T')[0];
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSow) return;

    const newRecord: SwineReproductionRecord = {
      id: `rep_${Date.now()}`,
      date: eventDate,
      eventType,
      boarOrSemenId: eventType.includes('Inseminação') || eventType.includes('Cobertura') ? boarOrSemen : undefined,
      boarBreed: eventType.includes('Inseminação') || eventType.includes('Cobertura') ? boarBreed : undefined,
      inseminatorName: inseminator,
      expectedFarrowingDate: eventType.includes('Inseminação') || eventType.includes('Cobertura') ? calculateExpectedFarrowing(eventDate) : undefined,
      dgResult: eventType === 'Diagnóstico de Gestação (DG)' ? dgResult : undefined,
      totalBorn: eventType === 'Parto' ? Number(totalBorn) : undefined,
      bornAlive: eventType === 'Parto' ? Number(bornAlive) : undefined,
      stillborn: eventType === 'Parto' ? Number(stillborn) : undefined,
      mummified: eventType === 'Parto' ? Number(mummified) : undefined,
      avgPigletBirthWeightKg: eventType === 'Parto' ? Number(avgBirthWeight) : undefined,
      pigletsWeaned: eventType === 'Desmame' ? Number(weanPiglets) : undefined,
      avgWeaningWeightKg: eventType === 'Desmame' ? Number(weanWeight) : undefined,
      weanToEstrusIntervalDays: eventType === 'Retorno ao Cio' ? Number(idcDays) : undefined,
      notes: notes.trim() || undefined,
    };

    let updatedCategory = selectedSow.category;
    let updatedStatus = selectedSow.status;

    if (eventType === 'Inseminação Artificial (IA)' || eventType === 'Cobertura Natural') {
      updatedStatus = 'Em Cobertura / IA';
    } else if (eventType === 'Diagnóstico de Gestação (DG)' && dgResult === 'Positivo (Gestante)') {
      updatedCategory = 'Matriz Gestante';
      updatedStatus = 'Gestante';
    } else if (eventType === 'Parto') {
      updatedCategory = 'Matriz Lactante';
      updatedStatus = 'Em Lactação';
    } else if (eventType === 'Desmame') {
      updatedCategory = 'Matriz Vazia / Pré-Cobertura';
      updatedStatus = 'Seca / Desmamada';
    }

    const updatedSow: SwineAnimal = {
      ...selectedSow,
      category: updatedCategory,
      status: updatedStatus,
      reproductionHistory: [newRecord, ...selectedSow.reproductionHistory],
    };

    onUpdateAnimal(updatedSow);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <span>Manejo Reprodutivo, IA & Gestação</span>
          </h2>
          <p className="text-xs text-gray-500">
            Controle de coberturas, inseminação artificial heterospérmica, ultrassom (DG), partos e IDC.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Evento Reprodutivo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Taxa de Concepção</span>
          <div className="text-2xl font-black text-rose-600 mt-1">91.5%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Meta &gt; 90% (Excelente)</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Taxa de Parto</span>
          <div className="text-2xl font-black text-pink-600 mt-1">89.2%</div>
          <span className="text-[11px] text-gray-500 font-medium">Partos / Inseminações</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Leitões Vivos / Parto</span>
          <div className="text-2xl font-black text-amber-600 mt-1">14.8</div>
          <span className="text-[11px] text-gray-500 font-medium">Hiperprolificidade</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Intervalo Desmame-Cio (IDC)</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">4.8 d</div>
          <span className="text-[11px] text-emerald-600 font-medium">Meta &lt; 5.5 dias</span>
        </div>
      </div>

      {/* Reproductive Board: Sows in Gestation & Due Dates */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Plantel de Matrizes & Status Gestacional
          </h3>
          <span className="text-xs text-gray-500 font-medium">{(sows || []).length} matrizes cadastradas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sows.map(sow => {
            const lastEvent = sow.reproductionHistory[0];
            return (
              <div
                key={sow.id}
                onClick={() => setSelectedSowId(sow.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedSow?.id === sow.id
                    ? 'border-pink-500 bg-pink-50/40 shadow-xs'
                    : 'border-gray-200 hover:border-pink-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900">{sow.code}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sow.status === 'Gestante'
                        ? 'bg-purple-100 text-purple-800'
                        : sow.status === 'Em Lactação'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {sow.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{sow.breed} • {sow.currentPenNumber || 'Gaiola'}</p>

                {lastEvent && (
                  <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-600 space-y-0.5">
                    <span className="font-semibold text-gray-800 block">Último: {lastEvent.eventType} ({lastEvent.date})</span>
                    {lastEvent.expectedFarrowingDate && (
                      <span className="text-pink-700 font-bold block">
                        Previsão Parto: {lastEvent.expectedFarrowingDate}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding reproduction record */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Lançar Manejo Reprodutivo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Matriz *</label>
                <select
                  value={selectedSowId}
                  onChange={e => setSelectedSowId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                >
                  {sows.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.breed} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tipo de Evento *</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Inseminação Artificial (IA)">Inseminação Artificial (IA)</option>
                    <option value="Cobertura Natural">Cobertura Natural</option>
                    <option value="Diagnóstico de Gestação (DG)">Diagnóstico de Gestação (DG)</option>
                    <option value="Parto">Parto</option>
                    <option value="Desmame">Desmame</option>
                    <option value="Retorno ao Cio">Retorno ao Cio</option>
                    <option value="Aborto">Aborto</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Data *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {(eventType === 'Inseminação Artificial (IA)' || eventType === 'Cobertura Natural') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Cachaço / Sêmen</label>
                    <input
                      type="text"
                      value={boarOrSemen}
                      onChange={e => setBoarOrSemen(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Inseminador</label>
                    <input
                      type="text"
                      value={inseminator}
                      onChange={e => setInseminator(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {eventType === 'Parto' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Nascidos Vivos</label>
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
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Peso Médio (kg)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={avgBirthWeight}
                      onChange={e => setAvgBirthWeight(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-gray-50 border rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Detalhes adicionais..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
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
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
