import React, { useState } from 'react';
import { ForageProductionPlan } from '../../types/animalNutrition';
import { FORAGE_TYPE_LABELS, getForageTypeLabel } from './nutritionConstants';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Props {
  foragePlans: ForageProductionPlan[];
  onSavePlan: (plan: ForageProductionPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const ForagePlanningView: React.FC<Props> = ({
  foragePlans,
  onSavePlan,
  onDeletePlan,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ForageProductionPlan | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [forageType, setForageType] = useState<ForageProductionPlan['forageType']>('silagem_milho');
  const [areaHectares, setAreaHectares] = useState<number>(30);
  const [expectedYieldTonPerHa, setExpectedYieldTonPerHa] = useState<number>(45);
  const [currentStockTon, setCurrentStockTon] = useState<number>(300);
  const [monthlyConsumptionTon, setMonthlyConsumptionTon] = useState<number>(60);
  const [dryMatterPct, setDryMatterPct] = useState<number>(33);
  const [costPerTon, setCostPerTon] = useState<number>(350);

  const openNewModal = () => {
    setEditingPlan(null);
    setName('');
    setForageType('silagem_milho');
    setAreaHectares(30);
    setExpectedYieldTonPerHa(50);
    setCurrentStockTon(350);
    setMonthlyConsumptionTon(70);
    setDryMatterPct(33);
    setCostPerTon(380);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: ForageProductionPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setForageType(plan.forageType);
    setAreaHectares(plan.areaHectares);
    setExpectedYieldTonPerHa(plan.expectedYieldTonPerHa);
    setCurrentStockTon(plan.currentStockTon);
    setMonthlyConsumptionTon(plan.monthlyConsumptionTon);
    setDryMatterPct(plan.dryMatterPct);
    setCostPerTon(plan.costPerTon);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const monthsOfAutonomy = monthlyConsumptionTon > 0 ? currentStockTon / monthlyConsumptionTon : 12;
    let stockStatus: 'confortavel' | 'atencao' | 'critico' = 'confortavel';
    if (monthsOfAutonomy < 2) stockStatus = 'critico';
    else if (monthsOfAutonomy < 4) stockStatus = 'atencao';

    const planToSave: ForageProductionPlan = {
      id: editingPlan ? editingPlan.id : `forage_${Date.now()}`,
      name: name.trim(),
      forageType,
      areaHectares: Number(areaHectares),
      expectedYieldTonPerHa: Number(expectedYieldTonPerHa),
      currentStockTon: Number(currentStockTon),
      monthlyConsumptionTon: Number(monthlyConsumptionTon),
      monthsOfAutonomy: Math.round(monthsOfAutonomy * 10) / 10,
      stockStatus,
      dryMatterPct: Number(dryMatterPct),
      costPerTon: Number(costPerTon),
    };

    onSavePlan(planToSave);
    setIsModalOpen(false);
  };

  const totalStockTon = foragePlans.reduce((sum, p) => sum + p.currentStockTon, 0);
  const totalMonthlyConsumption = foragePlans.reduce((sum, p) => sum + p.monthlyConsumptionTon, 0);
  const avgAutonomyMonths =
    totalMonthlyConsumption > 0 ? (totalStockTon / totalMonthlyConsumption).toFixed(1) : null;

  const inputCls =
    'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

  return (
    <div id="forage-planning-view" className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Planejamento de Forragens & Estoque de Volumosos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de silagens, cana, capineira e fenos com cálculo automático de meses de autonomia
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Planejamento
        </button>
      </div>

      {/* Unified 3-KPI Hairline Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Estoque Total de Volumosos</span>
          <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {totalStockTon.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">toneladas</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Silagens e fenos disponíveis no silo/galpão
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Demanda Mensal de Trato</span>
          <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {totalMonthlyConsumption.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">t / mês</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Consumo mensal estimado do rebanho
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Autonomia Alimentar Média</span>
          <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {avgAutonomyMonths ?? '—'}
            </span>
            {avgAutonomyMonths && (
              <span className="text-xs text-slate-500 dark:text-slate-400">meses de reserva</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Segurança para período seco e entressafra
          </p>
        </div>
      </div>

      {/* Forage Cards or Empty State */}
      {foragePlans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Nenhum plano de forragem cadastrado
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Adicione silagens, fenos ou capineiras com estoque e consumo mensal para monitorar a autonomia do rebanho.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar Primeira Forragem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {foragePlans.map((plan) => {
            const statusText =
              plan.stockStatus === 'confortavel'
                ? 'text-emerald-700 dark:text-emerald-400'
                : plan.stockStatus === 'atencao'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-rose-700 dark:text-rose-400';

            const barColor =
              plan.monthsOfAutonomy >= 4
                ? 'bg-emerald-600 dark:bg-emerald-500'
                : plan.monthsOfAutonomy >= 2
                ? 'bg-amber-500'
                : 'bg-rose-600';

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {getForageTypeLabel(plan.forageType)}
                    </span>
                    <span className={`font-semibold tabular-nums ${statusText}`}>
                      {plan.monthsOfAutonomy.toFixed(1)} meses de autonomia
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                    {plan.name}
                  </h4>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs tabular-nums">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Área</span>
                      <strong className="text-slate-900 dark:text-slate-100">{plan.areaHectares} ha</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Produtividade</span>
                      <strong className="text-slate-900 dark:text-slate-100">{plan.expectedYieldTonPerHa} t/ha</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Matéria Seca</span>
                      <strong className="text-slate-900 dark:text-slate-100">{plan.dryMatterPct}%</strong>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Estoque Atual</span>
                      <strong className="text-slate-900 dark:text-slate-100">{plan.currentStockTon} t</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Consumo Mensal</span>
                      <strong className="text-slate-900 dark:text-slate-100">{plan.monthlyConsumptionTon} t/mês</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Custo de Produção</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        R$ {plan.costPerTon.toFixed(2)} / t
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.min(100, (plan.monthsOfAutonomy / 6) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1.5">
                  {confirmDeleteId === plan.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onDeletePlan(plan.id);
                          setConfirmDeleteId(null);
                        }}
                        className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium"
                      >
                        Confirmar Exclusão
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-7 px-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(plan)}
                        className="h-7 px-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(plan.id)}
                        aria-label={`Excluir ${plan.name}`}
                        className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-lg my-6 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {editingPlan ? 'Editar Planejamento de Forragem' : 'Novo Planejamento de Forragem'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Identificação / Safra *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Safra Silagem de Milho 2026"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Tipo de Forragem</label>
                  <select
                    value={forageType}
                    onChange={(e) => setForageType(e.target.value as ForageProductionPlan['forageType'])}
                    className={inputCls}
                  >
                    {(Object.keys(FORAGE_TYPE_LABELS) as Array<ForageProductionPlan['forageType']>).map((key) => (
                      <option key={key} value={key}>
                        {FORAGE_TYPE_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">% Matéria Seca (MS)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dryMatterPct}
                    onChange={(e) => setDryMatterPct(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Área (Hectares)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={areaHectares}
                    onChange={(e) => setAreaHectares(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Produtividade (t/ha)</label>
                  <input
                    type="number"
                    step="1"
                    value={expectedYieldTonPerHa}
                    onChange={(e) => setExpectedYieldTonPerHa(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Estoque Atual (t)</label>
                  <input
                    type="number"
                    step="1"
                    value={currentStockTon}
                    onChange={(e) => setCurrentStockTon(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Consumo Mensal (t/mês)</label>
                  <input
                    type="number"
                    step="1"
                    value={monthlyConsumptionTon}
                    onChange={(e) => setMonthlyConsumptionTon(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Custo Estimado por Tonelada (R$/t)
                </label>
                <input
                  type="number"
                  step="5"
                  value={costPerTon}
                  onChange={(e) => setCostPerTon(Number(e.target.value))}
                  className={`${inputCls} tabular-nums`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md"
                >
                  Salvar Forragem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
