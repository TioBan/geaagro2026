import React, { useState } from 'react';
import {
  Layers,
  Heart,
  Calendar,
  Baby,
  Activity,
  Scale,
  TrendingUp,
  Truck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineShedEnvironment,
  ProductionStage,
  SwineTab,
} from '../../types/swine';

interface SwineProductionFlowViewProps {
  animals: SwineAnimal[];
  batches: SwineBatch[];
  litters: FarrowingLitter[];
  sheds: SwineShedEnvironment[];
  onNavigate: (tab: SwineTab) => void;
}

interface StageDetail {
  id: ProductionStage;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badgeColor: string;
  animalCount: number;
  durationDays: string;
  avgWeightKg: number;
  targetWeightKg?: number;
  gmdGramsDay?: number;
  dailyFeedPerAnimalKg: number;
  mortalityPct: number;
  shedLocation: string;
  status: 'Fluxo Normal' | 'Atenção / Gargalo' | 'Excelente';
  bottleneckWarning?: string;
  keyEvents: string[];
  vitalMetrics: { label: string; value: string }[];
}

export const SwineProductionFlowView: React.FC<SwineProductionFlowViewProps> = ({
  animals,
  batches,
  litters,
  sheds,
  onNavigate,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<ProductionStage>('maternidade');

  // Compute live stage counts & metrics
  const breedingSows = animals.filter(a => a.category.includes('Vazia') || a.category.includes('Marrã') || a.status === 'Em Cobertura / IA').length;
  const pregnantSows = animals.filter(a => a.status === 'Gestante' || a.category === 'Matriz Gestante').length;
  const maternityPiglets = litters.reduce((acc, l) => acc + (l.status === 'Em Lactação' ? l.currentPigletsCount : 0), 0);
  const lactatingSows = litters.filter(l => l.status === 'Em Lactação').length;
  
  const nurseryBatch = batches.find(b => b.stage === 'creche' && b.status === 'Ativo');
  const nurseryCount = nurseryBatch ? nurseryBatch.currentAnimalsCount : 217;
  
  const growBatch = batches.find(b => b.stage === 'crescimento' && b.status === 'Ativo');
  const growCount = growBatch ? growBatch.currentAnimalsCount : 278;

  const finishBatch = batches.find(b => b.stage === 'terminacao' && b.status === 'Ativo');
  const finishCount = finishBatch ? finishBatch.currentAnimalsCount : 346;

  const stages: StageDetail[] = [
    {
      id: 'reproducao',
      title: '1. Reprodução & IA',
      subtitle: 'Detecção de cio, rufiação e inseminação',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      badgeColor: 'bg-rose-100 text-rose-800',
      animalCount: breedingSows > 0 ? breedingSows : 14,
      durationDays: '4 a 7 dias pós-desmame',
      avgWeightKg: 220,
      dailyFeedPerAnimalKg: 2.6,
      mortalityPct: 0.1,
      shedLocation: 'Galpão 02 (Setor IA)',
      status: 'Excelente',
      keyEvents: ['Rufiação diária com cachaço 2x/dia', 'Protocolo IA heterospérmica 0h/24h', 'Flushing nutricional'],
      vitalMetrics: [
        { label: 'Taxa de Concepção', value: '91.5%' },
        { label: 'Intervalo Desmame-Cio (IDC)', value: '4.8 dias' },
        { label: 'Doses por Cobertura', value: '2.4 doses' },
      ],
    },
    {
      id: 'gestacao',
      title: '2. Gestação',
      subtitle: 'Controle de escore corporal e ultrassom',
      icon: Calendar,
      color: 'from-pink-600 to-purple-600',
      badgeColor: 'bg-purple-100 text-purple-800',
      animalCount: pregnantSows > 0 ? pregnantSows : 165,
      durationDays: '114 dias (3m, 3s, 3d)',
      avgWeightKg: 240,
      dailyFeedPerAnimalKg: 2.3,
      mortalityPct: 0.3,
      shedLocation: 'Galpão 02 - Gestação Coletiva ESF',
      status: 'Fluxo Normal',
      keyEvents: ['DG Ultrassom aos 21-28 dias', 'Alimentação de precisão por curva ECC', 'Vacinação pré-parto aos 85 e 100 dias'],
      vitalMetrics: [
        { label: 'Taxa de Retenção Gestacional', value: '96.2%' },
        { label: 'ECC Médio Plantel', value: '3.1 / 5.0' },
        { label: 'Dias Médios Gestação', value: '114.5 dias' },
      ],
    },
    {
      id: 'maternidade',
      title: '3. Maternidade',
      subtitle: 'Parto assistido, colostro e lactação',
      icon: Baby,
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-100 text-amber-800',
      animalCount: maternityPiglets > 0 ? maternityPiglets : 27,
      durationDays: '21 a 28 dias',
      avgWeightKg: 1.45,
      targetWeightKg: 6.8,
      gmdGramsDay: 240,
      dailyFeedPerAnimalKg: 6.5, // Consumo da matriz em lactação
      mortalityPct: 4.8,
      shedLocation: 'Galpão 01 - Maternidade A (Piso Suspenso)',
      status: 'Excelente',
      keyEvents: ['Manejo de colostro na 1ª hora', 'Aplicação de Ferro Dextrano 200mg aos 3 dias', 'Aquecimento a 32°C no escamoteador'],
      vitalMetrics: [
        { label: 'Nascidos Vivos / Parto', value: '14.8 leitões' },
        { label: 'Peso ao Nascer', value: '1.45 kg' },
        { label: 'Peso ao Desmame (21d)', value: '6.85 kg' },
        { label: 'Uniformidade da Leitegada', value: 'CV 8.5%' },
      ],
    },
    {
      id: 'creche',
      title: '4. Creche Climatizada',
      subtitle: 'Transição pós-desmame e desenvolvimento',
      icon: Activity,
      color: 'from-indigo-500 to-blue-600',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      animalCount: nurseryCount,
      durationDays: '42 dias (3 a 9 semanas)',
      avgWeightKg: 24.5,
      targetWeightKg: 28.0,
      gmdGramsDay: 440,
      dailyFeedPerAnimalKg: 0.95,
      mortalityPct: 1.4,
      shedLocation: 'Galpão 03 - Creche Climatizada',
      status: 'Excelente',
      keyEvents: ['Ração Pré-Inicial 1 micropeletizada', 'Controle rigoroso de temperatura (27°C)', 'Vacinação Circovírus PCV2 + Mycoplasma'],
      vitalMetrics: [
        { label: 'Conversão Alimentar (CA)', value: '1.25 kg/kg' },
        { label: 'GMD Creche', value: '440 g/dia' },
        { label: 'Peso Médio Saída', value: '27.8 kg' },
      ],
    },
    {
      id: 'crescimento',
      title: '5. Crescimento & Recria',
      subtitle: 'Desenvolvimento muscular e ósseo',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      animalCount: growCount,
      durationDays: '50 dias (10 a 17 semanas)',
      avgWeightKg: 62.4,
      targetWeightKg: 70.0,
      gmdGramsDay: 880,
      dailyFeedPerAnimalKg: 2.10,
      mortalityPct: 0.7,
      shedLocation: 'Galpão 06 - Crescimento e Recria',
      status: 'Fluxo Normal',
      keyEvents: ['Transição Crescimento 1 para 2', 'Monitoramento da vazão de água (1.5 L/min)', 'Ajuste de densidade por baia (0.65 m²/suíno)'],
      vitalMetrics: [
        { label: 'Conversão Alimentar (CA)', value: '2.38 kg/kg' },
        { label: 'GMD Crescimento', value: '880 g/dia' },
        { label: 'Custo Ração/Animal/Dia', value: 'R$ 3.20' },
      ],
    },
    {
      id: 'terminacao',
      title: '6. Terminação',
      subtitle: 'Engorda final e deposição de carne magra',
      icon: Scale,
      color: 'from-teal-600 to-emerald-700',
      badgeColor: 'bg-teal-100 text-teal-800',
      animalCount: finishCount,
      durationDays: '45 dias (18 a 24 semanas)',
      avgWeightKg: 114.2,
      targetWeightKg: 125.0,
      gmdGramsDay: 960,
      dailyFeedPerAnimalKg: 2.85,
      mortalityPct: 0.5,
      shedLocation: 'Galpão 05 - Terminação Turbo',
      status: 'Fluxo Normal',
      keyEvents: ['Ração Terminação sem antibióticos', 'Controle estrito de carência de medicamentos (Zero)', 'Pesagem por amostragem semanal'],
      vitalMetrics: [
        { label: 'Conversão Alimentar (CA)', value: '2.65 kg/kg' },
        { label: 'GMD Terminação', value: '960 g/dia' },
        { label: 'Espessura Toucinho P2', value: '11.5 mm' },
      ],
    },
    {
      id: 'comercializacao',
      title: '7. Comercialização & Abate',
      subtitle: 'Pesagem final, jejum e emissão de GTA',
      icon: Truck,
      color: 'from-amber-600 to-yellow-600',
      badgeColor: 'bg-amber-100 text-amber-800',
      animalCount: 346,
      durationDays: 'Embarque em 10 dias',
      avgWeightKg: 125.0,
      dailyFeedPerAnimalKg: 0, // Jejum pré-abate 12h
      mortalityPct: 0.05,
      shedLocation: 'Galpão 05 / Plataforma de Embarque',
      status: 'Excelente',
      keyEvents: ['Jejum hídrico/alimentar de 12 horas', 'Checklist de bem-estar e rampa antiderrapante', 'Emissão da Guia de Trânsito Animal (GTA)'],
      vitalMetrics: [
        { label: 'Rendimento de Carcaça', value: '74.5%' },
        { label: 'Carne Magra na Carcaça', value: '59.8%' },
        { label: 'Preço Estimado Vivo', value: 'R$ 7.40 / kg' },
      ],
    },
  ];

  const currentStage = (stages || []).find(s => s?.id === selectedStageId) || stages?.[2] || stages?.[0] || null;

  return (
    <div className="space-y-6">
      {/* Header & Pipeline Concept */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diferencial Exclusivo GeaAgro</span>
            </div>
            <h2 className="text-xl font-black text-gray-900">
              Painel de Fluxo Contínuo da Produção Suinícola
            </h2>
            <p className="text-xs text-gray-500 max-w-3xl">
              Acompanhe a transição dos animais ao longo de todas as 7 etapas do ciclo biológico e produtivo.
              Identifique gargalos de lotação, atrasos de crescimento e desvios de conversão alimentar em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">Tempo Total do Ciclo:</span>
            <span className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold">
              ~ 165 a 175 dias
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Pipeline Steps Navigation */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isSelected = selectedStageId === stg.id;
            return (
              <React.Fragment key={stg.id}>
                <button
                  onClick={() => setSelectedStageId(stg.id)}
                  className={`p-3.5 rounded-xl text-left transition-all flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-600/20 scale-[1.02]'
                      : 'bg-gray-50/80 hover:bg-gray-100 text-gray-800 border-gray-200/80'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold block uppercase tracking-wider ${isSelected ? 'text-pink-100' : 'text-gray-500'}`}>
                      Fase 0{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold truncate max-w-[120px]">{stg.title.split('. ')[1]}</h4>
                    <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-pink-600'}`}>
                      {stg.animalCount} animais
                    </span>
                  </div>
                </button>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed Stage Deep Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stage Summary & Metrics */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-pink-600/20">
                <currentStage.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">{currentStage.title}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${currentStage.badgeColor}`}>
                    {currentStage.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{currentStage.subtitle}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-gray-500 block">População Atual</span>
              <span className="text-2xl font-black text-pink-600">{currentStage.animalCount} animais</span>
            </div>
          </div>

          {/* KPI Metrics Grid for Selected Stage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium block">Duração Típica</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">{currentStage.durationDays}</span>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium block">Peso Médio Atual</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">{currentStage.avgWeightKg} kg</span>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium block">Ração / Animal / Dia</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">{currentStage.dailyFeedPerAnimalKg} kg/dia</span>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium block">Mortalidade Fase</span>
              <span className="text-sm font-bold text-emerald-600 mt-0.5 block">{currentStage.mortalityPct}%</span>
            </div>
          </div>

          {/* Vital Indicators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-600" />
              <span>Indicadores Zootécnicos da Fase</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStage.vitalMetrics.map((met, i) => (
                <div key={i} className="p-3 bg-pink-50/40 rounded-xl border border-pink-100/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{met.label}</span>
                  <span className="text-xs font-black text-pink-900">{met.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Protocols & Key Events */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Protocolos & Manejos Críticos em Execução</span>
            </h4>
            <div className="space-y-2">
              {currentStage.keyEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{evt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Location, Ambience & Bottleneck Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Diagnóstico de Capacidade & Gargalos</span>
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Avaliação preditiva de fluxo entre fases para evitar superlotação ou ociosidade.
            </p>
          </div>

          {/* Status Box */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Capacidade Balanceada</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              O fluxo de entrada e saída no {currentStage.shedLocation} está sincronizado com a taxa de parto de 2.4 partos/semana.
            </p>
          </div>

          {/* Location & Shed Twin Info */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2.5 text-xs text-gray-700">
            <span className="font-bold text-gray-900 block">Instalação Vinculada:</span>
            <div className="flex justify-between">
              <span>Localização:</span>
              <span className="font-bold text-gray-900">{currentStage.shedLocation}</span>
            </div>
            <div className="flex justify-between">
              <span>Climatização:</span>
              <span className="font-bold text-emerald-600">Pressão Negativa / Túnel</span>
            </div>
            <div className="flex justify-between">
              <span>Temperatura Alvo:</span>
              <span className="font-bold text-gray-900">
                {selectedStageId === 'creche' ? '27.0°C' : selectedStageId === 'maternidade' ? '22.0°C (32°C leitão)' : '20.0°C'}
              </span>
            </div>
          </div>

          {/* Quick jump to dedicated subtab */}
          <button
            onClick={() => {
              if (selectedStageId === 'reproducao' || selectedStageId === 'gestacao') onNavigate('reproduction');
              else if (selectedStageId === 'maternidade') onNavigate('maternity');
              else if (selectedStageId === 'creche') onNavigate('nursery');
              else if (selectedStageId === 'crescimento' || selectedStageId === 'terminacao') onNavigate('grow_finish');
              else onNavigate('reports');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span>Gerenciar {currentStage.title.split('. ')[1]} Detalhadamente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
