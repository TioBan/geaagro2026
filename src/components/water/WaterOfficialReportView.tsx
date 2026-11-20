import React from 'react';
import { Printer, Droplets } from 'lucide-react';
import { CollectionPoint, WaterAnalysisRecord } from '../../types/waterAnalysis';
import {
  COLLECTION_POINT_TYPE_LABELS,
  EMITTER_RISK_META,
  IGA_META,
  REFERENCE_STANDARD_LABELS,
  WATER_PURPOSE_LABELS,
} from './waterConstants';

interface WaterOfficialReportViewProps {
  analysis: WaterAnalysisRecord;
  point: CollectionPoint;
}

export const WaterOfficialReportView: React.FC<WaterOfficialReportViewProps> = ({
  analysis,
  point,
}) => {
  const igaMeta = IGA_META[analysis.calculated.igaClassification];
  const emitterMeta = EMITTER_RISK_META[analysis.calculated.emitterCloggingRisk];
  const ecDsM = analysis.physical.electricalConductivityMicroS / 1000;

  return (
    <div className="space-y-4">
      {/* Action Bar (hidden on print) */}
      <div className="print:hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Laudo Técnico Oficial de Qualidade de Água
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Documento pronto para impressão ou exportação em PDF via navegador.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 sm:p-7 space-y-6">
        {/* Report Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Laudo Técnico de Análise de Água
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Norma de Referência: {REFERENCE_STANDARD_LABELS[analysis.referenceStandard]}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs tabular-nums">
            <div className="font-semibold text-slate-900 dark:text-zinc-100">
              Amostra {analysis.sampleCode}
            </div>
            <div className="text-slate-500 dark:text-zinc-400">
              Coleta: {analysis.collectionDate} às {analysis.collectionTime}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Cliente / Produtor</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {analysis.clientName || 'Não informado'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Propriedade</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {analysis.propertyName || 'Não informada'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Ponto de Coleta</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {point.name} ({COLLECTION_POINT_TYPE_LABELS[point.type]})
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Responsável Técnico</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {analysis.responsibleTechnician || 'Não informado'}
              {analysis.creaCrq ? ` • ${analysis.creaCrq}` : ''}
            </span>
          </div>
        </div>

        {/* Summary Indices Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Índice IGA</span>
            <span className={`text-base font-bold tabular-nums ${igaMeta.textClass}`}>
              {analysis.calculated.igaScore}/100 ({igaMeta.label})
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Classe USSL</span>
            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {analysis.calculated.salinityClass}–{analysis.calculated.sodicityClass}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">RAS (SAR)</span>
            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {analysis.calculated.sar.toFixed(2)}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Langelier (ISL)</span>
            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100">
              {analysis.calculated.langelierIndex >= 0 ? '+' : ''}
              {analysis.calculated.langelierIndex.toFixed(2)}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Risco Emissores</span>
            <span className={`text-base font-bold ${emitterMeta.textClass}`}>
              {emitterMeta.label}
            </span>
          </div>
        </div>

        {/* Lab Parameters Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 font-semibold text-slate-800 dark:text-zinc-200">
              Parâmetros Físicos e Químicos
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {[
                ['pH', `${analysis.chemical.ph.toFixed(2)}`],
                ['Condutividade Elétrica (CE)', `${ecDsM.toFixed(2)} dS/m (${analysis.physical.electricalConductivityMicroS} µS/cm)`],
                ['Sólidos Dissolvidos Totais (TDS)', `${analysis.physical.totalDissolvedSolidsMgL} mg/L`],
                ['Turbidez', `${analysis.physical.turbidityNtu} NTU`],
                ['Temperatura da Água', `${analysis.physical.waterTempCelsius} °C`],
                ['Bicarbonatos (HCO₃⁻)', `${analysis.chemical.bicarbonatesHco3MgL} mg/L`],
                ['Alcalinidade Total', `${analysis.chemical.totalAlkalinityMgCaCO3} mg/L CaCO₃`],
                ['Dureza Total', `${analysis.chemical.totalHardnessMgCaCO3} mg/L CaCO₃`],
                ['Cálcio (Ca²⁺) / Magnésio (Mg²⁺)', `${analysis.chemical.calciumCaMgL} / ${analysis.chemical.magnesiumMgL} mg/L`],
                ['Sódio (Na⁺) / Cloretos (Cl⁻)', `${analysis.chemical.sodiumNaMgL} / ${analysis.chemical.chloridesClMgL} mg/L`],
              ].map(([label, val]) => (
                <div key={label} className="px-3.5 py-2 flex items-center justify-between gap-2">
                  <span className="text-slate-600 dark:text-zinc-400">{label}</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100 text-right">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 font-semibold text-slate-800 dark:text-zinc-200">
              Nutrientes, Micronutrientes e Biológico
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {[
                ['Nitrato (NO₃⁻)', `${analysis.chemical.nitrateNo3MgL} mg/L`],
                ['Nitrogênio Total / Fósforo / Potássio', `${analysis.chemical.totalNitrogenMgL} / ${analysis.chemical.phosphorusPMgL} / ${analysis.chemical.potassiumKMgL} mg/L`],
                ['Sulfatos (SO₄²⁻)', `${analysis.chemical.sulfatesSo4MgL} mg/L`],
                ['Ferro (Fe) / Manganês (Mn)', `${analysis.chemical.ironFeMgL} / ${analysis.chemical.manganeseMnMgL} mg/L`],
                ['Boro (B)', `${analysis.chemical.boronBMgL} mg/L`],
                ['Oxigênio Dissolvido / DBO₅', `${analysis.chemical.dissolvedOxygenMgL} / ${analysis.chemical.bod5MgL} mg/L`],
                ['Coliformes Totais', `${analysis.biological.totalColiformsNmp100ml} NMP/100mL`],
                ['Escherichia coli', `${analysis.biological.escherichiaColiNmp100ml} NMP/100mL`],
                ['Algas / Salmonella', `${analysis.biological.algaeDetected ? 'Detectadas' : 'Ausentes'} / ${analysis.biological.salmonellaPresent ? 'Presente' : 'Ausente'}`],
                ['Finalidades Declaradas', analysis.purposes.map((p) => WATER_PURPOSE_LABELS[p] ?? p).join(', ') || 'Irrigação'],
              ].map(([label, val]) => (
                <div key={label} className="px-3.5 py-2 flex items-center justify-between gap-2">
                  <span className="text-slate-600 dark:text-zinc-400">{label}</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100 text-right">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Notes & Recommendations */}
        <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 space-y-2 text-xs">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
            Parecer Técnico e Observações
          </h3>
          <p className="text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {analysis.technicalNotes ||
              'Sem observações adicionais registradas pelo responsável técnico.'}
          </p>
          {analysis.correctionPlan.treatmentRecommendations.length > 0 && (
            <div className="pt-2">
              <span className="font-semibold text-slate-800 dark:text-zinc-200 block mb-1">
                Recomendações Prioritárias de Tratamento:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-400">
                {analysis.correctionPlan.treatmentRecommendations.map((t, i) => (
                  <li key={i}>
                    <strong className="text-slate-800 dark:text-zinc-200">{t.technology}:</strong>{' '}
                    {t.description}
                    {t.dosageOrSpec ? ` (${t.dosageOrSpec})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterOfficialReportView;
