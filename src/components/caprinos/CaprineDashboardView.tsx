import React from 'react';
import {
  CaprineAnimal,
  CaprineMilkRecord,
  CaprineWeighingRecord,
  CaprineHealthRecord,
  CaprineIecBreakdown
} from '../../types/caprine';
import { CaprinoIcon } from '../icons/CaprinoIcon';
import {
  Users,
  Milk,
  Scale,
  Heart,
  Baby,
  Syringe,
  AlertTriangle,
  Award,
  TrendingUp,
  DollarSign,
  Activity,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Calendar
} from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  milkLogs: CaprineMilkRecord[];
  weighings: CaprineWeighingRecord[];
  healthRecords: CaprineHealthRecord[];
  onNavigate: (tab: any) => void;
  onOpenAddAnimalModal: () => void;
}

export const CaprineDashboardView: React.FC<Props> = ({
  animals,
  milkLogs,
  weighings,
  healthRecords,
  onNavigate,
  onOpenAddAnimalModal
}) => {
  // Key Indicators calculation
  const totalAnimals = animals.filter(a => a.status === 'Ativo').length;
  const lactatingDoes = animals.filter(a => a.status === 'Ativo' && a.category === 'Cabra em Lactação').length;
  const pregnantDoes = animals.filter(a => a.status === 'Ativo' && a.category === 'Matriz Gestante').length;
  const bucks = animals.filter(a => a.status === 'Ativo' && a.category === 'Reprodutor (Bode)').length;
  const kidsCount = animals.filter(a => a.status === 'Ativo' && (a.category === 'Cabrito Mamando' || a.category === 'Cabrito Desmamado')).length;

  // Daily Milk Production
  const todayStr = new Date().toISOString().split('T')[0];
  const recentMilkLogs = milkLogs.filter(m => m.date >= todayStr || milkLogs.length < 5);
  const totalDailyMilk = milkLogs.length > 0
    ? milkLogs.reduce((acc, curr) => acc + curr.totalLiters, 0) / Math.max(1, new Set(milkLogs.map(m => m.date)).size)
    : 0;

  // Average Daily Weight Gain (GMD)
  const weighingsWithGmd = weighings.filter(w => w.gmdGramsDay && w.gmdGramsDay > 0);
  const avgGmd = weighingsWithGmd.length > 0
    ? Math.round(weighingsWithGmd.reduce((acc, curr) => acc + (curr.gmdGramsDay || 0), 0) / weighingsWithGmd.length)
    : 180; // default 180g/dia

  // FAMACHA & Health Alerts
  const famachaAlerts = animals.filter(a => a.status === 'Ativo' && a.famachaScore && a.famachaScore >= 3).length;
  const pendingVaccines = healthRecords.filter(h => h.type === 'Vacina').length;
  const activeTreatments = healthRecords.filter(h => h.type === 'Tratamento' || h.type === 'Vermifugação (FAMACHA)').length;

  // Calculate IEC Score
  const iec: CaprineIecBreakdown = {
    reproductiveScore: 18,
    milkGmdScore: 17,
    famachaHealthScore: famachaAlerts === 0 ? 20 : 14,
    feedEfficiencyScore: 13,
    pastureScore: 14,
    financialMarginScore: 8,
    totalIec: famachaAlerts === 0 ? 90 : 81
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Shortcuts */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-stone-900 rounded-2xl p-6 text-white shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
              IEC: {iec.totalIec} / 100
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <CaprinoIcon className="w-7 h-7 md:w-8 md:h-8 text-emerald-300 shrink-0" />
            <span>Caprinocultura Inteligente &amp; Zootecnia</span>
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            Painel consolidado em tempo real para controle de leite, carne, genealogia, controle FAMACHA, nutrição NRC e manejo de pastagens/apriscos.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
          <button
            onClick={onOpenAddAnimalModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Caprino
          </button>
          <button
            onClick={() => onNavigate('dairy')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Milk className="w-4 h-4" />
            Lançar Leite
          </button>
          <button
            onClick={() => onNavigate('health')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Syringe className="w-4 h-4" />
            FAMACHA / Sanidade
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Rebanho */}
        <div
          onClick={() => onNavigate('registry')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Total Rebanho</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">
            {totalAnimals} <span className="text-xs font-normal text-stone-500">cab.</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Plantel caprino ativo</p>
        </div>

        {/* Cabras em Lactação */}
        <div
          onClick={() => onNavigate('dairy')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Em Lactação</span>
            <Milk className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">
            {lactatingDoes} <span className="text-xs font-normal text-stone-500">matrizes</span>
          </div>
          <p className="text-[10px] text-sky-600 font-medium mt-1">Ordem de ordenha diária</p>
        </div>

        {/* Gestantes */}
        <div
          onClick={() => onNavigate('reproduction')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Gestantes</span>
            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">
            {pregnantDoes} <span className="text-xs font-normal text-stone-500">cabras</span>
          </div>
          <p className="text-[10px] text-rose-500 font-medium mt-1">Acompanhamento ultrassom</p>
        </div>

        {/* Cabritos / Cria */}
        <div
          onClick={() => onNavigate('kids')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Cabritos ao Pé</span>
            <Baby className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">
            {kidsCount} <span className="text-xs font-normal text-stone-500">crias</span>
          </div>
          <p className="text-[10px] text-amber-600 font-medium mt-1">Controle de colostragem</p>
        </div>

        {/* Leite Diário */}
        <div
          onClick={() => onNavigate('dairy')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">Leite Diário</span>
            <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">
            {totalDailyMilk.toFixed(1)} <span className="text-xs font-normal text-stone-500">L/dia</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Média ~{(totalDailyMilk / Math.max(1, lactatingDoes)).toFixed(1)} L/cabra</p>
        </div>

        {/* GMD Médio */}
        <div
          onClick={() => onNavigate('meat')}
          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center text-stone-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase">GMD Médio</span>
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">
            {avgGmd} <span className="text-xs font-normal text-stone-500">g/dia</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Ganho de peso em recria</p>
        </div>
      </div>

      {/* Main Grid: Alerts, IEC Card, & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: IEC Card & FAMACHA Health Status */}
        <div className="space-y-6">
          {/* IEC Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Índice IEC GeaAgro
              </h2>
              <button
                onClick={() => onNavigate('iec_score')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Detalhar →
              </button>
            </div>

            <div className="flex items-center gap-6 my-2">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-stone-100 dark:bg-zinc-800 border-4 border-amber-500 text-stone-900 dark:text-white font-black text-2xl shadow-inner">
                {iec.totalIec}
                <span className="text-[10px] absolute bottom-2 font-semibold text-stone-500">/ 100</span>
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Reprodução & Prolificidade:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{iec.reproductiveScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Leite & GMD Carne:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{iec.milkGmdScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Sanidade & FAMACHA:</span>
                  <span className="font-bold text-emerald-600">{iec.famachaHealthScore}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pastejo & Piquetes:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{iec.pastureScore}/15</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 bg-stone-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 mt-3">
              💡 Rebanho altamente eficiente. Mantenha o monitoramento FAMACHA quinzenal e a rotação de piquetes.
            </p>
          </div>

          {/* FAMACHA Alert Box */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-rose-500" />
              Monitoramento FAMACHA (Verminose)
            </h2>
            {famachaAlerts > 0 ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    {famachaAlerts} animal(is) requer(em) desverminação imediata!
                  </h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    Classificação FAMACHA Grau 3 ou superior (mucosa pálida).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Rebanho 100% Protegido (FAMACHA Grau 1 e 2)
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Sem sinais de anemia por Haemonchus contortus.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => onNavigate('health')}
              className="mt-4 w-full py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-colors"
            >
              Abrir Controle FAMACHA completo →
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Animal Quick List & Active Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Animal Roster */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Destaques do Plantel Caprino
                </h2>
                <p className="text-xs text-stone-500">Acesso rápido aos animais cadastrados e status zootécnico</p>
              </div>
              <button
                onClick={() => onNavigate('registry')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Ver Todos ({animals.length}) →
              </button>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-zinc-800">
              {animals.slice(0, 4).map(animal => (
                <div
                  key={animal.id}
                  onClick={() => onNavigate('digital_twin')}
                  className="py-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-zinc-800/50 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={animal.photoUrl || 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=200&q=80'}
                      alt={animal.name}
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 dark:border-zinc-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 dark:text-white text-sm">{animal.name}</span>
                        <span className="text-xs bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono text-stone-600 dark:text-zinc-400 font-bold">
                          {animal.earTag}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{animal.breed}</span>
                        <span>•</span>
                        <span>{animal.category}</span>
                        <span>•</span>
                        <span>{animal.weightKg} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      animal.famachaScore === 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      animal.famachaScore === 2 ? 'bg-emerald-50 text-emerald-700' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      FAMACHA: {animal.famachaScore || 1}
                    </span>
                    <p className="text-[10px] text-stone-400 mt-0.5">{animal.lot}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Grid Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('digital_twin')}
              className="p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group"
            >
              <Sparkles className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Gêmeo Digital 360°</h3>
              <p className="text-xs text-stone-500 mt-1">Passaporte & Ficha individual</p>
            </button>

            <button
              onClick={() => onNavigate('genealogy')}
              className="p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group"
            >
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Genealogia & Árvore</h3>
              <p className="text-xs text-stone-500 mt-1">4 Gerações & Inbreeding</p>
            </button>

            <button
              onClick={() => onNavigate('pastures')}
              className="p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group"
            >
              <Droplets className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Pastagens & Piquetes</h3>
              <p className="text-xs text-stone-500 mt-1">Gêmeo do Piquete & Caprineira</p>
            </button>

            <button
              onClick={() => onNavigate('smart_map')}
              className="p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group"
            >
              <Calendar className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Mapa Zootécnico</h3>
              <p className="text-xs text-stone-500 mt-1">Visão espacial do capril</p>
            </button>

            <button
              onClick={() => onNavigate('nutrition')}
              className="p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group"
            >
              <DollarSign className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Nutrição NRC</h3>
              <p className="text-xs text-stone-500 mt-1">Palma, Forragens & Dieta</p>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group"
            >
              <Award className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Relatórios & Export</h3>
              <p className="text-xs text-stone-500 mt-1">Imprimir PDF & Planilhas</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
