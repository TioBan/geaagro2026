import React, { useState } from 'react';
import {
  Droplets,
  CloudSun,
  BarChart3,
  Sparkles,
  Zap,
  TrendingUp,
  Thermometer,
  CloudRain,
  Wind,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  SistemaIrrigacaoFertirrigacao,
  LeituraEstacaoMeteorologica,
  IndicadorBIRuralData,
  SafraAgragricola,
} from '../../types/gestaoRural';

interface GestaoIrrigacaoClimaBIProps {
  irrigacao: SistemaIrrigacaoFertirrigacao[];
  clima: LeituraEstacaoMeteorologica[];
  safras: SafraAgragricola[];
}

export const GestaoIrrigacaoClimaBI: React.FC<GestaoIrrigacaoClimaBIProps> = ({
  irrigacao,
  clima,
  safras,
}) => {
  const [activeTab, setActiveTab] = useState<'irrigacao' | 'clima' | 'bi'>('bi');

  const leituraHoje = clima[0] || {
    chuvaMm: 14.5,
    temperaturaMaxC: 31.2,
    temperaturaMinC: 19.8,
    umidadeRelativaPct: 68,
    velocidadeVentoKmH: 8.4,
    et0DiariaMm: 4.8,
    etcCalculadaMm: 5.5,
    condicaoGeral: 'Parcialmente Nublado',
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <BarChart3 className="w-4 h-4" />
            Módulos 10, 11 & 12 • Manejo Hídrico, Estação Climática & BI Rural
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Irrigação, Balanço Hídrico & Painel Analítico 360°
          </h2>
          <p className="text-slate-500">
            Monitoramento em tempo real de vazão, fertirrigação, ET0, chuva e comparativos de produtividade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bi')}
            className={`px-3.5 py-2.5 font-bold rounded-xl cursor-pointer ${
              activeTab === 'bi' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800'
            }`}
          >
            BI Rural
          </button>
          <button
            onClick={() => setActiveTab('irrigacao')}
            className={`px-3.5 py-2.5 font-bold rounded-xl cursor-pointer ${
              activeTab === 'irrigacao' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800'
            }`}
          >
            Irrigação
          </button>
          <button
            onClick={() => setActiveTab('clima')}
            className={`px-3.5 py-2.5 font-bold rounded-xl cursor-pointer ${
              activeTab === 'clima' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800'
            }`}
          >
            Estação Clima
          </button>
        </div>
      </div>

      {/* CLIMA METRICS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Chuva Acumulada</span>
            <CloudRain className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white block">
            {leituraHoje.chuvaMm} mm
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">Últimas 24 horas</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Temperatura</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white block">
            {leituraHoje.temperaturaMinC}°C a {leituraHoje.temperaturaMaxC}°C
          </span>
          <span className="text-[10px] text-slate-500">Média 25.5°C</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Evapotranspiração</span>
            <Droplets className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white block">
            ET0: {leituraHoje.et0DiariaMm} mm
          </span>
          <span className="text-[10px] text-purple-600 font-bold">ETc Cultura: {leituraHoje.etcCalculadaMm} mm</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Umidade do Ar</span>
            <CloudSun className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white block">
            {leituraHoje.umidadeRelativaPct}%
          </span>
          <span className="text-[10px] text-slate-500">Vento: {leituraHoje.velocidadeVentoKmH} km/h</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Condição Geral</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white block">
            {leituraHoje.condicaoGeral}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">Sem risco de geada</span>
        </div>
      </div>

      {/* BI RURAL OVERVIEW */}
      {activeTab === 'bi' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Indicadores de Desempenho Agronômico & Econômico (BI Rural)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-600">Eficiência de Fertilizantes</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block">380 kg/ha</span>
              <p className="text-[11px] text-slate-500">
                Aproveitamento nutricional de NPK com recuperação foliar de 94%.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-600">Consumo de Combustível</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block">4.0 L/ha</span>
              <p className="text-[11px] text-slate-500">
                Rendimento por hora operacional da frota otimizado com rotas RTK.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-600">Eficiência Hídrica</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block">15.7 kg grãos / m³ água</span>
              <p className="text-[11px] text-slate-500">
                Irrigação suplementar ajustada à evapotranspiração real da cultura.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IRRIGACAO TAB */}
      {activeTab === 'irrigacao' && (
        <div className="space-y-4">
          {irrigacao.map(i => (
            <div
              key={i.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  {i.nome} ({i.tipo})
                </h4>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  Compatibilidade Química: {i.compatibilidadeQuimicaStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="block text-slate-400 font-bold">Vazão do Sistema:</span>
                  <span className="font-bold">{i.vazaoM3H} m³/h</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Pressão de Operação:</span>
                  <span className="font-bold">{i.pressaoOperacaoBar} bar</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Lâmina Diária:</span>
                  <span className="font-bold text-blue-600">{i.laminaDiariaMm} mm/dia</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Tempo de Funcionamento:</span>
                  <span className="font-bold">{i.tempoOperacaoHoras} horas/dia</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
