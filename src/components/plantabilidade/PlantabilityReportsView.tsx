import React, { useState, useEffect } from 'react';
import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint
} from '../../types/plantability';
import { calculatePlantabilityMetrics, simulateEconomicLoss } from '../../utils/plantabilityCalculations';
import { FileText, Download, Printer, Sprout } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  planters: PlanterEquipment[];
  seeds: SeedBatch[];
  configs: SeedingConfig[];
  samplings: PlantabilitySamplingPoint[];
}

const escapeCsvCell = (value: string | number): string => {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const PlantabilityReportsView: React.FC<Props> = ({
  fields,
  planters,
  seeds,
  configs,
  samplings
}) => {
  const safeFields = (fields || []).filter(f => f && f.id);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(safeFields[0]?.id || '');

  useEffect(() => {
    if (safeFields.length > 0 && !safeFields.some(f => f.id === selectedFieldId)) {
      setSelectedFieldId(safeFields[0].id);
    }
  }, [safeFields, selectedFieldId]);

  const activeField = safeFields.find(f => f.id === selectedFieldId) || safeFields[0];
  const fieldSamplings = (samplings || []).filter(s => s?.fieldId === activeField?.id);
  const activeConfig = (configs || []).find(c => c?.fieldId === activeField?.id);
  const activePlanter = (planters || []).find(p => p?.id === activeConfig?.planterId) || planters?.[0];
  const activeSeed = (seeds || []).find(s => s?.id === activeConfig?.seedBatchId) || seeds?.[0];

  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);
  const lossSim = simulateEconomicLoss(metrics, activeField?.areaHa || 100);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const header = [
      'Talhao',
      'Cultura',
      'Area_ha',
      'IGP_Score',
      'CV_Pct',
      'Aceitaveis_Pct',
      'Falhas_Pct',
      'Duplos_Pct',
      'Pop_Real_ha',
      'Perda_R_ha'
    ].join(',');

    const rows = safeFields.map(f => {
      const fSamplings = (samplings || []).filter(s => s?.fieldId === f.id);
      const fConfig = (configs || []).find(c => c?.fieldId === f.id);
      const fMetrics = calculatePlantabilityMetrics(fSamplings, fConfig);
      const fLoss = simulateEconomicLoss(fMetrics, f.areaHa);

      return [
        f.fieldCode,
        f.crop,
        f.areaHa,
        fMetrics.igpScore,
        fMetrics.cvPercent,
        fMetrics.acceptablePercent,
        fMetrics.skipsPercent,
        fMetrics.doublesPercent,
        fMetrics.realPopulationPerHa,
        fLoss.financialLossPerHa
      ]
        .map(escapeCsvCell)
        .join(',');
    });

    const csvString = `\uFEFF${[header, ...rows].join('\n')}`;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GeaAgro_Relatorio_Plantabilidade_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 print:p-0">
      {/* Header & Export Controls */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Relatórios Técnicos & Exportação</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Emita laudos de plantabilidade formatados para impressão/PDF ou exporte a planilha CSV consolidada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value)}
            disabled={safeFields.length === 0}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-emerald-500"
          >
            {safeFields.length === 0 ? (
              <option value="">Nenhum talhão</option>
            ) : (
              safeFields.map(f => (
                <option key={f.id} value={f.id}>
                  {f.fieldCode} - {f.crop}
                </option>
              ))
            )}
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={safeFields.length === 0}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={safeFields.length === 0}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Laudo (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Official Report Document or Empty State */}
      {safeFields.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Nenhum laudo disponível para exportação
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cadastre talhões e registre amostragens em campo para emitir relatórios técnicos e planilhas.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-5 print:border-none print:p-0">
          {/* Document Letterhead */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b border-slate-300 dark:border-zinc-700 pb-4">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  GeaAgro — Laudo Técnico de Plantabilidade
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Avaliação Agronômica da Qualidade de Semeadura • Registro Técnico Local
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600 dark:text-zinc-300 tabular-nums">
              <p className="font-semibold text-slate-900 dark:text-white">
                Data do Laudo: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p>Fazenda: {activeField?.farmName}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-zinc-950/60 p-4 rounded-lg border border-slate-200/70 dark:border-zinc-800 text-xs tabular-nums">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block uppercase">
                Talhão / Área
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {activeField?.fieldCode} ({activeField?.areaHa} ha)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block uppercase">
                Cultura / Híbrido
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {activeField?.crop} ({activeField?.cultivar})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block uppercase">
                Índice IGP GeaAgro
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.igpScore} / 100 ({metrics.igpClassification})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block uppercase">
                Prejuízo Est. Talhão
              </span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                R$ {lossSim.totalFinancialLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Detailed KPI Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-1.5">
              1. Indicadores de Qualidade de Distribuição de Sementes
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs tabular-nums">
              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Coef. Variação (CV%)</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{metrics.cvPercent}%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Espaçamentos Aceitáveis</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {metrics.acceptablePercent}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Percentual de Falhas</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {metrics.skipsPercent}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Percentual de Duplos</span>
                <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                  {metrics.doublesPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Machine & Operations Specs */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-1.5">
              2. Especificações de Máquina & Operação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-zinc-300 tabular-nums">
              <p>
                <strong className="text-slate-900 dark:text-white">Semeadora:</strong>{' '}
                {activePlanter ? `${activePlanter.brand} ${activePlanter.model}` : 'Não informada'}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Dosador:</strong>{' '}
                {activePlanter?.meterType || '—'}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Disco Utilizado:</strong>{' '}
                {activePlanter?.discSpecification || '—'}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Lote Sementes:</strong>{' '}
                {activeSeed
                  ? `${activeSeed.batchNumber} (Germ.: ${activeSeed.germinationRate}%)`
                  : 'Não informado'}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Velocidade Média:</strong>{' '}
                {activeConfig ? activeConfig.targetSpeedKmH : 6.5} km/h
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">População Alvo × Real:</strong>{' '}
                {metrics.targetPopulationPerHa.toLocaleString('pt-BR')} ×{' '}
                {metrics.realPopulationPerHa.toLocaleString('pt-BR')} p/ha
              </p>
            </div>
          </div>

          {/* Technical Conclusion & Signatures */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-8">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                Parecer Agronômico
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                A semeadura efetuada no talhão {activeField?.fieldCode} obteve índice IGP de {metrics.igpScore} (
                {metrics.igpClassification}). Recomenda-se acompanhamento da emergência de plântulas aos 7 e 14 dias
                pós-plantio e ajuste fino do vácuo pneumático em velocidades acima de 7,0 km/h.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs pt-4">
              <div className="border-t border-slate-400 dark:border-zinc-600 pt-2">
                <p className="font-semibold text-slate-900 dark:text-white">Eng. Agrônomo Responsável</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">CREA / Registro Técnico</p>
              </div>
              <div className="border-t border-slate-400 dark:border-zinc-600 pt-2">
                <p className="font-semibold text-slate-900 dark:text-white">Gerente Agrícola / Proprietário</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">{activeField?.farmName}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
