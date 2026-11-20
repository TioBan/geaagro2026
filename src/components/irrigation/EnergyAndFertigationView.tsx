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
  Check,
  X,
} from 'lucide-react';
import {
  formatBrDate,
  IRRIGATION_INPUT_CLASS,
  IRRIGATION_LABEL_CLASS,
} from './irrigationUi';

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
  const activeSystem =
    (selectedSystemId ? systems.find((s) => s.id === selectedSystemId) : null) ||
    systems[0] ||
    null;

  // Tariff Config
  const [kwhRate, setKwhRate] = useState<number | ''>('');
  const [nightDiscountPct, setNightDiscountPct] = useState<number | ''>('');
  const [showTariffConfig, setShowTariffConfig] = useState(false);

  // Fertigation Form
  const [fertilizerName, setFertilizerName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState<'kg' | 'L'>('kg');
  const [targetNutrients, setTargetNutrients] = useState('');
  const [injectionHours, setInjectionHours] = useState<number | ''>('');
  const [compatibility, setCompatibility] =
    useState<FertigationProgramItem['compatibilityCheck']>('Compatível');
  const [formError, setFormError] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const { totalPowerKw, totalPumpsCount, effectiveDiscountPct, calculatedCostPerMmHa } =
    useMemo(() => {
      const totalPower = systems.reduce((acc, s) => acc + (Number(s.powerKw) || 0), 0);
      const pumpsCount = systems.reduce((acc, s) => {
        const explicitPumps =
          s.equipments?.filter((e) => e.category === 'Bomba' || e.category === 'Motor').length || 0;
        return acc + (explicitPumps > 0 ? explicitPumps : Number(s.powerKw) > 0 ? 1 : 0);
      }, 0);

      const discount =
        typeof nightDiscountPct === 'number' && nightDiscountPct > 0 ? nightDiscountPct : 0;

      let cost = 0;
      if (
        activeSystem &&
        Number(activeSystem.nominalFlowM3h) > 0 &&
        Number(activeSystem.powerKw) > 0 &&
        typeof kwhRate === 'number' &&
        kwhRate > 0
      ) {
        const hoursPerMmHa = 10 / Number(activeSystem.nominalFlowM3h);
        const kwhPerMmHa = hoursPerMmHa * Number(activeSystem.powerKw);
        cost = kwhPerMmHa * (kwhRate * (1 - discount / 100));
      } else if (totalPower > 0 && typeof kwhRate === 'number' && kwhRate > 0) {
        const avgFlow = systems.reduce((acc, s) => acc + (Number(s.nominalFlowM3h) || 0), 0) || 100;
        const hoursPerMmHa = 10 / avgFlow;
        const kwhPerMmHa = hoursPerMmHa * totalPower;
        cost = kwhPerMmHa * (kwhRate * (1 - discount / 100));
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
    if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
      setFormError('Informe uma quantidade válida maior que zero.');
      return;
    }
    const numHours = Number(injectionHours);
    if (!injectionHours || Number.isNaN(numHours) || numHours <= 0) {
      setFormError('Informe a duração da injeção em horas.');
      return;
    }

    onAddFertigation({
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
    });

    setFertilizerName('');
    setAmount('');
    setTargetNutrients('');
    setInjectionHours('');
    setCompatibility('Compatível');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Gestão Energética &amp; Fertirrigação Integrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de tarifação de energia e cronograma de injeção de fertilizantes solúveis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTariffConfig((prev) => !prev)}
          className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          {showTariffConfig ? 'Ocultar Tarifação' : 'Configurar Tarifação'}
        </button>
      </div>

      {showTariffConfig && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-3">
          <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
            Parâmetros de Tarifação da Concessionária
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Informe a tarifa da fatura e o desconto do horário reservado irrigante noturno (ANEEL) para estimar o custo por mm/ha.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Tarifa de Energia (R$/kWh)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={kwhRate}
                onChange={(e) => setKwhRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 0.45"
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Desconto Tarifa Noturna (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={nightDiscountPct}
                onChange={(e) =>
                  setNightDiscountPct(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="Ex: 60"
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setKwhRate('');
                  setNightDiscountPct('');
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Tarifas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-KPI Energy Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            <span>Potência Instalada</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
            {totalPowerKw} <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {systems.length === 0
              ? 'Nenhum conjunto motobomba cadastrado'
              : totalPowerKw > 0
              ? `${totalPumpsCount} ${totalPumpsCount === 1 ? 'conjunto motobomba' : 'conjuntos motobomba'}`
              : 'Nenhuma potência informada'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            <span>Desconto Tarifa Noturna</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            {effectiveDiscountPct}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {effectiveDiscountPct > 0
              ? 'Horário reservado irrigante ANEEL'
              : 'Configure a tarifa para calcular economia'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            <span>Custo Médio por Lâmina</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
            R$ {calculatedCostPerMmHa.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-500">/ mm / ha</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {calculatedCostPerMmHa > 0
              ? 'Estimativa energética por milímetro'
              : 'Informe tarifa e sistema para calcular'}
          </p>
        </div>
      </div>

      {/* Fertigation Form + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Programar Fertirrigação
            </h4>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              {compatibility}
            </span>
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateFertigation} className="space-y-3">
            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Sistema de Irrigação</label>
              <select
                value={activeSystem?.id || ''}
                onChange={(e) => setSelectedSystemId(e.target.value)}
                disabled={systems.length === 0}
                className={IRRIGATION_INPUT_CLASS}
              >
                {systems.length === 0 ? (
                  <option value="">Nenhum sistema cadastrado</option>
                ) : (
                  systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.systemName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Fertilizante / Calda</label>
              <input
                type="text"
                value={fertilizerName}
                onChange={(e) => setFertilizerName(e.target.value)}
                placeholder="Ex: Nitrato de Cálcio, KCl, MAP..."
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Quantidade</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 100"
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Unidade</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'kg' | 'L')}
                  className={IRRIGATION_INPUT_CLASS}
                >
                  <option value="kg">kg</option>
                  <option value="L">Litros (L)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={IRRIGATION_LABEL_CLASS}>Aporte de Nutrientes Alvo</label>
              <input
                type="text"
                value={targetNutrients}
                onChange={(e) => setTargetNutrients(e.target.value)}
                placeholder="Ex: N: 20 kg/ha, K₂O: 30 kg/ha"
                className={IRRIGATION_INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Injeção (Horas)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={injectionHours}
                  onChange={(e) =>
                    setInjectionHours(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Ex: 2.0"
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Compatibilidade</label>
                <select
                  value={compatibility}
                  onChange={(e) =>
                    setCompatibility(
                      e.target.value as FertigationProgramItem['compatibilityCheck']
                    )
                  }
                  className={IRRIGATION_INPUT_CLASS}
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
              className="w-full h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Agendar Fertirrigação
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Cronograma de Fertirrigação ({fertigation.length})
            </h4>

            {fertigation.length > 0 && onClearFertigation && (
              !confirmClearAll ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="text-[11px] font-medium text-rose-700 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpar Histórico
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-[11px]">
                  <span className="text-rose-700 dark:text-rose-400 font-medium">Limpar tudo?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearFertigation();
                      setConfirmClearAll(false);
                    }}
                    className="h-6 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="h-6 px-2 rounded border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-medium inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Não
                  </button>
                </div>
              )
            )}
          </div>

          {fertigation.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-8 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Nenhuma fertirrigação programada
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Preencha o formulário ao lado para agendar uma aplicação de fertilizantes solúveis via irrigação.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
              {fertigation.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {item.fertilizerName}
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          item.compatibilityCheck === 'Compatível'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : item.compatibilityCheck === 'Requer Atenção'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        · {item.compatibilityCheck}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                      {formatBrDate(item.date)} · {item.targetNutrients} · Injeção: {item.injectionDurationHours}h
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right tabular-nums">
                      <strong className="text-emerald-700 dark:text-emerald-400 block">
                        {item.amountKgOrL} {item.unit}
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {item.status}
                      </span>
                    </div>

                    {onDeleteFertigation && (
                      <button
                        type="button"
                        onClick={() => onDeleteFertigation(item.id)}
                        aria-label={`Excluir agendamento ${item.fertilizerName}`}
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center justify-center cursor-pointer"
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

export default EnergyAndFertigationView;
