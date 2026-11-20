import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck,
  Sparkles,
  Dna,
  Activity,
  Syringe,
  Hammer,
  Trophy,
  Heart,
  Scale,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineHealthRecord,
  EquineFarrieryRecord,
  EquineDentalRecord,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineReproductionRecord,
  EquineBiometricsRecord,
} from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals: EquineAnimal[];
  selectedAnimalId?: string;
  healthRecords: EquineHealthRecord[];
  farrieryRecords: EquineFarrieryRecord[];
  dentalRecords: EquineDentalRecord[];
  trainingRecords: EquineTrainingRecord[];
  competitionRecords: EquineCompetitionRecord[];
  reproductionRecords: EquineReproductionRecord[];
  biometricsRecords: EquineBiometricsRecord[];
  onNavigateTab: (tabId: string, animalId?: string) => void;
  onOpenPassport: (animal: EquineAnimal) => void;
}

type TimelineCategory = 'sanidade' | 'podologia' | 'odontologia' | 'treino' | 'prova' | 'reproducao' | 'biometria';

interface TimelineEvent {
  id: string;
  date: string;
  category: TimelineCategory;
  title: string;
  subtitle: string;
  meta: string;
}

const CATEGORY_META: Record<TimelineCategory, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  sanidade: { label: 'Sanidade', icon: Syringe, tone: 'text-emerald-600 dark:text-emerald-400' },
  podologia: { label: 'Podologia', icon: Hammer, tone: 'text-amber-600 dark:text-amber-400' },
  odontologia: { label: 'Odontologia', icon: Activity, tone: 'text-sky-600 dark:text-sky-400' },
  treino: { label: 'Treino', icon: Activity, tone: 'text-indigo-600 dark:text-indigo-400' },
  prova: { label: 'Competição', icon: Trophy, tone: 'text-amber-600 dark:text-amber-400' },
  reproducao: { label: 'Reprodução', icon: Heart, tone: 'text-rose-600 dark:text-rose-400' },
  biometria: { label: 'Biometria', icon: Scale, tone: 'text-slate-600 dark:text-zinc-400' },
};

