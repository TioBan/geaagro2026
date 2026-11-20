import React, { useMemo, useState } from 'react';
import { Calculator, Check, Droplets, Pencil, Plus, Trash2 } from 'lucide-react';
import { NutrientSolutionReservoir } from '../../types/hydroponics';
import { hydroponicRecipesCatalog } from '../../data/hydroponicsData';
import {
  calculateHydroponicFertilizers,
  HYDRO_INPUT_CLASS,
  HYDRO_LABEL_CLASS,
  PUMP_STATUS_META,
  SimulatorPhase,
} from './hydroponicsUi';

interface HydroponicsNutrientViewProps {
  mode: 'solucao_nutritiva' | 'simulador_receitas';
  reservoirs: NutrientSolutionReservoir[];
  selectedReservoirId: string;
  onSelectReservoir: (id: string) => void;
  onOpenNewReservoir: () => void;
  onEditReservoir: (res: NutrientSolutionReservoir) => void;
  onDeleteReservoir: (id: string) => void;
  onLogReservoirAction: (
    reservoir: NutrientSolutionReservoir,
    actionType: 'ph' | 'fertilizer' | 'full_change'
  ) => void;
  onApplyRecipeToReservoir: (payload: {
    recipeName: string;
    volumeLiters: number;
    targetPHMin: number;
    targetPHMax: number;
    targetECMin: number;
    targetECMax: number;
    summaryText: string;
  }) => void;
}

