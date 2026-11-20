import React, { useState } from 'react';
import {
  Tractor,
  Calendar,
  ShieldCheck,
  FileText,
  Trash2,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { SprayApplicationRecord } from '../../types/tankMix';

interface Props {
  applications: SprayApplicationRecord[];
  onDeleteApplication: (id: string) => void;
}

export const TankMixTraceabilityView: React.FC<Props> = ({
  applications,
  onDeleteApplication,
}) => {
  const [selectedAppDetail, setSelectedAppDetail] = useState<SprayApplicationRecord | null>(null);

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
          Rastreabilidade das Pulverizações
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
          {(applications || []).length} {(applications || []).length === 1 ? 'registro salvo' : 'registros salvos'} · Conformidade BPF, carência, reentrada e histórico por talhão
        </p>
      </div>

      {/* Lista de Aplicações */}
      {(applications || []).length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl px-6 py-10 text-center space-y-2">
          <Tractor className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-medium text-slate-800 dark:text-zinc-200">
            Nenhum registro de pulverização salvo
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Monte a calda no <strong className="text-slate-700 dark:text-zinc-300">Laboratório Virtual</strong> e clique em &ldquo;Registrar Aplicação&rdquo; para arquivar talhão, operador, clima e período de carência.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
          {applications.map(app => (
            <div
              key={app.id}
              className="p-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">
                    {app.plotName}
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">·</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {app.crop} ({app.growthStage})
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">·</span>
                  <span className="text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{app.date} · {app.startTime}–{app.endTime}</span>
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">·</span>
                  <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    ICG {app.icgScore}%
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-zinc-300">
                  <span className="font-medium text-slate-500 dark:text-zinc-400">Calda: </span>
                  {app.productsUsed.map(p => `${p.productName} (${p.dosePerHa} ${p.doseUnit})`).join(' + ')}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  <span>
                    Operador: <strong className="font-medium text-slate-800 dark:text-zinc-200">{app.operatorName}</strong>
                  </span>
                  <span>
                    Equipamento: <strong className="font-medium text-slate-800 dark:text-zinc-200">{app.equipmentName}</strong>
                  </span>
                  <span>
                    Volume: <strong className="font-medium text-slate-800 dark:text-zinc-200">{app.totalSprayVolumeLHa} L/ha</strong>
                  </span>
                  <span>
                    Área: <strong className="font-medium text-slate-800 dark:text-zinc-200">{app.areaHa} ha</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-0.5 tabular-nums">
                  <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Carência: <strong>{app.safetyIntervalDays} dias</strong> (colheita segura: {app.harvestSafetyDate})
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Reentrada: <strong>{app.reentryDate}</strong></span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedAppDetail(app)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Ficha Completa</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteApplication(app.id)}
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center transition-colors cursor-pointer"
                  title="Excluir registro"
                  aria-label="Excluir registro"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Ficha Completa */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block">
                  Laudo de Rastreabilidade Agrícola
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {selectedAppDetail.plotName} · {selectedAppDetail.crop} ({selectedAppDetail.growthStage})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppDetail(null)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-slate-100 dark:divide-zinc-800">
                <div className="p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Data e horário</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedAppDetail.date}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    {selectedAppDetail.startTime}–{selectedAppDetail.endTime}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Área e volume</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedAppDetail.areaHa} ha
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    {selectedAppDetail.totalSprayVolumeLHa} L/ha ({selectedAppDetail.tankLoadsCount} carga)
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Operador</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedAppDetail.operatorName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate block">
                    {selectedAppDetail.equipmentName}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Clima no campo</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedAppDetail.weather.temperatureC} °C · {selectedAppDetail.weather.relativeHumidityPct}% UR
                  </span>
                  <span className="text-[11px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                    ΔT {selectedAppDetail.weather.deltaT} °C · {selectedAppDetail.weather.windSpeedKmH} km/h
                  </span>
                </div>
              </div>

              {/* Tabela de Produtos */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-zinc-950/60 px-3.5 py-2 font-semibold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800">
                  Produtos utilizados na calda
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-slate-50/50 dark:bg-zinc-950/30 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Produto</th>
                      <th className="px-3 py-2 text-center font-medium">Formulação</th>
                      <th className="px-3 py-2 text-right font-medium">Dose/ha</th>
                      <th className="px-3 py-2 text-right font-medium">Total aplicado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {selectedAppDetail.productsUsed.map((p, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-zinc-100">{p.productName}</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-600 dark:text-zinc-400">
                          {p.formulation}
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                          {p.dosePerHa} {p.doseUnit}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                          {p.totalAmountUsed.toFixed(1)} {p.amountUnit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Checklist BPF */}
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/60 dark:bg-emerald-950/25 space-y-2">
                <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Conformidade de Boas Práticas e Segurança</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-emerald-900 dark:text-emerald-300 text-[11px]">
                  {[
                    'Uso completo de EPIs verificado',
                    'Triplo enxágue das embalagens realizado',
                    'Agitador mantido em funcionamento contínuo',
                    'Bicos calibrados sem entupimentos',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedAppDetail.notes && (
                <div className="text-slate-600 dark:text-zinc-400 pt-1">
                  <strong className="text-slate-800 dark:text-zinc-200">Observações técnicas:</strong>{' '}
                  {selectedAppDetail.notes}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAppDetail(null)}
                className="h-8 px-4 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-white cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
