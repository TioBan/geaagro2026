import React, { useState } from 'react';
import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint,
  PlantabilityPhoto
} from '../../types/plantability';
import { calculatePlantabilityMetrics, simulateEconomicLoss } from '../../utils/plantabilityCalculations';
import { Sparkles, Tractor, Sprout, Building2, Gauge, AlertTriangle, Layers, Camera, CheckCircle2, DollarSign } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  planters: PlanterEquipment[];
  seeds: SeedBatch[];
  configs: SeedingConfig[];
  samplings: PlantabilitySamplingPoint[];
  photos: PlantabilityPhoto[];
}

export const PlantabilityDigitalTwinView: React.FC<Props> = ({
  fields,
  planters,
  seeds,
  configs,
  samplings,
  photos
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields?.[0]?.id || '');

  const activeField = (fields || []).find(f => f?.id === selectedFieldId) || fields?.[0];
  const fieldSamplings = (samplings || []).filter(s => s?.fieldId === activeField?.id);
  const activeConfig = (configs || []).find(c => c?.fieldId === activeField?.id);
  const activePlanter = (planters || []).find(p => p?.id === activeConfig?.planterId) || planters?.[0];
  const activeSeed = (seeds || []).find(s => s?.id === activeConfig?.seedBatchId) || seeds?.[0];
  const fieldPhotos = (photos || []).filter(p => p?.fieldId === activeField?.id);

  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);
  const lossSim = simulateEconomicLoss(metrics, activeField?.areaHa || 100);

  return (
    <div className="space-y-6">
      {/* Top Field Selector */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Painel 360° Unificado
          </span>
          <h2 className="text-xl font-black text-stone-900 dark:text-white mt-1">
            🌱 Gêmeo Digital da Semeadura
          </h2>
          <p className="text-xs text-stone-500">
            Integração completa de máquinas, lote de sementes, regulagens, velocidade, qualidade de distribuição, registros fotográficos e projeção econômica.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Selecionar Talhão:</label>
          <select
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value)}
            className="w-full md:w-64 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-bold text-xs"
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>
                {f.fieldCode} - {f.crop} ({f.farmName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeField ? (
        <div className="space-y-6">
          {/* Main IGP Banner Card */}
          <div className="bg-stone-900 text-white p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                Gêmeo Ativo: {activeField.fieldCode} ({activeField.areaHa} ha)
              </span>
              <h3 className="text-2xl font-black">{activeField.crop} — {activeField.cultivar}</h3>
              <p className="text-xs text-stone-400">
                Semeado em: {activeField.seedingDate} | Solo: {activeField.soilType} | Sistema: {activeField.tillageSystem}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${metrics.igpColorClass} text-center space-y-1 shadow-lg`}>
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">Índice IGP GeaAgro</span>
              <span className="text-4xl font-black font-mono tracking-tight">{metrics.igpScore}</span>
              <span className="text-xs font-bold block">{metrics.igpClassification}</span>
            </div>
          </div>

          {/* 4 Pillars Grid: Planter, Seed, Operations, Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Planter Equipment */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Tractor className="w-4 h-4 text-emerald-600" />
                  1. Semeadora
                </span>
                <span className="text-[10px] text-stone-400 font-mono">ID: {activePlanter?.id}</span>
              </div>
              <div className="text-xs space-y-1.5 font-medium text-stone-700 dark:text-stone-300">
                <p><strong className="text-stone-900 dark:text-white">Equipamento:</strong> {activePlanter?.brand} {activePlanter?.model}</p>
                <p><strong className="text-stone-900 dark:text-white">Linhas x Espaçamento:</strong> {activePlanter?.rowsCount}L x {activePlanter?.rowSpacingMeters}m</p>
                <p><strong className="text-stone-900 dark:text-white">Dosador:</strong> {activePlanter?.meterType}</p>
                <p><strong className="text-stone-900 dark:text-white">Disco:</strong> {activePlanter?.discSpecification}</p>
                <p><strong className="text-stone-900 dark:text-white">Pressão Molas:</strong> {activePlanter?.springPressureSetting}</p>
              </div>
            </div>

            {/* 2. Seed Batch */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  2. Sementes
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Lote: {activeSeed?.batchNumber}</span>
              </div>
              <div className="text-xs space-y-1.5 font-medium text-stone-700 dark:text-stone-300">
                <p><strong className="text-stone-900 dark:text-white">Cultivar:</strong> {activeSeed?.cultivar}</p>
                <p><strong className="text-stone-900 dark:text-white">Germinação / Vigor:</strong> {activeSeed?.germinationRate}% / {activeSeed?.vigorRate}%</p>
                <p><strong className="text-stone-900 dark:text-white">PMS:</strong> {activeSeed?.pmsGrams} g</p>
                <p><strong className="text-stone-900 dark:text-white">Tratamento:</strong> {activeSeed?.treatment}</p>
                <p><strong className="text-stone-900 dark:text-white">Fornecedor:</strong> {activeSeed?.supplier}</p>
              </div>
            </div>

            {/* 3. Seeding Operations & Climate */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-purple-600" />
                  3. Operação & Solo
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {activeConfig ? activeConfig.targetSpeedKmH : 6.5} km/h
                </span>
              </div>
              <div className="text-xs space-y-1.5 font-medium text-stone-700 dark:text-stone-300">
                <p><strong className="text-stone-900 dark:text-white">Pop. Alvo:</strong> {metrics.targetPopulationPerHa.toLocaleString('pt-BR')} p/ha</p>
                <p><strong className="text-stone-900 dark:text-white">Profundidade Alvo:</strong> {activeConfig ? activeConfig.targetDepthCm : 4.0} cm</p>
                <p><strong className="text-stone-900 dark:text-white">Umidade Solo:</strong> {activeConfig ? activeConfig.soilMoisturePct : 22}%</p>
                <p><strong className="text-stone-900 dark:text-white">Temp. Solo:</strong> {activeConfig ? activeConfig.soilTempCelsius : 23}°C</p>
                <p><strong className="text-stone-900 dark:text-white">Operador:</strong> {activeConfig ? activeConfig.operatorName : 'Operador 1'}</p>
              </div>
            </div>

            {/* 4. Quality & Economic Result */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  4. Resultado & Perdas
                </span>
                <span className="text-[10px] text-rose-600 font-mono font-bold">
                  -{lossSim.yieldLossPercent}%
                </span>
              </div>
              <div className="text-xs space-y-1.5 font-medium text-stone-700 dark:text-stone-300">
                <p><strong className="text-stone-900 dark:text-white">CV%:</strong> <span className={metrics.cvPercent > 25 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{metrics.cvPercent}%</span></p>
                <p><strong className="text-stone-900 dark:text-white">Falhas / Duplos:</strong> {metrics.skipsPercent}% / {metrics.doublesPercent}%</p>
                <p><strong className="text-stone-900 dark:text-white">População Real:</strong> {metrics.realPopulationPerHa.toLocaleString('pt-BR')} p/ha</p>
                <p><strong className="text-stone-900 dark:text-white">Perda Econômica:</strong> <span className="text-rose-600 font-bold">R$ {lossSim.financialLossPerHa}/ha</span></p>
                <p><strong className="text-stone-900 dark:text-white">Perda Total Talhão:</strong> <span className="text-rose-700 font-black">R$ {lossSim.totalFinancialLoss.toLocaleString('pt-BR')}</span></p>
              </div>
            </div>
          </div>

          {/* Photo Diary Snapshot in Twin */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
            <h4 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              Galeria Fotográfica do Talhão
            </h4>

            {fieldPhotos.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Nenhuma fotografia anexada a este talhão ainda.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fieldPhotos.map(ph => (
                  <div key={ph.id} className="rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700 space-y-1 bg-stone-50 dark:bg-zinc-800 p-2">
                    <img src={ph.photoUrl} alt={ph.caption} className="w-full h-28 object-cover rounded-lg" />
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">{ph.category}</span>
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">{ph.caption}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-stone-900 dark:text-white">Gêmeo Digital Aguardando Dados</h3>
            <p className="text-xs text-stone-500">
              Cadastre talhões, maquinários e realize amostragens para visualizar o diagnóstico 360° unificado de semeadura.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
