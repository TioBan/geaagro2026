import React, { useMemo, useState } from 'react';
import { CloudRain, Droplets, BarChart3 } from 'lucide-react';
import {
  SistemaIrrigacaoFertirrigacao,
  LeituraEstacaoMeteorologica,
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
  const [activeTab, setActiveTab] = useState<'bi' | 'irrigacao' | 'clima'>('bi');

  const latestClima = clima[0];

  const biSummary = useMemo(() => {
    const areaTotalSafras = safras.reduce((acc, s) => acc + (s.areaHa || 0), 0);
    const laminaMedia =
      irrigacao.length > 0
        ? irrigacao.reduce((acc, i) => acc + i.laminaDiariaMm, 0) / irrigacao.length
        : 0;
    const vazaoTotal = irrigacao.reduce((acc, i) => acc + i.vazaoM3H, 0);
    const chuvaAcumulada = clima.reduce((acc, c) => acc + c.chuvaMm, 0);
    const etcMedia =
      clima.length > 0
        ? clima.reduce((acc, c) => acc + c.etcCalculadaMm, 0) / clima.length
        : 0;
    return { areaTotalSafras, laminaMedia, vazaoTotal, chuvaAcumulada, etcMedia };
  }, [safras, irrigacao, clima]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* HEADER + SUB-TABS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Irrigação, Clima &amp; Inteligência Agronômica</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Indicadores hídricos, fertirrigação e monitoramento meteorológico da propriedade
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[
              { id: 'bi' as const, label: 'BI Rural', icon: BarChart3 },
              { id: 'irrigacao' as const, label: `Irrigação (${irrigacao.length})`, icon: Droplets },
              { id: 'clima' as const, label: `Estação Clima (${clima.length})`, icon: CloudRain },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BI TAB */}
      {activeTab === 'bi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
            <div className="p-4">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Área sob Safras</span>
              <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {biSummary.areaTotalSafras.toLocaleString('pt-BR')} ha
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block tabular-nums">
                {safras.length} safra(s) mapeada(s)
              </span>
            </div>
            <div className="p-4">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Vazão Instalada</span>
              <span className="text-base font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
                {biSummary.vazaoTotal.toFixed(1)} m³/h
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block tabular-nums">
                Lâmina média: {biSummary.laminaMedia.toFixed(1)} mm/dia
              </span>
            </div>
            <div className="p-4">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Chuva Acumulada</span>
              <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {biSummary.chuvaAcumulada.toFixed(1)} mm
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block tabular-nums">
                {clima.length} leitura(s) registradas
              </span>
            </div>
            <div className="p-4">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">ETc Média</span>
              <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {biSummary.etcMedia > 0 ? `${biSummary.etcMedia.toFixed(2)} mm/dia` : '—'}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                Demanda evapotranspirativa
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mb-2">
              Leitura Rápida de Balanço Hídrico
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {latestClima
                ? `Última estação registrada em ${new Date(latestClima.dataHora).toLocaleDateString('pt-BR')}: ${latestClima.condicaoGeral}, máxima ${latestClima.temperaturaMaxC}°C / mínima ${latestClima.temperaturaMinC}°C, umidade ${latestClima.umidadeRelativaPct}%, ET0 ${latestClima.et0DiariaMm} mm e ETc ${latestClima.etcCalculadaMm} mm.`
                : 'Nenhuma leitura meteorológica sincronizada até o momento. Os indicadores hídricos serão atualizados automaticamente assim que estações ou setores de irrigação forem registrados.'}
            </p>
          </div>
        </div>
      )}

      {/* IRRIGAÇÃO TAB */}
      {activeTab === 'irrigacao' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          {irrigacao.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Setor / Sistema</th>
                    <th className="py-2.5 px-4 text-right">Vazão</th>
                    <th className="py-2.5 px-4 text-right">Pressão</th>
                    <th className="py-2.5 px-4 text-right">Lâmina / Turno</th>
                    <th className="py-2.5 px-4">Fertirrigação</th>
                    <th className="py-2.5 px-4 text-right">Compatibilidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {irrigacao.map(sys => (
                    <tr key={sys.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">{sys.nome}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{sys.tipo}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800 dark:text-zinc-200 tabular-nums">
                        {sys.vazaoM3H} m³/h
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                        {sys.pressaoOperacaoBar} bar
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                        {sys.laminaDiariaMm} mm · {sys.tempoOperacaoHoras}h / {sys.frequenciaDias}d
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                        {sys.fertilizantesInjetados.length > 0
                          ? sys.fertilizantesInjetados.map(f => `${f.nome} (${f.concentracaoKgM3} kg/m³)`).join(', ')
                          : 'Somente água'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span
                          className={
                            sys.compatibilidadeQuimicaStatus === 'Alta'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : sys.compatibilidadeQuimicaStatus === 'Atenção'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {sys.compatibilidadeQuimicaStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum setor de irrigação ou fertirrigação cadastrado na propriedade.
            </div>
          )}
        </div>
      )}

      {/* CLIMA TAB */}
      {activeTab === 'clima' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          {clima.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Data</th>
                    <th className="py-2.5 px-4">Condição</th>
                    <th className="py-2.5 px-4 text-right">Temp. (Min/Max)</th>
                    <th className="py-2.5 px-4 text-right">Chuva</th>
                    <th className="py-2.5 px-4 text-right">UR / Vento</th>
                    <th className="py-2.5 px-4 text-right">ET0 / ETc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {clima.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                        {new Date(c.dataHora).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-zinc-100">{c.condicaoGeral}</td>
                      <td className="py-3 px-4 text-right text-slate-700 dark:text-zinc-300 tabular-nums">
                        {c.temperaturaMinC}°C / {c.temperaturaMaxC}°C
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
                        {c.chuvaMm} mm
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                        {c.umidadeRelativaPct}% · {c.velocidadeVentoKmH} km/h
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {c.et0DiariaMm} / {c.etcCalculadaMm} mm
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma leitura meteorológica cadastrada até o momento.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
