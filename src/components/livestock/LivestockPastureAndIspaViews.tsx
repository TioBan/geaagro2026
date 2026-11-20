import React, { useMemo, useState } from 'react';
import { Paddock, PaddockRecord } from '../../types/livestock';
import { analyzeISPA } from '../../data/livestockData';
import { ArrowRight, Plus, ShieldAlert, Sprout, Trash2 } from 'lucide-react';

interface PastureViewProps {
  paddocks: Paddock[];
  selectedPaddockId: string;
  onSelectPaddock: (id: string) => void;
  onUpdatePaddock: (paddock: Paddock) => Promise<void>;
  onDeletePaddock: (id: string) => Promise<void>;
  onOpenAddPaddock: () => void;
}

const inputCls =
  'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

export const PastureTwinView: React.FC<PastureViewProps> = ({
  paddocks,
  selectedPaddockId,
  onSelectPaddock,
  onUpdatePaddock,
  onDeletePaddock,
  onOpenAddPaddock,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<PaddockRecord['event']>('Manejo');
  const [heightInput, setHeightInput] = useState<number>(28);
  const [biomassInput, setBiomassInput] = useState<number>(2800);
  const [notesInput, setNotesInput] = useState('');

  const currentPaddock = useMemo(
    () => paddocks.find((p) => p.id === selectedPaddockId) || paddocks[0] || null,
    [paddocks, selectedPaddockId]
  );

  const summary = useMemo(() => {
    const totalArea = paddocks.reduce((s, p) => s + (p.areaHa || 0), 0);
    const avgBiomass =
      paddocks.length > 0
        ? Math.round(paddocks.reduce((s, p) => s + (p.currentBiomassKgHa || 0), 0) / paddocks.length)
        : 0;
    const avgStocking =
      paddocks.length > 0
        ? paddocks.reduce((s, p) => s + (p.stockingRateAU || 0), 0) / paddocks.length
        : 0;
    return { totalArea, avgBiomass, avgStocking };
  }, [paddocks]);

  if (paddocks.length === 0 || !currentPaddock) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Nenhum piquete cadastrado
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Cadastre os piquetes e pastagens para monitorar altura de entrada/saída, biomassa de forragem e taxa de lotação.
        </p>
        <button
          type="button"
          onClick={onOpenAddPaddock}
          className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Cadastrar Primeiro Piquete
        </button>
      </div>
    );
  }

  const handleLogPaddockEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const rec: PaddockRecord = {
      id: `pr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      event: eventType,
      heightCm: Number(heightInput),
      biomassKgHa: Number(biomassInput),
      notes: notesInput.trim() || undefined,
    };

    await onUpdatePaddock({
      ...currentPaddock,
      currentHeightCm: Number(heightInput),
      currentBiomassKgHa: Number(biomassInput),
      history: [rec, ...(currentPaddock.history || [])],
    });
    setNotesInput('');
  };

  const heightBelowTarget = currentPaddock.currentHeightCm < currentPaddock.targetHeightCm * 0.85;

  return (
    <div className="space-y-4">
      {/* Global Paddocks KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Piquetes Ativos</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {paddocks.length}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Área Total de Pasto</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {summary.totalArea.toFixed(1)} ha
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Biomassa Média</span>
          <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1 tabular-nums">
            {summary.avgBiomass.toLocaleString('pt-BR')} kg/ha
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Lotação Média</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {summary.avgStocking.toFixed(2)} UA/ha
          </strong>
        </div>
      </div>

      {/* Selected Paddock Digital Twin */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Gêmeo Digital do Piquete · {currentPaddock.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentPaddock.forageSpecies} ({currentPaddock.cultivar}) · {currentPaddock.areaHa} ha
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <select
              value={currentPaddock.id}
              onChange={(e) => {
                const next = paddocks.find((p) => p.id === e.target.value);
                onSelectPaddock(e.target.value);
                if (next) {
                  setHeightInput(next.currentHeightCm);
                  setBiomassInput(next.currentBiomassKgHa);
                }
              }}
              className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {paddocks.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.areaHa} ha)
                </option>
              ))}
            </select>

            {confirmDeleteId === currentPaddock.id ? (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={async () => {
                    await onDeletePaddock(currentPaddock.id);
                    setConfirmDeleteId(null);
                  }}
                  className="h-8 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="h-8 px-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(currentPaddock.id)}
                title="Remover piquete"
                className="h-8 w-8 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Paddock Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs tabular-nums">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Altura do Pasto</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <strong className="text-lg font-bold text-slate-900 dark:text-white">
                {currentPaddock.currentHeightCm} cm
              </strong>
              <span className={`text-[11px] font-medium ${heightBelowTarget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                (Meta {currentPaddock.targetHeightCm} cm)
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Massa de Forragem</span>
            <strong className="text-lg font-bold text-slate-900 dark:text-white block mt-1">
              {currentPaddock.currentBiomassKgHa.toLocaleString('pt-BR')} kg MS/ha
            </strong>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Taxa de Lotação</span>
            <strong className="text-lg font-bold text-slate-900 dark:text-white block mt-1">
              {currentPaddock.stockingRateAU} UA/ha
            </strong>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md p-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Descanso / Ocupação</span>
            <strong className="text-lg font-bold text-slate-900 dark:text-white block mt-1">
              {currentPaddock.restDays}d / {currentPaddock.occupationDays}d
            </strong>
          </div>
        </div>

        {/* Log Paddock Measurement / Event */}
        <form
          onSubmit={handleLogPaddockEvent}
          className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end text-xs"
        >
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Evento</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as PaddockRecord['event'])}
              className={inputCls}
            >
              <option value="Manejo">Aferição / Manejo</option>
              <option value="Entrada">Entrada de Lote</option>
              <option value="Saída">Saída de Lote</option>
              <option value="Adubação">Adubação / Calagem</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Altura (cm)</label>
            <input
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(Number(e.target.value))}
              className={`${inputCls} tabular-nums`}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Biomassa (kg/ha)</label>
            <input
              type="number"
              step="100"
              value={biomassInput}
              onChange={(e) => setBiomassInput(Number(e.target.value))}
              className={`${inputCls} tabular-nums`}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Observação</label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Ex: Uréia 100 kg/ha..."
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Atualizar Piquete
          </button>
        </form>

        {(currentPaddock.history || []).length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Histórico de Manejo do Piquete
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {currentPaddock.history.map((h) => (
                <div key={h.id} className="py-2 flex flex-wrap items-center justify-between gap-2 tabular-nums">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{h.date} · </span>
                    <strong className="text-slate-900 dark:text-white">{h.event}</strong>
                    {h.notes && <span className="text-slate-500 dark:text-slate-400"> — {h.notes}</span>}
                  </div>
                  <span className="text-slate-600 dark:text-slate-300">
                    {h.heightCm !== undefined ? `${h.heightCm} cm` : ''}{' '}
                    {h.biomassKgHa !== undefined ? `· ${h.biomassKgHa.toLocaleString('pt-BR')} kg/ha` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================= */
/* SIMULADOR ISPA (SOLO - PLANTA - ANIMAL)                   */
/* ========================================================= */
export const IspaSimulatorView: React.FC = () => {
  const [soilP, setSoilP] = useState(8);
  const [pastureGrowth, setPastureGrowth] = useState(25);
  const [animalGmd, setAnimalGmd] = useState(0.4);

  const ispaResult = useMemo(
    () => analyzeISPA(soilP, pastureGrowth, animalGmd),
    [soilP, pastureGrowth, animalGmd]
  );

  const statusTone = (level: 'low' | 'mid' | 'high') =>
    level === 'low'
      ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
      : level === 'mid'
      ? 'border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
      : 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-5">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Sistema Integrado Solo-Planta-Animal (ISPA)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-3xl">
          Simule como a fertilidade do solo (Fósforo) condiciona a taxa de crescimento da forragem, o GMD do rebanho e o custo final por arroba produzida.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-4 text-xs tabular-nums">
          <div>
            <div className="flex justify-between mb-1">
              <label className="font-medium text-slate-600 dark:text-slate-300">Fósforo no Solo (P)</label>
              <strong className="text-slate-900 dark:text-white">{soilP} mg/dm³</strong>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={soilP}
              onChange={(e) => setSoilP(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-medium text-slate-600 dark:text-slate-300">Crescimento Pastagem</label>
              <strong className="text-slate-900 dark:text-white">{pastureGrowth} kg MS/ha/d</strong>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={pastureGrowth}
              onChange={(e) => setPastureGrowth(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-medium text-slate-600 dark:text-slate-300">Ganho Médio Diário (GMD)</label>
              <strong className="text-slate-900 dark:text-white">{animalGmd.toFixed(1)} kg/dia</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={animalGmd}
              onChange={(e) => setAnimalGmd(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Chain Output */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`border rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/40 ${statusTone(
                ispaResult.soilStatus === 'Baixo' ? 'low' : ispaResult.soilStatus === 'Médio' ? 'mid' : 'high'
              )}`}
            >
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">01. Solo</span>
              <strong className="text-sm font-semibold block mt-0.5">Fósforo: {ispaResult.soilStatus}</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">{soilP} mg/dm³</span>
            </div>

            <div
              className={`border rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/40 ${statusTone(
                ispaResult.pastureStatus === 'Degradada'
                  ? 'low'
                  : ispaResult.pastureStatus === 'Recuperação'
                  ? 'mid'
                  : 'high'
              )}`}
            >
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">02. Pastagem</span>
              <strong className="text-sm font-semibold block mt-0.5">{ispaResult.pastureStatus}</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {pastureGrowth} kg MS/ha/dia
              </span>
            </div>

            <div
              className={`border rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-800/40 ${statusTone(
                ispaResult.animalStatus === 'Abaixo' ? 'low' : ispaResult.animalStatus === 'Meta' ? 'mid' : 'high'
              )}`}
            >
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">03. Desempenho Animal</span>
              <strong className="text-sm font-semibold block mt-0.5">GMD: {ispaResult.animalStatus}</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {animalGmd.toFixed(1)} kg/dia
              </span>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Custo Estimado por Arroba Produzida
              </span>
              <div className="flex items-center gap-2 mt-0.5 tabular-nums">
                <strong
                  className={`text-2xl font-bold ${
                    ispaResult.profitabilityImpact === 'Negativo'
                      ? 'text-rose-700 dark:text-rose-400'
                      : ispaResult.profitabilityImpact === 'Positivo'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  R$ {ispaResult.costPerArroba.toFixed(2)} / @
                </strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  · Impacto {ispaResult.profitabilityImpact}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Solo</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Forragem</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Arroba</span>
            </div>
          </div>

          {ispaResult.profitabilityImpact === 'Negativo' && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>Alerta ISPA:</strong> A baixa fertilidade de fósforo restringe a oferta de matéria seca e eleva o custo da arroba para R$ {ispaResult.costPerArroba.toFixed(2)}. Recomenda-se correção de solo e adubação fosfatada de manutenção.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
