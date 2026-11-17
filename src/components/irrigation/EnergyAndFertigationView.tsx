import React, { useState, useMemo } from 'react';
import { IrrigationSystemRecord, FertigationProgramItem } from '../../types/irrigation';
import {
  Zap,
  DollarSign,
  Calendar,
  Plus,
  CheckCircle2,
  Trash2,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface Props {
  systems: IrrigationSystemRecord[];
  fertigation: FertigationProgramItem[];
  onAddFertigation: (item: FertigationProgramItem) => void;
  onDeleteFertigation?: (id: string) => void;
  onClearFertigation?: () => void;
}

export const EnergyAndFertigationView: React.FC<Props> = ({
  systems,
  fertigation,
  onAddFertigation,
  onDeleteFertigation,
  onClearFertigation,
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const activeSystem = (selectedSystemId ? systems.find(s => s.id === selectedSystemId) : null) || systems[0] || null;

  // Energy Tariff Parameters (Default clean/empty states - no pre-filled fake data)
  const [kwhRate, setKwhRate] = useState<number | ''>('');
  const [nightDiscountPct, setNightDiscountPct] = useState<number | ''>('');
  const [showTariffConfig, setShowTariffConfig] = useState(false);

  // Fertigation Form State (Clean / empty states - no pre-filled fake data)
  const [fertilizerName, setFertilizerName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState<'kg' | 'L'>('kg');
  const [targetNutrients, setTargetNutrients] = useState('');
  const [injectionHours, setInjectionHours] = useState<number | ''>('');
  const [compatibility, setCompatibility] = useState<FertigationProgramItem['compatibilityCheck']>('Compatível');
  const [formError, setFormError] = useState('');

  // Dynamic Energy Calculations based on real systems and configured parameters
  const { totalPowerKw, totalPumpsCount, effectiveDiscountPct, calculatedCostPerMmHa } = useMemo(() => {
    // 1. Potência Instalada
    const totalPower = systems.reduce((acc, s) => acc + (Number(s.powerKw) || 0), 0);
    const pumpsCount = systems.reduce((acc, s) => {
      const explicitPumps = s.equipments?.filter(e => e.category === 'Bomba' || e.category === 'Motor').length || 0;
      return acc + (explicitPumps > 0 ? explicitPumps : (Number(s.powerKw) > 0 ? 1 : 0));
    }, 0);

    // 2. Economia Tarifa Noturna
    const discount = typeof nightDiscountPct === 'number' && nightDiscountPct > 0 ? nightDiscountPct : 0;

    // 3. Custo Médio por mm/ha
    // 1 mm em 1 ha = 10 m³. Tempo para bombear 10 m³ = 10 / vazão (h). Energia = tempo * potência (kWh)
    let cost = 0;
    if (activeSystem && Number(activeSystem.nominalFlowM3h) > 0 && Number(activeSystem.powerKw) > 0 && typeof kwhRate === 'number' && kwhRate > 0) {
      const hoursPerMmHa = 10 / Number(activeSystem.nominalFlowM3h);
      const kwhPerMmHa = hoursPerMmHa * Number(activeSystem.powerKw);
      const effectiveRate = kwhRate * (1 - discount / 100);
      cost = kwhPerMmHa * effectiveRate;
    } else if (totalPower > 0 && typeof kwhRate === 'number' && kwhRate > 0) {
      // Estimativa média geral
      const avgFlow = systems.reduce((acc, s) => acc + (Number(s.nominalFlowM3h) || 0), 0) || 100;
      const hoursPerMmHa = 10 / avgFlow;
      const kwhPerMmHa = hoursPerMmHa * totalPower;
      const effectiveRate = kwhRate * (1 - discount / 100);
      cost = kwhPerMmHa * effectiveRate;
    }

    return {
      totalPowerKw: totalPower,
      totalPumpsCount: pumpsCount,
      effectiveDiscountPct: discount,
      calculatedCostPerMmHa: cost,
    };
  }, [systems, activeSystem, nightDiscountPct, kwhRate]);

  const handleCreateFertigation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!activeSystem) {
      setFormError('Selecione ou cadastre um sistema de irrigação antes de agendar.');
      return;
    }

    if (!fertilizerName.trim()) {
      setFormError('Informe o nome do fertilizante ou calda.');
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setFormError('Informe uma quantidade válida maior que zero.');
      return;
    }

    const numHours = Number(injectionHours);
    if (!injectionHours || isNaN(numHours) || numHours <= 0) {
      setFormError('Informe a duração da injeção em horas.');
      return;
    }

    const newItem: FertigationProgramItem = {
      id: `fert-${Date.now()}`,
      systemId: activeSystem.id,
      date: new Date().toISOString().split('T')[0],
      fertilizerName: fertilizerName.trim(),
      amountKgOrL: numAmount,
      unit,
      targetNutrients: targetNutrients.trim() || 'Nutrientes conforme recomendação',
      injectionDurationHours: numHours,
      compatibilityCheck: compatibility,
      status: 'Agendado',
    };

    onAddFertigation(newItem);

    // Reset formulário para o estado limpo
    setFertilizerName('');
    setAmount('');
    setTargetNutrients('');
    setInjectionHours('');
    setCompatibility('Compatível');
    setFormError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Gestão Energética & Fertirrigação Integrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de tarifação de energia (Verde/Azul/Noturna) e cronograma de injeção de fertilizantes solúveis
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTariffConfig(prev => !prev)}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>{showTariffConfig ? 'Ocultar Parâmetros Tarifários' : 'Configurar Tarifação'}</span>
        </button>
      </div>

      {/* Painel Expansível de Configuração Tarifária */}
      {showTariffConfig && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/70 dark:border-amber-800/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Parâmetros de Tarifação da Concessionária de Energia</span>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
            Insira os valores da sua fatura para calcular a economia real com o horário reservado irrigante noturno (Resolução Normativa ANEEL) e o custo médio por milímetro de lâmina aplicada.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Tarifa de Energia (R$/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={kwhRate}
                onChange={e => setKwhRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 0.45"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Desconto Tarifa Noturna (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={nightDiscountPct}
                onChange={e => setNightDiscountPct(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 60"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setKwhRate('');
                  setNightDiscountPct('');
                }}
                className="w-full py-1.5 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Tarifas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Superior: Métricas Dinâmicas e Reais (Sem dados fictícios pré-preenchidos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Potência Instalada */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Potência Instalada Motores</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalPowerKw > 0 ? (
              <>
                {totalPowerKw} <span className="text-xs font-normal text-slate-500">kW</span>
              </>
            ) : (
              <>
                0 <span className="text-xs font-normal text-slate-500">kW</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {systems.length === 0
              ? 'Nenhum conjunto motobomba cadastrado'
              : totalPowerKw > 0
              ? `${totalPumpsCount} ${totalPumpsCount === 1 ? 'Conjunto Motobomba Operacional' : 'Conjuntos Motobomba Operacionais'}`
              : 'Nenhuma potência cadastrada nos sistemas'}
          </p>
        </div>

        {/* Card 2: Economia Tarifa Noturna */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Economia Tarifa Noturna</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {effectiveDiscountPct > 0 ? (
              <>
                {effectiveDiscountPct}% <span className="text-xs font-normal text-slate-500">desconto</span>
              </>
            ) : (
              <>
                0% <span className="text-xs font-normal text-slate-500">desconto</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {effectiveDiscountPct > 0
              ? 'Desconto Reservado Irrigante Noturno ANEEL'
              : systems.length === 0
              ? 'Nenhum sistema cadastrado'
              : 'Clique em "Configurar Tarifação" para inserir'}
          </p>
        </div>

        {/* Card 3: Custo Médio da Irrigação */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Custo Médio da Irrigação</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {calculatedCostPerMmHa > 0 ? (
              <>
                R$ {calculatedCostPerMmHa.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">/ mm / ha</span>
              </>
            ) : (
              <>
                R$ 0,00 <span className="text-xs font-normal text-slate-500">/ mm / ha</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {calculatedCostPerMmHa > 0
              ? 'Custo energético por lâmina aplicada'
              : 'Sem parâmetros de consumo ou tarifa inseridos'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Programação de Fertirrigação (Campos sem dados pré-preenchidos) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" /> Programar Fertirrigação
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">
              {compatibility === 'Compatível' ? 'Compatibilidade OK' : compatibility}
            </span>
          </div>

          {formError && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateFertigation} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                Sistema de Irrigação
              </label>
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
                    <option key={s.id} value={s.id}>
                      {s.systemName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                Nome do Fertilizante / Calda
              </label>
              <input
                type="text"
                value={fertilizerName}
                onChange={e => setFertilizerName(e.target.value)}
                placeholder="Ex: Nitrato de Cálcio, Cloreto de Potássio (KCl), MAP..."
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 100"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  Unidade
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as 'kg' | 'L')}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="kg">kg</option>
                  <option value="L">Litros (L)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                Aporte de Nutrientes Alvo
              </label>
              <input
                type="text"
                value={targetNutrients}
                onChange={e => setTargetNutrients(e.target.value)}
                placeholder="Ex: N: 20 kg/ha, K₂O: 30 kg/ha..."
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  Duração Injeção (Horas)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={injectionHours}
                  onChange={e => setInjectionHours(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 2.0"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  Teste de Mistura
                </label>
                <select
                  value={compatibility}
                  onChange={e => setCompatibility(e.target.value as FertigationProgramItem['compatibilityCheck'])}
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
              disabled={systems.length === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Agendar Fertirrigação
            </button>
          </form>
        </div>

        {/* Lista de Fertirrigações Programadas e Histórico */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cronograma e Histórico de Fertirrigação ({fertigation.length})
            </h4>

            {fertigation.length > 0 && onClearFertigation && (
              <button
                type="button"
                onClick={onClearFertigation}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>

          {fertigation.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50/60 dark:bg-zinc-950/40 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                Nenhuma fertirrigação programada
              </h5>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Preencha o formulário ao lado para agendar uma nova aplicação de fertilizantes solúveis via sistema de irrigação.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fertigation.map(item => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.fertilizerName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.compatibilityCheck === 'Compatível'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : item.compatibilityCheck === 'Requer Atenção'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {item.compatibilityCheck}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(item.date).toLocaleDateString('pt-BR')} • {item.targetNutrients} • Duração Injeção: {item.injectionDurationHours}h
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm block">
                        {item.amountKgOrL} {item.unit}
                      </strong>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {item.status}
                      </span>
                    </div>

                    {onDeleteFertigation && (
                      <button
                        type="button"
                        onClick={() => onDeleteFertigation(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                        title="Excluir este agendamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
