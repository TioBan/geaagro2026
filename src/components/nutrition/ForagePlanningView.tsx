import React, { useState } from 'react';
import { ForageProductionPlan } from '../../types/animalNutrition';
import {
  Wheat,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  Layers,
  Scale,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

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
      name,
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
  const avgAutonomyMonths = totalMonthlyConsumption > 0 ? (totalStockTon / totalMonthlyConsumption).toFixed(1) : '6.0';

  return (
    <div id="forage-planning-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-400" />
            Planejamento de Produção de Forragens & Estoque de Volumosos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestão de silagens de milho, sorgo, capineira e fenos com cálculo automático de meses de segurança alimentar
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Planejamento de Forragem
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Estoque Total de Volumosos</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{totalStockTon.toLocaleString('pt-BR')}</span>
            <span className="text-xs text-slate-400">toneladas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Silagens e fenos prontos no silo/galpão</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Demanda Mensal de Trato</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-400">{totalMonthlyConsumption.toFixed(1)}</span>
            <span className="text-xs text-slate-400">t / mês</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consumo de todos os lotes do rebanho</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-4">
          <span className="text-xs font-bold text-emerald-400">Autonomia Alimentar Geral</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-300">{avgAutonomyMonths}</span>
            <span className="text-xs text-emerald-400 font-semibold">meses de reserva</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Segurança para período seco e entressafra</p>
        </div>
      </div>

      {/* Forage Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foragePlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                  {plan.forageType.replace('_', ' ')}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    plan.stockStatus === 'confortavel'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : plan.stockStatus === 'atencao'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {plan.monthsOfAutonomy.toFixed(1)} meses de autonomia
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-2.5">{plan.name}</h4>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs text-center">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Área Plantada</span>
                  <strong className="text-white">{plan.areaHectares} ha</strong>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Produtividade</span>
                  <strong className="text-white">{plan.expectedYieldTonPerHa} t/ha</strong>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">% Matéria Seca</span>
                  <strong className="text-amber-400">{plan.dryMatterPct}%</strong>
                </div>
              </div>

              {/* Stock and Cost */}
              <div className="mt-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estoque Atual:</span>
                  <strong className="text-slate-200">{plan.currentStockTon} t</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Consumo Mensal:</span>
                  <strong className="text-slate-200">{plan.monthlyConsumptionTon} t/mês</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custo de Produção:</span>
                  <strong className="text-emerald-400">R$ {plan.costPerTon.toFixed(2)} / tonelada</strong>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      plan.monthsOfAutonomy >= 4
                        ? 'bg-emerald-400'
                        : plan.monthsOfAutonomy >= 2
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (plan.monthsOfAutonomy / 6) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => openEditModal(plan)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={() => onDeletePlan(plan.id)}
                className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 rounded-lg text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wheat className="w-5 h-5 text-emerald-400" />
                {editingPlan ? 'Editar Forragem' : 'Novo Planejamento de Forragem'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Identificação / Safra *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Safra Silagem de Milho 2026"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Forragem</label>
                  <select
                    value={forageType}
                    onChange={(e) => setForageType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="silagem_milho">Silagem de Milho</option>
                    <option value="silagem_sorgo">Silagem de Sorgo</option>
                    <option value="cana_acucar">Cana-de-Açúcar</option>
                    <option value="feno_tifton">Feno de Tifton</option>
                    <option value="capineira">Capineira / Capiaçu</option>
                    <option value="pastagem_rotacionada">Pastagem Rotacionada</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">% Matéria Seca (MS)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dryMatterPct}
                    onChange={(e) => setDryMatterPct(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Área (Hectares)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={areaHectares}
                    onChange={(e) => setAreaHectares(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Produtividade (t/ha)</label>
                  <input
                    type="number"
                    step="1"
                    value={expectedYieldTonPerHa}
                    onChange={(e) => setExpectedYieldTonPerHa(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Estoque Atual (toneladas)</label>
                  <input
                    type="number"
                    step="1"
                    value={currentStockTon}
                    onChange={(e) => setCurrentStockTon(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Consumo Mensal (t/mês)</label>
                  <input
                    type="number"
                    step="1"
                    value={monthlyConsumptionTon}
                    onChange={(e) => setMonthlyConsumptionTon(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Custo Estimado por Tonelada (R$/t)</label>
                <input
                  type="number"
                  step="5"
                  value={costPerTon}
                  onChange={(e) => setCostPerTon(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg"
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
