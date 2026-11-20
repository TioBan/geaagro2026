import React, { useMemo, useState } from 'react';
import {
  Heart,
  Calendar,
  Baby,
  Activity,
  Scale,
  TrendingUp,
  Truck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
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
import {
  SWINE_CARD_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
} from './swineUi';

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
  shortTitle: string;
  subtitle: string;
  icon: React.ElementType;
  animalCount: number;
  durationDays: string;
  avgWeightLabel: string;
  feedRefLabel: string;
  mortalityLabel: string;
  shedLocation: string;
  targetTempLabel: string;
  hasLiveData: boolean;
  keyEvents: string[];
  vitalMetrics: { label: string; value: string }[];
  targetTab: SwineTab;
}

export const SwineProductionFlowView: React.FC<SwineProductionFlowViewProps> = ({
  animals,
  batches,
  litters,
  sheds,
  onNavigate,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<ProductionStage>('maternidade');

  const stages = useMemo<StageDetail[]>(() => {
    const breedingSows = animals.filter(
      a =>
        a.category.includes('Vazia') ||
        a.category.includes('Marrã') ||
        a.status === 'Em Cobertura / IA'
    );
    const pregnantSows = animals.filter(
      a => a.status === 'Gestante' || a.category === 'Matriz Gestante'
    );
    const lactatingLitters = litters.filter(l => l.status === 'Em Lactação');
    const maternityPiglets = lactatingLitters.reduce((acc, l) => acc + l.currentPigletsCount, 0);

    const nurseryBatches = batches.filter(b => b.stage === 'creche' && b.status === 'Ativo');
    const nurseryCount = nurseryBatches.reduce((acc, b) => acc + b.currentAnimalsCount, 0);

    const growBatches = batches.filter(b => b.stage === 'crescimento' && b.status === 'Ativo');
    const growCount = growBatches.reduce((acc, b) => acc + b.currentAnimalsCount, 0);

    const finishBatches = batches.filter(b => b.stage === 'terminacao' && b.status === 'Ativo');
    const finishCount = finishBatches.reduce((acc, b) => acc + b.currentAnimalsCount, 0);

    const readyBatches = batches.filter(
      b => b.status === 'Embarcado para Abate' || (b.stage === 'terminacao' && b.currentAvgWeightKg >= b.targetWeightKg)
    );
    const readyCount = readyBatches.reduce((acc, b) => acc + b.currentAnimalsCount, 0);

    const avgWeightOf = (list: SwineBatch[]) => {
      if (list.length === 0) return '—';
      const avg = list.reduce((acc, b) => acc + b.currentAvgWeightKg, 0) / list.length;
      return `${avg.toFixed(1)} kg`;
    };

    const avgMortOf = (list: SwineBatch[]) => {
      const init = list.reduce((acc, b) => acc + b.initialAnimalsCount, 0);
      if (init === 0) return '—';
      const dead = list.reduce((acc, b) => acc + b.mortalityCount, 0);
      return `${((dead / init) * 100).toFixed(1)}%`;
    };

    const avgCaOf = (list: SwineBatch[]) => {
      if (list.length === 0) return '—';
      const avg = list.reduce((acc, b) => acc + b.feedConversionRatio, 0) / list.length;
      return `${avg.toFixed(2)} kg/kg`;
    };

    const avgGmdOf = (list: SwineBatch[]) => {
      if (list.length === 0) return '—';
      const avg = list.reduce((acc, b) => acc + b.averageDailyGainG, 0) / list.length;
      return `${Math.round(avg)} g/dia`;
    };

    const shedFor = (stage: ProductionStage, fallback: string) =>
      sheds.find(s => s.phase === stage)?.name ?? fallback;

    const avgLitterBornAlive =
      lactatingLitters.length > 0
        ? (
            lactatingLitters.reduce((acc, l) => acc + l.bornAlive, 0) / lactatingLitters.length
          ).toFixed(1)
        : '—';

    const avgLitterBirthWeight =
      lactatingLitters.length > 0
        ? `${(
            lactatingLitters.reduce((acc, l) => acc + l.avgBirthWeightKg, 0) /
            lactatingLitters.length
          ).toFixed(2)} kg`
        : '—';

    const matMortPct = (() => {
      const born = litters.reduce((acc, l) => acc + l.bornAlive, 0);
      if (born === 0) return '—';
      const dead = litters.reduce((acc, l) => acc + l.preWeaningMortalityCount, 0);
      return `${((dead / born) * 100).toFixed(1)}%`;
    })();

    const avgPregnantEcc =
      pregnantSows.length > 0
        ? `${(
            pregnantSows.reduce((acc, s) => acc + s.bodyConditionScore, 0) / pregnantSows.length
          ).toFixed(1)} / 5`
        : '—';

    return [
      {
        id: 'reproducao',
        title: '1. Reprodução & IA',
        shortTitle: 'Reprodução',
        subtitle: 'Detecção de cio, rufiação e inseminação artificial',
        icon: Heart,
        animalCount: breedingSows.length,
        durationDays: '4 a 7 dias pós-desmame',
        avgWeightLabel:
          breedingSows.length > 0
            ? `${Math.round(
                breedingSows.reduce((a, s) => a + s.currentWeightKg, 0) / breedingSows.length
              )} kg`
            : '—',
        feedRefLabel: '2,6 kg/dia (ref.)',
        mortalityLabel: 'Meta < 0,5%',
        shedLocation: shedFor('reproducao', 'Setor de Cobertura / IA'),
        targetTempLabel: '18°C a 22°C',
        hasLiveData: breedingSows.length > 0,
        keyEvents: [
          'Rufiação diária com cachaço 2x/dia',
          'Protocolo IA heterospérmica 0h / 24h',
          'Flushing nutricional pré-cobertura',
        ],
        vitalMetrics: [
          { label: 'Fêmeas em cobertura / marrãs', value: `${breedingSows.length}` },
          { label: 'Meta Taxa de Concepção', value: '> 90%' },
          { label: 'Meta IDC (Desmame-Cio)', value: '4 a 6 dias' },
        ],
        targetTab: 'reproduction',
      },
      {
        id: 'gestacao',
        title: '2. Gestação',
        shortTitle: 'Gestação',
        subtitle: 'Controle de escore corporal (ECC) e ultrassom',
        icon: Calendar,
        animalCount: pregnantSows.length,
        durationDays: '114 dias (3m 3s 3d)',
        avgWeightLabel:
          pregnantSows.length > 0
            ? `${Math.round(
                pregnantSows.reduce((a, s) => a + s.currentWeightKg, 0) / pregnantSows.length
              )} kg`
            : '—',
        feedRefLabel: '2,2 a 2,5 kg/dia (ref.)',
        mortalityLabel: 'Meta < 1,0%',
        shedLocation: shedFor('gestacao', 'Galpão de Gestação'),
        targetTempLabel: '18°C a 22°C',
        hasLiveData: pregnantSows.length > 0,
        keyEvents: [
          'Diagnóstico de gestação (DG) aos 21–28 dias',
          'Ajuste de curva alimentar conforme escore ECC',
          'Vacinação pré-parto aos 85 e 100 dias',
        ],
        vitalMetrics: [
          { label: 'Matrizes gestantes ativas', value: `${pregnantSows.length}` },
          { label: 'ECC médio gestação', value: avgPregnantEcc },
          { label: 'Meta retenção gestacional', value: '> 95%' },
        ],
        targetTab: 'reproduction',
      },
      {
        id: 'maternidade',
        title: '3. Maternidade',
        shortTitle: 'Maternidade',
        subtitle: 'Parto assistido, colostro e lactação',
        icon: Baby,
        animalCount: maternityPiglets,
        durationDays: '21 a 28 dias',
        avgWeightLabel: avgLitterBirthWeight,
        feedRefLabel: '6,5 kg/dia matriz (ref.)',
        mortalityLabel: matMortPct,
        shedLocation: shedFor('maternidade', 'Setor de Maternidade'),
        targetTempLabel: '22°C sala / 32°C escamoteador',
        hasLiveData: lactatingLitters.length > 0,
        keyEvents: [
          'Ingestão de colostro monitorada na 1ª hora de vida',
          'Ferro Dextrano 200 mg até o 3º dia de vida',
          'Aquecimento no escamoteador entre 30°C e 32°C',
        ],
        vitalMetrics: [
          { label: 'Leitegadas em lactação', value: `${lactatingLitters.length}` },
          { label: 'Média nascidos vivos', value: avgLitterBornAlive },
          { label: 'Peso médio ao nascer', value: avgLitterBirthWeight },
          { label: 'Mortalidade pré-desmame', value: matMortPct },
        ],
        targetTab: 'maternity',
      },
      {
        id: 'creche',
        title: '4. Creche Climatizada',
        shortTitle: 'Creche',
        subtitle: 'Transição pós-desmame e adaptação alimentar',
        icon: Activity,
        animalCount: nurseryCount,
        durationDays: '42 dias (3 a 9 semanas)',
        avgWeightLabel: avgWeightOf(nurseryBatches),
        feedRefLabel: '0,8 a 1,1 kg/dia (ref.)',
        mortalityLabel: avgMortOf(nurseryBatches),
        shedLocation: shedFor('creche', 'Galpão de Creche'),
        targetTempLabel: '26°C a 28°C',
        hasLiveData: nurseryBatches.length > 0,
        keyEvents: [
          'Ração Pré-Inicial micropeletizada na entrada',
          'Controle de temperatura e ausência de correntes de ar',
          'Vacinação PCV2 e Mycoplasma conforme calendário',
        ],
        vitalMetrics: [
          { label: 'Lotes ativos na creche', value: `${nurseryBatches.length}` },
          { label: 'Conversão Alimentar (CA)', value: avgCaOf(nurseryBatches) },
          { label: 'GMD médio creche', value: avgGmdOf(nurseryBatches) },
        ],
        targetTab: 'nursery',
      },
      {
        id: 'crescimento',
        title: '5. Crescimento & Recria',
        shortTitle: 'Crescimento',
        subtitle: 'Desenvolvimento muscular e ganho de estrutura',
        icon: TrendingUp,
        animalCount: growCount,
        durationDays: '50 dias (10 a 17 semanas)',
        avgWeightLabel: avgWeightOf(growBatches),
        feedRefLabel: '2,0 a 2,3 kg/dia (ref.)',
        mortalityLabel: avgMortOf(growBatches),
        shedLocation: shedFor('crescimento', 'Galpão de Crescimento'),
        targetTempLabel: '20°C a 23°C',
        hasLiveData: growBatches.length > 0,
        keyEvents: [
          'Transição nutricional Crescimento 1 → 2',
          'Checagem de vazão de bebedouros (1,5 L/min)',
          'Densidade recomendada ~ 0,65 m²/animal',
        ],
        vitalMetrics: [
          { label: 'Lotes em crescimento', value: `${growBatches.length}` },
          { label: 'Conversão Alimentar (CA)', value: avgCaOf(growBatches) },
          { label: 'GMD médio crescimento', value: avgGmdOf(growBatches) },
        ],
        targetTab: 'grow_finish',
      },
      {
        id: 'terminacao',
        title: '6. Terminação',
        shortTitle: 'Terminação',
        subtitle: 'Engorda final e deposição de carne magra',
        icon: Scale,
        animalCount: finishCount,
        durationDays: '45 dias (18 a 24 semanas)',
        avgWeightLabel: avgWeightOf(finishBatches),
        feedRefLabel: '2,7 a 3,0 kg/dia (ref.)',
        mortalityLabel: avgMortOf(finishBatches),
        shedLocation: shedFor('terminacao', 'Galpão de Terminação'),
        targetTempLabel: '18°C a 21°C',
        hasLiveData: finishBatches.length > 0,
        keyEvents: [
          'Ração de terminação respeitando carência zero',
          'Pesagem amostral para uniformidade de lote',
          'Controle de ventilação e amônia < 15 ppm',
        ],
        vitalMetrics: [
          { label: 'Lotes em terminação', value: `${finishBatches.length}` },
          { label: 'Conversão Alimentar (CA)', value: avgCaOf(finishBatches) },
          { label: 'GMD médio terminação', value: avgGmdOf(finishBatches) },
        ],
        targetTab: 'grow_finish',
      },
      {
        id: 'comercializacao',
        title: '7. Comercialização & Abate',
        shortTitle: 'Abate / GTA',
        subtitle: 'Pesagem final, jejum pré-abate e emissão de GTA',
        icon: Truck,
        animalCount: readyCount,
        durationDays: 'Jejum 12h + embarque',
        avgWeightLabel: avgWeightOf(readyBatches),
        feedRefLabel: 'Jejum sólido pré-abate',
        mortalityLabel: 'Meta < 0,1%',
        shedLocation: 'Plataforma de Embarque',
        targetTempLabel: 'Embarque em horário ameno',
        hasLiveData: readyBatches.length > 0,
        keyEvents: [
          'Jejum sólido de 12 horas com água à vontade',
          'Manejo de bem-estar em rampa antiderrapante',
          'Conferência de carência zero e emissão de Pré-GTA',
        ],
        vitalMetrics: [
          { label: 'Lotes prontos / embarcados', value: `${readyBatches.length}` },
          { label: 'Meta rendimento carcaça', value: '74% a 76%' },
          { label: 'Meta carne magra', value: '> 58%' },
        ],
        targetTab: 'reports',
      },
    ];
  }, [animals, batches, litters, sheds]);

  const currentStage = stages.find(s => s.id === selectedStageId) ?? stages[0];
  const StageIcon = currentStage.icon;

  const matchingShed = sheds.find(s => s.phase === selectedStageId);

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Fluxo Contínuo da Produção Suinícola
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Acompanhe as 7 etapas do ciclo produtivo com populações reais e benchmarks de referência.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg shrink-0 tabular-nums">
          Ciclo completo: ~165 a 175 dias
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className={`${SWINE_CARD_CLASS} p-2.5 overflow-x-auto`}>
        <div className="flex items-center gap-1.5 min-w-max">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isSelected = selectedStageId === stg.id;
            return (
              <React.Fragment key={stg.id}>
                <button
                  type="button"
                  onClick={() => setSelectedStageId(stg.id)}
                  className={`px-3 py-2 rounded-lg text-left transition-colors flex items-center gap-2.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-white' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  />
                  <div>
                    <div
                      className={`text-[10px] font-medium ${
                        isSelected ? 'text-rose-100' : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      Fase 0{idx + 1}
                    </div>
                    <div className="text-xs font-semibold leading-tight">{stg.shortTitle}</div>
                    <div
                      className={`text-[11px] font-medium tabular-nums ${
                        isSelected ? 'text-white' : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {stg.animalCount} cab.
                    </div>
                  </div>
                </button>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed Stage View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${SWINE_CARD_CLASS} p-4 space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <StageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {currentStage.title}
                  </h3>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                      currentStage.hasLiveData
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {currentStage.hasLiveData ? 'Em operação' : 'Sem registros na fase'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{currentStage.subtitle}</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">População na Fase</span>
              <span className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {currentStage.animalCount} animais
              </span>
            </div>
          </div>

          {/* 4 Stage Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Duração Típica</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                {currentStage.durationDays}
              </span>
            </div>
            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Peso Médio Atual</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block tabular-nums">
                {currentStage.avgWeightLabel}
              </span>
            </div>
            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Consumo Ração</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                {currentStage.feedRefLabel}
              </span>
            </div>
            <div className={`${SWINE_SUBCARD_CLASS} p-2.5`}>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Mortalidade Fase</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block tabular-nums">
                {currentStage.mortalityLabel}
              </span>
            </div>
          </div>

          {/* Vital Metrics */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
              Indicadores da Etapa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentStage.vitalMetrics.map(met => (
                <div
                  key={met.label}
                  className={`${SWINE_SUBCARD_CLASS} px-3 py-2 flex items-center justify-between gap-2`}
                >
                  <span className="text-xs text-slate-600 dark:text-zinc-400">{met.label}</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                    {met.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Protocols */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
              Protocolos e Manejos Críticos
            </h4>
            <div className="space-y-1.5">
              {currentStage.keyEvents.map((evt, idx) => (
                <div
                  key={evt}
                  className={`${SWINE_SUBCARD_CLASS} px-3 py-2 flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300`}
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-[10px] font-semibold tabular-nums">
                    {idx + 1}
                  </span>
                  <span>{evt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Facility & Action */}
        <div className={`${SWINE_CARD_CLASS} p-4 space-y-4 flex flex-col justify-between`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Capacidade & Instalação
              </h4>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-1.5`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {matchingShed
                    ? `Ocupação: ${matchingShed.currentOccupancy}/${matchingShed.capacityAnimals}`
                    : currentStage.hasLiveData
                      ? 'Fase em operação'
                      : 'Sem lotes vinculados'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {matchingShed
                  ? `Galpão ${matchingShed.name} operando a ${matchingShed.temperatureC}°C (${matchingShed.comfortStatus}).`
                  : 'Cadastre animais, lotes ou leituras de ambiência nesta etapa para monitorar lotação e gargalos em tempo real.'}
              </p>
            </div>

            <div className={`${SWINE_SUBCARD_CLASS} p-3 space-y-2 text-xs`}>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 dark:text-zinc-400">Localização</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentStage.shedLocation}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 dark:text-zinc-400">Ventilação</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {matchingShed ? matchingShed.ventilationType : 'Conforme galpão'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 dark:text-zinc-400">Temperatura Alvo</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {matchingShed ? `${matchingShed.targetTempC}°C` : currentStage.targetTempLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(currentStage.targetTab)}
            className={`${SWINE_PRIMARY_BTN_CLASS} w-full h-9`}
          >
            <span>Gerenciar {currentStage.shortTitle}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
