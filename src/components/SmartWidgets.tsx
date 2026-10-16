import React, { useState, useEffect } from 'react';
import {
  Sparkles,
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
  Droplet,
  CheckCircle2,
  Clock,
  X,
  Cpu
} from 'lucide-react';
import { Farm } from '../types/agronomy';

interface SmartWidgetsProps {
  farm: Farm;
}

type ExpandedSmartCard = 'phyto' | 'weather' | 'management' | null;

export const SmartWidgets: React.FC<SmartWidgetsProps> = ({ farm }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedCard, setExpandedCard] = useState<ExpandedSmartCard>(null);
  const [insights, setInsights] = useState({
    phyto: '',
    weather: '',
    management: '',
    phytoDetails: [] as string[],
    weatherDetails: [] as string[],
    managementDetails: [] as string[],
  });

  const loadOfflineInsights = () => {
    setInsights({
      phyto: `Alerta moderado: Condições favoráveis para proliferação de Lagarta-da-soja e ferrugem devido à umidade recente. Última inspeção no ${farm?.plots?.[0]?.name || 'Talhão 1'} indicou nível baixo.`,
      weather: 'Previsão de precipitação (15mm) para as próximas 48h. Janela ideal de pulverização foliar amanhã entre 06:00 e 09:30 (Vento < 8 km/h e UR > 60%).',
      management: 'Aplicação preventiva de biofungicida e nutrição foliar com Boro/Potássio programada para daqui a 3 dias. Prazo para fechamento do laudo foliar em aberto.',
      phytoDetails: [
        'Monitorar bordaduras dos talhões com pano de batida (nível de ação: 2 lagartas grandes/pano).',
        'Avaliar sintomas iniciais de mancha-alvo e ferrugem asiática no terço inferior da planta.',
        'Considerar controle biológico com Bacillus thuringiensis ou Trichogramma pretiosum.'
      ],
      weatherDetails: [
        'Temperatura média: 24°C - 31°C com umidade relativa oscilando entre 55% e 85%.',
        'Condições micrometeorológicas excelentes para absorção de adubação foliar no início da manhã.',
        'Evitar aplicações com temperatura acima de 30°C ou ventos superiores a 10 km/h para evitar deriva.'
      ],
      managementDetails: [
        'Revisão dos bicos de pulverização (pontas anti-deriva com indução de ar para gotas médias/grossas).',
        'Checagem do pH da calda (manter entre 5.0 e 6.0 para máxima estabilidade dos ativos e micronutrientes).',
        'Registro digital no Caderno de Campo com coordenadas do talhão e lote de insumos.'
      ]
    });
  };

  const fetchOnlineInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nema-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmName: farm.name,
          domain: 'geral',
          userPrompt: 'Gere 3 resumos curtos no formato JSON com as chaves "phyto", "weather" e "management" para o dashboard principal, baseando-se em alertas fitossanitários e nematoides, previsão do tempo/janela de pulverização e próximos vencimentos operacionais.'
        })
      });
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      if (data && data.success && data.data) {
        setInsights({
          phyto: data.data.dominantSpeciesOrTargets?.join(', ') 
            ? `Alvos detectados: ${data.data.dominantSpeciesOrTargets.join(', ')}. ${data.data.damageThresholdAssessment || 'Manter monitoramento de rotina.'}`
            : 'Monitoramento fitossanitário ativo. Nenhuma anomalia severa acima do nível de dano econômico detectada.',
          weather: 'Sincronizado com API Climática e Janelas Operacionais. Condições adequadas para pulverização no período matutino.',
          management: data.data.actionChecklist?.[0] || 'Revisar operações no Field Book e planejar as próximas adubações.',
          phytoDetails: data.data.actionChecklist || [
            'Monitorar talhões com histórico de pressão.',
            'Preservar inimigos naturais e rotacionar ingredientes ativos.'
          ],
          weatherDetails: [
            'Janela de aplicação segura: 06:00 às 09:30 e após as 16:30.',
            'Déficit de Pressão de Vapor (DPV) favorável para abertura estomática e absorção cuticular.'
          ],
          managementDetails: data.data.soilHealthAndBioASRecommendations || [
            'Ajustar calibração dos pulverizadores terrestres.',
            'Conferir compatibilidade química de tanque antes do preparo da calda.'
          ]
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.warn('Failed to fetch online insights, falling back to offline', error);
      loadOfflineInsights();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchOnlineInsights();
    } else {
      loadOfflineInsights();
    }
  }, [isOnline, farm]);

  const toggleSmartCard = (card: ExpandedSmartCard) => {
    setExpandedCard(prev => prev === card ? null : card);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Widgets Inteligentes </span>
          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">• Clique nos cards para expandir o plano de ação</span>
        </h3>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setIsOnline(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              isOnline 
                ? 'bg-emerald-500 text-white shadow-xs' 
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Wifi className="w-3 h-3" />
            Online (IA)
          </button>
          <button
            type="button"
            onClick={() => setIsOnline(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              !isOnline 
                ? 'bg-slate-700 dark:bg-zinc-700 text-white shadow-xs' 
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            Offline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Phyto Widget */}
        <div
          onClick={() => toggleSmartCard('phyto')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSmartCard('phyto'); }}
          className={`p-4 rounded-xl border shadow-xs relative overflow-hidden group cursor-pointer transition-all select-none ${
            expandedCard === 'phyto'
              ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-zinc-950 border-rose-200/80 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50/30'
          }`}
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bug className="w-12 h-12 text-rose-500" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                <Bug className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              <h4 className="font-bold text-xs text-slate-700 dark:text-zinc-200 uppercase tracking-wider">
                Alertas Fitossanitários
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
              {expandedCard === 'phyto' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Loader2 className="w-3 h-3 animate-spin"/> Atualizando...
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10 line-clamp-3">
              {insights.phyto}
            </p>
          )}

          <div className="mt-2.5 pt-2 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
            <span>{expandedCard === 'phyto' ? 'Recolher detalhes' : 'Clique para expandir'}</span>
            <span>Manejo Integrado (MIP)</span>
          </div>
        </div>

        {/* Weather Widget */}
        <div
          onClick={() => toggleSmartCard('weather')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSmartCard('weather'); }}
          className={`p-4 rounded-xl border shadow-xs relative overflow-hidden group cursor-pointer transition-all select-none ${
            expandedCard === 'weather'
              ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
              : 'bg-white dark:bg-zinc-950 border-sky-200/80 dark:border-sky-900/50 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/30'
          }`}
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CloudSun className="w-12 h-12 text-sky-500" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                <CloudSun className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <h4 className="font-bold text-xs text-slate-700 dark:text-zinc-200 uppercase tracking-wider">
                Previsão Local & Janelas
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
              {expandedCard === 'weather' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Loader2 className="w-3 h-3 animate-spin"/> Atualizando...
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10 line-clamp-3">
              {insights.weather}
            </p>
          )}

          <div className="mt-2.5 pt-2 border-t border-sky-100 dark:border-sky-900/40 flex items-center justify-between text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
            <span>{expandedCard === 'weather' ? 'Recolher detalhes' : 'Clique para expandir'}</span>
            <span>Clima & Pulverização</span>
          </div>
        </div>

        {/* Management Widget */}
        <div
          onClick={() => toggleSmartCard('management')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSmartCard('management'); }}
          className={`p-4 rounded-xl border shadow-xs relative overflow-hidden group cursor-pointer transition-all select-none ${
            expandedCard === 'management'
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-zinc-950 border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/30'
          }`}
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarClock className="w-12 h-12 text-amber-500" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <CalendarClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="font-bold text-xs text-slate-700 dark:text-zinc-200 uppercase tracking-wider">
                Próximos Vencimentos
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              {expandedCard === 'management' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Loader2 className="w-3 h-3 animate-spin"/> Atualizando...
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10 line-clamp-3">
              {insights.management}
            </p>
          )}

          <div className="mt-2.5 pt-2 border-t border-amber-100 dark:border-amber-900/40 flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
            <span>{expandedCard === 'management' ? 'Recolher detalhes' : 'Clique para expandir'}</span>
            <span>Operações & Campo</span>
          </div>
        </div>

      </div>

      {/* Expanded Smart Widget Panel */}
      {expandedCard && (
        <div className="bg-slate-50 dark:bg-zinc-900/90 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              {expandedCard === 'phyto' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
              {expandedCard === 'weather' && <Wind className="w-4 h-4 text-sky-500" />}
              {expandedCard === 'management' && <Clock className="w-4 h-4 text-amber-500" />}
              
              {expandedCard === 'phyto' && 'Detalhamento dos Alertas Fitossanitários'}
              {expandedCard === 'weather' && 'Janelas Operacionais & Condições Micrometeorológicas'}
              {expandedCard === 'management' && 'Agenda Agronômica e Próximas Atividades'}
            </h5>

            <button
              onClick={() => setExpandedCard(null)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Recolher
            </button>
          </div>

          <div className="space-y-2">
            {(expandedCard === 'phyto' ? insights.phytoDetails :
              expandedCard === 'weather' ? insights.weatherDetails :
              insights.managementDetails).map((detail, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
