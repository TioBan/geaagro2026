import React, { useState } from 'react';
import { PropertyField, SeedingConfig, PlantabilitySamplingPoint } from '../../types/plantability';
import { calculatePlantabilityMetrics } from '../../utils/plantabilityCalculations';
import { Ruler, Plus, Trash2, CheckCircle2, Sparkles, AlertTriangle, Save, Calculator } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  configs: SeedingConfig[];
  samplings: PlantabilitySamplingPoint[];
  onSaveSampling: (sampling: PlantabilitySamplingPoint) => void;
}

export const PlantabilitySamplingView: React.FC<Props> = ({
  fields,
  configs,
  samplings,
  onSaveSampling
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields?.[0]?.id || '');
  const [pointCode, setPointCode] = useState(`Ponto-${(samplings || []).length + 1}`);
  const [evaluator, setEvaluator] = useState('');
  const [rowNumber, setRowNumber] = useState<number>(1);
  const [sampledLength, setSampledLength] = useState<number>(5.0); // 5 meters
  
  // Array of successive spacings in cm
  const [spacingsInput, setSpacingsInput] = useState<string>('');
  const [depthsInput, setDepthsInput] = useState<string>('');
  const [emergenceDays, setEmergenceDays] = useState<number>(6);
  const [damagedPlants, setDamagedPlants] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick preset distance tap helper
  const addDistanceValue = (valCm: number) => {
    if (!spacingsInput) {
      setSpacingsInput(`${valCm}`);
    } else {
      setSpacingsInput(`${spacingsInput}, ${valCm}`);
    }
  };

  // Parse arrays
  const parsedSpacings = spacingsInput
    .split(',')
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v) && v > 0);

  const parsedDepths = depthsInput
    .split(',')
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v) && v > 0);

  // Live Metric Preview
  const activeConfig = configs.find(c => c.fieldId === selectedFieldId);
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
    (parsedSpacings || []).length > 0 ? [liveSamplingPoint] : [],
    activeConfig
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if ((parsedSpacings || []).length === 0) return;

    const newPoint: PlantabilitySamplingPoint = {
      id: `smp-${Date.now()}`,
      fieldId: selectedFieldId || ((fields || []).length > 0 ? fields[0]?.id || 'fld-default' : 'fld-default'),
      pointCode: pointCode.trim() || `Ponto-${(samplings || []).length + 1}`,
      evaluator: evaluator.trim() || 'Avaliador',
      timestamp: new Date().toISOString(),
      rowNumber,
      sampledLengthMeters: sampledLength,
      actualSpacingsCm: parsedSpacings,
      actualDepthsCm: (parsedDepths || []).length > 0 ? parsedDepths : [4.0],
      emergenceDays,
      damagedPlantsCount: damagedPlants,
      notes: notes.trim()
    };

    onSaveSampling(newPoint);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
    setPointCode(`Ponto-${(samplings || []).length + 2}`);
    setSpacingsInput('');
    setDepthsInput('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Ruler className="w-6 h-6 text-emerald-600" />
            Avaliação de Plantabilidade em Campo (Amostragem)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Insira as distâncias medidas entre plantas sucessivas em centímetros. O sistema calcula instantaneamente o Coeficiente de Variação (CV%), Falhas %, Duplos % e o Índice IGP.
          </p>
        </div>

        <div className="text-right font-mono text-xs text-stone-600 dark:text-stone-300">
          <span className="block font-bold">Amostragens Registradas: {(samplings || []).length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sampling Form */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Nova Amostragem de Linha de Semeadura
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-stone-600 dark:text-stone-300">Talhão Selecionado</label>
                <select
                  value={selectedFieldId}
                  onChange={e => setSelectedFieldId(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.fieldCode} - {f.crop} ({f.farmName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-600 dark:text-stone-300">Código do Ponto</label>
                <input
                  type="text"
                  required
                  value={pointCode}
                  onChange={e => setPointCode(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-stone-600 dark:text-stone-300">Avaliador / Agrônomo</label>
                <input
                  type="text"
                  required
                  value={evaluator}
                  onChange={e => setEvaluator(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-stone-600 dark:text-stone-300">Linha Avaliada nº</label>
                <input
                  type="number"
                  value={rowNumber}
                  onChange={e => setRowNumber(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-stone-600 dark:text-stone-300">Trecho Amostrado (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sampledLength}
                  onChange={e => setSampledLength(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-stone-600 dark:text-stone-300">Emergência (dias)</label>
                <input
                  type="number"
                  value={emergenceDays}
                  onChange={e => setEmergenceDays(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-stone-600 dark:text-stone-300">Plantas Danificadas</label>
                <input
                  type="number"
                  value={damagedPlants}
                  onChange={e => setDamagedPlants(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Quick Tap Buttons for Distances */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-stone-600 dark:text-stone-300 font-bold">
                  Distâncias entre Plantas Sucessivas (cm, separadas por vírgula):
                </label>
                <span className="text-[11px] text-emerald-600 font-mono font-bold">
                  {(parsedSpacings || []).length} sementes contadas
                </span>
              </div>

              {/* Quick Preset Distance Taps for Field Use */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[10px] text-stone-400 self-center font-extrabold mr-1">Taps Rápidos:</span>
                {[12.5, 12.0, 13.0, 14.0, 6.0, 25.0, 30.0].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addDistanceValue(val)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-100 dark:bg-zinc-800 dark:hover:bg-emerald-950 text-stone-800 dark:text-stone-200 text-[11px] font-mono font-bold rounded-lg border border-stone-200 dark:border-zinc-700"
                  >
                    +{val} cm
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                required
                value={spacingsInput}
                onChange={e => setSpacingsInput(e.target.value)}
                placeholder="Exemplo: 12.5, 12.0, 13.0, 25.0 (falha), 6.0 (duplo), 12.2"
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono text-xs"
              />
            </div>

            {/* Depths Input */}
            <div>
              <label className="text-stone-600 dark:text-stone-300 block mb-1">
                Profundidade das Sementes Medidas (cm, separadas por vírgula):
              </label>
              <input
                type="text"
                value={depthsInput}
                onChange={e => setDepthsInput(e.target.value)}
                placeholder="Exemplo: 4.0, 4.2, 3.9, 4.1"
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-stone-600 dark:text-stone-300">Observações de Amostragem</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Condições do solo, patinagem do trator ou observações de palhada..."
                className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
              />
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Amostragem de plantabilidade salva com sucesso no armazenamento local!
              </div>
            )}

            {(fields || []).length === 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Nenhum talhão cadastrado. Cadastre um talhão na aba "Talhões Semeados" para vincular esta amostragem.
              </div>
            )}

            <button
              type="submit"
              disabled={(parsedSpacings || []).length === 0}
              className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                (parsedSpacings || []).length === 0
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Save className="w-4 h-4" />
              Salvar Amostragem de Campo ({(parsedSpacings || []).length} sementes)
            </button>
          </form>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Resultado em Tempo Real
              </span>
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>

            <h3 className="text-lg font-black text-stone-900 dark:text-white">Índices Calculados da Amostra</h3>

            {/* Score Banner */}
            <div className={`p-4 rounded-2xl border ${liveMetrics.igpColorClass} text-center space-y-1`}>
              <span className="text-[10px] font-black uppercase tracking-wider block">Índice IGP GeaAgro</span>
              <span className="text-4xl font-black font-mono tracking-tight">{liveMetrics.igpScore}</span>
              <span className="text-xs font-bold block">{liveMetrics.igpClassification}</span>
            </div>

            <div className="space-y-2 text-xs font-mono bg-stone-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Espaçamento Alvo:</span>
                <span className="font-bold text-stone-900 dark:text-white">{liveMetrics.targetSpacingCm} cm</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-zinc-700 pt-1.5">
                <span className="text-stone-500">Espaçamento Média:</span>
                <span className="font-bold text-stone-900 dark:text-white">{liveMetrics.averageSpacingCm} cm</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-zinc-700 pt-1.5">
                <span className="text-stone-500">Coef. Variação (CV%):</span>
                <span className={`font-bold ${liveMetrics.cvPercent > 25 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {liveMetrics.cvPercent}%
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-zinc-700 pt-1.5">
                <span className="text-stone-500">Aceitáveis (%):</span>
                <span className="font-bold text-emerald-600">{liveMetrics.acceptablePercent}%</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-zinc-700 pt-1.5">
                <span className="text-stone-500">Falhas (%):</span>
                <span className="font-bold text-amber-600">{liveMetrics.skipsPercent}%</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-zinc-700 pt-1.5">
                <span className="text-stone-500">Duplos (%):</span>
                <span className="font-bold text-sky-600">{liveMetrics.doublesPercent}%</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-zinc-700 pt-1.5">
                <span className="text-stone-500">População Real:</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {liveMetrics.realPopulationPerHa.toLocaleString('pt-BR')} p/ha
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-zinc-700 pt-1.5">
                <span className="text-stone-500">Profundidade Média:</span>
                <span className="font-bold text-stone-900 dark:text-white">{liveMetrics.avgDepthCm} cm</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 italic text-center">
            *Cálculo automático efetuado instantaneamente via algoritmos locais.
          </p>
        </div>
      </div>
    </div>
  );
};
