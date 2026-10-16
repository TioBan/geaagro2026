import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  ShieldCheck,
  Scale,
  Activity,
  Heart,
  Calendar,
  Clock,
  Dna,
  Zap,
  QrCode,
  FileText,
  TrendingUp,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Droplets,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineBiometricsRecord,
  EquineHealthRecord,
  EquineFarrieryRecord,
  EquineDentalRecord,
  EquineTrainingRecord,
  EquineCompetitionRecord,
  EquineReproductionRecord,
} from '../../types/equine';

interface Props {
  animals?: EquineAnimal[];
  selectedAnimalId?: string;
  biometricsRecords?: EquineBiometricsRecord[];
  healthRecords?: EquineHealthRecord[];
  farrieryRecords?: EquineFarrieryRecord[];
  dentalRecords?: EquineDentalRecord[];
  trainingRecords?: EquineTrainingRecord[];
  competitionRecords?: EquineCompetitionRecord[];
  reproductionRecords?: EquineReproductionRecord[];
  onOpenPassport: (animal: EquineAnimal) => void;
  onNavigateTab: (tabId: string, animalId?: string) => void;
}

export const EquineDigitalTwinView: React.FC<Props> = ({
  animals = [],
  selectedAnimalId,
  biometricsRecords = [],
  healthRecords = [],
  farrieryRecords = [],
  dentalRecords = [],
  trainingRecords = [],
  competitionRecords = [],
  reproductionRecords = [],
  onOpenPassport,
  onNavigateTab,
}) => {
  const safeAnimals = Array.isArray(animals) ? animals : [];
  const safeBiometrics = Array.isArray(biometricsRecords) ? biometricsRecords : [];
  const safeHealth = Array.isArray(healthRecords) ? healthRecords : [];
  const safeFarriery = Array.isArray(farrieryRecords) ? farrieryRecords : [];
  const safeDental = Array.isArray(dentalRecords) ? dentalRecords : [];
  const safeTraining = Array.isArray(trainingRecords) ? trainingRecords : [];
  const safeCompetition = Array.isArray(competitionRecords) ? competitionRecords : [];
  const safeReproduction = Array.isArray(reproductionRecords) ? reproductionRecords : [];

  const [currentId, setCurrentId] = useState<string>(selectedAnimalId || (safeAnimals[0]?.id ?? ''));

  const animal = safeAnimals.find(a => a?.id === currentId) || safeAnimals[0];

  if (!animal) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
        <span className="text-4xl">🐎</span>
        <h3 className="text-lg font-black text-stone-900">Nenhum animal cadastrado</h3>
        <p className="text-xs text-stone-500">Cadastre um animal para visualizar seu Gêmeo Digital 360°.</p>
      </div>
    );
  }

  // Filter records for this animal
  const animalBiometrics = safeBiometrics.filter(b => b?.animalId === animal.id);
  const animalHealth = safeHealth.filter(h => h?.animalId === animal.id);
  const animalFarriery = safeFarriery.filter(f => f?.animalId === animal.id);
  const animalDental = safeDental.filter(d => d?.animalId === animal.id);
  const animalTrainings = safeTraining.filter(t => t?.animalId === animal.id);
  const animalCompetitions = safeCompetition.filter(c => c?.animalId === animal.id);
  const animalReproduction = safeReproduction.filter(r => r?.femaleId === animal.id || r?.maleId === animal.id);

  // Unified Timeline
  interface TimelineEvent {
    id: string;
    date: string;
    category: 'Saúde' | 'Ferrageamento' | 'Treino' | 'Competição' | 'Reprodução' | 'Odontologia' | 'Biometria';
    title: string;
    subtitle: string;
    icon: string;
    color: string;
  }

  const timelineEvents: TimelineEvent[] = [
    ...animalHealth.map(h => ({
      id: h.id,
      date: h.date,
      category: 'Saúde' as const,
      title: `${h.type}: ${h.title}`,
      subtitle: `${h.productOrDrug} (${h.veterinarian})`,
      icon: '💉',
      color: 'border-blue-500 bg-blue-50 text-blue-900',
    })),
    ...animalFarriery.map(f => ({
      id: f.id,
      date: f.date,
      category: 'Ferrageamento' as const,
      title: `Ferrageamento: ${f.horseshoeType}`,
      subtitle: `${f.farrierName} • Ângulos: ${f.frontHoofAngleDegrees}° / ${f.hindHoofAngleDegrees}°`,
      icon: '🔨',
      color: 'border-amber-500 bg-amber-50 text-amber-900',
    })),
    ...animalDental.map(d => ({
      id: d.id,
      date: d.date,
      category: 'Odontologia' as const,
      title: `Revisão Odontológica (${d.wearGrade})`,
      subtitle: `${d.proceduresPerformed.join(', ')} • ${d.veterinarian}`,
      icon: '🦷',
      color: 'border-teal-500 bg-teal-50 text-teal-900',
    })),
    ...animalTrainings.map(t => ({
      id: t.id,
      date: t.date,
      category: 'Treino' as const,
      title: `Treino de ${t.discipline.split('/')[0]} (${t.durationMinutes} min)`,
      subtitle: `${t.riderName} • Esforço: ${t.effortLevel} • FC Recuperação: ${t.vitals.heartRateRec5MinBpm} bpm`,
      icon: '🏆',
      color: 'border-orange-500 bg-orange-50 text-orange-900',
    })),
    ...animalCompetitions.map(c => ({
      id: c.id,
      date: c.date,
      category: 'Competição' as const,
      title: `${c.placement}: ${c.eventName}`,
      subtitle: `${c.city}/${c.state} • ${c.category} • Prêmio: R$ ${c.prizeMoneyBrl.toLocaleString('pt-BR')}`,
      icon: '🥇',
      color: 'border-yellow-500 bg-yellow-50 text-yellow-900',
    })),
    ...animalReproduction.map(r => ({
      id: r.id,
      date: r.date,
      category: 'Reprodução' as const,
      title: `${r.type}`,
      subtitle: `Status: ${r.outcome} • Prev. Parto: ${r.expectedFoalingDate ? new Date(r.expectedFoalingDate).toLocaleDateString('pt-BR') : 'N/A'}`,
      icon: '❤️',
      color: 'border-rose-500 bg-rose-50 text-rose-900',
    })),
    ...animalBiometrics.map(b => ({
      id: b.id,
      date: b.date,
      category: 'Biometria' as const,
      title: `Pesagem & Biometria: ${b.weightKg} kg`,
      subtitle: `Cernelha: ${b.heightM}m • Tórax: ${b.chestCircumferenceCm}cm • Escore: ${b.bodyScore}/9`,
      icon: '⚖️',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Radar/Scores estimation based on attributes
  const traits = [
    { label: 'Velocidade & Explosão', score: animal.breed === 'Quarto de Milha' ? 95 : 82, color: 'bg-amber-500' },
    { label: 'Comodidade / Marcha', score: animal.breed === 'Mangalarga Marchador' ? 98 : 78, color: 'bg-emerald-500' },
    { label: 'Resistência / Fôlego', score: animal.breed === 'Crioulo' ? 94 : 88, color: 'bg-blue-500' },
    { label: 'Morfologia & Aprumos', score: 90, color: 'bg-purple-500' },
    { label: 'Docilidade & Manejo', score: 92, color: 'bg-teal-500' },
    { label: 'Sanidade & Cascos', score: 96, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Animal Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center text-2xl font-black">
            🐎
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Gêmeo Digital 360° do Equino
            </div>
            <h2 className="text-lg font-black text-stone-900">
              {animal.name}
            </h2>
          </div>
        </div>

        {/* Horse Selector Dropdown & Quick Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={currentId}
            onChange={e => setCurrentId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-amber-600"
          >
            {animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.breed} • {a.category})
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenPassport(animal)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Passaporte Digital</span>
          </button>
        </div>
      </div>

      {/* Main 360° Digital Twin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo, Core Bio, Pedigree Snapshot */}
        <div className="space-y-5">
          {/* Main Visual Profile Card */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="relative aspect-4/3 bg-stone-200">
              <img
                src={animal.photoUrl}
                alt={animal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-400/30">
                {animal.breed}
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-stone-900 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                {animal.category}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xl font-black text-stone-900">{animal.name}</h3>
                <div className="text-xs text-stone-500 font-mono mt-0.5">
                  Reg: <strong>{animal.registrationNumber}</strong> • Chip: <strong>{animal.microchip}</strong>
                </div>
              </div>

              {/* Physical Parameters Badge Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Peso Corporal</span>
                  <span className="text-base font-black text-stone-900 font-mono">{animal.weightKg} kg</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Altura Cernelha</span>
                  <span className="text-base font-black text-stone-900 font-mono">{animal.heightM} m</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">P. Torácico</span>
                  <span className="text-base font-black text-stone-900 font-mono">{animal.chestCircumferenceCm} cm</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Escore Henneke</span>
                  <span className="text-base font-black text-emerald-800 font-mono">{animal.bodyScore}/9</span>
                </div>
              </div>

              {/* Quick Details List */}
              <div className="space-y-1.5 text-xs text-stone-700 border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-stone-500">Pelagem:</span>
                  <span className="font-bold">{animal.coatColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Sexo:</span>
                  <span className="font-bold">{animal.sex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Modalidade:</span>
                  <span className="font-bold text-amber-900">{animal.discipline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Proprietário:</span>
                  <span className="font-bold">{animal.owner}</span>
                </div>
              </div>

              {/* Quick Pedigree */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-1.5">
                <div className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                  <Dna className="w-3.5 h-3.5 text-amber-700" /> Linhagem Genética Direta
                </div>
                <div className="text-[11px]">
                  <strong>Pai:</strong> {animal.pedigree?.sire?.name || 'Não informado'}
                </div>
                <div className="text-[11px]">
                  <strong>Mãe:</strong> {animal.pedigree?.dam?.name || 'Não informada'}
                </div>
                <button
                  onClick={() => onNavigateTab('genealogy')}
                  className="text-[11px] font-black text-amber-900 hover:underline pt-1 flex items-center gap-1 cursor-pointer"
                >
                  Ver Árvore Genealógica Completa <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Aptitude & Trait Scores */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" /> Avaliação de Aptidão & Performance
            </h3>
            <div className="space-y-3">
              {traits.map(t => (
                <div key={t.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>{t.label}</span>
                    <span className="font-mono text-stone-900">{t.score}/100</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Chronological Lifetime Timeline & Quick Modules Access */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Module Fast Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateTab('health')}
              className="p-3 bg-white hover:bg-blue-50 rounded-xl border border-stone-200 hover:border-blue-300 text-left transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-base">💉</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-700" />
              </div>
              <div className="font-black text-xs text-stone-900">Sanidade & Vacinas</div>
              <div className="text-[10px] text-stone-500 mt-0.5">{animalHealth.length} registros</div>
            </button>

            <button
              onClick={() => onNavigateTab('farriery')}
              className="p-3 bg-white hover:bg-amber-50 rounded-xl border border-stone-200 hover:border-amber-300 text-left transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-base">🔨</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700" />
              </div>
              <div className="font-black text-xs text-stone-900">Ferrageamento</div>
              <div className="text-[10px] text-stone-500 mt-0.5">{animalFarriery.length} trocas</div>
            </button>

            <button
              onClick={() => onNavigateTab('training')}
              className="p-3 bg-white hover:bg-orange-50 rounded-xl border border-stone-200 hover:border-orange-300 text-left transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex items-center justify-between text-orange-700 mb-1">
                <span className="text-base">🏆</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-700" />
              </div>
              <div className="font-black text-xs text-stone-900">Treinos & Provas</div>
              <div className="text-[10px] text-stone-500 mt-0.5">{animalTrainings.length} sessões</div>
            </button>

            <button
              onClick={() => onNavigateTab('reproduction')}
              className="p-3 bg-white hover:bg-rose-50 rounded-xl border border-stone-200 hover:border-rose-300 text-left transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex items-center justify-between text-rose-700 mb-1">
                <span className="text-base">❤️</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-700" />
              </div>
              <div className="font-black text-xs text-stone-900">Reprodução & TE</div>
              <div className="text-[10px] text-stone-500 mt-0.5">{animalReproduction.length} eventos</div>
            </button>
          </div>

          {/* Unified Lifetime Chronological Timeline */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Linha do Tempo 360° da Vida do Cavalo</span>
                </h3>
                <p className="text-xs text-stone-500">Histórico unificado de saúde, podologia, treinos, competições e reprodução</p>
              </div>
              <span className="bg-stone-100 text-stone-800 text-xs font-bold px-2.5 py-1 rounded-full">
                {timelineEvents.length} eventos registrados
              </span>
            </div>

            {timelineEvents.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {timelineEvents.map(event => (
                  <div key={event.id} className="relative group">
                    {/* Circle icon marker */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-stone-400 group-hover:border-amber-600 flex items-center justify-center text-[10px] shadow-xs">
                      {event.icon}
                    </div>

                    <div className="bg-stone-50 hover:bg-amber-50/50 p-3.5 rounded-xl border border-stone-200 transition-colors">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-stone-900">{event.title}</span>
                        <span className="text-[11px] font-mono text-stone-500 font-semibold shrink-0">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1">{event.subtitle}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${event.color}`}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs italic">
                Nenhum evento histórico registrado para este animal ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
