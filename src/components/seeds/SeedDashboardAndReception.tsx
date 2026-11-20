import React, { useState, useMemo } from 'react';
import {
  Sprout,
  Plus,
  QrCode,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Clock,
  Save,
} from 'lucide-react';
import {
  SeedLot,
  SeedModuleTab,
  ProfileThresholds,
} from '../../types/seedAnalysis';
import { calculateIQS, getLotPathogenMaxIncidence, SEED_SPECIES_RAS_CATALOG } from '../../data/seedAnalysisData';

interface SeedDashboardAndReceptionProps {
  mode: 'dashboard_estatisticas' | 'recepcao_amostras' | 'identidade_gemeo_digital';
  seedLots: SeedLot[];
  currentLot: SeedLot | null;
  thresholds: ProfileThresholds;
  onSelectLot: (lotId: string) => void;
  onUpdateLot: (updated: SeedLot, message?: string) => void;
  onOpenNewLotModal: () => void;
  onNavigateTab: (tab: SeedModuleTab) => void;
}

function getIqsTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-teal-600 dark:text-teal-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export const SeedDashboardAndReception: React.FC<SeedDashboardAndReceptionProps> = ({
  mode,
  seedLots,
  currentLot,
  thresholds,
  onSelectLot,
  onUpdateLot,
  onOpenNewLotModal,
  onNavigateTab,
}) => {
  const [lotSearch, setLotSearch] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStage, setNewEventStage] = useState('Laboratório');
  const [newEventDesc, setNewEventDesc] = useState('');

  const metrics = useMemo(() => {
    if (!seedLots.length) {
      return {
        avgGerm: 0,
        avgVigor: 0,
        avgMoisture: 0,
        avgIqs: 0,
        approvedCount: 0,
        approvedPct: 0,
        distribution: { excellent: 0, good: 0, regular: 0, failed: 0 },
      };
    }

    const sumGerm = seedLots.reduce((a, l) => a + (l.germination.finalGerminationPct || 0), 0);
    const sumVigor = seedLots.reduce((a, l) => a + (l.vigor.tetrazoliumVigorPct || 0), 0);
    const sumMoisture = seedLots.reduce((a, l) => a + (l.moisture.moisturePct || 0), 0);
    const sumIqs = seedLots.reduce((a, l) => a + (l.iqsScore || 0), 0);

    let approvedCount = 0;
    const dist = { excellent: 0, good: 0, regular: 0, failed: 0 };

    seedLots.forEach((l) => {
      const isApproved =
        l.germination.finalGerminationPct >= thresholds.minGermination &&
        l.physicalQuality.purityPct >= thresholds.minPurity &&
        l.moisture.moisturePct <= thresholds.moistureLimit;
      if (isApproved) approvedCount += 1;

      if (l.iqsScore >= 85) dist.excellent += 1;
      else if (l.iqsScore >= 70) dist.good += 1;
      else if (l.iqsScore >= 60) dist.regular += 1;
      else dist.failed += 1;
    });

    return {
      avgGerm: Math.round((sumGerm / seedLots.length) * 10) / 10,
      avgVigor: Math.round((sumVigor / seedLots.length) * 10) / 10,
      avgMoisture: Math.round((sumMoisture / seedLots.length) * 10) / 10,
      avgIqs: Math.round(sumIqs / seedLots.length),
      approvedCount,
      approvedPct: Math.round((approvedCount / seedLots.length) * 100),
      distribution: dist,
    };
  }, [seedLots, thresholds]);

  const filteredLots = useMemo(() => {
    const q = lotSearch.trim().toLowerCase();
    if (!q) return seedLots;
    return seedLots.filter(
      (l) =>
        l.lotNumber.toLowerCase().includes(q) ||
        l.speciesName.toLowerCase().includes(q) ||
        l.cultivar.toLowerCase().includes(q) ||
        l.reception.client.toLowerCase().includes(q)
    );
  }, [seedLots, lotSearch]);

  const currentIqsBreakdown = useMemo(() => {
    if (!currentLot) return null;
    const sp =
      SEED_SPECIES_RAS_CATALOG.find((s) => s.id === currentLot.speciesId) ||
      SEED_SPECIES_RAS_CATALOG[0];
    return calculateIQS({
      germinationPct: currentLot.germination.finalGerminationPct,
      vigorTzPct: currentLot.vigor.tetrazoliumVigorPct,
      purityPct: currentLot.physicalQuality.purityPct,
      moisturePct: currentLot.moisture.moisturePct,
      idealMoisturePct: sp.maxMoistureOfficialPct - 0.5,
      stinkbugDamagePct: currentLot.physicalQuality.stinkbugDamagePct,
      mechanicalDamagePct: currentLot.physicalQuality.mechanicalDamageHypochloritePct,
      pathogenIncidencePct: getLotPathogenMaxIncidence(currentLot),
    });
  }, [currentLot]);

  const emptyState = (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center">
      <Sprout className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 opacity-80" />
      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
        Nenhum lote de sementes cadastrado
      </h3>
      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
        Cadastre o primeiro lote para calcular automaticamente o Índice de Qualidade de Sementes (IQS), registrar análises de laboratório e emitir o Boletim (BAS).
      </p>
      <button
        type="button"
        onClick={onOpenNewLotModal}
        className="mt-4 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Cadastrar primeiro lote</span>
      </button>
    </div>
  );

  if (mode === 'dashboard_estatisticas') {
    if (!seedLots.length) return emptyState;

    const total = seedLots.length;
    const pctExc = Math.round((metrics.distribution.excellent / total) * 100);
    const pctGood = Math.round((metrics.distribution.good / total) * 100);
    const pctReg = Math.round((metrics.distribution.regular / total) * 100);
    const pctFail = Math.max(0, 100 - pctExc - pctGood - pctReg);

    return (
      <div className="space-y-4">
        {/* Faixa de KPIs de Elevação Única */}
        <div className="grid grid-cols-2 lg:grid-cols-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
          <div className="p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400">Lotes cadastrados</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              {seedLots.length}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
              IQS médio {metrics.avgIqs}/100
            </span>
          </div>
          <div className="p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400">Germinação média</span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {metrics.avgGerm}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
              Meta &ge; {thresholds.minGermination}%
            </span>
          </div>
          <div className="p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400">Vigor médio (TZ)</span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
              {metrics.avgVigor}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
              Meta &ge; {thresholds.minVigor}%
            </span>
          </div>
          <div className="p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400">Umidade média</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mt-1 tabular-nums">
              {metrics.avgMoisture}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
              Limite &le; {thresholds.moistureLimit}%
            </span>
          </div>
          <div className="p-4 col-span-2 lg:col-span-1">
            <span className="text-xs text-slate-500 dark:text-zinc-400">Aprovação no perfil</span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {metrics.approvedPct}%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
              {metrics.approvedCount} de {seedLots.length} lotes
            </span>
          </div>
        </div>

        {/* Distribuição IQS + Decomposição do Lote Ativo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Distribuição do Índice de Qualidade (IQS)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Classificação consolidada com base nos lotes cadastrados no laboratório.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('sistema_especialista')}
                className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Regras e limites
              </button>
            </div>

            <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              {pctExc > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${pctExc}%` }} />}
              {pctGood > 0 && <div className="bg-teal-500 h-full" style={{ width: `${pctGood}%` }} />}
              {pctReg > 0 && <div className="bg-amber-500 h-full" style={{ width: `${pctReg}%` }} />}
              {pctFail > 0 && <div className="bg-red-500 h-full" style={{ width: `${pctFail}%` }} />}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs tabular-nums">
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span className="text-slate-500 dark:text-zinc-400 block">Excelente (&ge;85)</span>
                <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {metrics.distribution.excellent} ({pctExc}%)
                </strong>
              </div>
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span className="text-slate-500 dark:text-zinc-400 block">Bom (70–84)</span>
                <strong className="font-semibold text-teal-600 dark:text-teal-400">
                  {metrics.distribution.good} ({pctGood}%)
                </strong>
              </div>
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span className="text-slate-500 dark:text-zinc-400 block">Regular (60–69)</span>
                <strong className="font-semibold text-amber-600 dark:text-amber-400">
                  {metrics.distribution.regular} ({pctReg}%)
                </strong>
              </div>
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span className="text-slate-500 dark:text-zinc-400 block">Abaixo (&lt;60)</span>
                <strong className="font-semibold text-red-600 dark:text-red-400">
                  {metrics.distribution.failed} ({pctFail}%)
                </strong>
              </div>
            </div>
          </div>

          {currentLot && currentIqsBreakdown && (
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Composição IQS — {currentLot.lotNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {currentLot.speciesName} · {currentLot.cultivar}
                  </p>
                </div>
                <div className="text-right tabular-nums">
                  <div className={`text-lg font-semibold ${getIqsTextColor(currentIqsBreakdown.score)}`}>
                    {currentIqsBreakdown.score}/100
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {currentIqsBreakdown.classification}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs tabular-nums">
                {[
                  { label: 'Germinação (peso 30)', value: currentIqsBreakdown.components.germination, max: 30 },
                  { label: 'Vigor Tetrazólio (peso 30)', value: currentIqsBreakdown.components.vigor, max: 30 },
                  { label: 'Pureza Física (peso 15)', value: currentIqsBreakdown.components.purity, max: 15 },
                  { label: 'Sanidade (peso 10)', value: currentIqsBreakdown.components.sanitary, max: 10 },
                  { label: 'Umidade (peso 10)', value: currentIqsBreakdown.components.moisture, max: 10 },
                  { label: 'Integridade Física (peso 5)', value: currentIqsBreakdown.components.integrity, max: 5 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-300">
                      <span>{item.label}</span>
                      <span className="font-medium">
                        {item.value.toFixed(1)} / {item.max}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabela Comparativa de Lotes */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Carteira de Lotes Analisados
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={lotSearch}
                onChange={(e) => setLotSearch(e.target.value)}
                placeholder="Buscar lote, cultura ou cultivar..."
                className="w-full h-8 pl-8 pr-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/60">
                  <th className="py-2.5 px-4 font-medium">Lote</th>
                  <th className="py-2.5 px-3 font-medium">Espécie / Cultivar</th>
                  <th className="py-2.5 px-3 font-medium text-right">Germ.</th>
                  <th className="py-2.5 px-3 font-medium text-right">Vigor TZ</th>
                  <th className="py-2.5 px-3 font-medium text-right">Pureza</th>
                  <th className="py-2.5 px-3 font-medium text-right">Umidade</th>
                  <th className="py-2.5 px-3 font-medium text-right">IQS</th>
                  <th className="py-2.5 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 tabular-nums">
                {filteredLots.map((lot) => {
                  const isSelected = currentLot?.id === lot.id;
                  const compliant =
                    lot.germination.finalGerminationPct >= thresholds.minGermination &&
                    lot.physicalQuality.purityPct >= thresholds.minPurity &&
                    lot.moisture.moisturePct <= thresholds.moistureLimit;
                  return (
                    <tr
                      key={lot.id}
                      onClick={() => onSelectLot(lot.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        <div>{lot.lotNumber}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                          {lot.seedClass} · {lot.cropSeason}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                        <div className="font-medium">{lot.speciesName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{lot.cultivar}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-zinc-100">
                        {lot.germination.finalGerminationPct}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {lot.vigor.tetrazoliumVigorPct}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {lot.physicalQuality.purityPct}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {lot.moisture.moisturePct}%
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className={`font-semibold ${getIqsTextColor(lot.iqsScore)}`}>
                          {lot.iqsScore}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-1.5">
                          {compliant ? 'Aprovado' : 'Atenção'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLot(lot.id);
                            onNavigateTab('certificados');
                          }}
                          className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>BAS</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredLots.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                      Nenhum lote encontrado para "{lotSearch}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLot) return emptyState;

  if (mode === 'recepcao_amostras') {
    const updateReception = <K extends keyof SeedLot['reception']>(
      key: K,
      value: SeedLot['reception'][K]
    ) => {
      onUpdateLot({
        ...currentLot,
        reception: { ...currentLot.reception, [key]: value },
        originProducer: key === 'client' ? String(value) : currentLot.originProducer,
        originFarm: key === 'farm' ? String(value) : currentLot.originFarm,
      });
    };

    const inputClass =
      'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
    const labelClass = 'block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1';

    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Recepção da Amostra e Dados do Lote
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Registro de entrada no laboratório, origem do lote e responsabilidade técnica.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono tabular-nums">
            Código: {currentLot.internalCode}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Empresa / Cliente</label>
            <input
              type="text"
              value={currentLot.reception.client}
              onChange={(e) => updateReception('client', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fazenda / Origem</label>
            <input
              type="text"
              value={currentLot.reception.farm}
              onChange={(e) => updateReception('farm', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Responsável Técnico</label>
            <input
              type="text"
              value={currentLot.reception.technicalResponsible}
              onChange={(e) => updateReception('technicalResponsible', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número da Amostra</label>
            <input
              type="text"
              value={currentLot.reception.sampleNumber}
              onChange={(e) => updateReception('sampleNumber', e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className={labelClass}>Data de Recebimento</label>
            <input
              type="date"
              value={currentLot.reception.receiptDate}
              onChange={(e) => updateReception('receiptDate', e.target.value)}
              className={`${inputClass} tabular-nums`}
            />
          </div>
          <div>
            <label className={labelClass}>Amostra Recebida (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={currentLot.reception.quantitySentKg}
              onChange={(e) => updateReception('quantitySentKg', Math.max(0, Number(e.target.value) || 0))}
              className={`${inputClass} tabular-nums`}
            />
          </div>
          <div>
            <label className={labelClass}>Coletor / Amostrador</label>
            <input
              type="text"
              value={currentLot.reception.collectorName}
              onChange={(e) => updateReception('collectorName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>UBS / Unidade Beneficiamento</label>
            <input
              type="text"
              value={currentLot.processingPlant}
              onChange={(e) => onUpdateLot({ ...currentLot, processingPlant: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Representatividade do Lote (kg)</label>
            <input
              type="number"
              min="0"
              step="10"
              value={currentLot.totalWeightKg}
              onChange={(e) => {
                const kg = Math.max(0, Number(e.target.value) || 0);
                const bags = currentLot.bagWeightKg > 0 ? Math.round(kg / currentLot.bagWeightKg) : 0;
                onUpdateLot({ ...currentLot, totalWeightKg: kg, totalBags: bags });
              }}
              className={`${inputClass} tabular-nums`}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
            <span>
              Total estimado: <strong className="font-medium text-slate-800 dark:text-zinc-200">{currentLot.totalBags} embalagens</strong> ({currentLot.bagWeightKg} kg)
            </span>
            <span aria-hidden="true">·</span>
            <span>Classe: {currentLot.seedClass}</span>
            <span aria-hidden="true">·</span>
            <span>Safra: {currentLot.cropSeason}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Save className="w-3.5 h-3.5" />
            Alterações salvas automaticamente
          </span>
        </div>
      </div>
    );
  }

  // identidade_gemeo_digital
  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    onUpdateLot(
      {
        ...currentLot,
        timeline: [
          {
            date: today,
            stage: newEventStage,
            title: newEventTitle.trim(),
            description: newEventDesc.trim() || 'Registro manual de rastreabilidade do lote.',
          },
          ...currentLot.timeline,
        ],
      },
      'Evento adicionado à linha do tempo do Gêmeo Digital.'
    );
    setNewEventTitle('');
    setNewEventDesc('');
  };

  const twinStatus =
    currentLot.iqsScore >= 80
      ? { label: 'Estável — Alta qualidade', ok: true }
      : currentLot.iqsScore >= 65
        ? { label: 'Monitoramento recomendado', ok: true }
        : { label: 'Risco fisiológico — Revisar', ok: false };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Gêmeo Digital da Semente
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5 tabular-nums">
              Passaporte {currentLot.internalCode} · Lote {currentLot.lotNumber} · {currentLot.speciesName} ({currentLot.cultivar})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-mono text-[11px]">{currentLot.internalCode}</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('certificados')}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 whitespace-nowrap cursor-pointer"
            >
              Emitir BAS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden tabular-nums">
          <div className="p-3.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Idade fisiológica</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                min="0"
                value={currentLot.physiologicalAgeDays}
                onChange={(e) =>
                  onUpdateLot({
                    ...currentLot,
                    physiologicalAgeDays: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-sm font-semibold text-slate-900 dark:text-zinc-100"
              />
              <span className="text-xs text-slate-500 dark:text-zinc-400">dias</span>
            </div>
          </div>
          <div className="p-3.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Potencial de germinação</span>
            <strong className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
              {currentLot.germinationPotentialPct}%
            </strong>
          </div>
          <div className="p-3.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Potencial de vigor</span>
            <strong className="text-lg font-semibold text-teal-600 dark:text-teal-400 block mt-1">
              {currentLot.vigorPotentialPct}%
            </strong>
          </div>
          <div className="p-3.5">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Estado do lote</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              {twinStatus.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span className="text-xs font-medium text-slate-900 dark:text-zinc-100">
                {twinStatus.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linha do Tempo & Novo Evento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Linha do Tempo de Rastreabilidade
            </h4>
            <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
              {currentLot.timeline.length} registro{currentLot.timeline.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {currentLot.timeline.map((evt, idx) => (
              <div key={`${evt.date}-${idx}`} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    <span>{evt.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">{evt.stage}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                    {evt.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {evt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleAddTimelineEvent}
          className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 self-start"
        >
          <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Registrar Marco de Rastreabilidade
          </h4>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Etapa
            </label>
            <select
              value={newEventStage}
              onChange={(e) => setNewEventStage(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100"
            >
              <option value="Recepção">Recepção</option>
              <option value="Beneficiamento (UBS)">Beneficiamento (UBS)</option>
              <option value="Laboratório">Laboratório</option>
              <option value="Tratamento (TSI)">Tratamento (TSI)</option>
              <option value="Armazenamento">Armazenamento</option>
              <option value="Expedição">Expedição</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Título do evento *
            </label>
            <input
              type="text"
              placeholder="Ex: Reanálise de vigor pré-expedição"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Observação técnica
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes do procedimento, equipamento ou responsável..."
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 resize-none"
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar evento</span>
          </button>
        </form>
      </div>
    </div>
  );
};
