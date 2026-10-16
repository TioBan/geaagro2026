import React, { useState } from 'react';
import { PropertyField, CropType, PlantabilitySamplingPoint, SeedingConfig } from '../../types/plantability';
import { calculatePlantabilityMetrics, simulateEconomicLoss } from '../../utils/plantabilityCalculations';
import { DollarSign, TrendingUp, Calculator, AlertTriangle, Sparkles, Scale, Percent } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  samplings: PlantabilitySamplingPoint[];
  configs: SeedingConfig[];
}

export const PlantabilityLossSimulatorView: React.FC<Props> = ({ fields, samplings, configs }) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields?.[0]?.id || '');
  
  const activeField = (fields || []).find(f => f?.id === selectedFieldId) || fields?.[0];
  const fieldSamplings = samplings.filter(s => s.fieldId === activeField?.id);
  const activeConfig = configs.find(c => c.fieldId === activeField?.id);
  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);

  // Interactive Simulator State
  const [areaHa, setAreaHa] = useState<number>(activeField?.areaHa || 100);
  const [crop, setCrop] = useState<CropType>(activeField?.crop || 'Soja');
  const [targetYieldScHa, setTargetYieldScHa] = useState<number>(70);
  const [commodityPricePerSc, setCommodityPricePerSc] = useState<number>(130); // R$ 130 per bag
  const [seedCostPerHa, setSeedCostPerHa] = useState<number>(380); // R$ 380/ha
  const [skipsPct, setSkipsPct] = useState<number>(metrics.skipsPercent || 5.0);
  const [doublesPct, setDoublesPct] = useState<number>(metrics.doublesPercent || 4.0);
  const [cvPct, setCvPct] = useState<number>(metrics.cvPercent || 22.0);

  // Calculate simulated losses
  const simMetrics = {
    ...metrics,
    skipsPercent: skipsPct,
    doublesPercent: doublesPct,
    cvPercent: cvPct
  };

  const lossResult = simulateEconomicLoss(
    simMetrics,
    areaHa,
    crop,
    targetYieldScHa,
    commodityPricePerSc,
    seedCostPerHa
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-zinc-900 text-white p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            🚀 Simulador de Perdas Econômicas por Plantabilidade
          </h2>
          <p className="text-xs text-stone-300 max-w-2xl">
            Transforme medições de campo (falhas, duplos, variação de espaçamento CV%) em informações econômicas reais em R$/ha e sacas perdidas.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-amber-300 text-right font-mono">
          <span className="text-[10px] font-bold uppercase block text-amber-400">Prejuízo na Área Total</span>
          <span className="text-3xl font-black text-white">
            R$ {lossResult.totalFinancialLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold block opacity-90">{lossResult.totalYieldLossSc} sacas perdidas em {areaHa} ha</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Controls Input Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-600" />
            Parâmetros do Cenário
          </h3>

          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="text-stone-600 dark:text-stone-300">Carregar Dados do Talhão:</label>
              <select
                value={selectedFieldId}
                onChange={e => {
                  const fid = e.target.value;
                  setSelectedFieldId(fid);
                  const f = (fields || []).find(x => x?.id === fid);
                  if (f) {
                    setAreaHa(f.areaHa);
                    setCrop(f.crop);
                  }
                }}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-bold"
              >
                {(fields || []).filter(f => f && f.id).map(f => (
                  <option key={f.id} value={f.id}>
                    {f.fieldCode} ({f.areaHa} ha - {f.crop})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-stone-600 dark:text-stone-300">Área do Talhão (ha)</label>
                <input
                  type="number"
                  value={areaHa}
                  onChange={e => setAreaHa(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-stone-600 dark:text-stone-300">Cultura</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value as CropType)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-bold"
                >
                  <option value="Soja">Soja</option>
                  <option value="Milho">Milho</option>
                  <option value="Algodão">Algodão</option>
                  <option value="Feijão">Feijão</option>
                  <option value="Girassol">Girassol</option>
                  <option value="Sorgo">Sorgo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-stone-600 dark:text-stone-300">Meta Produtividade (sc/ha)</label>
                <input
                  type="number"
                  value={targetYieldScHa}
                  onChange={e => setTargetYieldScHa(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-stone-600 dark:text-stone-300">Preço da Saca (R$)</label>
                <input
                  type="number"
                  value={commodityPricePerSc}
                  onChange={e => setCommodityPricePerSc(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-stone-600 dark:text-stone-300">Custo da Semente (R$/ha)</label>
              <input
                type="number"
                value={seedCostPerHa}
                onChange={e => setSeedCostPerHa(Number(e.target.value))}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
              />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
              <span className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-300 block">
                Simular Índices de Campo (%):
              </span>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span>Percentual de Falhas:</span>
                  <span className="font-bold text-amber-700">{skipsPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={skipsPct}
                  onChange={e => setSkipsPct(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span>Percentual de Duplos:</span>
                  <span className="font-bold text-sky-700">{doublesPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={doublesPct}
                  onChange={e => setDoublesPct(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span>Coeficiente Variação (CV%):</span>
                  <span className="font-bold text-purple-700">{cvPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={cvPct}
                  onChange={e => setCvPct(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Detalhamento Agronômico & Financeiro de Perdas
          </h3>

          {/* Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
              <span className="text-xs font-black uppercase text-rose-800 dark:text-rose-300 block">
                Perda Direta por Hectare
              </span>
              <p className="text-3xl font-black text-rose-700 dark:text-rose-400 font-mono">
                R$ {lossResult.financialLossPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ha
              </p>
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Equivalente a <strong>{lossResult.yieldLossScHa} sacas/ha</strong> ({lossResult.yieldLossPercent}% de redução na produtividade).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 block">
                Desperdício de Sementes (Duplos)
              </span>
              <p className="text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
                R$ {lossResult.seedWastePerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ha
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Sementes sobrepostas competindo entre si e reduzindo estande produtivo útil.
              </p>
            </div>
          </div>

          {/* Loss Origin Explanation */}
          <div className="p-5 bg-stone-50 dark:bg-zinc-800/60 rounded-2xl border border-stone-200 dark:border-zinc-700 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-stone-800 dark:text-stone-200">
              Origem das Perdas Estimadas no Modelo Agronômico:
            </h4>

            <div className="space-y-2 text-xs font-medium text-stone-700 dark:text-stone-300">
              <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-700 pb-1.5">
                <span>1. Penalidade por Falhas ({skipsPct}% de falhas):</span>
                <span className="font-bold text-rose-600 font-mono">-{(skipsPct * 0.85).toFixed(1)}% rendimento</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-700 pb-1.5">
                <span>2. Competição Interplantas por Duplos ({doublesPct}% de duplos):</span>
                <span className="font-bold text-rose-600 font-mono">-{(doublesPct * 0.30).toFixed(1)}% rendimento</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-700 pb-1.5">
                <span>3. Desuniformidade Espacial (CV {cvPct}%):</span>
                <span className="font-bold text-rose-600 font-mono">
                  -{Math.max(0, cvPct - 25) * 0.25}% rendimento
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-stone-900 dark:text-white pt-1">
                <span>Total de Perda Produtiva Estimada:</span>
                <span className="text-rose-700 dark:text-rose-400 font-mono">{lossResult.yieldLossPercent}%</span>
              </div>
            </div>
          </div>

          {/* Decision Support Recommendation */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Recomendação Econômica GeaAgro:
            </span>
            <p className="text-xs text-emerald-900 dark:text-emerald-300">
              Corrigir a regulagem do dosador e reduzir a velocidade para atingir <strong>CV &lt; 20%</strong> economizaria aproximadamente{' '}
              <strong className="font-mono">R$ {(lossResult.totalFinancialLoss * 0.6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> nesta safra na área de {areaHa} hectares.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
