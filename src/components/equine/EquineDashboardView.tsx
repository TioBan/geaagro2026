import React from 'react';
import {
  Heart,
  Activity,
  Syringe,
  Stethoscope,
  Calendar,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  DollarSign,
  Search,
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
  EquineExpenseRecord,
  EquineFacility,
} from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals?: EquineAnimal[];
  biometrics?: EquineBiometricsRecord[];
  healthRecords?: EquineHealthRecord[];
  farrieryRecords?: EquineFarrieryRecord[];
  dentalRecords?: EquineDentalRecord[];
  trainingRecords?: EquineTrainingRecord[];
  competitionRecords?: EquineCompetitionRecord[];
  reproductionRecords?: EquineReproductionRecord[];
  expenses?: EquineExpenseRecord[];
  facilities?: EquineFacility[];
  onNavigateTab: (tabId: string, animalId?: string) => void;
  onOpenPassport: (animal: EquineAnimal) => void;
}

export const EquineDashboardView: React.FC<Props> = ({
  animals = [],
  healthRecords = [],
  farrieryRecords = [],
  dentalRecords = [],
  trainingRecords = [],
  competitionRecords = [],
  expenses = [],
  facilities = [],
  onNavigateTab,
  onOpenPassport,
}) => {
  // Key Metrics
  const safeAnimals = Array.isArray(animals) ? animals : [];
  const safeHealth = Array.isArray(healthRecords) ? healthRecords : [];
  const safeFarriery = Array.isArray(farrieryRecords) ? farrieryRecords : [];
  const safeDental = Array.isArray(dentalRecords) ? dentalRecords : [];
  const safeTraining = Array.isArray(trainingRecords) ? trainingRecords : [];
  const safeCompetition = Array.isArray(competitionRecords) ? competitionRecords : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeFacilities = Array.isArray(facilities) ? facilities : [];

  const totalAnimals = safeAnimals.length;
  const pregnantMares = safeAnimals.filter(a => a?.isPregnant || (a?.category === 'Matriz' && a?.isPregnant)).length;
  const foals = safeAnimals.filter(a => a?.category === 'Potro ao Pé' || a?.category === 'Potro Desmamado' || a?.category === 'Potro em Recria').length;
  const inTraining = safeAnimals.filter(a => a?.category === 'Treinamento / Esporte' || a?.status === 'Em Treinamento Externo' || a?.status === 'Em Competição').length;
  const totalStallions = safeAnimals.filter(a => a?.sex === 'Garanhão').length;
  const totalMares = safeAnimals.filter(a => a?.sex === 'Égua').length;

  const totalVaccinesScheduled = safeHealth.filter(h => h?.type === 'Vacinação').length;
  const activeTreatments = safeHealth.filter(h => h?.status === 'Em Tratamento' || h?.type === 'Tratamento de Lesão').length;
  const dentalRevisionsNeeded = safeDental.length;
  const upcomingFarriery = safeFarriery.length;
  const futureCompetitions = safeCompetition.length;

  // Financial summary
  const totalSpentBrl = safeExpenses.filter(e => e?.type === 'Despesa').reduce((acc, curr) => acc + (curr?.amountBrl || 0), 0);
  const totalRevenueBrl = safeExpenses.filter(e => e?.type === 'Receita').reduce((acc, curr) => acc + (curr?.amountBrl || 0), 0);
  const netResultBrl = totalRevenueBrl - totalSpentBrl;

  // Breeding distribution
  const breedCounts: Record<string, number> = {};
  safeAnimals.forEach(a => {
    if (a?.breed) {
      breedCounts[a.breed] = (breedCounts[a.breed] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Haras Hero Header Banner - Unified Layout with Rounded Borders */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-amber-900/40">
        <div className="relative z-10 space-y-6">
          <div className="flex items-start sm:items-center gap-4 max-w-3xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0 mt-1 sm:mt-0">
              <EquinoIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Centro de Comando & Plantel Equino
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Tecnologia para gestão inteligente de equinos & Gêmeo Digital 360°. Controle completo de identificação, passaporte digital, genealogia, reprodução, nutrição, sanidade, biometria, ferrageamento, treinos e performance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full pt-4 border-t border-amber-500/10">
            <button
              onClick={() => onNavigateTab('registry')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
            >
              <span>+ Cadastrar Animal</span>
            </button>
            <button
              onClick={() => onNavigateTab('digital_twin')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gêmeo Digital 360°</span>
            </button>
            <button
              onClick={() => {
                const target = safeAnimals[0];
                if (target) onOpenPassport(target);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-700/80 hover:bg-amber-600 text-white border border-amber-500/30 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Passaporte Digital</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-4 -bottom-8 opacity-10 text-9xl font-black select-none pointer-events-none text-amber-200">
          🐎
        </div>
      </div>

      {/* Top 9 Core Dashboard KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Total Animals */}
        <div
          onClick={() => onNavigateTab('registry')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Animais</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-800 flex items-center justify-center text-base transition-colors">
              🐎
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalAnimals}</div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            {totalStallions} Garanhões • {totalMares} Éguas
          </div>
        </div>

        {/* 2. Gestantes */}
        <div
          onClick={() => onNavigateTab('reproduction')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Éguas Gestantes</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 group-hover:bg-rose-200 text-rose-700 flex items-center justify-center text-sm transition-colors">
              ❤️
            </div>
          </div>
          <div className="text-2xl font-black text-rose-950">{pregnantMares}</div>
          <div className="text-[11px] text-rose-700/80 mt-1 font-semibold">
            DG Positivo confirmado
          </div>
        </div>

        {/* 3. Potros */}
        <div
          onClick={() => onNavigateTab('reproduction')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Potros & Recria</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 flex items-center justify-center text-base transition-colors">
              🐴
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950">{foals}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Em desenvolvimento
          </div>
        </div>

        {/* 4. Treinamento */}
        <div
          onClick={() => onNavigateTab('training')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Em Treinamento</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 group-hover:bg-amber-200 text-amber-800 flex items-center justify-center text-base transition-colors">
              🏆
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950">{inTraining}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Atletas de Prova e Concurso
          </div>
        </div>

        {/* 5. Vacinas */}
        <div
          onClick={() => onNavigateTab('health')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Vacinas & Vermífugos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base">
              💉
            </div>
          </div>
          <div className="text-2xl font-black text-blue-950">{totalVaccinesScheduled}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            100% protocolo em dia
          </div>
        </div>

        {/* 6. Tratamentos */}
        <div
          onClick={() => onNavigateTab('health')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Tratamentos Clínicos</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-base">
              🩺
            </div>
          </div>
          <div className="text-2xl font-black text-purple-950">{activeTreatments}</div>
          <div className="text-[11px] text-purple-700 mt-1 font-medium">
            Acompanhamento veterinário
          </div>
        </div>

        {/* 7. Odontologia */}
        <div
          onClick={() => onNavigateTab('dental')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Odontologia</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-base">
              🦷
            </div>
          </div>
          <div className="text-2xl font-black text-teal-950">{dentalRevisionsNeeded}</div>
          <div className="text-[11px] text-teal-700 mt-1 font-medium">
            Revisões e nivelamento
          </div>
        </div>

        {/* 8. Ferrageamento */}
        <div
          onClick={() => onNavigateTab('farriery')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800">Ferrageamento</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-base">
              🔨
            </div>
          </div>
          <div className="text-2xl font-black text-orange-950">{upcomingFarriery}</div>
          <div className="text-[11px] text-orange-700 mt-1 font-medium">
            Ciclos de 30-40 dias
          </div>
        </div>

        {/* 9. Eventos / Provas */}
        <div
          onClick={() => onNavigateTab('competitions')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-yellow-500 hover:shadow-md transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-800">Eventos & Provas</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center text-base">
              📅
            </div>
          </div>
          <div className="text-2xl font-black text-yellow-950">{futureCompetitions}</div>
          <div className="text-[11px] text-yellow-700 mt-1 font-medium">
            Provas e exposições
          </div>
        </div>

        {/* 10. Balanço Financeiro */}
        <div
          onClick={() => onNavigateTab('financial')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Resultado Financeiro</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
              💰
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700">
            {netResultBrl >= 0 ? `+ R$ ${netResultBrl.toLocaleString('pt-BR')}` : `- R$ ${Math.abs(netResultBrl).toLocaleString('pt-BR')}`}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Premiações vs Custos
          </div>
        </div>
      </div>

      {/* Main Grid: Featured Horses Carousel & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Featured Horses & Digital Passport Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <span>Destaques do Plantel & Passaporte Digital</span>
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full">
                  {animals.length} cavalos
                </span>
              </h2>
              <p className="text-xs text-stone-500">Clique para abrir o Passaporte Digital oficial ou Gêmeo 360°</p>
            </div>
            <button
              onClick={() => onNavigateTab('registry')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeAnimals.slice(0, 4).map(animal => (
              <div
                key={animal.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-16/10 bg-stone-200 overflow-hidden">
                  <img
                    src={animal.photoUrl}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    {animal.breed}
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    {animal.category}
                  </div>
                </div>

                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-stone-900 text-sm group-hover:text-amber-800 transition-colors">
                      {animal.name}
                    </h3>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                      Reg: {animal.registrationNumber} • Chip: {animal.microchip.slice(-6)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-stone-100 text-[11px] text-center">
                    <div className="bg-stone-50 p-1.5 rounded-lg">
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">Peso</span>
                      <strong className="text-stone-800 font-mono">{animal.weightKg} kg</strong>
                    </div>
                    <div className="bg-stone-50 p-1.5 rounded-lg">
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">Cernelha</span>
                      <strong className="text-stone-800 font-mono">{animal.heightM} m</strong>
                    </div>
                    <div className="bg-stone-50 p-1.5 rounded-lg">
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">Escore</span>
                      <strong className="text-emerald-800 font-mono">{animal.bodyScore}/9</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenPassport(animal)}
                      className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-700" />
                      <span>Passaporte</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab('digital_twin', animal.id)}
                      className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gêmeo 360°</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Haras Status & Alert Center */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Painel de Alertas & Vencimentos</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-950">Próxima Troca de Ferrageamento</div>
                  <div className="text-amber-800 text-[11px] mt-0.5">
                    <strong>El Toro Negro</strong> e <strong>Bella Dash</strong> atingem ciclo de 35 dias em 10/09.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-950">Maternidade & Previsão de Parto</div>
                  <div className="text-rose-800 text-[11px] mt-0.5">
                    <strong>Estrela Real do Pampa</strong> com parto previsto para <strong>20/11/2026</strong>.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5">
                <Syringe className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-blue-950">Exames AIE & Mormo MAPA</div>
                  <div className="text-blue-800 text-[11px] mt-0.5">
                    Laudos vigentes para emissão de GTA e participação em eventos hípicos.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <div className="text-[11px] font-bold text-stone-600 mb-2">Ocupação das Instalações:</div>
              <div className="space-y-2 text-xs">
                {safeFacilities.slice(0, 3).map(fac => (
                  <div key={fac.id} className="flex justify-between items-center text-[11px] bg-stone-50 p-2 rounded-lg">
                    <span className="font-medium text-stone-700">{fac.name}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${fac.status === 'Ocupado' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                      {fac.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Breeds Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Distribuição por Raça no Haras
            </h3>
            <div className="space-y-2">
              {Object.entries(breedCounts).map(([breed, count]) => {
                const countNum = Number(count);
                const pct = totalAnimals > 0 ? Math.round((countNum / totalAnimals) * 100) : 0;
                return (
                  <div key={breed} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span>{breed}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-700 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
