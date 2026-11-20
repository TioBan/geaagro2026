import React, { useState, useEffect, useRef } from 'react';
import { PropertyField, SeedingConfig, PlantabilitySamplingPoint } from '../../types/plantability';
import { calculatePlantabilityMetrics } from '../../utils/plantabilityCalculations';
import { Ruler, Trash2, CheckCircle2, AlertTriangle, Save, Calculator } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  configs: SeedingConfig[];
  samplings: PlantabilitySamplingPoint[];
  onSaveSampling: (sampling: PlantabilitySamplingPoint) => void;
  onDeleteSampling?: (id: string) => void;
}

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const PlantabilitySamplingView: React.FC<Props> = ({
  fields,
  configs,
  samplings,
  onSaveSampling,
  onDeleteSampling
}) => {
  const safeFields = (fields || []).filter(f => f && f.id);
  const safeSamplings = (samplings || []).filter(s => s && s.id);

  const [selectedFieldId, setSelectedFieldId] = useState<string>(safeFields[0]?.id || '');
  const [pointCode, setPointCode] = useState(`Ponto-${safeSamplings.length + 1}`);
  const [evaluator, setEvaluator] = useState('');
  const [rowNumber, setRowNumber] = useState<number>(1);
  const [sampledLength, setSampledLength] = useState<number>(5.0);
  const [spacingsInput, setSpacingsInput] = useState<string>('');
  const [depthsInput, setDepthsInput] = useState<string>('');
  const [emergenceDays, setEmergenceDays] = useState<number>(6);
  const [damagedPlants, setDamagedPlants] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (safeFields.length > 0 && !safeFields.some(f => f.id === selectedFieldId)) {
      setSelectedFieldId(safeFields[0].id);
    }
  }, [safeFields, selectedFieldId]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const addDistanceValue = (valCm: number) => {
    setSpacingsInput(prev => (!prev.trim() ? `${valCm}` : `${prev}, ${valCm}`));
  };

  const parsedSpacings = spacingsInput
    .split(',')
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v) && v > 0);

  const parsedDepths = depthsInput
    .split(',')
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v) && v > 0);

  const activeConfig = (configs || []).find(c => c.fieldId === selectedFieldId);
  const liveSamplingPoint: PlantabilitySamplingPoint = {
    id: 'temp',
    fieldId: selectedFieldId,
    pointCode: pointCode || 'Ponto',
    evaluator: evaluator || 'Responsável',
    timestamp: new Date().toISOString(),
    rowNumber,
    sampledLengthMeters: sampledLength,
    actualSpacingsCm: parsedSpacings,
    actualDepthsCm: parsedDepths,
    emergenceDays,
    damagedPlantsCount: damagedPlants
  };

  const liveMetrics = calculatePlantabilityMetrics(
    parsedSpacings.length > 0 ? [liveSamplingPoint] : [],
    activeConfig
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSpacings.length === 0) return;

    const newPoint: PlantabilitySamplingPoint = {
      id: `smp-${Date.now()}`,
      fieldId: selectedFieldId || safeFields[0]?.id || 'fld-default',
      pointCode: pointCode.trim() || `Ponto-${safeSamplings.length + 1}`,
      evaluator: evaluator.trim() || 'Avaliador',
      timestamp: new Date().toISOString(),
      rowNumber,
      sampledLengthMeters: sampledLength,
      actualSpacingsCm: parsedSpacings,
      actualDepthsCm: parsedDepths.length > 0 ? parsedDepths : [4.0],
      emergenceDays,
      damagedPlantsCount: damagedPlants,
      notes: notes.trim()
    };

    onSaveSampling(newPoint);
    setSaveSuccess(true);
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = window.setTimeout(() => setSaveSuccess(false), 4000);
    setPointCode(`Ponto-${safeSamplings.length + 2}`);
    setSpacingsInput('');
    setDepthsInput('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Avaliação de Plantabilidade em Campo (Amostragem)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Informe as distâncias entre plantas sucessivas (cm) para calcular CV%, falhas, duplos e índice IGP em tempo real.
          </p>
        </div>

        <span className="text-xs text-slate-600 dark:text-zinc-300 tabular-nums shrink-0">
          Amostras salvas: <strong className="text-slate-900 dark:text-white">{safeSamplings.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sampling Form */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Nova Amostragem de Linha</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Talhão</label>
                <select
                  value={selectedFieldId}
                  onChange={e => setSelectedFieldId(e.target.value)}
                  className={inputClass}
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

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Código do Ponto</label>
                <input
                  type="text"
                  required
                  value={pointCode}
                  onChange={e => setPointCode(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Avaliador / Agrônomo</label>
                <input
                  type="text"
                  required
                  value={evaluator}
                  onChange={e => setEvaluator(e.target.value)}
                  placeholder="Nome do responsável"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Linha nº</label>
                <input
                  type="number"
                  min="1"
                  value={rowNumber}
                  onChange={e => setRowNumber(Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Trecho (m)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={sampledLength}
                  onChange={e => setSampledLength(Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Emergência (dias)</label>
                <input
                  type="number"
                  min="1"
                  value={emergenceDays}
                  onChange={e => setEmergenceDays(Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Plantas Danificadas</label>
                <input
                  type="number"
                  min="0"
                  value={damagedPlants}
                  onChange={e => setDamagedPlants(Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            {/* Distances & Quick Presets */}
            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                <label className="font-medium text-slate-600 dark:text-zinc-300">
                  Distâncias entre plantas sucessivas (cm, separadas por vírgula)
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  {parsedSpacings.length} medições
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 mr-0.5">Atalhos:</span>
                {[12.5, 12.0, 13.0, 14.0, 6.0, 25.0, 30.0].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addDistanceValue(val)}
                    className="h-7 px-2 rounded-md bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-zinc-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-medium tabular-nums border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  >
                    +{val} cm
                  </button>
                ))}
                {spacingsInput && (
                  <button
                    type="button"
                    onClick={() => setSpacingsInput('')}
                    className="h-7 px-2 rounded-md text-[11px] font-medium text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                required
                value={spacingsInput}
                onChange={e => setSpacingsInput(e.target.value)}
                placeholder="Ex: 12.5, 12.0, 13.0, 25.0, 6.0, 12.2"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">
                  Profundidades medidas (cm, separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={depthsInput}
                  onChange={e => setDepthsInput(e.target.value)}
                  placeholder="Ex: 4.0, 4.2, 3.9, 4.1"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Observações de Campo</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Condição do solo, palhada ou patinagem..."
                  className={inputClass}
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Amostragem de plantabilidade salva com sucesso.</span>
              </div>
            )}

            {safeFields.length === 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Nenhum talhão cadastrado. Cadastre um talhão na aba Talhões para vincular esta amostragem.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={parsedSpacings.length === 0}
              className="w-full h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:text-slate-500 dark:disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Amostragem ({parsedSpacings.length} medições)</span>
            </button>
          </form>
        </div>

        {/* Live Calculation Preview */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block">
                Prévia em Tempo Real
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                Índices Calculados da Amostra
              </h3>
            </div>

            <div className={`p-3.5 rounded-lg border text-center space-y-0.5 ${liveMetrics.igpColorClass}`}>
              <span className="text-[10px] font-semibold uppercase tracking-wide block opacity-80">
                Índice IGP GeaAgro
              </span>
              <span className="text-3xl font-bold tabular-nums tracking-tight block">
                {liveMetrics.igpScore}
              </span>
              <span className="text-xs font-medium block">{liveMetrics.igpClassification}</span>
            </div>

            <div className="rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 divide-y divide-slate-200/70 dark:divide-zinc-800 text-xs tabular-nums">
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">Espaçamento Alvo</span>
                <span className="font-semibold text-slate-900 dark:text-white">{liveMetrics.targetSpacingCm} cm</span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">Espaçamento Médio</span>
                <span className="font-semibold text-slate-900 dark:text-white">{liveMetrics.averageSpacingCm} cm</span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">Coef. Variação (CV%)</span>
                <span
                  className={`font-semibold ${
                    liveMetrics.cvPercent > 25
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {liveMetrics.cvPercent}%
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">Aceitáveis</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {liveMetrics.acceptablePercent}%
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">Falhas</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {liveMetrics.skipsPercent}%
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">Duplos</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {liveMetrics.doublesPercent}%
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">População Real</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {liveMetrics.realPopulationPerHa.toLocaleString('pt-BR')} p/ha
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-zinc-400">Profundidade Média</span>
                <span className="font-semibold text-slate-900 dark:text-white">{liveMetrics.avgDepthCm} cm</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center">
            Cálculo executado localmente em tempo real sem necessidade de conexão.
          </p>
        </div>
      </div>

      {/* Recorded Samplings Table */}
      {safeSamplings.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Histórico de Amostragens ({safeSamplings.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                  <th className="py-2 pr-3">Ponto</th>
                  <th className="py-2 px-3">Talhão</th>
                  <th className="py-2 px-3">Linha</th>
                  <th className="py-2 px-3 text-right">IGP</th>
                  <th className="py-2 px-3 text-right">CV%</th>
                  <th className="py-2 px-3 text-right">Aceitáveis</th>
                  <th className="py-2 px-3 text-right">Falhas</th>
                  <th className="py-2 px-3 text-right">Duplos</th>
                  {onDeleteSampling && <th className="py-2 pl-3 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 tabular-nums">
                {safeSamplings.map(sp => {
                  const field = safeFields.find(f => f.id === sp.fieldId);
                  const cfg = (configs || []).find(c => c.fieldId === sp.fieldId);
                  const m = calculatePlantabilityMetrics([sp], cfg);

                  return (
                    <tr key={sp.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {sp.pointCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                        {field ? `${field.fieldCode} (${field.crop})` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">L{sp.rowNumber}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                        {m.igpScore}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {m.cvPercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        {m.acceptablePercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 font-medium">
                        {m.skipsPercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-sky-600 dark:text-sky-400 font-medium">
                        {m.doublesPercent}%
                      </td>
                      {onDeleteSampling && (
                        <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                          {confirmDeleteId === sp.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="h-6 px-2 rounded border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer"
                              >
                                Não
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteSampling(sp.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="h-6 px-2 rounded bg-rose-600 text-white text-[11px] cursor-pointer"
                              >
                                Excluir
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(sp.id)}
                              title="Remover amostragem"
                              className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
