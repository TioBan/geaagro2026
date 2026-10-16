// @ts-nocheck
import React, { useState } from 'react';
import {
  Hammer,
  Clock,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Scale,
  User,
  X,
  Compass,
  DollarSign,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineFarrieryRecord,
  HorseshoeType,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  farrieryRecords: EquineFarrieryRecord[];
  onAddFarriery: (record: EquineFarrieryRecord) => void;
}

export const EquineFarrieryView: React.FC<Props> = ({
  animals,
  farrieryRecords,
  onAddFarriery,
}) => {
  const [selectedAnimalId, setSelectedAnimalFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<EquineFarrieryRecord>>({
    animalId: animals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    horseshoeType: 'Ferradura de Alumínio com Rolling Toe',
    frontHoofAngleDegrees: 51,
    hindHoofAngleDegrees: 54,
    farrierName: 'Mestre Ferrador Tiago Santos',
    intervalDays: 35,
    costBrl: 320,
    hoofCondition: 'Casco íntegro com boa espessura de muralha e ranilha flexível',
    correctiveShoeing: false,
    notes: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalId) return;

    const baseDate = new Date(formData.date || new Date());
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + (formData.intervalDays || 35));

    const newRecord: EquineFarrieryRecord = {
      ...(formData as EquineFarrieryRecord),
      id: `far-${Date.now()}`,
      nextShoeingDate: nextDate.toISOString().split('T')[0],
    };

    onAddFarriery(newRecord);
    setIsModalOpen(false);
  };

  const filteredRecords = farrieryRecords.filter(f =>
    selectedAnimalId === 'all' || f.animalId === selectedAnimalId
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
            <Hammer className="w-3.5 h-3.5 text-amber-700" /> Podologia, Casqueamento & Ferrageamento
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Saúde dos Cascos & Balanceamento Podal
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Controle de angulação podal, ferraduras terapêuticas e ciclos de troca (35-45 dias)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAnimalId}
            onChange={e => setSelectedAnimalFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
          >
            <option value="all">Todos os Animais</option>
            {animals.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ferrageamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Animais Ferrados</span>
          <span className="text-2xl font-black text-stone-900">{animals.length}</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">100% Plantel monitorado</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Ciclo Médio de Troca</span>
          <span className="text-2xl font-black text-amber-900 font-mono">38 dias</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Dentro do ideal (35-42d)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Ângulo Médio Anterior</span>
          <span className="text-2xl font-black text-stone-900 font-mono">51.5°</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">Eixo Póstero-Falângico Ideal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Ferrageamento Terapêutico</span>
          <span className="text-2xl font-black text-blue-900 font-mono">
            {farrieryRecords.filter(f => f.correctiveShoeing).length}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Correção de aprumos</span>
        </div>
      </div>

      {/* Farriery Records List */}
      <div className="space-y-4">
        {filteredRecords.map(record => {
          const animal = animals.find(a => a.id === record.animalId);
          const daysRemaining = record.nextShoeingDate
            ? Math.round((new Date(record.nextShoeingDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
            : null;

          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
                    🔨
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 text-sm">{record.horseshoeType}</h3>
                    <div className="text-xs text-stone-500 font-medium">
                      Cavalo: <strong className="text-stone-800">{animal?.name || 'Cavalo'}</strong> • Data: {new Date(record.date).toLocaleDateString('pt-BR')} • Ferrador: {record.farrierName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {daysRemaining !== null && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      daysRemaining < 0 ? 'bg-red-100 text-red-900' :
                      daysRemaining < 7 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {daysRemaining < 0 ? `Vencido há ${Math.abs(daysRemaining)} dias` : `Próxima troca em ${daysRemaining} dias`}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold bg-stone-100 px-2.5 py-1 rounded-lg">
                    R$ {record.costBrl?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Angles & Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-700" /> Casco Anterior (Mão)
                  </span>
                  <strong className="text-base font-black text-stone-900 font-mono mt-0.5 block">
                    {record.frontHoofAngleDegrees}°
                  </strong>
                  <span className="text-[10px] text-emerald-700 font-semibold">Ideal: 50° - 54°</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-700" /> Casco Posterior (Pé)
                  </span>
                  <strong className="text-base font-black text-stone-900 font-mono mt-0.5 block">
                    {record.hindHoofAngleDegrees}°
                  </strong>
                  <span className="text-[10px] text-emerald-700 font-semibold">Ideal: 53° - 57°</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Próxima Troca Prevista</span>
                  <strong className="text-xs font-black text-amber-900 font-mono mt-0.5 block">
                    {record.nextDueDate ? new Date(record.nextDueDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </strong>
                  <span className="text-[10px] text-stone-500">Ciclo de {record.intervalDays} dias</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Finalidade</span>
                  <strong className="text-xs font-black text-stone-900 mt-0.5 block">
                    {record.correctiveShoeing ? 'Terapêutico / Corretivo' : 'Rotina Esportiva'}
                  </strong>
                  <span className="text-[10px] text-stone-500">Muralha e ranilha avaliadas</span>
                </div>
              </div>

              {record.hoofCondition && (
                <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <strong>Avaliação Podal:</strong> {record.hoofCondition}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Farriery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-amber-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">Registrar Ferrageamento / Casqueamento</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Cavalo *</label>
                  <select
                    value={formData.animalId}
                    onChange={e => setFormData({ ...formData, animalId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Tipo de Ferradura / Casqueamento</label>
                  <select
                    value={formData.horseshoeType}
                    onChange={e => setFormData({ ...formData, horseshoeType: e.target.value as HorseshoeType })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="Ferradura de Alumínio com Rolling Toe">Alumínio com Rolling Toe (Performance)</option>
                    <option value="Ferradura de Ferro com Talonete">Ferro com Talonete Elevado</option>
                    <option value="Ferradura de Ferro Padrão">Ferro Padrão</option>
                    <option value="Ferradura Terapêutica em Coração (Heart-Bar)">Terapêutica em Coração (Heart-Bar)</option>
                    <option value="Ferradura Egg-Bar (Oval)">Egg-Bar (Oval para Navicular)</option>
                    <option value="Casqueamento Simples (Descalço / Barefoot)">Descalço / Barefoot (Sem ferradura)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ângulo Anterior (°)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.frontHoofAngleDegrees}
                    onChange={e => setFormData({ ...formData, frontHoofAngleDegrees: parseFloat(e.target.value) || 51 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ângulo Posterior (°)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hindHoofAngleDegrees}
                    onChange={e => setFormData({ ...formData, hindHoofAngleDegrees: parseFloat(e.target.value) || 54 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Data da Aplicação</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Intervalo de Troca (dias)</label>
                  <input
                    type="number"
                    value={formData.intervalDays}
                    onChange={e => setFormData({ ...formData, intervalDays: parseInt(e.target.value) || 35 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ferrador Responsável</label>
                  <input
                    type="text"
                    value={formData.farrierName || ''}
                    onChange={e => setFormData({ ...formData, farrierName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Custo Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costBrl}
                    onChange={e => setFormData({ ...formData, costBrl: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Condição dos Cascos & Observações</label>
                <textarea
                  rows={2}
                  value={formData.hoofCondition || ''}
                  onChange={e => setFormData({ ...formData, hoofCondition: e.target.value })}
                  placeholder="Ranilha, linha branca, espessura da sola..."
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
                  Salvar Ferrageamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
