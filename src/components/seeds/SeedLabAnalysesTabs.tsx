import React, { useMemo, useState } from 'react';
import {
  Sprout,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Calculator,
} from 'lucide-react';
import {
  SeedLot,
  ProfileThresholds,
  GerminationRepetition,
  MoistureAnalysis,
} from '../../types/seedAnalysis';
import {
  SEED_SPECIES_RAS_CATALOG,
  computeGerminationStats,
} from '../../data/seedAnalysisData';

interface SeedLabAnalysesTabsProps {
  mode: 'qualidade_fisica' | 'germinacao' | 'vigor' | 'umidade';
  currentLot: SeedLot | null;
  thresholds: ProfileThresholds;
  onUpdateLot: (updated: SeedLot, message?: string) => void;
  onOpenNewLotModal: () => void;
}

const INPUT_CLASS =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
const LABEL_CLASS = 'block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1';

export const SeedLabAnalysesTabs: React.FC<SeedLabAnalysesTabsProps> = ({
  mode,
  currentLot,
  thresholds,
  onUpdateLot,
  onOpenNewLotModal,
}) => {
  const [targetPopPlantsHa, setTargetPopPlantsHa] = useState<number>(300000);
  const [rowSpacingM, setRowSpacingM] = useState<number>(0.45);

  const speciesRAS = useMemo(() => {
    if (!currentLot) return SEED_SPECIES_RAS_CATALOG[0];
    return (
      SEED_SPECIES_RAS_CATALOG.find((s) => s.id === currentLot.speciesId) ||
      SEED_SPECIES_RAS_CATALOG[0]
    );
  }, [currentLot]);

  if (!currentLot) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center">
        <Sprout className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 opacity-80" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Selecione ou cadastre um lote para registrar análises
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
          As medições de Pureza Física, Germinação (TPG), Vigor (Tetrazólio) e Umidade atualizam automaticamente o IQS do lote.
        </p>
        <button
          type="button"
          onClick={onOpenNewLotModal}
          className="mt-4 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar lote</span>
        </button>
      </div>
    );
  }

  // --- QUALIDADE FÍSICA & PUREZA ---
  if (mode === 'qualidade_fisica') {
    const pq = currentLot.physicalQuality;
    const updatePhysical = <K extends keyof typeof pq>(key: K, value: number) => {
      onUpdateLot({
        ...currentLot,
        physicalQuality: {
          ...pq,
          [key]: Math.max(0, value),
        },
      });
    };

    const valorCulturalPct = Math.round(((pq.purityPct * currentLot.germination.finalGerminationPct) / 100) * 10) / 10;
    const vcDecimal = Math.max(0.01, valorCulturalPct / 100);
    const seedsHaAdjusted = Math.round(targetPopPlantsHa / vcDecimal);
    const linearMetersHa = rowSpacingM > 0 ? 10000 / rowSpacingM : 22222;
    const seedsPerMeter = Math.round((seedsHaAdjusted / linearMetersHa) * 10) / 10;
    const seedRateKgHa = Math.round(((seedsHaAdjusted * (pq.pmsG || speciesRAS.defaultPmsG)) / 1000000) * 10) / 10;

    const purityOk = pq.purityPct >= thresholds.minPurity;
    const damageOk = pq.mechanicalDamageHypochloritePct <= thresholds.maxMechanicalDamage;

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Análise de Pureza Física e Integridade
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Padrão RAS ({speciesRAS.commonName}): Pureza &ge; {speciesRAS.minPurityOfficialPct}% · Dano mecânico &le; {thresholds.maxMechanicalDamage}%
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs tabular-nums">
              <span className={`inline-flex items-center gap-1 font-medium ${purityOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {purityOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                Pureza {purityOk ? 'conforme' : 'abaixo'}
              </span>
              <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">|</span>
              <span className={`inline-flex items-center gap-1 font-medium ${damageOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {damageOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                Hipoclorito {damageOk ? 'ok' : 'elevado'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className={LABEL_CLASS}>Sementes Puras (%)</label>
              <input
                type="number"
                step="0.1"
                max="100"
                value={pq.purityPct}
                onChange={(e) => updatePhysical('purityPct', Math.min(100, parseFloat(e.target.value) || 0))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Material Inerte (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.inertMaterialPct}
                onChange={(e) => updatePhysical('inertMaterialPct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Outras Sementes (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.otherSeedsPct}
                onChange={(e) => updatePhysical('otherSeedsPct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Dano Mecânico — Hipoclorito (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.mechanicalDamageHypochloritePct}
                onChange={(e) => updatePhysical('mechanicalDamageHypochloritePct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Dano por Percevejo (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.stinkbugDamagePct}
                onChange={(e) => updatePhysical('stinkbugDamagePct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Dano por Umidade / Intemperismo (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.weatheringDamagePct}
                onChange={(e) => updatePhysical('weatheringDamagePct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Sementes Quebradas (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.brokenSeedsPct}
                onChange={(e) => updatePhysical('brokenSeedsPct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Sementes Trincadas (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.crackedSeedsPct}
                onChange={(e) => updatePhysical('crackedSeedsPct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Sementes Chochas / Enrugadas (%)</label>
              <input
                type="number"
                step="0.1"
                value={pq.shriveledSeedsPct}
                onChange={(e) => updatePhysical('shriveledSeedsPct', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>PMS — Peso de Mil Sementes (g)</label>
              <input
                type="number"
                step="1"
                value={pq.pmsG}
                onChange={(e) => updatePhysical('pmsG', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Peso Hectolitro (kg/hL)</label>
              <input
                type="number"
                step="0.5"
                value={pq.hectoliterWeightKgHl}
                onChange={(e) => updatePhysical('hectoliterWeightKgHl', parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Uniformidade de Peneira (%)</label>
              <input
                type="number"
                step="0.5"
                max="100"
                value={pq.screenUniformityPct}
                onChange={(e) => updatePhysical('screenUniformityPct', Math.min(100, parseFloat(e.target.value) || 0))}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        {/* Valor Cultural & Taxa de Semeadura */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Valor Cultural (VC%) e Taxa de Semeadura Ajustada
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className={LABEL_CLASS}>População Alvo (plantas/ha)</label>
              <input
                type="number"
                step="10000"
                min="10000"
                value={targetPopPlantsHa}
                onChange={(e) => setTargetPopPlantsHa(Math.max(1000, Number(e.target.value) || 0))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Espaçamento Entrelinhas (m)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={rowSpacingM}
                onChange={(e) => setRowSpacingM(Math.max(0.1, Number(e.target.value) || 0.45))}
                className={INPUT_CLASS}
              />
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4 tabular-nums">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Valor Cultural (VC)</span>
              <strong className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {valorCulturalPct}%
              </strong>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4 tabular-nums">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Regulagem Semeadora</span>
              <strong className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
                {seedsPerMeter} sem/m
              </strong>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4 tabular-nums">
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">Consumo Estimado</span>
              <strong className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                {seedRateKgHa} kg/ha
              </strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GERMINAÇÃO & TPG ---
  if (mode === 'germinacao') {
    const germ = currentLot.germination;
    const stats = computeGerminationStats(germ.repetitions);
    const isCompliant = germ.finalGerminationPct >= thresholds.minGermination;

    const handleRepChange = (
      repIndex: number,
      field: keyof GerminationRepetition,
      value: number
    ) => {
      const nextReps = germ.repetitions.map((rep, idx) =>
        idx === repIndex ? { ...rep, [field]: Math.max(0, Math.round(value)) } : rep
      );
      const nextStats = computeGerminationStats(nextReps);
      onUpdateLot({
        ...currentLot,
        germination: {
          ...germ,
          repetitions: nextReps,
          finalGerminationPct: nextStats.normalAvg,
          normalSeedlingsAvgPct: nextStats.normalAvg,
          abnormalSeedlingsAvgPct: nextStats.abnormalAvg,
          deadSeedsAvgPct: nextStats.deadAvg,
          hardSeedsAvgPct: nextStats.hardAvg,
          dormantSeedsAvgPct: nextStats.dormantAvg,
          standardDeviation: nextStats.stdDev,
        },
      });
    };

    const updateGermField = <K extends keyof typeof germ>(key: K, value: (typeof germ)[K]) => {
      onUpdateLot({
        ...currentLot,
        germination: { ...germ, [key]: value },
      });
    };

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Teste Padrão de Germinação (TPG — RAS/MAPA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {speciesRAS.commonName}: 1ª contagem {speciesRAS.firstCountDays} dias · Contagem final {speciesRAS.finalCountDays} dias · Padrão oficial &ge; {speciesRAS.minGerminationOfficialPct}%
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${
                isCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isCompliant ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              Germinação Final: {germ.finalGerminationPct}% ({isCompliant ? 'Aprovado' : 'Abaixo da meta'})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className={LABEL_CLASS}>Data Instalação</label>
              <input
                type="date"
                value={germ.installationDate}
                onChange={(e) => updateGermField('installationDate', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Data 1ª Contagem</label>
              <input
                type="date"
                value={germ.firstCountDate}
                onChange={(e) => updateGermField('firstCountDate', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Data Contagem Final</label>
              <input
                type="date"
                value={germ.finalCountDate}
                onChange={(e) => updateGermField('finalCountDate', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>1ª Contagem — Vigor (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={germ.firstCountPct}
                onChange={(e) => updateGermField('firstCountPct', Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Temperatura (°C)</label>
              <input
                type="number"
                step="0.5"
                value={germ.temperatureC}
                onChange={(e) => updateGermField('temperatureC', Number(e.target.value) || 25)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Tabela de Repetições */}
          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                  <th className="py-2.5 px-3 font-medium">Repetição</th>
                  <th className="py-2.5 px-3 font-medium">Nº Sementes</th>
                  <th className="py-2.5 px-3 font-medium">Plântulas Normais</th>
                  <th className="py-2.5 px-3 font-medium">Anormais</th>
                  <th className="py-2.5 px-3 font-medium">Mortas</th>
                  <th className="py-2.5 px-3 font-medium">Duras</th>
                  <th className="py-2.5 px-3 font-medium">Dormentes</th>
                  <th className="py-2.5 px-3 font-medium text-right">Germ. (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {germ.repetitions.map((rep, idx) => {
                  const pct = rep.seedCount > 0 ? Math.round((rep.normalSeedlings / rep.seedCount) * 1000) / 10 : 0;
                  return (
                    <tr key={rep.repNumber}>
                      <td className="py-2 px-3 font-medium text-slate-700 dark:text-zinc-300">
                        Rep. {rep.repNumber}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={rep.seedCount}
                          onChange={(e) => handleRepChange(idx, 'seedCount', Number(e.target.value))}
                          className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={rep.normalSeedlings}
                          onChange={(e) => handleRepChange(idx, 'normalSeedlings', Number(e.target.value))}
                          className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs font-medium text-emerald-700 dark:text-emerald-400"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={rep.abnormalSeedlings}
                          onChange={(e) => handleRepChange(idx, 'abnormalSeedlings', Number(e.target.value))}
                          className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={rep.deadSeeds}
                          onChange={(e) => handleRepChange(idx, 'deadSeeds', Number(e.target.value))}
                          className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={rep.hardSeeds}
                          onChange={(e) => handleRepChange(idx, 'hardSeeds', Number(e.target.value))}
                          className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={rep.dormantSeeds}
                          onChange={(e) => handleRepChange(idx, 'dormantSeeds', Number(e.target.value))}
                          className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-zinc-100">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 font-semibold text-slate-900 dark:text-zinc-100">
                  <td className="py-2.5 px-3" colSpan={2}>
                    Média das Repetições
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">{stats.normalAvg}%</td>
                  <td className="py-2.5 px-3">{stats.abnormalAvg}%</td>
                  <td className="py-2.5 px-3">{stats.deadAvg}%</td>
                  <td className="py-2.5 px-3">{stats.hardAvg}%</td>
                  <td className="py-2.5 px-3">{stats.dormantAvg}%</td>
                  <td className="py-2.5 px-3 text-right">DP ±{stats.stdDev}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- TETRAZÓLIO & VIGOR ---
  if (mode === 'vigor') {
    const v = currentLot.vigor;
    const updateVigor = <K extends keyof typeof v>(key: K, value: number) => {
      onUpdateLot({
        ...currentLot,
        vigor: { ...v, [key]: Math.max(0, value) },
      });
    };

    const vigorClass =
      v.tetrazoliumVigorPct >= 85
        ? { label: 'Vigor Muito Alto (Classes 1–3)', ok: true }
        : v.tetrazoliumVigorPct >= 75
          ? { label: 'Vigor Alto / Satisfatório', ok: true }
          : v.tetrazoliumVigorPct >= 60
            ? { label: 'Vigor Médio — Semear em condições ideais', ok: false }
            : { label: 'Vigor Baixo — Alto risco de falha de estande', ok: false };

    const ecInterpretation =
      v.electricalConductivityUscmG <= 70
        ? 'Alto vigor (membranas íntegras)'
        : v.electricalConductivityUscmG <= 90
          ? 'Vigor intermediário'
          : 'Vigor baixo (alta lixiviação)';

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Tetrazólio (TZ) e Testes Complementares de Vigor
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Diagnóstico de viabilidade, vigor fisiológico, causas de perda e desempenho potencial em campo.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                vigorClass.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {vigorClass.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {vigorClass.label}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-3">
              Teste de Tetrazólio (TZ 1–8)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className={LABEL_CLASS}>Viabilidade TZ 1–5 (%)</label>
                <input
                  type="number"
                  step="0.5"
                  max="100"
                  value={v.tetrazoliumViabilityPct}
                  onChange={(e) => updateVigor('tetrazoliumViabilityPct', Math.min(100, parseFloat(e.target.value) || 0))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Vigor TZ 1–3 (%)</label>
                <input
                  type="number"
                  step="0.5"
                  max="100"
                  value={v.tetrazoliumVigorPct}
                  onChange={(e) => updateVigor('tetrazoliumVigorPct', Math.min(100, parseFloat(e.target.value) || 0))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Dano Mecânico TZ (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={v.tetrazoliumMechanicalDamagePct}
                  onChange={(e) => updateVigor('tetrazoliumMechanicalDamagePct', parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Dano Percevejo TZ (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={v.tetrazoliumStinkbugDamagePct}
                  onChange={(e) => updateVigor('tetrazoliumStinkbugDamagePct', parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Dano Umidade TZ (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={v.tetrazoliumWeatherDamagePct}
                  onChange={(e) => updateVigor('tetrazoliumWeatherDamagePct', parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-3">
              Estresse Fisiológico, Emergência e Crescimento de Plântulas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className={LABEL_CLASS}>Envelhecimento Acelerado (%)</label>
                <input
                  type="number"
                  step="0.5"
                  max="100"
                  value={v.acceleratedAgingPct}
                  onChange={(e) => updateVigor('acceleratedAgingPct', Math.min(100, parseFloat(e.target.value) || 0))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Condutividade Elétrica (µS/cm/g)</label>
                <input
                  type="number"
                  step="1"
                  value={v.electricalConductivityUscmG}
                  onChange={(e) => updateVigor('electricalConductivityUscmG', parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                  {ecInterpretation}
                </span>
              </div>
              <div>
                <label className={LABEL_CLASS}>Teste de Frio (%)</label>
                <input
                  type="number"
                  step="0.5"
                  max="100"
                  value={v.coldTestPct}
                  onChange={(e) => updateVigor('coldTestPct', Math.min(100, parseFloat(e.target.value) || 0))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Emergência em Areia (%)</label>
                <input
                  type="number"
                  step="0.5"
                  max="100"
                  value={v.sandEmergencePct}
                  onChange={(e) => updateVigor('sandEmergencePct', Math.min(100, parseFloat(e.target.value) || 0))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Emergência em Campo (%)</label>
                <input
                  type="number"
                  step="0.5"
                  max="100"
                  value={v.fieldEmergencePct}
                  onChange={(e) => updateVigor('fieldEmergencePct', Math.min(100, parseFloat(e.target.value) || 0))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Índice Veloc. Germinação (IVG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={v.ivgIndex}
                  onChange={(e) => updateVigor('ivgIndex', parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Comprimento Raiz / Parte Aérea (cm)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    title="Raiz (cm)"
                    value={v.rootLengthCm}
                    onChange={(e) => updateVigor('rootLengthCm', parseFloat(e.target.value) || 0)}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="number"
                    step="0.1"
                    title="Parte aérea (cm)"
                    value={v.shootLengthCm}
                    onChange={(e) => updateVigor('shootLengthCm', parseFloat(e.target.value) || 0)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Massa Seca Plântula (mg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={v.seedlingDryMassMg}
                  onChange={(e) => updateVigor('seedlingDryMassMg', parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UMIDADE ---
  const m = currentLot.moisture;
  const moistureOk = m.moisturePct <= thresholds.moistureLimit;

  const updateMoistureWeights = (initialG: number, finalG: number) => {
    const safeInitial = Math.max(0.001, initialG);
    const safeFinal = Math.min(safeInitial, Math.max(0, finalG));
    const computedPct = Math.round(((safeInitial - safeFinal) / safeInitial) * 1000) / 10;
    onUpdateLot({
      ...currentLot,
      moisture: {
        ...m,
        initialWeightG: initialG,
        finalWeightG: finalG,
        moisturePct: computedPct,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Determinação do Grau de Umidade
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Cálculo gravimétrico em estufa ou leitura capacitiva · Limite do perfil: &le; {thresholds.moistureLimit}% (RAS {speciesRAS.commonName}: &le; {speciesRAS.maxMoistureOfficialPct}%)
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${
            moistureOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {moistureOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          Umidade: {m.moisturePct}% ({moistureOk ? 'Segura' : 'Acima do limite'})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={LABEL_CLASS}>Método Analítico</label>
          <select
            value={m.method}
            onChange={(e) =>
              onUpdateLot({
                ...currentLot,
                moisture: { ...m, method: e.target.value as MoistureAnalysis['method'] },
              })
            }
            className={INPUT_CLASS}
          >
            <option value="Estufa 105°C (24h)">Estufa 105°C (24h)</option>
            <option value="Estufa 130°C (1h)">Estufa 130°C (1h)</option>
            <option value="Medidor Capacitivo Rápido">Medidor Capacitivo Rápido</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Data da Determinação</label>
          <input
            type="date"
            value={m.date}
            onChange={(e) => onUpdateLot({ ...currentLot, moisture: { ...m, date: e.target.value } })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Temperatura da Amostra (°C)</label>
          <input
            type="number"
            step="0.5"
            value={m.temperatureC}
            onChange={(e) =>
              onUpdateLot({
                ...currentLot,
                moisture: { ...m, temperatureC: parseFloat(e.target.value) || 25 },
              })
            }
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Peso Inicial Úmido — P1 (g)</label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={m.initialWeightG}
            onChange={(e) => updateMoistureWeights(parseFloat(e.target.value) || 0, m.finalWeightG)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Peso Final Seco — P2 (g)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={m.finalWeightG}
            onChange={(e) => updateMoistureWeights(m.initialWeightG, parseFloat(e.target.value) || 0)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Umidade Direta (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="40"
            value={m.moisturePct}
            onChange={(e) =>
              onUpdateLot({
                ...currentLot,
                moisture: { ...m, moisturePct: Math.max(0, Math.min(40, parseFloat(e.target.value) || 0)) },
              })
            }
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
        Fórmula gravimétrica RAS: <span className="font-mono text-slate-700 dark:text-zinc-300">U% = ((P1 − P2) / P1) × 100</span>. A cada 1% de redução na umidade da semente (entre 5% e 14%), o potencial de conservação em armazenamento dobra (Regra de Harrington).
      </div>
    </div>
  );
};
