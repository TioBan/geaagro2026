import React, { useState, useEffect } from 'react';
import { PropertyField, CropType, PlantabilitySamplingPoint, SeedingConfig } from '../../types/plantability';
import { calculatePlantabilityMetrics, simulateEconomicLoss } from '../../utils/plantabilityCalculations';
import { TrendingUp, Calculator, CheckCircle2 } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  samplings: PlantabilitySamplingPoint[];
  configs: SeedingConfig[];
}

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const PlantabilityLossSimulatorView: React.FC<Props> = ({ fields, samplings, configs }) => {
  const safeFields = (fields || []).filter(f => f && f.id);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(safeFields[0]?.id || '');

  const activeField = safeFields.find(f => f.id === selectedFieldId) || safeFields[0];
  const fieldSamplings = (samplings || []).filter(s => s?.fieldId === activeField?.id);
  const activeConfig = (configs || []).find(c => c?.fieldId === activeField?.id);
  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);

  const [areaHa, setAreaHa] = useState<number>(activeField?.areaHa || 100);
  const [crop, setCrop] = useState<CropType>(activeField?.crop || 'Soja');
  const [targetYieldScHa, setTargetYieldScHa] = useState<number>(70);
  const [commodityPricePerSc, setCommodityPricePerSc] = useState<number>(130);
  const [seedCostPerHa, setSeedCostPerHa] = useState<number>(380);
  const [skipsPct, setSkipsPct] = useState<number>(metrics.skipsPercent || 5.0);
  const [doublesPct, setDoublesPct] = useState<number>(metrics.doublesPercent || 4.0);
  const [cvPct, setCvPct] = useState<number>(metrics.cvPercent || 22.0);

  useEffect(() => {
    if (safeFields.length > 0 && !safeFields.some(f => f.id === selectedFieldId)) {
      const first = safeFields[0];
      setSelectedFieldId(first.id);
      setAreaHa(first.areaHa);
      setCrop(first.crop);
      const fSamplings = (samplings || []).filter(s => s?.fieldId === first.id);
      if (fSamplings.length > 0) {
        const fCfg = (configs || []).find(c => c?.fieldId === first.id);
        const fMetrics = calculatePlantabilityMetrics(fSamplings, fCfg);
        setSkipsPct(fMetrics.skipsPercent);
        setDoublesPct(fMetrics.doublesPercent);
        setCvPct(fMetrics.cvPercent);
      }
    }
  }, [safeFields, selectedFieldId, samplings, configs]);

  const handleFieldChange = (fid: string) => {
    setSelectedFieldId(fid);
    const f = safeFields.find(x => x.id === fid);
    if (f) {
      setAreaHa(f.areaHa);
      setCrop(f.crop);
      const fSamplings = (samplings || []).filter(s => s?.fieldId === fid);
      if (fSamplings.length > 0) {
        const fCfg = (configs || []).find(c => c?.fieldId === fid);
        const fMetrics = calculatePlantabilityMetrics(fSamplings, fCfg);
        setSkipsPct(fMetrics.skipsPercent);
        setDoublesPct(fMetrics.doublesPercent);
        setCvPct(fMetrics.cvPercent);
      }
    }
  };

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

  const cvPenaltyPct = Number((Math.max(0, cvPct - 25) * 0.25).toFixed(1));

  return (
    <div className="space-y-4">
      {/* Header Summary Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Simulador de Perdas Econômicas por Plantabilidade</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl">
            Converta falhas, duplos e coeficiente de variação (CV%) em impacto real por hectare e sacas perdidas na safra.
          </p>
        </div>

        <div className="px-4 py-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-right tabular-nums shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400 block">
            Prejuízo Estimado Total
          </span>
          <span className="text-2xl font-bold text-rose-700 dark:text-rose-300 block leading-tight">
            R$ {lossResult.totalFinancialLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 block">
            {lossResult.totalYieldLossSc} sacas perdidas em {areaHa} ha
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Parâmetros do Cenário</span>
          </h3>

          <div className="space-y-3 text-xs">
            {safeFields.length > 0 && (
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Carregar Dados do Talhão</label>
                <select
                  value={selectedFieldId}
                  onChange={e => handleFieldChange(e.target.value)}
                  className={inputClass}
                >
                  {safeFields.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.fieldCode} ({f.areaHa} ha - {f.crop})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Área (ha)</label>
                <input
                  type="number"
                  min="1"
                  value={areaHa}
                  onChange={e => setAreaHa(Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Cultura</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value as CropType)}
                  className={inputClass}
                >
                  <option value="Soja">Soja</option>
                  <option value="Milho">Milho</option>
                  <option value="Algodão">Algodão</option>
                  <option value="Feijão">Feijão</option>
                  <option value="Girassol">Girassol</option>
                  <option value="Sorgo">Sorgo</option>
                  <option value="Trigo">Trigo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Meta (sc/ha)</label>
                <input
                  type="number"
                  min="1"
                  value={targetYieldScHa}
                  onChange={e => setTargetYieldScHa(Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Preço Saca (R$)</label>
                <input
                  type="number"
                  min="1"
                  value={commodityPricePerSc}
                  onChange={e => setCommodityPricePerSc(Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Custo da Semente (R$/ha)</label>
              <input
                type="number"
                min="0"
                value={seedCostPerHa}
                onChange={e => setSeedCostPerHa(Number(e.target.value))}
                className={`${inputClass} tabular-nums`}
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 block">
                Índices de Campo Simulados
              </span>

              <div>
                <div className="flex justify-between text-[11px] tabular-nums mb-1">
                  <span className="text-slate-600 dark:text-zinc-300">Percentual de Falhas</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{skipsPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={skipsPct}
                  onChange={e => setSkipsPct(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] tabular-nums mb-1">
                  <span className="text-slate-600 dark:text-zinc-300">Percentual de Duplos</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">{doublesPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={doublesPct}
                  onChange={e => setDoublesPct(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] tabular-nums mb-1">
                  <span className="text-slate-600 dark:text-zinc-300">Coeficiente de Variação (CV%)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cvPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={cvPct}
                  onChange={e => setCvPct(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Detalhamento Agronômico & Financeiro</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400 block">
                Perda Direta por Hectare
              </span>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 tabular-nums">
                R$ {lossResult.financialLossPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha
              </p>
              <p className="text-xs text-rose-700/90 dark:text-rose-300/90 tabular-nums">
                Equivalente a <strong>{lossResult.yieldLossScHa} sc/ha</strong> ({lossResult.yieldLossPercent}% de redução).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 block">
                Desperdício de Sementes (Duplos)
              </span>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                R$ {lossResult.seedWastePerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha
              </p>
              <p className="text-xs text-amber-700/90 dark:text-amber-300/90">
                Sementes sobrepostas competindo entre si e reduzindo o estande útil.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 p-3.5 space-y-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
              Composição das Perdas no Modelo Agronômico
            </h4>

            <div className="divide-y divide-slate-200/70 dark:divide-zinc-800 text-xs tabular-nums">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-zinc-300">
                  1. Penalidade por falhas ({skipsPct}%)
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{(skipsPct * 0.85).toFixed(1)}% rendimento
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-zinc-300">
                  2. Competição interplantas por duplos ({doublesPct}%)
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{(doublesPct * 0.3).toFixed(1)}% rendimento
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-zinc-300">
                  3. Desuniformidade espacial (CV {cvPct}%)
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{cvPenaltyPct.toFixed(1)}% rendimento
                </span>
              </div>
              <div className="flex justify-between items-center pt-2.5 font-semibold text-slate-900 dark:text-white">
                <span>Total de perda produtiva estimada</span>
                <span className="text-rose-700 dark:text-rose-400">{lossResult.yieldLossPercent}%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/60 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recomendação Econômica</span>
            </span>
            <p className="text-xs text-emerald-900 dark:text-emerald-200 tabular-nums">
              Ajustar a regulagem do dosador e controlar a velocidade para atingir <strong>CV &lt; 20%</strong> pode recuperar aproximadamente{' '}
              <strong>
                R$ {(lossResult.totalFinancialLoss * 0.6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>{' '}
              nesta safra em {areaHa} hectares.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
