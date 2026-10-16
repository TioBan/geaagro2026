import React, { useState } from 'react';
import {
  PropertyField,
  PlanterEquipment,
  SeedBatch,
  SeedingConfig,
  PlantabilitySamplingPoint
} from '../../types/plantability';
import { calculatePlantabilityMetrics, simulateEconomicLoss } from '../../utils/plantabilityCalculations';
import { FileText, Download, Printer, Filter, CheckCircle2, AlertTriangle, Sparkles, Building2, Tractor } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  planters: PlanterEquipment[];
  seeds: SeedBatch[];
  configs: SeedingConfig[];
  samplings: PlantabilitySamplingPoint[];
}

export const PlantabilityReportsView: React.FC<Props> = ({
  fields,
  planters,
  seeds,
  configs,
  samplings
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields?.[0]?.id || '');

  const activeField = (fields || []).find(f => f?.id === selectedFieldId) || fields?.[0];
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
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Talhao,Cultura,Area_ha,IGP_Score,CV_Pct,Aceitaveis_Pct,Falhas_Pct,Duplos_Pct,Pop_Real_ha,Perda_R_ha\n';

    (fields || []).filter(f => f && f.id).forEach(f => {
      const fSamplings = (samplings || []).filter(s => s?.fieldId === f.id);
      const fConfig = (configs || []).find(c => c?.fieldId === f.id);
      const fMetrics = calculatePlantabilityMetrics(fSamplings, fConfig);
      const fLoss = simulateEconomicLoss(fMetrics, f.areaHa);

      csvContent += `${f.fieldCode},${f.crop},${f.areaHa},${fMetrics.igpScore},${fMetrics.cvPercent},${fMetrics.acceptablePercent},${fMetrics.skipsPercent},${fMetrics.doublesPercent},${fMetrics.realPopulationPerHa},${fLoss.financialLossPerHa}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeaAgro_Relatorio_Plantabilidade_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Header & Export Controls */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Relatórios Técnicos & Exportação
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gere laudos técnicos de plantabilidade formatados para impressão em PDF ou exporte a planilha CSV completa de dados técnicos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value)}
            className="p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-bold text-xs"
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>
                {f.fieldCode} - {f.crop}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200 dark:border-zinc-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Exportar CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir Laudo (PDF)
          </button>
        </div>
      </div>

      {/* Printable Official Report Document or Empty State */}
      {(fields || []).length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-stone-900 dark:text-white">Nenhum laudo disponível para exportação</h3>
            <p className="text-xs text-stone-500">
              Cadastre seus talhões e registre amostragens em campo para gerar relatórios técnicos e exportar planilhas.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Document Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-stone-900 dark:border-stone-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              🌱 GeaAgro — Laudo Técnico de Plantabilidade
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Avaliação Agronômica da Qualidade de Semeadura | Certificado Offline GeaAgro
            </p>
          </div>
          <div className="text-right text-xs font-mono text-stone-600 dark:text-stone-300">
            <p className="font-bold">Data do Laudo: {new Date().toLocaleDateString('pt-BR')}</p>
            <p>Fazenda: {activeField?.farmName}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-50 dark:bg-zinc-800/60 p-5 rounded-2xl border border-stone-200 dark:border-zinc-700 text-xs font-mono">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Talhão / Área</span>
            <span className="text-sm font-black text-stone-900 dark:text-white">{activeField?.fieldCode} ({activeField?.areaHa} ha)</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Cultura / Híbrido</span>
            <span className="text-sm font-black text-stone-900 dark:text-white">{activeField?.crop} ({activeField?.cultivar})</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Índice IGP GeaAgro</span>
            <span className="text-sm font-black text-emerald-600">{metrics.igpScore} / 100 ({metrics.igpClassification})</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Prejuízo Est. Talhão</span>
            <span className="text-sm font-black text-rose-600">R$ {lossSim.totalFinancialLoss.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Detailed KPI Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase text-stone-900 dark:text-white border-b border-stone-200 dark:border-zinc-700 pb-1">
            1. Indicadores de Qualidade de Distribuição de Sementes
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
              <span className="text-[10px] text-stone-400 block">Coef. Variação (CV%)</span>
              <span className="text-lg font-bold text-stone-900 dark:text-white">{metrics.cvPercent}%</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
              <span className="text-[10px] text-stone-400 block">Espaçamentos Aceitáveis</span>
              <span className="text-lg font-bold text-emerald-600">{metrics.acceptablePercent}%</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
              <span className="text-[10px] text-stone-400 block">Percentual de Falhas</span>
              <span className="text-lg font-bold text-amber-600">{metrics.skipsPercent}%</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
              <span className="text-[10px] text-stone-400 block">Percentual de Duplos</span>
              <span className="text-lg font-bold text-sky-600">{metrics.doublesPercent}%</span>
            </div>
          </div>
        </div>

        {/* Machine & Operations Specs */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase text-stone-900 dark:text-white border-b border-stone-200 dark:border-zinc-700 pb-1">
            2. Especificações de Máquina & Operação
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-medium text-stone-700 dark:text-stone-300">
            <p><strong>Semeadora:</strong> {activePlanter?.brand} {activePlanter?.model}</p>
            <p><strong>Dosador:</strong> {activePlanter?.meterType}</p>
            <p><strong>Disco Utilizado:</strong> {activePlanter?.discSpecification}</p>
            <p><strong>Lote Sementes:</strong> {activeSeed?.batchNumber} (Germinação: {activeSeed?.germinationRate}%)</p>
            <p><strong>Velocidade Média:</strong> {activeConfig ? activeConfig.targetSpeedKmH : 6.5} km/h</p>
            <p><strong>População Alvo x Real:</strong> {metrics.targetPopulationPerHa.toLocaleString('pt-BR')} x {metrics.realPopulationPerHa.toLocaleString('pt-BR')} p/ha</p>
          </div>
        </div>

        {/* Technical Conclusion & Signatures */}
        <div className="pt-6 border-t border-stone-200 dark:border-zinc-800 space-y-8">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase text-stone-900 dark:text-white">Parecer Agronômico:</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 italic">
              A semeadura efetuada no talhão {activeField?.fieldCode} obteve índice IGP de {metrics.igpScore} ({metrics.igpClassification}).
              Recomenda-se acompanhamento constante da emergência de plântulas aos 7 e 14 dias pós-plantio e ajuste fino do vácuo pneumático em velocidades acima de 7.0 km/h.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center text-xs font-mono pt-4">
            <div className="border-t border-stone-400 pt-2">
              <p className="font-bold text-stone-900 dark:text-white">Engº Agrônomo Responsável</p>
              <p className="text-[10px] text-stone-500">CREA / Registro Técnico</p>
            </div>
            <div className="border-t border-stone-400 pt-2">
              <p className="font-bold text-stone-900 dark:text-white">Gerente Agrícola / Proprietário</p>
              <p className="text-[10px] text-stone-500">{activeField?.farmName}</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
