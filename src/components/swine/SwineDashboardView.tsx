import React from 'react';
import {
  Users,
  Activity,
  Heart,
  Baby,
  TrendingUp,
  Scale,
  ShieldAlert,
  AlertTriangle,
  Award,
  ArrowRight,
  Sparkles,
  Layers,
  Thermometer,
  Boxes,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineShedEnvironment,
  SwineFeedInventoryItem,
  SwineBiosecurityLog,
  SwineTab,
} from '../../types/swine';
import {
  calculateSwineExecutiveKPIs,
  calculateSwineIES,
} from '../../utils/swineStorage';

interface SwineDashboardViewProps {
  animals?: SwineAnimal[];
  batches?: SwineBatch[];
  litters?: FarrowingLitter[];
  sheds?: SwineShedEnvironment[];
  inventory?: SwineFeedInventoryItem[];
  biosecurity?: SwineBiosecurityLog[];
  onNavigate: (tab: SwineTab) => void;
  farmName?: string;
}

export const SwineDashboardView: React.FC<SwineDashboardViewProps> = ({
  animals = [],
  batches = [],
  litters = [],
  sheds = [],
  inventory = [],
  biosecurity = [],
  onNavigate,
  farmName = 'Granja Suinícola Modelo',
}) => {
  const kpis = calculateSwineExecutiveKPIs(animals, batches, litters, inventory, sheds);
  const ies = calculateSwineIES(kpis, sheds, biosecurity);

  return (
    <div className="space-y-6">
      {/* Top Banner with Farm Name & IES Score */}
      <div className="bg-gradient-to-r from-pink-900 via-rose-900 to-amber-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/20 text-pink-200 rounded-full text-xs font-semibold border border-pink-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suinocultura de Precisão</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{farmName}</h1>
            <p className="text-pink-100/80 text-sm max-w-2xl leading-relaxed">
              Gestão zootécnica de alta performance com Gêmeo Digital, controle sanitário estrito,
              rastreabilidade total e índice proprietário GeaAgro IES.
            </p>
          </div>

          {/* IES Card Banner */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-5 shrink-0">
            <div className="text-center">
              <span className="text-xs font-semibold text-pink-200 block uppercase tracking-wider">
                Índice IES GeaAgro
              </span>
              <div className="text-4xl font-black text-amber-300 mt-0.5">{ies.totalScore}</div>
              <span className="text-[11px] font-bold text-emerald-300 block mt-0.5">
                {ies.classification}
              </span>
            </div>
            <div className="h-12 w-[1px] bg-white/20" />
            <div className="space-y-1.5 text-xs text-pink-100">
              <div className="flex items-center justify-between gap-3">
                <span className="text-pink-200/70">CA Rebanho:</span>
                <span className="font-bold text-white">{kpis.avgFeedConversionRatio} kg/kg</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-pink-200/70">GMD Médio:</span>
                <span className="font-bold text-white">{kpis.avgDailyGainG} g/dia</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-pink-200/70">Desmam./Matriz/Ano:</span>
                <span className="font-bold text-white">{kpis.weanedPerSowYear} DPA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Flow Quick Action Banner (Innovative Feature Highlight) */}
      <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-pink-50/50 via-white to-rose-50/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-600/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Painel de Fluxo da Produção & Gargalos
            </h3>
            <p className="text-xs text-gray-500">
              Visualize em tempo real o ciclo completo: Reprodução → Gestação → Maternidade → Creche
              → Crescimento → Terminação → Abate.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('flow_pipeline')}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <span>Abrir Fluxo Produtivo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Executive Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Animals */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total do Rebanho</span>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{kpis.totalAnimals}</div>
          <span className="text-[11px] font-medium text-gray-500">animais na granja</span>
        </div>

        {/* Active Sows */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Matrizes Ativas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{kpis.activeSows}</div>
          <span className="text-[11px] font-medium text-gray-500">reprodutoras plantel</span>
        </div>

        {/* Maternity Piglets */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Maternidade</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{kpis.maternityPiglets}</div>
          <span className="text-[11px] font-medium text-gray-500">leitões lactantes</span>
        </div>

        {/* Nursery */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Creche</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">{kpis.nurseryPiglets}</div>
          <span className="text-[11px] font-medium text-gray-500">desmamados</span>
        </div>

        {/* Grow & Finish */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Cresc. / Terminação</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {kpis.growingPigs + kpis.finishingPigs}
          </div>
          <span className="text-[11px] font-medium text-gray-500">
            {kpis.growingPigs} cresc. • {kpis.finishingPigs} term.
          </span>
        </div>

        {/* Overall Mortality */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Mortalidade Geral</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">{kpis.overallMortalityPct}%</div>
          <span className="text-[11px] font-medium text-emerald-600">
            meta &lt; 3.0% (controlado)
          </span>
        </div>
      </div>

      {/* Main Grid: Sector Occupancy, Reproductive Indicators & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reproductive Performance Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Desempenho Reprodutivo
              </h2>
            </div>
            <button
              onClick={() => onNavigate('reproduction')}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>Detalhes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <span className="text-[11px] text-gray-600 font-medium block">Taxa de Concepção</span>
              <span className="text-xl font-black text-rose-700">{kpis.conceptionRatePct}%</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Meta: &gt; 90%</span>
            </div>

            <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
              <span className="text-[11px] text-gray-600 font-medium block">Taxa de Parto</span>
              <span className="text-xl font-black text-pink-700">{kpis.farrowingRatePct}%</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Meta: &gt; 88%</span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-[11px] text-gray-600 font-medium block">Desmamados / Matriz</span>
              <span className="text-xl font-black text-amber-700">{kpis.weanedPerSowYear}</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">DPA (leitões/ano)</span>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-[11px] text-gray-600 font-medium block">Taxa de Reposição</span>
              <span className="text-xl font-black text-indigo-700">{kpis.replacementRatePct}%</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Marrãs / ano</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Cachaços Ativos:</span>
              <span className="font-bold text-gray-800">{kpis.activeBoars} machos</span>
            </div>
            <div className="flex justify-between">
              <span>Leitões Vivos/Parto (Méd.):</span>
              <span className="font-bold text-emerald-600">14.8 leitões</span>
            </div>
            <div className="flex justify-between">
              <span>Intervalo Desmame-Cio (IDC):</span>
              <span className="font-bold text-gray-800">4.8 dias</span>
            </div>
          </div>
        </div>

        {/* Facilities & Ambience Live Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-pink-600" />
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Gêmeo da Instalação & Clima
              </h2>
            </div>
            <button
              onClick={() => onNavigate('environment')}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>Galpões</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {sheds.map(shed => (
              <div
                key={shed.id}
                className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-800">{shed.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span>
                      {shed.currentOccupancy} / {shed.capacityAnimals} animais
                    </span>
                    <span>•</span>
                    <span>{shed.temperatureC}°C</span>
                    <span>•</span>
                    <span>{shed.ammoniaNhpPpm} ppm NH₃</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    shed.comfortStatus === 'Conforto Ótimo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {shed.comfortStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sanity & Critical Alerts Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Sanidade & Biosseguridade
              </h2>
            </div>
            <button
              onClick={() => onNavigate('health')}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>Sanidade</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Status Item: Withdrawal Periods */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Carência para Abate: 100% Liberado
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Nenhum animal em lote de terminação com período de carência ativo.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Item: Stock Alerts */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                kpis.criticalStockAlerts > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold">Estoque & Insumos</h4>
                <p className="text-[11px] text-gray-600">
                  {kpis.criticalStockAlerts > 0
                    ? `${kpis.criticalStockAlerts} itens atingiram o estoque mínimo.`
                    : 'Níveis de ração e medicamentos regulares.'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-bold text-pink-600 underline shrink-0"
              >
                Ver Estoque
              </button>
            </div>

            {/* Status Item: Biosecurity Vazio */}
            <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
              <h4 className="text-xs font-bold text-pink-950">
                Biosseguridade: Barreira Ativa (72h)
              </h4>
              <p className="text-[11px] text-pink-800/80 mt-0.5">
                Arco de desinfecção operando, controle de roedores em dia e registro de visitantes
                conforme protocolo MAPA.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { id: 'flow_pipeline' as SwineTab, label: 'Fluxo Produtivo', icon: Layers, color: 'text-pink-600 bg-pink-50' },
          { id: 'animals' as SwineTab, label: 'Plantel & Animais', icon: Users, color: 'text-rose-600 bg-rose-50' },
          { id: 'digital_twin' as SwineTab, label: 'Gêmeo Digital', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
          { id: 'maternity' as SwineTab, label: 'Maternidade', icon: Baby, color: 'text-amber-600 bg-amber-50' },
          { id: 'nutrition' as SwineTab, label: 'Nutrição & Ração', icon: Boxes, color: 'text-emerald-600 bg-emerald-50' },
          { id: 'diseases_lib' as SwineTab, label: 'Guia de Doenças', icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
          { id: 'ies_score' as SwineTab, label: 'Score IES', icon: Award, color: 'text-blue-600 bg-blue-50' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="p-3.5 bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:border-pink-300 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
