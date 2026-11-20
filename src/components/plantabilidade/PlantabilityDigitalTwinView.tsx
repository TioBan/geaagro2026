import React, { useState, useEffect } from 'react';
import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint,
  PlantabilityPhoto
} from '../../types/plantability';
import { calculatePlantabilityMetrics, simulateEconomicLoss } from '../../utils/plantabilityCalculations';
import { Tractor, Sprout, Gauge, Camera, DollarSign, Layers } from 'lucide-react';

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
  const safeFields = (fields || []).filter(f => f && f.id);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(safeFields[0]?.id || '');

  useEffect(() => {
    if (safeFields.length > 0 && !safeFields.some(f => f.id === selectedFieldId)) {
      setSelectedFieldId(safeFields[0].id);
    }
  }, [safeFields, selectedFieldId]);

  const activeField = safeFields.find(f => f.id === selectedFieldId) || safeFields[0];
  const fieldSamplings = (samplings || []).filter(s => s?.fieldId === activeField?.id);
  const activeConfig = (configs || []).find(c => c?.fieldId === activeField?.id);
  const activePlanter = (planters || []).find(p => p?.id === activeConfig?.planterId) || planters?.[0];
  const activeSeed = (seeds || []).find(s => s?.id === activeConfig?.seedBatchId) || seeds?.[0];
  const fieldPhotos = (photos || []).filter(p => p?.fieldId === activeField?.id);

  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);
  const lossSim = simulateEconomicLoss(metrics, activeField?.areaHa || 100);

  return (
    <div className="space-y-4">
      {/* Header & Field Selector */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Gêmeo Digital da Semeadura (Visão 360°)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Visão unificada de plantadeira, lote de sementes, operação, qualidade de distribuição, fotos e impacto econômico.
          </p>
        </div>

        <div className="w-full md:w-64 shrink-0">
          <label className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 dark:text-zinc-500 block mb-1">
            Talhão Selecionado
          </label>
          <select
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          >
            {safeFields.length === 0 ? (
              <option value="">Nenhum talhão cadastrado</option>
            ) : (
              safeFields.map(f => (
                <option key={f.id} value={f.id}>
                  {f.fieldCode} - {f.crop} ({f.farmName})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {activeField ? (
        <div className="space-y-4">
          {/* Active Field Summary Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block tabular-nums">
                {activeField.fieldCode} • {activeField.areaHa} ha • {activeField.farmName}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeField.crop} — {activeField.cultivar}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                Semeadura: {activeField.seedingDate} • Solo: {activeField.soilType} • Sistema: {activeField.tillageSystem}
              </p>
            </div>

            <div className={`px-4 py-3 rounded-lg border flex items-center gap-4 shrink-0 ${metrics.igpColorClass}`}>
              <div className="pr-4 border-r border-current/20 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wide block opacity-80">
                  Índice IGP
                </span>
                <span className="text-2xl font-bold tabular-nums">{metrics.igpScore}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">{metrics.igpClassification}</span>
                <span className="text-[11px] tabular-nums block opacity-90">
                  {fieldSamplings.length} {fieldSamplings.length === 1 ? 'ponto' : 'pontos'} • CV {metrics.cvPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Planter Equipment */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Tractor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>1. Semeadora</span>
                </span>
                {activePlanter && (
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    {activePlanter.rowsCount}L
                  </span>
                )}
              </div>
              {activePlanter ? (
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-zinc-300">
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500">Equipamento: </span>
                    <strong className="text-slate-900 dark:text-white">
                      {activePlanter.brand} {activePlanter.model}
                    </strong>
                  </p>
                  <p className="tabular-nums">
                    <span className="text-slate-400 dark:text-zinc-500">Configuração: </span>
                    <strong className="text-slate-900 dark:text-white">
                      {activePlanter.rowsCount} linhas × {activePlanter.rowSpacingMeters} m
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500">Dosador: </span>
                    <strong className="text-slate-900 dark:text-white">{activePlanter.meterType}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500">Disco: </span>
                    <strong className="text-slate-900 dark:text-white">{activePlanter.discSpecification}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500">Molas: </span>
                    <strong className="text-slate-900 dark:text-white">{activePlanter.springPressureSetting}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-zinc-500">Nenhuma semeadora vinculada.</p>
              )}
            </div>

            {/* 2. Seed Batch */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Sementes</span>
                </span>
                {activeSeed && (
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    {activeSeed.batchNumber}
                  </span>
                )}
              </div>
              {activeSeed ? (
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-zinc-300">
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500">Cultivar: </span>
                    <strong className="text-slate-900 dark:text-white">{activeSeed.cultivar}</strong>
                  </p>
                  <p className="tabular-nums">
                    <span className="text-slate-400 dark:text-zinc-500">Germ. / Vigor: </span>
                    <strong className="text-slate-900 dark:text-white">
                      {activeSeed.germinationRate}% / {activeSeed.vigorRate}%
                    </strong>
                  </p>
                  <p className="tabular-nums">
                    <span className="text-slate-400 dark:text-zinc-500">PMS: </span>
                    <strong className="text-slate-900 dark:text-white">{activeSeed.pmsGrams} g</strong>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500">Tratamento: </span>
                    <strong className="text-slate-900 dark:text-white">{activeSeed.treatment}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500">Fornecedor: </span>
                    <strong className="text-slate-900 dark:text-white">{activeSeed.supplier}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-zinc-500">Nenhum lote de sementes cadastrado.</p>
              )}
            </div>

            {/* 3. Seeding Operations */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>3. Operação & Solo</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  {activeConfig ? activeConfig.targetSpeedKmH : 6.5} km/h
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-zinc-300 tabular-nums">
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Pop. Alvo: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {metrics.targetPopulationPerHa.toLocaleString('pt-BR')} p/ha
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Profundidade Alvo: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {activeConfig ? activeConfig.targetDepthCm : 4.0} cm
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Umidade Solo: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {activeConfig ? activeConfig.soilMoisturePct : 22}%
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Temp. Solo: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {activeConfig ? activeConfig.soilTempCelsius : 23} °C
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Operador: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {activeConfig ? activeConfig.operatorName : 'Operador padrão'}
                  </strong>
                </p>
              </div>
            </div>

            {/* 4. Quality & Economic Result */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  <span>4. Resultado & Perdas</span>
                </span>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                  -{lossSim.yieldLossPercent}%
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-zinc-300 tabular-nums">
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">CV%: </span>
                  <strong
                    className={
                      metrics.cvPercent > 25
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {metrics.cvPercent}%
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Falhas / Duplos: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {metrics.skipsPercent}% / {metrics.doublesPercent}%
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">População Real: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {metrics.realPopulationPerHa.toLocaleString('pt-BR')} p/ha
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Perda / ha: </span>
                  <strong className="text-rose-600 dark:text-rose-400">
                    R$ {lossSim.financialLossPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Perda Total: </span>
                  <strong className="text-rose-700 dark:text-rose-400">
                    R$ {lossSim.totalFinancialLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Photo Diary Snapshot */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Galeria Fotográfica do Talhão ({fieldPhotos.length})</span>
            </h4>

            {fieldPhotos.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                Nenhuma fotografia vinculada a este talhão. Adicione registros na aba Diário.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fieldPhotos.map(ph => (
                  <div
                    key={ph.id}
                    className="rounded-lg overflow-hidden border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-2 space-y-1.5"
                  >
                    <img
                      src={ph.photoUrl}
                      alt={ph.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-28 object-cover rounded-md"
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block">
                      {ph.category}
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">
                      {ph.caption}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Gêmeo Digital aguardando dados
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cadastre talhões, plantadeiras e amostragens para consolidar o diagnóstico 360° da semeadura.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
