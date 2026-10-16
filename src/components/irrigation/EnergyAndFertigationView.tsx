import React, { useState } from 'react';
import { IrrigationSystemRecord, FertigationProgramItem } from '../../types/irrigation';
import { Zap, DollarSign, Calendar, Plus, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

interface Props {
  systems: IrrigationSystemRecord[];
  fertigation: FertigationProgramItem[];
  onAddFertigation: (item: FertigationProgramItem) => void;
}

export const EnergyAndFertigationView: React.FC<Props> = ({
  systems,
  fertigation,
  onAddFertigation,
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const activeSystem = (selectedSystemId ? systems.find(s => s.id === selectedSystemId) : null) || systems[0] || null;

  // Fertigation Form State
  const [fertilizerName, setFertilizerName] = useState('Nitrato de Cálcio + KCL Solúvel');
  const [amount, setAmount] = useState(150);
  const [unit, setUnit] = useState<'kg' | 'L'>('kg');
  const [targetNutrients, setTargetNutrients] = useState('N: 20 kg/ha, K2O: 30 kg/ha');
  const [injectionHours, setInjectionHours] = useState(2.0);
  const [compatibility, setCompatibility] = useState<FertigationProgramItem['compatibilityCheck']>('Compatível');

  const handleCreateFertigation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSystem) return;

    const newItem: FertigationProgramItem = {
      id: `fert-${Date.now()}`,
      systemId: activeSystem.id,
      date: new Date().toISOString().split('T')[0],
      fertilizerName,
      amountKgOrL: amount,
      unit,
      targetNutrients,
      injectionDurationHours: injectionHours,
      compatibilityCheck: compatibility,
      status: 'Agendado',
    };

    onAddFertigation(newItem);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Gestão Energética & Fertirrigação Integrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de tarifação de energia (Verde/Azul/Noturna) e cronograma de injeção de fertilizantes solúveis
          </p>
        </div>
      </div>

      {/* Grid Superior: Métrica de Custos Energéticos Estimados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Potência Instalada Motores</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            105 <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <p className="text-[11px] text-slate-500">2 Conjuntos Motobomba Operacionais</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Economia Tarifa Noturna</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            60% <span className="text-xs font-normal text-slate-500">desconto</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">Desconto Reservado Irrigante Noturno</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Custo Médio da Irrigação</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            R$ 3,93 <span className="text-xs font-normal text-slate-500">/ mm / ha</span>
          </div>
          <p className="text-[11px] text-slate-500">Custo energético ultra-otimizado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Programação de Fertirrigação */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" /> Programar Fertirrigação
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Compatibilidade OK</span>
          </div>

          <form onSubmit={handleCreateFertigation} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Sistema de Irrigação</label>
              <select
                value={activeSystem?.id || ''}
                onChange={e => setSelectedSystemId(e.target.value)}
                disabled={systems.length === 0}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60"
              >
                {systems.length === 0 ? (
                  <option value="">Nenhum sistema cadastrado</option>
                ) : (
                  systems.map(s => (
                    <option key={s.id} value={s.id}>{s.systemName}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Nome do Fertilizante / Calda</label>
              <input
                type="text"
                value={fertilizerName}
                onChange={e => setFertilizerName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Quantidade</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Unidade</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="kg">kg</option>
                  <option value="L">Litros (L)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Aporte de Nutrientes Alvo</label>
              <input
                type="text"
                value={targetNutrients}
                onChange={e => setTargetNutrients(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Duração Injeção (Horas)</label>
                <input
                  type="number"
                  step="0.5"
                  value={injectionHours}
                  onChange={e => setInjectionHours(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Teste de Mistura</label>
                <select
                  value={compatibility}
                  onChange={e => setCompatibility(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Compatível">Compatível</option>
                  <option value="Requer Atenção">Requer Atenção</option>
                  <option value="Incompatível">Incompatível</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agendar Fertirrigação
            </button>
          </form>
        </div>

        {/* Lista de Fertirrigações Programadas e Histórico */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Cronograma e Histórico de Fertirrigação ({fertigation.length})
          </h4>

          <div className="space-y-3">
            {fertigation.map(item => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{item.fertilizerName}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-bold">
                      {item.compatibilityCheck}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(item.date).toLocaleDateString('pt-BR')} • {item.targetNutrients} • Duração Injeção: {item.injectionDurationHours}h
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm block">
                    {item.amountKgOrL} {item.unit}
                  </strong>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
