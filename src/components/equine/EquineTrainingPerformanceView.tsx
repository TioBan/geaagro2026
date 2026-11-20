import React, { useState, useMemo } from 'react';
import { Trophy, Activity, Heart, Plus, X } from 'lucide-react';
import {
  EquineAnimal,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineDiscipline,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  trainingRecords: EquineTrainingRecord[];
  competitionRecords: EquineCompetitionRecord[];
  onAddTraining: (record: EquineTrainingRecord) => void;
  onAddCompetition: (record: EquineCompetitionRecord) => void;
}

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineTrainingPerformanceView: React.FC<Props> = ({
  animals,
  trainingRecords,
  competitionRecords,
  onAddTraining,
  onAddCompetition,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeTrainings = useMemo(() => (trainingRecords || []).filter(t => t && t.id), [trainingRecords]);
  const safeCompetitions = useMemo(() => (competitionRecords || []).filter(c => c && c.id), [competitionRecords]);

  const [activeTab, setActiveTab] = useState<'trainings' | 'competitions'>('trainings');
  const [selectedAnimalId, setSelectedAnimalFilter] = useState<string>('all');
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);

  const [trainForm, setTrainForm] = useState({
    animalId: safeAnimals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    discipline: 'Três Tambores (Barrel Racing)' as EquineDiscipline | string,
    durationMinutes: 45,
    distanceKm: 4.2,
    effortLevel: 'Moderado' as EquineTrainingRecord['effortLevel'],
    riderName: '',
    peakHr: 182,
    rec5MinHr: 64,
    rec10MinHr: 46,
    performanceScore: 9,
    notes: '',
  });

  const [compForm, setCompForm] = useState({
    animalId: safeAnimals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    eventName: '',
    city: '',
    state: 'SP',
    category: 'Aberta Senior',
    placement: '1º Lugar / Campeão',
    resultTime: '',
    prizeMoneyBrl: 0,
    trophyOrRibbon: '',
    riderOrHandler: '',
    observations: '',
  });

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = trainForm.animalId || safeAnimals[0]?.id;
    if (!targetId) return;

    const newRecord: EquineTrainingRecord = {
      id: `trn-${Date.now()}`,
      animalId: targetId,
      date: trainForm.date,
      discipline: trainForm.discipline,
      riderName: trainForm.riderName.trim() || 'Treinador Responsável',
      durationMinutes: Number(trainForm.durationMinutes) || 45,
      distanceKm: Number(trainForm.distanceKm) || 0,
      effortLevel: trainForm.effortLevel,
      vitals: {
        heartRateRestBpm: 36,
        heartRatePeakBpm: Number(trainForm.peakHr) || 180,
        heartRateRec5MinBpm: Number(trainForm.rec5MinHr) || 64,
        heartRateRec10MinBpm: Number(trainForm.rec10MinHr) || 46,
      },
      performanceScore: Number(trainForm.performanceScore) || 8,
      notes: trainForm.notes,
    };

    onAddTraining(newRecord);
    setIsTrainingModalOpen(false);
  };

  const handleSaveCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = compForm.animalId || safeAnimals[0]?.id;
    if (!targetId || !compForm.eventName.trim()) return;

    const newRecord: EquineCompetitionRecord = {
      id: `cmp-${Date.now()}`,
      animalId: targetId,
      date: compForm.date,
      eventName: compForm.eventName.trim(),
      city: compForm.city.trim() || '—',
      state: compForm.state.trim() || 'BR',
      category: compForm.category.trim() || 'Geral',
      placement: compForm.placement.trim() || 'Classificado',
      resultTime: compForm.resultTime.trim() || undefined,
      prizeMoneyBrl: Number(compForm.prizeMoneyBrl) || 0,
      trophyOrRibbon: compForm.trophyOrRibbon.trim() || undefined,
      riderOrHandler: compForm.riderOrHandler.trim() || 'Apresentador',
      observations: compForm.observations.trim() || undefined,
    };

    onAddCompetition(newRecord);
    setIsCompetitionModalOpen(false);
  };

  const filteredTrainings = safeTrainings.filter(
    t => selectedAnimalId === 'all' || t.animalId === selectedAnimalId
  );

  const filteredCompetitions = safeCompetitions.filter(
    c => selectedAnimalId === 'all' || c.animalId === selectedAnimalId
  );

  const totalPrizes = safeCompetitions.reduce((sum, c) => sum + (c.prizeMoneyBrl || 0), 0);
  const totalPodiums = safeCompetitions.filter(
    c => c.placement.includes('1º') || c.placement.includes('2º') || c.placement.includes('3º')
  ).length;

  const avgRec5Min = useMemo(() => {
    const valid = safeTrainings.filter(t => typeof t.vitals?.heartRateRec5MinBpm === 'number');
    if (valid.length === 0) return null;
    return Math.round(
      valid.reduce((sum, t) => sum + (t.vitals?.heartRateRec5MinBpm || 0), 0) / valid.length
    );
  }, [safeTrainings]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Performance, Treinamento & Provas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Fisiologia do esforço, frequência cardíaca de recuperação e histórico de conquistas em pista
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAnimalId}
            onChange={e => setSelectedAnimalFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os cavalos</option>
            {safeAnimals.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {activeTab === 'trainings' ? (
            <button
              type="button"
              onClick={() => setIsTrainingModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Treino</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCompetitionModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Prova</span>
            </button>
          )}
        </div>
      </div>

      {/* Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Treinos Registrados</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {safeTrainings.length}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pódios (1º–3º)</span>
            <span className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400 tabular-nums block">
              {totalPodiums}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Premiação Acumulada</span>
            <span className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
              R$ {totalPrizes.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">FC Recup. Média (5m)</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {avgRec5Min !== null ? `${avgRec5Min} bpm` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Switcher */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('trainings')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'trainings'
              ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
              : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Sessões de Treino ({filteredTrainings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('competitions')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'competitions'
              ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
              : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Provas & Campeonatos ({filteredCompetitions.length})</span>
        </button>
      </div>

      {/* Trainings List */}
      {activeTab === 'trainings' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {filteredTrainings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma sessão de treino registrada.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredTrainings.map(t => {
                const animal = safeAnimals.find(a => a.id === t.animalId);
                const peakHr = t.vitals?.heartRatePeakBpm ?? t.vitals?.peakHeartRateBpm;
                const rec5 = t.vitals?.heartRateRec5MinBpm;
                const rec10 = t.vitals?.heartRateRec10MinBpm;

                return (
                  <div key={t.id} className="p-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Activity className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {animal?.name || 'Cavalo'} — {t.discipline}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                            {new Date(t.date).toLocaleDateString('pt-BR')} · Treinador: {t.riderName} · Esforço: {t.effortLevel}
                          </div>
                        </div>
                      </div>
                      {t.performanceScore !== undefined && (
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums shrink-0">
                          Nota {t.performanceScore}/10
                        </span>
                      )}
                    </div>

                    <div className="pl-6.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Duração / Distância</span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">
                          {t.durationMinutes} min{t.distanceKm ? ` (${t.distanceKm} km)` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" /> FC Pico
                        </span>
                        <span className="font-medium text-rose-600 dark:text-rose-400">
                          {peakHr ? `${peakHr} bpm` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">FC Recup. 5 min</span>
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                          {rec5 ? `${rec5} bpm` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">FC Recup. 10 min</span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">
                          {rec10 ? `${rec10} bpm` : '—'}
                        </span>
                      </div>
                    </div>

                    {t.notes && (
                      <div className="pl-6.5 text-xs text-slate-600 dark:text-zinc-400">
                        {t.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Competitions List */}
      {activeTab === 'competitions' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {filteredCompetitions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma prova ou competição registrada.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredCompetitions.map(c => {
                const animal = safeAnimals.find(a => a.id === c.animalId);
                const timeScore = c.resultTime || c.scoreOrTime || c.scoreOrFaults || '—';
                const trophy = c.trophyOrRibbon || c.trophyOrMedal || '—';
                const notes = c.observations || c.notes;

                return (
                  <div key={c.id} className="p-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Trophy className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {c.eventName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                            {animal?.name || 'Cavalo'} · {c.city}/{c.state} · {new Date(c.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                          {c.placement}
                        </span>
                        {c.prizeMoneyBrl > 0 && (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            R$ {c.prizeMoneyBrl.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pl-6.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Categoria</span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">{c.category}</span>
                      </div>
                      <div className="tabular-nums">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Tempo / Nota</span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">{timeScore}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Cavaleiro</span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">{c.riderOrHandler}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Troféu / Prêmio</span>
                        <span className="font-medium text-slate-900 dark:text-zinc-100 truncate block">{trophy}</span>
                      </div>
                    </div>

                    {notes && (
                      <div className="pl-6.5 text-xs text-slate-600 dark:text-zinc-400">{notes}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Training */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Sessão de Treino
              </h3>
              <button
                type="button"
                onClick={() => setIsTrainingModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTraining} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Cavalo *</label>
                  <select
                    value={trainForm.animalId || safeAnimals[0]?.id || ''}
                    onChange={e => setTrainForm({ ...trainForm, animalId: e.target.value })}
                    className={inputCls}
                  >
                    {safeAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.discipline})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Modalidade</label>
                  <input
                    type="text"
                    value={trainForm.discipline}
                    onChange={e => setTrainForm({ ...trainForm, discipline: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Data do Treino</label>
                  <input
                    type="date"
                    value={trainForm.date}
                    onChange={e => setTrainForm({ ...trainForm, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Duração (min)</label>
                  <input
                    type="number"
                    value={trainForm.durationMinutes}
                    onChange={e => setTrainForm({ ...trainForm, durationMinutes: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Nível de Esforço</label>
                  <select
                    value={trainForm.effortLevel}
                    onChange={e => setTrainForm({ ...trainForm, effortLevel: e.target.value as EquineTrainingRecord['effortLevel'] })}
                    className={inputCls}
                  >
                    <option value="Leve">Leve</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Intenso">Intenso</option>
                    <option value="Máximo / Competição">Máximo / Competição</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>FC Pico (bpm)</label>
                  <input
                    type="number"
                    value={trainForm.peakHr}
                    onChange={e => setTrainForm({ ...trainForm, peakHr: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>FC Recup. 5 min (bpm)</label>
                  <input
                    type="number"
                    value={trainForm.rec5MinHr}
                    onChange={e => setTrainForm({ ...trainForm, rec5MinHr: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Treinador / Cavaleiro</label>
                  <input
                    type="text"
                    value={trainForm.riderName}
                    onChange={e => setTrainForm({ ...trainForm, riderName: e.target.value })}
                    placeholder="Nome do treinador"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Nota de Performance (1–10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={trainForm.performanceScore}
                    onChange={e => setTrainForm({ ...trainForm, performanceScore: Number(e.target.value) || 8 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações do Treinador</label>
                <textarea
                  rows={2}
                  value={trainForm.notes}
                  onChange={e => setTrainForm({ ...trainForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Treino
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Competition */}
      {isCompetitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Prova / Competição
              </h3>
              <button
                type="button"
                onClick={() => setIsCompetitionModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompetition} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Cavalo *</label>
                  <select
                    value={compForm.animalId || safeAnimals[0]?.id || ''}
                    onChange={e => setCompForm({ ...compForm, animalId: e.target.value })}
                    className={inputCls}
                  >
                    {safeAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Nome do Evento / Prova *</label>
                  <input
                    type="text"
                    required
                    value={compForm.eventName}
                    onChange={e => setCompForm({ ...compForm, eventName: e.target.value })}
                    placeholder="Ex: Campeonato Nacional ABQM"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Data</label>
                  <input
                    type="date"
                    value={compForm.date}
                    onChange={e => setCompForm({ ...compForm, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Colocação</label>
                  <input
                    type="text"
                    value={compForm.placement}
                    onChange={e => setCompForm({ ...compForm, placement: e.target.value })}
                    placeholder="Ex: 1º Lugar / Campeão"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Tempo / Pontuação</label>
                  <input
                    type="text"
                    value={compForm.resultTime}
                    onChange={e => setCompForm({ ...compForm, resultTime: e.target.value })}
                    placeholder="Ex: 16.742 s"
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Premiação (R$)</label>
                  <input
                    type="number"
                    value={compForm.prizeMoneyBrl}
                    onChange={e => setCompForm({ ...compForm, prizeMoneyBrl: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Cidade</label>
                  <input
                    type="text"
                    value={compForm.city}
                    onChange={e => setCompForm({ ...compForm, city: e.target.value })}
                    placeholder="Ex: Avaré"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>UF</label>
                  <input
                    type="text"
                    value={compForm.state}
                    onChange={e => setCompForm({ ...compForm, state: e.target.value })}
                    placeholder="SP"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompetitionModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Conquista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
