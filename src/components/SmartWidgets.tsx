import React, { useState, useEffect } from 'react';
import {
  Bug,
  CloudSun,
  CalendarClock,
  Wifi,
  WifiOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Wind,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { Farm } from '../types/agronomy';

interface SmartWidgetsProps {
  farm: Farm;
}

type ExpandedSmartCard = 'phyto' | 'weather' | 'management' | null;

const getOfflineInsights = (plotName: string) => ({
  phyto: `Alerta moderado: condições favoráveis para lagarta-da-soja e ferrugem devido à umidade recente. Última inspeção no ${plotName} indicou nível baixo.`,
  weather:
    'Previsão de precipitação (15 mm) para as próximas 48 h. Janela ideal de pulverização foliar amanhã entre 06:00 e 09:30 (vento < 8 km/h e UR > 60%).',
  management:
    'Aplicação preventiva de biofungicida e nutrição foliar com Boro/Potássio programada para daqui a 3 dias. Fechamento do laudo foliar em aberto.',
  phytoDetails: [
    'Monitorar bordaduras dos talhões com pano de batida (nível de ação: 2 lagartas grandes/pano).',
    'Avaliar sintomas iniciais de mancha-alvo e ferrugem asiática no terço inferior da planta.',
    'Considerar controle biológico com Bacillus thuringiensis ou Trichogramma pretiosum.',
  ],
  weatherDetails: [
    'Temperatura média de 24 °C a 31 °C com umidade relativa oscilando entre 55% e 85%.',
    'Condições micrometeorológicas favoráveis para absorção de adubação foliar no início da manhã.',
    'Evitar aplicações com temperatura acima de 30 °C ou ventos superiores a 10 km/h para reduzir deriva.',
  ],
  managementDetails: [
    'Revisão dos bicos de pulverização (pontas antideriva com indução de ar para gotas médias/grossas).',
    'Checagem do pH da calda (manter entre 5,0 e 6,0 para máxima estabilidade dos ativos e micronutrientes).',
    'Registro digital no Caderno de Campo com coordenadas do talhão e lote de insumos.',
  ],
});

export const SmartWidgets: React.FC<SmartWidgetsProps> = ({ farm }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedCard, setExpandedCard] = useState<ExpandedSmartCard>(null);
  const [insights, setInsights] = useState(() =>
    getOfflineInsights(farm?.plots?.[0]?.name || 'Talhão 1')
  );

  const firstPlotName = farm?.plots?.[0]?.name || 'Talhão 1';

  useEffect(() => {
    if (!isOnline || !navigator.onLine) {
      setLoading(false);
      setInsights(getOfflineInsights(firstPlotName));
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const fetchOnlineInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/nema-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            farmName: farm?.name,
            domain: 'geral',
            userPrompt:
              'Gere 3 resumos curtos no formato JSON com as chaves "phyto", "weather" e "management" para o dashboard principal, baseando-se em alertas fitossanitários e nematoides, previsão do tempo/janela de pulverização e próximos vencimentos operacionais.',
          }),
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        if (cancelled) return;
        if (data && data.success && data.data) {
          setInsights({
            phyto: data.data.dominantSpeciesOrTargets?.join(', ')
              ? `Alvos detectados: ${data.data.dominantSpeciesOrTargets.join(', ')}. ${
                  data.data.damageThresholdAssessment || 'Manter monitoramento de rotina.'
                }`
              : 'Monitoramento fitossanitário ativo. Nenhuma anomalia severa acima do nível de dano econômico detectada.',
            weather:
              'Sincronizado com previsão climática e janelas operacionais. Condições adequadas para pulverização no período matutino.',
            management:
              data.data.actionChecklist?.[0] ||
              'Revisar operações no Caderno de Campo e planejar as próximas adubações.',
            phytoDetails: data.data.actionChecklist || [
              'Monitorar talhões com histórico de pressão.',
              'Preservar inimigos naturais e rotacionar ingredientes ativos.',
            ],
            weatherDetails: [
              'Janela de aplicação segura: 06:00 às 09:30 e após as 16:30.',
              'Déficit de Pressão de Vapor (DPV) favorável para abertura estomática e absorção cuticular.',
            ],
            managementDetails: data.data.soilHealthAndBioASRecommendations || [
              'Ajustar calibração dos pulverizadores terrestres.',
              'Conferir compatibilidade química de tanque antes do preparo da calda.',
            ],
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error: unknown) {
        if (cancelled || (error instanceof Error && error.name === 'AbortError')) return;
        console.warn('Failed to fetch online insights, falling back to offline', error);
        setInsights(getOfflineInsights(firstPlotName));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOnlineInsights();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isOnline, farm?.id, farm?.name, firstPlotName]);

  const toggleSmartCard = (card: ExpandedSmartCard) => {
    setExpandedCard(prev => (prev === card ? null : card));
  };

  const cards = [
    {
      id: 'phyto' as const,
      title: 'Alertas fitossanitários',
      category: 'Manejo integrado (MIP)',
      summary: insights.phyto,
      icon: Bug,
      iconColor: 'text-rose-600 dark:text-rose-400',
      activeBorder: 'border-rose-400 dark:border-rose-700 bg-rose-50/40 dark:bg-rose-950/20',
    },
    {
      id: 'weather' as const,
      title: 'Previsão e janelas',
      category: 'Clima e pulverização',
      summary: insights.weather,
      icon: CloudSun,
      iconColor: 'text-sky-600 dark:text-sky-400',
      activeBorder: 'border-sky-400 dark:border-sky-700 bg-sky-50/40 dark:bg-sky-950/20',
    },
    {
      id: 'management' as const,
      title: 'Próximos vencimentos',
      category: 'Operações e campo',
      summary: insights.management,
      icon: CalendarClock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      activeBorder: 'border-amber-400 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20',
    },
  ];

  const activeDetails =
    expandedCard === 'phyto'
      ? insights.phytoDetails
      : expandedCard === 'weather'
      ? insights.weatherDetails
      : expandedCard === 'management'
      ? insights.managementDetails
      : [];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Resumos operacionais
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Selecione um card para expandir o plano de ação
          </p>
        </div>

        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setIsOnline(true)}
            className={`h-6 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              isOnline
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span>Online (IA)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOnline(false)}
            className={`h-6 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              !isOnline
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </button>
        </div>
      </div>

      {/* 3-Column Hairline Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
        {cards.map(card => {
          const Icon = card.icon;
          const isExpanded = expandedCard === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggleSmartCard(card.id)}
              className={`p-4 text-left flex flex-col justify-between transition-colors cursor-pointer ${
                isExpanded
                  ? card.activeBorder
                  : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${card.iconColor}`} />
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                      {card.title}
                    </h4>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                    {card.summary}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>{card.category}</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {isExpanded ? 'Recolher' : 'Detalhes'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Details Drawer */}
      {expandedCard && (
        <div className="px-4 py-3.5 sm:px-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h5 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              {expandedCard === 'phyto' && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
              {expandedCard === 'weather' && <Wind className="w-3.5 h-3.5 text-sky-500" />}
              {expandedCard === 'management' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
              <span>
                {expandedCard === 'phyto' && 'Detalhamento dos alertas fitossanitários'}
                {expandedCard === 'weather' && 'Janelas operacionais e condições micrometeorológicas'}
                {expandedCard === 'management' && 'Agenda agronômica e próximas atividades'}
              </span>
            </h5>

            <button
              type="button"
              onClick={() => setExpandedCard(null)}
              className="h-7 px-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 inline-flex items-center gap-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Recolher</span>
            </button>
          </div>

          <ul className="space-y-1.5">
            {activeDetails.map((detail, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