export const EquineDigitalTwinView: React.FC<Props> = ({
  animals,
  selectedAnimalId,
  healthRecords,
  farrieryRecords,
  dentalRecords,
  trainingRecords,
  competitionRecords,
  reproductionRecords,
  biometricsRecords,
  onNavigateTab,
  onOpenPassport,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const [currentId, setCurrentId] = useState<string>(selectedAnimalId || safeAnimals[0]?.id || '');

  useEffect(() => {
    if (selectedAnimalId && safeAnimals.some(a => a.id === selectedAnimalId)) {
      setCurrentId(selectedAnimalId);
    } else if (!safeAnimals.some(a => a.id === currentId)) {
      setCurrentId(safeAnimals[0]?.id || '');
    }
  }, [selectedAnimalId, safeAnimals, currentId]);

  const animal = safeAnimals.find(a => a.id === currentId) || safeAnimals[0];

  const animalHealth = useMemo(
    () => (healthRecords || []).filter(h => h?.animalId === animal?.id),
    [healthRecords, animal?.id]
  );
  const animalFarriery = useMemo(
    () => (farrieryRecords || []).filter(f => f?.animalId === animal?.id),
    [farrieryRecords, animal?.id]
  );
  const animalDental = useMemo(
    () => (dentalRecords || []).filter(d => d?.animalId === animal?.id),
    [dentalRecords, animal?.id]
  );
  const animalTraining = useMemo(
    () => (trainingRecords || []).filter(t => t?.animalId === animal?.id),
    [trainingRecords, animal?.id]
  );
  const animalComps = useMemo(
    () => (competitionRecords || []).filter(c => c?.animalId === animal?.id),
    [competitionRecords, animal?.id]
  );
  const animalRepro = useMemo(
    () => (reproductionRecords || []).filter(r => r?.femaleId === animal?.id || r?.maleId === animal?.id),
    [reproductionRecords, animal?.id]
  );
  const animalBiometrics = useMemo(
    () => (biometricsRecords || []).filter(b => b?.animalId === animal?.id),
    [biometricsRecords, animal?.id]
  );

  const timeline = useMemo<TimelineEvent[]>(() => {
    if (!animal) return [];
    const events: TimelineEvent[] = [
      ...animalHealth.map(h => ({
        id: `h-${h.id}`,
        date: h.date,
        category: 'sanidade' as const,
        title: `${h.type}: ${h.title}`,
        subtitle: h.productOrDrug ? `${h.productOrDrug} · Vet: ${h.veterinarian}` : `Vet: ${h.veterinarian}`,
        meta: h.status,
      })),
      ...animalFarriery.map(f => ({
        id: `f-${f.id}`,
        date: f.date,
        category: 'podologia' as const,
        title: `Ferrageamento: ${f.horseshoeType}`,
        subtitle: `Ferrador: ${f.farrierName} · Casco: ${f.hoofCondition}`,
        meta: f.frontHoofAngleDegrees ? `Ant. ${f.frontHoofAngleDegrees}°` : 'Concluído',
      })),
      ...animalDental.map(d => ({
        id: `d-${d.id}`,
        date: d.date,
        category: 'odontologia' as const,
        title: `Odontologia — Desgaste: ${d.wearGrade}`,
        subtitle: `Vet: ${d.veterinarian}`,
        meta: (d.proceduresPerformed || []).length > 0 ? `${d.proceduresPerformed.length} proc.` : 'Revisado',
      })),
      ...animalTraining.map(t => ({
        id: `t-${t.id}`,
        date: t.date,
        category: 'treino' as const,
        title: `Treino: ${t.discipline}`,
        subtitle: `${t.durationMinutes} min · Esforço ${t.effortLevel} · ${t.riderName}`,
        meta: t.performanceScore ? `Nota ${t.performanceScore}/10` : t.recoveryEvaluation || 'Registrado',
      })),
      ...animalComps.map(c => ({
        id: `c-${c.id}`,
        date: c.date,
        category: 'prova' as const,
        title: `${c.eventName} (${c.city}/${c.state})`,
        subtitle: `${c.category} · ${c.riderOrHandler}`,
        meta: c.placement,
      })),
      ...animalRepro.map(r => ({
        id: `r-${r.id}`,
        date: r.date,
        category: 'reproducao' as const,
        title: r.type,
        subtitle: `Vet: ${r.veterinarian}`,
        meta: r.outcome,
      })),
      ...animalBiometrics.map(b => ({
        id: `b-${b.id}`,
        date: b.date,
        category: 'biometria' as const,
        title: `Avaliação Biométrica (${b.weightKg} kg)`,
        subtitle: `Cernelha ${b.heightM.toFixed(2)} m · ECC ${b.bodyScore}/9 · ${b.measuredBy}`,
        meta: `${b.weightKg} kg`,
      })),
    ];

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [animal, animalHealth, animalFarriery, animalDental, animalTraining, animalComps, animalRepro, animalBiometrics]);

  if (!animal) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2.5">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
          <EquinoIcon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum equino selecionado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cadastre um animal no Plantel para visualizar o prontuário Gêmeo Digital 360°.
        </p>
        <button
          type="button"
          onClick={() => onNavigateTab('registry')}
          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
        >
          Ir para Plantel
        </button>
      </div>
    );
  }

  const birthYear = animal.birthDate ? new Date(animal.birthDate).getFullYear() : null;
  const ageYears = birthYear ? Math.max(0, new Date().getFullYear() - birthYear) : null;

  const aptitudeScores = [
    { label: 'Conformação & Aprumos', score: Math.min(98, 72 + Math.round((animal.bodyScore || 5) * 3)) },
    { label: 'Condicionamento Atlético', score: Math.min(98, 68 + animalTraining.length * 4 + animalComps.length * 5) },
    { label: 'Regularidade Sanitária', score: Math.min(100, 75 + animalHealth.length * 5) },
    { label: 'Saúde Podal & Dental', score: Math.min(100, 74 + animalFarriery.length * 6 + animalDental.length * 5) },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Gêmeo Digital 360°</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Prontuário unificado de identificação, biometria, genealogia e histórico clínico-esportivo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={animal.id}
            onChange={e => setCurrentId(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            {safeAnimals.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.breed})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onOpenPassport(animal)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Passaporte Digital</span>
          </button>
        </div>
      </div>

      {/* Main Profile + Metrics */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
          {/* Portrait */}
          <div className="w-full md:w-48 h-44 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
            {animal.photoUrl ? (
              <img src={animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" />
            ) : (
              <EquinoIcon className="w-12 h-12 text-slate-300 dark:text-zinc-600" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  {animal.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {animal.breed} · {animal.coatColor} · {animal.sex}
                  {ageYears !== null ? ` · ${ageYears} anos` : ''}
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {animal.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Registro Oficial</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                  {animal.registrationNumber}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Microchip ISO</span>
                <span className="font-mono text-slate-900 dark:text-zinc-100">
                  {animal.microchip || '—'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Modalidade</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 truncate block">
                  {animal.discipline}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Associação</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 truncate block">
                  {animal.association || 'Não informada'}
                </span>
              </div>
            </div>

            {animal.notes && (
              <p className="text-xs text-slate-600 dark:text-zinc-300 pt-2 border-t border-slate-100 dark:border-zinc-800">
                {animal.notes}
              </p>
            )}
          </div>
        </div>

        {/* Hairline Biometric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border-t border-slate-200 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Peso Vivo</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {animal.weightKg} kg
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Cernelha</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {animal.heightM.toFixed(2)} m
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Perím. Torácico</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {animal.chestCircumferenceCm || '—'} cm
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Escore Henneke</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {animal.bodyScore} / 9
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Valor de Mercado</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {animal.marketValueBrl
                ? `R$ ${animal.marketValueBrl.toLocaleString('pt-BR')}`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Split: Aptitude & Pedigree + Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          {/* Aptitude Indicators */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Índices de Acompanhamento
            </h3>
            <div className="space-y-2.5">
              {aptitudeScores.map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-zinc-400">{item.label}</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pedigree Summary */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Linhagem Direta</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('genealogy', animal.id)}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Árvore 4G</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="py-2 flex justify-between gap-2">
                <span className="text-slate-500 dark:text-zinc-400">Pai (Sire)</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 text-right truncate">
                  {animal.pedigree?.sire?.name || 'Não informado'}
                </span>
              </div>
              <div className="py-2 flex justify-between gap-2">
                <span className="text-slate-500 dark:text-zinc-400">Mãe (Dam)</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 text-right truncate">
                  {animal.pedigree?.dam?.name || 'Não informada'}
                </span>
              </div>
              <div className="py-2 flex justify-between gap-2">
                <span className="text-slate-500 dark:text-zinc-400">Endogamia (F)</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                  {animal.inbreedingCoefficient !== undefined ? `${animal.inbreedingCoefficient}%` : 'Não calculado'}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Module Shortcuts */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Ações no Prontuário
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Biometria', tab: 'biometrics' },
                { label: 'Nutrição NRC', tab: 'nutrition' },
                { label: 'Sanidade', tab: 'health' },
                { label: 'Podologia', tab: 'farriery' },
                { label: 'Odontologia', tab: 'dental' },
                { label: 'Treinos & Provas', tab: 'training' },
              ].map(item => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => onNavigateTab(item.tab, animal.id)}
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 text-left truncate cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chronological Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>Linha do Tempo Integrada</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {timeline.length} evento{timeline.length === 1 ? '' : 's'}
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum evento clínico, biométrico, podológico ou esportivo registrado para este animal.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {timeline.slice(0, 15).map(ev => {
                const cfg = CATEGORY_META[ev.category];
                const Icon = cfg.icon;
                return (
                  <div key={ev.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.tone}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {ev.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                        {ev.meta}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                        {new Date(ev.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