export const HydroponicsNutrientView: React.FC<HydroponicsNutrientViewProps> = ({
  mode,
  reservoirs,
  selectedReservoirId,
  onSelectReservoir,
  onOpenNewReservoir,
  onEditReservoir,
  onDeleteReservoir,
  onLogReservoirAction,
  onApplyRecipeToReservoir,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Simulator State
  const [simulatorCropId, setSimulatorCropId] = useState<string>(
    hydroponicRecipesCatalog[0]?.id || 'rec-alface'
  );
  const [simulatorVolumeLiters, setSimulatorVolumeLiters] = useState<number>(1000);
  const [simulatorPhase, setSimulatorPhase] = useState<SimulatorPhase>('desenvolvimento_engorda');

  const activeReservoir =
    reservoirs.find((r) => r.id === selectedReservoirId) || reservoirs[0] || null;

  const selectedRecipe = useMemo(
    () => hydroponicRecipesCatalog.find((r) => r.id === simulatorCropId) || hydroponicRecipesCatalog[0],
    [simulatorCropId]
  );

  const calculated = useMemo(
    () => calculateHydroponicFertilizers(selectedRecipe, simulatorVolumeLiters, simulatorPhase),
    [selectedRecipe, simulatorVolumeLiters, simulatorPhase]
  );

  if (mode === 'solucao_nutritiva') {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Reservatórios &amp; Solução Nutritiva
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Gerencie tanques, faixas alvo de pH/CE e registre correções sincronizadas com o Caderno de Campo.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewReservoir}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Reservatório
            </button>
          </div>

          {reservoirs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-8 text-center space-y-2.5">
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Nenhum reservatório cadastrado
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Cadastre seus tanques de solução nutritiva para monitorar volume, pH, CE, temperatura e oxigênio dissolvido.
              </p>
              <button
                type="button"
                onClick={onOpenNewReservoir}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Primeiro Reservatório
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 tabular-nums">
              {reservoirs.map((res) => {
                const selected = activeReservoir?.id === res.id;
                const pumpMeta = PUMP_STATUS_META[res.pumpStatus];
                return (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservoir(res.id)}
                    className={`rounded-xl border p-3.5 transition-colors cursor-pointer space-y-3 ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {res.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {res.currentVolumeLiters.toLocaleString('pt-BR')} /{' '}
                          {res.capacityLiters.toLocaleString('pt-BR')} L ·{' '}
                          <span className={pumpMeta.textClass}>{pumpMeta.label}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onEditReservoir(res)}
                          title="Editar leituras do reservatório"
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/70 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === res.id ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteReservoir(res.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-medium cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(res.id)}
                            title="Remover reservatório"
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH Atual</span>
                        <strong className="text-base font-bold text-slate-900 dark:text-zinc-100">
                          {res.currentPH.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                          Alvo {res.targetPHMin}–{res.targetPHMax}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CE (mS/cm)</span>
                        <strong className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                          {res.currentEC.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                          Alvo {res.targetECMin}–{res.targetECMax}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                      <span>Temp: {res.solutionTempC.toFixed(1)} °C</span>
                      <span>O₂: {res.dissolvedOxygenPpm.toFixed(1)} mg/L</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Reservoir Actions */}
        {activeReservoir && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Prontuário Químico — {activeReservoir.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Última reposição: {activeReservoir.lastWaterRefillDate} · Último ajuste:{' '}
                  {activeReservoir.lastNutrientAdjustmentDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEditReservoir(activeReservoir)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 self-start sm:self-auto cursor-pointer"
              >
                Atualizar Leituras
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3.5 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                    1. Correção de pH
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Redução com ácido fosfórico 85% (25 ml / 1.000 L) ou elevação controlada com KOH. Registra e sincroniza no Caderno de Campo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onLogReservoirAction(activeReservoir, 'ph')}
                  className="h-8 w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  Registrar Correção de pH
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3.5 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                    2. Reposição de Sais (CE)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Injeção proporcional de Solução Estoque A (Ca + Fe) e B (K, P, Mg, Micros) conforme condutividade alvo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onLogReservoirAction(activeReservoir, 'fertilizer')}
                  className="h-8 w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  Registrar Adição de Adubo
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3.5 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">
                    3. Troca Total &amp; Higienização
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Renovação completa da solução acumulada (a cada 10–14 dias) e sanitização com H₂O₂.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onLogReservoirAction(activeReservoir, 'full_change')}
                  className="h-8 w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  Registrar Troca Total
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* MODE: SIMULADOR DE RECEITAS */
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Simulador de Solução Nutritiva (Tanques A &amp; B)
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Calcule a pesagem exata de sais solúveis para o volume e fase fenológica selecionados.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={HYDRO_LABEL_CLASS}>Cultura Hidropônica</label>
          <select
            value={simulatorCropId}
            onChange={(e) => setSimulatorCropId(e.target.value)}
            className={HYDRO_INPUT_CLASS}
          >
            {hydroponicRecipesCatalog.map((r) => (
              <option key={r.id} value={r.id}>
                {r.cropName} ({r.scientificName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={HYDRO_LABEL_CLASS}>Volume do Reservatório (L)</label>
          <input
            type="number"
            step="50"
            min="50"
            max="50000"
            value={simulatorVolumeLiters}
            onChange={(e) => setSimulatorVolumeLiters(Math.max(50, Number(e.target.value) || 50))}
            className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
          />
        </div>

        <div>
          <label className={HYDRO_LABEL_CLASS}>Fase de Cultivo</label>
          <select
            value={simulatorPhase}
            onChange={(e) => setSimulatorPhase(e.target.value as SimulatorPhase)}
            className={HYDRO_INPUT_CLASS}
          >
            <option value="bercario">Berçário / Maternidade (50% da dose)</option>
            <option value="desenvolvimento_engorda">Desenvolvimento / Engorda (100%)</option>
            <option value="frutificacao">
              Frutificação ({selectedRecipe.stage === 'frutificacao' ? '100% nativo' : '115% reforço'})
            </option>
          </select>
        </div>
      </div>

      {/* Target Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH Alvo</span>
          <strong className="text-xs text-slate-900 dark:text-zinc-100">
            {selectedRecipe.targetPH.ideal} ({selectedRecipe.targetPH.min}–{selectedRecipe.targetPH.max})
          </strong>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CE Alvo (Ajustada)</span>
          <strong className="text-xs text-emerald-700 dark:text-emerald-400">
            {(selectedRecipe.targetEC.ideal * calculated.phaseMultiplier).toFixed(2)} mS/cm
          </strong>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Temp. Ideal</span>
          <strong className="text-xs text-slate-900 dark:text-zinc-100">
            {selectedRecipe.idealSolutionTempC.min}–{selectedRecipe.idealSolutionTempC.max} °C
          </strong>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 px-3 py-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Renovação</span>
          <strong className="text-xs text-slate-900 dark:text-zinc-100">
            A cada {selectedRecipe.replacementFrequencyDays} dias
          </strong>
        </div>
      </div>

      {/* Tank A & Tank B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tabular-nums">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Tanque A · Cálcio &amp; Ferro
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              {calculated.tankATotal.toLocaleString('pt-BR')} g
            </span>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-zinc-800 text-xs">
            <div className="py-2 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  Nitrato de Cálcio
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">15,5% N · 19% Ca</span>
              </div>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {calculated.tankA.calciumNitrate} g
              </strong>
            </div>
            <div className="py-2 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  Quelato de Ferro (Fe-EDDHA / DTPA)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">6% Fe quelatizado</span>
              </div>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {calculated.tankA.ironChelateEDDHA} g
              </strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Dissolva sempre em tanque separado antes de diluir no reservatório principal.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Tanque B · N-P-K, Mg, S &amp; Micros
            </span>
            <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
              {calculated.tankBTotal.toLocaleString('pt-BR')} g
            </span>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-zinc-800 text-xs">
            <div className="py-2 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  Nitrato de Potássio (KNO₃)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">13% N · 44% K₂O</span>
              </div>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {calculated.tankB.potassiumNitrate} g
              </strong>
            </div>
            <div className="py-2 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  Fosfato Monopotássico (MKP)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">52% P₂O₅ · 34% K₂O</span>
              </div>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {calculated.tankB.monopotassiumPhosphate} g
              </strong>
            </div>
            <div className="py-2 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  Sulfato de Magnésio
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">9% Mg · 12% S</span>
              </div>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {calculated.tankB.magnesiumSulfate} g
              </strong>
            </div>
            <div className="py-2 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                  Mix de Micronutrientes
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  B, Zn, Mn, Cu, Mo quelatizados
                </span>
              </div>
              <strong className="font-mono text-slate-900 dark:text-zinc-100">
                {calculated.tankB.micronutrients} g
              </strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Nunca misture concentrados do Tanque A e B diretamente para evitar precipitação de CaSO₄/Ca₃(PO₄)₂.
          </p>
        </div>
      </div>

      {/* Macro / Micro Profile & Technical Note */}
      <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3 space-y-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-300 tabular-nums">
          <span className="font-semibold text-slate-800 dark:text-zinc-100">Balanço (ppm):</span>
          <span>N-NO₃ {selectedRecipe.macroPpm.N_NO3}</span>
          <span>·</span>
          <span>N-NH₄ {selectedRecipe.macroPpm.N_NH4}</span>
          <span>·</span>
          <span>P {selectedRecipe.macroPpm.P}</span>
          <span>·</span>
          <span>K {selectedRecipe.macroPpm.K}</span>
          <span>·</span>
          <span>Ca {selectedRecipe.macroPpm.Ca}</span>
          <span>·</span>
          <span>Mg {selectedRecipe.macroPpm.Mg}</span>
          <span>·</span>
          <span>S {selectedRecipe.macroPpm.S}</span>
          <span>·</span>
          <span>Fe {selectedRecipe.microPpm.Fe}</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
          {selectedRecipe.technicalNotes}
        </p>
      </div>

      {/* Footer Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800 tabular-nums">
        <span className="text-xs text-slate-600 dark:text-zinc-400">
          Peso total de fertilizantes:{' '}
          <strong className="text-slate-900 dark:text-zinc-100">
            {(calculated.totalGrams / 1000).toFixed(2)} kg
          </strong>{' '}
          ({calculated.totalGrams.toLocaleString('pt-BR')} g)
        </span>
        <button
          type="button"
          onClick={() =>
            onApplyRecipeToReservoir({
              recipeName: selectedRecipe.cropName,
              volumeLiters: simulatorVolumeLiters,
              targetPHMin: selectedRecipe.targetPH.min,
              targetPHMax: selectedRecipe.targetPH.max,
              targetECMin: Number((selectedRecipe.targetEC.min * calculated.phaseMultiplier).toFixed(2)),
              targetECMax: Number((selectedRecipe.targetEC.max * calculated.phaseMultiplier).toFixed(2)),
              summaryText: `Tanque A: Ca(NO3)2 ${calculated.tankA.calciumNitrate}g, Fe ${calculated.tankA.ironChelateEDDHA}g | Tanque B: KNO3 ${calculated.tankB.potassiumNitrate}g, MKP ${calculated.tankB.monopotassiumPhosphate}g, MgSO4 ${calculated.tankB.magnesiumSulfate}g, Micros ${calculated.tankB.micronutrients}g`,
            })
          }
          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          Aplicar ao Reservatório &amp; Registrar
        </button>
      </div>
    </div>
  );
};
