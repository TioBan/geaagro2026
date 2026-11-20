import React, { useState, useMemo } from 'react';
import {
  Printer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  TankSelectedProduct,
  WaterQualityParameters,
  WeatherCondition,
  TankMixEvaluationResult,
} from '../../types/tankMix';
import { TANKMIX_PRODUCTS_DATABASE } from '../../data/tankMixData';

interface Props {
  selectedProducts: TankSelectedProduct[];
  evaluation: TankMixEvaluationResult;
  waterQuality: WaterQualityParameters;
  weather: WeatherCondition;
  farmName: string;
  plotName: string;
}

export const TankMixReportsView: React.FC<Props> = ({
  selectedProducts,
  evaluation,
  waterQuality,
  weather,
  farmName,
  plotName,
}) => {
  const [reportAgronomist, setReportAgronomist] = useState('Eng. Agrônomo Responsável');
  const [reportCrea, setReportCrea] = useState('CREA/ART Nº 2026-BR-8891');
  const targetCrop = 'Soja / Milho';
  const reportId = useMemo(() => `TMX-${Date.now().toString().slice(-6)}`, []);

  const handlePrint = () => {
    window.print();
  };

  const rating = evaluation.rating || evaluation.worstRating || 'compativel';
  const mixingSteps = evaluation.recommendedMixingOrder || [];
  const issues = evaluation.issues || [];

  const verdictMeta =
    rating === 'incompativel'
      ? {
          icon: XCircle,
          iconColor: 'text-rose-600 dark:text-rose-400',
          boxClass:
            'border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100',
          label: 'Mistura incompatível — risco de perda de calda',
        }
      : rating === 'restricao_severa'
      ? {
          icon: AlertTriangle,
          iconColor: 'text-orange-600 dark:text-orange-400',
          boxClass:
            'border-orange-200 dark:border-orange-800/70 bg-orange-50/70 dark:bg-orange-950/30 text-orange-950 dark:text-orange-100',
          label: 'Restrição severa — antagonismo biológico',
        }
      : rating === 'compativel_restricoes'
      ? {
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
          boxClass:
            'border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100',
          label: 'Compatível com cuidados de preparo',
        }
      : {
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          boxClass:
            'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100',
          label: 'Compatível — mistura aprovada',
        };

  const VerdictIcon = verdictMeta.icon;

  return (
    <div className="space-y-5">
      {/* Cabeçalho de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Laudo Técnico de Compatibilidade de Calda
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Ordem de serviço e parecer agronômico formatados para impressão e assinatura
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span>Imprimir / Salvar PDF</span>
        </button>
      </div>

      {/* Folha de Laudo (A4) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:border-none print:bg-white print:text-slate-900">
        {/* Cabeçalho do Documento */}
        <div className="border-b border-slate-900 dark:border-zinc-600 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              GeaAgro Suite · TankMix
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
              Parecer Técnico de Compatibilidade de Calda
            </h3>
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              Protocolo oficial de preparo e ordem de abastecimento de pulverizador
            </div>
          </div>

          <div className="sm:text-right text-xs tabular-nums">
            <div className="font-semibold text-slate-900 dark:text-zinc-100">
              Data: {new Date().toLocaleDateString('pt-BR')}
            </div>
            <div className="text-slate-500 dark:text-zinc-400 font-mono">{reportId}</div>
          </div>
        </div>

        {/* Metadados da Propriedade e Responsável */}
        <div className="border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 text-xs">
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Propriedade</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
              {farmName || 'Fazenda Modelo'}
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Talhão / Cultura</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
              {plotName || 'Talhão 01'} · {targetCrop}
            </span>
          </div>
          <div className="p-3">
            <label htmlFor="report-agro" className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Responsável técnico
            </label>
            <input
              id="report-agro"
              type="text"
              value={reportAgronomist}
              onChange={e => setReportAgronomist(e.target.value)}
              className="mt-0.5 font-semibold text-slate-900 dark:text-zinc-100 bg-transparent border-b border-slate-300 dark:border-zinc-700 focus:border-emerald-500 focus:outline-none w-full text-xs"
            />
          </div>
          <div className="p-3">
            <label htmlFor="report-crea" className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Registro profissional
            </label>
            <input
              id="report-crea"
              type="text"
              value={reportCrea}
              onChange={e => setReportCrea(e.target.value)}
              className="mt-0.5 font-semibold text-slate-900 dark:text-zinc-100 bg-transparent border-b border-slate-300 dark:border-zinc-700 focus:border-emerald-500 focus:outline-none w-full text-xs"
            />
          </div>
        </div>

        {/* Parecer e ICG */}
        <div
          className={`px-4 py-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${verdictMeta.boxClass}`}
        >
          <div className="space-y-0.5">
            <div className="text-[11px] font-medium opacity-80">Classificação global da mistura</div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <VerdictIcon className={`w-4 h-4 shrink-0 ${verdictMeta.iconColor}`} />
              <span>{verdictMeta.label}</span>
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <span className="text-[11px] opacity-80 block">Índice ICG</span>
            <span className="text-xl font-semibold tabular-nums">{evaluation.icgScore}%</span>
          </div>
        </div>

        {/* Tabela de Composição da Calda */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            Composição da Calda ({(selectedProducts || []).length}{' '}
            {(selectedProducts || []).length === 1 ? 'produto' : 'produtos'})
          </h4>
          <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-3 py-2 text-center font-medium w-14">Ordem</th>
                  <th className="px-3 py-2 text-left font-medium">Produto comercial</th>
                  <th className="px-3 py-2 text-left font-medium">Ingrediente ativo</th>
                  <th className="px-3 py-2 text-center font-medium">Formulação</th>
                  <th className="px-3 py-2 text-right font-medium">Dose/ha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {(selectedProducts || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-zinc-500">
                      Nenhum produto selecionado no laboratório virtual.
                    </td>
                  </tr>
                ) : (
                  selectedProducts.map((p, idx) => {
                    const prod =
                      p?.product || (TANKMIX_PRODUCTS_DATABASE || []).find(item => item?.id === p?.productId);
                    if (!prod) return null;
                    return (
                      <tr key={prod.id || idx}>
                        <td className="px-3 py-2 text-center font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                          {idx + 1}º
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900 dark:text-zinc-100">
                          {prod.commercialName}
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-zinc-400">
                          {prod.activeIngredient}
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-medium text-slate-700 dark:text-zinc-300">
                          {prod.formulation}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                          {p.dose} {p.doseUnit}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sequência Oficial WALES */}
        {mixingSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              Sequência Oficial de Abastecimento (Método WALES)
            </h4>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {mixingSteps.map((step, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-semibold text-[11px] tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{step.stepName}:</span>{' '}
                    <span className="text-slate-600 dark:text-zinc-400">{step.instructions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertas Físico-Químicos */}
        {issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              Alertas Físico-Químicos e Recomendações
            </h4>
            <div className="border border-amber-200 dark:border-amber-800/70 rounded-xl divide-y divide-amber-100 dark:divide-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs">
              {issues.map(iss => (
                <div key={iss.id} className="p-3.5 space-y-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{iss.summary}</span>
                  </div>
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed pl-5">{iss.details}</p>
                  <div className="pl-5 font-medium text-emerald-700 dark:text-emerald-400">
                    Ação recomendada: {iss.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contexto de Água e Clima */}
        <div className="border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 text-xs">
          <div className="p-3.5 space-y-1">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
              Qualidade da água cadastrada
            </span>
            <div className="text-slate-600 dark:text-zinc-400 tabular-nums">
              pH <strong className="text-slate-900 dark:text-zinc-100">{waterQuality.ph.toFixed(1)}</strong> · Dureza{' '}
              <strong className="text-slate-900 dark:text-zinc-100">
                {waterQuality.hardnessMgL} mg/L CaCO₃
              </strong>{' '}
              ({waterQuality.classification || 'Padrão'})
            </div>
          </div>

          <div className="p-3.5 space-y-1">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
              Janela climática registrada
            </span>
            <div className="text-slate-600 dark:text-zinc-400 tabular-nums">
              Temp <strong className="text-slate-900 dark:text-zinc-100">{weather.temperatureC} °C</strong> · UR{' '}
              <strong className="text-slate-900 dark:text-zinc-100">{weather.relativeHumidityPct}%</strong> · ΔT{' '}
              <strong className="text-slate-900 dark:text-zinc-100">{weather.deltaT} °C</strong> · Vento{' '}
              <strong className="text-slate-900 dark:text-zinc-100">{weather.windSpeedKmH} km/h</strong>
            </div>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="pt-10 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 dark:border-zinc-600 pb-1 mb-1.5" />
            <div className="font-semibold text-slate-900 dark:text-zinc-100">{reportAgronomist}</div>
            <div className="text-slate-500 dark:text-zinc-400">{reportCrea}</div>
          </div>
          <div>
            <div className="border-b border-slate-400 dark:border-zinc-600 pb-1 mb-1.5" />
            <div className="font-semibold text-slate-900 dark:text-zinc-100">
              Operador / Aplicador Responsável
            </div>
            <div className="text-slate-500 dark:text-zinc-400">Assinatura de recebimento</div>
          </div>
        </div>
      </div>
    </div>
  );
};
