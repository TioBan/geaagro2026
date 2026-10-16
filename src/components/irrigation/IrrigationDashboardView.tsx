import React from 'react';
import {
  IrrigationSystemRecord,
  ClimateDayRecord,
  IrrigationEventLog,
  IrrigationKPIs,
} from '../../types/irrigation';
import {
  Droplets,
  Zap,
  Gauge,
  Activity,
  Sun,
  CloudRain,
  AlertCircle,
  Calendar,
  Sparkles,
  Tractor,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  systems: IrrigationSystemRecord[];
  climate: ClimateDayRecord[];
  logs: IrrigationEventLog[];
  kpis: IrrigationKPIs;
  onNavigateToTab: (tab: any) => void;
}

export const IrrigationDashboardView: React.FC<Props> = ({
  systems,
  climate,
  logs,
  kpis,
  onNavigateToTab,
}) => {
  const latestClimate = climate[climate.length - 1] || {
    tempMaxC: 33.5,
    tempMinC: 21.2,
    humidityRelativePct: 62,
    rainfallMm: 0,
    et0MmDay: 5.6,
  };

  return (
    <div className="space-y-6">
      {/* Grid de KPIs Principais em Tempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span>Área Irrigada</span>
            <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {kpis.totalIrrigatedAreaHa} <span className="text-xs font-normal text-slate-500">ha</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Sistemas Ativos: <strong>{kpis.totalActiveSystemsCount}</strong></span>
            <span className="text-emerald-600 font-bold">100% OK</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span>Volume de Água Aplicado</span>
            <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {kpis.totalWaterVolumeSeasonM3.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-500">m³</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Eficiência Médio Ea: <strong>{kpis.avgSystemEfficiencyPct}%</strong></span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span>Umidade do Solo Atual</span>
            <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {kpis.currentSoilMoisturePct}% <span className="text-xs font-normal text-slate-500">da CAD</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Estresse Hídrico:</span>
            <span className="text-emerald-600 font-bold">{kpis.waterStressIndex}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span>Consumo Energético</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            R$ {kpis.totalEnergyCostBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Total kWh: <strong>{kpis.totalEnergyConsumedKwh.toLocaleString('pt-BR')}</strong></span>
            <span className="text-amber-600 font-bold">Tarifa Verde</span>
          </div>
        </div>
      </div>

      {/* Clima & Balanço ET0 / Chuva */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget de Balanço Hídrico Meteorológico */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Meteorologia & ET₀ Atual
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Hoje</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">ET₀ Diária</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{latestClimate.et0MmDay} mm/dia</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Chuva Acumulada</span>
              <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">{kpis.accumulatedRainfallMm} mm</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
              <span>Temperatura Máx / Mín:</span>
              <strong className="text-slate-900 dark:text-white">{latestClimate.tempMaxC}°C / {latestClimate.tempMinC}°C</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
              <span>Umidade Relativa Ar:</span>
              <strong className="text-slate-900 dark:text-white">{latestClimate.humidityRelativePct}%</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Evapotranspiração da Cultura (ETc):</span>
              <strong className="text-cyan-600 dark:text-cyan-400">6.4 mm/dia</strong>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('weather')}
            className="w-full py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all"
          >
            Ver Detalhes Meteorológicos
          </button>
        </div>

        {/* Resumo dos Sistemas de Irrigação Ativos */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Sistemas de Irrigação Ativos na Propriedade
            </h3>
            <button
              onClick={() => onNavigateToTab('systems')}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Gerenciar Sistemas
            </button>
          </div>

          <div className="space-y-3">
            {systems.map(sys => (
              <div
                key={sys.id}
                onClick={() => onNavigateToTab('digital_twin')}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-cyan-500 dark:hover:border-cyan-500/60 transition-all cursor-pointer bg-slate-50/50 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sys.systemName}</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {sys.plotName} • {sys.irrigatedAreaHa} ha • {sys.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vazão / Pressão</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{sys.nominalFlowM3h} m³/h • {sys.operatingPressureMca} mca</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">CUC / Ea</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{sys.cucPercent}% / {sys.applicationEfficiencyPct}%</strong>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg text-[11px] font-bold shrink-0">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações Rápidas de Navegação no Módulo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateToTab('calculator')}
          className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-cyan-500 hover:bg-cyan-50/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Gauge className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Cálculo de Lâminas</h4>
          <p className="text-[10px] text-slate-500">Manejo hídrico e tempo de irrigação (Ti)</p>
        </button>

        <button
          onClick={() => onNavigateToTab('simulator')}
          className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-cyan-500 hover:bg-cyan-50/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Simulador "E Se...?"</h4>
          <p className="text-[10px] text-slate-500">Compare estratégias e tarifas</p>
        </button>

        <button
          onClick={() => onNavigateToTab('water_quality')}
          className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-cyan-500 hover:bg-cyan-50/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Qualidade da Água</h4>
          <p className="text-[10px] text-slate-500">Análise de salinidade e sodificidade</p>
        </button>

        <button
          onClick={() => onNavigateToTab('digital_twin')}
          className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-cyan-500 hover:bg-cyan-50/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Gêmeo Digital 360°</h4>
          <p className="text-[10px] text-slate-500">Pivô e talhão em tempo real</p>
        </button>
      </div>
    </div>
  );
};
