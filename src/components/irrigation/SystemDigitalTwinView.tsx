import React, { useState } from 'react';
import { IrrigationSystemRecord, ClimateDayRecord, IrrigationKPIs } from '../../types/irrigation';
import { Activity, Droplets, Gauge, Layers, Radio, ShieldCheck, Sun, Zap, Sparkles } from 'lucide-react';

interface Props {
  systems: IrrigationSystemRecord[];
  climate: ClimateDayRecord[];
  kpis: IrrigationKPIs;
}

export const SystemDigitalTwinView: React.FC<Props> = ({
  systems,
  climate,
  kpis,
}) => {
  const [twinMode, setTwinMode] = useState<'system' | 'plot'>('system');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  const activeSystem = (selectedSystemId ? systems.find(s => s.id === selectedSystemId) : null) || systems[0] || null;

  if (systems.length === 0 || !activeSystem) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Droplets className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum Sistema de Irrigação</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Cadastre primeiro seus pivôs ou sistemas fixos para visualizar o gêmeo digital.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Digital Twin Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Gêmeo Digital Agrícola 360°
            </div>
            <h2 className="text-2xl font-black">Modelagem Virtual em Tempo Real</h2>
            <p className="text-xs text-cyan-100/80">
              Acompanhe a dinâmica hídrica do solo e a telemetria operacional dos pivôs e emissores
            </p>
          </div>

          <div className="flex items-center gap-2 bg-cyan-900/40 p-1.5 rounded-2xl border border-cyan-700/40">
            <button
              onClick={() => setTwinMode('system')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                twinMode === 'system'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              Gêmeo do Sistema
            </button>
            <button
              onClick={() => setTwinMode('plot')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                twinMode === 'plot'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              Gêmeo do Talhão
            </button>
          </div>
        </div>
      </div>

      {twinMode === 'system' && (
        !activeSystem ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhum Sistema de Irrigação Cadastrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Cadastre um pivô central, carretel ou sistema de gotejamento para ativar a telemetria e modelagem em tempo real do Gêmeo Digital.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seleção do Pivô */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
                Selecione o Sistema em Operação
              </span>

              {systems.map(sys => (
                <div
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeSystem.id === sys.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-white'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">{sys.systemName}</h4>
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    {sys.plotName} • {sys.irrigatedAreaHa} ha
                  </p>
                </div>
              ))}
            </div>

            {/* Painel Virtual do Pivô (Gêmeo do Sistema) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                    Gêmeo Virtual Ativo
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeSystem.systemName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-xl text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" /> Telemetria Estável
                </div>
              </div>

              {/* Representação Gráfica / Diagrama do Pivô */}
              <div className="relative bg-slate-900 rounded-2xl p-6 text-white overflow-hidden flex flex-col items-center justify-center min-h-[220px] border border-cyan-800/40">
                {activeSystem.photoUrl && (
                  <img
                    src={activeSystem.photoUrl}
                    alt="Pivô Central"
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                  />
                )}

                <div className="relative z-10 text-center space-y-2">
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-400/80 border-t-transparent animate-spin mx-auto flex items-center justify-center">
                    <Droplets className="w-8 h-8 text-cyan-300" />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs text-cyan-300 font-mono font-bold">POSIÇÃO ANGULAR: 142° / 360°</span>
                    <h4 className="text-lg font-black text-white">BOMBA PRINCIPAL: OPERACIONAL (100 CV)</h4>
                    <p className="text-xs text-slate-300">
                      Vazão Atual: {activeSystem.nominalFlowM3h} m³/h • Pressão no Centro: {activeSystem.operatingPressureMca} mca
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Uniformidade CUC</span>
                  <strong className="text-lg text-emerald-600 dark:text-emerald-400">{activeSystem.cucPercent ?? 0}%</strong>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Distribuição CUD</span>
                  <strong className="text-lg text-emerald-600 dark:text-emerald-400">{activeSystem.cudPercent ?? 0}%</strong>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Eficiência Ea</span>
                  <strong className="text-lg text-cyan-600 dark:text-cyan-400">{activeSystem.applicationEfficiencyPct ?? 85}%</strong>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {twinMode === 'plot' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Gêmeo Digital do Talhão: Balanço Hídrico do Solo
              </h3>
              <p className="text-xs text-slate-500">
                Distribuição vertical da umidade do solo por perfil de profundidade
              </p>
            </div>
            <span className="px-3 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 rounded-xl text-xs font-bold">
              Umidade Média: {kpis.currentSoilMoisturePct}% CAD
            </span>
          </div>

          {/* Perfis de Camadas de Solo */}
          <div className="space-y-4">
            <div className="p-4 bg-cyan-950/20 rounded-xl border border-cyan-800/40 space-y-2">
              <div className="flex justify-between text-xs font-bold text-cyan-200">
                <span>Camada 0 - 20 cm (Zona Superior)</span>
                <span>82% da Capacidade de Campo</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-cyan-950/20 rounded-xl border border-cyan-800/40 space-y-2">
              <div className="flex justify-between text-xs font-bold text-cyan-200">
                <span>Camada 20 - 40 cm (Zona Radicular Efetiva)</span>
                <span>78% da Capacidade de Campo</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-cyan-950/20 rounded-xl border border-cyan-800/40 space-y-2">
              <div className="flex justify-between text-xs font-bold text-cyan-200">
                <span>Camada 40 - 60 cm (Subsolo/Reserva)</span>
                <span>75% da Capacidade de Campo</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
