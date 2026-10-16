// @ts-nocheck
import React, { useState } from 'react';
import {
  Trophy,
  Activity,
  Heart,
  Plus,
  Calendar,
  Clock,
  Award,
  Zap,
  Flame,
  User,
  X,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
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

export const EquineTrainingPerformanceView: React.FC<Props> = ({
  animals,
  trainingRecords,
  competitionRecords,
  onAddTraining,
  onAddCompetition,
}) => {
  const [activeTab, setActiveTab] = useState<'trainings' | 'competitions'>('trainings');
  const [selectedAnimalId, setSelectedAnimalFilter] = useState<string>('all');
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);

  // Training form state
  const [trainForm, setTrainForm] = useState<Partial<EquineTrainingRecord>>({
    animalId: animals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    discipline: 'Três Tambores (Barrel Racing)',
    durationMinutes: 45,
    distanceKm: 4.2,
    effortLevel: 'Moderado',
    riderName: 'Treinador Lucas Mendes',
    vitals: {
      restingHeartRateBpm: 34,
      peakHeartRateBpm: 186,
      heartRateRec5MinBpm: 68,
      heartRateRec10MinBpm: 46,
      temperatureCelsius: 38.1,
    },
    performanceScore: 9,
    notes: 'Excelente impulsão dos posteriores e contorno limpo dos tambores.',
  });

  // Competition form state
  const [compForm, setCompForm] = useState<Partial<EquineCompetitionRecord>>({
    animalId: animals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    eventName: 'Grande Prêmio Nacional de Velocidade',
    city: 'Avaré',
    state: 'SP',
    category: 'Aberta Senior',
    placement: '1º Lugar (Campeão)',
    scoreOrTime: '16.742 s',
    prizeMoneyBrl: 15000,
    trophyOrMedal: 'Troféu Ouro Campeão Nacional',
    riderOrHandler: 'Lucas Mendes',
    notes: 'Recorde da pista na 2ª passada.',
  });

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainForm.animalId) return;

    const newRecord: EquineTrainingRecord = {
      ...(trainForm as EquineTrainingRecord),
      id: `trn-${Date.now()}`,
    };
    onAddTraining(newRecord);
    setIsTrainingModalOpen(false);
  };

  const handleSaveCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.animalId || !compForm.eventName) return;

    const newRecord: EquineCompetitionRecord = {
      ...(compForm as EquineCompetitionRecord),
      id: `cmp-${Date.now()}`,
    };
    onAddCompetition(newRecord);
    setIsCompetitionModalOpen(false);
  };

  const filteredTrainings = trainingRecords.filter(t =>
    selectedAnimalId === 'all' || t.animalId === selectedAnimalId
  );

  const filteredCompetitions = competitionRecords.filter(c =>
    selectedAnimalId === 'all' || c.animalId === selectedAnimalId
  );

  const totalPrizes = competitionRecords.reduce((sum, c) => sum + (c.prizeMoneyBrl || 0), 0);
  const totalPodiums = competitionRecords.filter(c =>
    c.placement.includes('1º') || c.placement.includes('2º') || c.placement.includes('3º')
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-orange-900 tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-orange-600" /> Centro de Performance, Treinamento & Provas
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Fisiologia do Exercício & Registro de Competições
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitoramento de frequência cardíaca de esforço, índice de recuperação e conquistas em pista
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAnimalId}
            onChange={e => setSelectedAnimalFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
          >
            <option value="all">Todos os Cavalos</option>
            {animals.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {activeTab === 'trainings' ? (
            <button
              onClick={() => setIsTrainingModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Treino</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCompetitionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Prova / Prêmio</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Treinos Realizados</span>
          <span className="text-2xl font-black text-stone-900">{trainingRecords.length}</span>
          <span className="text-[11px] text-orange-700 block mt-0.5 font-semibold">Sessões completas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-yellow-800 font-bold uppercase block">Pódios & Títulos</span>
          <span className="text-2xl font-black text-yellow-900 font-mono">{totalPodiums}</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">1º ao 3º lugar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Premiação Acumulada</span>
          <span className="text-2xl font-black text-emerald-800 font-mono">
            R$ {totalPrizes.toLocaleString('pt-BR')}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Prêmios oficiais ganhos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">FC Recuperação Média (5m)</span>
          <span className="text-2xl font-black text-blue-900 font-mono">68 bpm</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5 font-semibold">Excelente condicionamento</span>
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('trainings')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'trainings' ? 'bg-orange-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sessões de Treino & Fisiologia ({filteredTrainings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('competitions')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'competitions' ? 'bg-orange-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Histórico de Provas & Campeonatos ({filteredCompetitions.length})</span>
        </button>
      </div>

      {/* View 1: Trainings */}
      {activeTab === 'trainings' && (
        <div className="space-y-4">
          {(filteredTrainings || []).filter(t => t && t.id).map(t => {
            const animal = (animals || []).find(a => a?.id === t?.animalId);

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-orange-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl font-bold">
                      🏃
                    </div>
                    <div>
                      <h3 className="font-black text-stone-900 text-sm">{t.discipline}</h3>
                      <div className="text-xs text-stone-500 font-medium">
                        Cavalo: <strong className="text-stone-800">{animal?.name || 'Cavalo'}</strong> • Data: {new Date(t.date).toLocaleDateString('pt-BR')} • Treinador: {t.riderName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-orange-50 text-orange-900 border border-orange-200 px-3 py-1 rounded-full">
                      Esforço: {t.effortLevel}
                    </span>
                    <span className="text-xs font-black bg-stone-900 text-white px-2.5 py-1 rounded-lg">
                      Nota {t.performanceScore}/10
                    </span>
                  </div>
                </div>

                {/* Physiology Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Duração & Distância</span>
                    <strong className="text-sm font-black text-stone-900 block font-mono mt-0.5">
                      {t.durationMinutes} min ({t.distanceKm} km)
                    </strong>
                  </div>

                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                    <span className="text-[10px] text-red-700 font-bold uppercase block flex items-center gap-1">
                      <Heart className="w-3 h-3" /> FC Pico (Esforço Máx)
                    </span>
                    <strong className="text-sm font-black text-red-900 block font-mono mt-0.5">
                      {t.vitals.peakHeartRateBpm} bpm
                    </strong>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">FC Recup. (5 min)</span>
                    <strong className="text-sm font-black text-emerald-900 block font-mono mt-0.5">
                      {t.vitals.heartRateRec5MinBpm} bpm
                    </strong>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-700 font-bold uppercase block">FC Recup. (10 min)</span>
                    <strong className="text-sm font-black text-blue-900 block font-mono mt-0.5">
                      {t.vitals.heartRateRec10MinBpm} bpm
                    </strong>
                  </div>
                </div>

                {t.notes && (
                  <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <strong>Parecer do Treinador:</strong> {t.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Competitions */}
      {activeTab === 'competitions' && (
        <div className="space-y-4">
          {(filteredCompetitions || []).filter(c => c && c.id).map(c => {
            const animal = (animals || []).find(a => a?.id === c?.animalId);

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-yellow-400 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center text-xl font-bold">
                      🏆
                    </div>
                    <div>
                      <h3 className="font-black text-stone-900 text-sm">{c.eventName}</h3>
                      <div className="text-xs text-stone-500 font-medium">
                        Cavalo: <strong className="text-stone-800">{animal?.name || 'Cavalo'}</strong> • Local: {c.city}/{c.state} • Data: {new Date(c.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-yellow-500 text-stone-950 px-3 py-1 rounded-full shadow-xs">
                      {c.placement}
                    </span>
                    {c.prizeMoneyBrl > 0 && (
                      <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        R$ {c.prizeMoneyBrl.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Categoria</span>
                    <strong className="text-stone-900 block mt-0.5">{c.category}</strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Tempo / Pontuação</span>
                    <strong className="text-stone-900 block font-mono mt-0.5">{c.scoreOrTime}</strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Cavaleiro / Apresentador</span>
                    <strong className="text-stone-900 block mt-0.5">{c.riderOrHandler}</strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Premiação / Troféu</span>
                    <strong className="text-amber-900 block mt-0.5 truncate">{c.trophyOrMedal || 'Certificado'}</strong>
                  </div>
                </div>

                {c.notes && (
                  <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <strong>Resenha da Prova:</strong> {c.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Training */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-orange-950 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-400" />
                <h3 className="font-black text-sm">Registrar Sessão de Treino</h3>
              </div>
              <button onClick={() => setIsTrainingModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTraining} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Cavalo *</label>
                  <select
                    value={trainForm.animalId}
                    onChange={e => setTrainForm({ ...trainForm, animalId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.discipline})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Modalidade</label>
                  <input
                    type="text"
                    value={trainForm.discipline || ''}
                    onChange={e => setTrainForm({ ...trainForm, discipline: e.target.value as EquineDiscipline })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Data do Treino</label>
                  <input
                    type="date"
                    value={trainForm.date}
                    onChange={e => setTrainForm({ ...trainForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={trainForm.durationMinutes}
                    onChange={e => setTrainForm({ ...trainForm, durationMinutes: parseInt(e.target.value) || 45 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nível de Esforço</label>
                  <select
                    value={trainForm.effortLevel}
                    onChange={e => setTrainForm({ ...trainForm, effortLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="Leve">Leve (Aquecimento / Passo)</option>
                    <option value="Moderado">Moderado (Trote / Galope ritmado)</option>
                    <option value="Intenso">Intenso (Passadas em pista de prova)</option>
                    <option value="Máximo / Competição">Máximo / Simulação de Prova</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">FC Pico Esforço (bpm)</label>
                  <input
                    type="number"
                    value={trainForm.vitals?.peakHeartRateBpm}
                    onChange={e => setTrainForm({
                      ...trainForm,
                      vitals: { ...trainForm.vitals!, peakHeartRateBpm: parseInt(e.target.value) || 180 }
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">FC Recup. 5 Min (bpm)</label>
                  <input
                    type="number"
                    value={trainForm.vitals?.heartRateRec5MinBpm}
                    onChange={e => setTrainForm({
                      ...trainForm,
                      vitals: { ...trainForm.vitals!, heartRateRec5MinBpm: parseInt(e.target.value) || 65 }
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Observações do Treinador</label>
                <textarea
                  rows={2}
                  value={trainForm.notes || ''}
                  onChange={e => setTrainForm({ ...trainForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-md cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="bg-yellow-950 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-black text-sm">Registrar Prova / Título</h3>
              </div>
              <button onClick={() => setIsCompetitionModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompetition} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Cavalo *</label>
                  <select
                    value={compForm.animalId}
                    onChange={e => setCompForm({ ...compForm, animalId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Nome do Evento / Prova *</label>
                  <input
                    type="text"
                    required
                    value={compForm.eventName || ''}
                    onChange={e => setCompForm({ ...compForm, eventName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Colocação / Resultado</label>
                  <input
                    type="text"
                    value={compForm.placement || ''}
                    onChange={e => setCompForm({ ...compForm, placement: e.target.value })}
                    placeholder="Ex: 1º Lugar (Campeão)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tempo / Pontuação</label>
                  <input
                    type="text"
                    value={compForm.scoreOrTime || ''}
                    onChange={e => setCompForm({ ...compForm, scoreOrTime: e.target.value })}
                    placeholder="Ex: 16.742 s"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={`${compForm.city || ''} / ${compForm.state || ''}`}
                    onChange={e => {
                      const [city, state] = e.target.value.split('/');
                      setCompForm({ ...compForm, city: city?.trim(), state: state?.trim() || 'SP' });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Premiação em Dinheiro (R$)</label>
                  <input
                    type="number"
                    value={compForm.prizeMoneyBrl}
                    onChange={e => setCompForm({ ...compForm, prizeMoneyBrl: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCompetitionModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-black rounded-xl shadow-md cursor-pointer"
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
